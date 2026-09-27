/* ==========================================================================
   ProAthleteCare - GPS Training
   Live workout tracking engine (vanilla JavaScript, no dependencies).

   Contents
     1.  Configuration
     2.  Small utilities (numbers, formatting, geometry)
     3.  DOM references
     4.  Application state
     5.  Screen / UI rendering
     6.  GPS tracking (watchPosition + filtering + Haversine)
     7.  Elapsed-time clock
     8.  Interval (Tabata) engine
     9.  Haptics + audio cues
     10. Screen wake lock
     11. State machine (ready / starting / running / paused / finished)
     12. Event wiring
     13. Public API (for later ProAthleteCare / Firebase integration)
     14. Boot
   ========================================================================== */

(function () {
    "use strict";

    /* ======================================================================
       1. Configuration
       ====================================================================== */

    const CONFIG = {
        // Reject fixes with accuracy worse than this many metres.
        MAX_ACCURACY_M: 40,
        // Above this accuracy the athlete is told the signal is weak.
        WEAK_ACCURACY_M: 20,
        // Above this ground speed (m/s) a "move" is treated as a GPS glitch.
        MAX_PLAUSIBLE_SPEED_MS: 25,
        // Current speed smoothing factor (exponential moving average).
        SPEED_SMOOTHING: 0.35,
        // A fix older than this stops being shown as current speed.
        SPEED_STALE_MS: 6000,
        // Below this speed the athlete is considered standing still.
        MIN_MOVING_SPEED_MS: 0.5,
        // UI refresh rate while a workout is live.
        TICK_MS: 250,
        // No fix for this long while running => show "waiting for GPS".
        NO_FIX_WARNING_MS: 15000,
        // Longest plausible session, guards against runaway elapsed values.
        MAX_SESSION_MS: 24 * 60 * 60 * 1000,
        EARTH_RADIUS_M: 6371008.8
    };

    const GEO_OPTIONS = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
    };

    const STATE = {
        READY: "ready",
        STARTING: "starting",
        RUNNING: "running",
        PAUSED: "paused",
        FINISHED: "finished"
    };

    const MS_TO_KMH = 3.6;

    /* ======================================================================
       2. Small utilities
       ====================================================================== */

    /** Return `n` only when it is a usable finite number, otherwise `fallback`. */
    function finite(n, fallback) {
        return typeof n === "number" && isFinite(n) ? n : fallback;
    }

    /** Clamp `n` into [min, max]; non-finite input yields `min`. */
    function clamp(n, min, max) {
        const v = finite(n, min);
        if (v < min) return min;
        if (v > max) return max;
        return v;
    }

    /** ms -> "HH:MM:SS" (hours may exceed 99 without breaking). */
    function formatClock(ms) {
        const total = Math.max(0, Math.floor(finite(ms, 0) / 1000));
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;
        return pad2(hours) + ":" + pad2(minutes) + ":" + pad2(seconds);
    }

    /** seconds -> "MM:SS" (used by the interval countdown). */
    function formatCountdown(seconds) {
        const total = Math.max(0, Math.ceil(finite(seconds, 0)));
        const minutes = Math.floor(total / 60);
        return pad2(minutes) + ":" + pad2(total % 60);
    }

    function pad2(n) {
        return n < 10 ? "0" + n : String(n);
    }

    /** metres -> "x.xx km" */
    function formatDistance(metres) {
        const m = finite(metres, 0);
        if (m <= 0) return "0.00 km";
        return (m / 1000).toFixed(2) + " km";
    }

    /** m/s -> "x.x km/h" */
    function formatSpeed(metresPerSecond) {
        const v = finite(metresPerSecond, 0);
        if (v <= 0) return "0.0 km/h";
        return (v * MS_TO_KMH).toFixed(1) + " km/h";
    }

    /**
     * Speed in m/s -> pace in seconds per kilometre.
     * Returns null when standing still or the value is not meaningful.
     */
    function paceFromSpeed(metresPerSecond) {
        const v = finite(metresPerSecond, 0);
        if (v < CONFIG.MIN_MOVING_SPEED_MS) return null;
        const secPerKm = 1000 / v;
        if (!isFinite(secPerKm) || secPerKm <= 0 || secPerKm > 7200) return null;
        return secPerKm;
    }

    /** seconds per km -> "m:ss /km", or "--:-- /km" when unknown. */
    function formatPace(secPerKm) {
        if (secPerKm === null || secPerKm === undefined) return "--:-- /km";
        const total = Math.round(finite(secPerKm, 0));
        if (total <= 0) return "--:-- /km";
        const minutes = Math.floor(total / 60);
        const seconds = total % 60;
        return minutes + ":" + pad2(seconds) + " /km";
    }

    /**
     * Great-circle distance in metres between two coordinates.
     * Haversine formula. Returns null for invalid input.
     */
    function haversineMetres(lat1, lon1, lat2, lon2) {
        if (![lat1, lon1, lat2, lon2].every(isFinite)) return null;

        const toRad = Math.PI / 180;
        const dLat = (lat2 - lat1) * toRad;
        const dLon = (lon2 - lon1) * toRad;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return CONFIG.EARTH_RADIUS_M * c;
    }

    /** Valid WGS-84 coordinate pair. */
    function isValidCoordinate(lat, lon) {
        return isFinite(lat) && isFinite(lon) &&
            lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    }

    /* ======================================================================
       3. DOM references
       ====================================================================== */

    const el = {
        // Header
        gpsChip: document.getElementById("gpsChip"),
        gpsChipLabel: document.getElementById("gpsChipLabel"),

        // Screens
        screenHome: document.getElementById("screenHome"),
        screenLive: document.getElementById("screenLive"),
        screenSummary: document.getElementById("screenSummary"),

        // Home
        statusPanel: document.getElementById("statusPanel"),
        homeGpsStatus: document.getElementById("homeGpsStatus"),
        homeGpsAccuracy: document.getElementById("homeGpsAccuracy"),
        modeCards: Array.prototype.slice.call(
            document.querySelectorAll(".mode-card")
        ),
        intervalConfig: document.getElementById("intervalConfig"),
        inputWork: document.getElementById("inputWork"),
        inputRest: document.getElementById("inputRest"),
        inputRounds: document.getElementById("inputRounds"),
        stepperButtons: Array.prototype.slice.call(
            document.querySelectorAll(".stepper-btn")
        ),

        // Live
        workoutState: document.getElementById("workoutState"),
        gpsLine: document.getElementById("gpsLine"),
        elapsedValue: document.getElementById("elapsedValue"),
        intervalPanel: document.getElementById("intervalPanel"),
        phaseName: document.getElementById("phaseName"),
        phaseRound: document.getElementById("phaseRound"),
        phaseCountdown: document.getElementById("phaseCountdown"),
        phaseBarFill: document.getElementById("phaseBarFill"),
        completeFlag: document.getElementById("completeFlag"),
        mDistance: document.getElementById("mDistance"),
        mSpeed: document.getElementById("mSpeed"),
        mAvgSpeed: document.getElementById("mAvgSpeed"),
        mMaxSpeed: document.getElementById("mMaxSpeed"),
        mPace: document.getElementById("mPace"),
        mAvgPace: document.getElementById("mAvgPace"),

        // Summary
        summaryType: document.getElementById("summaryType"),
        summaryTitle: document.getElementById("summaryTitle"),
        summaryGrid: document.getElementById("summaryGrid"),
        btnNewTraining: document.getElementById("btnNewTraining"),

        // Notice
        notice: document.getElementById("notice"),
        noticeText: document.getElementById("noticeText"),
        noticeClose: document.getElementById("noticeClose"),

        // Controls
        btnStart: document.getElementById("btnStart"),
        runControls: document.getElementById("runControls"),
        btnPause: document.getElementById("btnPause"),
        btnFinish: document.getElementById("btnFinish"),

        // Modal
        confirmModal: document.getElementById("confirmModal"),
        btnCancelFinish: document.getElementById("btnCancelFinish"),
        btnConfirmFinish: document.getElementById("btnConfirmFinish")
    };

    /* ======================================================================
       4. Application state
       ====================================================================== */

    /** @type {string} one of STATE.* */
    let state = STATE.READY;

    /** Selected training mode: "free" | "interval". */
    let sessionType = "free";

    /**
     * Session record. Shaped so it can be serialised straight into
     * Firebase later without restructuring.
     */
    const session = {
        sessionType: "free",
        state: STATE.READY,
        startTime: null,
        endTime: null,
        activeDuration: 0,        // ms, excludes paused time
        totalDistance: 0,         // metres
        currentSpeed: 0,          // m/s, smoothed
        averageSpeed: 0,          // m/s
        maxSpeed: 0,              // m/s
        currentPace: null,        // seconds per km
        averagePace: null,        // seconds per km
        gpsPoints: [],            // { lat, lng, timestamp, accuracy, speed }
        intervalSettings: { workSec: 20, restSec: 10, rounds: 8 },
        completedRounds: 0
    };

    /** GPS internals */
    const gps = {
        watchId: null,
        lastPoint: null,      // last accepted fix used for distance chaining
        lastFixAt: 0,         // timestamp of the most recent accepted fix
        lastSpeedAt: 0,       // timestamp used for current-speed staleness
        accuracy: null,       // most recent reported accuracy (metres)
        hasFix: false,
        rejected: 0
    };

    /** Elapsed-clock internals (timestamp based, so it cannot drift) */
    const clock = {
        accumulatedMs: 0,
        segmentStart: 0,
        tickId: null
    };

    /** Interval program internals */
    const interval = {
        running: false,
        phase: "idle",        // "idle" | "work" | "rest" | "complete"
        round: 0,             // 1-based index of the round in progress
        phaseEndsAt: 0,       // epoch ms when the current phase ends
        pausedAt: 0,
        pausedRemaining: 0    // ms left in the phase when it was paused
    };

    /** Wake lock internals */
    const wake = {
        lock: null,
        wanted: false
    };

    let audioCtx = null;

    /* ======================================================================
       5. Screen + UI rendering
       ====================================================================== */

    function showScreen(name) {
        el.screenHome.hidden = name !== "home";
        el.screenLive.hidden = name !== "live";
        el.screenSummary.hidden = name !== "summary";
    }

    function showNotice(message, tone) {
        if (!message) {
            el.notice.hidden = true;
            return;
        }
        el.noticeText.textContent = message;
        el.notice.dataset.tone = tone || "info";
        el.notice.hidden = false;
    }

    function clearNotice() {
        el.notice.hidden = true;
    }

    /** Map a GPS status to its chip colour + label. */
    const GPS_PRESENTATION = {
        idle:      { chip: "idle",      label: "GPS idle",       tone: "" },
        ready:     { chip: "ready",     label: "GPS ready",      tone: "is-ok" },
        prompt:    { chip: "idle",      label: "Tap start",      tone: "is-warn" },
        searching: { chip: "searching", label: "Searching",      tone: "is-warn" },
        active:    { chip: "active",    label: "GPS active",     tone: "is-ok" },
        weak:      { chip: "weak",      label: "Weak GPS",       tone: "is-warn" },
        denied:    { chip: "denied",    label: "No permission",  tone: "is-bad" },
        unavailable:{ chip: "unavailable", label: "No GPS",      tone: "is-bad" },
        error:     { chip: "error",     label: "GPS error",      tone: "is-bad" }
    };

    function setGpsStatus(status) {
        const view = GPS_PRESENTATION[status] || GPS_PRESENTATION.idle;
        el.gpsChip.dataset.status = view.chip;
        el.gpsChipLabel.textContent = view.label;
    }

    function renderHome() {
        el.homeGpsStatus.textContent = el.gpsChipLabel.textContent;
        el.homeGpsStatus.className = "status-value";
        el.homeGpsAccuracy.textContent = formatAccuracy(gps.accuracy);
    }

    function formatAccuracy(metres) {
        if (metres === null || metres === undefined || !isFinite(metres)) return "--";
        if (metres < 0) return "--";
        return Math.round(metres) + " m";
    }

    function renderGpsLine() {
        const now = Date.now();
        const accuracy = gps.accuracy;

        if (!gps.hasFix) {
            const waited = gps.watchId !== null && (now - gps.lastFixAt) > CONFIG.NO_FIX_WARNING_MS;
            el.gpsLine.textContent = waited ? "Waiting for GPS signal…" : "Waiting for GPS…";
            el.gpsLine.className = "gps-line is-warn";
            return;
        }

        const weak = !isFinite(accuracy) || accuracy > CONFIG.WEAK_ACCURACY_M;
        el.gpsLine.className = "gps-line " + (weak ? "is-warn" : "is-ok");
        el.gpsLine.textContent = (weak ? "Weak GPS · " : "GPS active · ") +
            "Accuracy " + formatAccuracy(accuracy);
    }

    /** Live metric tiles. */
    function renderMetrics() {
        const moving = state === STATE.RUNNING && hasFreshSpeed();

        const currentSpeed = moving ? session.currentSpeed : 0;
        const avgSpeed = averageSpeed();
        const currentPace = moving ? paceFromSpeed(session.currentSpeed) : null;
        const avgPace = averagePace();

        session.averageSpeed = avgSpeed;
        session.currentPace = currentPace;
        session.averagePace = avgPace;

        el.mDistance.textContent = formatDistance(session.totalDistance);
        el.mSpeed.textContent = formatSpeed(currentSpeed);
        el.mAvgSpeed.textContent = formatSpeed(avgSpeed);
        el.mMaxSpeed.textContent = formatSpeed(session.maxSpeed);
        el.mPace.textContent = formatPace(currentPace);
        el.mAvgPace.textContent = formatPace(avgPace);
    }

    function renderElapsed() {
        el.elapsedValue.textContent = formatClock(activeDurationMs());
    }

    function renderWorkoutState() {
        if (state === STATE.RUNNING) {
            el.workoutState.dataset.state = "running";
            el.workoutState.textContent = "Running";
        } else if (state === STATE.PAUSED) {
            el.workoutState.dataset.state = "paused";
            el.workoutState.textContent = "Paused";
        } else {
            el.workoutState.dataset.state = "running";
            el.workoutState.textContent = "Live";
        }
    }

    function renderControls() {
        const isLive = state === STATE.RUNNING || state === STATE.PAUSED;
        el.btnStart.hidden = isLive;
        el.runControls.hidden = !isLive;

        if (state === STATE.PAUSED) {
            el.btnPause.textContent = "Resume";
        } else {
            el.btnPause.textContent = "Pause";
        }
    }

    /* ======================================================================
       6. GPS tracking
       ====================================================================== */

    /** Accuracy above this reads as "weak" to the athlete. */
    function hasFreshSpeed() {
        if (gps.lastSpeedAt === 0) return false;
        return (Date.now() - gps.lastSpeedAt) < CONFIG.SPEED_STALE_MS;
    }

    function averageSpeed() {
        const seconds = activeDurationMs() / 1000;
        if (seconds <= 0 || session.totalDistance <= 0) return 0;
        const v = session.totalDistance / seconds;
        return isFinite(v) && v > 0 ? v : 0;
    }

    function averagePace() {
        const seconds = activeDurationMs() / 1000;
        if (seconds <= 0 || session.totalDistance <= 0) return null;
        return (seconds * 1000) / session.totalDistance;
    }

    function startGps() {
        if (!navigator.geolocation) {
            setGpsStatus("unavailable");
            showNotice("This browser does not support GPS tracking.", "error");
            return false;
        }
        if (gps.watchId !== null) return true; // never create a second watcher

        setGpsStatus("searching");
        try {
            gps.watchId = navigator.geolocation.watchPosition(
                onGpsSuccess,
                onGpsError,
                GEO_OPTIONS
            );
        } catch (err) {
            gps.watchId = null;
            setGpsStatus("error");
            showNotice("Could not start GPS: " + (err && err.message ? err.message : "unknown error"), "error");
            return false;
        }
        return true;
    }

    function stopGps() {
        if (gps.watchId === null) return;
        try {
            navigator.geolocation.clearWatch(gps.watchId);
        } catch (err) {
            /* nothing useful to do */
        }
        gps.watchId = null;
    }

    /**
     * Decide whether a fix is usable, then fold it into the session.
     * Every rejection path is explicit so a bad fix can never inflate distance.
     */
    function onGpsSuccess(position) {
        const coords = position && position.coords;
        if (!coords) return;

        const lat = finite(coords.latitude, NaN);
        const lon = finite(coords.longitude, NaN);
        if (!isValidCoordinate(lat, lon)) {
            rejectFix();
            return;
        }

        const accuracy = finite(coords.accuracy, NaN);
        const timestamp = finite(position.timestamp, Date.now());

        // Track reported accuracy for display, even when the fix is unusable.
        if (isFinite(accuracy) && accuracy >= 0) {
            gps.accuracy = accuracy;
        }

        if (isFinite(accuracy) && accuracy > CONFIG.MAX_ACCURACY_M) {
            rejectFix();
            return;
        }

        const previous = gps.lastPoint;
        let stepDistance = 0;
        let stepSeconds = 0;
        let derivedSpeed = null;

        if (previous) {
            const deltaSeconds = (timestamp - previous.timestamp) / 1000;
            if (!isFinite(deltaSeconds) || deltaSeconds <= 0) {
                rejectFix();
                return;
            }
            const metres = haversineMetres(
                previous.lat, previous.lng, lat, lon
            );
            if (metres === null) {
                rejectFix();
                return;
            }
            const impliedSpeed = metres / deltaSeconds;
            if (!isFinite(impliedSpeed) || impliedSpeed < 0) {
                rejectFix();
                return;
            }
            // Unrealistic jump: resync the chain but do not add distance.
            if (impliedSpeed > CONFIG.MAX_PLAUSIBLE_SPEED_MS) {
                rejectFix(lat, lon, timestamp);
                return;
            }
            stepDistance = metres;
            stepSeconds = deltaSeconds;
            derivedSpeed = impliedSpeed;
        }

        // Prefer the device-reported speed, fall back to derived speed.
        const nativeSpeed = finite(coords.speed, null);
        let reported = null;
        if (nativeSpeed !== null && nativeSpeed >= 0 &&
            nativeSpeed <= CONFIG.MAX_PLAUSIBLE_SPEED_MS) {
            reported = nativeSpeed;
        } else if (derivedSpeed !== null &&
                   derivedSpeed <= CONFIG.MAX_PLAUSIBLE_SPEED_MS) {
            reported = derivedSpeed;
        }

        // Chain this fix for the next distance computation.
        gps.lastPoint = { lat: lat, lng: lon, timestamp: timestamp };
        gps.lastFixAt = Date.now();
        gps.hasFix = true;

        if (state !== STATE.RUNNING) {
            // Paused: record the fix, but never extend the workout.
            storePoint(lat, lon, timestamp, accuracy, reported);
            return;
        }

        if (reported !== null) {
            const smoothed = CONFIG.SPEED_SMOOTHING * reported +
                (1 - CONFIG.SPEED_SMOOTHING) * session.currentSpeed;
            session.currentSpeed = clamp(smoothed, 0, CONFIG.MAX_PLAUSIBLE_SPEED_MS);
            if (session.currentSpeed > session.maxSpeed) {
                session.maxSpeed = session.currentSpeed;
            }
            gps.lastSpeedAt = Date.now();
        }

        if (stepDistance > 0 && stepSeconds > 0) {
            session.totalDistance += stepDistance;
        }

        storePoint(lat, lon, timestamp, accuracy, reported);

        const weak = !isFinite(accuracy) || accuracy > CONFIG.WEAK_ACCURACY_M;
        setGpsStatus(weak ? "weak" : "active");
        renderGpsLine();
    }

    /** Optional resync after a rejected fix so the chain cannot stay stale. */
    function rejectFix(lat, lon, timestamp) {
        gps.rejected += 1;
        if (lat !== undefined && lon !== undefined && timestamp !== undefined) {
            gps.lastPoint = { lat: lat, lng: lon, timestamp: timestamp };
        }
    }

    function storePoint(lat, lon, timestamp, accuracy, speed) {
        session.gpsPoints.push({
            lat: lat,
            lng: lon,
            timestamp: timestamp,
            accuracy: isFinite(accuracy) ? accuracy : null,
            speed: speed === null || speed === undefined ? null : speed
        });
    }

    function onGpsError(error) {
        const code = error && typeof error.code === "number" ? error.code : 0;
        if (code === 1) {
            setGpsStatus("denied");
            showNotice("Location permission is required to track your workout.", "error");
        } else if (code === 3) {
            setGpsStatus("searching");
            showNotice("GPS timed out. Still trying to get a signal…", "info");
        } else {
            setGpsStatus("error");
            showNotice("GPS signal unavailable. Moving outdoors usually helps.", "error");
        }
        renderGpsLine();
    }

    /* ======================================================================
       7. Elapsed-time clock
       ====================================================================== */

    function activeDurationMs() {
        let total = clock.accumulatedMs;
        if (state === STATE.RUNNING && clock.segmentStart) {
            const delta = Date.now() - clock.segmentStart;
            if (delta > 0) total += Math.min(delta, CONFIG.MAX_SESSION_MS);
        }
        return total;
    }

    function startClock() {
        clock.segmentStart = Date.now();
        stopTicker();
        clock.tickId = setInterval(onTick, CONFIG.TICK_MS);
    }

    function stopClock() {
        if (state === STATE.RUNNING && clock.segmentStart) {
            clock.accumulatedMs += Date.now() - clock.segmentStart;
        }
        clock.segmentStart = 0;
    }

    function stopTicker() {
        if (clock.tickId !== null) {
            clearInterval(clock.tickId);
            clock.tickId = null;
        }
    }

    function resetClock() {
        stopTicker();
        clock.accumulatedMs = 0;
        clock.segmentStart = 0;
    }

    function onTick() {
        renderElapsed();
        renderMetrics();
        updateInterval(Date.now());
        renderInterval();
        if (state === STATE.RUNNING && !hasFreshSpeed()) renderGpsLine();
    }

    /* ======================================================================
       8. Interval (Tabata) engine
       ====================================================================== */

    function startInterval() {
        const settings = session.intervalSettings;
        interval.running = true;
        interval.phase = "work";
        interval.round = 1;
        interval.completedRounds = 0;
        interval.pausedAt = 0;
        interval.pausedRemaining = 0;
        interval.phaseEndsAt = Date.now() + settings.workSec * 1000;
        el.intervalPanel.hidden = false;
        signalPhase("work");
    }

    /**
     * Advance the program. Driven by wall-clock deadlines rather than a
     * decrementing counter, so a throttled background tab cannot drift,
     * and a long stall is caught by the loop below.
     */
    function updateInterval(now) {
        if (!interval.running || interval.phase === "complete") return;
        if (state === STATE.PAUSED) return;

        const settings = session.intervalSettings;
        let guard = 0;

        while (interval.phaseEndsAt - now <= 0 && guard < 500) {
            guard += 1;

            if (interval.phase === "work") {
                interval.completedRounds = interval.round;
                session.completedRounds = interval.round;

                if (interval.round >= settings.rounds) {
                    completeInterval();
                    return;
                }
                interval.phase = "rest";
                interval.phaseEndsAt += settings.restSec * 1000;
                signalPhase("rest");
            } else {
                interval.phase = "work";
                interval.round += 1;
                interval.phaseEndsAt += settings.workSec * 1000;
                signalPhase("work");
            }
        }
    }

    /** Freeze the countdown while paused. */
    function pauseInterval() {
        if (!interval.running) return;
        interval.pausedAt = Date.now();
        interval.pausedRemaining = Math.max(0, interval.phaseEndsAt - interval.pausedAt);
    }

    function resumeInterval() {
        if (!interval.running || !interval.pausedAt) return;
        // Restart the current phase from wherever it was frozen.
        interval.phaseEndsAt = Date.now() + Math.max(0, interval.pausedRemaining);
        interval.pausedAt = 0;
        interval.pausedRemaining = 0;
    }

    function stopInterval() {
        interval.running = false;
        interval.phase = "idle";
        interval.pausedAt = 0;
        interval.pausedRemaining = 0;
        el.intervalPanel.hidden = true;
    }

    function completeInterval() {
        interval.running = false;
        interval.phase = "complete";
        session.completedRounds = interval.completedRounds;
        signalPhase("complete");
        showNotice("Interval program complete. Finish when you are ready.", "success");
    }

    function phaseDurationMs() {
        const settings = session.intervalSettings;
        const seconds = interval.phase === "rest" ? settings.restSec : settings.workSec;
        return Math.max(1, finite(seconds, 1)) * 1000;
    }

    function renderInterval() {
        if (session.sessionType !== "interval" || el.intervalPanel.hidden) return;

        const settings = session.intervalSettings;

        if (interval.phase === "complete") {
            el.intervalPanel.dataset.phase = "complete";
            el.phaseName.textContent = "Complete";
            el.phaseCountdown.textContent = "0:00";
            el.phaseRound.textContent =
                settings.rounds + " / " + settings.rounds + " rounds";
            el.phaseBarFill.style.width = "100%";
            el.completeFlag.hidden = false;
            return;
        }

        el.completeFlag.hidden = true;
        el.intervalPanel.dataset.phase = interval.phase;
        el.phaseName.textContent = interval.phase === "rest" ? "Rest" : "Work";
        el.phaseRound.textContent = "Round " + interval.round + " / " + settings.rounds;

        const remaining = intervalRemainingMs();
        el.phaseCountdown.textContent = formatCountdown(remaining / 1000);

        const elapsed = phaseDurationMs() - remaining;
        const ratio = clamp(elapsed / phaseDurationMs(), 0, 1);
        el.phaseBarFill.style.width = (ratio * 100).toFixed(1) + "%";

        el.intervalPanel.classList.toggle("is-urgent", remaining <= 3000);
    }

    /** Milliseconds left in the current phase, frozen while paused. */
    function intervalRemainingMs() {
        if (state === STATE.PAUSED && interval.pausedAt) {
            return Math.max(0, interval.pausedRemaining);
        }
        return Math.max(0, interval.phaseEndsAt - Date.now());
    }

    /* ======================================================================
       9. Haptics + audio cues (generated, no external files)
       ====================================================================== */

    function ensureAudio() {
        if (audioCtx) {
            if (audioCtx.state === "suspended") audioCtx.resume().catch(function () {});
            return;
        }
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return;
        try {
            audioCtx = new Ctor();
        } catch (err) {
            audioCtx = null;
        }
    }

    function tone(frequency, duration, delay, volume) {
        if (!audioCtx) return;
        try {
            const start = audioCtx.currentTime + (delay || 0);
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.value = frequency;
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(volume || 0.2, start + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(start);
            osc.stop(start + duration + 0.02);
        } catch (err) {
            /* audio is a nicety, never fatal */
        }
    }

    function vibrate(pattern) {
        if (typeof navigator.vibrate === "function") {
            try {
                navigator.vibrate(pattern);
            } catch (err) {
                /* ignore */
            }
        }
    }

    function signalPhase(phase) {
        if (phase === "work") {
            tone(880, 0.16, 0, 0.22);
            vibrate(180);
        } else if (phase === "rest") {
            tone(520, 0.16, 0, 0.18);
            vibrate([110, 80, 110]);
        } else if (phase === "complete") {
            tone(660, 0.12, 0, 0.2);
            tone(880, 0.12, 0.14, 0.2);
            tone(1180, 0.3, 0.28, 0.22);
            vibrate([220, 90, 220, 90, 420]);
        }
    }

    /* ======================================================================
       10. Screen wake lock
       ====================================================================== */

    function requestWakeLock() {
        wake.wanted = true;
        if (!("wakeLock" in navigator) || wake.lock !== null) return;
        navigator.wakeLock.request("screen")
            .then(function (lock) {
                wake.lock = lock;
                lock.addEventListener("release", function () {
                    wake.lock = null;
                });
            })
            .catch(function () {
                /* unsupported or denied: continue without it */
            });
    }

    function releaseWakeLock() {
        wake.wanted = false;
        const lock = wake.lock;
        wake.lock = null;
        if (lock && typeof lock.release === "function") {
            lock.release().catch(function () {});
        }
    }

    function handleVisibility() {
        if (document.visibilityState !== "visible") return;
        const live = state === STATE.RUNNING || state === STATE.PAUSED;
        if (live && wake.wanted && wake.lock === null) {
            requestWakeLock();
        }
    }

    /* ======================================================================
       11. State machine
       ====================================================================== */

    function createSession() {
        session.sessionType = sessionType;
        session.state = state;
        session.startTime = new Date().toISOString();
        session.endTime = null;
        session.activeDuration = 0;
        session.totalDistance = 0;
        session.currentSpeed = 0;
        session.averageSpeed = 0;
        session.maxSpeed = 0;
        session.currentPace = null;
        session.averagePace = null;
        session.gpsPoints = [];
        session.completedRounds = 0;
        session.intervalSettings = readIntervalSettings();
    }

    function readIntervalSettings() {
        const clampInput = function (input, min, max, fallback) {
            if (!input) return fallback;
            const value = parseInt(input.value, 10);
            if (!isFinite(value)) return fallback;
            return clamp(value, min, max);
        };
        return {
            workSec: clampInput(el.inputWork, 5, 600, 20),
            restSec: clampInput(el.inputRest, 5, 600, 10),
            rounds: clampInput(el.inputRounds, 1, 99, 8)
        };
    }

    function startWorkout() {
        if (state !== STATE.READY && state !== STATE.FINISHED) return;

        ensureAudio();
        clearNotice();

        // Reset any leftovers from a previous session.
        resetClock();
        gps.lastPoint = null;
        gps.lastFixAt = 0;
        gps.lastSpeedAt = 0;
        gps.hasFix = false;
        gps.accuracy = null;
        gps.rejected = 0;
        stopInterval();
        el.completeFlag.hidden = true;

        state = STATE.STARTING;
        createSession();

        if (!startGps()) {
            // GPS could not even be requested: stay usable, let the user retry.
            state = STATE.READY;
            showScreen("home");
            renderHome();
            renderControls();
            return;
        }

        state = STATE.RUNNING;
        session.state = state;
        startClock();

        if (sessionType === "interval") startInterval();

        requestWakeLock();

        showScreen("live");
        renderWorkoutState();
        renderControls();
        renderElapsed();
        renderMetrics();
        renderGpsLine();
        renderInterval();
    }

    function pauseWorkout() {
        if (state !== STATE.RUNNING) return;
        // Bank the active segment BEFORE changing state: stopClock() only
        // accumulates while the session is still RUNNING.
        stopClock();
        state = STATE.PAUSED;
        session.state = state;
        pauseInterval();
        session.currentSpeed = 0;
        showScreen("live");
        renderWorkoutState();
        renderControls();
        renderElapsed();
        renderMetrics();
        renderGpsLine();
        renderInterval();
    }

    function resumeWorkout() {
        if (state !== STATE.PAUSED) return;
        state = STATE.RUNNING;
        session.state = state;
        startClock();
        resumeInterval();
        // Drop the stale chain so the paused gap is never counted as distance.
        gps.lastPoint = null;
        gps.lastSpeedAt = 0;
        showScreen("live");
        renderWorkoutState();
        renderControls();
        renderElapsed();
        renderMetrics();
        renderGpsLine();
        renderInterval();
    }

    /** Toggle PAUSE / RESUME. */
    function togglePause() {
        if (state === STATE.RUNNING) pauseWorkout();
        else if (state === STATE.PAUSED) resumeWorkout();
    }

    function finishWorkout() {
        if (state !== STATE.RUNNING && state !== STATE.PAUSED) return;

        stopClock();
        stopTicker();
        stopGps();
        stopInterval();
        releaseWakeLock();

        state = STATE.FINISHED;
        session.state = state;
        session.endTime = new Date().toISOString();
        session.activeDuration = activeDurationMs();
        session.currentSpeed = 0;
        session.averageSpeed = averageSpeed();
        session.averagePace = averagePace();

        el.completeFlag.hidden = true;
        hideModal();
        showScreen("summary");
        renderSummary();
        renderControls();
    }

    function resetToReady() {
        stopTicker();
        resetClock();
        stopGps();
        stopInterval();
        releaseWakeLock();

        state = STATE.READY;
        session.state = state;
        session.gpsPoints = [];
        session.totalDistance = 0;
        session.maxSpeed = 0;
        session.currentSpeed = 0;
        session.completedRounds = 0;

        gps.lastPoint = null;
        gps.lastFixAt = 0;
        gps.lastSpeedAt = 0;
        gps.hasFix = false;
        gps.accuracy = null;
        gps.rejected = 0;

        el.completeFlag.hidden = true;
        el.intervalPanel.hidden = true;
        el.phaseBarFill.style.width = "0%";
        el.intervalPanel.classList.remove("is-urgent");

        clearNotice();
        hideModal();
        showScreen("home");
        renderWorkoutState();
        renderControls();
        renderElapsed();
        renderMetrics();
        renderGpsLine();
        refreshPermissionStatus();
    }

    /* ----------------------------------------------------------------------
       Summary rendering
       ---------------------------------------------------------------------- */

    function summaryItems() {
        const items = [
            { label: "Distance", value: formatDistance(session.totalDistance), hero: true },
            { label: "Duration", value: formatClock(session.activeDuration) },
            { label: "Average pace", value: formatPace(session.averagePace) },
            { label: "Average speed", value: formatSpeed(session.averageSpeed) },
            { label: "Maximum speed", value: formatSpeed(session.maxSpeed) },
            { label: "GPS points", value: String(session.gpsPoints.length) },
            { label: "Training type", value: sessionType === "interval" ? "Interval" : "Free run" }
        ];

        if (session.sessionType === "interval") {
            items.push(
                { label: "Completed rounds", value: session.completedRounds + " / " + session.intervalSettings.rounds },
                { label: "Work time", value: session.intervalSettings.workSec + " sec" },
                { label: "Rest time", value: session.intervalSettings.restSec + " sec" }
            );
        }

        return items;
    }

    function renderSummary() {
        el.summaryType.textContent = sessionType === "interval" ? "Interval" : "Free run";
        el.summaryTitle.textContent = "Workout complete";
        el.summaryGrid.textContent = "";

        summaryItems().forEach(function (item) {
            const wrapper = document.createElement("div");
            wrapper.className = "summary-item" + (item.hero ? " summary-item-hero" : "");

            const label = document.createElement("span");
            label.className = "summary-label";
            label.textContent = item.label;

            const value = document.createElement("span");
            value.className = "summary-value";
            value.textContent = item.value;

            wrapper.appendChild(label);
            wrapper.appendChild(value);
            el.summaryGrid.appendChild(wrapper);
        });
    }

    /* ----------------------------------------------------------------------
       Confirm modal
       ---------------------------------------------------------------------- */

    function showModal() {
        el.confirmModal.hidden = false;
    }

    function hideModal() {
        el.confirmModal.hidden = true;
    }

    function requestFinish() {
        if (state !== STATE.RUNNING && state !== STATE.PAUSED) return;
        showModal();
    }

    /* ----------------------------------------------------------------------
       Home permission probe (no prompt on page load)
       ---------------------------------------------------------------------- */

    function refreshPermissionStatus() {
        if (!navigator.geolocation) {
            setGpsStatus("unavailable");
            renderHome();
            return;
        }
        if (!navigator.permissions || !navigator.permissions.query) {
            setGpsStatus("prompt");
            renderHome();
            return;
        }
        navigator.permissions.query({ name: "geolocation" })
            .then(function (result) {
                applyPermissionState(result.state);
                result.onchange = function () {
                    applyPermissionState(result.state);
                };
            })
            .catch(function () {
                setGpsStatus("prompt");
                renderHome();
            });
    }

    function applyPermissionState(permission) {
        if (permission === "granted") setGpsStatus("ready");
        else if (permission === "denied") setGpsStatus("denied");
        else setGpsStatus("prompt");
        renderHome();
    }

    /* ======================================================================
       12. Event wiring
       ====================================================================== */

    function setMode(mode) {
        sessionType = mode === "interval" ? "interval" : "free";
        el.modeCards.forEach(function (card) {
            const active = card.dataset.mode === sessionType;
            card.classList.toggle("is-active", active);
            card.setAttribute("aria-pressed", active ? "true" : "false");
        });
        el.intervalConfig.hidden = sessionType !== "interval";
    }

    function applyStep(button) {
        const spec = button.dataset.step;
        if (!spec) return;
        const parts = spec.split(":");
        if (parts.length !== 2) return;
        const target = parts[0];
        const delta = parseInt(parts[1], 10);
        if (!isFinite(delta)) return;

        let input = null;
        if (target === "work") input = el.inputWork;
        else if (target === "rest") input = el.inputRest;
        else if (target === "rounds") input = el.inputRounds;
        if (!input) return;

        const min = parseInt(input.min, 10);
        const max = parseInt(input.max, 10);
        const current = parseInt(input.value, 10);
        const base = isFinite(current) ? current : min;
        input.value = String(clamp(base + delta, isFinite(min) ? min : 0, isFinite(max) ? max : 999));
    }

    function init() {
        el.btnStart.addEventListener("click", function () {
            startWorkout();
        });

        el.btnPause.addEventListener("click", function () {
            togglePause();
        });

        el.btnFinish.addEventListener("click", function () {
            requestFinish();
        });

        el.btnCancelFinish.addEventListener("click", function () {
            hideModal();
        });

        el.btnConfirmFinish.addEventListener("click", function () {
            finishWorkout();
        });

        el.btnNewTraining.addEventListener("click", function () {
            resetToReady();
        });

        el.noticeClose.addEventListener("click", function () {
            clearNotice();
        });

        el.modeCards.forEach(function (card) {
            card.addEventListener("click", function () {
                setMode(card.dataset.mode);
            });
        });

        el.stepperButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                applyStep(button);
            });
        });

        [el.inputWork, el.inputRest, el.inputRounds].forEach(function (input) {
            if (!input) return;
            input.addEventListener("change", function () {
                const value = parseInt(input.value, 10);
                const min = parseInt(input.min, 10);
                const max = parseInt(input.max, 10);
                input.value = String(
                    isFinite(value)
                        ? clamp(value, isFinite(min) ? min : 0, isFinite(max) ? max : 999)
                        : (isFinite(min) ? min : 0)
                );
            });
        });

        document.addEventListener("visibilitychange", handleVisibility);
    }

    /* ======================================================================
       13. Public API
       ====================================================================== */

    const PAC = {
        start: startWorkout,
        pause: pauseWorkout,
        resume: resumeWorkout,
        finish: finishWorkout,
        reset: resetToReady,
        getState: function () {
            return state;
        },
        getSession: function () {
            return {
                sessionType: session.sessionType,
                startTime: session.startTime,
                endTime: session.endTime,
                activeDuration: session.activeDuration,
                totalDistance: session.totalDistance,
                currentSpeed: session.currentSpeed,
                averageSpeed: session.averageSpeed,
                maxSpeed: session.maxSpeed,
                currentPace: session.currentPace,
                averagePace: session.averagePace,
                gpsPoints: session.gpsPoints.slice(),
                intervalSettings: {
                    workSec: session.intervalSettings.workSec,
                    restSec: session.intervalSettings.restSec,
                    rounds: session.intervalSettings.rounds
                },
                completedRounds: session.completedRounds
            };
        }
    };

    window.PAC = PAC;

    /* ======================================================================
       14. Boot
       ====================================================================== */

    function boot() {
        setMode("free");
        init();
        showScreen("home");
        renderControls();
        renderWorkoutState();
        renderElapsed();
        renderMetrics();
        refreshPermissionStatus();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();

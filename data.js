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
        /* ---- Accuracy filtering ---- */
        // Reject any fix whose reported accuracy is worse than this.
        MAX_ACCURACY_M: 40,
        // Above this the athlete is told the signal is weak.
        WEAK_ACCURACY_M: 20,
        // A fix must be at least this accurate before the session is
        // considered "locked on" and distance/speed start being recorded.
        ACQUIRE_ACCURACY_M: 30,
        // Number of consecutive acceptable fixes required to leave
        // the "Acquiring GPS..." state.
        ACQUIRE_SAMPLES: 3,

        /* ---- Spike / teleport filtering (activity dependent) ---- */
        // Absolute ceiling: a 1-second move faster than this is impossible.
        // The per-activity ceiling is ACTIVITY[x].spikeSpeedMs.
        TELEPORT_SPEED_MS: 30,
        // A single fix must not be trusted for a max-speed record.
        MAX_SPEED_SAMPLES: 3,

        /* ---- Stationary / drift handling (activity dependent) ---- */
        // When stationary, current speed decays to 0 within this window.
        SPEED_DECAY_MS: 4000,

        /* ---- Movement window ----
           A single fix cannot separate drift from movement, so real
           movement is judged over a short sequence of accepted fixes.
           Walking grows the window steadily; a resting phone only jitters
           inside it. */
        WINDOW_MS: 5000,
        WINDOW_MIN_SAMPLES: 3,
        WINDOW_MAX_SAMPLES: 8,
        // Straight-line distance across the window needed to declare movement.
        MIN_WINDOW_DISTANCE_M: 5,
        // net displacement / travelled path. Real motion approaches 1,
        // random drift collapses towards 0.
        MIN_PATH_EFFICIENCY: 0.5,
        // Consecutive agreeing windows needed to switch state, so a border
        // case cannot make the state flicker.
        MOVEMENT_CONFIRM: 2,
        STILL_CONFIRM: 2,

        /* ---- Statistics guards ---- */
        // Below this distance, speed/pace statistics are meaningless
        // because GPS error dominates the signal.
        MIN_STATS_DISTANCE_M: 20,
        // Speed above which current speed is considered stale.
        SPEED_STALE_MS: 6000,
        // Smoothing factor for current speed (0 = frozen, 1 = no smoothing).
        SPEED_SMOOTHING: 0.4,

        /* ---- Misc ---- */
        TICK_MS: 250,
        NO_FIX_WARNING_MS: 15000,
        MAX_SESSION_MS: 24 * 60 * 60 * 1000,
        EARTH_RADIUS_M: 6371008.8,

        // Console diagnostics are opt-in to avoid flooding the log.
        DEBUG: false
    };

    /**
     * Per-activity limits.
     *   spikeSpeedMs     one-second jump above this is a GPS glitch
     *   movementSpeedMs  window speed above this counts as real travel
     *   maxSpeedMs       physical ceiling, so one bad fix cannot be reported
     */
    const ACTIVITY = {
        walk: {
            label: "Walk",
            spikeSpeedMs: 6,       // 21.6 km/h
            movementSpeedMs: 0.6, // 2.2 km/h
            maxSpeedMs: 8          // 28.8 km/h
        },
        run: {
            label: "Run",
            spikeSpeedMs: 11,      // 39.6 km/h
            movementSpeedMs: 0.8, // 2.9 km/h
            maxSpeedMs: 14         // 50.4 km/h
        },
        cycle: {
            label: "Cycling",
            spikeSpeedMs: 25,      // 90 km/h
            movementSpeedMs: 1.0, // 3.6 km/h
            maxSpeedMs: 32         // 115 km/h
        }
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
        if (v <= 0) return null;
        const secPerKm = 1000 / v;
        if (!isFinite(secPerKm) || secPerKm <= 0 || secPerKm > 7200) return null;
        return secPerKm;
    }

    /** seconds per km -> "m:ss /km", or "--:-- /km" when unknown. */
    function formatPace(secPerKm) {
        if (secPerKm === null || secPerKm === undefined) return "--";
        const total = Math.round(finite(secPerKm, 0));
        if (total <= 0) return "--";
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
        activityCards: Array.prototype.slice.call(
            document.querySelectorAll(".activity-card")
        ),
        acquiring: document.getElementById("acquiring"),
        acquiringHint: document.getElementById("acquiringHint"),
        routeMap: document.getElementById("routeMap"),
        routeLine: document.getElementById("routeLine"),
        routeStart: document.getElementById("routeStart"),
        routeEnd: document.getElementById("routeEnd"),
        routeNote: document.getElementById("routeNote"),
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

    /** Selected activity: "walk" | "run" | "cycle". */
    let activityType = "run";

    /** Active per-activity thresholds for the current session. */
    let limits = ACTIVITY.run;

    /**
     * Session record. Shaped so it can be serialised straight into
     * Firebase later without restructuring.
     */
    const session = {
        activityType: "run",
        sessionType: "free",
        state: STATE.READY,
        startTime: null,
        endTime: null,
        startTimestamp: null,     // epoch ms, for duration maths
        endTimestamp: null,
        activeDuration: 0,        // ms of non-paused time
        movingMs: 0,              // ms spent actually moving
        totalDistance: 0,         // metres, accepted movement only
        currentSpeed: 0,          // m/s, smoothed and drift-suppressed
        averageSpeed: 0,          // m/s
        maxSpeed: 0,              // m/s, confirmed by several samples
        currentPace: null,        // seconds per km
        averagePace: null,        // seconds per km
        route: [],                // ACCEPTED coordinates only
        gpsPoints: [],            // every raw fix, internal/debug only
        intervalSettings: { workSec: 20, restSec: 10, rounds: 8 },
        completedRounds: 0
    };

    /** GPS internals */
    const gps = {
        watchId: null,
        lastPoint: null,      // last accepted fix used for distance chaining
        lastFixAt: 0,         // wall-clock of the most recent accepted fix
        lastSpeedAt: 0,       // wall-clock of the most recent real movement
        accuracy: null,       // most recent reported accuracy (metres)
        hasFix: false,
        acquired: false,      // passed the acquisition gate
        acquireStreak: 0,     // consecutive acceptable fixes
        rejected: 0,          // dropped: bad accuracy
        spikes: 0,            // dropped: impossible jump
        stationary: true,     // currently considered not moving
        speedSamples: 0,      // consecutive confirmations for max speed
        movingSince: 0,       // wall-clock when the current movement began
        window: [],           // recent accepted fixes used to judge movement
        movingStreak: 0,      // consecutive windows that look like movement
        stillStreak: 0,       // consecutive windows that look like stillness
        routeBreak: false     // next accepted point starts a new route segment
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
        if (!gps.hasFix) {
            // Only escalate to "no signal" if a fix was received before and
            // has now been lost; before the very first fix we are still
            // inside the normal search window.
            const waited = gps.lastFixAt > 0 &&
                (Date.now() - gps.lastFixAt) > CONFIG.NO_FIX_WARNING_MS;
            el.gpsLine.textContent = waited ? "Waiting for GPS signal…" : "Waiting for GPS…";
            el.gpsLine.className = "gps-line is-warn";
            return;
        }

        if (!gps.acquired) {
            el.gpsLine.textContent = "Acquiring GPS…";
            el.gpsLine.className = "gps-line is-warn";
            return;
        }

        const weak = !isFinite(gps.accuracy) || gps.accuracy > CONFIG.WEAK_ACCURACY_M;
        el.gpsLine.className = "gps-line " + (weak ? "is-warn" : "is-ok");
        el.gpsLine.textContent = (gps.stationary ? "Standing still · " : "GPS active · ") +
            "Accuracy " + formatAccuracy(gps.accuracy);
    }

    /** The "Acquiring GPS..." banner shown until the signal is trustworthy. */
    function renderAcquiring() {
        const acquiring = gps.watchId !== null && !gps.acquired;
        el.acquiring.hidden = !acquiring;
        if (acquiring && gps.acquireStreak > 0) {
            el.acquiringHint.textContent = "Signal " + gps.acquireStreak + " of " +
                CONFIG.ACQUIRE_SAMPLES + " · step outside for a clear fix";
        } else if (acquiring) {
            el.acquiringHint.textContent = "Step outside for a clear signal";
        }
    }

    /** Live metric tiles. */
    function renderMetrics() {
        const fresh = hasFreshSpeed() && !gps.stationary;
        const currentSpeed = fresh ? session.currentSpeed : 0;
        const avgSpeed = averageSpeed();
        const currentPace = fresh ? paceFromSpeed(session.currentSpeed) : null;
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
    /** True when the athlete is currently producing a believable speed. */
    function hasFreshSpeed() {
        if (gps.lastSpeedAt === 0) return false;
        if (gps.stationary) return false;
        return (Date.now() - gps.lastSpeedAt) < CONFIG.SPEED_STALE_MS;
    }

    /**
     * Average speed uses MOVING time rather than total elapsed time, so
     * standing still at a traffic light cannot deflate it, and returns 0
     * until there is enough real distance to be meaningful.
     */
    function movingDurationMs() {
        let total = session.movingMs;
        if (state === STATE.RUNNING && gps.movingSince) {
            const delta = Date.now() - gps.movingSince;
            if (delta > 0) total += Math.min(delta, CONFIG.MAX_SESSION_MS);
        }
        return total;
    }

    function hasMeaningfulDistance() {
        return session.totalDistance >= CONFIG.MIN_STATS_DISTANCE_M;
    }

    function averageSpeed() {
        if (!hasMeaningfulDistance()) return 0;
        const seconds = movingDurationMs() / 1000;
        if (seconds <= 0) return 0;
        const v = session.totalDistance / seconds;
        return isFinite(v) && v > 0 ? v : 0;
    }

    /**
     * Average pace in seconds per kilometre, derived from the same
     * moving-time figure as average speed, so pace and speed can never
     * disagree. Returns null (displayed as "--") when there is not enough
     * real distance to be meaningful.
     */
    function averagePace() {
        if (!hasMeaningfulDistance()) return null;
        const seconds = movingDurationMs() / 1000;
        if (seconds <= 0) return null;
        const secPerKm = (seconds * 1000) / session.totalDistance;
        if (!isFinite(secPerKm) || secPerKm <= 0 || secPerKm > 3600) return null;
        return secPerKm;
    }

    /**
     * Decide whether the athlete is really moving by looking at a short
     * window of accepted fixes instead of one fix.
     *
     *   net       straight-line distance across the window
     *   speed     net / elapsed window time
     *   path      total distance actually travelled through the window
     *   efficiency net / path  -> ~1.0 when going straight, ~0 when drifting
     *
     * Real travel satisfies net distance, speed and efficiency. A phone
     * lying still fails all three, however violently its coordinates twitch.
     */
    function movementFromWindow() {
        const w = gps.window;
        const still = { moving: false, speed: 0, net: 0, efficiency: 0 };

        if (w.length < CONFIG.WINDOW_MIN_SAMPLES) return still;

        const first = w[0];
        const last = w[w.length - 1];
        const seconds = (last.timestamp - first.timestamp) / 1000;
        if (!isFinite(seconds) || seconds <= 0) return still;

        const net = haversineMetres(first.lat, first.lng, last.lat, last.lng);
        if (net === null || !isFinite(net)) return still;

        let path = 0;
        for (let i = 1; i < w.length; i++) {
            const d = haversineMetres(
                w[i - 1].lat, w[i - 1].lng, w[i].lat, w[i].lng
            );
            if (d === null || !isFinite(d)) return still;
            path += d;
        }

        const speed = net / seconds;
        const efficiency = path > 0 ? net / path : 0;
        if (!isFinite(speed) || !isFinite(efficiency)) return still;

        return {
            moving: net >= CONFIG.MIN_WINDOW_DISTANCE_M &&
                speed >= limits.movementSpeedMs &&
                efficiency >= CONFIG.MIN_PATH_EFFICIENCY,
            speed: speed,
            net: net,
            efficiency: efficiency
        };
    }

    /** Append an accepted fix to the movement window and trim it. */
    function pushWindow(lat, lon, timestamp) {
        gps.window.push({ lat: lat, lng: lon, timestamp: timestamp });
        while (gps.window.length > CONFIG.WINDOW_MAX_SAMPLES) {
            gps.window.shift();
        }
        while (gps.window.length > CONFIG.WINDOW_MIN_SAMPLES &&
            timestamp - gps.window[0].timestamp > CONFIG.WINDOW_MS) {
            gps.window.shift();
        }
    }

    /** A rejected or teleported fix must not poison the window. */
    function resetWindow(lat, lon, timestamp) {
        gps.window = [];
        gps.movingStreak = 0;
        gps.stillStreak = 0;
        if (isFinite(lat) && isFinite(lon) && isFinite(timestamp)) {
            gps.window.push({ lat: lat, lng: lon, timestamp: timestamp });
        }
    }

    /**
     * Hysteresis: a single ambiguous window can never flip the state, which
     * stops distance and moving-time flickering at the threshold.
     */
    function updateMovementState(reading) {
        if (reading.moving) {
            gps.movingStreak += 1;
            gps.stillStreak = 0;
        } else {
            gps.stillStreak += 1;
            gps.movingStreak = 0;
        }

        const wasStationary = gps.stationary;
        if (wasStationary && gps.movingStreak >= CONFIG.MOVEMENT_CONFIRM) {
            gps.stationary = false;
        } else if (!wasStationary && gps.stillStreak >= CONFIG.STILL_CONFIRM) {
            gps.stationary = true;
        }
        return !gps.stationary;
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
     * Fold a single GPS fix into the session.
     *
     * Pipeline, in order:
     *   1. coordinate sanity        -> dropped as "invalid"
     *   2. accuracy gate            -> dropped as "rejected"
     *   3. acquisition gate         -> anchored, but nothing is measured yet
     *   4. time delta sanity        -> dropped as "rejected"
     *   5. distance + implied speed
     *   6. spike / teleport gate    -> dropped as "spike", chain re-anchored,
     *                                 route marked to break so no false line
     *                                 is drawn across the jump
     *   7. movement decision over a short window of accepted fixes
     *   8. speed smoothing from the window speed + confirmed max speed
     *
     * A rejected fix never reaches the route and never touches distance, so
     * GPS noise cannot inflate the workout.
     */
    function onGpsSuccess(position) {
        const coords = position && position.coords;
        if (!coords) return;

        /* 1. coordinate sanity */
        const lat = finite(coords.latitude, NaN);
        const lon = finite(coords.longitude, NaN);
        if (!isValidCoordinate(lat, lon)) {
            rejectFix("invalid");
            return;
        }

        const accuracy = finite(coords.accuracy, NaN);
        const timestamp = finite(position.timestamp, Date.now());

        // Keep the newest reported accuracy for the UI, even when rejected.
        if (isFinite(accuracy) && accuracy >= 0) {
            gps.accuracy = accuracy;
        }

        // Every raw fix is retained internally for debugging only.
        storeRawPoint(lat, lon, timestamp, accuracy, coords.speed);

        /* 2. accuracy gate */
        if (!isFinite(accuracy) || accuracy > CONFIG.MAX_ACCURACY_M) {
            rejectFix("accuracy");
            updateGpsStatus();
            return;
        }

        /* 3. acquisition gate: GPS needs to settle before we trust it */
        if (!gps.acquired) {
            if (accuracy <= CONFIG.ACQUIRE_ACCURACY_M) {
                gps.acquireStreak += 1;
                if (gps.acquireStreak >= CONFIG.ACQUIRE_SAMPLES) {
                    gps.acquired = true;
                }
            } else {
                gps.acquireStreak = 0;
            }
            if (!gps.acquired) {
                // Anchor the chain but measure nothing yet.
                gps.lastPoint = { lat: lat, lng: lon, timestamp: timestamp };
                gps.hasFix = true;
                updateGpsStatus();
                return;
            }
        }

        /* 4-6. movement segment */
        const previous = gps.lastPoint;
        let stepDistance = 0;
        let stepSeconds = 0;
        let impliedSpeed = null;

        if (previous) {
            stepSeconds = (timestamp - previous.timestamp) / 1000;
            const metres = haversineMetres(previous.lat, previous.lng, lat, lon);

            if (!isFinite(stepSeconds) || stepSeconds <= 0 || metres === null) {
                rejectFix("timing");
                updateGpsStatus();
                return;
            }

            impliedSpeed = metres / stepSeconds;
            if (!isFinite(impliedSpeed) || impliedSpeed < 0) {
                rejectFix("speed");
                updateGpsStatus();
                return;
            }

            // Impossible jump: re-anchor the chain but never add distance.
            if (impliedSpeed > limits.spikeSpeedMs ||
                impliedSpeed > CONFIG.TELEPORT_SPEED_MS) {
                gps.spikes += 1;
                gps.lastPoint = { lat: lat, lng: lon, timestamp: timestamp };
                resetWindow(lat, lon, timestamp);
                // The next accepted point starts a new route segment, so the
                // drawn track never shows a false straight line across the
                // teleport.
                gps.routeBreak = true;
                rejectFix("spike");
                updateGpsStatus();
                return;
            }

            stepDistance = metres;
        }

        // Accepted fix: it becomes the anchor for the next segment.
        gps.lastPoint = { lat: lat, lng: lon, timestamp: timestamp };
        gps.hasFix = true;
        gps.lastFixAt = Date.now();

        /* 7. movement decision over a short window of accepted fixes */
        pushWindow(lat, lon, timestamp);
        const reading = movementFromWindow();
        const isMoving = updateMovementState(reading);

        /*
         * Moving time may only accrue while the session is actually running,
         * otherwise a paused session would still bank "moving" time and the
         * average would jump on resume.
         */
        const isRunning = state === STATE.RUNNING;
        if (isMoving) {
            if (isRunning && !gps.movingSince) gps.movingSince = Date.now();
        } else {
            if (gps.movingSince) {
                if (isRunning) session.movingMs += Date.now() - gps.movingSince;
                gps.movingSince = 0;
            }
        }

        // Only real movement extends the accepted route and distance.
        if (isMoving && isRunning && stepDistance > 0) {
            session.totalDistance += stepDistance;
            session.route.push({
                lat: lat,
                lng: lon,
                timestamp: timestamp,
                accuracy: accuracy,
                speed: impliedSpeed,
                // true => start a new drawn segment (a gap was detected)
                newSegment: gps.routeBreak === true
            });
            gps.routeBreak = false;
        }

        /* 8. speed smoothing + confirmed max speed */
        updateSpeed(impliedSpeed, stepSeconds, isMoving, reading.speed);

        updateGpsStatus();
    }

    /**
     * Smooth the current speed and protect the max-speed record from
     * single-sample spikes.
     *
     * The reading is the WINDOW speed (net displacement over the analysis
     * window) rather than one fix, so a momentary coordinate jump can never
     * become a speed record. While stationary the value decays to 0.
     */
    function updateSpeed(impliedSpeed, stepSeconds, isMoving, windowSpeed) {
        const now = Date.now();
        const reading = finite(windowSpeed, 0);

        // Only measure speed while actually running and moving.
        if (state !== STATE.RUNNING || !isMoving || reading <= 0) {
            if (now - gps.lastSpeedAt > CONFIG.SPEED_DECAY_MS) {
                session.currentSpeed = 0;
            }
            return;
        }

        // Cap at the physically plausible limit for this activity.
        const capped = Math.min(reading, limits.maxSpeedMs);
        const smoothed = CONFIG.SPEED_SMOOTHING * capped +
            (1 - CONFIG.SPEED_SMOOTHING) * session.currentSpeed;

        session.currentSpeed = clamp(smoothed, 0, limits.maxSpeedMs);
        gps.lastSpeedAt = now;

        /*
         * Max speed needs MAX_SPEED_SAMPLES consecutive windows above the
         * current record before it is accepted, so one bad stretch of
         * coordinates can never create a bogus record.
         */
        if (session.currentSpeed > session.maxSpeed) {
            gps.speedSamples += 1;
            if (gps.speedSamples >= CONFIG.MAX_SPEED_SAMPLES) {
                session.maxSpeed = session.currentSpeed;
                gps.speedSamples = 0;
            }
        } else {
            gps.speedSamples = 0;
        }
    }

    /** Drop a fix and record why (internal counters only). */
    function rejectFix(reason) {
        gps.rejected += 1;
        if (CONFIG.DEBUG) {
            console.debug("[gps] rejected:", reason);
        }
    }

    /** Every raw fix, kept internally for debugging. Never shown to the athlete. */
    function storeRawPoint(lat, lon, timestamp, accuracy, speed) {
        session.gpsPoints.push({
            lat: lat,
            lng: lon,
            timestamp: timestamp,
            accuracy: isFinite(accuracy) ? accuracy : null,
            speed: isFinite(speed) ? speed : null
        });
    }

    /**
     * Central place that maps GPS internals onto the header chip + live line.
     * The chip reflects SIGNAL QUALITY only. Standing still is a normal,
     * healthy state and is reported by the live line, not by degrading the
     * chip to "weak".
     */
    function updateGpsStatus() {
        if (gps.watchId === null) return;

        if (!gps.hasFix) {
            setGpsStatus("searching");
        } else if (!gps.acquired) {
            setGpsStatus("searching");
        } else if (!isFinite(gps.accuracy) || gps.accuracy > CONFIG.WEAK_ACCURACY_M) {
            setGpsStatus("weak");
        } else {
            setGpsStatus("active");
        }

        renderAcquiring();
        renderGpsLine();
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
        session.activityType = activityType;
        session.sessionType = sessionType;
        session.state = state;
        session.startTime = new Date().toISOString();
        session.endTime = null;
        session.startTimestamp = Date.now();
        session.endTimestamp = null;
        session.activeDuration = 0;
        session.movingMs = 0;
        session.totalDistance = 0;
        session.currentSpeed = 0;
        session.averageSpeed = 0;
        session.maxSpeed = 0;
        session.currentPace = null;
        session.averagePace = null;
        session.route = [];
        session.gpsPoints = [];
        session.completedRounds = 0;
        session.intervalSettings = readIntervalSettings();
    }

    /** Reset every piece of GPS state so a new session starts completely clean. */
    function resetGpsState() {
        gps.lastPoint = null;
        gps.lastFixAt = 0;
        gps.lastSpeedAt = 0;
        gps.accuracy = null;
        gps.hasFix = false;
        gps.acquired = false;
        gps.acquireStreak = 0;
        gps.rejected = 0;
        gps.spikes = 0;
        gps.stationary = true;
        gps.speedSamples = 0;
        gps.movingSince = 0;
        gps.window = [];
        gps.movingStreak = 0;
        gps.stillStreak = 0;
        gps.routeBreak = false;
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
        resetGpsState();
        stopInterval();
        el.completeFlag.hidden = true;
        limits = ACTIVITY[activityType] || ACTIVITY.run;

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
        renderAcquiring();
        renderInterval();
    }

    function pauseWorkout() {
        if (state !== STATE.RUNNING) return;
        // Bank the active segment BEFORE changing state: stopClock() only
        // accumulates while the session is still RUNNING.
        stopClock();
        // Moving time must not run while paused either.
        if (gps.movingSince) {
            session.movingMs += Date.now() - gps.movingSince;
            gps.movingSince = 0;
        }
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

        // Close out the moving-time accumulator before freezing values.
        if (gps.movingSince) {
            session.movingMs += Date.now() - gps.movingSince;
            gps.movingSince = 0;
        }

        state = STATE.FINISHED;
        session.state = state;
        session.endTime = new Date().toISOString();
        session.endTimestamp = Date.now();
        session.activeDuration = activeDurationMs();
        session.currentSpeed = 0;
        session.averageSpeed = averageSpeed();
        session.averagePace = averagePace();

        // Freeze the results: ignore any late GPS callback.
        gps.watchId = null;
        gps.stationary = true;

        el.completeFlag.hidden = true;
        el.acquiring.hidden = true;
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
        session.route = [];
        session.gpsPoints = [];
        session.totalDistance = 0;
        session.movingMs = 0;
        session.maxSpeed = 0;
        session.currentSpeed = 0;
        session.completedRounds = 0;
        session.startTime = null;
        session.endTime = null;
        session.startTimestamp = null;
        session.endTimestamp = null;

        resetGpsState();

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
        renderAcquiring();
        renderRoute();
        refreshPermissionStatus();
    }

    /* ----------------------------------------------------------------------
       Summary rendering
       ---------------------------------------------------------------------- */

    /**
     * Athlete-facing result. Deliberately contains no technical/debug
     * values such as the raw GPS point count.
     */
    function summaryItems() {
        const items = [
            { label: "Distance", value: formatDistance(session.totalDistance), hero: true },
            { label: "Duration", value: formatClock(session.activeDuration) },
            { label: "Average pace", value: formatPace(session.averagePace) },
            { label: "Average speed", value: formatSpeed(session.averageSpeed) },
            { label: "Maximum speed", value: formatSpeed(session.maxSpeed) }
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
        const activity = ACTIVITY[session.activityType] || ACTIVITY.run;
        el.summaryType.textContent = activity.label +
            (session.sessionType === "interval" ? " · Interval" : " · Free run");
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

        renderRoute();
    }

    /**
     * Draw the accepted route using a dependency-free inline SVG.
     * A tile-based map (Leaflet + OpenStreetMap) can be layered in later
     * because the clean route array is already stored; no API key or paid
     * service is introduced here, and nothing can break if tiles fail.
     */
    function renderRoute() {
        const route = session.route;

        if (route.length < 2) {
            el.routeMap.hidden = true;
            // Clear the previous drawing so a stale track can never flash up.
            el.routeLine.setAttribute("d", "");
            el.routeStart.removeAttribute("cx");
            el.routeStart.removeAttribute("cy");
            el.routeEnd.removeAttribute("cx");
            el.routeEnd.removeAttribute("cy");
            el.routeNote.textContent = route.length === 0
                ? "No route recorded."
                : "Not enough valid GPS points to draw a route.";
            return;
        }

        let minLat = Infinity, maxLat = -Infinity;
        let minLng = Infinity, maxLng = -Infinity;

        for (let i = 0; i < route.length; i++) {
            const p = route[i];
            if (p.lat < minLat) minLat = p.lat;
            if (p.lat > maxLat) maxLat = p.lat;
            if (p.lng < minLng) minLng = p.lng;
            if (p.lng > maxLng) maxLng = p.lng;
        }

        // A route that spans almost nothing is stationary scribble.
        const spanLat = maxLat - minLat;
        const spanLng = maxLng - minLng;
        if (spanLat < 1e-6 && spanLng < 1e-6) {
            el.routeMap.hidden = true;
            el.routeLine.setAttribute("d", "");
            el.routeStart.removeAttribute("cx");
            el.routeStart.removeAttribute("cy");
            el.routeEnd.removeAttribute("cx");
            el.routeEnd.removeAttribute("cy");
            el.routeNote.textContent = "Route too small to display (stayed in one place).";
            return;
        }

        // Equal-area-ish scaling: correct longitude by latitude so the
        // shape is not stretched, and keep a margin around the path.
        const midLat = (minLat + maxLat) / 2;
        const lngScale = Math.cos(midLat * Math.PI / 180) || 1;
        const width = Math.max(spanLng * lngScale, 1e-6);
        const height = Math.max(spanLat, 1e-6);
        const pad = 0.08;

        const usable = 1 - pad * 2;
        const coords = [];
        for (let i = 0; i < route.length; i++) {
            const p = route[i];
            const x = ((p.lng - minLng) * lngScale) / width;
            const y = (p.lat - minLat) / height;
            coords.push({
                x: (pad + x * usable).toFixed(2),
                y: (1 - pad - y * usable).toFixed(2)
            });
        }

        /*
         * One SVG path, several subpaths. A "newSegment" point starts a new
         * M command, which lifts the pen: a rejected GPS jump therefore shows
         * as a gap in the track instead of a false straight line.
         */
        let d = "";
        for (let i = 0; i < coords.length; i++) {
            const c = coords[i];
            if (i === 0 || route[i].newSegment) d += "M" + c.x + "," + c.y + " ";
            else d += "L" + c.x + "," + c.y + " ";
        }
        el.routeLine.setAttribute("d", d.trim());
        el.routeStart.setAttribute("cx", coords[0].x);
        el.routeStart.setAttribute("cy", coords[0].y);
        el.routeEnd.setAttribute("cx", coords[coords.length - 1].x);
        el.routeEnd.setAttribute("cy", coords[coords.length - 1].y);

        const segments = route.filter(function (p) { return p.newSegment; }).length + 1;
        el.routeMap.hidden = false;
        el.routeNote.textContent = segments > 1
            ? route.length + " points · " + segments + " segments (GPS gap filtered)"
            : route.length + " recorded points";
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

    /** Activity type drives the per-activity filtering thresholds. */
    function setActivity(type) {
        activityType = ACTIVITY[type] ? type : "run";
        el.activityCards.forEach(function (card) {
            const active = card.dataset.activity === activityType;
            card.classList.toggle("is-active", active);
            card.setAttribute("aria-pressed", active ? "true" : "false");
        });
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

        el.activityCards.forEach(function (card) {
            card.addEventListener("click", function () {
                setActivity(card.dataset.activity);
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
        /**
         * Clean, serialisable session record. This is the shape intended
         * for later upload into ProAthleteCare / Firebase.
         */
        getSession: function () {
            return {
                activityType: session.activityType,
                sessionType: session.sessionType,
                startTime: session.startTime,
                endTime: session.endTime,
                durationSeconds: Math.round(session.activeDuration / 1000),
                distanceMeters: Math.round(session.totalDistance),
                averageSpeedKmh: round1(session.averageSpeed * MS_TO_KMH),
                maxSpeedKmh: round1(session.maxSpeed * MS_TO_KMH),
                averagePaceSecondsPerKm: session.averagePace === null
                    ? null
                    : Math.round(session.averagePace),
                route: session.route.slice(),
                intervalSettings: {
                    workSec: session.intervalSettings.workSec,
                    restSec: session.intervalSettings.restSec,
                    rounds: session.intervalSettings.rounds
                },
                completedRounds: session.completedRounds
            };
        },
        /** Internal diagnostics, deliberately not shown in the athlete UI. */
        getDebug: function () {
            return {
                acceptedGpsPointCount: session.route.length,
                rawGpsPointCount: session.gpsPoints.length,
                rejected: gps.rejected,
                spikes: gps.spikes,
                acquired: gps.acquired,
                stationary: gps.stationary,
                accuracy: gps.accuracy,
                movingSeconds: Math.round(movingDurationMs() / 1000)
            };
        }
    };

    function round1(value) {
        const v = finite(value, 0);
        return Math.round(v * 10) / 10;
    }

    window.PAC = PAC;

    /* ======================================================================
       14. Boot
       ====================================================================== */

    function boot() {
        setActivity("run");
        setMode("free");
        init();
        showScreen("home");
        renderControls();
        renderWorkoutState();
        renderElapsed();
        renderMetrics();
        renderAcquiring();
        refreshPermissionStatus();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();

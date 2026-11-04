(function (root) {
  "use strict";

  function frameForPoints(points, width, height) {
    const valid = points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (!valid.length) valid.push({ x: 0, y: 0 }, { x: width, y: height });
    const minX = Math.min(...valid.map(p => p.x)), maxX = Math.max(...valid.map(p => p.x));
    const minY = Math.min(...valid.map(p => p.y)), maxY = Math.max(...valid.map(p => p.y));
    const h = Math.max(280, maxY - minY + 150, (maxX - minX + 100) * 16 / 9);
    const fittedH = Math.min(h, height, width * 16 / 9);
    const fittedW = fittedH * 9 / 16;
    return { x: Math.max(0, Math.min(width-fittedW, (minX+maxX)/2-fittedW/2)),
      y: Math.max(0, Math.min(height-fittedH, (minY+maxY)/2-fittedH/2)), width:fittedW, height:fittedH };
  }

  function smoothFrame(current, target, elapsed = 1 / 30) {
    if (!current) return { ...target };
    const dt = Math.max(0, Math.min(.1, elapsed));
    const pan = 1 - Math.exp(-dt / .22);
    const zoom = 1 - Math.exp(-dt / (target.height > current.height ? .18 : .9));
    const cx = current.x + current.width / 2, cy = current.y + current.height / 2;
    const tx = target.x + target.width / 2, ty = target.y + target.height / 2;
    const x = cx + (tx - cx) * pan, y = cy + (ty - cy) * pan;
    // The target includes padding. Keep its inner safe area inside the smoothed frame.
    const safeWidth = Math.max(0, target.width - 80), safeHeight = Math.max(0, target.height - 120);
    const h = Math.max(current.height + (target.height-current.height)*zoom,
      (Math.abs(tx-x)*2 + safeWidth)*16/9, Math.abs(ty-y)*2 + safeHeight);
    return { x:x-h*9/32, y:y-h/2, width:h*9/16, height:h };
  }

  function zoomFrame(frame, zoom = 1) {
    const factor = Math.max(.5, Math.min(5, Number(zoom) || 1));
    const width = frame.width / factor, height = frame.height / factor;
    return { x:frame.x+(frame.width-width)/2, y:frame.y+(frame.height-height)/2, width, height };
  }

  function open(config) {
    if (document.getElementById("drill-reels-dialog")) return;
    const dialog = document.createElement("dialog");
    dialog.id = "drill-reels-dialog";
    dialog.innerHTML = `<header><strong>Reels · 9:16</strong><button type="button" data-reels-close aria-label="Close Reels">×</button></header>
      <section class="reels-settings"><label>View <select data-reels-view><option value="editor">As in editor</option><option value="horizontal">Side view</option><option value="vertical">Vertical field</option></select></label><label>Framing <select data-reels-framing><option value="follow">Follow players</option><option value="fixed">Exercise area</option><option value="manual">Manual frame</option></select></label><label>Speed <select data-reels-speed><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option><option value="3">3×</option><option value="4">4×</option></select></label><label>Zoom <input data-reels-zoom type="range" min="0.5" max="5" step="0.05" value="1" aria-label="Reels zoom"></label><button type="button" data-reels-reset>Reset frame</button></section>
      <canvas width="1080" height="1920" aria-label="Vertical drill preview"></canvas>
      <video controls playsinline hidden aria-label="Recorded drill video"></video>
      <footer><button type="button" data-reels-play>Play</button><button type="button" data-reels-record>Record video</button><button type="button" data-reels-stop>Stop</button><a data-reels-download hidden>Download video</a></footer>
      <p role="status">1080 × 1920 · Close-up camera · Video without audio</p>`;
    document.body.append(dialog);
    const canvas = dialog.querySelector("canvas"), ctx = canvas.getContext("2d");
    const video = dialog.querySelector("video");
    const status = dialog.querySelector('[role="status"]'), link = dialog.querySelector("a");
    const play = dialog.querySelector("[data-reels-play]"), record = dialog.querySelector("[data-reels-record]");
    let raf = 0, previous = -Infinity, recorder = null, stream = null, url = "", recording = false, closed = false;
    let frame, lastFrameKey = "", introUntil = 0, pendingPlay = false, runId = 0;
    const settings = [...dialog.querySelectorAll("select, input")];
    const view = dialog.querySelector("[data-reels-view]");
    const framing = dialog.querySelector("[data-reels-framing]");
    const zoom = dialog.querySelector("[data-reels-zoom]");
    const speed = dialog.querySelector("[data-reels-speed]");
    speed.value = String([.5,1,1.5,2,3,4].includes(Number(config.initialSpeed)) ? config.initialSpeed : 1);
    let lastDrawTime = null;
    let zoomBase = null, pan = null;
    const cameraTarget = () => zoomFrame(framing.value === "follow" && config.liveFrame ? config.liveFrame() : config.frame(), zoom.value);
    const showDuration = () => { status.textContent = "1080 × 1920 · " + (Number(config.duration || 0)/(Number(speed.value)||1)).toFixed(1) + " s at " + (speed.value || "1") + "× · No audio"; };
    speed.onchange = showDuration;
    const mp4Type = root.MediaRecorder && ["video/mp4;codecs=avc1.42E028", "video/mp4;codecs=avc1.420028", "video/mp4;codecs=avc1"].find(type => MediaRecorder.isTypeSupported(type));
    status.textContent = `1080 × 1920 · ${Number(config.duration || 0).toFixed(2)} s · Close-up camera · No audio`;
    const finishRecording = () => {
      if (recorder && recorder.state !== "inactive") recorder.stop();
      recording = false;
      pendingPlay = false; introUntil = 0; ++runId;
      settings.forEach(control => control.disabled = false);
    };
    const draw = (now = performance.now()) => {
      const elapsed = lastDrawTime === null ? 1/60 : Math.max(0,(now-lastDrawTime)/1000);
      lastDrawTime = now;
      if (framing.value === "follow" && config.liveFrame) {
        const target = cameraTarget();
        frame = smoothFrame(frame, target, elapsed);
      }
      const source = config.capture();
      const size = config.captureSize ? config.captureSize() : {width:source.width, height:source.height};
      // Coordinates are logical stage pixels; bitmap resolution must never change framing.
      const scaleX = source.width / size.width, scaleY = source.height / size.height;
      const fit = Math.min(1, size.width / frame.width, size.height / frame.height);
      frame.width *= fit; frame.height *= fit;
      frame.x = Math.max(0, Math.min(size.width-frame.width, frame.x));
      frame.y = Math.max(0, Math.min(size.height-frame.height, frame.y));
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#080d08"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, frame.x * scaleX, frame.y * scaleY, frame.width * scaleX, frame.height * scaleY,
        0, 0, canvas.width, canvas.height);

    };
    const tick = now => {
      if (closed) return;
      if (now - previous >= 1000 / 60 - .5) {
        previous = now - ((now - previous) % (1000 / 60) || 0);
        try {
          const key = config.frameKey();
          if (key !== lastFrameKey || recording) { draw(now); lastFrameKey = key; }
        } catch (error) {
          status.textContent = "Preview unavailable: " + error.message;
          finishRecording(); config.pause(); return;
        }
        if (pendingPlay && now >= introUntil) {
          pendingPlay = false; introUntil = 0;
          config.play().catch(error => { finishRecording(); status.textContent = error.message; });
        }
        if (!pendingPlay && config.finished()) {
          if (recording) finishRecording();
          settings.forEach(control => control.disabled = false);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const start = async (capture) => {
      if (recording || recorder?.state === "recording") return;
      video.pause(); video.hidden = true; canvas.hidden = false;
      const currentRun = ++runId;
      config.restart(); config.setSpeed?.(Number(speed.value) || 1);
      lastDrawTime = null;
      if (framing.value !== "manual") frame = cameraTarget(); draw();
      if (capture) {
        try {
          const mimeType = mp4Type;
          if (!mimeType) throw Error("MP4 / H.264 export is unavailable in this browser. Open this editor in a current Chrome, Edge or Safari with H.264 recording support. No incompatible WebM will be downloaded.");
          stream = canvas.captureStream(60);
          recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 12000000 });
          const chunks = [];
          recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
          recorder.onstop = () => {
            stream?.getTracks().forEach(track => track.stop()); stream = null;
            play.disabled = false; record.disabled = false;
            if (closed) return;
            if (url) URL.revokeObjectURL(url);
            const blob = new Blob(chunks, { type: mimeType });
            url = URL.createObjectURL(blob); link.href = url;
            link.download = "drill-reels-9x16.mp4";
            video.src = url; video.hidden = false; canvas.hidden = true;
            link.hidden = false; status.textContent = "Video ready · 1080 × 1920 · " + "MP4 / H.264 · 60 fps";
          };
          recorder.onerror = () => { status.textContent = "Recording failed. Please try again."; finishRecording(); config.pause(); };
          await new Promise((resolve, reject) => {
            recorder.onstart = () => {
              recorder.onerror = () => { status.textContent = "Recording failed. Please try again."; finishRecording(); config.pause(); };
              resolve();
            };
            recorder.onerror = () => reject(new Error("Recording could not start."));
            recorder.start(250);
          });
          if (closed || currentRun !== runId) { finishRecording(); return; }
          recording = true; stream.getVideoTracks()[0]?.requestFrame?.();
          play.disabled = true; record.disabled = true; link.hidden = true;
          status.textContent = "Recording… stops at the end of this exercise.";
        } catch (error) { stream?.getTracks().forEach(track => track.stop()); status.textContent = error.message; return; }
      }
      if (closed || currentRun !== runId) return;
      settings.forEach(control => control.disabled = control !== zoom || framing.value !== "follow");
      introUntil = performance.now();
      pendingPlay = true;
      status.textContent = capture ? "Recording close-up animation…" : "Playing close-up animation…";
    };
    view.onchange = () => { config.pause(); config.setView(view.value); frame = framing.value === "follow" && config.liveFrame ? config.liveFrame() : config.frame(); lastFrameKey = ""; zoom.value = "1"; zoomBase = {...frame}; draw(); };
    framing.onchange = () => {
      if (framing.value !== "manual") frame = framing.value === "follow" && config.liveFrame ? config.liveFrame() : config.frame();
      zoom.value = "1"; zoomBase = { ...frame }; draw();
    };
    const beginManual = () => {
      if (recording) return false;
      config.pause(); pendingPlay = false;
      video.pause(); video.hidden = true; canvas.hidden = false;
      settings.forEach(control => control.disabled = false);
      if (framing.value !== "manual") { zoom.value = "1"; zoomBase = { ...frame }; }
      framing.value = "manual";
      return true;
    };
    zoom.oninput = () => {
      const value = Number(zoom.value);
      if (framing.value === "follow") { lastFrameKey = ""; draw(); return; }
      if (!beginManual()) return;
      zoom.value = String(value);
      if (!zoomBase) zoomBase = { ...frame };
      const cx = frame.x + frame.width/2, cy = frame.y + frame.height/2;
      frame.width = zoomBase.width / value; frame.height = zoomBase.height / value;
      frame.x = cx-frame.width/2; frame.y = cy-frame.height/2;
      draw();
    };
    canvas.style.touchAction = "none"; canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", event => {
      if (!beginManual()) return;
      const rect = canvas.getBoundingClientRect();
      pan = { x:event.clientX, y:event.clientY, frame:{...frame}, width:rect.width, height:rect.height };
      canvas.setPointerCapture(event.pointerId); canvas.style.cursor = "grabbing"; event.preventDefault();
    });
    canvas.addEventListener("pointermove", event => {
      if (!pan) return;
      frame.x = pan.frame.x - (event.clientX-pan.x)*pan.frame.width/pan.width;
      frame.y = pan.frame.y - (event.clientY-pan.y)*pan.frame.height/pan.height;
      draw();
    });
    const endPan = () => { pan = null; canvas.style.cursor = "grab"; };
    canvas.addEventListener("pointerup", endPan); canvas.addEventListener("pointercancel", endPan);
    dialog.querySelector("[data-reels-reset]").onclick = () => {
      if (recording) return;
      config.pause(); framing.value = "follow"; zoom.value = "1";
      frame = config.liveFrame ? config.liveFrame() : config.frame(); zoomBase = {...frame}; draw();
    };
    play.onclick = () => start(false); record.onclick = () => start(true);
    dialog.querySelector("[data-reels-stop]").onclick = () => { config.pause(); finishRecording(); };
    dialog.querySelector("[data-reels-close]").onclick = () => dialog.close();
    dialog.addEventListener("keydown", event => event.stopPropagation());
    dialog.addEventListener("close", () => {
      closed = true; cancelAnimationFrame(raf); finishRecording();
      stream?.getTracks().forEach(track => track.stop());
      video.pause(); video.removeAttribute("src"); video.load();
      if (url) URL.revokeObjectURL(url);
      config.restore(); dialog.remove();
    }, { once: true });
    try {
      config.enter(); frame = config.liveFrame ? config.liveFrame() : config.frame(); dialog.showModal(); showDuration(); draw(); raf = requestAnimationFrame(tick);
      if (!mp4Type || !canvas.captureStream) { record.disabled = true; status.textContent = "Preview available. MP4 / H.264 recording is not supported by this browser; use a browser with H.264 recording support."; }
    } catch (error) { config.restore(); dialog.remove(); throw error; }
  }

  root.PACDrillReels = { frameForPoints, open };
  if (typeof module !== "undefined") module.exports = { frameForPoints, smoothFrame, zoomFrame };
})(typeof window !== "undefined" ? window : globalThis);

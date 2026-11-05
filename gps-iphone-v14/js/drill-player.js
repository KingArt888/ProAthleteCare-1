(function () {
  const qs = new URLSearchParams(window.location.search);
  const drillId = qs.get("id") || "";
  const COLORS = { gold: "#ffc72c" };
  const exitLink = document.querySelector(".player-edit");
  if (exitLink && drillId) exitLink.href = `drill-canvas-editor.html?id=${encodeURIComponent(drillId)}`;
  const autoplay = qs.get("autoplay") === "1";
  const silent = qs.get("silent") === "1";
  const externalClock = qs.get('clock') === 'daily' && qs.get('embed') === '1';
  let hydrated=false, externalFrame=null;
  const embed = qs.get("embed") === "1";
  if(qs.get('surface')==='mobile-card')document.documentElement.classList.add('drill-mobile-card');
  const compact = false;
  const FIELD_TEMPLATE_KEY = "pac_drill_field_template";
  const DRAFT_KEY = "pac_drill_editor_draft";
  const STANDARD_FIELD_TEMPLATE_ID = "proathletecare_stadium_v1";
  const DEFAULT_FIELD_ASSET = "../assets/images/drill-field-proathletecare-stadium.png";
  const RUGBY_ACTION_IMAGE_PATHS = {
    scrumSide: "../assets/images/rugby/rugby-scrum-side-sheet.png",
    scrumRear: "../assets/images/rugby/rugby-scrum-rear-sheet.png",
    lineoutLift: "../assets/images/rugby/rugby-lineout-lift-sheet.png"
  };
  const RUGBY_ACTION_SPRITES = {
    scrumSide: {
      frames: [
        { x: 45, y: 80, width: 690, height: 330 },
        { x: 820, y: 80, width: 680, height: 330 },
        { x: 55, y: 570, width: 690, height: 300 },
        { x: 850, y: 570, width: 650, height: 300 }
      ],
      sequence: [0, 1, 2, 3, 2, 1],
      width: 260,
      height: 118
    },
    scrumRear: {
      frames: [
        { x: 850, y: 140, width: 620, height: 330 },
        { x: 80, y: 590, width: 650, height: 300 },
        { x: 910, y: 590, width: 560, height: 300 }
      ],
      sequence: [0, 1, 2, 1],
      width: 230,
      height: 124
    },
    lineoutLift: {
      frames: [
        { x: 220, y: 20, width: 520, height: 490 },
        { x: 960, y: 20, width: 530, height: 490 },
        { x: 285, y: 520, width: 500, height: 490 },
        { x: 960, y: 520, width: 540, height: 490 }
      ],
      sequence: [0, 1, 2, 3, 2, 1, 0],
      width: 150,
      height: 214
    }
  };
  const RUGBY_ACTION_FIELD_SCALE = .52;
  const DEFAULT_STAGE = { width: 1536, height: 1024 };
  const FIELD_METRICS = {
    lengthM: 105,
    widthM: 68,
    // Calibrated to the center of the white pitch boundary lines in
    // assets/images/drill-field-proathletecare-stadium.png (1536 x 1024).
    pitchRect: { x: 0.0947265625, y: 0.13623046875, w: 0.8098958333333334, h: 0.68017578125 }
  };
  const FIELD_AXIS_CALIBRATION = {
    x: [
      { n: 0.0947265625, m: 0 },
      { n: 0.13053385416666666, m: 5.5 },
      { n: 0.20475260416666666, m: 16.5 },
      { n: 0.4990234375, m: 52.5 },
      { n: 0.7900390625, m: 88.5 },
      { n: 0.8665364583333334, m: 99.5 },
      { n: 0.9046223958333334, m: 105 }
    ],
    y: [
      { n: 0.13623046875, m: 0 },
      { n: 0.26123046875, m: 13.84 },
      { n: 0.36865234375, m: 24.84 },
      { n: 0.476318359375, m: 34 },
      { n: 0.56298828125, m: 43.16 },
      { n: 0.67431640625, m: 54.16 },
      { n: 0.81640625, m: 68 }
    ]
  };
  const INVENTORY_KINDS = ["coach", "player", "cone", "flat-cone", "marker-triangle", "pole", "mannequin", "hurdle", "ladder", "ball", "rugby-goal-posts", "tackle-shield", "tackle-bag", "kicking-tee", "goal", "bosu", "balance-disc", "rebounder", "gym-ball", "mini-goal", "rebounder-premium", "tactical-board-marker", "ball-basket", "cone-stack", "hurdle-low", "hurdle-medium", "hurdle-high", "speed-ring", "speed-gate", "parachute", "sled", "sled-with-strap", "agility-pole-set", "reaction-light", "sprint-cord", "trap-bar", "barbell", "weight-plate", "dumbbell-pair", "kettlebell", "plyo-box", "medicine-ball", "cable-handle", "trx", "resistance-band", "battle-rope", "nordic-bench", "slant-board", "decline-board", "calf-raise-block", "isometric-strap", "eccentric-flywheel", "hamstring-slider", "slider-disc", "ankle-band", "mini-band", "long-resistance-band", "foam-roller", "massage-ball", "mat", "balance-pad", "massage-gun", "gps-vest", "heart-rate-sensor", "watch-tracker", "timing-gate-tripod", "training-bib", "tablet-tactics"];
  const MOVEMENT_KINDS = ["sprint", "curve", "arrow", "pass", "touch", "change-direction", "acceleration", "deceleration", "recovery", "accel-zone", "decel-zone", "hspd", "turn360", "jump", "shot", "jog", "roll", "pause", "circle-run"];
  const COMPACT_EQUIPMENT_KINDS = new Set(["hurdle", "hurdle-low", "hurdle-medium", "hurdle-high", "bosu", "speed-ring"]);
  const PLAYER_EQUIPMENT_INTERACTION_KINDS = new Set([
    "ladder", "speed-ring", "bosu", "hurdle", "hurdle-low", "hurdle-medium", "hurdle-high",
    "barbell", "trap-bar", "tackle-shield", "tackle-bag", "plyo-box", "medicine-ball",
    "trx", "resistance-band", "long-resistance-band", "battle-rope"
  ]);
  const PLAYER_TOWED_EQUIPMENT_KINDS = new Set(["parachute", "sled", "sled-with-strap"]);
  const PLAYER_RUN_FRAME_PATHS = {
    A: "../assets/images/players/player_run_A.png",
    B: "../assets/images/players/player_run_B.png",
    C: "../assets/images/players/player_run_C.png",
    D: "../assets/images/players/player_run_D.png"
  };
  const PLAYER_RUN_FRAME_SEQUENCE = ["A", "B", "C", "D"];
  const state = {
    stage: null,
    layers: {},
    objects: [],
    equipmentInteractionHomes: new Map(),
    duration: 30,
    currentTime: 0,
    playing: false,
    paused: false,
    audioContext: null,
    startAudioTime: 0,
    startPosition: 0,
    played: new Set(),
    fieldImageData: "",
    baseStage: { ...DEFAULT_STAGE },
    measurements: [],
    phaseZones: [],
    motionClips: [],
    sport: "football", fieldOrientation: "horizontal", attackDirection: "forward",
    rugbyActionImages: {}, rugbyHiddenPlayerIds: new Set(),
    autoplayStarted: false,
    playerSpriteImages: {},
    playerSpriteImagesReady: false,
    focusMode: false,
    cameraFrame: { x: 0, y: 0, scale: 1 }
  };
  let drillUnsubscribe = null;

  const $ = (id) => document.getElementById(id);

  function size() {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  function initStage() {
    const s = size();
    state.stage = new Konva.Stage({ container: "player-konva-stage", width: s.width, height: s.height });
    state.layers.field = new Konva.Layer();
    state.layers.phaseZones = new Konva.Layer();
    state.layers.objects = new Konva.Layer();
    state.layers.ui = new Konva.Layer();
    state.stage.add(state.layers.field, state.layers.phaseZones, state.layers.objects, state.layers.ui);
    drawField();
    window.addEventListener("resize", () => {
      const oldScale = sceneTransform().scale;
      const positions = state.objects.map(item => ({item, point: screenToBasePoint(item.node.position())}));
      const next = size();
      state.stage.size(next);
      const ratio = sceneTransform().scale / oldScale;
      positions.forEach(({item,point}) => {
        item.node.position(baseToScreenPoint(point));
        item.node.scale({x:item.node.scaleX()*ratio,y:item.node.scaleY()*ratio});
        item.node.setAttr("pacBaseScaleX", Number(item.node.getAttr("pacBaseScaleX"))*ratio);
        item.node.setAttr("pacBaseScaleY", Number(item.node.getAttr("pacBaseScaleY"))*ratio);
      });
      resetFocusCamera();
      drawField();
      renderPhaseZones();
      scrubTo(state.currentTime);
    });
  }

  function cameraLayers() {
    return [state.layers.field, state.layers.phaseZones, state.layers.objects, state.layers.ui].filter(Boolean);
  }

  function setCameraTransform(frame = { x: 0, y: 0, scale: 1 }) {
    cameraLayers().forEach((layer) => {
      layer.scale({ x: frame.scale, y: frame.scale });
      layer.position({ x: frame.x, y: frame.y });
      layer.batchDraw();
    });
  }

  function resetFocusCamera() {
    state.cameraFrame = { x: 0, y: 0, scale: 1 };
    setCameraTransform(state.cameraFrame);
  }

  function activeFocusPlayerIds(sec = state.currentTime) {
    const active = (state.motionClips || [])
      .filter((clip) => {
        const item = objectById(clip.objectId);
        if (item?.meta?.kind !== "player") return false;
        const start = Number(clip.start || 0);
        const end = start + Math.max(.1, Number(clip.duration || 1));
        return sec >= start && sec <= end;
      })
      .map((clip) => clip.objectId);
    const ids = active.length ? active : state.objects.filter((item) => item?.meta?.kind === "player").map((item) => item.meta.id);
    return [...new Set(ids)].filter(Boolean);
  }

  function focusCameraPoints(sec = state.currentTime) {
    const points = [];
    activeFocusPlayerIds(sec).forEach((id) => {
      const item = objectById(id);
      if (!item?.node) return;
      points.push({ x: item.node.x(), y: item.node.y() });
      const active = (state.motionClips || [])
        .filter((clip) => clip.objectId === id && Array.isArray(clip.points) && clip.points.length > 1)
        .find((clip) => {
          const start = Number(clip.start || 0);
          const end = start + Math.max(.1, Number(clip.duration || 1));
          return sec >= start && sec <= end;
        });
      if (active) {
        points.push(baseToScreenPoint(pointForMotionClip(active, sec)));
        points.push(baseToScreenPoint(pointForMotionClip(active, Math.min(sec + .55, Number(active.start || 0) + Math.max(.1, Number(active.duration || 1))))));
      }
    });
    return points;
  }

  function updateFocusCamera(options = {}) {
    if (!state.stage) return;
    if (!state.focusMode) {
      resetFocusCamera();
      return;
    }
    const points = focusCameraPoints(state.currentTime);
    if (!points.length) {
      resetFocusCamera();
      return;
    }
    const stageW = state.stage.width();
    const stageH = state.stage.height();
    const minX = Math.min(...points.map((p) => Number(p.x || 0)));
    const maxX = Math.max(...points.map((p) => Number(p.x || 0)));
    const minY = Math.min(...points.map((p) => Number(p.y || 0)));
    const maxY = Math.max(...points.map((p) => Number(p.y || 0)));
    const count = activeFocusPlayerIds(state.currentTime).length;
    const padding = count <= 1 ? Math.min(stageW, stageH) * .18 : Math.min(stageW, stageH) * .13;
    const boundsW = Math.max(180, maxX - minX + padding * 2);
    const boundsH = Math.max(140, maxY - minY + padding * 2);
    const rawScale = Math.min(stageW / boundsW, stageH / boundsH);
    const targetScale = clamp(rawScale, 1, window.innerWidth <= 700 ? 2.85 : 2.35);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const minLayerX = stageW - stageW * targetScale;
    const minLayerY = stageH - stageH * targetScale;
    const targetX = clamp(stageW / 2 - centerX * targetScale, minLayerX, 0);
    const targetY = clamp(stageH / 2 - centerY * targetScale, minLayerY, 0);
    const current = state.cameraFrame || { x: 0, y: 0, scale: 1 };
    const t = options.immediate ? 1 : .16;
    const next = {
      x: current.x + (targetX - current.x) * t,
      y: current.y + (targetY - current.y) * t,
      scale: current.scale + (targetScale - current.scale) * t
    };
    state.cameraFrame = next;
    setCameraTransform(next);
  }

  function drawField() {
    const l = state.layers.field;
    l.destroyChildren();
    const w = state.stage.width();
    const h = state.stage.height();
    l.add(new Konva.Rect({ x: 0, y: 0, width: w, height: h, fill: "#000" }));
    const t = sceneTransform();
    l.add(new Konva.Rect({ x: t.x, y: t.y, width: state.baseStage.width * t.scale, height: state.baseStage.height * t.scale, fill: "#000" }));
    addFieldImage(state.fieldImageData || DEFAULT_FIELD_ASSET);
    l.draw();
  }

  function drawFallbackFieldLines(layer, t) {
    const bw = state.baseStage.width;
    const bh = state.baseStage.height;
    const sx = (x) => t.x + x * t.scale;
    const sy = (y) => t.y + y * t.scale;
    const line = { stroke: "rgba(255,255,255,.72)", strokeWidth: 2 };
    layer.add(new Konva.Rect({ x: sx(14), y: sy(70), width: (bw - 28) * t.scale, height: (bh - 150) * t.scale, ...line }));
    layer.add(new Konva.Line({ points: [sx(bw / 2), sy(70), sx(bw / 2), sy(bh - 80)], ...line }));
  }

  function sceneTransform(base = state.baseStage) {
    const vertical = state.fieldOrientation === "vertical";
    const width = vertical ? base.height : base.width, height = vertical ? base.width : base.height;
    const scale = Math.min(state.stage.width() / width, state.stage.height() / height);
    return {
      scale,
      x: (state.stage.width() - width * scale) / 2,
      y: (state.stage.height() - height * scale) / 2
    };
  }

  let fieldImageRequest = 0;
  function addFieldImage(dataUrl) {
    const request = ++fieldImageRequest;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (request !== fieldImageRequest) return;
      const w = state.stage.width();
      const h = state.stage.height();
      const t = sceneTransform();
      const base = state.baseStage;
      const contain = Math.min(base.width / img.width, base.height / img.height);
      const iw = img.width * contain * t.scale;
      const ih = img.height * contain * t.scale;
      state.layers.field.add(new Konva.Image({
        image: img,
        ...baseToScreenPoint({x: (base.width - iw / t.scale) / 2, y: (base.height - ih / t.scale) / 2}),
        rotation: playerFieldAngle(),
        width: iw,
        height: ih,
        opacity: .96,
        listening: false
      }));
      state.layers.field.batchDraw();
    };
    img.src = dataUrl;
  }

  function notifyMedia(status, data=null) {
    if (embed && window.parent !== window) window.parent.postMessage({ type: "pac:drill-media", status, drillId, playerSeriesTotals:data?window.PACExerciseTask?.seriesTotals(data):null }, location.origin);
  }

  async function load() {
    if (!drillId) {
      $("player-title").textContent = "No drill selected";
      notifyMedia("error");
      return;
    }
    $("player-title").textContent = "Checking access...";
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        if (drillUnsubscribe) {
          drillUnsubscribe();
          drillUnsubscribe = null;
        }
        $("player-title").textContent = "Sign in required";
        notifyMedia("error");
        $("player-phase").textContent = "LOGIN";
        $("player-next").textContent = "Open ProAthleteCare and sign in to view this drill.";
        return;
      }
      subscribeDrill();
    });
  }

  function subscribeDrill() {
    if (drillUnsubscribe) {
      drillUnsubscribe();
      drillUnsubscribe = null;
    }
    drillUnsubscribe = firebase.firestore().collection("drill_canvases").doc(drillId).onSnapshot((snap) => {
      if (!snap.exists) {
        if (!hydrateLocalDrill()) notifyMedia("error");
        return;
      }
      hydrate(snap.data() || {});
    }, (err) => {
      console.warn("[PAC Drill Player] Cannot load drill:", err);
      if (!hydrateLocalDrill()) {
        $("player-title").textContent = "Drill cannot load";
        notifyMedia("error");
        $("player-phase").textContent = "CHECK SAVE";
        $("player-next").textContent = "Drill data was not available for this athlete/player.";
      }
    });
  }

  function hydrateLocalDrill() {
    const local = findLocalDrill(drillId);
    if (!local) return false;
    hydrate(local);
    $("player-next").textContent = "Loaded from local Exercise Library.";
    return true;
  }

  function findLocalDrill(id) {
    try {
      const parsed = window.PACDrillLocalStorage ? window.PACDrillLocalStorage.read() : JSON.parse(localStorage.getItem("pac_imported_drill_library") || "[]");
      const list = Array.isArray(parsed) ? parsed : [];
      const wanted = String(id || "");
      return list.find((item) => String(item?.id || item?.drillId || item?.exerciseObject?.drillId || "") === wanted) || null;
    } catch (err) {
      console.warn("[PAC Drill Player] Local drill lookup failed:", err?.message || err);
      return null;
    }
  }

  function hydrate(data) {
    $("player-title").textContent = data.title || "Football drill";
    state.sport = resolveSavedSport(data);
    state.fieldOrientation = data.fieldOrientation === "vertical" ? "vertical" : "horizontal";
    state.attackDirection = data.attackDirection === "reverse" ? "reverse" : "forward";
    state.duration = Math.max(.1, Number(data.duration || data.timingEngine?.duration || 30) || 30);
    state.fieldImageData = resolveFieldImage(data);
    loadRugbyActionImages();
    state.baseStage = data.stage || { ...DEFAULT_STAGE };
    state.measurements = Array.isArray(data.measurements) ? data.measurements.map((m) => ({ ...m })) : [];
    state.phaseZones = Array.isArray(data.phaseZones) ? data.phaseZones.map((zone) => ({ ...zone, bounds: { ...(zone.bounds || {}) }, titleSettings: { ...(zone.titleSettings || {}) } })) : [];
    state.motionClips = Array.isArray(data.motionClips) ? data.motionClips.map((clip) => ({ ...clip, points: (clip.points || []).map((p) => ({ ...p })) })) : [];
    resetFocusCamera();
    drawField();
    renderPhaseZones();
    $("player-scrub").max = String(state.duration);
    state.layers.objects.destroyChildren();
    state.objects = [];
    const base = state.baseStage;
    const t = sceneTransform(base);
    (data.objects || []).forEach((item) => {
      const node = Konva.Node.create(item.konva);
      const meta = item.meta || {};
      const compactKind = String(meta.inventoryKind || meta.kind || "");
      if (COMPACT_EQUIPMENT_KINDS.has(compactKind) && Number(meta.compactEquipmentScaleVersion || 0) < 1) {
        node.scaleX((Number(node.scaleX?.()) || 1) * .5);
        node.scaleY((Number(node.scaleY?.()) || 1) * .5);
        meta.compactEquipmentScaleVersion = 1;
      }
      repairPlayerNode(node, meta);
      node.scaleX((node.scaleX() || 1) * t.scale);
      node.scaleY((node.scaleY() || 1) * t.scale);
      node.position(baseToScreenPoint({ x: node.x() || 0, y: node.y() || 0 }));
      node.rotation(Number(node.rotation() || 0) + playerFieldAngle());
      const number = node.findOne?.(".pac-player-number-overlay");
      if (number) number.rotation(-node.rotation());
      if (meta.kind === "text") node.rotation(Number(node.rotation() || 0) - Number(node.getAttr("pacViewTextRotation") || 0) - playerFieldAngle());
      node.listening(false);
      node.setAttr("pacBaseDash", node.dash ? [...(node.dash() || [])] : []);
      node.setAttr("pacBaseOpacity", node.opacity ? node.opacity() : 1);
      node.setAttr("pacBaseRotation", node.rotation ? node.rotation() : 0);
      node.setAttr("pacBaseScaleX", node.scaleX ? node.scaleX() : 1);
      node.setAttr("pacBaseScaleY", node.scaleY ? node.scaleY() : 1);
      state.layers.objects.add(node);
      state.objects.push({ node, meta });
    });
    state.objects
      .filter((item) => item?.meta?.kind === "ball" && item.node?.moveToBottom)
      .forEach((item) => item.node.moveToBottom());
    state.layers.objects.draw();
    updateNextPreview();
    scrubTo(0);
    hydrated=true;
    if(externalClock)applyExternalClock(externalFrame||{state:'ready'});
    notifyMedia("ready",data);
    if (autoplay) {
      state.autoplayStarted = true;
      setTimeout(() => {
        if (!state.playing) play();
      }, 120);
    }
  }

  function resolveSavedSport(data = {}) {
    const declared = [data.sport, data.fieldLayout?.sport, data.exerciseStructure?.sport, data.exerciseObject?.sport]
      .map((value) => String(value || '').toLowerCase()).find((value) => value === 'rugby' || value === 'football');
    if (declared) return declared;
    const layouts = [data, data.fieldLayout, data.exerciseStructure?.fieldLayout, data.exerciseObject?.fieldLayout].filter(Boolean);
    return layouts.some((layout) => String(layout.fieldTemplateId || layout.templateId || '').includes('rugby')
      || String(layout.fieldImageUrl || layout.imageUrl || '').includes('drill-field-proathletecare-rugby')) ? 'rugby' : 'football';
  }

  function resolveFieldImage(data = {}) {
    const asset = resolveSavedSport(data) === 'rugby'
      ? '../assets/images/drill-field-proathletecare-rugby.png' : DEFAULT_FIELD_ASSET;
    const saved = data.fieldImageUrl || data.fieldLayout?.imageUrl
      || data.exerciseStructure?.fieldLayout?.imageUrl || data.exerciseObject?.fieldLayout?.imageUrl
      || data.fieldImageData || data.fieldLayout?.imageData
      || data.exerciseStructure?.fieldLayout?.imageData || data.exerciseObject?.fieldLayout?.imageData;
    if (!saved || /drill-field-proathletecare-(stadium|rugby)\.png(?:[?#].*)?$/.test(String(saved))) return asset;
    return saved;
  }

  function resolveLocalFieldImage() {
    try {
      const template = JSON.parse(localStorage.getItem(FIELD_TEMPLATE_KEY) || "null");
      const fromTemplate = template?.fieldImageUrl || template?.fieldImageData || "";
      if (fromTemplate) return fromTemplate;
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      return draft?.fieldImageUrl || draft?.fieldImageData || draft?.fieldLayout?.imageUrl || "";
    } catch (err) {
      console.warn("[PAC Drill Player] Local field fallback failed:", err);
      return "";
    }
  }

  function playerKitFrame(meta, key) {
    const variant = meta.customShirtColor || meta.teamVariant === "yellow" ? "yellow" : "default";
    const image = state.playerSpriteImages[variant === "yellow" ? "yellow:"+key : key];
    return window.PACPlayerKit?.frame(image,meta.customShirtColor,key,variant)
      || state.playerSpriteImages[key] || state.playerSpriteImages.A || null;
  }

  function repairPlayerNode(node, meta = {}) {
    if (!node?.find || String(meta.kind || "") !== "player") return;
    window.PACPlayerKit?.styleCircle(node,meta);
    const animatedImage = node.findOne(".player-animated-frame");
    if (animatedImage && state.playerSpriteImagesReady) {
      const key = String(node.getAttr("pacAnimFrameKey") || "A");
      animatedImage.image(playerKitFrame(meta,key));
      window.PACPlayerKit?.styleBadge(node,meta);
      node.find(".pac-player-render-fallback").forEach((child) => child.destroy());
      return;
    }
    const hasGeneratedBody = node.find(".player-layer-body").length || node.find(".player-shirt").length;
    const imageMissing = animatedImage && !animatedImage.image?.();
    if (hasGeneratedBody && !imageMissing) return;
    node.find(".pac-player-render-fallback").forEach((child) => child.destroy());
    const model = normalizePlayerModel(meta);
    const fallback = createPlayerFallbackSprite(model);
    node.add(fallback);
    fallback.moveToBottom();
  }

  function loadPlayerSpriteImages() {
    const entries = [...Object.entries(PLAYER_RUN_FRAME_PATHS), ...Object.entries(PLAYER_RUN_FRAME_PATHS).map(([key,src]) => ["yellow:"+key,src.replace("player_run_","player_yellow_run_")])];
    let loaded = 0;
    entries.forEach(([frameKey, src]) => {
      const image = new Image();
      image.onload = () => {
        state.playerSpriteImages[frameKey] = image;
        loaded += 1;
        if (loaded === entries.length) {
          state.playerSpriteImagesReady = true;
          refreshPlayerSprites();
        }
      };
      image.onerror = () => {
        loaded += 1;
        if (loaded === entries.length) refreshPlayerSprites();
      };
      image.src = src;
    });
  }

  function refreshPlayerSprites() {
    state.objects.forEach(({ node, meta }) => repairPlayerNode(node, meta));
    state.layers.objects?.batchDraw();
  }

  function normalizePlayerModel(meta = {}) {
    const role = String(meta.role || meta.playerRole || meta.smartRole || "ATTACKER").toUpperCase();
    const attacker = role === "ATTACKER";
    const defender = role === "DEFENDER";
    const number = Math.max(1, Math.min(99, Math.round(Number(meta.number || meta.playerNumber || meta.jerseyNumber || 7) || 7)));
    return {
      number,
      shirtColor: meta.shirtColor || meta.jerseyColor || (defender ? "#ffffff" : attacker ? "#080808" : "#4da3ff"),
      shortsColor: meta.shortsColor || (defender ? "#ffffff" : "#080808"),
      socksColor: meta.socksColor || (defender ? "#4da3ff" : "#ffc72c"),
      outlineColor: meta.outlineColor || (defender ? "#4da3ff" : "#ffc72c"),
      numberColor: meta.numberColor || (defender ? "#101010" : "#ffc72c")
    };
  }

  function createPlayerFallbackSprite(model = {}) {
    const g = new Konva.Group({ name: "pac-player-render-fallback", listening: false });
    const outline = model.outlineColor || "#ffc72c";
    const skin = "#b87952";
    g.add(new Konva.Ellipse({ x: 0, y: 17, radiusX: 25, radiusY: 8, fill: "rgba(0,0,0,.36)", listening: false }));
    g.add(new Konva.Line({ name: "player-run-arm-a", points: [-15, 4, -27, 16, -38, 20], stroke: skin, strokeWidth: 6, lineCap: "round", listening: false }));
    g.add(new Konva.Line({ name: "player-run-arm-b", points: [15, 4, 27, 16, 38, 20], stroke: skin, strokeWidth: 6, lineCap: "round", listening: false }));
    g.add(new Konva.Line({ name: "player-run-leg-a", points: [-9, 17, -18, 36, -24, 48], stroke: skin, strokeWidth: 7, lineCap: "round", listening: false }));
    g.add(new Konva.Line({ name: "player-run-leg-b", points: [9, 17, 18, 36, 24, 48], stroke: skin, strokeWidth: 7, lineCap: "round", listening: false }));
    g.add(new Konva.Line({ points: [-18, 37, -25, 50], stroke: model.socksColor, strokeWidth: 4, lineCap: "round", listening: false }));
    g.add(new Konva.Line({ points: [18, 37, 25, 50], stroke: model.socksColor, strokeWidth: 4, lineCap: "round", listening: false }));
    g.add(new Konva.Line({
      points: [-22, -25, 22, -25, 28, 2, 14, 20, -14, 20, -28, 2],
      closed: true,
      fill: model.shirtColor,
      stroke: outline,
      strokeWidth: 2.2,
      shadowColor: outline,
      shadowBlur: 8,
      shadowOpacity: .24,
      lineJoin: "round",
      listening: false
    }));
    g.add(new Konva.Line({
      points: [-15, 17, 15, 17, 22, 33, -22, 33],
      closed: true,
      fill: model.shortsColor,
      stroke: "rgba(0,0,0,.82)",
      strokeWidth: 1.5,
      lineJoin: "round",
      listening: false
    }));
    g.add(new Konva.Circle({ x: 0, y: -39, radius: 12, fill: skin, stroke: "rgba(0,0,0,.74)", strokeWidth: 1.4, listening: false }));
    g.add(new Konva.Text({
      name: "player-number",
      x: -13,
      y: -10,
      width: 26,
      align: "center",
      text: String(model.number || 7),
      fill: model.numberColor,
      fontSize: 17,
      fontStyle: "900",
      fontFamily: "Inter, Arial, sans-serif",
      shadowColor: "#000",
      shadowBlur: 2,
      shadowOpacity: .55,
      listening: false
    }));
    return g;
  }

  function animate(meta, node, sec) {
    const kind = String(meta.kind || "");
    const isInventory = INVENTORY_KINDS.includes(kind);
    const isText = kind === "text";
    const isMovement = MOVEMENT_KINDS.includes(kind) || node.className === "Arrow" || node.className === "Line";
    const isCueOrEvent = kind.startsWith("cue_") || kind.startsWith("event_");
    const start = Number(meta.start || 0);
    const duration = Math.max(.1, Number(meta.duration || 0));
    const end = start + duration;
    const active = sec >= start && sec <= end;

    if (isInventory || isText) {
      node.visible(true);
      node.opacity(node.getAttr("pacBaseOpacity") || 1);
      return;
    }

    const local = Math.max(0, Math.min(1, (sec - start) / duration));
    if (isMovement) {
      node.visible(active);
      if (meta.arrowStyle === "circle-run" || meta.animation === "footsteps") {
        animateCircleRunFootprints(node, meta, local, active);
        return;
      }
      if (!active) {
        revealArrowPath(node, meta, 0);
        return;
      }
      revealArrowPath(node, meta, sec >= end ? 1 : local);
      if (node.className === "Arrow" || node.className === "Line") return;
    } else if (isCueOrEvent) {
      node.visible(active);
      if (!active) return;
    } else {
      node.visible(true);
    }
    if (meta.animation === "pulse") node.opacity(.55 + Math.sin(local * Math.PI * 5) * .35);
    if (["flow", "moving_dash", "sprint"].includes(meta.animation) && node.dashOffset) node.dashOffset(-local * 48);
    if (String(meta.kind || "").startsWith("cue_")) showPhase(meta.cueText || meta.label);
  }

  function animateCircleRunFootprints(node, meta, progress, active) {
    if (!node?.find) return;
    const steps = node.find(".circle-run-footprint");
    const count = Math.max(1, steps.length || 1);
    steps.forEach((foot, index) => {
      const age = (Math.max(0, Math.min(1, progress || 0)) - (index / count) + 1) % 1;
      const lit = active && age < .34;
      const fade = lit ? 1 - (age / .34) : 0;
      foot.opacity(.12 + fade * .88);
      foot.scale({ x: .88 + fade * .18, y: .88 + fade * .18 });
      if (foot.shadowBlur) foot.shadowBlur(3 + fade * 8);
    });
    const ring = node.findOne(".circle-run-route") || node.findOne("Circle");
    if (ring?.dashOffset) ring.dashOffset(-Math.max(0, Math.min(1, progress || 0)) * 95);
    if (ring?.shadowBlur) ring.shadowBlur((Number(meta.glow) || 8) + Math.sin((progress || 0) * Math.PI * 2) * 4);
  }

  function revealArrowPath(node, meta, progress) {
    if (node.className !== "Arrow" && node.className !== "Line") return;
    const total = approximateLineLength(node.points ? node.points() : []);
    if (!total) return;
    const visible = Math.max(.01, total * Math.max(0, Math.min(1, progress)));
    const baseDash = node.getAttr("pacBaseDash") || [];
    if (progress >= 1) {
      node.dash(baseDash);
      node.dashOffset(0);
      node.opacity(node.getAttr("pacBaseOpacity") || 1);
      return;
    }
    node.opacity(Math.min(1, .25 + progress * .85));
    node.dash([visible, total + 12]);
    node.dashOffset(total - visible);
  }

  function approximateLineLength(points) {
    let length = 0;
    for (let i = 2; i < points.length; i += 2) {
      length += Math.hypot(points[i] - points[i - 2], points[i + 1] - points[i - 1]);
    }
    return length;
  }

  function play() {
    if(externalClock&&externalFrame?.state!=='ready')return;
    if (state.playing && !state.paused) return;
    cancelAnimationFrame(state.playbackFrame || 0);
    if (state.currentTime >= state.duration) scrubTo(0);
    try { if(!silent&&!externalClock)ensureAudio(); } catch (err) { console.warn("[PAC Drill Player] Audio start skipped:", err?.message || err); }
    state.playing = true;
    state.paused = false;
    state.played = new Set();
    state.startPosition = state.currentTime;
    state.startAudioTime = masterClock();
    tick();
  }

  function masterClock() {
    return performance.now() / 1000;
  }

  function tick() {
    if (!state.playing || state.paused) return;
    const now = masterClock();
    const rate = externalClock&&externalFrame?.state==='ready'?2:Number($('player-speed')?.value||1);
    scrubTo(state.startPosition + (now - state.startAudioTime) * rate, true);
    if (state.currentTime < state.duration) state.playbackFrame = requestAnimationFrame(tick);
    else if (embed && (autoplay || (externalClock&&externalFrame?.state==='ready'))) replay(true);
    else replay(false);
  }

  function pause() {
    cancelAnimationFrame(state.playbackFrame || 0);
    state.paused = true;
    try { speechSynthesis.cancel(); } catch (_) {}
  }

  function replay(shouldPlay = true) {
    cancelAnimationFrame(state.playbackFrame || 0);
    state.playing = false;
    state.paused = false;
    scrubTo(0);
    if (shouldPlay) play();
  }

  function applyExternalClock(value){
    externalFrame=value;if(!hydrated)return;
    // Preview is visual only. Once recording starts, Daily owns every frame.
    if(value.state==='ready'){play();return;}
    cancelAnimationFrame(state.playbackFrame||0);
    state.playing=false;state.paused=true;
    const seconds=Number(value.seconds);
    if(Number.isFinite(seconds))scrubTo(Math.max(0,Math.min(seconds,state.duration)),false);
  }
  window.addEventListener('message',event=>{
    if(!externalClock||event.source!==window.parent||event.origin!==location.origin||event.data?.type!=='pac:daily-clock')return;
    applyExternalClock(event.data);
  });

  function scrubTo(sec, fromPlay = false) {
    if (state.focusMode) setCameraTransform({ x: 0, y: 0, scale: 1 });
    state.currentTime = Math.max(0, Math.min(Number(sec) || 0, state.duration));
    $("player-countdown").textContent = state.currentTime.toFixed(2);
    if (document.activeElement !== $("player-scrub")) $("player-scrub").value = String(state.currentTime);
    state.layers.ui.destroyChildren();
    state.objects.forEach(({ node, meta }) => {
      animate(meta, node, state.currentTime);
      if (fromPlay) triggerAudio(meta);
    });
    applyMotionClipsAtTime(state.currentTime);
    renderRugbyPlayback(state.currentTime);
    renderPhaseZones();
    renderSavedMeasurements();
    renderArrowCodes();
    updateNextPreview();
    updateFocusCamera({ immediate: !fromPlay });
    state.layers.objects.batchDraw();
    state.layers.ui.batchDraw();
  }

  function renderPhaseZones() {
    const layer = state.layers.phaseZones;
    if (!layer) return;
    layer.destroyChildren();
    (state.phaseZones || []).forEach((zone) => {
      if (zone.style?.showInPlayer === false) return;
      const b = screenZoneBounds(zone.bounds || {});
      const active = isPhaseZoneActive(zone, state.currentTime);
      const color = zone.style?.color || "#b8e65d";
      layer.add(new Konva.Rect({
        ...b,
        fill: active ? "rgba(8,43,15,.54)" : "rgba(0,22,8,.38)",
        stroke: active ? "#ffc72c" : "rgba(255,255,255,.16)",
        strokeWidth: active ? 2.6 : 1.2,
        dash: active ? [] : [16, 12],
        cornerRadius: 0,
        listening: false,
        shadowColor: "#ffc72c",
        shadowBlur: active ? 18 : 0,
        shadowOpacity: .36
      }));
      const ts = zone.titleSettings || {};
      const titlePos = baseToScreenPoint({
        x: Number.isFinite(ts.x) ? ts.x : (zone.bounds?.x || 0) + Number(zone.bounds?.width || 0) * .04,
        y: Number.isFinite(ts.y) ? ts.y : (zone.bounds?.y || 0) + Number(zone.bounds?.height || 0) * .62
      });
      const sceneScale = sceneTransform().scale;
      const scale = sceneScale * Math.max(.55, Number(ts.scale || 1));
      const fontSize = Math.round(Math.min(64, Math.max(28, b.height * .34)) * Math.max(.55, Number(ts.scale || 1)));
      const titleWidth = Math.max(180, b.width * .92);
      layer.add(new Konva.Text({
        x: titlePos.x,
        y: titlePos.y,
        text: String(zone.title || "").toUpperCase(),
        fill: color,
        opacity: .78,
        width: titleWidth,
        align: "center",
        fontSize,
        fontStyle: "900",
        fontFamily: "Inter, Arial, sans-serif",
        shadowColor: "#0b2105",
        shadowBlur: 10 * sceneScale,
        shadowOpacity: .78,
        listening: false
      }));
      layer.add(new Konva.Text({
        x: titlePos.x,
        y: titlePos.y + Math.round(fontSize * .84),
        text: String(zone.phaseLabel || "").toUpperCase(),
        fill: "rgba(184,230,93,.72)",
        width: titleWidth,
        align: "center",
        fontSize: Math.round(fontSize * .34),
        fontStyle: "900",
        fontFamily: "Inter, Arial, sans-serif",
        listening: false
      }));
    });
    layer.batchDraw();
  }

  function screenZoneBounds(bounds = {}) {
    const topLeft = baseToScreenPoint({ x: Number(bounds.x || 0), y: Number(bounds.y || 0) });
    const bottomRight = baseToScreenPoint({ x: Number(bounds.x || 0) + Number(bounds.width || 0), y: Number(bounds.y || 0) + Number(bounds.height || 0) });
    return { x: Math.min(topLeft.x,bottomRight.x), y: Math.min(topLeft.y,bottomRight.y), width: Math.abs(bottomRight.x-topLeft.x), height: Math.abs(bottomRight.y-topLeft.y) };
  }

  function isPhaseZoneActive(zone = {}, sec = state.currentTime) {
    const start = Number(zone.start || 0);
    const duration = Math.max(.1, Number(zone.duration || 0));
    return Number(sec || 0) >= start && Number(sec || 0) <= start + duration;
  }

  function equipmentInteractionKind(item = {}) {
    return String(item?.meta?.inventoryKind || item?.meta?.kind || "").toLowerCase();
  }

  function interactionThreshold(kind = "") {
    if (kind === "ladder") return 78;
    if (kind === "speed-ring") return 46;
    if (kind === "bosu") return 42;
    if (kind === "barbell" || kind === "trap-bar") return 58;
    if (kind === "tackle-shield" || kind === "tackle-bag") return 72;
    if (kind === "medicine-ball" || kind === "plyo-box") return 58;
    if (kind === "trx" || kind === "resistance-band" || kind === "long-resistance-band" || kind === "battle-rope") return 68;
    if (String(kind).includes("hurdle")) return 58;
    return 44;
  }

  function equipmentInteractionPoint(item = {}) {
    return {
      x: Number(item?.node?.x?.() || 0),
      y: Number(item?.node?.y?.() || 0)
    };
  }

  function rememberEquipmentInteractionHome(item = {}) {
    if (!item?.node || state.equipmentInteractionHomes.has(item.meta.id)) return;
    state.equipmentInteractionHomes.set(item.meta.id, {
      x: Number(item.node.x?.() || 0),
      y: Number(item.node.y?.() || 0),
      rotation: Number(item.node.rotation?.() || 0),
      scaleX: Number(item.node.getAttr?.("pacBaseScaleX") || item.node.scaleX?.() || 1),
      scaleY: Number(item.node.getAttr?.("pacBaseScaleY") || item.node.scaleY?.() || 1)
    });
  }

  function resetEquipmentInteractionNodes() {
    state.equipmentInteractionHomes.forEach((home, id) => {
      const item = objectById(id);
      if (!item?.node) return;
      item.node.position({ x: home.x, y: home.y });
      item.node.rotation(home.rotation);
      item.node.scale({ x: home.scaleX, y: home.scaleY });
      item.node.findOne?.(".player-tow-connector")?.visible(false);
    });
    state.equipmentInteractionHomes.clear();
  }

  function nearestClipInteraction(clip = {}, point = {}) {
    const explicit = (clip.equipmentInteractions || [])
      .map((entry) => objectById(entry.id))
      .filter((item) => item?.node);
    const candidates = explicit.length
      ? explicit
      : state.objects.filter((item) => item?.node && PLAYER_EQUIPMENT_INTERACTION_KINDS.has(equipmentInteractionKind(item)));
    return candidates
      .map((item) => {
        const target = equipmentInteractionPoint(item);
        return { item, distance: Math.hypot(target.x - Number(point.x || 0), target.y - Number(point.y || 0)) };
      })
      .filter((entry) => entry.distance <= interactionThreshold(equipmentInteractionKind(entry.item)) * Math.max(.1, Number(sceneTransform().scale || 1)))
      .sort((a, b) => a.distance - b.distance)[0] || null;
  }

  function clipTowedEquipment(clip = {}) {
    const explicit = clip.attachedEquipmentId ? objectById(clip.attachedEquipmentId) : null;
    if (explicit?.node && PLAYER_TOWED_EQUIPMENT_KINDS.has(equipmentInteractionKind(explicit))) return explicit;
    const start = baseToScreenPoint(clip.points?.[0] || {});
    return state.objects
      .filter((item) => item?.node && PLAYER_TOWED_EQUIPMENT_KINDS.has(equipmentInteractionKind(item)))
      .map((item) => {
        const target = equipmentInteractionPoint(item);
        return { item, distance: Math.hypot(target.x - start.x, target.y - start.y) };
      })
      .filter((entry) => entry.distance <= 115 * Math.max(.1, Number(sceneTransform().scale || 1)))
      .sort((a, b) => a.distance - b.distance)[0]?.item || null;
  }

  function applyTowedEquipmentForPlayer(clip = {}, point = {}, nextPoint = {}, sec = 0) {
    const equipment = clipTowedEquipment(clip);
    if (!equipment?.node) return;
    rememberEquipmentInteractionHome(equipment);
    const kind = equipmentInteractionKind(equipment);
    const dx = Number(nextPoint.x || point.x || 0) - Number(point.x || 0);
    const dy = Number(nextPoint.y || point.y || 0) - Number(point.y || 0);
    const distance = Math.hypot(dx, dy);
    const ux = distance > .1 ? dx / distance : 1;
    const uy = distance > .1 ? dy / distance : 0;
    const viewScale = Math.max(.1, Number(sceneTransform().scale || 1));
    const behind = (kind === "parachute" ? 76 : 60) * viewScale;
    const flutter = (kind === "parachute" ? Math.sin(Number(sec || 0) * 8) * 5 : Math.sin(Number(sec || 0) * 5) * 2) * viewScale;
    const home = state.equipmentInteractionHomes.get(equipment.meta.id);
    equipment.node.position({
      x: Number(point.x || 0) - ux * behind - uy * flutter,
      y: Number(point.y || 0) - uy * behind + ux * flutter
    });
    equipment.node.rotation(Math.atan2(uy, ux) * 180 / Math.PI + (kind === "parachute" ? -90 : 0));
    const pulse = kind === "parachute" ? 1 + Math.sin(Number(sec || 0) * 10) * .035 : 1;
    equipment.node.scale({ x: home.scaleX * pulse, y: home.scaleY * pulse });
    if (kind === "sled" || kind === "sled-with-strap") {
      let connector = equipment.node.findOne?.(".player-tow-connector");
      if (!connector) {
        connector = new Konva.Line({
          name: "player-tow-connector",
          points: [0, 0, 0, 0],
          stroke: "#ffc72c",
          strokeWidth: 3,
          dash: [10, 6],
          lineCap: "round",
          listening: false
        });
        equipment.node.add(connector);
      }
      const inverse = equipment.node.getAbsoluteTransform().copy().invert();
      const localPlayer = inverse.point({ x: Number(point.x || 0), y: Number(point.y || 0) });
      connector.points([0, 0, localPlayer.x, localPlayer.y]);
      connector.visible(true);
      connector.moveToBottom();
    }
  }

  function bosuJumpPhase(clip = {}, interaction = null, sec = 0) {
    if (equipmentInteractionKind(interaction?.item) !== "bosu") return null;
    const hold = Math.max(.1, Number(clip.bosuHoldSec || 0));
    const movementDuration = Math.max(.1, Number(clip.movementDuration || 0));
    if (!hold || !movementDuration) return null;
    const pauseStart = Math.max(0, Math.min(1, Number(clip.bosuProgress || .5))) * movementDuration;
    const elapsed = Number(sec || 0) - Number(clip.start || 0);
    if (elapsed < pauseStart || elapsed > pauseStart + hold) return null;
    return Math.max(0, Math.min(1, (elapsed - pauseStart) / hold));
  }

  function strengthLiftPhase(clip = {}, interaction = null, sec = 0) {
    const kind = equipmentInteractionKind(interaction?.item);
    if (kind !== "barbell" && kind !== "trap-bar") return null;
    const hold = Math.max(.1, Number(clip.strengthHoldSec || 0));
    const movementDuration = Math.max(.1, Number(clip.movementDuration || 0));
    if (!hold || !movementDuration) return null;
    const pauseStart = Math.max(0, Math.min(1, Number(clip.strengthProgress || .5))) * movementDuration;
    const elapsed = Number(sec || 0) - Number(clip.start || 0);
    if (elapsed < pauseStart || elapsed > pauseStart + hold) return null;
    return Math.max(0, Math.min(1, (elapsed - pauseStart) / hold));
  }

  function equipmentExercisePhase(clip = {}, interaction = null, sec = 0) {
    const item = interaction?.item;
    if (!item) return null;
    const home = state.equipmentInteractionHomes.get(item.meta.id);
    return window.PACEquipmentPlayback.phase(clip, {
      id: item.meta.id, kind: equipmentInteractionKind(item),
      point: screenToBasePoint(home || equipmentInteractionPoint(item))
    }, sec);
  }

  function renderEquipmentContactLabel(equipment = {}, phase = null) {
    const layer = state.layers.ui;
    if (!layer || !equipment?.node || !phase || phase.progress < .15 || phase.progress > .65) return;
    if (layer.find(".equipment-contact-label").some((label) => label.getAttr("equipmentId") === equipment.meta.id)) return;
    const target = equipmentInteractionPoint(equipment);
    const viewScale = Math.max(.1, Number(sceneTransform().scale || 1));
    const pulse = .96 + Number(phase.wave || 0) * .08;
    const width = 76 * viewScale;
    const height = 24 * viewScale;
    const group = new Konva.Group({
      name: "equipment-contact-label",
      equipmentId: equipment.meta.id,
      x: target.x,
      y: target.y - 42 * viewScale,
      scaleX: pulse,
      scaleY: pulse,
      opacity: .92 + Number(phase.wave || 0) * .08,
      listening: false
    });
    group.add(new Konva.Rect({
      x: -width / 2, y: -height, width, height, cornerRadius: 12 * viewScale,
      fill: "rgba(4,4,4,.94)", stroke: COLORS.gold, strokeWidth: 1.8 * viewScale,
      shadowColor: COLORS.gold, shadowBlur: 12 * viewScale, shadowOpacity: .42
    }));
    group.add(new Konva.Text({
      x: -width / 2, y: -19 * viewScale, width, align: "center", text: "CONTACT",
      fill: "#ffffff", fontSize: 11 * viewScale, fontStyle: "900",
      fontFamily: "Inter, Arial, sans-serif", letterSpacing: 1.2 * viewScale
    }));
    group.add(new Konva.Line({
      points: [-6 * viewScale, 0, 0, 7 * viewScale, 6 * viewScale, 0], closed: true,
      fill: COLORS.gold, stroke: COLORS.gold, strokeWidth: viewScale
    }));
    layer.add(group);
    layer.batchDraw?.();
  }

  function applyExerciseEquipmentForPlayer(interaction = null, point = {}, nextPoint = {}, phase = null) {
    const equipment = interaction?.item;
    if (!equipment?.node || !phase) return { lift: 0, x: Number(point.x || 0), y: Number(point.y || 0) };
    rememberEquipmentInteractionHome(equipment);
    const home = state.equipmentInteractionHomes.get(equipment.meta.id);
    const kind = equipmentInteractionKind(equipment);
    const target = { x: home.x, y: home.y };
    const dx = Number(nextPoint.x || point.x || 0) - Number(point.x || 0);
    const dy = Number(nextPoint.y || point.y || 0) - Number(point.y || 0);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const wave = Number(phase.wave || 0);
    const viewScale = Math.max(.1, Number(sceneTransform().scale || 1));
    let lift = 0;
    let x = target.x;
    let y = target.y;

    if (kind === "plyo-box") lift = wave * 34 * viewScale;
    else if (kind === "trx") {
      x -= Math.cos(angle * Math.PI / 180) * wave * 14 * viewScale;
      y -= Math.sin(angle * Math.PI / 180) * wave * 14 * viewScale;
      equipment.node.scale({ x: home.scaleX, y: home.scaleY * (1 + wave * .08) });
    } else if (kind === "resistance-band" || kind === "long-resistance-band") {
      x += Math.cos(angle * Math.PI / 180) * wave * 22 * viewScale;
      y += Math.sin(angle * Math.PI / 180) * wave * 22 * viewScale;
      equipment.node.scale({ x: home.scaleX * (1 + wave * .45), y: home.scaleY });
      equipment.node.rotation(angle);
    } else if (kind === "battle-rope") {
      equipment.node.rotation(home.rotation + Math.sin(phase.progress * Math.PI * phase.reps * 2) * 6);
      equipment.node.scale({ x: home.scaleX, y: home.scaleY * (1 + wave * .12) });
    } else if (kind === "medicine-ball") {
      const travel = phase.progress < .55 ? phase.progress / .55 : 1;
      equipment.node.position({
        x: target.x + dx * travel * 1.8,
        y: target.y + dy * travel * 1.8 - Math.sin(travel * Math.PI) * 34 * viewScale
      });
      equipment.node.rotation(home.rotation + travel * 540);
    } else if (kind === "tackle-shield" || kind === "tackle-bag") {
      const impact = clamp((phase.progress - .15) / .5, 0, 1);
      const contactPulse = Math.sin(impact * Math.PI);
      equipment.node.rotation(home.rotation + (kind === "tackle-bag" ? impact * 78 : contactPulse * 12));
      equipment.node.position({
        x: target.x + Math.cos(angle * Math.PI / 180) * impact * 16 * viewScale,
        y: target.y + Math.sin(angle * Math.PI / 180) * impact * 16 * viewScale
      });
      equipment.node.scale({
        x: home.scaleX * (1 + contactPulse * .08),
        y: home.scaleY * (1 - contactPulse * .05)
      });
      renderEquipmentContactLabel(equipment, phase);
    }
    equipment.node.moveToTop?.();
    return { lift, x, y };
  }

  function applyStrengthEquipmentForPlayer(interaction = null, point = {}, nextPoint = {}, phase = 0) {
    const equipment = interaction?.item;
    if (!equipment?.node) return;
    rememberEquipmentInteractionHome(equipment);
    const target = equipmentInteractionPoint(equipment);
    const dx = Number(nextPoint.x || point.x || 0) - Number(point.x || 0);
    const dy = Number(nextPoint.y || point.y || 0) - Number(point.y || 0);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const repetitionWave = Math.abs(Math.sin(Math.max(0, Math.min(1, Number(phase || 0))) * Math.PI * 2));
    const viewScale = Math.max(.1, Number(sceneTransform().scale || 1));
    const home = state.equipmentInteractionHomes.get(equipment.meta.id);
    equipment.node.position({ x: target.x, y: target.y - (18 + repetitionWave * 24) * viewScale });
    equipment.node.rotation(angle + 90);
    equipment.node.scale({ x: home.scaleX, y: home.scaleY });
    equipment.node.moveToTop?.();
  }

  function applyPlayerEquipmentInteraction(playerItem = {}, clip = {}, point = {}, nextPoint = {}, sec = 0, resolvedInteraction = null) {
    if (!playerItem?.node) return;
    const node = playerItem.node;
    const dx = Number(nextPoint.x || point.x || 0) - Number(point.x || 0);
    const dy = Number(nextPoint.y || point.y || 0) - Number(point.y || 0);
    const distance = Math.hypot(dx, dy);
    const ux = distance > .1 ? dx / distance : 1;
    const uy = distance > .1 ? dy / distance : 0;
    const localProgress = Math.max(0, Math.min(1, (Number(sec || 0) - Number(clip.start || 0)) / Math.max(.1, Number(clip.duration || 1))));
    const viewScale = Math.max(.1, Number(sceneTransform().scale || 1));
    let lift = String(clip.motionProfile || "").toLowerCase() === "jump" ? Math.sin(Math.PI * localProgress) * 34 * viewScale : 0;
    let lateral = 0;
    let renderX = Number(point.x || 0);
    let renderY = Number(point.y || 0);
    const interaction = resolvedInteraction || nearestClipInteraction(clip, point);
    const bosuPhase = bosuJumpPhase(clip, interaction, sec);
    const strengthPhase = strengthLiftPhase(clip, interaction, sec);
    const exercisePhase = equipmentExercisePhase(clip, interaction, sec);
    if (interaction) {
      const kind = equipmentInteractionKind(interaction.item);
      const proximity = Math.max(0, Math.min(1, 1 - interaction.distance / (interactionThreshold(kind) * viewScale)));
      if (kind === "ladder") lateral = Math.sin(Number(sec || 0) * 27) * 6 * proximity * viewScale;
      else if (kind === "speed-ring") lift = Math.max(lift, (8 + Math.abs(Math.sin(Number(sec || 0) * 13)) * 13) * proximity * viewScale);
      else if (kind === "bosu" && bosuPhase != null) {
        const bosuPoint = equipmentInteractionPoint(interaction.item);
        renderX = bosuPoint.x;
        renderY = bosuPoint.y;
        lift = Math.abs(Math.sin(bosuPhase * Math.PI * 2)) * 22 * viewScale;
      } else if (strengthPhase != null && (kind === "barbell" || kind === "trap-bar")) {
        const strengthPoint = equipmentInteractionPoint(interaction.item);
        renderX = strengthPoint.x;
        renderY = strengthPoint.y;
        lift = Math.max(lift, Math.abs(Math.sin(strengthPhase * Math.PI * 2)) * 6 * viewScale);
        applyStrengthEquipmentForPlayer(interaction, point, nextPoint, strengthPhase);
      } else if (exercisePhase != null) {
        const exercise = applyExerciseEquipmentForPlayer(interaction, point, nextPoint, exercisePhase);
        renderX = exercise.x;
        renderY = exercise.y;
        lift = Math.max(lift, exercise.lift);
      } else if (String(kind).includes("hurdle")) lift = Math.max(lift, 31 * proximity * viewScale);
      node.moveToTop?.();
    }
    if (lift > .2 || Math.abs(lateral) > .2 || bosuPhase != null || strengthPhase != null || exercisePhase != null) {
      const baseScaleX = Number(node.getAttr?.("pacBaseScaleX") || node.scaleX?.() || 1);
      const baseScaleY = Number(node.getAttr?.("pacBaseScaleY") || node.scaleY?.() || 1);
      node.position({
        x: renderX - uy * lateral,
        y: renderY + ux * lateral - lift
      });
      const rise = 1 + lift * .0025;
      node.scale({ x: baseScaleX * rise, y: baseScaleY * rise });
      node.setAttrs?.({
        shadowColor: "#000",
        shadowBlur: 10 + lift * .35,
        shadowOpacity: .3,
        shadowOffset: { x: 4, y: 7 + lift * .22 }
      });
      node.moveToTop?.();
    }
    applyTowedEquipmentForPlayer(clip, point, nextPoint, sec);
    if (clip.attachedEquipmentId || interaction) node.moveToTop?.();
  }
  function activeMotionClipPriority(clip = {}, item = null) {
    if (item?.meta?.kind !== "ball") return 0;
    const type = String(clip.type || clip.pattern || "").toLowerCase();
    if (type.includes("pass") || type.includes("release") || type.includes("shot") || type.includes("grubber") || type.includes("kick")) return 30;
    if (type.includes("carry") || type.includes("touch")) return 20;
    if (type.includes("ruck")) return 10;
    return 0;
  }

  function applyMotionClipsAtTime(sec = state.currentTime) {
    resetEquipmentInteractionNodes();
    state.layers.ui?.find?.(".equipment-contact-label")?.forEach?.((node) => node.destroy());
    const grouped = new Map();
    (state.motionClips || []).forEach((clip) => {
      if (!clip?.objectId || !Array.isArray(clip.points) || !clip.points.length) return;
      if (!grouped.has(clip.objectId)) grouped.set(clip.objectId, []);
      grouped.get(clip.objectId).push(clip);
    });
    const priority = kind => kind === "player" ? 0 : kind === "ball" ? 2 : 1;
    [...grouped.entries()].sort(([a], [b]) => priority(objectById(a)?.meta.kind) - priority(objectById(b)?.meta.kind)).forEach(([objectId, clips]) => {
      const item = objectById(objectId);
      if (!item?.node) return;
      const active = clips
        .slice()
        .sort((a, b) => (Number(b.start) || 0) - (Number(a.start) || 0)
          || activeMotionClipPriority(b, item) - activeMotionClipPriority(a, item)
          || Number(b.sequenceOrder || 0) - Number(a.sequenceOrder || 0))
        .find((clip) => sec >= Number(clip.start || 0) && sec < Number(clip.start || 0) + Math.max(.1, Number(clip.duration || 1)));
      if (item.meta.kind === "ball") {
        const type = String(active?.type || "");
        const hidden = type.includes("ruck") && !type.includes("release");
        item.node.visible(!hidden);
        if (hidden) return;
      }
      if (active) {
        const p = pointForMotionClip(active, sec);
        const nextP = pointForMotionClip(active, Math.min(sec + .08, Number(active.start || 0) + Number(active.duration || 1)));
        if (isBallCarryClip(active, item.meta)) {
          applyBallCarryMotionStyle(item.node, item.meta, active, p, nextP, sec);
          return;
        }
        const screenPoint = baseToScreenPoint(p);
        const nextScreenPoint = baseToScreenPoint(nextP);
        item.node.position(screenPoint);
        const interaction = item.meta?.kind === "player" ? nearestClipInteraction(active, screenPoint) : null;
        const onBosu = bosuJumpPhase(active, interaction, sec) != null;
        const onStrength = strengthLiftPhase(active, interaction, sec) != null;
        const motionProfile = String(active.motionProfile || "").toLowerCase();
        if (onBosu || onStrength || motionProfile === "jump") {
          resetMotionObjectStyle(item.node);
          animatePlayerRunPose(item.node, item.meta, 0, 0, sec);
        } else if (motionProfile === "turn360") {
          resetMotionObjectStyle(item.node);
          animatePlayerRunPose(item.node, item.meta, 0, 0, sec);
          const turnProgress = Math.max(0, Math.min(1, (Number(sec || 0) - Number(active.start || 0)) / Math.max(.1, Number(active.duration || 1))));
          item.node.rotation(Number(item.node.getAttr?.("pacBaseRotation") || 0) + turnProgress * 360);
        } else {
          animatePlayerRunPose(item.node, item.meta, nextScreenPoint.x - screenPoint.x, nextScreenPoint.y - screenPoint.y, sec);
        }
        if (item.meta?.kind === "player") applyPlayerEquipmentInteraction(item, active, screenPoint, nextScreenPoint, sec, interaction);
      } else {
        const restPoint = motionRestPointForTime(clips, sec);
        if (restPoint) item.node.position(baseToScreenPoint(restPoint));
        else if (item.meta.motionHome) item.node.position(baseToScreenPoint(item.meta.motionHome));
        else return;
        resetMotionObjectStyle(item.node);
        const heading = restingMotionHeading(clips, sec);
        if (heading) {
          const origin = baseToScreenPoint({x:0,y:0}), target = baseToScreenPoint(heading);
          animatePlayerRunPose(item.node, item.meta, target.x-origin.x, target.y-origin.y, 0);
        }
        animatePlayerRunPose(item.node, item.meta, 0, 0, sec);
      }
    });
    window.PACEquipmentPlayback.applyCarriedEquipment(state.objects, offset => {
      const origin = baseToScreenPoint({ x: 0, y: 0 }), point = baseToScreenPoint(offset);
      return { x: point.x - origin.x, y: point.y - origin.y };
    });
  }

  function loadRugbyActionImages() {
    if (state.sport !== "rugby") return;
    Object.entries(RUGBY_ACTION_IMAGE_PATHS).forEach(([key,src]) => {
      if (state.rugbyActionImages[key]) return;
      const image = new Image();
      image.onload = () => { state.rugbyActionImages[key] = image; scrubTo(state.currentTime); };
      image.src = src;
    });
  }

  function contactLabelPoint(center, players, bounds) {
    let best = { x: clamp(center.x, 28, bounds.width - 28), y: clamp(center.y - 60, 14, bounds.height - 14) };
    let bestScore = Infinity;
    for (let radius = 60; radius <= 360; radius += 40) {
      for (const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0],[1,-1],[-1,-1],[1,1],[-1,1]]) {
        const candidate = { x: clamp(center.x + dx * radius, 28, bounds.width - 28), y: clamp(center.y + dy * radius, 14, bounds.height - 14) };
        const collisions = players.filter(point => Math.abs(point.x-candidate.x) < 65 && Math.abs(point.y-candidate.y) < 42).length;
        const score = collisions * 10000 + Math.hypot(candidate.x-center.x,candidate.y-center.y);
        if (score < bestScore) { best = candidate; bestScore = score; }
      }
      if (bestScore < 10000) break;
    }
    return best;
  }

  function renderRugbyPlayback(sec) {
    state.rugbyHiddenPlayerIds.forEach(id => objectById(id)?.node?.visible(true));
    state.rugbyHiddenPlayerIds.clear();
    if (state.sport !== "rugby") return;
    // Keep the canonical ball attached to the current holder between authored actions.
    state.objects.filter(item => item.meta.kind === "ball").forEach(ball => {
      if (state.motionClips.some(clip => clip.objectId === ball.meta.id && sec >= Number(clip.start || 0) && sec < Number(clip.start || 0) + Math.max(.1, Number(clip.duration || 1)))) return;
      const id = ballPossessionPlayerAtTime(ball.meta.id, state.motionClips, sec);
      const owner = objectById(id);
      if (owner) {
        const point = screenToBasePoint(owner.node.position());
        applyBallCarryMotionStyle(ball.node, ball.meta, {type:"ball_carry_hold",linkedPlayerId:id,start:sec}, point, point, sec);
      }
    });
    const seen = new Set(), scale = sceneTransform().scale;
    state.motionClips.filter(clip => ["rugby_scrum","rugby_lineout_lift","rugby_ruck"].includes(clip.type)
      && clip.groupActionId && sec >= clip.start && sec < clip.start+clip.duration).forEach(clip => {
      if (seen.has(clip.groupActionId)) return;
      seen.add(clip.groupActionId);
      const center = baseToScreenPoint(clip.specialCenter || clip.points[0]);
      if (clip.type === "rugby_ruck") {
        const location = contactLabelPoint(center, state.objects.filter(item=>item.meta.kind==="player" && item.node.visible()).map(item=>item.node.position()), {width:state.stage.width(),height:state.stage.height()});
        const tag = new Konva.Label({x:location.x-24,y:location.y-12,listening:false});
        tag.add(new Konva.Tag({fill:"#080808",stroke:"#ffc72c",cornerRadius:8}));
        tag.add(new Konva.Text({text:clip.rugbyMaul?"MAUL":"RUCK",padding:6,fill:"#ffc72c",fontSize:11}));
        state.layers.ui.add(tag);return;
      }
      const key = clip.type === "rugby_lineout_lift" ? "lineoutLift" : state.fieldOrientation === "vertical" ? "scrumRear" : "scrumSide";
      const spec = RUGBY_ACTION_SPRITES[key], image = state.rugbyActionImages[key];
      if (!image) return;
      const local = Math.max(0,Math.min(.999,(sec-clip.start)/clip.duration));
      const crop = spec.frames[spec.sequence[Math.floor(local*spec.sequence.length)]];
      const w=spec.width*RUGBY_ACTION_FIELD_SCALE*scale,h=spec.height*RUGBY_ACTION_FIELD_SCALE*scale;
      const group = new Konva.Group({...center,scaleX:Number(clip.specialFacing||1),listening:false});
      group.add(new Konva.Image({image,crop,x:-w/2,y:clip.specialAnchor==="bottom-center"?-h:clip.specialAnchor==="top-center"?0:-h/2,width:w,height:h}));
      state.layers.ui.add(group);
      (clip.groupPlayerIds||[clip.objectId]).forEach(id=>{const item=objectById(id);if(item){item.node.visible(false);state.rugbyHiddenPlayerIds.add(id);}});
    });
  }

  function restingMotionHeading(clips = [], sec = 0) {
    const ordered = clips.filter(c => Array.isArray(c.points) && c.points.length > 1)
      .slice().sort((a,b) => Number(a.start || 0) - Number(b.start || 0));
    const next = ordered.find(c => Number(c.start || 0) >= sec);
    const candidates = next ? ordered.slice(ordered.indexOf(next)) : ordered.slice().reverse();
    for (const clip of candidates) {
      const points = clip.points;
      for (let step = 1; step < points.length; step++) {
        const i = next ? step : points.length - step;
        const dx = Number(points[i].x) - Number(points[i - 1].x);
        const dy = Number(points[i].y) - Number(points[i - 1].y);
        const length = Math.hypot(dx, dy);
        if (length > .001) return { x: dx / length, y: dy / length };
      }
    }
    return null;
  }

  function motionRestPointForTime(clips = [], sec = state.currentTime) {
    const completed = clips
      .filter((clip) => Array.isArray(clip.points) && clip.points.length)
      .map((clip) => ({
        clip,
        end: Number(clip.start || 0) + Math.max(.1, Number(clip.duration || 1))
      }))
      .filter((entry) => Number(sec || 0) >= entry.end)
      .sort((a, b) => b.end - a.end)[0];
    return completed ? pointForMotionClip(completed.clip, completed.end) : null;
  }

  function ballPossessionPlayerAtTime(ballId = "", clips = [], sec = state.currentTime) {
    const ordered = clips
      .filter((clip) => clip?.objectId === ballId && Array.isArray(clip.points) && clip.points.length)
      .slice()
      .sort((left, right) => (Number(left.start || 0) - Number(right.start || 0)) || (Number(left.duration || 0) - Number(right.duration || 0)));
    let holderId = "";
    let sawPastAction = false;
    ordered.forEach((clip) => {
      const start = Number(clip.start || 0);
      if (start > Number(sec || 0)) return;
      sawPastAction = true;
      const end = start + Math.max(.1, Number(clip.duration || 1));
      const type = String(clip.type || clip.pattern || "").toLowerCase();
      if (Number(sec || 0) < end) {
        holderId = (type.includes("carry") || type.includes("touch"))
          ? String(clip.linkedPlayerId || clip.actorId || "")
          : "";
        return;
      }
      if (type === "ball_scrum_feed" || type === "ball_scrum_pickup" || type === "ball_maul_transfer" || type === "ball_pickup") {
        holderId = String(clip.possessionPlayerId || "");
      } else if (type.includes("shot")) {
        holderId = state.sport === "football" ? String(clip.caughtByGoalkeeperId || clip.possessionPlayerId || "") : "";
      } else if (type.includes("pass_return") || type.includes("rebound-return")) {
        holderId = String(clip.possessionPlayerId || clip.linkedPlayerId || clip.actorId || "");
      } else if (type.includes("pass")) {
        holderId = String(clip.possessionPlayerId || clip.receiverPlayerId || "");
      } else if (type.includes("carry") || type.includes("touch")) {
        holderId = String(clip.linkedPlayerId || clip.actorId || clip.possessionPlayerId || "");
      }
    });
    if (!sawPastAction && ordered.length) {
      const first = ordered[0];
      const firstType = String(first.type || first.pattern || "").toLowerCase();
      if (firstType.includes("pass") || firstType.includes("shot") || firstType.includes("carry") || firstType.includes("touch")) {
        holderId = String(first.linkedPlayerId || first.actorId || "");
      }
    }
    return holderId;
  }

  function isBallCarryClip(clip = {}, meta = {}) {
    const type = String(clip.type || clip.pattern || clip.motionProfile || "").toLowerCase();
    return String(meta.kind || "") === "ball" && (type.includes("carry") || type.includes("dribble") || type.includes("touch"));
  }

  function applyBallCarryMotionStyle(node, meta = {}, clip = {}, p = {}, nextP = {}, sec = 0) {
    if (!node?.position) return;
    if (meta.inventoryKind === "rugby-ball") {
      const carrier = objectById(clip.linkedPlayerId || clip.actorId || meta.carrierPlayerId);
      const center = carrier?.node?.position() || baseToScreenPoint(p);
      const a = baseToScreenPoint(p), b = baseToScreenPoint(nextP);
      const dx = b.x-a.x, dy = b.y-a.y, length = Math.hypot(dx,dy);
      const angle = length > .15 * sceneTransform().scale ? Math.atan2(dy,dx) : Number(node.rotation() || 0) * Math.PI / 180;
      const reach = 7 * sceneTransform().scale;
      node.position({x:center.x+Math.cos(angle)*reach,y:center.y+Math.sin(angle)*reach});
      node.rotation(angle*180/Math.PI);
      node.scaleX(Number(node.getAttr("pacBaseScaleX") || 1)*.5);
      node.scaleY(Number(node.getAttr("pacBaseScaleY") || 1)*.5);
      node.moveToTop();meta.motionActive=true;return;
    }
    if (node.moveToBottom) node.moveToBottom();
    const screen = baseToScreenPoint(p);
    const nextScreen = baseToScreenPoint(nextP);
    const baseScaleX = Number(node.getAttr("pacBaseScaleX") || node.scaleX?.() || 1);
    const baseScaleY = Number(node.getAttr("pacBaseScaleY") || node.scaleY?.() || 1);
    const dx = Number(nextScreen.x || screen.x || 0) - Number(screen.x || 0);
    const dy = Number(nextScreen.y || screen.y || 0) - Number(screen.y || 0);
    const moving = Math.hypot(dx, dy) > .15;
    const local = Math.max(0, Number(sec || 0) - Number(clip.start || 0));
    const bounce = moving ? Math.abs(Math.sin(local * Math.PI * 5.2)) : 0;
    const lateral = moving ? Math.sin(local * Math.PI * 2.6) * 2.5 : 0;
    node.position({
      x: Number(screen.x || 0) + lateral,
      y: Number(screen.y || 0) - bounce * 7
    });
    node.rotation(Number(node.getAttr("pacBaseRotation") || 0) + local * 320);
    node.scaleX(baseScaleX * (1 + bounce * .045));
    node.scaleY(baseScaleY * (1 - bounce * .035));
    if (node.setAttrs) {
      node.setAttrs({
        shadowColor: "#000",
        shadowBlur: 7 + bounce * 8,
        shadowOpacity: .28 + bounce * .12,
        shadowOffset: { x: 3, y: 6 + bounce * 3 }
      });
    }
    meta.motionActive = true;
  }

  function resetMotionObjectStyle(node) {
    if (!node?.setAttrs) return;
    node.rotation(Number(node.getAttr("pacBaseRotation") || 0));
    node.scaleX(Number(node.getAttr("pacBaseScaleX") || node.scaleX?.() || 1));
    node.scaleY(Number(node.getAttr("pacBaseScaleY") || node.scaleY?.() || 1));
    node.setAttrs({
      shadowBlur: 0,
      shadowOpacity: 0,
      shadowOffset: { x: 0, y: 0 }
    });
  }

  function animatePlayerRunPose(node, meta = {}, dx = 0, dy = 0, sec = 0) {
    if (!node?.find || String(meta.kind || "") !== "player") return;
    const imageNode = node.findOne(".player-animated-frame");
    if (imageNode && state.playerSpriteImagesReady) {
      const moving = Math.hypot(Number(dx) || 0, Number(dy) || 0) > .2;
      if (moving) imageNode.getParent()?.rotation(Math.atan2(dy, dx) * 180 / Math.PI + 90 - Number(node.rotation() || 0));
      const index = moving ? Math.floor(Math.max(0, Number(sec) || 0) * 9) % PLAYER_RUN_FRAME_SEQUENCE.length : 0;
      const key = PLAYER_RUN_FRAME_SEQUENCE[index] || "A";
      imageNode.image(playerKitFrame(meta,key));
      node.find(".pac-player-render-fallback").forEach((child) => child.destroy());
      return;
    }
    const fallback = node.findOne(".pac-player-render-fallback");
    if (!fallback) return;
    const moving = Math.hypot(Number(dx) || 0, Number(dy) || 0) > .2;
    if (moving) fallback.rotation(Math.atan2(dy, dx) * 180 / Math.PI + 90 - Number(node.rotation() || 0));
    const phase = moving ? Math.sin((Number(sec) || 0) * 13) : 0;
    const stride = moving ? 8 * phase : 0;
    const armSwing = moving ? -7 * phase : 0;
    fallback.find(".player-run-arm-a").forEach((n) => n.points([-15, 4, -27 + armSwing, 16, -38 + armSwing, 20]));
    fallback.find(".player-run-arm-b").forEach((n) => n.points([15, 4, 27 - armSwing, 16, 38 - armSwing, 20]));
    fallback.find(".player-run-leg-a").forEach((n) => n.points([-9, 17, -18 + stride, 36, -24 + stride * 1.2, 48]));
    fallback.find(".player-run-leg-b").forEach((n) => n.points([9, 17, 18 - stride, 36, 24 - stride * 1.2, 48]));
    fallback.scaleX(1 + Math.abs(phase) * .018);
    fallback.scaleY(1 - Math.abs(phase) * .012);
  }

  function pointForMotionClip(clip, sec) {
    const start = Number(clip.start || 0);
    const duration = Math.max(.1, Number(clip.duration || 1));
    const elapsed = clamp(Number(sec || 0) - start, 0, duration);
    const hold = Math.max(0, Number(clip.bosuHoldSec || clip.strengthHoldSec || clip.equipmentHoldSec || 0));
    const movementDuration = Math.max(.1, Number(clip.movementDuration || duration - hold || duration));
    const holdProgress = clamp(Number(
      clip.strengthHoldSec ? clip.strengthProgress
        : clip.bosuHoldSec ? clip.bosuProgress
          : clip.equipmentProgress || .5
    ), 0, 1);
    const pauseStart = holdProgress * movementDuration;
    let t = hold > 0 && elapsed >= pauseStart
      ? (elapsed <= pauseStart + hold ? holdProgress : clamp((elapsed - hold) / movementDuration, 0, 1))
      : clamp(elapsed / movementDuration, 0, 1);
    if (clip.loop) t = clip.lapDuration > 0 ? (elapsed / clip.lapDuration + Number(clip.loopPhase || 0)) % 1 : t % 1;
    const points = (clip.points || []).slice().sort((a, b) => Number(a.t || 0) - Number(b.t || 0));
    if (t <= Number(points[0].t || 0)) return points[0];
    if ((clip.rugbyKickType === "high-kick" || clip.footballCross) && points.length >= 3) {
      const a = points[0];
      const control = points[Math.floor(points.length / 2)];
      const b = points[points.length - 1];
      const inverse = 1 - t;
      return {
        x: inverse * inverse * a.x + 2 * inverse * t * control.x + t * t * b.x,
        y: inverse * inverse * a.y + 2 * inverse * t * control.y + t * t * b.y
      };
    }
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const at = Number(a.t || 0);
      const bt = Number(b.t || 0);
      if (t <= bt) {
        const local = clamp((t - at) / Math.max(.001, bt - at), 0, 1);
        return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local };
      }
    }
    return points[points.length - 1];
  }

  function isMovementMeta(meta = {}, node) {
    return MOVEMENT_KINDS.includes(String(meta.kind || "")) || node?.className === "Arrow" || node?.className === "Line";
  }

  function isMetaActiveAtTime(meta = {}, sec = state.currentTime) {
    const start = Number(meta.start || 0);
    const duration = Math.max(.1, Number(meta.duration || 0));
    return Number(sec || 0) >= start && Number(sec || 0) <= start + duration;
  }

  function absoluteLinePoints(node) {
    const pts = typeof node.points === "function" ? node.points() : [];
    const tr = node.getAbsoluteTransform ? node.getAbsoluteTransform() : null;
    const out = [];
    for (let i = 0; i < pts.length; i += 2) {
      const p = tr ? tr.point({ x: pts[i], y: pts[i + 1] }) : { x: (node.x?.() || 0) + pts[i], y: (node.y?.() || 0) + pts[i + 1] };
      out.push(p.x, p.y);
    }
    return out;
  }

  function pointAlongPolyline(points, t) {
    const segments = [];
    let total = 0;
    for (let i = 2; i < points.length; i += 2) {
      const a = { x: points[i - 2], y: points[i - 1] };
      const b = { x: points[i], y: points[i + 1] };
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len > .01) {
        segments.push({ a, b, len });
        total += len;
      }
    }
    if (!segments.length) return { x: points[0] || 0, y: points[1] || 0 };
    let target = Math.max(0, Math.min(1, t)) * total;
    for (const seg of segments) {
      if (target <= seg.len) {
        const local = target / seg.len;
        return {
          x: seg.a.x + (seg.b.x - seg.a.x) * local,
          y: seg.a.y + (seg.b.y - seg.a.y) * local
        };
      }
      target -= seg.len;
    }
    const last = segments[segments.length - 1];
    return { ...last.b };
  }

  function objectById(id) {
    return state.objects.find((item) => item?.meta?.id === id) || null;
  }

  function getMeasurementAnchor(node, meta = {}, purpose = "object-pair") {
    const box = node.getClientRect({ relativeTo: state.stage });
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const bottomCenter = { x: box.x + box.width / 2, y: box.y + box.height };
    const kind = String(meta.kind || "").toLowerCase();
    const contactKinds = new Set(["cone", "flat-cone", "marker-triangle", "pole", "mannequin", "hurdle", "goal", "player", "ball", "bosu", "balance-disc", "rebounder", "gym-ball"]);
    if (purpose === "field-ref" || purpose === "object-pair") return contactKinds.has(kind) ? bottomCenter : center;
    return center;
  }

  function playerFieldAngle() {
    return state.fieldOrientation === "vertical" ? (state.attackDirection === "reverse" ? 90 : -90) : state.attackDirection === "reverse" ? 180 : 0;
  }

  function playerViewPoint(p, inverse = false) {
    const w = state.baseStage.width, h = state.baseStage.height;
    if (state.fieldOrientation === "vertical") {
      if (state.attackDirection === "reverse") return inverse ? {x:p.y,y:h-p.x} : {x:h-p.y,y:p.x};
      return inverse ? {x:w-p.y,y:p.x} : {x:p.y,y:w-p.x};
    }
    return state.attackDirection === "reverse" ? {x:w-p.x,y:h-p.y} : {x:p.x,y:p.y};
  }

  function screenToBasePoint(point) {
    const t = sceneTransform();
    return playerViewPoint({x:(point.x-t.x)/t.scale,y:(point.y-t.y)/t.scale}, true);
  }

  function baseToScreenPoint(point) {
    const t = sceneTransform(), p = playerViewPoint(point);
    return {x:t.x+p.x*t.scale,y:t.y+p.y*t.scale};
  }

  function stageToFieldMeters(point) {
    const base = screenToBasePoint(point);
    return {
      x: interpolateCalibratedAxis(base.x / state.baseStage.width, FIELD_AXIS_CALIBRATION.x, FIELD_METRICS.lengthM),
      y: interpolateCalibratedAxis(base.y / state.baseStage.height, FIELD_AXIS_CALIBRATION.y, FIELD_METRICS.widthM)
    };
  }

  function fieldMetersToStage(xM, yM) {
    return baseToScreenPoint({
      x: inverseInterpolateCalibratedAxis(xM, FIELD_AXIS_CALIBRATION.x, FIELD_METRICS.lengthM) * state.baseStage.width,
      y: inverseInterpolateCalibratedAxis(yM, FIELD_AXIS_CALIBRATION.y, FIELD_METRICS.widthM) * state.baseStage.height
    });
  }

  function interpolateCalibratedAxis(normalized, points, maxMeters) {
    const n = Number(normalized) || 0;
    if (n <= points[0].n) return 0;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      if (n <= b.n) {
        const t = (n - a.n) / Math.max(.000001, b.n - a.n);
        return clamp(a.m + t * (b.m - a.m), 0, maxMeters);
      }
    }
    return maxMeters;
  }

  function inverseInterpolateCalibratedAxis(meters, points, maxMeters) {
    const m = clamp(meters, 0, maxMeters);
    if (m <= points[0].m) return points[0].n;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      if (m <= b.m) {
        const t = (m - a.m) / Math.max(.000001, b.m - a.m);
        return a.n + t * (b.n - a.n);
      }
    }
    return points[points.length - 1].n;
  }

  function metersBetween(from, to) {
    const a = stageToFieldMeters(from);
    const b = stageToFieldMeters(to);
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  function roundM(value) {
    return Number(value) >= 10 ? Math.round(value) : Math.round(Number(value || 0) * 10) / 10;
  }

  function isEmbeddedPlayer() {
    return document.body?.classList?.contains("drill-player-embed");
  }

  function responsiveMeasureLabelScale(extra = 1) {
    const w = Number(state.stage?.width?.() || window.innerWidth || 0);
    const h = Number(state.stage?.height?.() || window.innerHeight || 0);
    const base = Math.min(w / 560, h / 360);
    return clamp(base, isEmbeddedPlayer() ? 0.52 : 0.7, 1) * Math.max(0.35, Number(extra) || 1);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function addMeasureLabel(x, y, text, color = "#ffc72c", scale = 1) {
    const labelScale = responsiveMeasureLabelScale(scale);
    const label = new Konva.Label({ x, y, listening: false });
    label.add(new Konva.Tag({
      fill: "rgba(0,0,0,.78)",
      stroke: color,
      strokeWidth: Math.max(0.8, 1.2 * labelScale),
      cornerRadius: Math.max(4, 5 * labelScale),
      shadowColor: "#000",
      shadowBlur: 7,
      shadowOpacity: .42
    }));
    const textNode = new Konva.Text({
      text: String(text || ""),
      fill: "#fff",
      fontSize: Math.max(7, Math.round(10 * labelScale)),
      fontStyle: "900",
      padding: Math.max(2, Math.round(4 * labelScale)),
      fontFamily: "Inter, Arial, sans-serif"
    });
    label.add(textNode);
    const maxX = Math.max(0, (state.stage?.width?.() || window.innerWidth || 0) - textNode.width() - 10);
    const maxY = Math.max(0, (state.stage?.height?.() || window.innerHeight || 0) - textNode.height() - 8);
    label.x(clamp(x, 4, maxX));
    label.y(clamp(y, 4, maxY));
    state.layers.ui.add(label);
    return label;
  }

  function addMeasureLine(from, to, text, color = "rgba(255,255,255,.88)", dash = [6, 5]) {
    const labelScale = responsiveMeasureLabelScale();
    state.layers.ui.add(new Konva.Line({
      points: [from.x, from.y, to.x, to.y],
      stroke: color,
      strokeWidth: Math.max(1, 1.8 * labelScale),
      dash: dash.map((v) => Math.max(3, v * labelScale)),
      listening: false
    }));
    addMeasureLabel((from.x + to.x) / 2 + 5, (from.y + to.y) / 2 - 18, text, color);
  }

  function resolveMeasurement(m) {
    const savedDistance = savedLinearMeasurementMeters(m);
    if (m.type === "object-pair") {
      const a = objectById(m.fromId);
      const b = objectById(m.toId);
      if (!a?.node || !b?.node) return null;
      const from = getMeasurementAnchor(a.node, a.meta, "object-pair");
      const to = getMeasurementAnchor(b.node, b.meta, "object-pair");
      return { from, to, text: `${roundM(savedDistance || metersBetween(from, to))}m`, color: "rgba(255,255,255,.9)", dash: [7, 5] };
    }
    if (m.type === "field-ref") {
      const item = objectById(m.objectId);
      if (!item?.node) return null;
      const from = getMeasurementAnchor(item.node, item.meta, "field-ref");
      const cm = stageToFieldMeters(from);
      const ref = m.ref || {};
      const to = ref.axis === "y" ? fieldMetersToStage(cm.x, ref.m) : fieldMetersToStage(ref.m, cm.y);
      const dist = ref.axis === "y" ? Math.abs(cm.y - ref.m) : Math.abs(cm.x - ref.m);
      return { from, to, text: `${roundM(savedDistance || dist)}m`, color: "rgba(255,255,255,.9)", dash: [4, 5] };
    }
    return null;
  }

  function savedLinearMeasurementMeters(m = {}) {
    const value = Number(m.lockedDistanceM || m.distanceM || m.metrics?.distanceM || 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  function areaGeometry(m) {
    const points = (m.objectIds || [])
      .map((id) => objectById(id))
      .filter(Boolean)
      .map((item) => getMeasurementAnchor(item.node, item.meta, "zone"));
    if (points.length < 3) return null;
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const a = stageToFieldMeters({ x: minX, y: minY });
    const b = stageToFieldMeters({ x: maxX, y: maxY });
    const widthM = Math.abs(b.x - a.x);
    const heightM = Math.abs(b.y - a.y);
    return {
      minX,
      maxX,
      minY,
      maxY,
      widthM,
      heightM,
      area: widthM * heightM,
      perimeter: 2 * (widthM + heightM)
    };
  }

  function renderAreaMeasurement(m) {
    const g = areaGeometry(m);
    if (!g) return;
    const metrics = m.metrics || {};
    const widthM = Number(metrics.widthM || g.widthM);
    const heightM = Number(metrics.heightM || g.heightM);
    const areaM2 = Number(metrics.areaM2 || g.area);
    const perimeterM = Number(metrics.perimeterM || m.runningTarget?.perimeterM || g.perimeter);
    const gold = "rgba(255,199,44,.9)";
    const perimeter = [
      [g.minX, g.minY, g.maxX, g.minY],
      [g.maxX, g.minY, g.maxX, g.maxY],
      [g.maxX, g.maxY, g.minX, g.maxY],
      [g.minX, g.maxY, g.minX, g.minY]
    ];
    const labelScale = responsiveMeasureLabelScale();
    perimeter.forEach((points) => {
      state.layers.ui.add(new Konva.Line({
        points,
        stroke: gold,
        strokeWidth: Math.max(1, 1.8 * labelScale),
        dash: [9, 6].map((v) => Math.max(3, v * labelScale)),
        listening: false
      }));
    });
    addMeasureLabel((g.minX + g.maxX) / 2 - 16, g.minY - 24, `${roundM(widthM)}m`, gold, Number(m.sideLabels?.width?.labelScale || 1));
    addMeasureLabel(g.minX + 8, (g.minY + g.maxY) / 2 - 18, `${roundM(heightM)}m`, gold, Number(m.sideLabels?.depth?.labelScale || 1));
    const savedLabel = Number.isFinite(m.labelX) && Number.isFinite(m.labelY) ? baseToScreenPoint({ x: m.labelX, y: m.labelY }) : null;
    const labelPos = savedLabel || { x: g.minX + 10, y: Math.max(8, g.minY - 42) };
    const text = isEmbeddedPlayer()
      ? `${roundM(widthM)}x${roundM(heightM)}m | ${Math.round(areaM2)}m2 | P ${roundM(perimeterM)}m`
      : `Zone ${roundM(widthM)} x ${roundM(heightM)}m | Area ${Math.round(areaM2)}m2 | Perimeter ${roundM(perimeterM)}m`;
    addMeasureLabel(labelPos.x, labelPos.y, text, gold, Number(m.labelScale || 1));
  }

  function renderSavedMeasurements() {
    (state.measurements || []).forEach((m) => {
      if (m.type === "area") {
        renderAreaMeasurement(m);
        return;
      }
      const resolved = resolveMeasurement(m);
      if (!resolved) return;
      addMeasureLine(resolved.from, resolved.to, resolved.text, resolved.color, resolved.dash);
    });
  }

  function arrowCode(meta = {}) {
    const style = String(meta.arrowStyle || meta.kind || "").toLowerCase();
    const label = String(meta.label || "").toLowerCase();
    if (style.includes("touch") || label.includes("touch") || label.includes("push")) return "TOUCH";
    if (style.includes("accel") || label.includes("accel")) return "ACC";
    if (style.includes("decel") || label.includes("decel")) return "DCC";
    if (style.includes("pass") || label.includes("pass")) return "PASS";
    if (style.includes("shot") || label.includes("shot")) return "SHOT";
    if (style.includes("recovery")) return "REC";
    if (style.includes("hspd") || label.includes("high speed")) return "HSPD";
    if (style.includes("jump") || label.includes("jump")) return "JUMP";
    if (style.includes("jog") || label.includes("tempo")) return "JOG";
    if (style.includes("circle") || label.includes("circle") || label.includes("loop")) return "LOOP";
    if (style.includes("sprint") || label.includes("sprint")) return "SPRINT";
    return String(meta.code || "").toUpperCase();
  }

  function renderArrowCodes() {
    state.objects.forEach(({ node, meta }) => {
      if (!isMovementMeta(meta, node)) return;
      if (!isMetaActiveAtTime(meta, state.currentTime)) return;
      const text = arrowCode(meta);
      if (!text) return;
      const box = node.getClientRect({ relativeTo: state.stage });
      addMeasureLabel(box.x + box.width / 2 - 18, box.y - 22, text, meta.headColor || meta.color || "#ffc72c");
    });
  }

  function triggerAudio(meta) {
    if (silent || externalClock) return;
    if (!String(meta.kind || "").startsWith("event_")) return;
    const start = Number(meta.start || 0);
    if (state.currentTime < start || state.played.has(meta.id) || state.currentTime - start > .2) return;
    state.played.add(meta.id);
    const kind = meta.soundType || String(meta.kind).replace("event_", "");
    if (kind === "beep") tone(880, .14);
    if (kind === "long_beep") tone(660, .5);
    if (kind === "whistle") tone(1250, .2);
    if (kind === "female_voice" || kind === "male_voice") speak(meta.voiceText || meta.cueText || meta.label);
  }

  function showPhase(text) {
    $("player-phase").textContent = String(text || "READY").toUpperCase();
    const w = state.stage.width();
    const g = new Konva.Group({ x: w / 2, y: state.stage.height() * .16, listening: false });
    g.add(new Konva.Rect({ x: -165, y: -30, width: 330, height: 60, cornerRadius: 8, fill: "rgba(0,0,0,.75)", stroke: "#ffc72c", strokeWidth: 2, shadowColor: "#ffc72c", shadowBlur: 20 }));
    g.add(new Konva.Text({ x: -155, y: -16, width: 310, align: "center", text: String(text || "").toUpperCase(), fill: "#fff", fontSize: 30, fontStyle: "900" }));
    state.layers.ui.add(g);
  }

  function updateNextPreview() {
    const next = state.objects.map((o) => o.meta).filter((m) => Number(m.start) > state.currentTime).sort((a, b) => a.start - b.start)[0];
    $("player-next").textContent = next ? `Next exercise preview: ${next.label || next.kind} at ${Number(next.start).toFixed(1)}s` : "Next exercise preview: complete";
  }

  function ensureAudio() {
    if (!state.audioContext) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) state.audioContext = new Ctx();
    }
    if (state.audioContext?.state === "suspended") state.audioContext.resume();
  }

  function tone(freq, duration) {
    if (silent) return;
    const ctx = state.audioContext;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.18, ctx.currentTime + .02);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + .02);
  }

  function speak(text) {
    if (silent) return;
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(String(text || ""));
    u.rate = .98;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  function toggleFocusMode() {
    state.focusMode = !state.focusMode;
    const button = $("player-focus-toggle");
    if (button) {
      button.classList.toggle("is-active", state.focusMode);
      button.setAttribute("aria-pressed", state.focusMode ? "true" : "false");
      button.textContent = state.focusMode ? "FULL" : "FOCUS";
    }
    if (!state.focusMode) {
      resetFocusCamera();
      scrubTo(state.currentTime);
      return;
    }
    scrubTo(state.currentTime);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (embed) {document.body.classList.add("drill-player-embed");document.querySelector(".player-exit")?.remove();}
    if (compact) document.body.classList.add("drill-player-compact");
    initStage();
    loadPlayerSpriteImages();
    load();
    $("player-play").addEventListener("click", play);
    $("player-pause").addEventListener("click", pause);
    $("player-speed")?.addEventListener("change", () => {
      state.startPosition = state.currentTime;
      state.startAudioTime = masterClock();
    });
    $("player-replay").addEventListener("click", () => replay(true));
    $("player-focus-toggle")?.addEventListener("click", toggleFocusMode);
    $("player-scrub").addEventListener("input", () => {
      state.paused = true;
      scrubTo(Number($("player-scrub").value) || 0);
    });
  });
})();

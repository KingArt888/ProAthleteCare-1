(function (root, make) {
  const api = make();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.PACEquipmentPlayback = api;
})(globalThis, function () {
  "use strict";
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function approaches(points, target) {
    if (!target || !Array.isArray(points) || points.length < 2) return false;
    const ordered = points.slice().sort((a, b) => Number(a.t || 0) - Number(b.t || 0));
    let closest = Infinity, progress = 0;
    for (let i = 1; i < ordered.length; i++) {
      const a = ordered[i - 1], b = ordered[i];
      const dx = b.x - a.x, dy = b.y - a.y, length = dx * dx + dy * dy;
      const u = length > .001 ? clamp(((target.x - a.x) * dx + (target.y - a.y) * dy) / length, 0, 1) : 0;
      const distance = Math.hypot(target.x - a.x - dx * u, target.y - a.y - dy * u);
      if (distance >= closest) continue;
      closest = distance;
      progress = (i - 1 + u) / (ordered.length - 1);
    }
    const first = ordered[0], last = ordered[ordered.length - 1];
    const initialDistance = Math.hypot(target.x - first.x, target.y - first.y);
    // A route ending beyond the pad places a holder behind it, rather than attacking its face.
    const finishSide = ((last.x - target.x) * (first.x - target.x) + (last.y - target.y) * (first.y - target.y)) / Math.max(.001, initialDistance);
    return closest <= 36 && initialDistance - closest > 8 && progress > .05 && finishSide >= -8;
  }
  function isContactAction(clip = {}) {
    return [clip.segmentType, clip.pattern, clip.motionLoad, clip.arrowStyle]
      .some(value => ["acceleration", "acc", "accel"].includes(String(value || "").toLowerCase()));
  }
  function phase(clip, equipment, sec) {
    if (!clip.interactionEquipmentId || String(clip.interactionEquipmentId) !== String(equipment.id)) return null;
    const hold = Number(clip.equipmentHoldSec), movement = Number(clip.movementDuration);
    if (!(hold > 0) || !(movement > 0)) return null;
    const contact = equipment.kind === "tackle-shield" || equipment.kind === "tackle-bag";
    if (contact && (!isContactAction(clip) || !approaches(clip.points, equipment.point))) return null;
    const start = Number(clip.start || 0) + clamp(Number(clip.equipmentProgress ?? .5), 0, 1) * movement;
    // Legacy holds can be long. Impact is one brief event, never repeated for the whole hold.
    const span = contact ? Math.min(.55, hold) : hold;
    const elapsed = Number(sec) - start;
    if (elapsed < 0 || elapsed > span) return null;
    const progress = clamp(elapsed / span, 0, 1);
    const reps = contact ? 1 : Math.max(1, Number(clip.interactionRepetitions || 3));
    return { progress, wave: Math.abs(Math.sin(progress * Math.PI * reps)), reps };
  }
  function applyCarriedEquipment(items, scale = 1) {
    const all = Array.from(items), byId = new Map(all.map(item => [item.meta?.id, item]));
    for (const item of all) {
      const holder = byId.get(item.meta?.carriedByPlayerId);
      if (!holder?.node || !item.node || holder.meta?.kind !== "player") continue;
      const offset = item.meta.carryOffset || { x: 0, y: -20 };
      const delta = typeof scale === "function" ? scale(offset) : { x: Number(offset.x || 0) * scale, y: Number(offset.y || 0) * scale };
      item.node.position({ x: holder.node.x() + delta.x, y: holder.node.y() + delta.y });
      if (item.node.visible() && holder.node.visible()) item.node.moveToTop();
    }
  }
  return { approaches, isContactAction, phase, applyCarriedEquipment };
});

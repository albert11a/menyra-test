/* Decorative scan demonstration only: no camera permission, face model,
   photo capture, tracking or change to the actual scan runtime. */
(function () {
  "use strict";
  const canvas = document.querySelector("#lf-preview .nx-scan-canvas");
  const landing = document.getElementById("ls-einstieg");
  if (!canvas || !landing) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let frame = 0;
  let elapsed = 0;
  let previous = null;
  let lastPaint = 0;

  function draw(time) {
    const size = Math.max(1, Math.round(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2)));
    if (canvas.width !== size) { canvas.width = size; canvas.height = size; }
    ctx.setTransform(size / 300, 0, 0, size / 300, 0, 0);
    ctx.clearRect(0, 0, 300, 300);
    const phase = (time % 7000) / 7000;
    const yaw = Math.sin(phase * Math.PI * 2) * 0.65;
    // Face-ID-like line icon. Features shift and the frame narrows as it
    // looks left/right; no mesh, skin shading or photographed face.
    const shift = Math.sin(yaw) * 25;
    const half = 56 * Math.cos(yaw);
    const center = 150 + shift * 0.15;
    const left = center - half, right = center + half;
    const top = 91, bottom = 209, corner = 20;
    ctx.strokeStyle = "#214e47"; ctx.lineWidth = 5.2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(left,top+corner);ctx.lineTo(left,top+13);ctx.quadraticCurveTo(left,top,left+13,top);ctx.lineTo(left+corner,top);
    ctx.moveTo(right-corner,top);ctx.lineTo(right-13,top);ctx.quadraticCurveTo(right,top,right,top+13);ctx.lineTo(right,top+corner);
    ctx.moveTo(right,bottom-corner);ctx.lineTo(right,bottom-13);ctx.quadraticCurveTo(right,bottom,right-13,bottom);ctx.lineTo(right-corner,bottom);
    ctx.moveTo(left+corner,bottom);ctx.lineTo(left+13,bottom);ctx.quadraticCurveTo(left,bottom,left,bottom-13);ctx.lineTo(left,bottom-corner);ctx.stroke();
    const faceCenter = 150 + shift * 0.65;
    const eyeGap = 29 * Math.cos(yaw);
    ctx.beginPath();
    ctx.moveTo(faceCenter-eyeGap,126);ctx.lineTo(faceCenter-eyeGap,137);
    ctx.moveTo(faceCenter+eyeGap,126);ctx.lineTo(faceCenter+eyeGap,137);ctx.stroke();
    const nose = 150 + shift;
    ctx.beginPath();ctx.moveTo(nose,139);ctx.lineTo(nose,160);ctx.quadraticCurveTo(nose,164,nose-5,164);ctx.lineTo(nose-10,164);ctx.stroke();
    ctx.beginPath();ctx.moveTo(faceCenter-25*Math.cos(yaw),179);
    ctx.bezierCurveTo(faceCenter-15,195,faceCenter+15,195,faceCenter+25*Math.cos(yaw),179);ctx.stroke();

    // Same ring geometry and colors as Trichter.#ringZeichnen:
    // circular guide, 8 sectors × 5 radial marks, green completed sectors.
    const radius = 108;
    const direction = yaw >= 0 ? Math.PI / 2 : -Math.PI / 2;
    const strength = Math.abs(yaw) / 0.65;
    const covered = new Set(phase > 0.92 ? [0,1,2,3,4,5,6,7] : phase > 0.72 ? [0,1,2,3,5,6,7] : phase > 0.38 ? [0,1,2,3] : [0]);
    ctx.strokeStyle = "rgba(26,31,30,0.12)"; ctx.lineWidth = 1;
    ctx.beginPath();ctx.arc(150,150,radius,0,Math.PI*2);ctx.stroke();
    for (let i = 0; i < 40; i += 1) {
      const sector = Math.floor(i / 5);
      const angle = -Math.PI / 2 - Math.PI / 8 + i / 40 * Math.PI * 2;
      const distance = Math.abs(((angle + Math.PI / 2 - direction + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      const glow = Math.max(0, 1 - distance / (Math.PI / 8)) * strength;
      const done = covered.has(sector);
      const inner = radius + 6;
      const outer = inner + (done ? 13 : 7) + glow * 7;
      ctx.strokeStyle = done ? "rgba(14,124,104,0.95)"
        : glow > 0.05 ? `rgba(14,124,104,${0.25 + glow * 0.7})` : "rgba(26,31,30,0.26)";
      ctx.lineWidth = done || glow > 0.05 ? 3.5 : 2.5; ctx.lineCap = "round";
      ctx.beginPath();ctx.moveTo(150+Math.cos(angle)*inner,150+Math.sin(angle)*inner);
      ctx.lineTo(150+Math.cos(angle)*outer,150+Math.sin(angle)*outer);ctx.stroke();
    }
    canvas.previousElementSibling.hidden = true;
  }

  function running() { return visible && !document.hidden && !motion.matches && landing.getAttribute("data-aktiv") === "ja"; }
  function tick(now) {
    frame = 0;
    if (!running()) { previous = null; return; }
    if (previous !== null) elapsed += Math.min(now - previous, 80);
    previous = now;
    // 30 fps is enough for the small demonstration and limits CPU work.
    if (now - lastPaint >= 32) { draw(elapsed); lastPaint = now; }
    frame = window.requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0; previous = null;
    if (motion.matches) draw(0);
    if (running()) frame = window.requestAnimationFrame(tick);
  }
  draw(0);
  if (!("IntersectionObserver" in window)) return;
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; sync(); }, {threshold:0.1}).observe(canvas);
  new MutationObserver(sync).observe(landing, {attributes:true,attributeFilter:["data-aktiv"]});
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("resize", () => { draw(motion.matches ? 0 : elapsed); });
  if (motion.addEventListener) motion.addEventListener("change", sync);
  else motion.addListener?.(sync);
})();

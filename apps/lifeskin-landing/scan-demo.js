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

  // A real 3D surface rotates around the vertical axis. The nose, eyes and
  // cheeks change their projected positions; this is not a tilted photo.
  function point(latitude, longitude) {
    const y = -Math.cos(latitude) * 66;
    const jaw = y > 18 ? 1 - (y - 18) / 170 : 1;
    return [Math.sin(latitude) * Math.sin(longitude) * 42 * jaw,
      y, Math.sin(latitude) * Math.cos(longitude) * 40];
  }
  const faces = [];
  for (let lat = 0; lat < 24; lat += 1) {
    for (let lon = 0; lon < 40; lon += 1) {
      const a = lat * Math.PI / 24;
      const b = (lat + 1) * Math.PI / 24;
      const c = lon * Math.PI * 2 / 40;
      const d = (lon + 1) * Math.PI * 2 / 40;
      faces.push([point(a, c), point(b, c), point(b, d), point(a, d)]);
    }
  }

  function draw(time) {
    const size = Math.max(1, Math.round(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2)));
    if (canvas.width !== size) { canvas.width = size; canvas.height = size; }
    ctx.setTransform(size / 300, 0, 0, size / 300, 0, 0);
    ctx.clearRect(0, 0, 300, 300);
    const phase = (time % 7000) / 7000;
    const yaw = Math.sin(phase * Math.PI * 2) * 0.65;
    const project = ([x, y, z]) => {
      const rx = x * Math.cos(yaw) + z * Math.sin(yaw);
      const rz = z * Math.cos(yaw) - x * Math.sin(yaw);
      return { x: 150 + rx, y: 145 + y, z: rz };
    };
    ctx.fillStyle = "#eeece7";
    ctx.beginPath(); ctx.arc(150, 150, 108, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(150, 150, 108, 0, Math.PI * 2); ctx.clip();
    const shoulder = ctx.createRadialGradient(140, 240, 8, 150, 255, 85);
    shoulder.addColorStop(0, "#ddd8d0"); shoulder.addColorStop(1, "#aaa89f");
    ctx.fillStyle = shoulder; ctx.beginPath(); ctx.ellipse(150, 258, 76, 40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c6beb3"; ctx.fillRect(134, 191, 32, 56);
    const surface = faces.map((face) => {
      const vertices = face.map(project);
      return { vertices, depth: vertices.reduce((sum, p) => sum + p.z, 0) / 4 };
    }).sort((a, b) => a.depth - b.depth);
    surface.forEach(({vertices, depth}) => {
      const x = vertices.reduce((sum, p) => sum + p.x, 0) / 4;
      const y = vertices.reduce((sum, p) => sum + p.y, 0) / 4;
      const light = Math.max(0, Math.min(1, 0.44 + depth / 110 - (x - 150) / 220 - (y - 130) / 480));
      const value = Math.round(154 + light * 82);
      ctx.fillStyle = `rgb(${value},${value - 6},${value - 15})`;
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.6;
      ctx.beginPath(); vertices.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.closePath(); ctx.fill(); ctx.stroke();
    });
    const line = (points, color, width) => {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = "round"; ctx.beginPath();
      points.map(project).forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke();
    };
    [-1, 1].forEach((side) => {
      line([[side * 10,-9,38],[side * 17,-11,36],[side * 23,-8,33]], "#6f746f", 2.4);
      line([[side * 9,-20,36],[side * 16,-23,35],[side * 24,-20,31]], "#8b8b80", 1.7);
    });
    const nose = [[-5,-8,39],[0,15,57],[7,17,38],[0,20,40]].map(project);
    ctx.fillStyle = "#b3aca0"; ctx.beginPath();nose.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
    line([[0,-9,41],[0,14,57],[4,17,44]], "#e5ded3", 2);
    line([[-13,32,31],[-6,34,35],[0,35,36],[6,34,35],[13,32,31]], "#9b8e83", 2);
    ctx.restore();

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

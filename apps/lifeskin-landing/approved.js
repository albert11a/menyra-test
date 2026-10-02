/* Shared-frame navigation; Heart supplies all cases enabled for the landing. */
(function () {
  "use strict";
  const root = document.getElementById("lf-preview");
  if (!root) return;
  const section = document.getElementById("rezultatet");
  const before = root.querySelector("#lf-before");
  const after = root.querySelector("#lf-after");
  const counter = root.querySelector("#lf-case-count");
  const buttons = root.querySelectorAll("[data-case-direction]");
  const photo = (src) => /^\/apps\/lifeskin-landing\/fotot\/rasti-[a-z0-9-]+\.jpg$/.test(src) ? src.replace(/\.jpg$/, ".webp") : src;
  // Same four offline cases as RASTE_STANDARD; the initial HTML shows r2.
  let cases = [1, 2, 3, 4].map((n) => ({
    id: `r${n}`,
    para: `/apps/lifeskin-landing/fotot/rasti-${n}-dita1.webp`,
    pas: `/apps/lifeskin-landing/fotot/rasti-${n}-dita28.webp`
  }));
  const ready = new Map();
  const load = (entry) => {
    const key = `${entry.para}\n${entry.pas}`;
    if (!ready.has(key)) {
      const promise = Promise.all([entry.para, entry.pas].map((src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      }))).catch((error) => { ready.delete(key); throw error; });
      ready.set(key, promise);
    }
    return ready.get(key);
  };
  let request = 0;
  let displayedId = "r2";
  let desired = 1;
  const count = (index) => { counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(cases.length).padStart(2, "0")}`; };
  count(desired);
  async function show(index) {
    const current = ++request;
    const entry = cases[index];
    try {
      await load(entry);
      if (current !== request) return;
      before.src = entry.para;
      after.src = entry.pas;
      before.alt = `Rasti ${index + 1}, para terapisë`;
      after.alt = `Rasti ${index + 1}, pas terapisë`;
      displayedId = entry.id;
      count(index);
    } catch {
      if (current === request) desired = Math.max(0, cases.findIndex((item) => item.id === displayedId));
    }
  }
  const step = (direction) => {
    if (cases.length < 2) return;
    desired = (desired + direction + cases.length) % cases.length;
    return show(desired);
  };
  // A swipe that starts on an arrow must not also count as its tap.
  let swipedAt = 0;
  buttons.forEach((button) => button.addEventListener("click", () => {
    if (Date.now() - swipedAt < 500) return;
    return step(button.dataset.caseDirection === "prev" ? -1 : 1);
  }));
  // Swipe on the photos: left = next case, right = previous. Only a clearly
  // sideways stroke counts; up and down stay the page scroll (touch-action
  // pan-y in approved.css hands those to the browser).
  const stage = root.querySelector(".lf-case-stage");
  const pair = root.querySelector("#lf-case-pair");
  if (stage && pair) {
    // One rule for "sideways", shared by the drag, the axis lock and the
    // swipe itself. The lock used to fire at dx > dy while a swipe needed
    // dx > 1.5 * dy: a slightly diagonal thumb stroke then neither scrolled
    // the page nor changed the case - the page just stuck under the thumb.
    const sideways = (dx, dy) => Math.abs(dx) > Math.abs(dy) * 1.5;
    let swipe = null;
    const settle = () => {
      pair.style.transition = "transform .22s ease";
      pair.style.transform = "";
      swipe = null;
    };
    stage.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") return;
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0 };
      pair.style.transition = "none";
    });
    stage.addEventListener("pointermove", (event) => {
      if (!swipe || event.pointerId !== swipe.id) return;
      swipe.dx = event.clientX - swipe.x;
      swipe.dy = event.clientY - swipe.y;
      if (sideways(swipe.dx, swipe.dy) && cases.length > 1) pair.style.transform = `translateX(${swipe.dx * 0.35}px)`;
    });
    stage.addEventListener("pointerup", (event) => {
      if (!swipe || event.pointerId !== swipe.id) return;
      const { dx, dy } = swipe;
      settle();
      if (Math.abs(dx) < 40 || !sideways(dx, dy)) return;
      swipedAt = Date.now();
      step(dx < 0 ? 1 : -1);
    });
    stage.addEventListener("pointercancel", () => { if (swipe) settle(); });
    // Axis lock: once a stroke is clearly sideways, the page must not drift
    // up or down with the thumb. A stroke that starts vertical stays scroll.
    let lock = null;
    stage.addEventListener("touchstart", (event) => {
      const t = event.touches[0];
      lock = event.touches.length === 1 ? { x: t.clientX, y: t.clientY, axis: "" } : null;
    }, { passive: true });
    stage.addEventListener("touchmove", (event) => {
      if (!lock) return;
      const t = event.touches[0];
      if (!lock.axis) {
        const dx = Math.abs(t.clientX - lock.x);
        const dy = Math.abs(t.clientY - lock.y);
        if (dx < 6 && dy < 6) return;
        lock.axis = sideways(dx, dy) ? "x" : "y";
      }
      if (lock.axis === "x" && event.cancelable) event.preventDefault();
    }, { passive: false });
    stage.addEventListener("touchend", () => { lock = null; }, { passive: true });
  }
  root.addEventListener("lifeskin:comparison-cases", (event) => {
    ++request; // Any pending photos from the former list are now obsolete.
    cases = event.detail.filter((entry) => entry.para && entry.pas).map((entry) => ({ ...entry, para: photo(entry.para), pas: photo(entry.pas) }));
    section.hidden = cases.length === 0;
    buttons.forEach((button) => { button.disabled = cases.length < 2; });
    if (!cases.length) return;
    desired = Math.max(0, cases.findIndex((entry) => entry.id === displayedId));
    return show(desired);
  });
  load(cases[0]).catch(() => {});
})();

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
  buttons.forEach((button) => button.addEventListener("click", () => {
    if (cases.length < 2) return;
    desired = (desired + (button.dataset.caseDirection === "prev" ? -1 : 1) + cases.length) % cases.length;
    return show(desired);
  }));
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

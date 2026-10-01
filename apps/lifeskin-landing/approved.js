/* Photo navigation only. The existing app owns both analysis CTAs. */
(function () {
  "use strict";
  const root = document.getElementById("lf-preview");
  if (!root) return;
  const before = root.querySelector("#lf-before");
  const after = root.querySelector("#lf-after");
  const counter = root.querySelector("#lf-case-count");
  const cases = [
    ["/apps/lifeskin/fall-vorher.jpg", "/apps/lifeskin/fall-nachher.jpg"],
    ["/apps/lifeskin-landing/fotot/rasti-2-dita1.webp", "/apps/lifeskin-landing/fotot/rasti-2-dita28.webp"]
  ];
  // Keep the current pair visible until both next photos have loaded.
  const ready = {};
  const load = (index) => ready[index] || (ready[index] = Promise.all(cases[index].map((src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  }))));
  let request = 0;
  let displayed = 1;
  let desired = displayed;
  root.querySelectorAll("[data-case-direction]").forEach((button) => button.addEventListener("click", async () => {
    desired = (desired + (button.dataset.caseDirection === "prev" ? -1 : 1) + cases.length) % cases.length;
    const index = desired;
    const current = ++request;
    try {
      await load(index);
      if (current !== request) return;
      before.src = cases[index][0];
      after.src = cases[index][1];
      before.alt = `Rasti ${index + 1}, para terapisë`;
      after.alt = `Rasti ${index + 1}, pas terapisë`;
      counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(cases.length).padStart(2, "0")}`;
      displayed = index;
    } catch {
      delete ready[index];
      if (current === request) desired = displayed;
    }
  }));
  load(0).catch(() => { delete ready[0]; });
})();

/* Interactions for the approved landing. The existing app owns the analysis CTA. */
(function () {
  "use strict";
  const root = document.getElementById("lf-preview");
  if (!root) return;
  const before = root.querySelector("#lf-before");
  const after = root.querySelector("#lf-after");
  const cases = {
    one: ["/apps/lifeskin/fall-vorher.jpg", "/apps/lifeskin/fall-nachher.jpg"],
    two: ["/apps/lifeskin-landing/fotot/rasti-2-dita1.webp", "/apps/lifeskin-landing/fotot/rasti-2-dita28.webp"]
  };
  // Keep the current pair visible until both photos of the next pair are ready.
  const ready = {};
  const load = (key) => ready[key] || (ready[key] = Promise.all(cases[key].map((src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  }))));
  let request = 0;
  const caseButtons = root.querySelectorAll("[data-case]");
  caseButtons.forEach((button) => button.addEventListener("click", async () => {
    const key = button.dataset.case;
    if (!cases[key]) return;
    const current = ++request;
    try {
      await load(key);
      if (current !== request) return;
      before.src = cases[key][0];
      after.src = cases[key][1];
      const number = key === "one" ? 1 : 2;
      before.alt = `Rasti ${number}, para terapisë`;
      after.alt = `Rasti ${number}, pas terapisë`;
      caseButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    } catch {
      delete ready[key]; // A later tap can retry an interrupted connection.
    }
  }));
  load("one").catch(() => { delete ready.one; });
  const problemButtons = root.querySelectorAll("[data-problem]");
  problemButtons.forEach((button) => button.addEventListener("click", () => {
    problemButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    root.querySelector("#lf-problem-text").textContent = button.dataset.problem;
  }));
})();

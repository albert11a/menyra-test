/* Scroll-linked illustrations only. The existing funnel owns every CTA,
   and approved.js / raste.js own the comparison and Heart case list. */
(function () {
  "use strict";
  const root = document.getElementById("lf-preview");
  const landing = document.getElementById("ls-einstieg");
  if (!root || !landing) return;
  const stories = Array.from(root.querySelectorAll("[data-scene]"));
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const visible = new Set();
  let queued = false;

  function paint() {
    queued = false;
    if (motion.matches || landing.getAttribute("data-aktiv") !== "ja") return;
    const height = window.innerHeight;
    visible.forEach((story) => {
      const stage = story.querySelector(".nx-stage:not([hidden])");
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1,
        (height * 0.85 - rect.top) / (height * 0.65 + rect.height * 0.4)));
      story.style.setProperty("--progress", progress.toFixed(3));
    });
  }

  function request() {
    if (queued || motion.matches || !visible.size) return;
    queued = true;
    window.requestAnimationFrame(paint);
  }

  // These controls illustrate the two existing methods; they do not start
  // a camera or change the funnel choice. The real start buttons still
  // use the existing analysis entry and selection screen.
  const tabs = Array.from(root.querySelectorAll('.nx-demo-tabs [role="tab"]'));
  function select(tab) {
    tabs.forEach((item) => {
      const chosen = item === tab;
      item.setAttribute("aria-selected", String(chosen));
      item.tabIndex = chosen ? 0 : -1;
      const panel = document.getElementById(item.getAttribute("aria-controls"));
      if (panel) panel.hidden = !chosen;
    });
    request();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      const key = event.key;
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
      event.preventDefault();
      const next = key === "Home" ? 0 : key === "End" ? tabs.length - 1
        : (index + (key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      select(tabs[next]);
      tabs[next].focus();
    });
  });

  // Use the same enabled Heart cases as the main comparison. An empty
  // configuration hides proof rather than presenting disabled cases.
  const proof = root.querySelector(".nx-early-proof");
  let proofRequest = 0;
  root.addEventListener("lifeskin:comparison-cases", async (event) => {
    if (!proof || !Array.isArray(event.detail)) return;
    const requestId = ++proofRequest;
    const cases = event.detail.filter((item) => item.para && item.pas).slice(0, 2);
    proof.hidden = true;
    if (!cases.length) return;
    const source = (path) => /^\/apps\/lifeskin-landing\/fotot\/rasti-[a-z0-9-]+\.jpg$/.test(path)
      ? path.replace(/\.jpg$/, ".webp") : path;
    try {
      await Promise.all(cases.flatMap((item) => [item.para, item.pas]).map((path) => new Promise((resolve, reject) => {
        const image = new Image(); image.onload = resolve; image.onerror = reject; image.src = source(path);
      })));
      if (requestId !== proofRequest) return;
      const pairs = proof.querySelectorAll(".nx-proof-thumbs");
      pairs.forEach((pair, index) => {
        pair.hidden = !cases[index];
        if (!cases[index]) return;
        const images = pair.querySelectorAll("img");
        images[0].src = source(cases[index].para);
        images[1].src = source(cases[index].pas);
        images[0].alt = "Para terapisë";
        images[1].alt = "Pas terapisë";
      });
      proof.hidden = false;
    } catch { /* Do not show unconfigured fallback cases when configured photos fail. */ }
  });

  // The still illustration remains readable without JS or observer support.
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    request();
  }, { rootMargin: "100px 0px" });
  stories.forEach((story) => observer.observe(story));
  window.addEventListener("scroll", request, { passive: true });
  document.getElementById("lp")?.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  motion.addEventListener?.("change", request);
})();

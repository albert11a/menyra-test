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
      story.querySelectorAll(".nx-stage").forEach((stage) => {
        const rect = stage.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1,
          (height * 0.85 - rect.top) / (height * 0.65 + rect.height * 0.4)));
        stage.style.setProperty("--progress", progress.toFixed(3));
      });
    });
  }

  function request() {
    if (queued || motion.matches || !visible.size) return;
    queued = true;
    window.requestAnimationFrame(paint);
  }

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

/* Presentation only. Existing funnel and Heart comparison own real actions. */
(function () {
  "use strict";
  const root = document.getElementById("lf-preview");
  const landing = document.getElementById("ls-einstieg");
  if (!root || !landing) return;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const blocks = Array.from(root.querySelectorAll(".reveal"));
  const visible = new Set();
  let frame = 0;
  function paint() {
    frame = 0;
    if (motion.matches || landing.getAttribute("data-aktiv") !== "ja") return;
    visible.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1,
        (window.innerHeight * 0.95 - rect.top) / (window.innerHeight * 0.5 + rect.height * 0.25)));
      element.style.setProperty("--p", progress.toFixed(3));
    });
  }
  function request() {
    if (!frame && !motion.matches && visible.size) frame = window.requestAnimationFrame(paint);
  }
  const sticky = root.querySelector(".sticky");
  const first = document.getElementById("ls-start");
  root.querySelector("[data-clinical-start]")?.addEventListener("click", () => first?.click());
  // Parent visibility also removes this bar when the funnel opens.
  function hideSticky() {
    if (landing.getAttribute("data-aktiv") !== "ja") sticky?.classList.remove("show");
    request();
  }
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      request();
    }, { rootMargin: "100px" });
    blocks.forEach((element) => observer.observe(element));
    if (first && sticky) {
      new IntersectionObserver((entries) => {
        sticky.classList.toggle("show", !entries[0].isIntersecting
          && first.getBoundingClientRect().bottom < 0
          && landing.getAttribute("data-aktiv") === "ja");
      }).observe(first);
    }
  }
  window.addEventListener("scroll", request, { passive: true });
  document.getElementById("lp")?.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  motion.addEventListener?.("change", request);
  new MutationObserver(hideSticky).observe(landing, { attributes: true, attributeFilter: ["data-aktiv"] });

  const rail = root.querySelector(".hero-rail");
  if (!rail) return;
  const slides = Array.from(rail.querySelectorAll("img"));
  const dots = Array.from(root.querySelectorAll(".hero-dots button"));
  const previous = root.querySelector(".hero-prev");
  const next = root.querySelector(".hero-next");
  const current = () => Math.round(rail.scrollLeft / Math.max(1, rail.clientWidth));
  function update() {
    const index = current();
    dots.forEach((dot, i) => dot.setAttribute("aria-pressed", String(i === index)));
    previous.disabled = index <= 0;
    next.disabled = index >= slides.length - 1;
  }
  function show(index) {
    rail.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, index)) * rail.clientWidth,
      behavior: motion.matches ? "instant" : "smooth" });
  }
  dots.forEach((dot, index) => dot.addEventListener("click", () => show(index)));
  previous.addEventListener("click", () => show(current() - 1));
  next.addEventListener("click", () => show(current() + 1));
  rail.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    show(event.key === "Home" ? 0 : event.key === "End" ? slides.length - 1
      : current() + (event.key === "ArrowRight" ? 1 : -1));
  });
  rail.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

import { preisFuer } from "/shared/lifeskin-preise.js";

for (const [name, count] of [["duo", 2], ["single", 1]]) {
  for (const node of document.querySelectorAll(`[data-price="${name}"]`)) node.textContent = `${preisFuer(count)} €`;
}
// Preserve campaign attribution; downstream pages use their existing design.
const incoming = new URLSearchParams(location.search);
for (const link of document.querySelectorAll("[data-analysis], [data-buy]")) {
  const destination = new URL(link.getAttribute("href"), location.origin);
  for (const [key, value] of incoming) {
    if (/^utm_[a-z_]+$/.test(key) || ["fbclid", "gclid", "still"].includes(key)) destination.searchParams.set(key, value);
  }
  link.href = destination.pathname + destination.search + destination.hash;
}
const dock = document.querySelector(".dock");
if (dock && "IntersectionObserver" in window) {
  const heroAction = document.querySelector(".hero [data-analysis]");
  new IntersectionObserver(([entry]) => {
    if (!dock.contains(document.activeElement)) dock.hidden = entry.isIntersecting;
  }, { threshold: 0 }).observe(heroAction);
}

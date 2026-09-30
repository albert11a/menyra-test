import { preisFuer } from "/shared/lifeskin-preise.js";

// Same source of truth as the shop. Native HTML remains usable on slow links.
for (const [name, count] of [["duo", 2], ["single", 1]]) {
  for (const node of document.querySelectorAll(`[data-price="${name}"]`)) {
    node.textContent = `${preisFuer(count)} €`;
  }
}

// Preserve attribution and the owner's silent review flag across the handoff.
// Do not forward funnel-control query parameters supplied to the template.
const incoming = new URLSearchParams(location.search);
for (const link of document.querySelectorAll("[data-analysis], [data-method]")) {
  const destination = new URL(link.getAttribute("href"), location.origin);
  for (const [key, value] of incoming) {
    if (/^utm_[a-z_]+$/.test(key) || ["fbclid", "gclid", "still"].includes(key)) {
      destination.searchParams.set(key, value);
    }
  }
  link.href = destination.pathname + destination.search;
}

// One action in view at a time. Without JS the dock remains available.
const dock = document.querySelector(".dock");
if (dock && "IntersectionObserver" in window) {
  const visible = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    // Never remove keyboard focus from a visitor already using the dock.
    dock.hidden = visible.size > 0 && !dock.contains(document.activeElement);
  }, { threshold: 0 });
  for (const link of document.querySelectorAll("main .button[data-analysis], [data-method]")) observer.observe(link);
}

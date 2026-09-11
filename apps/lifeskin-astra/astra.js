import { STANDARD_KONFIG } from "../lifeskin/lifeskin-catalog.js";
import { AUDIT } from "./audit-data.js";

// Isolated presentation fixture. No report IDs, database, analytics or orders.
const money = `${new Intl.NumberFormat("sq-AL", { maximumFractionDigits: 2 }).format(STANDARD_KONFIG.setPreis)} €`;
document.querySelectorAll("[data-price]").forEach(node => { node.textContent = money; });
document.querySelectorAll("[data-guarantee-days]").forEach(node => { node.textContent = STANDARD_KONFIG.rueckgabeTage; });
document.querySelectorAll("[data-delivery]").forEach(node => { node.textContent = `${STANDARD_KONFIG.lieferzeitTage.join("–")} ditë`; });

const auditButton = document.querySelector("#audit-toggle");
for (const block of document.querySelectorAll("[data-audit]")) {
  const info = AUDIT.find(item => item.id === block.dataset.audit);
  if (!info) continue;
  const note = document.createElement("aside");
  note.className = "audit-note";
  note.lang = "de";
  note.hidden = true;
  const title = document.createElement("strong");
  title.textContent = info.title;
  note.append(title);
  const dl = document.createElement("dl");
  for (const [label, key] of [["Innere Frage", "question"], ["Psychologische Hypothese", "mechanism"], ["Gestaltung", "design"], ["Inhalt / Freigabe", "content"], ["Vermeiden", "avoid"], ["Prüfen", "measure"]]) {
    const pair = document.createElement("div");
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = info[key];
    pair.append(dt, dd);
    dl.append(pair);
  }
  note.append(dl);
  // Outside details so audit guidance does not depend on expansion state.
  if (block.tagName === "DETAILS") block.after(note);
  else block.append(note);
}
function showAudit(enabled) {
  document.body.classList.toggle("audit-on", enabled);
  document.querySelectorAll(".audit-note").forEach(note => { note.hidden = !enabled; });
  auditButton.setAttribute("aria-pressed", String(enabled));
  auditButton.textContent = enabled ? "Audit schließen ×" : "Audit & Aufbau ↗";
}
auditButton.addEventListener("click", () => showAudit(auditButton.getAttribute("aria-pressed") !== "true"));
if (new URLSearchParams(location.search).get("audit") === "1") showAudit(true);

const orderDialog = document.querySelector("#order-dialog");
const helpDialog = document.querySelector("#help-dialog");
let returnFocus = null;
function openDialog(dialog, trigger) {
  returnFocus = trigger;
  dialog.showModal();
  document.body.style.overflow = "hidden";
}
document.querySelectorAll("[data-order]").forEach(button => button.addEventListener("click", () => {
  document.querySelector("#order-content").hidden = false;
  document.querySelector("#order-success").hidden = true;
  document.querySelector("#order-form").reset();
  openDialog(orderDialog, button);
}));
document.querySelectorAll("[data-help]").forEach(button => button.addEventListener("click", () => openDialog(helpDialog, button)));
document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
for (const dialog of [orderDialog, helpDialog]) {
  dialog.addEventListener("close", () => {
    document.body.style.overflow = "";
    if (dialog === orderDialog) document.querySelector("#order-form").reset();
    returnFocus?.focus({ preventScroll: true });
  });
  dialog.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
}
document.querySelector("#order-form").addEventListener("submit", event => {
  event.preventDefault();
  // Deliberately never serialize, persist or transmit entered values.
  event.currentTarget.reset();
  document.querySelector("#order-content").hidden = true;
  const success = document.querySelector("#order-success");
  success.hidden = false;
  success.querySelector("button").focus();
});

const method = document.querySelector("#kufijte");
document.querySelectorAll('a[href="#kufijte"]').forEach(link => link.addEventListener("click", () => { method.open = true; }));
if (location.hash === "#kufijte") method.open = true;

const sticky = document.querySelector("#sticky-purchase");
const offerButton = document.querySelector("#paketa [data-order]");
let sawOffer = false;
if ("IntersectionObserver" in window) {
  const purchaseObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) sawOffer = true;
      sticky.hidden = !sawOffer || entry.isIntersecting;
    }
  }, { threshold: 0 });
  purchaseObserver.observe(offerButton);
  const navObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      document.querySelectorAll(".contents nav a").forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }
  }, { rootMargin: "-10% 0px -65% 0px", threshold: 0 });
  ["rezultati", "plani", "paketa", "ndjekja", "analiza-plote"].forEach(id => navObserver.observe(document.getElementById(id)));
}

import { auth } from "/shared/firebase-config.js";
import { onAuthStateChanged } from "/shared/vendor/firebase/11.0.0/firebase-auth.js";
import { ccEscape as esc } from "../../shared/content-creator.js";
const stages = [
  "Neu",
  "Angeschrieben",
  "Wartet auf Antwort",
  "Kunde",
  "Archiv",
];
const $ = (id) => document.getElementById(id);
let leads = [],
  filter = "",
  next = null;
async function api(op, payload = {}) {
  const user = auth.currentUser;
  if (!user) throw Error("Bitte in Heart anmelden.");
  const res = await fetch("/api/mnyra-v2", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + (await user.getIdToken()),
    },
    body: JSON.stringify({ op: "admin-" + op, ...payload }),
  });
  const out = await res.json();
  if (!res.ok) throw Error(out.error || "Bitte erneut versuchen.");
  return out;
}
function draw() {
  $("filters").innerHTML = ["", ...stages]
    .map(
      (s) =>
        `<button data-filter="${s}" aria-pressed="${filter === s}">${s || "Alle"}</button>`,
    )
    .join("");
  const visible = leads.filter((r) => !filter || r.stage === filter);
  $("list").innerHTML =
    visible
      .map(
        (r) =>
          `<article class="lead" data-slug="${esc(r.slug)}"><h2>${esc(r.name)}</h2><a href="/${esc(r.slug)}" target="_blank" rel="noopener">mnyra.com/${esc(r.slug)}</a><label>Status<select>${stages.map((s) => `<option ${s === r.stage ? "selected" : ""}>${s}</option>`).join("")}</select></label><button data-action="pin">PIN anzeigen</button><button data-action="share">Link teilen</button><button data-action="subscription" aria-pressed="${r.subscribed}">Posto n’MNYRA · ${r.subscribed ? "aktiv" : "freischalten"}</button><p role="status"></p></article>`,
      )
      .join("") || "<p>Keine Leads in dieser Ansicht.</p>";
  if (next)
    $("list").insertAdjacentHTML(
      "beforeend",
      '<button data-action="more">Weitere laden</button>',
    );
}
async function load(after) {
  const requested = filter;
  const out = await api("list", { after, stage: requested });
  if (requested !== filter) return;
  leads = after ? [...leads, ...out.leads] : out.leads;
  next = out.next;
  draw();
}
const report = (e) => {
  $("message").textContent = e.message;
};
onAuthStateChanged(auth, (user) => {
  if (user) load().catch(report);
  else {
    leads = [];
    next = null;
    draw();
    $("message").textContent = "Bitte in Heart anmelden.";
  }
});
$("add").onclick = () => {
  $("create").hidden = !$("create").hidden;
  if (!$("create").hidden) $("create").elements.name.focus();
};
$("create").onsubmit = async (event) => {
  event.preventDefault();
  const form = event.target,
    submit = form.querySelector("button");
  submit.disabled = true;
  try {
    const data = Object.fromEntries(new FormData(form));
    const result = await api("create", data);
    $("message").textContent = "Lead erstellt · PIN " + result.pin + " · ";
    const link = document.createElement("a");
    link.href = "/" + result.slug;
    link.textContent = "Profil öffnen";
    link.target = "_blank";
    link.rel = "noopener";
    $("message").append(link);
    form.reset();
    form.hidden = true;
    filter = "";
    await load();
  } catch (e) {
    report(e);
  } finally {
    submit.disabled = false;
  }
};
document.addEventListener("change", async (event) => {
  const select = event.target;
  if (select.tagName !== "SELECT") return;
  const slug = select.closest("article").dataset.slug,
    row = leads.find((r) => r.slug === slug);
  select.disabled = true;
  try {
    await api("stage", { slug, stage: select.value });
    row.stage = select.value;
    draw();
  } catch (e) {
    select.value = row.stage;
    report(e);
  } finally {
    select.disabled = false;
  }
});
document.addEventListener("click", async (event) => {
  const b = event.target.closest("button");
  if (!b) return;
  if (b.dataset.filter !== undefined) {
    filter = b.dataset.filter;
    next = null;
    leads = [];
    draw();
    try {
      await load();
    } catch (e) {
      report(e);
    }
    return;
  }
  if (!b.dataset.action) return;
  b.disabled = true;
  try {
    if (b.dataset.action === "more") {
      await load(next);
      return;
    }
    const article = b.closest("article"),
      slug = article.dataset.slug,
      row = leads.find((r) => r.slug === slug),
      msg = article.querySelector("p");
    if (b.dataset.action === "pin")
      msg.textContent = "PIN " + (await api("pin", { slug })).pin;
    if (b.dataset.action === "subscription") {
      await api("subscription", { slug, subscribed: !row.subscribed });
      row.subscribed = !row.subscribed;
      draw();
    }
    if (b.dataset.action === "share") {
      const url = "https://mnyra.com/" + slug;
      if (navigator.share) await navigator.share({ url, title: row.name });
      else {
        await navigator.clipboard.writeText(url);
        msg.textContent = "Link kopiert.";
      }
    }
  } catch (e) {
    if (e.name !== "AbortError") report(e);
  } finally {
    b.disabled = false;
  }
});

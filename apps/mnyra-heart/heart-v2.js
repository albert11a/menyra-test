import { ccEscape as esc } from "../../shared/content-creator.js";
const stages = [
  "Neu",
  "Angeschrieben",
  "Wartet auf Antwort",
  "Kunde",
  "Archiv",
];

const mounted = new WeakMap();
const primary = "heart-button heart-button--primary";
const secondary = "heart-button heart-button--secondary";

export function mountHeartV2(root, getIdToken) {
  if (mounted.has(root)) return mounted.get(root);
  root.innerHTML = `
    <div class="heart-section__head"><h2>MNYRA V2</h2><button data-v2="add" class="${primary}">+ Lead</button></div>
    <form data-v2="create" hidden>
      <div class="heart-list-stack">
        <label class="heart-input-field"><span>Restaurantname</span><input name="name" required maxlength="90"></label>
        <label class="heart-input-field"><span>Stadt</span><input name="city" required maxlength="90"></label>
        <label class="heart-crm-modal-field"><span>Land</span><select name="countryCode">
          <option value="xk">Kosovo</option><option value="al">Albanien</option><option value="rs">Serbien</option>
        </select></label>
        <label class="heart-input-field"><span>Profillink (optional)</span><input name="slug" placeholder="restaurant-name" autocapitalize="none" spellcheck="false"></label>
        <button class="${primary}" type="submit">Lead erstellen</button>
      </div>
    </form>
    <p data-v2="message" role="status"></p><p data-v2="list-error" role="status"></p>
    <button class="${secondary}" data-v2="retry" hidden>Liste neu laden</button>
    <div data-v2="filters" class="heart-section__head"></div><div data-v2="list" class="heart-list-stack"></div>`;
  const $ = (key) => root.querySelector(`[data-v2="${key}"]`);
  let leads = [],
    filter = "",
    next = null;
  let revision = 0;
  async function api(op, payload = {}) {
    const token = await getIdToken();
    if (!token) throw Error("Bitte in Heart anmelden.");
    const res = await fetch("/api/mnyra-v2", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + token,
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
          `<button class="${filter === s ? primary : secondary}" data-filter="${s}" aria-pressed="${filter === s}">${s || "Alle"}</button>`,
      )
      .join("");
    const visible = leads.filter((r) => !filter || r.stage === filter);
    $("list").innerHTML =
      visible
        .map(
          (r) =>
            `<article class="heart-list-card" data-slug="${esc(r.slug)}"><h2>${esc(r.name)}</h2><a href="/${esc(r.slug)}" target="_blank" rel="noopener">mnyra.com/${esc(r.slug)}</a><label class="heart-crm-modal-field">Status<select>${stages.map((s) => `<option ${s === r.stage ? "selected" : ""}>${s}</option>`).join("")}</select></label><button class="${secondary}" data-v2-action="pin">PIN anzeigen</button><button class="${secondary}" data-v2-action="share">Link teilen</button><button class="${secondary}" data-v2-action="subscription" aria-pressed="${r.subscribed}">Posto n’MNYRA · ${r.subscribed ? "aktiv" : "freischalten"}</button><p role="status"></p></article>`,
        )
        .join("") || "<p>Keine Leads in dieser Ansicht.</p>";
    if (next)
      $("list").insertAdjacentHTML(
        "beforeend",
        '<button class="heart-button heart-button--secondary" data-v2-action="more">Weitere laden</button>',
      );
  }
  async function load(after) {
    const request = ++revision;
    const requested = filter;
    const out = await api("list", { after, stage: requested });
    if (request !== revision) return;
    leads = after ? [...leads, ...out.leads] : out.leads;
    next = out.next;
    $("list-error").textContent = "";
    $("retry").hidden = true;
    draw();
  }
  const report = (e) => {
    $("message").textContent = e.message;
  };
  const reportListError = (e) => {
    $("list-error").textContent = "Liste konnte nicht geladen werden. " + e.message;
    $("retry").hidden = false;
  };

  $("retry").onclick = async () => {
    $("retry").disabled = true;
    try {
      await load();
    } catch (e) {
      reportListError(e);
    } finally {
      $("retry").disabled = false;
    }
  };
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
      $("message").textContent = (result.existing ? "Lead bereits vorhanden · PIN " : "Lead erstellt · PIN ") + result.pin + " · ";
      const link = document.createElement("a");
      link.href = "/" + result.slug;
      link.textContent = "mnyra.com/" + result.slug;
      link.target = "_blank";
      link.rel = "noopener";
      $("message").append(link);
      form.reset();
      form.hidden = true;
      filter = "";
      await load().catch(reportListError);
    } catch (e) {
      report(e);
    } finally {
      submit.disabled = false;
    }
  };
  root.addEventListener("change", async (event) => {
    const select = event.target;
    if (!select.matches("article[data-slug] select")) return;
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
  root.addEventListener("click", async (event) => {
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
        reportListError(e);
      }
      return;
    }
    if (!b.dataset.v2Action) return;
    b.disabled = true;
    try {
      if (b.dataset.v2Action === "more") {
        await load(next).catch(reportListError);
        return;
      }
      const article = b.closest("article"),
        slug = article.dataset.slug,
        row = leads.find((r) => r.slug === slug),
        msg = article.querySelector("p");
      if (b.dataset.v2Action === "pin")
        msg.textContent = "PIN " + (await api("pin", { slug })).pin;
      if (b.dataset.v2Action === "subscription") {
        await api("subscription", { slug, subscribed: !row.subscribed });
        row.subscribed = !row.subscribed;
        draw();
      }
      if (b.dataset.v2Action === "share") {
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
  const refresh = () => load().catch(reportListError);
  mounted.set(root, refresh);
  refresh();
  return refresh;
}

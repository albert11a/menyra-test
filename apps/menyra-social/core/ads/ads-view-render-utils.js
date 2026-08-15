// Mnyra Ads - der eigene Ort fuer Werbung eines Lokals.
//
// Die Karte "Lësho Rreklam" im Panel fuehrt hierher. Was hier spaeter steht
// (Anzeigen anlegen, Reichweite, Budget), ist noch nicht gebaut - deshalb
// steht hier vorerst eine ehrliche Seite und kein leerer Rahmen.
//
// Warum ueberhaupt schon eine eigene Seite: der Weg gehoert nicht in den
// Menue-Editor. Solange die Karte dorthin zeigte, fuehrte sie an einen Ort,
// der mit Werbung nichts zu tun hat. Ein eigener Tab kostet fast nichts und
// macht den Weg von Anfang an richtig - was darin steht, kann danach wachsen,
// ohne dass Karte, Adresse oder Navigation noch einmal angefasst werden
// muessen.

function esc(escapeHtmlFn, value = "") {
  return typeof escapeHtmlFn === "function"
    ? escapeHtmlFn(value)
    : String(value || "");
}

function safeIcon(iconFn, name = "", className = "") {
  return typeof iconFn === "function" ? iconFn(name, className) : "";
}

// Ohne Lokal gibt es nichts zu bewerben. Derselbe Ton wie in der Analitika:
// sagen, warum die Seite leer ist, statt sie leer zu lassen.
export function renderAdsNoBusinessStateCore({ escapeHtml, iconFn } = {}) {
  return renderAdsShellCore({
    escapeHtml,
    iconFn,
    iconName: "store",
    title: "Nuk ka profil biznesi te lidhur",
    body: "Mnyra Ads eshte vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje lokal, reklamat shfaqen ketu."
  });
}

export function renderAdsComingSoonStateCore({ escapeHtml, iconFn } = {}) {
  return renderAdsShellCore({
    escapeHtml,
    iconFn,
    iconName: "megaphone",
    title: "Mnyra Ads",
    body: "Ktu do te mund te lesosh reklama per biznesin tend dhe te arrish klientet ne qytetin tend. Po e pergatisim - se shpejti."
  });
}

function renderAdsShellCore({ escapeHtml, iconFn, iconName = "megaphone", title = "", body = "" } = {}) {
  return `
    <section class="p-6 pb-24 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-ads-root>
      <div style="background:#ffffff; border:1px solid #f1f5f9; border-radius:25px; padding:28px 22px; text-align:center;">
        <div style="width:56px; height:56px; margin:0 auto 16px; border-radius:18px; background:#eef2ff; color:#4f46e5; display:flex; align-items:center; justify-content:center;">
          ${safeIcon(iconFn, iconName, "w-6 h-6")}
        </div>
        <p style="margin:0; font-size:17px; font-weight:900; letter-spacing:-0.01em; color:#0f172a;">${esc(escapeHtml, title)}</p>
        <p style="margin:8px 0 0; font-size:12px; font-weight:700; line-height:1.5; color:#94a3b8;">${esc(escapeHtml, body)}</p>
      </div>
    </section>
  `;
}

// Die Seite entscheidet nur eines: gibt es ein Lokal oder nicht. Alles Weitere
// kommt, wenn Mnyra Ads gebaut ist.
export function renderAdsViewCore({ hasBusiness = false, escapeHtml, iconFn } = {}) {
  return hasBusiness
    ? renderAdsComingSoonStateCore({ escapeHtml, iconFn })
    : renderAdsNoBusinessStateCore({ escapeHtml, iconFn });
}

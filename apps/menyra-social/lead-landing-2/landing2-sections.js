// Die Abschnitte von Landing 2 - die Reihenfolge, in der ein Wirt Mnyra
// versteht.
//
// Reine String-Funktionen. Kein DOM, kein State, kein Schreibpfad.
//
// Die Reihenfolge ist der eigentliche Inhalt dieser Datei, und sie ist nicht
// beliebig:
//
//   mein Lokal -> mein fertiges Profil -> das kostet nichts ->
//   so werde ich gefunden -> ach so, DAS ist Mnyra -> es geht bis an den
//   Tisch -> bis hierhin 0 € -> und wenn ich mehr will, gibt es das auch
//
// Nicht mit "Mnyra ist eine Plattform" anfangen. Nicht mit Preisen anfangen.
// Nicht mit Funktionen anfangen. Wer die Seite oeffnet, kennt Mnyra nicht und
// hat keine Zeit - das Einzige, was ihn im ersten Augenblick haelt, ist sein
// eigenes Lokal.
//
// Ein Gedanke pro Abschnitt. Und ein Grundsatz fuer die ganze Seite: Es
// wechselt nie etwas, ohne dass vorher dasteht, was kommt. Wer scrollt und
// ploetzlich einen anderen Bildschirm vor sich hat, fragt sich "warum?" -
// und wer sich das fragt, liest nicht weiter.

import { esc, text } from "./landing2-format.js";
import { icon } from "./landing2-icons.js";
import {
  previewBiznesi,
  previewGo,
  previewHarta,
  previewKerko,
  previewLokalet,
  previewMenu,
  previewOrbit,
  previewOrder,
  previewPosts,
  previewProduct,
  previewProfileCard,
  previewProfileTabs,
  previewQr,
  previewQyteti,
  previewSave,
  previewVision,
  resolveSearchTerm,
  screen
} from "./landing2-preview.js";

/* ------------------------------------------------------------- Bausteine */

function head(title = "", lead = "", { eyebrow = "" } = {}) {
  return `
    ${eyebrow ? `<p class="l2-eyebrow">${esc(eyebrow)}</p>` : ""}
    <h2 class="l2-h2">${esc(title)}</h2>
    ${lead ? `<p class="l2-lead">${esc(lead)}</p>` : ""}
  `;
}

// Ein ruhiger Abschnitt: Text oben, ein Bild darunter. Mehr braucht es an den
// meisten Stellen nicht - und weil der Text immer vor dem Bild steht, weiss
// man schon, worauf man gleich schaut.
function section({ track = "", tone = "", body = "" }) {
  return `
    <section class="l2-section${tone ? ` l2-section--${tone}` : ""}"${track ? ` data-track="${esc(track)}"` : ""}>
      <div class="l2-inner">${body}</div>
    </section>
  `;
}

// Ein Abschnitt mit einem Mnyra-Bildschirm darunter. Derselbe Aufbau wie
// oben, nur dass die Flaeche die volle Breite bekommt.
function screenSection({ track = "", tone = "", head: headHtml = "", screen: screenHtml = "", foot = "" }) {
  return `
    <section class="l2-section l2-section--screen${tone ? ` l2-section--${tone}` : ""}"${track ? ` data-track="${esc(track)}"` : ""}>
      <div class="l2-inner">${headHtml}</div>
      <div class="l2-inner l2-screenwrap">${screenHtml}</div>
      ${foot ? `<div class="l2-inner">${foot}</div>` : ""}
    </section>
  `;
}

// Eine Sequenz: Die Flaeche bleibt stehen, der Ausschnitt wechselt.
//
// Warum ueberhaupt: Das Profil eines Lokals ist lang. Verkleinert man es, bis
// es auf einen Bildschirm passt, ist nichts mehr zu lesen - und ein Wirt, der
// seine eigene Karte nicht lesen kann, glaubt ihr auch nicht. Also bleibt die
// Flaeche gross und stehen, und beim Scrollen wechselt, was darauf zu sehen
// ist.
//
// Vier Regeln, damit das nicht ueberrascht:
//
//  1. Eine Vorschau, ein Ort. Was hier in der Buehne steht, steht nicht
//     ausserdem noch einmal als eigener Abschnitt darueber oder darunter.
//     Sonst liest es sich als "dasselbe noch einmal", und ab da liest man
//     quer.
//  2. Der Satz gehoert zur Flaeche. Er steht unmittelbar darueber und
//     wechselt mit ihr - nicht als grosse Ueberschrift zweihundert Punkte
//     weiter oben.
//  3. Die Buehne behaelt ihre Masse. Gleiche Breite, gleiche Hoehe, gleicher
//     Ort, bei jedem Schritt. Nur der Inhalt darin wechselt. Auch der Kasten
//     der Beschriftung bekommt die Hoehe seines laengsten Satzes
//     (landing2-scroll.js) - sonst ruecken Buehne und Punkte bei jedem
//     Wechsel um eine Zeile.
//  4. Genug Weg dazwischen. Ein Schritt bekommt eine ganze Bildschirmhoehe.
//
// Die Reihenfolge im Markup ist die Reihenfolge der Schritte, und das ist
// keine Kosmetik: Die Flaechen liegen uebereinander, und der spaetere Schritt
// blendet ueber dem frueheren auf. Waeren sie anders sortiert, blendete beim
// Wechsel der Grund der Seite durch.
//
// steps: [{ view, title, body, screen }]
function sequence({ key = "", track = "", steps = [] }) {
  if (!steps.length) return "";
  return `
    <section class="l2-seq" data-seq="${esc(key)}" data-step="0"
      style="--l2-steps:${steps.length};"${track ? ` data-track="${esc(track)}"` : ""}>
      <div class="l2-seq__sticky">
        <div class="l2-inner l2-seq__inner">
          <div class="l2-seq__captions">
            ${steps.map((step, index) => `
              <div class="l2-seq__caption" data-caption="${index}"${index ? ` aria-hidden="true"` : ""}>
                <h2 class="l2-seq__title">${esc(step.title)}</h2>
                ${step.body ? `<p class="l2-seq__sub">${esc(step.body)}</p>` : ""}
              </div>
            `).join("")}
          </div>
          <div class="l2-seq__stage">
            ${steps.map((step, index) => `
              <div class="l2-seq__view" data-viewkey="${esc(step.view)}"${index ? ` aria-hidden="true"` : ""}>
                ${step.screen}
              </div>
            `).join("")}
          </div>
          <div class="l2-seq__dots" aria-hidden="true">
            ${steps.map((_, index) => `<span class="l2-seq__dot${index === 0 ? " is-active" : ""}"></span>`).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function checkList(items = []) {
  return `
    <ul class="l2-checks">
      ${items.map((item) => `<li class="l2-check">${icon("check", "w-4 h-4")}<span>${esc(item)}</span></li>`).join("")}
    </ul>
  `;
}

/* ------------------------------------------- Akt 1 - Das ist dein Lokal */

// Der erste Bildschirm darf nicht wie Werbung aussehen.
//
// Deshalb steht hier kein Satz ueber Mnyra, kein Versprechen und kein Angebot -
// sondern sein Logo und sein Name. Die einzige Frage, die dieser Bildschirm
// ausloesen soll, ist: "Warum ist mein Lokal hier?" Beantwortet wird sie beim
// Weiterscrollen.
//
// Und hier steht ausdruecklich KEINE Vorschau mehr.
//
// Frueher lief unten das eigene Profil an - und einen Wisch weiter stand
// dasselbe Profil noch einmal, gross, als erster Schritt der Sequenz. Wer das
// sah, las nicht "hier faengt etwas an", sondern "das hatte ich doch schon".
// Es gibt jetzt genau eine Burger-Nora-Buehne, und sie faengt direkt unter
// diesem Bildschirm an: Der Kopf ist absichtlich kuerzer als ein Bildschirm,
// damit der obere Rand der Buehne schon zu sehen ist, ohne dass jemand einen
// Pfeil oder das Wort "scroll" braucht.
export function renderHero(profile = {}) {
  return `
    <header class="l2-hero" data-track="hyrje">
      <div class="l2-inner l2-hero__inner">
        <p class="l2-hero__brand">MNYRA</p>
        <span class="l2-hero__logo">${
          text(profile.logoUrl)
            ? `<img src="${esc(profile.logoUrl)}" alt="${esc(text(profile.name))} logo" loading="eager" fetchpriority="high" decoding="async" />`
            : `<span class="l2-hero__letter">${esc((text(profile.name) || "M").slice(0, 1).toUpperCase())}</span>`
        }</span>
        <p class="l2-hero__name">${esc(text(profile.name))}</p>
        <h1 class="l2-hero__title">Kemi përgatitur diçka për ty.</h1>
        <p class="l2-hero__sub">Profili yt në MNYRA është gati.</p>
      </div>
    </header>
  `;
}

/* ------------------------------------- Akt 1B - Das eigene Profil erleben */

// Eine Buehne, drei Saetze. Kein zweites Profil, kein zweiter Kopf, keine
// Ueberschrift, die losgeloest ueber einer weiteren Flaeche steht.
//
// Der Wirt sieht sein Profil, liest "Postimet e tua" und sieht seine Beitraege
// an derselben Stelle, liest "Menuja jote" und sieht seine Karte. Zwischen den
// Saetzen schiebt der Scrollstand den Inhalt im Fenster nach oben - ein Profil
// ist laenger als 450 Punkte, und so bekommt er den Rest zu sehen, ohne dass
// er in der Vorschau selbst wischen muesste.
//
// Drei Schritte, nicht mehr. Das Produktdetail war hier der vierte; es steht
// jetzt als eigener Abschnitt darunter. Vier Wechsel in einer stehenden
// Flaeche waren einer zu viel: Beim letzten wusste man nicht mehr, ob man noch
// im Profil ist oder schon woanders.
export function renderProfileSequence(profile = {}, posts = [], menuItems = [], focusItems = []) {
  const name = text(profile.name);
  return sequence({
    key: "profil",
    track: "profili",
    steps: [
      {
        view: "profil",
        title: "Profili yt",
        body: "Ballina, logoja, emri, informacionet. Gjithçka gati.",
        screen: screen(
          `<div class="app-content-inline pb-2 pt-4">${previewProfileCard(profile, { eager: true })}</div>${previewProfileTabs("posts")}`,
          { label: `Profili i ${name}`, pan: true }
        )
      },
      {
        view: "postime",
        title: "Postimet e tua",
        body: "Trego çfarë po ndodh te ti.",
        screen: screen(
          `${previewProfileTabs("posts")}${previewPosts(posts)}`,
          { label: `Postimet e ${name}`, pan: true }
        )
      },
      {
        view: "menu",
        title: "Menuja jote",
        body: "Foto, çmime, përshkrime dhe alergjenë.",
        screen: screen(
          `${previewProfileTabs("menu")}${previewMenu(profile, menuItems, focusItems)}`,
          { label: `Menuja e ${name}`, pan: true }
        )
      }
    ]
  });
}

// Das Produktdetail - der Bildschirm, den ein Gast sieht, wenn er ein Produkt
// antippt. Als eigener Abschnitt: Text oben, Bildschirm darunter.
export function renderProduct(profile = {}, menuItems = []) {
  return screenSection({
    track: "produkti",
    head: head("Gjithçka që klienti duhet të dijë.", "Foto, çmim, përshkrim, përbërës, alergjenë."),
    screen: screen(previewProduct(profile, menuItems), { surface: "white", label: "Detajet e produktit" })
  });
}

/* --------------------------------------- Akt 1C - Und das kostet nichts */

export function renderFree() {
  return section({
    track: "falas",
    tone: "soft",
    body: `
      ${head("Dhe kjo është falas.")}
      ${checkList(["Profili", "Menuja", "Postimet", "Story", "Ofertat", "QR"])}
      <p class="l2-price">0 €<span class="l2-price__unit">/ muaj</span></p>
      <p class="l2-note">Pa abonim. Pa kontratë.</p>
    `
  });
}

/* --------------------------------- Akt 2 - Mnyra macht das Lokal sichtbar */

export function renderDiscoveryIntro() {
  return section({
    track: "zbulimi",
    body: head("Profili yt nuk qëndron vetëm këtu.", "MNYRA të vendos aty ku klientët kërkojnë.")
  });
}

// Der groesste Verkaufsmoment der Seite: vier Orte, an denen ein Gast auf
// dieses Lokal stoesst, ohne es zu suchen. Vier Schritte in einer Buehne -
// einer je Ort, und keiner mehr.
//
// Auch hier gilt: eine Vorschau, ein Ort. Qyteti, Harta, Lokalet und Kerko
// kommen auf der ganzen Seite genau hier vor - kein Abschnitt weiter unten
// zeigt sie noch einmal.
export function renderDiscoverySequence(profile = {}, posts = [], focusItems = [], menuItems = [], neighbours = []) {
  const term = resolveSearchTerm(profile, menuItems);
  return sequence({
    key: "zbulimi",
    track: "kudo",
    steps: [
      {
        view: "qyteti",
        title: "Qyteti",
        body: "Njerëzit rreth teje shohin çfarë poston.",
        screen: screen(previewQyteti(profile, posts, focusItems, neighbours), {
          pills: "feed",
          label: "Qyteti - feed lokal",
          pan: true
        })
      },
      {
        view: "harta",
        title: "Harta",
        body: "Të gjejnë kur janë afër.",
        // Die Karte fuellt ihr Fenster - hier gibt es nichts zu schieben.
        screen: screen(previewHarta(profile, neighbours), {
          label: "Harta me lokalet përreth",
          surface: "map"
        })
      },
      {
        view: "lokalet",
        title: "Lokalet",
        body: "Kur kërkojnë ku të hanë apo të pinë.",
        screen: screen(previewLokalet(profile, neighbours), {
          pills: "restaurants",
          label: "Lista e lokaleve",
          pan: true
        })
      },
      {
        view: "kerko",
        title: "Kërko",
        body: `Të gjejnë kur kërkojnë pikërisht "${term}".`,
        screen: screen(previewKerko(profile, menuItems, neighbours), { label: "Kërkimi në Mnyra" })
      }
    ]
  });
}

export function renderDiscoveryClose() {
  return section({
    track: "nje-profil",
    tone: "accent",
    body: `<p class="l2-statement">Një profil.<br />Shumë vende ku mund të të gjejnë.</p>`
  });
}

/* --------------------------- Akt 3 - Jetzt erst: Was ist Mnyra ueberhaupt */

// Erst hier. Vorher haette der Satz nichts bedeutet - jetzt hat der Wirt
// gesehen, wovon er handelt.
export function renderWhatIsMnyra() {
  const steps = [
    { key: "zbulo", title: "ZBULO", body: "Qyteti · Harta · Lokalet · Kërko", iconName: "search" },
    { key: "zgjidh", title: "ZGJIDH", body: "Profil · Menu · Oferta", iconName: "store" },
    { key: "shko", title: "SHKO", body: "Lokacion", iconName: "map-pin" },
    { key: "tavolina", title: "NË TAVOLINË", body: "QR · Menu", iconName: "scan-qr-code" }
  ];
  return section({
    track: "cka-eshte",
    tone: "dark",
    body: `
      ${head("MNYRA është platforma e gastronomisë.")}
      <ol class="l2-flow">
        ${steps.map((step) => `
          <li class="l2-flow__step">
            <span class="l2-flow__icon" aria-hidden="true">${icon(step.iconName, "w-[18px] h-[18px]")}</span>
            <span class="l2-flow__text">
              <strong>${esc(step.title)}</strong>
              <span>${esc(step.body)}</span>
            </span>
          </li>
        `).join("")}
      </ol>
      <p class="l2-statement l2-statement--sm">Gjithçka në një MNYRA.</p>
    `
  });
}

/* --------------------------- Akt 4 - Von der Entdeckung bis an den Tisch */

// Ein Abschnitt, ein neuer Bildschirm.
//
// Frueher standen hier vier Abschnitte hintereinander, und drei davon zeigten
// noch einmal, was der Wirt eine Minute vorher schon gesehen hatte: das
// Kerko-Fenster aus der Zbulim-Sequenz, sein Profil aus der ersten Sequenz,
// seine Menue ebenfalls von dort. Wer hier ankam, sah nicht "der Weg geht
// weiter", sondern "die Seite faengt von vorne an".
//
// Der Weg selbst ist eine Abfolge und laesst sich in vier Zeilen sagen. Der
// einzige Bildschirm, den es an dieser Stelle noch nicht gab, ist der
// Aufsteller auf dem Tisch - und nur der steht hier.
export function renderTableFlow(profile = {}) {
  const steps = [
    "Klienti të gjen në MNYRA.",
    "Vjen te ti dhe ulet.",
    "Skanon MNYRA QR në tavolinë.",
    "Profili dhe menuja jote hapen."
  ];
  return screenSection({
    track: "tavolina",
    head: head("MNYRA nuk mbaron te dera.", "Vazhdon në tavolinë."),
    screen: screen(previewQr(profile), { surface: "qr", label: "QR kodi në tavolinë" }),
    foot: `
      <ol class="l2-steps">
        ${steps.map((line) => `<li class="l2-steps__item">${esc(line)}</li>`).join("")}
      </ol>
      <p class="l2-note">QR-i dhe menuja janë falas, edhe pa porosi. Porosia është opsionale.</p>
    `
  });
}

/* ------------------------------------------- Akt 4B - Ueberall dieselbe */

// Ein Bild, nicht zehn Karten: dieselbe Reihe Lokale, jedes mit demselben
// Zeichen in der Ecke. Der Satz darunter sagt, warum das etwas wert ist -
// nicht fuer Mnyra, sondern fuer den Kellner, der es sonst jedem Gast einzeln
// erklaeren muss.
export function renderStandard(profile = {}, neighbours = []) {
  return section({
    track: "kudo-njejta",
    body: `
      ${head("E njëjta MNYRA. Kudo.", "Klienti e njeh. Kamerieri s'ka nevojë ta shpjegojë çdo herë.")}
      ${previewVision(profile, neighbours)}
      <p class="l2-note">I njëjti QR. E njëjta menu. I njëjti orientim.</p>
    `
  });
}

/* ----------------------------------------------- Akt 5 - Bis hierhin 0 € */

export function renderZeroCut() {
  return section({
    track: "zero",
    tone: "accent",
    body: `
      <p class="l2-eyebrow">Deri këtu?</p>
      <p class="l2-price l2-price--xl">0 €</p>
      ${checkList(["Profili", "Menuja", "QR", "Postimet", "Harta", "Zbulimi"])}
      <p class="l2-note">MNYRA mbetet falas.</p>
      <p class="l2-sub">Dëshiron më shumë?</p>
      <p class="l2-note">Aktivizo vetëm atë që të duhet.</p>
    `
  });
}

/* ---------------------------------------- Akt 6 - Optional: Mnyra Order */

// Jede optionale Funktion faengt mit einem Problem an, nicht mit ihrem Namen.
// Ein Wirt kauft keine Funktion; er loest ein Problem, das er kennt.
export function renderOrder(profile = {}, menuItems = [], orderPrice = "") {
  return screenSection({
    track: "porosia",
    head: head("Kamerieri është i zënë?", "Klienti porosit vetë.", { eyebrow: "Opsionale · MNYRA Order" }),
    screen: screen(previewOrder(profile, menuItems), { label: "Porosia nga tavolina" }),
    foot: `
      ${checkList([
        "Më pak pritje për klientin",
        "Më pak rrugë për kamerierin",
        "Ideale për terracë dhe orët e pikut"
      ])}
      <p class="l2-pricetag">${esc(orderPrice)} për çdo produkt të porositur</p>
      <p class="l2-note">0 porosi = 0 €.</p>
    `
  });
}

/* ------------------------------------------- Akt 7 - Optional: Mnyra GO */

// Die Preise hier sind die echten aus shared/go/go-commission-core.js. Eine
// geschaetzte Zahl waere hier die teuerste Zeile der Seite: Wer beim ersten
// Preis merkt, dass er nicht stimmt, glaubt der Seite nichts mehr.
export function renderGo(profile = {}, focusItems = [], menuItems = [], goPrices = []) {
  return screenSection({
    track: "go",
    tone: "soft",
    head: head("Ke tavolina bosh?", "MNYRA GO të sjell klientë.", { eyebrow: "Opsionale · MNYRA GO" }),
    screen: screen(previewGo(profile, focusItems, menuItems), { surface: "white", label: "Oferta jote në Mnyra GO" }),
    foot: `
      <p class="l2-sub">Ne të lidhim me njerëz që po kërkojnë ku të shkojnë.</p>
      ${goPrices.length ? `
        <table class="l2-pricetable">
          <caption class="l2-pricetable__caption">Paguan vetëm kur oferta konfirmohet.</caption>
          <tbody>
            ${goPrices.map((row) => `
              <tr>
                <th scope="row">${esc(row.label)}</th>
                <td>${esc(row.price)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : ""}
      <p class="l2-note">Paguaj vetëm kur ka rezultat.</p>
    `
  });
}

/* ----------------------------------------- Akt 8 - Optional: Mnyra SAVE */

// SAVE gibt es noch nicht. Es steht hier trotzdem - aber als "po vjen" und
// nicht als Angebot. Ein Wirt, der es morgen sucht und nicht findet, haette
// zu Recht das Gefuehl, angelogen worden zu sein.
export function renderSave(profile = {}, menuItems = []) {
  return screenSection({
    track: "save",
    head: head("Ka mbetur ushqim?", "Mos e hidh. Shite.", { eyebrow: "Po vjen · MNYRA SAVE" }),
    screen: screen(previewSave(profile, menuItems), { label: "Si do të funksionojë Mnyra SAVE" }),
    foot: `
      <p class="l2-note">Nuk shitet = nuk paguan.</p>
      <p class="l2-sub l2-sub--small">MNYRA SAVE është në përgatitje. Do ta njoftojmë kur të jetë gati.</p>
    `
  });
}

/* ------------------------------------------------------- Akt 9 - Biznesi */

export function renderBiznesi(profile = {}, posts = [], menuItems = []) {
  return screenSection({
    track: "biznesi",
    tone: "soft",
    head: head("Gjithçka nga një vend.", "Ti kontrollon gjithçka."),
    screen: screen(previewBiznesi(profile, posts, menuItems), { label: "Paneli Biznesi" }),
    foot: `<p class="l2-note">Më pak punë, jo më shumë.</p>`
  });
}

/* -------------------------------------------------------- Akt 10 - Vision */

// Dasselbe Thema wie oben, aber bewusst ein anderes Bild.
//
// Oben lag die Reihe nebeneinander: "in jedem Lokal dasselbe Zeichen". Hier
// liegt Mnyra in der Mitte und die Lokale darum: "eine Mitte fuer alles".
// Waere es zweimal dieselbe Reihe, waere das die Stelle, an der ein Leser
// denkt "das hatte ich schon" - und ab da liest er quer.
export function renderVision(profile = {}, neighbours = []) {
  const lines = [
    "Kafe? → MNYRA",
    "Drekë? → MNYRA",
    "Event? → MNYRA",
    "Në tavolinë? → MNYRA"
  ];
  return section({
    track: "vizioni",
    tone: "dark",
    body: `
      ${head("Një MNYRA. Kudo.")}
      ${previewOrbit(profile, neighbours)}
      <ul class="l2-lines">
        ${lines.map((line) => `<li>${esc(line)}</li>`).join("")}
      </ul>
      <p class="l2-statement l2-statement--sm">Klientët do ta njohin MNYRA-n.<br />Dhe në MNYRA do të gjejnë ty.</p>
    `
  });
}

/* ------------------------------------------ Akt 11 - Zurueck zum Lokal */

// Die Seite hat mit seinem Logo angefangen und hoert mit seinem Logo auf.
// Dazwischen stand alles andere; hier steht wieder nur er.
export function renderClosing(profile = {}, { claimUrl = "" } = {}) {
  return `
    <section class="l2-section l2-section--close" data-track="fundi">
      <div class="l2-inner">
        <span class="l2-close__logo">${
          text(profile.logoUrl)
            ? `<img src="${esc(profile.logoUrl)}" alt="${esc(text(profile.name))} logo" loading="lazy" decoding="async" />`
            : `<span class="l2-hero__letter">${esc((text(profile.name) || "M").slice(0, 1).toUpperCase())}</span>`
        }</span>
        <p class="l2-close__name">${esc(text(profile.name))}</p>
        <h2 class="l2-h2">Biznesi yt është gati.</h2>
        <p class="l2-price l2-price--close">0 €</p>
        <p class="l2-lead">Merre profilin tënd dhe fillo falas.</p>
        ${claimUrl
          ? `<a class="l2-cta" href="${esc(claimUrl)}" data-l2-claim>Merr biznesin tim</a>`
          : `<button type="button" class="l2-cta" data-l2-claim>Merr biznesin tim</button>`}
        <p class="l2-note">Falas · Pa abonim · Funksionet shtesë janë opsionale</p>
      </div>
    </section>
  `;
}

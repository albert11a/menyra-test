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
// Ein Gedanke pro Abschnitt. Wo zwei Gedanken standen, ist einer zu viel.

import { esc, text } from "./landing2-format.js";
import { icon } from "./landing2-icons.js";
import {
  logo,
  previewBiznesi,
  previewGo,
  previewHarta,
  previewKerko,
  previewLokalet,
  previewMenu,
  previewOrder,
  previewPosts,
  previewProduct,
  previewProfile,
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
// meisten Stellen nicht.
function section({ track = "", tone = "", body = "" }) {
  return `
    <section class="l2-section${tone ? ` l2-section--${tone}` : ""}"${track ? ` data-track="${esc(track)}"` : ""}>
      <div class="l2-inner">${body}</div>
    </section>
  `;
}

// Eine Sequenz: Die Flaeche bleibt stehen, der Ausschnitt wechselt.
//
// Warum ueberhaupt: Das Profil eines Lokals ist lang. Verkleinert man es, bis
// es auf einen Bildschirm passt, ist nichts mehr zu lesen - und ein Wirt, der
// seine eigene Karte nicht lesen kann, glaubt ihr auch nicht. Also bleibt die
// Flaeche gross und stehen, und beim Scrollen wechselt, was darauf zu sehen
// ist. Ein Schritt, ein Satz.
//
// steps: [{ view, title, body }]
//   view zeigt auf einen Schluessel in views.
//
// Das Markup traegt alle Ansichten gleichzeitig. Umgeschaltet wird ueber
// data-step am Abschnitt - das ist ein Attribut, kein Umbau: Der Browser
// blendet um, statt Knoten zu tauschen. Ein Tausch waere an dieser Stelle das
// Einzige, was auf dem Handy sichtbar haken wuerde.
function sequence({ key = "", track = "", views = {}, steps = [] }) {
  const names = Object.keys(views);
  if (!names.length || !steps.length) return "";
  const first = steps[0].view;
  return `
    <section class="l2-seq" data-seq="${esc(key)}" data-step="0" data-view="${esc(first)}"
      style="--l2-steps:${steps.length};"${track ? ` data-track="${esc(track)}"` : ""}>
      <div class="l2-seq__rail" aria-hidden="true"></div>
      <div class="l2-seq__sticky">
        <div class="l2-inner l2-seq__inner">
          <div class="l2-seq__captions">
            ${steps.map((step, index) => `
              <div class="l2-seq__caption${index === 0 ? " is-active" : ""}" data-caption="${index}">
                <h2 class="l2-h2">${esc(step.title)}</h2>
                ${step.body ? `<p class="l2-lead">${esc(step.body)}</p>` : ""}
              </div>
            `).join("")}
          </div>
          <div class="l2-seq__stage">
            ${names.map((name) => `
              <div class="l2-seq__view${name === first ? " is-active" : ""}" data-viewkey="${esc(name)}">
                ${views[name]}
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
      ${items.map((item) => `<li class="l2-check">${icon("check", { size: 16 })}<span>${esc(item)}</span></li>`).join("")}
    </ul>
  `;
}

/* ------------------------------------------- Akt 1 - Das ist dein Lokal */

// Der erste Bildschirm darf nicht wie Werbung aussehen.
//
// Deshalb steht hier kein Satz ueber Mnyra, kein Versprechen und kein Angebot -
// sondern sein Logo, sein Name und der Anfang seines eigenen Profils. Die
// einzige Frage, die dieser Bildschirm ausloesen soll, ist: "Warum ist mein
// Lokal hier?" Beantwortet wird sie beim Weiterscrollen.
export function renderHero(profile = {}) {
  return `
    <header class="l2-hero" data-track="hyrje">
      <div class="l2-inner l2-hero__inner">
        <p class="l2-hero__brand">MNYRA</p>
        <span class="l2-hero__logo">${logo(profile.logoUrl, profile.name, { eager: true })}</span>
        <p class="l2-hero__name">${esc(profile.name)}</p>
        <h1 class="l2-hero__title">Kemi përgatitur diçka për ty.</h1>
        <p class="l2-hero__sub">Profili yt në MNYRA është gati.</p>
      </div>
      <div class="l2-hero__peek">
        <div class="l2-inner">
          ${screen("Profili", previewProfile(profile, { eager: true }), { tab: "", chrome: false, label: `Profili i ${text(profile.name)} në Mnyra` })}
        </div>
      </div>
    </header>
  `;
}

/* ------------------------------------- Akt 1B - Das eigene Profil erleben */

export function renderProfileSequence(profile = {}, posts = [], menuItems = [], focusItems = []) {
  const name = text(profile.name);
  return sequence({
    key: "profil",
    track: "profili",
    views: {
      profil: screen("Profili", previewProfile(profile), { chrome: false, label: `Profili i ${name}` }),
      postime: screen("Postimet", previewPosts(posts), { chrome: false, label: `Postimet e ${name}` }),
      menu: screen("Menuja", previewMenu(profile, menuItems, focusItems), { chrome: false, label: `Menuja e ${name}` }),
      produkt: screen("Produkti", previewProduct(profile, menuItems), { chrome: false, label: "Detajet e produktit" })
    },
    steps: [
      { view: "profil", title: "Profili yt.", body: "Ballina, logoja, emri, informacionet. Gati." },
      { view: "postime", title: "Trego çfarë po ndodh te ti.", body: "Postimet dhe story-t e tua." },
      { view: "menu", title: "Menuja jote.", body: "Me foto, me çmime, gjithmonë e re." },
      { view: "produkt", title: "Gjithçka që klienti duhet të dijë.", body: "Foto, çmim, përshkrim, alergjenë." }
    ]
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
// dieses Lokal stoesst, ohne es zu suchen.
export function renderDiscoverySequence(profile = {}, posts = [], focusItems = [], menuItems = [], neighbours = []) {
  const term = resolveSearchTerm(profile, menuItems);
  return sequence({
    key: "zbulimi",
    track: "kudo",
    views: {
      qyteti: screen("Qyteti", previewQyteti(profile, posts, focusItems, neighbours), { tab: "qyteti", label: "Qyteti - feed lokal" }),
      harta: screen("Harta", previewHarta(profile, neighbours), { tab: "harta", label: "Harta me lokalet përreth" }),
      lokalet: screen("Lokalet", previewLokalet(profile, neighbours), { tab: "lokalet", label: "Lista e lokaleve" }),
      kerko: screen("Kërko", previewKerko(profile, menuItems, neighbours), { tab: "kerko", label: "Kërkimi në Mnyra" })
    },
    steps: [
      { view: "qyteti", title: "Në Qyteti.", body: "Postimet dhe ofertat e tua shfaqen te njerëzit rreth teje." },
      { view: "harta", title: "Në Hartë.", body: "Klientët shohin çfarë ka pranë tyre." },
      { view: "lokalet", title: "Te Lokalet.", body: "Të zbulojnë kur kërkojnë ku të hanë apo të pinë." },
      { view: "kerko", title: "Në Kërkim.", body: `Të gjejnë kur kërkojnë "${term}".` }
    ]
  });
}

export function renderDiscoveryClose() {
  return section({
    track: "nje-profil",
    tone: "accent",
    body: `
      <p class="l2-statement">Një profil.<br />Shumë mënyra për t'u zbuluar.</p>
    `
  });
}

/* --------------------------- Akt 3 - Jetzt erst: Was ist Mnyra ueberhaupt */

// Erst hier. Vorher haette der Satz nichts bedeutet - jetzt hat der Wirt
// gesehen, wovon er handelt.
export function renderWhatIsMnyra() {
  const steps = [
    { key: "zbulo", title: "ZBULO", body: "Qyteti · Harta · Lokalet · Kërko · Oferta · Evente", iconName: "search" },
    { key: "zgjidh", title: "ZGJIDH", body: "Profil · Foto · Menu · Informacione", iconName: "store" },
    { key: "shko", title: "SHKO", body: "Lokacion · Harta", iconName: "map-pin" },
    { key: "tavolina", title: "NË TAVOLINË", body: "QR · Menu · Porosi (opsionale)", iconName: "qr-code" }
  ];
  return section({
    track: "cka-eshte",
    tone: "dark",
    body: `
      ${head("MNYRA është platforma e gastronomisë.")}
      <ol class="l2-flow">
        ${steps.map((step) => `
          <li class="l2-flow__step">
            <span class="l2-flow__icon" aria-hidden="true">${icon(step.iconName, { size: 18 })}</span>
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

export function renderTableSequence(profile = {}, menuItems = [], focusItems = [], neighbours = []) {
  const name = text(profile.name);
  return sequence({
    key: "tavolina",
    track: "tavolina",
    views: {
      gjen: screen("Kërko", previewKerko(profile, menuItems, neighbours), { tab: "kerko", label: "Klienti të gjen" }),
      profil: screen("Profili", previewProfile(profile), { chrome: false, label: `Profili i ${name}` }),
      qr: screen("Tavolina", previewQr(profile), { chrome: false, label: "QR kodi në tavolinë" }),
      menu: screen("Menuja", previewMenu(profile, menuItems, focusItems), { chrome: false, label: `Menuja e ${name}` })
    },
    steps: [
      { view: "gjen", title: "Klienti të gjen në MNYRA.", body: "Në Qyteti, në Hartë, në Kërkim." },
      { view: "profil", title: "Sheh profilin tënd.", body: "Foto, menu, adresë, orar." },
      { view: "qr", title: "Vjen dhe ulet.", body: "Skanon MNYRA QR në tavolinë." },
      { view: "menu", title: "Dhe MNYRA vazhdon edhe në tavolinë.", body: "Menuja jote hapet. Falas, edhe pa porosi." }
    ]
  });
}

/* ------------------------------------------- Akt 4B - Ueberall dieselbe */

export function renderStandard(profile = {}, neighbours = []) {
  return section({
    track: "kudo-njejta",
    tone: "soft",
    body: `
      ${head("E njëjta MNYRA. Kudo.", "Klienti nuk mëson një sistem të ri në çdo lokal.")}
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
  return section({
    track: "porosia",
    body: `
      ${head("Kamerieri është i zënë?", "Klienti porosit vetë.", { eyebrow: "Opsionale · MNYRA Order" })}
      ${screen("Porosia", previewOrder(profile, menuItems), { chrome: false, label: "Porosia nga tavolina" })}
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
  return section({
    track: "go",
    tone: "soft",
    body: `
      ${head("Ke tavolina bosh?", "MNYRA GO të sjell klientë.", { eyebrow: "Opsionale · MNYRA GO" })}
      ${screen("MNYRA GO", previewGo(profile, focusItems, menuItems), { chrome: false, label: "Si funksionon Mnyra GO" })}
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
  return section({
    track: "save",
    body: `
      ${head("Ka mbetur ushqim?", "Mos e hidh. Shite.", { eyebrow: "Po vjen · MNYRA SAVE" })}
      ${screen("MNYRA SAVE", previewSave(profile, menuItems), { chrome: false, label: "Si do të funksionojë Mnyra SAVE" })}
      <p class="l2-note">Nuk shitet = nuk paguan.</p>
      <p class="l2-sub l2-sub--small">MNYRA SAVE është në përgatitje. Do ta njoftojmë kur të jetë gati.</p>
    `
  });
}

/* ------------------------------------------------------- Akt 9 - Biznesi */

export function renderBiznesi(profile = {}, posts = [], menuItems = []) {
  return section({
    track: "biznesi",
    tone: "soft",
    body: `
      ${head("Gjithçka nga një vend.", "Ti kontrollon gjithçka.")}
      ${screen("Biznesi", previewBiznesi(profile, posts, menuItems), { chrome: false, label: "Paneli Biznesi" })}
      <p class="l2-note">Më pak punë, jo më shumë.</p>
    `
  });
}

/* -------------------------------------------------------- Akt 10 - Vision */

export function renderVision(profile = {}, neighbours = []) {
  const lines = [
    "Kërkon një kafe? → MNYRA",
    "Kërkon ku të hash? → MNYRA",
    "Kërkon një event? → MNYRA",
    "Ulesh në tavolinë? → MNYRA"
  ];
  return section({
    track: "vizioni",
    tone: "dark",
    body: `
      ${head("Një MNYRA. Kudo.")}
      ${previewVision(profile, neighbours)}
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
        <span class="l2-close__logo">${logo(profile.logoUrl, profile.name)}</span>
        <p class="l2-close__name">${esc(profile.name)}</p>
        <h2 class="l2-h2">Biznesi yt është gati.</h2>
        <p class="l2-lead">Merre profilin tënd dhe fillo falas.</p>
        ${claimUrl
          ? `<a class="l2-cta" href="${esc(claimUrl)}" data-l2-claim>Merr biznesin tim</a>`
          : `<button type="button" class="l2-cta" data-l2-claim>Merr biznesin tim</button>`}
        <p class="l2-note">Falas · Pa abonim · Funksionet shtesë janë opsionale</p>
      </div>
    </section>
  `;
}

export { section as landing2Section };

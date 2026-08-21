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
// Ein Gedanke pro Zustand. Und ein Grundsatz fuer die ganze Seite: Was der
// Wisch ausloest, sieht aus wie das, was der Finger in Mnyra ausloesen wuerde.
// Der Scroll bestimmt den ZEITPUNKT; wie es aussieht, bestimmt Mnyra.

import { esc, text } from "./landing2-format.js";
import { icon } from "./landing2-icons.js";
import {
  flowScreen,
  previewBiznesiAnalitika,
  previewBiznesiFunksionet,
  previewBiznesiMetrics,
  previewBiznesiTabs,
  previewCart,
  previewGo,
  previewGoAccepted,
  previewGoSearch,
  previewHarta,
  previewKerkoIdle,
  previewKerkoResults,
  previewLokalet,
  previewMenu,
  previewOrbit,
  previewOrderSent,
  previewPosts,
  previewProduct,
  previewProfileCard,
  previewProfileTabs,
  previewQr,
  previewQytetiPost,
  previewQytetiStories,
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

// Eine gefuehrte Vorfuehrung: Die Flaeche bleibt stehen, der Zustand wechselt.
//
// Warum ueberhaupt: Ein Profil, ein Feed, ein Paneli - jedes davon ist laenger
// als ein Telefon. Verkleinert man es, bis es auf einen Bildschirm passt, ist
// nichts mehr zu lesen, und ein Wirt, der seine eigene Karte nicht lesen kann,
// glaubt ihr auch nicht. Also bleibt die Flaeche gross und stehen, und der
// Scrollstand fuehrt durch die Zustaende.
//
// Der Unterschied zu frueher steht in "views": Eine Flaeche traegt jetzt
// MEHRERE Schritte (from..to). Innerhalb dieser Schritte wird nichts
// ausgetauscht - dort wandert der Kopf nach oben, die Reiterleiste bleibt
// stehen, das Feld darunter laeuft. Das ist Scroll und kein Wechsel, und
// genau deshalb sieht es aus wie Mnyra und nicht wie eine Praesentation ueber
// Mnyra.
//
// Erst wenn eine andere Flaeche an der Reihe ist - Qyteti nach Harta -, legt
// sie sich als leere Scheibe darueber (landing2-scroll.js). Zwei vollstaendige
// Mnyra-Oberflaechen stehen nie halbdurchsichtig uebereinander.
//
// Fuenf Regeln, damit das nicht ueberrascht:
//
//  1. Eine Vorschau, ein Ort. Was hier in der Buehne steht, steht nicht
//     ausserdem noch einmal als eigener Abschnitt darueber oder darunter.
//  2. Der Satz gehoert zur Flaeche. Er steht unmittelbar darueber und
//     wechselt mit ihr.
//  3. Die Buehne behaelt ihre Masse. Gleiche Breite, gleiche Hoehe, gleicher
//     Ort, bei jedem Schritt.
//  4. Genug Weg dazwischen. Ein Schritt bekommt eine ganze Bildschirmhoehe.
//  5. Die Reihenfolge im Markup ist die Reihenfolge der Schritte: Die
//     Flaechen liegen uebereinander, und die spaetere blendet ueber der
//     frueheren auf.
//
// steps: [{ title, body }]              - ein Satz je Zustand
// views: [{ key, from, to, screen, flow, tabs }] - eine Flaeche je Bildschirm
function sequence({ key = "", track = "", steps = [], views = [] }) {
  if (!steps.length || !views.length) return "";
  return `
    <section class="l2-seq" data-seq="${esc(key)}" data-step="0"
      style="--l2-steps:${steps.length};"${track ? ` data-track="${esc(track)}"` : ""}>
      <div class="l2-seq__sticky">
        <div class="l2-inner l2-seq__inner">
          <div class="l2-seq__captions">
            ${steps.map((step, index) => `
              <div class="l2-seq__caption" data-caption="${index}" style="--l2-order:${index * 2 + 1};"${index ? ` aria-hidden="true"` : ""}>
                <h2 class="l2-seq__title">${esc(step.title)}</h2>
                ${step.body ? `<p class="l2-seq__sub">${esc(step.body)}</p>` : ""}
              </div>
            `).join("")}
          </div>
          <div class="l2-seq__stage">
            ${views.map((view, index) => `
              <div class="l2-seq__view${view.flow ? " l2-seq__view--flow" : ""}"
                data-viewkey="${esc(view.key)}"
                data-from="${esc(String(view.from || 0))}"
                data-to="${esc(String(view.to ?? view.from ?? 0))}"
                ${view.tabs ? `data-tabs="${esc(view.tabs.join(","))}"` : ""}
                style="--l2-order:${(view.from || 0) * 2 + 2};"${index ? ` aria-hidden="true"` : ""}>
                ${view.screen}
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
// Und hier steht ausdruecklich KEINE Vorschau. Es gibt genau eine
// Burger-Nora-Buehne, und sie faengt direkt unter diesem Bildschirm an: Der
// Kopf ist absichtlich kuerzer als ein Bildschirm, damit ihr oberer Rand schon
// zu sehen ist, ohne dass jemand einen Pfeil oder das Wort "scroll" braucht.
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

// EIN Profil, drei Zustaende - und dazwischen wird nichts ausgetauscht.
//
// Das ist der Kern dieser Seite, und er ist eine Flaeche und kein Trick:
//
//   Zustand 1  Der Profilkopf und darunter die Reiterleiste. Sonst nichts.
//              Keine Beitraege, die schon hereinschauen - der Wirt soll sein
//              Profil erst einmal als Ganzes erkennen. Wie hoch der Kopf
//              mindestens sein muss, damit darunter nichts hervorkommt, misst
//              landing2-scroll.js auf dem Geraet, auf dem es gerade laeuft.
//
//   Zustand 2  Der Kopf wandert nach oben aus dem Bild - so, wie er es taete,
//              wenn der Wirt selbst im Profil weiterscrollte. Die
//              Reiterleiste bleibt oben stehen. Es ist DIESELBE Leiste; sie
//              wird nicht getauscht und nicht neu gebaut. Darunter stehen
//              jetzt die letzten zwei Beitraege.
//
//   Zustand 3  Die Leiste bleibt, wo sie ist, und der Reiter wechselt von
//              Postimet auf Menu. Nicht mit einer Bewegung, die es nur hier
//              gibt: Getauscht werden die Klassen, die Mnyra selbst an einen
//              aktiven Reiter haengt, und die Bewegung dazwischen ist die der
//              App. Wer zusieht, sieht, was er saehe, wenn er selbst getippt
//              haette. Darunter: "Sot ne Fokus" und zwei Speisen.
//
// Drei Zustaende, ein Bildschirm, kein zweites Profil.
export function renderProfileSequence(profile = {}, posts = [], menuItems = [], focusItems = []) {
  const name = text(profile.name);
  return sequence({
    key: "profil",
    track: "profili",
    steps: [
      { title: "Profili yt", body: "Ballina, logoja, emri, informacionet. Gjithçka gati." },
      { title: "Postimet e tua", body: "Trego çfarë po ndodh te ti." },
      { title: "Menuja jote", body: "Foto, çmime dhe përshkrime." }
    ],
    views: [
      {
        key: "profil",
        from: 0,
        to: 2,
        flow: true,
        // Schritt 0 und 1 zeigen Postimet, Schritt 2 Menu. Mehr weiss der
        // Antrieb nicht ueber diese Leiste - und mehr muss er nicht wissen.
        tabs: ["posts", "posts", "menu"],
        screen: flowScreen({
          label: `Profili i ${name}`,
          head: `<div class="app-content-inline pb-2 pt-4">${previewProfileCard(profile, { eager: true })}</div>`,
          headFill: true,
          stick: previewProfileTabs("posts"),
          panels: [
            { from: 0, to: 1, html: previewPosts(posts) },
            { from: 2, to: 2, html: previewMenu(profile, menuItems, focusItems) }
          ]
        })
      }
    ]
  });
}

/* --------------------------------------- Akt 1C - Und das kostet nichts */

// Kurz. Der Wirt hat gerade sein Profil, seine Beitraege und seine Karte
// gesehen - der einzige Satz, der jetzt noch fehlt, ist der Preis.
export function renderFree() {
  return section({
    track: "falas",
    tone: "soft",
    body: `
      ${head("E gjithë kjo falas.")}
      <p class="l2-price">0 €</p>
      ${checkList(["Profili", "Menuja", "Postimet", "QR"])}
      <p class="l2-note">Pa abonim.</p>
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

// Der groesste Verkaufsmoment der Seite: die Orte, an denen ein Gast auf
// dieses Lokal stoesst, ohne es zu suchen.
//
// Vier Bildschirme, sechs Zustaende - und die Aufteilung ist keine Willkuer:
//
//   Qyteti  braucht zwei. In der App stehen Story-Reihe und erster Beitrag
//           untereinander, und zusammen sind sie hoeher als jedes Telefon.
//           Wer beides zugleich zeigen will, muss verkleinern - und eine
//           Story-Reihe in Dreiviertelgroesse ist nicht mehr die von Mnyra.
//           Also erst die Reihe allein, dann schiebt der Scrollstand sie nach
//           oben und den Beitrag herein. Wie im echten Feed.
//   Harta   braucht einen. Die Karte fuellt ihr Fenster von selbst; sie
//           aufzuteilen waere eine Zerlegung ohne Grund.
//   Lokalet braucht einen. Das eigene Lokal steht oben - darum geht es hier,
//           nicht um eine vollstaendige Liste.
//   Kerko   braucht zwei: das leere Feld und das Ergebnis. Der zweite Zustand
//           ist die Suche, die jemand wirklich getippt hat.
export function renderDiscoverySequence(profile = {}, posts = [], focusItems = [], menuItems = [], neighbours = []) {
  const term = resolveSearchTerm(profile, menuItems);
  return sequence({
    key: "zbulimi",
    track: "kudo",
    steps: [
      { title: "Qyteti", body: "Shfaqu aty ku njerëzit janë." },
      { title: "Postimi yt", body: "Njerëzit rreth teje e shohin." },
      { title: "Harta", body: "Të gjejnë pranë tyre." },
      { title: "Lokalet", body: "Kur kërkojnë ku të hanë." },
      { title: "Kërko", body: "Kur kërkojnë diçka të caktuar." },
      { title: "Të gjejnë ty", body: `Kur kërkojnë pikërisht "${term}".` }
    ],
    views: [
      {
        key: "qyteti",
        from: 0,
        to: 1,
        flow: true,
        screen: flowScreen({
          pills: "feed",
          label: "Qyteti - feed lokal",
          head: previewQytetiStories(profile, posts, neighbours),
          headFill: true,
          panels: [{ from: 0, to: 1, html: previewQytetiPost(profile, posts, focusItems) }]
        })
      },
      {
        key: "harta",
        from: 2,
        to: 2,
        // Die Karte fuellt ihr Fenster - hier gibt es nichts zu schieben.
        screen: screen(previewHarta(profile, neighbours), {
          label: "Harta me lokalet përreth",
          surface: "map"
        })
      },
      {
        key: "lokalet",
        from: 3,
        to: 3,
        screen: screen(previewLokalet(profile, neighbours), {
          pills: "restaurants",
          label: "Lista e lokaleve",
          pan: true
        })
      },
      {
        key: "kerko",
        from: 4,
        to: 5,
        flow: true,
        screen: flowScreen({
          label: "Kërkimi në Mnyra",
          panels: [
            { from: 4, to: 4, html: previewKerkoIdle() },
            { from: 5, to: 5, html: previewKerkoResults(profile, menuItems, neighbours) }
          ]
        })
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
      <ol class="l2-path">
        ${steps.map((step) => `
          <li class="l2-path__step">
            <span class="l2-path__icon" aria-hidden="true">${icon(step.iconName, "w-[18px] h-[18px]")}</span>
            <span class="l2-path__text">
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
// Der Weg selbst ist eine Abfolge und laesst sich in vier Zeilen sagen. Der
// einzige Bildschirm, den es an dieser Stelle noch nicht gab, ist der
// Aufsteller auf dem Tisch - und nur der steht hier. Alles andere hat der
// Wirt eine Minute vorher gesehen; es noch einmal zu zeigen hiesse "die Seite
// faengt von vorne an".
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
//
// Der Weg einer Bestellung ist eine Abfolge von Handgriffen, und jeder davon
// ist ein eigener Bildschirm in Mnyra. Sie in eine Karte zu pressen waere
// dasselbe wie eine Zeichnung: schnell zu lesen und in keinem Renderer der
// App zu finden. Also nacheinander, ein Handgriff je Zustand.
//
// Angefangen wird beim Produkt: Wie ein Gast an den Tisch und in die Karte
// kommt, stand einen Abschnitt vorher (der Aufsteller, das QR).
export function renderOrderSequence(profile = {}, menuItems = [], orderPrice = "") {
  return `
    ${section({
      track: "porosia",
      body: head("Kamerieri është i zënë?", "Klienti porosit vetë.", { eyebrow: "Opsionale · MNYRA Order" })
    })}
    ${sequence({
      key: "porosia-hapat",
      track: "porosia-hapat",
      steps: [
        { title: "Klienti zgjedh", body: "Nga menuja jote, ulur në tavolinë." },
        { title: "Shporta", body: "Pa aplikacion, pa llogari, pa numër telefoni." },
        { title: "Porosia të vjen", body: "Direkt për tavolinën, te ti." }
      ],
      views: [
        {
          key: "produkti",
          from: 0,
          to: 0,
          screen: screen(previewProduct(profile, menuItems), { surface: "white", label: "Detajet e produktit", pan: true })
        },
        {
          key: "shporta",
          from: 1,
          to: 1,
          screen: screen(previewCart(profile, menuItems), { label: "Shporta e klientit", pan: true })
        },
        {
          key: "derguar",
          from: 2,
          to: 2,
          screen: screen(previewOrderSent(profile), { label: "Porosia u dërgua" })
        }
      ]
    })}
    ${section({
      track: "porosia-cmimi",
      body: `
        ${checkList([
          "Më pak pritje për klientin",
          "Më pak rrugë për kamerierin",
          "Ideale për terracë dhe orët e pikut"
        ])}
        <p class="l2-pricetag">${esc(orderPrice)} për çdo produkt të porositur</p>
        <p class="l2-note">0 porosi = 0 €.</p>
      `
    })}
  `;
}

/* ------------------------------------------- Akt 7 - Optional: Mnyra GO */

// Die Preise hier sind die echten aus shared/go/go-commission-core.js. Eine
// geschaetzte Zahl waere hier die teuerste Zeile der Seite: Wer beim ersten
// Preis merkt, dass er nicht stimmt, glaubt der Seite nichts mehr.
//
// GO hat zwei Seiten - ein Gast sucht, ein Lokal antwortet -, und wer das in
// eine Karte presst, muss erklaeren, wer gerade wer ist. Nacheinander erklaert
// es sich von selbst.
export function renderGoSequence(profile = {}, focusItems = [], menuItems = [], goPrices = []) {
  return `
    ${section({
      track: "go",
      tone: "soft",
      body: head("Ke tavolina bosh?", "MNYRA GO të sjell klientë.", { eyebrow: "Opsionale · MNYRA GO" })
    })}
    ${sequence({
      key: "go-hapat",
      track: "go-hapat",
      steps: [
        { title: "Klienti kërkon", body: "Ku të shkojë tani." },
        { title: "Ti përgjigjesh", body: "Me një ofertë, vetëm për MNYRA GO." },
        { title: "Klienti vjen", body: "Ti e aktivizon te ti në lokal." }
      ],
      views: [
        {
          key: "go-kerkon",
          from: 0,
          to: 0,
          screen: screen(previewGoSearch(), { pills: "go", label: "Klienti hap Mnyra GO" })
        },
        {
          key: "go-oferta",
          from: 1,
          to: 1,
          screen: screen(previewGo(profile, focusItems, menuItems), { surface: "white", label: "Oferta jote në Mnyra GO", pan: true })
        },
        {
          key: "go-pranuar",
          from: 2,
          to: 2,
          screen: screen(previewGoAccepted(profile), { pills: "go", label: "Oferta u pranua" })
        }
      ]
    })}
    ${section({
      track: "go-cmimi",
      tone: "soft",
      body: `
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
    })}
  `;
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

// Das Paneli ist laenger als ein Fenster - also bekommt es zwei Zustaende,
// nach derselben Regel wie das Profil: Die Kennzahlen-Reihe und die
// Reiterleiste gehoeren zur Seite und bleiben stehen, die Flaeche darunter
// wechselt. Genau so verhaelt sich das Paneli, wenn der Wirt auf "Analitika"
// tippt.
export function renderBiznesi(profile = {}, posts = [], menuItems = []) {
  return `
    ${section({
      track: "biznesi",
      tone: "soft",
      body: head("Gjithçka nga një vend.", "Ti kontrollon gjithçka.")
    })}
    ${sequence({
      key: "biznesi-paneli",
      track: "biznesi-paneli",
      steps: [
        { title: "Funksionet", body: "Posto, lësho ofertë, ndrysho menunë." },
        { title: "Analitika", body: "Sa të panë, sa e hapën menunë." }
      ],
      views: [
        {
          key: "paneli",
          from: 0,
          to: 1,
          flow: true,
          tabs: ["funksionet", "analitika"],
          // Der Kopf fuellt hier NICHT: Anders als beim Profil gehoert die
          // Flaeche unter der Reiterleiste von Anfang an zum Bild - im Paneli
          // steht unter den Kennzahlen sofort das Bento. Was der erste Wisch
          // tut, ist genau das, was ein Daumen im Paneli tut: Er schiebt die
          // Kennzahlen nach oben, und die Reiterleiste bleibt stehen.
          screen: flowScreen({
            label: "Paneli Biznesi",
            head: previewBiznesiMetrics(profile, posts, menuItems),
            stick: previewBiznesiTabs("funksionet"),
            panels: [
              { from: 0, to: 0, html: previewBiznesiFunksionet() },
              { from: 1, to: 1, html: previewBiznesiAnalitika(profile, posts) }
            ]
          })
        }
      ]
    })}
    ${section({
      track: "biznesi-fund",
      tone: "soft",
      body: `<p class="l2-note">Më pak punë, jo më shumë.</p>`
    })}
  `;
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

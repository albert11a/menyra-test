import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import { createAppShellRuntimeController } from "../apps/menyra-social/core/app-shell/app-shell-runtime-controller.js";

// Der Schriftzug links im Kopf sagt, WO man ist.
//
// Auf den Social-Seiten steht dort "MNYRA Social", auf den GO-Seiten das
// Wortlogo "MNYRAGO", und auf der Seite des Lokals sein eigenes Bild neben
// dem Namen des Bereichs. Beide Arbeitsseiten haben damit ihre Identitaet im
// Kopf - und brauchen sie darunter nicht noch einmal.

const INDEX_HTML = readFileSync(
  new URL("../apps/menyra-social/index.html", import.meta.url),
  "utf8"
);

function header({ activeTab = "feed", logoUrl = "", isBusinessLogo = true, profile = {} } = {}) {
  const controller = createAppShellRuntimeController({
    state: {
      activeTab,
      userProfile: { restaurantId: "r1", role: "business", name: "Burger Nora", ...profile },
      notifications: [],
      shopCart: { items: [] }
    },
    documentObj: null,
    windowObj: null,
    escapeHtml: (value = "") => String(value ?? ""),
    icon: (name = "", className = "") => `<svg data-icon="${name}" class="${className}"></svg>`,
    isGuestSession: () => false,
    getChatUnreadCount: () => 0,
    resolveHeaderBranding: () => ({ title: "MNYRA", subtitle: "Social", logoUrl, isBusinessLogo }),
    logoFitClass: (business) => (business ? "object-contain bg-white" : "object-cover")
  });
  return controller.renderHeader();
}

// Nur der Kopf links, ohne die Knoepfe rechts.
function lead(html = "") {
  const start = html.indexOf('class="smart-header-lead');
  const end = html.indexOf('class="smart-header-actions', start);
  return start === -1 ? "" : html.slice(start, end === -1 ? undefined : end);
}

test("the social pages keep MNYRA Social", () => {
  const html = lead(header({ activeTab: "feed" }));
  assert.ok(html.includes(">MNYRA</h1>"));
  assert.ok(html.includes(">Social</span>"));
  assert.equal(html.includes("smart-header-brand--go"), false);
  assert.equal(html.includes("smart-header-brand--work"), false);
});

test("both GO pages wear the wordmark, not Social", () => {
  // Hier stand nur "go" - die Seite des Gastes. Das Lokal sitzt auf
  // "gobiznes" und las im Kopf deshalb weiter "MNYRA Social", waehrend unter
  // ihm GO stand.
  ["go", "gobiznes"].forEach((tab) => {
    const html = lead(header({ activeTab: tab }));
    assert.ok(html.includes("smart-header-brand--go"), tab);
    assert.ok(html.includes(">MNYRA</h1>"), tab);
    assert.ok(html.includes(">GO</span>"), tab);
    assert.equal(html.includes(">Social</span>"), false, tab);
  });
});

test("MNYRAGO reads as one word: same size, two colours, no gap", () => {
  const html = lead(header({ activeTab: "gobiznes" }));
  // Beide Haelften in derselben Groesse und derselben Laufweite - nur die
  // Farbe trennt sie: MNYRA im Navy der Marke, GO im Violett.
  const mnyra = /<h1 class="([^"]*)">MNYRA<\/h1>/.exec(html)?.[1] || "";
  const go = /<span class="([^"]*)">GO<\/span>/.exec(html)?.[1] || "";
  ["text-2xl", "font-black", "italic", "tracking-tighter", "leading-none"].forEach((cls) => {
    assert.ok(mnyra.includes(cls), `MNYRA ${cls}`);
    assert.ok(go.includes(cls), `GO ${cls}`);
  });
  assert.ok(mnyra.includes("text-slate-900"));
  assert.ok(go.includes("text-indigo-600"));
  // Keine Luecke zwischen den beiden Haelften - weder als Klasse im Aufbau
  // noch als Regel im Blatt.
  assert.equal(/class="[^"]*smart-header-brand--go[^"]*gap-/.test(html), false, html);
  assert.ok(INDEX_HTML.includes(".smart-header-brand--go { gap: 0; }"));
});

test("Biznesi wears the venue's own picture next to the section name", () => {
  const html = lead(header({ activeTab: "dashboard", logoUrl: "https://cdn.mnyra.com/logo.jpg" }));
  assert.ok(html.includes("smart-header-brand--work"));
  assert.ok(html.includes("smart-header-brand__avatar"));
  assert.ok(html.includes("https://cdn.mnyra.com/logo.jpg"));
  assert.ok(html.includes(">Biznesi</h1>"));
  // Kein zweites Wortlogo daneben - das Bild sagt, wer; "Biznesi" sagt, wo.
  assert.equal(html.includes(">Social</span>"), false);
  assert.equal(html.includes(">MNYRA</h1>"), false);
  // Und der Name des Lokals steht nicht noch einmal als Text daneben.
  assert.equal(html.includes("Burger Nora"), false);
});

test("the picture comes from the shell chain, never from a raw avatar", () => {
  // Dieselbe Kette, aus der auch der Drawer und die Kopfzeile ihr Bild
  // ziehen. Ein roher avatar-Wert aus dem Profil ist ein Speicherpfad, kein
  // Bild - er darf nie in einem src landen.
  const html = lead(header({
    activeTab: "dashboard",
    logoUrl: "https://cdn.mnyra.com/logo-optimized.jpg",
    profile: { avatar: "users/u1/raw-avatar-ref" }
  }));
  assert.ok(html.includes("https://cdn.mnyra.com/logo-optimized.jpg"));
  assert.equal(html.includes("raw-avatar-ref"), false);
});

test("without a picture the venue gets the existing fallback, not an empty frame", () => {
  const html = lead(header({ activeTab: "dashboard", logoUrl: "" }));
  assert.ok(html.includes("smart-header-brand__avatar"));
  assert.ok(html.includes('data-icon="store"'));
  assert.equal(html.includes("<img"), false);
  assert.ok(html.includes(">Biznesi</h1>"));
});

test("the picture is round and cropped, and sized to the line beside it", () => {
  const block = INDEX_HTML.slice(INDEX_HTML.indexOf(".smart-header-brand__avatar {")).split("}")[0];
  assert.ok(block.includes("border-radius: 999px;"), block);
  assert.ok(block.includes("overflow: hidden;"), block);
  // Nicht groesser als der Name daneben (24px Zeile).
  assert.ok(block.includes("width: 1.75rem;"), block);
  assert.ok(block.includes("height: 1.75rem;"), block);
  // Und randscharf beschnitten statt verzerrt - das Mass steht am Bild.
  const img = INDEX_HTML.slice(INDEX_HTML.indexOf(".smart-header-brand__avatar img {")).split("}")[0];
  assert.ok(img.includes("border-radius: 999px;"), img);
  // Die Zeile steht mittig, nicht auf der Grundlinie: ein Bild hat keine.
  assert.ok(INDEX_HTML.includes(".smart-header-brand--work { gap: 0.5rem; }"));
});

test("the venue name in the drawer and the header say the same word", () => {
  const sq = readFileSync(new URL("../shared/i18n/sq.js", import.meta.url), "utf8");
  const de = readFileSync(new URL("../shared/i18n/de.js", import.meta.url), "utf8");
  const sr = readFileSync(new URL("../shared/i18n/sr.js", import.meta.url), "utf8");
  // Der Name des Bereichs steht in allen drei Sprachen gleich - wie Qyteti,
  // Lokalet und Ofertat. Es ist der Name eines Bereichs, kein uebersetztes
  // Wort, und im Drawer soll dasselbe stehen wie danach im Kopf.
  [sq, de, sr].forEach((file) => {
    assert.ok(file.includes('"nav.dashboard": "Biznesi",'), file.slice(0, 40));
  });
  assert.equal(sq.includes('"Paneli"'), false);
});

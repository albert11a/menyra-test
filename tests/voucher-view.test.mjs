import test from "node:test";
import assert from "node:assert/strict";

import {
  renderVoucherCard,
  renderVoucherConfirmModal,
  renderVoucherFeedEmptyState,
  renderVoucherLocationGate
} from "../apps/menyra-social/core/vouchers/voucher-customer-render-utils.js";
import {
  renderVoucherAdminBody,
  renderVoucherEditor,
  renderVoucherKpiRow,
  renderVoucherListSection,
  renderVoucherAdminNoBusinessState
} from "../apps/menyra-social/core/vouchers/voucher-admin-render-utils.js";
import { createVoucherViewController } from "../apps/menyra-social/core/vouchers/voucher-view-controller.js";
import { buildActivationRecord } from "../apps/menyra-social/core/vouchers/voucher-core.js";

const NOW = Date.parse("2026-08-03T12:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const deps = {
  escapeHtml,
  icon: (name = "", className = "") => `<i data-lucide="${name}" class="${className}"></i>`,
  isPlaceholderUrl: (url = "") => !url,
  getOptimizedImageUrl: (url = "") => url,
  placeholderImage: "/placeholder.png"
};

const business = {
  id: "rest-1",
  name: "Shpija e vjeter",
  logoImage: "https://cdn.test/logo.jpg",
  coverImage: "https://cdn.test/cover.jpg",
  locationLabel: "Pristina"
};

const voucher = {
  id: "ofr-1",
  title: "20% zbritje ne pizza",
  text: "Vlen per te gjitha picat.",
  terms: "Nuk kombinohet me oferta tjera.",
  badgeLabel: "-20%",
  imageUrl: "https://cdn.test/offer.jpg",
  endAt: new Date(NOW + (3 * DAY)).toISOString(),
  activationMinutes: 60
};

test("customer card shows logo, name, offer text, countdown badge and activate button", () => {
  const html = renderVoucherCard({ business, voucher, activation: null, nowMs: NOW, deps });
  assert.ok(html.includes("Shpija e vjeter"), "restaurant name is rendered");
  assert.ok(html.includes("20% zbritje ne pizza"), "offer title is rendered");
  assert.ok(html.includes("Vlen per te gjitha picat."), "offer description replaces the city/hours block");
  assert.ok(html.includes("https://cdn.test/offer.jpg"), "offer image is the cover");
  assert.ok(html.includes("https://cdn.test/logo.jpg"), "business logo is rendered");
  assert.ok(html.includes("Edhe 3 dite"), "validity badge counts remaining days");
  assert.ok(html.includes("Aktivizo oferten"), "activation button is present");
  assert.ok(html.includes('data-voucher-activate="rest-1::ofr-1"'), "activation button carries the card key");
  assert.ok(html.includes("-20%"), "discount badge is rendered");
});

test("customer card keeps a working location button", () => {
  const html = renderVoucherCard({ business, voucher, activation: null, nowMs: NOW, deps });
  // Gleiches Attribut wie im Restorante-Tab: die globale Shell-Bindung oeffnet
  // damit die Karte auf der Harta.
  assert.ok(html.includes('data-marketplace-open-map="rest-1"'));
});

test("activated card swaps to countdown, code and menu link", () => {
  const activation = buildActivationRecord({
    restaurantId: "rest-1",
    voucherId: "ofr-1",
    uid: "user-1",
    activationMinutes: 60,
    nowMs: NOW
  });
  const html = renderVoucherCard({
    business,
    voucher,
    activation,
    nowMs: NOW + (60 * 1000),
    deps
  });
  assert.ok(!html.includes("Aktivizo oferten"), "activate button disappears while active");
  assert.ok(html.includes("Oferta aktive"));
  assert.ok(html.includes("59:00"), "countdown shows remaining activation time");
  assert.ok(html.includes(activation.code), "code is shown to the staff");
  assert.ok(html.includes('data-voucher-countdown="rest-1::ofr-1"'));
});

test("expired activation shows the used state instead of a new activation", () => {
  const activation = buildActivationRecord({
    restaurantId: "rest-1",
    voucherId: "ofr-1",
    uid: "user-1",
    activationMinutes: 60,
    nowMs: NOW
  });
  const html = renderVoucherCard({
    business,
    voucher,
    activation,
    nowMs: NOW + (2 * 60 * 60 * 1000),
    deps
  });
  assert.ok(html.includes("Oferta e perdorur"));
  assert.ok(!html.includes("Aktivizo oferten"));
});

test("confirm modal explains the one hour rule with po/jo options", () => {
  const html = renderVoucherConfirmModal({
    confirm: { open: true, title: "20% zbritje", activationMinutes: 60 },
    deps
  });
  assert.ok(html.includes("A deshironi ta aktivizoni oferten?"));
  assert.ok(html.includes("vlen vetem"));
  assert.ok(html.includes("1 ore"));
  assert.ok(html.includes("skadon dhe nuk mund te perdoret me"));
  assert.ok(html.includes("Po, aktivizo"));
  assert.ok(html.includes("Jo, mos aktivizo"));
  assert.equal(renderVoucherConfirmModal({ confirm: null, deps }), "");
});

test("confirm modal mirrors a custom activation window", () => {
  const html = renderVoucherConfirmModal({
    confirm: { open: true, title: "Happy hour", activationMinutes: 30 },
    deps
  });
  assert.ok(html.includes("30 minuta"));
});

test("customer empty and location gate states are informative", () => {
  const empty = renderVoucherFeedEmptyState({ deps, cityLabel: "Pristina" });
  assert.ok(empty.includes("Ende nuk ka oferta"));
  assert.ok(empty.includes("Pristina"));

  const gate = renderVoucherLocationGate({ deps });
  assert.ok(gate.includes("Zgjidh qytetin"));
  assert.ok(gate.includes('data-nav="restaurants"'));
});

test("business overview renders KPIs, list with plus button and analytics rows", () => {
  const html = renderVoucherAdminBody({
    restaurantName: "Shpija e vjeter",
    items: [voucher],
    statsById: { "ofr-1": { reachCount: 400, activationCount: 80 } },
    loading: false,
    enabled: true,
    error: "",
    nowMs: NOW,
    deps
  });
  assert.ok(html.includes("Shpija e vjeter"));
  assert.ok(html.includes("data-voucher-add"), "plus button opens the editor");
  assert.ok(html.includes('data-voucher-edit="ofr-1"'));
  assert.ok(html.includes('data-voucher-delete="ofr-1"'));
  assert.ok(html.includes("Arritje"));
  assert.ok(html.includes("Aktivizime"));
  assert.ok(html.includes("400"));
  assert.ok(html.includes("80"));
  assert.ok(html.includes("20%"), "conversion is derived from reach and activations");
});

test("kpi row survives missing stats", () => {
  const html = renderVoucherKpiRow({ totals: {}, deps });
  assert.ok(html.includes("Arritje"));
  assert.ok(html.includes("0%"));
});

test("empty and loading list states do not both appear", () => {
  const loading = renderVoucherListSection({ items: [], loading: true, enabled: true, deps });
  assert.ok(loading.includes("Ofertat po ngarkohen..."));
  assert.ok(!loading.includes("Ende nuk ka oferta"));

  const empty = renderVoucherListSection({ items: [], loading: false, enabled: true, deps });
  assert.ok(empty.includes("Ende nuk ka oferta"));
});

test("editor prefills fields and exposes save/close hooks", () => {
  const html = renderVoucherEditor({
    editor: { mode: "edit", draft: voucher, status: "", saving: false, imagePreview: "" },
    deps
  });
  assert.ok(html.includes("Ndrysho oferten"));
  assert.ok(html.includes('id="voucherTitle"'));
  assert.ok(html.includes("20% zbritje ne pizza"));
  assert.ok(html.includes('id="voucherEndAt"'));
  assert.ok(html.includes('id="voucherActivationMinutes"'));
  assert.ok(html.includes("data-voucher-save"));
  assert.ok(html.includes("data-voucher-editor-close"));
  assert.ok(html.includes("data-voucher-pick-image"));

  const creating = renderVoucherEditor({
    editor: { mode: "create", draft: {}, status: "Gabim", saving: true, imagePreview: "" },
    deps
  });
  assert.ok(creating.includes("Oferte e re"));
  assert.ok(creating.includes("Gabim"));
  assert.ok(creating.includes("Po ruhet..."));
});

test("no-business state distinguishes resolving from not eligible", () => {
  assert.ok(renderVoucherAdminNoBusinessState({ deps, resolving: true }).includes("po ngarkohet"));
  assert.ok(renderVoucherAdminNoBusinessState({ deps, resolving: false }).includes("vetem per profile biznesi"));
});

test("view controller renders the location gate before any city is chosen", () => {
  const state = { user: null, userProfile: {}, vouchers: null };
  const runtime = {
    ensureState: () => {
      if (!state.vouchers) {
        state.vouchers = {
          restaurantId: "",
          items: [],
          enabled: true,
          loading: false,
          error: "",
          truthState: "unknown",
          statsById: {},
          editor: null,
          feed: { status: "idle", error: "", signature: "", entries: [] },
          activations: {},
          confirm: null
        };
      }
      return state.vouchers;
    },
    getActivation: () => null,
    loadVoucherFeed: async () => {},
    markReach: () => {},
    restoreServerActivations: async () => {}
  };
  const controller = createVoucherViewController({
    state,
    runtime,
    renderFn: () => {},
    documentObj: null,
    windowObj: null,
    helperApi: {
      escapeHtmlFn: escapeHtml,
      iconFn: deps.icon,
      getOptimizedImageUrlFn: deps.getOptimizedImageUrl,
      isPlaceholderUrlFn: deps.isPlaceholderUrl,
      placeholderImage: deps.placeholderImage
    },
    profileApi: { isBusinessOffersProfileFn: () => false }
  });

  // Ohne geladenes Marktplatz-Modul zeigt der Tab den Ladezustand statt zu werfen.
  const feedHtml = controller.renderVoucherFeedView();
  assert.ok(feedHtml.includes("data-voucher-feed"));

  // Ohne Business-Profil bleibt der Editor gesperrt.
  const adminHtml = controller.renderVoucherAdminView();
  assert.ok(adminHtml.includes("vetem per profile biznesi"));
});

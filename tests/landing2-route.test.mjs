import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import { claimUrl, readRouteKey } from "../apps/menyra-social/lead-landing-2/landing2-app.js";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));

// Landing 2 bekommt eine eigene Adresse. Landing 1 behaelt ihre.
//
// Der teuerste Fehler waere hier nicht, dass Landing 2 nicht oeffnet - das
// merkt man sofort. Der teuerste waere, dass /oferta/<slug> auf einmal etwas
// anderes zeigt: Diese Links sind schon verschickt, sie stehen in
// WhatsApp-Verlaeufen, und niemand kann sie zurueckholen.

function rewrite(source) {
  return vercel.rewrites.find((entry) => entry.source === source);
}

function indexOfRewrite(source) {
  return vercel.rewrites.findIndex((entry) => entry.source === source);
}

test("Landing 1 bleibt unveraendert erreichbar", () => {
  const oferta = rewrite("/oferta/:slug");
  assert.ok(oferta, "die Route der Lead-Landing fehlt");
  assert.equal(oferta.destination, "/api/oferta?slug=:slug");
  assert.ok(fs.existsSync(path.join(ROOT, "api", "oferta.js")));
  assert.ok(fs.existsSync(path.join(ROOT, "apps/menyra-social/lead-landing/index.html")));
  assert.equal(
    vercel.functions["api/oferta.js"].includeFiles,
    "apps/menyra-social/lead-landing/index.html"
  );
});

test("Landing 2 hat eine eigene Route", () => {
  const entry = rewrite("/prezantim/:slug");
  assert.ok(entry, "die Route von Landing 2 fehlt in vercel.json");
  assert.equal(entry.destination, "/api/prezantim?slug=:slug");
  assert.equal(
    vercel.functions["api/prezantim.js"].includeFiles,
    "apps/menyra-social/lead-landing-2/index.html"
  );
});

test("die Route steht vor dem allgemeinen Profil-Muster", () => {
  // /:landingSlug faengt sonst alles ab, was zwei Segmente hat - dann landete
  // /prezantim/burger-nora in der Social-App statt auf Landing 2.
  const eigen = indexOfRewrite("/prezantim/:slug");
  const allgemein = indexOfRewrite("/:landingSlug/:surface");
  assert.ok(eigen > -1 && allgemein > -1);
  assert.ok(eigen < allgemein, "die Route von Landing 2 wird vom allgemeinen Muster verschluckt");
});

test("Landing 2 wird nicht zwischengespeichert", () => {
  // Der Wirt bekommt den Link und oeffnet ihn oft mehrmals. Eine alte Fassung
  // aus dem Zwischenspeicher waere hier das Schlimmste: Er saehe eine Seite,
  // die es so nicht mehr gibt, und wir wuessten nicht, welche.
  const regel = vercel.headers.find((entry) => entry.source === "/prezantim/:slug");
  assert.ok(regel, "es gibt keine Cache-Regel fuer /prezantim/:slug");
  const cache = regel.headers.find((header) => header.key === "Cache-Control");
  assert.match(cache.value, /no-store/);
});

test("der lokale Entwicklungsserver kennt beide Landings", () => {
  const server = fs.readFileSync(path.join(ROOT, "scripts", "local-dev-server.mjs"), "utf8");
  assert.match(server, /\/\^\\\/oferta/, "der Server kennt die Route der Lead-Landing nicht mehr");
  assert.match(server, /\/\^\\\/prezantim/, "der Server kennt die Route von Landing 2 nicht");
  assert.ok(server.includes("lead-landing-2/index.html"));
});

test("die Adresse sagt, um welches Lokal es geht", () => {
  assert.equal(readRouteKey({ pathname: "/prezantim/burger-nora", search: "" }), "burger-nora");
  assert.equal(readRouteKey({ pathname: "/prezantim/burger%20nora", search: "" }), "burger nora");
  // Aus einer Nachricht mit angehaengter Kennung.
  assert.equal(readRouteKey({ pathname: "/", search: "?r=abc123" }), "abc123");
  assert.equal(readRouteKey({ pathname: "/", search: "?restaurantId=abc123" }), "abc123");
  // Ohne Angabe: nichts. Eine halbe Seite waere schlimmer als gar keine.
  assert.equal(readRouteKey({ pathname: "/prezantim", search: "" }), "");
  assert.equal(readRouteKey({ pathname: "/", search: "" }), "");
});

test("der Knopf am Ende fuehrt auf das echte Profil", () => {
  assert.equal(claimUrl({ publicSlug: "burger-nora" }, "id1"), "/burger-nora");
  // Ohne Slug bleibt die Kennung - /lp/<id> ist die bestehende Route dafuer.
  assert.equal(claimUrl({}, "id1"), "/lp/id1");
  assert.equal(claimUrl({}, ""), "");
});

test("die Auslieferung von Landing 2 liest nur", () => {
  const handler = fs.readFileSync(path.join(ROOT, "api", "prezantim.js"), "utf8");
  ["PATCH", "PUT", "DELETE"].forEach((method) => {
    assert.ok(
      !new RegExp(`method:\\s*["']${method}["']`).test(handler),
      `api/prezantim.js benutzt ${method} - die Auslieferung darf nur lesen`
    );
  });
  // Der einzige POST ist :runQuery - die Suche nach dem Lokal ist ein Lesen.
  const posts = (handler.match(/method:\s*["']POST["']/g) || []).length;
  const runQuery = (handler.match(/:runQuery/g) || []).length;
  assert.ok(runQuery >= posts, "POST darf nur fuer :runQuery verwendet werden");
  assert.ok(handler.includes('name="l2-restaurant"'), "die Kennung wird nicht mitgegeben");
  assert.ok(
    !handler.includes("lead-landing/"),
    "api/prezantim.js liefert die Seite von Landing 1 aus"
  );
});

test("beide Landings liefern ihre eigene Seite aus", () => {
  const eins = fs.readFileSync(path.join(ROOT, "api", "oferta.js"), "utf8");
  const zwei = fs.readFileSync(path.join(ROOT, "api", "prezantim.js"), "utf8");
  assert.ok(eins.includes("apps/menyra-social/lead-landing/index.html"));
  assert.ok(zwei.includes("apps/menyra-social/lead-landing-2/index.html"));
  assert.ok(!eins.includes("lead-landing-2"), "Landing 1 wurde beim Bauen von Landing 2 angefasst");
});

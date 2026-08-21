import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import { pickNeighbours, mergePublicMeta, resolveTitleImage } from "../apps/menyra-social/lead-landing-2/landing2-data.js";
import {
  previewGo,
  previewOrder,
  previewProfile,
  previewSave,
  screen
} from "../apps/menyra-social/lead-landing-2/landing2-preview.js";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");

// Landing 2 zeigt eine Bestellung, einen GO-Vorgang und ein SAVE-Angebot.
//
// Keines davon darf etwas ausloesen. Das ist die eine Grenze, die man einer
// Seite von aussen nicht ansieht: Sie sieht aus wie die App - also muss im
// Code stehen, dass sie es nicht ist.

test("die Vorschauen enthalten keinen einzigen echten Knopf", () => {
  const profile = { name: "Burger Nora", city: "Prishtinë", currency: "EUR", logoUrl: "", coverUrl: "" };
  const items = [{ name: "Nora Burger", price: 4.5, imageUrl: "", description: "", section: "food", cardStyle: "testfirst_food" }];
  const html = [
    previewProfile(profile),
    previewOrder(profile, items),
    previewGo(profile, [], items),
    previewSave(profile, items)
  ].join("");

  // Kein <button>, kein <a href>, kein Formular: Was aussieht wie "Shto" oder
  // "Dërgo porosinë", ist ein <span>. Es kann nicht angetippt werden, weil es
  // nichts gibt, das darauf antworten wuerde.
  assert.ok(!/<button/i.test(html), "in einer Vorschau steht ein echter Knopf");
  assert.ok(!/<a\s/i.test(html), "in einer Vorschau steht ein echter Link");
  assert.ok(!/<form/i.test(html), "in einer Vorschau steht ein Formular");
  assert.ok(!/<input/i.test(html), "in einer Vorschau steht ein Eingabefeld");
  assert.ok(!/on[a-z]+="(?!this\.onerror)/i.test(html), "in einer Vorschau haengt ein Handler");
});

test("die Vorschau sagt einem Screenreader, dass sie ein Bild ist", () => {
  const html = screen("Profili", "<p>x</p>", { label: "Profili i Burger Nora" });
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Profili i Burger Nora"/);
});

test("die Vorschau von SAVE ist als Vorhaben gekennzeichnet", () => {
  const html = previewSave({ name: "Burger Nora", currency: "EUR" }, [{ name: "Burger", price: 4, imageUrl: "" }]);
  assert.ok(html.includes("Po vjen"));
});

test("Nachbarlokale sind echte Lokale - und nie das eigene", () => {
  const rows = [
    { id: "self", name: "Burger Nora", logoUrl: "https://cdn/a.jpg" },
    { id: "n1", name: "Bar Luna", logoUrl: "https://cdn/b.jpg" },
    { id: "n2", name: "Bar Luna", logoUrl: "https://cdn/c.jpg" },
    { id: "n3", name: "Ohne Bild" },
    { id: "n4", name: "", logoUrl: "https://cdn/d.jpg" },
    { id: "n5", name: "Kafe Toska", titleImageUrl: "https://cdn/e.jpg" }
  ];
  const picked = pickNeighbours(rows, "self");
  assert.deepEqual(picked.map((entry) => entry.name), ["Bar Luna", "Kafe Toska"]);
  // Ohne Bild taugt ein Lokal nicht als Kachel - es bliebe ein grauer Kasten.
  assert.ok(!picked.some((entry) => entry.name === "Ohne Bild"));
});

test("leere Felder aus public/meta verdecken die echten Werte nicht", () => {
  const merged = mergePublicMeta(
    { titleImageUrl: "https://cdn/echt.jpg", logoUrl: "https://cdn/logo.jpg", city: "Prishtinë" },
    { titleImageUrl: "", logoUrl: "   ", city: "Prizren", coverImages: [] }
  );
  assert.equal(merged.titleImageUrl, "https://cdn/echt.jpg");
  assert.equal(merged.logoUrl, "https://cdn/logo.jpg");
  assert.equal(merged.city, "Prizren");
});

test("das Titelbild wird wie in der App aufgeloest", () => {
  assert.equal(resolveTitleImage({ titleImageUrl: "a.jpg", coverUrl: "b.jpg" }), "a.jpg");
  assert.equal(resolveTitleImage({ coverImageUrl: "b.jpg" }), "b.jpg");
  assert.equal(resolveTitleImage({ coverImages: ["", "c.jpg"] }), "c.jpg");
  assert.equal(resolveTitleImage({}), "");
});

test("die Messung von Landing 2 liegt in einer eigenen Sammlung", () => {
  const rules = fs.readFileSync(path.join(ROOT, "firestore.rules"), "utf8");
  assert.ok(rules.includes("match /landing2Sessions/{sessionId}"), "es gibt keine Regel fuer landing2Sessions");
  assert.ok(rules.includes("landing2SessionShapeOk"), "die Form der Sitzung wird nicht geprueft");
  // Lesen darf nur, wer das Lokal verwaltet, oder das CEO-Konto - und
  // geloescht wird nie.
  const block = rules.slice(rules.indexOf("match /landing2Sessions/{sessionId}"));
  const body = block.slice(0, block.indexOf("}\n"));
  assert.match(body, /allow read: if canManageRestaurantDoc\(restaurantId\) \|\| isCeoActor\(\)/);
  assert.match(body, /allow delete: if false/);
});

test("die Messung kann die Sitzungen von Landing 1 nicht ueberschreiben", () => {
  const rules = fs.readFileSync(path.join(ROOT, "firestore.rules"), "utf8");
  // landingSessions bleibt, wie es war - eigene Form, eigene Antwortfelder.
  assert.ok(rules.includes("landingSessionShapeOk"), "die Regel von Landing 1 wurde entfernt");
  assert.ok(rules.includes("landingAnswersOk"), "die Regel von Landing 1 wurde entfernt");
});

test("kein Bild laedt im Voraus, ausser dem ersten", () => {
  const preview = fs.readFileSync(
    path.join(ROOT, "apps/menyra-social/lead-landing-2/landing2-preview.js"),
    "utf8"
  );
  assert.ok(preview.includes('loading="lazy"'), "Bilder werden nicht verzoegert geladen");
  assert.ok(preview.includes('decoding="async"'), "das Entpacken laeuft im Wischen mit");
  assert.ok(preview.includes("fetchpriority=\"high\""), "das erste Bild steht hinter dem Rest an");
});

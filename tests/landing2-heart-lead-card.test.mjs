import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const VIEW = path.join(ROOT, "apps/mnyra-heart/heart-crm-admin-read-view.js");
const CSS = path.join(ROOT, "apps/mnyra-heart/heart.css");

// Der Link auf Landing 2 muss dort liegen, wo im Vertrieb ohnehin gearbeitet
// wird: auf der Karte des Leads, neben "Oferta". Eine zweite Seite, die man
// erst suchen muss, wird nicht verschickt.

const source = fs.readFileSync(VIEW, "utf8");

test("die Lead-Karte traegt beide Seiten", () => {
  const card = source.slice(source.indexOf("function renderLeadCard"));
  const body = card.slice(0, card.indexOf("function renderCustomerCard"));
  assert.ok(body.includes(">Oferta<"), "der Link auf die Lead-Landing fehlt");
  assert.ok(body.includes(">Prezantimi<"), "der Link auf Landing 2 fehlt auf der Lead-Karte");
});

test("beide Links lassen sich kopieren und sind unterscheidbar benannt", () => {
  const card = source.slice(source.indexOf("function renderLeadCard"));
  const body = card.slice(0, card.indexOf("function renderCustomerCard"));
  // Ein Knopf "Kopjo linkun" fuer zwei Links waere im Vertrieb der teuerste
  // Tippfehler: Man verschickt die falsche Seite und merkt es nie.
  assert.ok(body.includes(">Kopjo Oferta<"));
  assert.ok(body.includes(">Kopjo Prezantimin<"));
  const kopieren = (body.match(/data-action="copy-lead-pitch-link"/g) || []).length;
  assert.equal(kopieren, 2, "es gibt nicht genau zwei Kopier-Knoepfe");
});

test("die beiden Adressen zeigen auf verschiedene Seiten", () => {
  assert.match(source, /buildLeadPageUrl\(lead, "oferta"\)/);
  assert.match(source, /buildLeadPageUrl\(lead, "prezantim"\)/);
});

test("die Adresse ist absolut, damit sie in WhatsApp funktioniert", () => {
  assert.match(source, /https:\/\/mnyra\.com\$\{path\}/);
});

test("der Knopf von Landing 2 ist auf den ersten Blick zu finden", () => {
  assert.ok(source.includes("heart-crm-action-placeholder--landing2"));
  const css = fs.readFileSync(CSS, "utf8");
  assert.ok(
    css.includes(".heart-crm-action-placeholder--landing2"),
    "der Knopf hat keine eigene Farbe und geht neben 'Oferta' unter"
  );
});

test("Heart oeffnet die Seiten in einem neuen Tab", () => {
  const card = source.slice(source.indexOf("function renderLeadCard"));
  const body = card.slice(0, card.indexOf("function renderCustomerCard"));
  const links = body.match(/<a href="\$\{escapeHtml\((?:pitchUrl|presentationUrl)\)\}"[^>]*>/g) || [];
  assert.equal(links.length, 2);
  links.forEach((link) => {
    assert.ok(link.includes('target="_blank"'));
    assert.ok(link.includes('rel="noopener noreferrer"'));
  });
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import handler from "../api/oferta.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");

// Beim Teilen eines Links holen WhatsApp, Facebook und die uebrigen nur die
// Antwort des Servers - JavaScript fuehren sie nicht aus. Die Vorschau muss
// deshalb schon in der ersten Antwort stehen. Diese Tests halten fest, dass
// sie das tut, und dass die Seite auch dann noch ausgeliefert wird, wenn das
// Lesen der Daten scheitert.

function fakeRes() {
  const headers = {};
  return {
    headers,
    statusCode: 0,
    body: "",
    setHeader(key, value) { headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; }
  };
}

async function serve(req, fakeFetch) {
  const cwd = process.cwd();
  const realFetch = globalThis.fetch;
  process.chdir(repoRoot);
  if (fakeFetch) globalThis.fetch = fakeFetch;
  const res = fakeRes();
  try {
    await handler(req, res);
  } finally {
    globalThis.fetch = realFetch;
    process.chdir(cwd);
  }
  return res;
}

function metaContent(html, key) {
  const match = html.match(
    new RegExp(`<meta (?:property|name)="${key.replace(/[:]/g, "\\:")}" content="([^"]*)"`)
  );
  return match ? match[1] : "";
}

const LOGO = "https://firebasestorage.googleapis.com/bro-pizza-logo.png";

function fetchWithRestaurant(fields = {}) {
  return async (url) => {
    const address = String(url);
    if (address.includes("publicRoutes")) {
      return { ok: true, json: async () => ({ fields: { restaurantId: { stringValue: "id-1" } } }) };
    }
    return {
      ok: true,
      json: async () => ({
        fields: {
          name: { stringValue: "Bro Pizza" },
          city: { stringValue: "Prishtine" },
          bio: { stringValue: "Bro Pizza shije unike" },
          logoUrl: { stringValue: LOGO },
          ...fields
        }
      })
    };
  };
}

test("die geteilte Adresse traegt das Logo des Lokals", async () => {
  const res = await serve(
    { query: { slug: "bro-pizza" }, url: "/oferta/bro-pizza" },
    fetchWithRestaurant()
  );

  assert.equal(res.statusCode, 200);
  assert.match(res.headers["Content-Type"], /text\/html/);
  assert.equal(metaContent(res.body, "og:image"), LOGO);
  assert.equal(metaContent(res.body, "twitter:image"), LOGO);
  assert.equal(metaContent(res.body, "og:title"), "Bro Pizza - Mnyra");
  assert.match(metaContent(res.body, "og:description"), /Bro Pizza shije unike/);
  assert.equal(metaContent(res.body, "og:url"), "https://www.mnyra.com/oferta/bro-pizza");
});

test("ohne Logo tritt das Titelbild ein, sonst das Zeichen von Mnyra", async () => {
  const cover = "https://firebasestorage.googleapis.com/cover.jpg";
  const mitBild = await serve(
    { query: { slug: "x" }, url: "/oferta/x" },
    fetchWithRestaurant({ logoUrl: { stringValue: "" }, coverUrl: { stringValue: cover } })
  );
  assert.equal(metaContent(mitBild.body, "og:image"), cover);

  const ohneBild = await serve(
    { query: { slug: "x" }, url: "/oferta/x" },
    fetchWithRestaurant({ logoUrl: { stringValue: "" } })
  );
  assert.match(metaContent(ohneBild.body, "og:image"), /^https:\/\/www\.mnyra\.com\//);
});

test("eine Adresse ohne https kommt nicht in die Vorschau", async () => {
  const res = await serve(
    { query: { slug: "x" }, url: "/oferta/x" },
    fetchWithRestaurant({ logoUrl: { stringValue: "/lokal/logo.png" } })
  );
  // Relativ angegeben koennte kein Dienst sie aufloesen - dann lieber das
  // Zeichen von Mnyra als ein leeres Feld.
  assert.match(metaContent(res.body, "og:image"), /^https:\/\/www\.mnyra\.com\//);
});

test("die Seite wird auch dann ausgeliefert, wenn das Lesen scheitert", async () => {
  const res = await serve(
    { query: { slug: "bro-pizza" }, url: "/oferta/bro-pizza" },
    async () => { throw new Error("kein Netz"); }
  );

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.includes("lead-landing-app.js"), "das Skript der Landing fehlt");
  assert.ok(res.body.includes("lead-landing-styles.css"), "das Stylesheet der Landing fehlt");
  assert.match(metaContent(res.body, "og:image"), /^https:\/\/www\.mnyra\.com\//);
});

test("ein Name mit Auszeichnung darin bricht die Vorschau nicht auf", async () => {
  const res = await serve(
    { query: { slug: "x" }, url: "/oferta/x" },
    fetchWithRestaurant({ name: { stringValue: '"><script>alert(1)</script>' } })
  );

  assert.ok(!res.body.includes("<script>alert(1)"), "der Name kam unmaskiert durch");
  assert.equal((res.body.match(/<title>/g) || []).length, 1);
});

test("der Rahmen kommt aus derselben Datei, die auch sonst ausgeliefert wird", async () => {
  const shell = readFileSync(
    join(repoRoot, "apps", "menyra-social", "lead-landing", "index.html"),
    "utf8"
  );
  const res = await serve({ query: { slug: "x" }, url: "/oferta/x" }, async () => { throw new Error("x"); });

  // Alles, was der Rahmen laedt, muss auch in der Antwort stehen - sonst
  // liefert die Funktion eine zweite, veraltete Fassung der Seite aus.
  for (const asset of shell.match(/(?:href|src)="([^"]+)"/g) || []) {
    assert.ok(res.body.includes(asset), `${asset} fehlt in der Antwort`);
  }
});

test("die Route zeigt auf die Funktion, sonst wird sie nie aufgerufen", () => {
  const config = JSON.parse(readFileSync(join(repoRoot, "vercel.json"), "utf8"));
  const route = config.rewrites.find((entry) => entry.source === "/oferta/:slug");
  assert.ok(route, "die Route /oferta/:slug fehlt");
  assert.equal(route.destination, "/api/oferta?slug=:slug");
  assert.equal(
    config.functions?.["api/oferta.js"]?.includeFiles,
    "apps/menyra-social/lead-landing/index.html",
    "der Rahmen der Seite wird nicht mit ausgeliefert"
  );
});

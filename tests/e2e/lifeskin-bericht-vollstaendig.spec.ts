import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { raportLesen } from "../../shared/lifeskin-analyse.js";

// Der Befund muss GANZ ankommen.
//
// GEMESSEN, NICHT GESCHAETZT: Auf dem Telefon standen nur Ekzaminimi und
// Gjetjet und darunter sofort der Preis. Zonen, Messwerte, Diagnose,
// Erklaerung und Prognose fehlten - mehr als die Haelfte der Seite. Die
// Seite war in Ordnung; freigegeben worden war ein Bericht ohne die
// Angaben dafuer. Der alte Test hat das nicht gesehen, weil sein Beispiel
// diese Angaben selbst nicht hatte.
//
// Dieser hier nimmt das Beispiel aus dem Schema, schickt es durch
// denselben Leser wie Heart und prueft danach jeden Abschnitt einzeln.

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const raport = raportLesen(
  (() => {
    const md = readFileSync(join(wurzel, "docs/lifeskin-raport-schema.md"), "utf8");
    const roh = md.slice(md.indexOf("```json") + 7);
    return roh.slice(0, roh.indexOf("```"));
  })(),
);

// Firestore liefert jeden Wert verpackt. Was Heart schreibt, muss hier
// genauso ankommen - sonst prueft der Test eine Form, die es nicht gibt.
function fsWert(x: unknown): unknown {
  if (x === null || x === undefined) return { nullValue: null };
  if (Array.isArray(x)) return { arrayValue: { values: x.map(fsWert) } };
  if (typeof x === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(Object.entries(x as object).map(([k, v]) => [k, fsWert(v)])),
      },
    };
  }
  if (typeof x === "boolean") return { booleanValue: x };
  if (typeof x === "number") {
    return Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x };
  }
  return { stringValue: String(x) };
}

const BERICHT = {
  fields: {
    createdAt: { stringValue: "2026-09-05T18:14:00.000Z" },
    code: { stringValue: "LS-0509-K7M2P" },
    name: { stringValue: "Arlinda" },
    sprache: { stringValue: "sq" },
    status: { stringValue: "fertig" },
    photos: { integerValue: "3" },
    preis: { integerValue: "53" },
    befund: { stringValue: String(raport.gjetjet) },
    raport: fsWert(raport),
    produkte: {
      arrayValue: {
        values: [
          {
            mapValue: {
              fields: {
                id: { stringValue: "lifeskin-akne" },
                satz: { stringValue: "Ne mengjes dhe ne mbremje." },
              },
            },
          },
        ],
      },
    },
  },
};

const VEPRIMI = [
  "Hap folikulin e bllokuar dhe largon qelizat e vdekura",
  "Ul bakterin që ushqen inflamacionin",
  "Qetëson skuqjen pa e tharë barrierën",
];

const PRODUKT = {
  fields: {
    name: { stringValue: "Lifeskin Akne" },
    inhalt: { stringValue: "30 ml" },
    einzelpreis: { integerValue: "62" },
    veprimi: fsWert({ sq: VEPRIMI, de: [] }),
  },
};

// Dasselbe Produkt ohne die Wirkungszeilen. Die Seite darf dann kein
// Versprechen erfinden - der ganze Abschnitt faellt weg.
const PRODUKT_OHNE = {
  fields: {
    name: { stringValue: "Lifeskin Akne" },
    inhalt: { stringValue: "30 ml" },
    einzelpreis: { integerValue: "62" },
  },
};

async function oeffne(page: Page) {
  await page.route("**/firestore.googleapis.com/**", (weg) => {
    const fertig = /\/products\//.test(weg.request().url()) ? PRODUKT : BERICHT;
    return weg.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fertig),
    });
  });
  await page.goto("/apps/lifeskin-bericht/index.html");
  await page.evaluate(async () => {
    const { Bericht } = await import("/apps/lifeskin-bericht/bericht.js");
    const b = new Bericht({
      ort: {
        pathname: "/analiza/aabbccdd11223344",
        href: "https://mnyra.com/analiza/aabbccdd11223344",
      },
    });
    await b.starte();
  });
  await page.waitForTimeout(700);
}

test.use({ viewport: { width: 390, height: 844 } });

test("jeder Abschnitt des Befunds steht wirklich auf der Seite", async ({ page }) => {
  await oeffne(page);

  // Kopf: Marke und Fallnummer, Titel, Unterschrift.
  await expect(page.locator("#lb-fnummer")).toHaveText(/LS-/);
  await expect(page.locator("#lb-ftitel")).not.toBeEmpty();

  // Die Pillen - Fotos, Zonen, Parameter.
  await expect(page.locator("#lb-pillen .lb-pille")).toHaveCount(3);

  // Was untersucht wurde. NICHT der Standardsatz: der steht nur da, wenn
  // die Angaben fehlen - und genau daran war der leere Bericht zu erkennen.
  const ekz = await page.locator("#lb-ekztext").textContent();
  expect(ekz?.trim().length).toBeGreaterThan(40);
  expect(ekz).not.toContain("{zonat}");

  // Der Befund steht sofort da - er ist die Belohnung fuer den Scan.
  await expect(page.locator("#lb-gjettext")).not.toBeEmpty();

  // Die Zonen und das Verfahren liegen in den Einzelheiten, zugeklappt.
  await expect(page.locator("#lb-detajet")).toBeVisible();
  await page.locator("#lb-detajet summary").click();
  await page.waitForTimeout(300);
  const zonen = page.locator("#lb-zonen .lb-zone");
  expect(await zonen.count()).toBeGreaterThanOrEqual(3);
  await expect(zonen.first().locator(".lb-zone__ort")).not.toBeEmpty();

  // DREI Messwerte oben - die zwei staerksten und der eine, der in
  // Ordnung ist. Fuenf Balken untereinander sind nicht glaubwuerdiger,
  // nur laenger; der gute Wert ist der Kontrast, der die schlechten
  // scharf macht, und er darf deshalb nicht herausfallen.
  const zeilen = page.locator("#lb-mess .lb-zeile");
  await expect(zeilen).toHaveCount(3);
  const stufen = await page.locator("#lb-mess .lb-stab").evaluateAll((els) =>
    els.map((el) => Number((el as HTMLElement).dataset.s)),
  );
  expect(stufen[0], "Der staerkste Wert steht nicht oben").toBeGreaterThanOrEqual(stufen[1]);
  expect(stufen[2], "Der gute Wert steht nicht unten").toBe(0);

  // Und es steht dabei, wie viele wirklich geprueft wurden.
  await expect(page.locator("#lb-messrest")).toHaveText(/\d+/);
  // Die uebrigen sind nicht weg - sie stehen in den Einzelheiten.
  const uebrig = await page.locator("#lb-messtjere .lb-zeile").count();
  expect(uebrig, "Die uebrigen Messwerte sind verschwunden").toBeGreaterThan(0);

  // Die Diagnose - und die Handlung darunter.
  await expect(page.locator("#lb-diagnose")).toBeVisible();
  await expect(page.locator("#lb-diagname")).not.toBeEmpty();
  await expect(page.locator("#lb-diagstufe")).not.toBeEmpty();

  // Die Erklaerung fuer den Patienten.
  await expect(page.locator("#lb-erklaerteil")).toBeVisible();
  expect(await page.locator("#lb-erklaertext .lb-satz").count()).toBeGreaterThanOrEqual(1);

  // Was ohne Pflege geschieht.
  await expect(page.locator("#lb-ohneteil")).toBeVisible();
  await expect(page.locator("#lb-zeitleiste .lb-zeitfeld")).toHaveCount(3);

  // Und erst danach die Therapie und der Preis.
  await expect(page.locator("#lb-produkte")).not.toBeEmpty();
  await expect(page.locator("#lb-kaufen")).toBeVisible();
});

test("kein Abschnitt der Seite bleibt unsichtbar oder leer", async ({ page }) => {
  await oeffne(page);

  // Jeder Abschnitt, den die Seite kennt, muss bei vollstaendigen Angaben
  // auch da sein. Ein einzelner versteckter Teil ist ein halber Bericht -
  // und ein halber Bericht verkauft nichts.
  const leer = await page.evaluate(() => {
    const ids = ["lb-pillen", "lb-ekztext", "lb-gjettext", "lb-messteil", "lb-diagnose",
                 "lb-erklaerteil", "lb-ohneteil", "lb-produkte"];
    const raus: string[] = [];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) { raus.push(`${id}: gibt es nicht`); continue; }
      if (el.classList.contains("ls-verstecken")) { raus.push(`${id}: versteckt`); continue; }
      if (!el.textContent?.trim()) raus.push(`${id}: leer`);
    }
    return raus;
  });
  expect(leer, "Diese Abschnitte fehlen dem Patienten").toEqual([]);
});

test("die Klebeleiste traegt nur den Knopf - der Rest steht bei der Therapie", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Die drei Zusagen standen in der Leiste.
  // Die war damit dreimal so hoch, stand dauernd im Bild und schob Preis
  // und Tagesbetrag aus dem Fenster.
  await oeffne(page);

  const inLeiste = await page.evaluate(() =>
    Boolean(document.querySelector("#lb-leiste #lb-sicher")));
  expect(inLeiste, "Die Zusagen kleben wieder unten am Knopf").toBe(false);

  // Sie stehen unmittelbar unter dem Preis, im mitscrollenden Teil.
  const beiPreis = await page.evaluate(() => {
    const preis = document.querySelector(".lb-preis");
    const sicher = document.querySelector("#lb-sicher");
    if (!preis || !sicher) return null;
    return { nachPreis: preis.compareDocumentPosition(sicher) & Node.DOCUMENT_POSITION_FOLLOWING,
             gleicherTeil: preis.parentElement === sicher.parentElement };
  });
  expect(beiPreis?.gleicherTeil, "Die Zusagen stehen nicht beim Preis").toBe(true);
  expect(Boolean(beiPreis?.nachPreis), "Die Zusagen stehen vor dem Preis").toBe(true);

  await expect(page.locator("#lb-sicher li")).toHaveCount(3);

  // Die Leiste bleibt flach: Knopf plus die leise Zeile darunter.
  const hoehe = await page.locator("#lb-leiste").evaluate((el) => el.getBoundingClientRect().height);
  expect(hoehe, "Die Leiste ist zu hoch - sie frisst den Bildschirm").toBeLessThan(130);
});

test("Preis und Tagesbetrag stehen unter der Therapie - mit Abstand", async ({ page }) => {
  await oeffne(page);
  await page.locator(".lb-preis").scrollIntoViewIfNeeded();
  // Erst messen, wenn der Block angekommen ist: waehrend er einschwebt,
  // steht er sechzehn Pixel tiefer, und dann misst man die Bewegung
  // statt des Abstands.
  await expect(page.locator(".lb-preis")).toHaveAttribute("data-zeig", "da");
  await page.waitForTimeout(700);

  await expect(page.locator("#lb-preisjetzt")).toHaveText(/53/);
  await expect(page.locator("#lb-preistag")).toHaveText(/28/);

  // Kein Block klebt am naechsten.
  const abstaende = await page.evaluate(() => {
    const karte = document.querySelector(".lb-produkt")?.getBoundingClientRect();
    const preis = document.querySelector(".lb-preis")?.getBoundingClientRect();
    const sicher = document.querySelector("#lb-sicher")?.getBoundingClientRect();
    if (!karte || !preis || !sicher) return null;
    return [preis.top - karte.bottom, sicher.top - preis.bottom];
  });
  expect(abstaende).not.toBeNull();
  for (const abstand of abstaende as number[]) expect(abstand).toBeGreaterThanOrEqual(10);
});

test("die Therapie traegt die vier Wochen, die Begleitung und die Rechnung", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Beim Umbau der Seite sind sie
  // herausgefallen. Ohne sie kauft er eine Flasche und rechnet einen
  // Flaschenpreis; mit ihnen kauft er eine Therapie mit einem Ende.
  await oeffne(page);

  await expect(page.locator("#lb-therapieunter")).not.toBeEmpty();

  // Vier Wochen, in dieser Reihenfolge.
  await expect(page.locator("#lb-plan li")).toHaveCount(4);
  const zahlen = await page.locator("#lb-plan .lb-plan__zahl").allTextContents();
  expect(zahlen).toEqual(["1", "2", "3", "4"]);
  await expect(page.locator("#lb-planmarke")).toHaveText(/28/);

  // Die Begleitung - sie steht vor dem Preis, weil sie ihn erklaert.
  await expect(page.locator("#lb-betreuung")).toBeVisible();
  await expect(page.locator("#lb-betreuungtitel")).not.toBeEmpty();

  // Die Rechnung: Marke, Ankerpreis, Setpreis, Ersparnis, Tagesbetrag.
  await expect(page.locator("#lb-preismarke")).not.toBeEmpty();
  await expect(page.locator("#lb-preisanker")).toHaveText(/62/);
  await expect(page.locator("#lb-preisjetzt")).toHaveText(/53/);
  await expect(page.locator("#lb-preisspar")).toHaveText(/9/);
  await expect(page.locator("#lb-preistag")).toHaveText(/28/);

  // Und die Reihenfolge stimmt: Produkt, Wochen, Begleitung, Preis.
  const oben = await page.evaluate(() =>
    ["#lb-produkte", "#lb-plan", "#lb-betreuung", ".lb-preis"]
      .map((w) => document.querySelector(w)?.getBoundingClientRect().top ?? -1));
  expect(oben).toEqual([...oben].sort((a, b) => a - b));
});

test("der Kopf traegt seinen Namen", async ({ page }) => {
  // "Raporti dermatologjik" allein ist eine Vorlage. Mit seinem Namen ist
  // es SEIN Bericht - und die Seite ist teilbar, also steht dort nur der
  // Vorname, nie eine Anschrift.
  await oeffne(page);
  await expect(page.locator("#lb-ffuer")).toHaveText(/Arlinda/);
  const text = await page.locator("#lb-ffuer").textContent();
  expect(text).not.toMatch(/\d{4,}/);
});

test("die Pillen behaupten nie eine einzelne Zone", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Bei einem einzelnen Foto stand dort
  // "1 foto · 1 zona" - das Erste nach der Ueberschrift, und es sagte
  // "wir haben kaum hingeschaut". Drei Zonen sind ein Ergebnis, eine ist
  // keins; an ihrer Stelle steht, was immer stimmt: die Zahl der
  // beurteilten Parameter.
  await oeffne(page);
  const pillen = await page.locator("#lb-pillen .lb-pille").allTextContents();
  expect(pillen.length).toBe(3);
  expect(pillen.some((p) => /parametra|Parameter/.test(p))).toBe(true);
  for (const p of pillen) {
    expect(p, `Die Pille "${p}" behauptet eine einzelne Zone`).not.toMatch(/^1 zona/);
  }
});

test("der Name eines Messwerts wird nicht von seinem Wert erdrueckt", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Die Wertspalte war ohne Obergrenze und
  // nahm sich bis zu 73% der Breite - der Name, der Anker jeder Zeile,
  // behielt 83 Pixel und brach auf zwei Zeilen.
  await oeffne(page);
  const zeilen = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".lb-zeile")).map((z) => {
      const n = z.querySelector(".lb-zeile__name")!.getBoundingClientRect();
      const w = z.querySelector(".lb-zeile__wert")!.getBoundingClientRect();
      const ganz = z.getBoundingClientRect();
      return { anteil: n.width / ganz.width, luecke: w.left - n.right };
    }));
  expect(zeilen.length).toBeGreaterThan(0);
  for (const z of zeilen) {
    expect(z.anteil, "Der Name bekommt weniger als 38% der Zeile").toBeGreaterThan(0.38);
    expect(z.luecke, "Zwischen Name und Wert steht zu wenig Luft").toBeGreaterThanOrEqual(12);
  }
});

test("die Bruecke nennt SEINEN Befund und sagt, was das Mittel dagegen tut", async ({ page }) => {
  // Die Seite bewies ein Problem in aller Ausfuehrlichkeit und zeigte dann
  // eine Flasche. Dazwischen fehlte der Satz, den jeder Skeptiker als
  // Erstes denkt: "Gut - und warum hilft ausgerechnet DAS?"
  await oeffne(page);
  await expect(page.locator("#lb-pseteil")).toBeVisible();

  // Der Satz kommt aus SEINER Analyse, nicht aus einer Vorlage.
  const satz = (await page.locator("#lb-psesatz").textContent())!.toLowerCase();
  const staerkster = raport.parametrat[0].emri.toLowerCase();
  expect(satz, "Der Satz nennt nicht seinen staerksten Befund").toContain(staerkster);

  // Und die Zeilen kommen vom Produkt.
  const zeilen = await page.locator("#lb-tut li").allTextContents();
  expect(zeilen.length).toBe(VEPRIMI.length);
  expect(zeilen[0]).toContain(VEPRIMI[0]);

  // Die Bruecke steht VOR der Therapie - sonst traegt sie nichts.
  const oben = await page.evaluate(() =>
    ["#lb-pseteil", "#lb-produkte"].map((w) => document.querySelector(w)!.getBoundingClientRect().top));
  expect(oben[0]).toBeLessThan(oben[1]);
});

test("ohne Wirkungszeilen erfindet die Seite kein Versprechen", async ({ page }) => {
  await page.route("**/firestore.googleapis.com/**", (weg) => {
    const fertig = /\/products\//.test(weg.request().url()) ? PRODUKT_OHNE : BERICHT;
    return weg.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fertig) });
  });
  await page.goto("/apps/lifeskin-bericht/index.html");
  await page.evaluate(async () => {
    const { Bericht } = await import("/apps/lifeskin-bericht/bericht.js");
    await new Bericht({ ort: { pathname: "/analiza/aabbccdd11223344", href: "https://mnyra.com/analiza/aabbccdd11223344" } }).starte();
  });
  await page.waitForTimeout(700);
  await expect(page.locator("#lb-pseteil")).not.toBeVisible();
});

test("die Garantie steht gross vor dem Knopf, nicht klein darunter", async ({ page }) => {
  // Sie war eine von drei Zeilen in elf Pixeln. Das ist die staerkste
  // Zusage der Seite: Sie nimmt dem Zoegernden das einzige echte Risiko ab.
  await oeffne(page);
  await expect(page.locator("#lb-garanci")).toBeVisible();
  await expect(page.locator("#lb-garancititel")).toHaveText(/30/);
  await expect(page.locator("#lb-garancitext")).not.toBeEmpty();

  const groesse = await page.locator("#lb-garancititel").evaluate((el) =>
    parseFloat(getComputedStyle(el).fontSize));
  expect(groesse, "Die Garantie steht wieder im Kleingedruckten").toBeGreaterThanOrEqual(14);

  // Und der Satz, wofuer der Bericht gilt.
  await expect(page.locator("#lb-vlen")).toHaveText(/\d{2}\.\d{2}\.\d{4}/);
});

test("jede Frage vor dem Kauf ist beantwortet", async ({ page }) => {
  // Wer eine Frage hat und keine Antwort findet, kauft nicht - er schiebt
  // es auf, und aufgeschoben heisst nie.
  await oeffne(page);
  const fragen = page.locator("#lb-pyetjet .lb-pyetje__frage");
  await expect(fragen).toHaveCount(6);

  const summen = (await fragen.locator("summary").allTextContents()).join(" ").toLowerCase();
  for (const thema of ["sigurt", "shtatzënë", "kremrat", "dërgesa", "funksionon", "fotot"]) {
    expect(summen, `Die Frage nach "${thema}" fehlt`).toContain(thema);
  }

  // Jede laesst sich aufklappen und traegt eine Antwort.
  await fragen.first().locator("summary").click();
  await page.waitForTimeout(200);
  const antwort = await fragen.first().locator("p").textContent();
  expect(antwort!.trim().length).toBeGreaterThan(40);
});

// ---------- Bewegung ----------
//
// Sie ist kein Schmuck. Ein Befund, der als fertige Wand dasteht, wird
// ueberflogen; einer, dessen Abschnitte beim Herunterkommen erscheinen,
// wird gelesen. Aber ein Befund, den eine Animation VERSCHLUCKT, waere
// der schlimmste Fehler dieser Seite - deshalb prueft der erste Fall
// genau das.

test("kein Abschnitt bleibt in der Animation haengen", async ({ page }) => {
  await oeffne(page);
  // Einmal ganz durch, wie ein Patient es tut.
  await page.evaluate(async () => {
    const rolle = document.querySelector("#lb-rolle")!;
    for (let y = 0; y <= rolle.scrollHeight; y += 300) {
      rolle.scrollTop = y;
      await new Promise((f) => setTimeout(f, 60));
    }
  });
  await page.waitForTimeout(900);

  const versteckt = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-zeig]"))
      .filter((el) => (el as HTMLElement).dataset.zeig !== "da"
        || Number(getComputedStyle(el).opacity) < 0.99)
      .map((el) => el.id || el.className));
  expect(versteckt, "Diese Abschnitte sind unsichtbar geblieben").toEqual([]);
});

test("die Abschnitte kommen beim Scrollen, nicht alle auf einmal", async ({ page }) => {
  await oeffne(page);
  const zuerst = await page.evaluate(() => ({
    gesamt: document.querySelectorAll("[data-zeig]").length,
    da: document.querySelectorAll('[data-zeig="da"]').length,
  }));
  expect(zuerst.gesamt, "Es wird gar nichts bewegt").toBeGreaterThan(6);
  expect(zuerst.da, "Alles steht sofort da - dann bewegt sich nichts").toBeLessThan(zuerst.gesamt);
  expect(zuerst.da, "Der erste Bildschirm muss sofort stehen").toBeGreaterThan(0);

  await page.locator("#lb-messteil").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const danach = await page.evaluate(() => document.querySelectorAll('[data-zeig="da"]').length);
  expect(danach, "Beim Scrollen kommt nichts dazu").toBeGreaterThan(zuerst.da);
});

test("der Lesefortschritt oben waechst mit", async ({ page }) => {
  // Er sagt zwei Dinge auf einmal: wie viel noch kommt - und dass es ein
  // Ende gibt. Angefangenes wird zu Ende gelesen, wenn man das Ende sieht.
  await oeffne(page);
  const anfang = await page.locator("#lb-fortschritt").evaluate((el) => el.getBoundingClientRect().width);
  await page.evaluate(() => {
    const rolle = document.querySelector("#lb-rolle")!;
    rolle.scrollTop = rolle.scrollHeight;
  });
  await page.waitForTimeout(400);
  const ende = await page.locator("#lb-fortschritt").evaluate((el) => el.getBoundingClientRect().width);
  expect(anfang).toBeLessThan(4);
  expect(ende, "Der Fortschritt waechst nicht").toBeGreaterThan(200);
});

test("wer Bewegung abgeschaltet hat, bekommt den Befund sofort ganz", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await oeffne(page);
  const blass = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-zeig]"))
      .filter((el) => Number(getComputedStyle(el).opacity) < 0.99).length);
  expect(blass, "Trotz abgeschalteter Bewegung ist etwas unsichtbar").toBe(0);
});

test("der Bericht hat Luft zwischen den Abschnitten", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Zwischen zwei Abschnitten lagen 38 Pixel
  // und die Titel waren nur zweieinhalb Punkt groesser als der Text. Wo
  // alle Groessen nah beieinanderliegen, hebt sich nichts ab - und was
  // sich nicht abhebt, wird ueberflogen.
  await oeffne(page);
  const masse = await page.evaluate(() => {
    // Die Luft zwischen zwei Abschnitten besteht aus zwei Teilen: dem
    // Abstand der Rolle und dem eigenen oberen Rand des naechsten
    // Abschnitts. Wer nur von Kasten zu Kasten misst, sieht die Haelfte.
    const rolle = document.querySelector("#lb-rolle")!;
    const teil = document.querySelector(".lb-teil:not(.ls-verstecken)")!;
    const h2 = document.querySelector(".lb-teil h2")!;
    const p = document.querySelector("#lb-gjettext")!;
    return {
      luft: parseFloat(getComputedStyle(rolle).rowGap) + parseFloat(getComputedStyle(teil).paddingTop),
      kopfLuft: parseFloat(getComputedStyle(document.querySelector(".lb-teil__kopf")!).marginBottom),
      titel: parseFloat(getComputedStyle(h2).fontSize),
      text: parseFloat(getComputedStyle(p).fontSize)
    };
  });
  // Eine Spanne, nach BEIDEN Seiten. Zu eng wird ueberflogen; zu viel
  // Luft macht den Bericht nur laenger, ohne ihn leichter zu machen -
  // und Scroll-Muedigkeit kostet genauso viele Leser wie eine Textwand.
  expect(masse.luft, "Die Abschnitte kleben aneinander").toBeGreaterThanOrEqual(38);
  expect(masse.luft, "Zu viel Luft - der Bericht wird nur laenger").toBeLessThanOrEqual(48);
  expect(masse.kopfLuft, "Der Titel klebt an seinem Text").toBeGreaterThanOrEqual(12);
  expect(masse.titel - masse.text, "Titel und Text sind zu nah beieinander")
    .toBeGreaterThanOrEqual(4);
});

test("waehrend des Befunds gibt es GAR KEINEN Knopf", async ({ page }) => {
  // DER wichtigste Punkt der ganzen Seite.
  //
  // Ein Knopf am unteren Rand ist eine Abkuerzung, und eine Abkuerzung
  // nimmt man. Wer gerade erfaehrt, was mit seiner Haut ist, soll das
  // lesen - nicht danebenliegend angeboten bekommen, es zu ueberspringen.
  // Und wer beim ersten Satz "53 €" liest, liest ab da ohnehin nur noch
  // "wo wollen die mir die 53 € begruenden".
  await oeffne(page);
  await expect(page.locator("#lb-leiste")).toHaveAttribute("data-stufe", "aus");

  // Nicht nur blass: wirklich weg, und nicht antippbar.
  const weg = await page.locator("#lb-leiste").evaluate((el) => {
    const stil = getComputedStyle(el);
    return { unten: el.getBoundingClientRect().top >= window.innerHeight - 2,
             klickbar: stil.pointerEvents !== "none", deckung: Number(stil.opacity) };
  });
  expect(weg.klickbar, "Der Knopf ist antippbar, obwohl er nicht da sein soll").toBe(false);
  expect(weg.deckung).toBeLessThan(0.05);
});

test("der Knopf kommt bei der Empfehlung - und heisst FILLO, nicht kaufen", async ({ page }) => {
  await oeffne(page);
  await page.locator("#lb-pseteil").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await expect(page.locator("#lb-leiste")).toHaveAttribute("data-stufe", "kauf");

  const knopf = (await page.locator("#lb-kaufen").textContent())!;
  expect(knopf).toMatch(/53/);
  // "Fillo" ist ein Anfang, "Blej" ist ein Kauf. Die Frage soll lauten
  // "wann fange ich an", nicht "kaufe ich zwei Cremes".
  expect(knopf.toLowerCase()).toContain("fillo");
  expect(knopf.toLowerCase()).not.toContain("blej");

  // Darunter leise das, was das Risiko wegnimmt.
  const unter = (await page.locator("#lb-kaufunter").textContent())!.toLowerCase();
  for (const wort of ["kartë", "dera", "garanci"]) expect(unter).toContain(wort);

  // Und er ist jetzt wirklich antippbar.
  await expect(page.locator("#lb-leiste")).toHaveCSS("pointer-events", "auto");
  await page.click("#lb-kaufen");
  await page.waitForTimeout(400);
  await expect(page.locator("#lb-bestellen")).toHaveAttribute("data-aktiv", "ja");
});

test("der Preis kommt erst nach dem Schnitt und nach der Liste", async ({ page }) => {
  await oeffne(page);
  // Der Schnitt zwischen Bericht und Therapie.
  await expect(page.locator(".lb-szene")).toBeVisible();
  await expect(page.locator("#lb-szenemarke")).not.toBeEmpty();

  // Der Einwand des erfahrenen Kaeufers steht VOR der Begruendung.
  await expect(page.locator("#lb-provuartext")).not.toBeEmpty();
  const stellen = await page.evaluate(() =>
    [".lb-szene", "#lb-provuartext", "#lb-pseteil", "#lb-produkte", "#lb-perfshi", ".lb-preis"]
      .map((w) => document.querySelector(w)!.getBoundingClientRect().top));
  expect(stellen).toEqual([...stellen].sort((a, b) => a - b));

  // Und die Liste traegt wirklich alles, was in dem Preis steckt.
  // Fuenf, nicht acht: Versand und Garantie stehen nach dem Preis, nicht
  // hier. Dreimal dasselbe liest sich als Verkaufstrichter.
  await expect(page.locator("#lb-perfshiliste li")).toHaveCount(5);
  const punkte = (await page.locator("#lb-perfshiliste li").allTextContents()).join(" ").toLowerCase();
  expect(punkte, "Der Versand steht wieder in der Leistungsliste").not.toContain("dërgesa");
  expect(punkte, "Die Garantie steht wieder in der Leistungsliste").not.toContain("garanci");
  await expect(page.locator("#lb-perfshimarke")).toHaveText(/53/);
});

test("vor dem Kapitelwechsel steht mehr Luft als zwischen den Abschnitten", async ({ page }) => {
  // Bis hierher ist die Person Patient, danach wird sie Entscheider. Der
  // Schnitt darf deshalb mehr Platz haben als eine gewoehnliche Fuge.
  await oeffne(page);
  const masse = await page.evaluate(() => {
    const rolle = document.querySelector("#lb-rolle")!;
    const szene = document.querySelector(".lb-szene")!;
    const teil = document.querySelector(".lb-teil:not(.ls-verstecken)")!;
    return {
      schnitt: parseFloat(getComputedStyle(rolle).rowGap) + parseFloat(getComputedStyle(szene).paddingTop),
      fuge: parseFloat(getComputedStyle(rolle).rowGap) + parseFloat(getComputedStyle(teil).paddingTop)
    };
  });
  expect(masse.schnitt).toBeGreaterThan(masse.fuge + 8);
});

test("der Bestellschirm sagt, dass es der letzte Schritt ist - und was er kostet", async ({ page }) => {
  // Goal Gradient: Wer sieht, dass er fast fertig ist, bricht seltener ab.
  // Und der Preis steht auf dem letzten Knopf - unmittelbar vor der
  // endgueltigen Handlung darf es keine Ueberraschung geben.
  await oeffne(page);
  await page.locator("#lb-produkte").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.click("#lb-kaufen");
  await page.waitForTimeout(400);

  await expect(page.locator("#lb-bschritt")).not.toBeEmpty();
  await expect(page.locator("#lb-besttitel")).not.toBeEmpty();
  await expect(page.locator("#lb-bsenden")).toHaveText(/53/);
  const unter = (await page.locator("#lb-bunter").textContent())!.toLowerCase();
  expect(unter, "Unter dem letzten Knopf steht nicht, dass erst bei Lieferung gezahlt wird")
    .toContain("merrni");

  // Der Name ist schon da - ein Feld weniger zum Abbrechen.
  await expect(page.locator("#lb-bname")).toHaveValue(/Arlinda/);
});

// Eine hohe Flasche: 20 breit, 60 hoch, mit roten Kappen ganz oben und
// ganz unten. Genau die Form, bei der ein quadratisches Kaestchen oben
// und unten etwas abschneidet - und genau diese Kappen fehlen dann.
const HOHES_BILD = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAA8CAIAAADpFA0BAAAAPklEQVR42mO4a2xMNmIY1Uyi5l8/v8ORTl4yQYSsflTzqOZRzaOaRzWPah7VPKp5VPOo5lHN+DWPdlDoqBkAdPDHehLIkXUAAAAASUVORK5CYII=";

test("das Produktbild wird nicht beschnitten", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Mit "cover" fehlten bei einer hohen
  // Flasche genau Deckel und Boden - der Patient sah ein Stueck Etikett
  // und sollte daraus schliessen, was geliefert wird. Und nach dem
  // Umstellen auf "contain" war es immer noch beschnitten: Das Bild wurde
  // in seinem Gitterkasten 64x172 gross und der Ueberstand von
  // "overflow: hidden" weggeschnitten.
  await page.route("**/firestore.googleapis.com/**", (weg) => {
    const fertig = /\/products\//.test(weg.request().url())
      ? { fields: { ...PRODUKT.fields, photoRef: { stringValue: HOHES_BILD } } }
      : BERICHT;
    return weg.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fertig) });
  });
  await page.goto("/apps/lifeskin-bericht/index.html");
  await page.evaluate(async () => {
    const { Bericht } = await import("/apps/lifeskin-bericht/bericht.js");
    await new Bericht({ ort: { pathname: "/analiza/aabbccdd11223344", href: "https://mnyra.com/analiza/aabbccdd11223344" } }).starte();
  });
  await page.waitForTimeout(700);
  // Das Bild laedt erst, wenn es ins Bild kommt ("lazy") - also erst
  // hinscrollen, sonst misst der Test ein leeres Element.
  await page.locator("#lb-produkte").scrollIntoViewIfNeeded();
  // Und erst messen, wenn es wirklich geladen ist - sonst sind alle
  // natuerlichen Masse null und der Test prueft nichts.
  await page.waitForFunction(() => {
    const el = document.querySelector(".lb-produkt__bild img") as HTMLImageElement | null;
    return Boolean(el && el.complete && el.naturalWidth > 0);
  });

  const masse = await page.evaluate(() => {
    const img = document.querySelector(".lb-produkt__bild img") as HTMLImageElement;
    const kasten = img.parentElement!.getBoundingClientRect();
    const b = img.getBoundingClientRect();
    return { fit: getComputedStyle(img).objectFit,
             hoch: img.naturalHeight > img.naturalWidth,
             ueberstandH: Math.round(b.height - kasten.height),
             ueberstandB: Math.round(b.width - kasten.width) };
  });
  expect(masse.hoch, "Die Probe ist nicht hoch - dann prueft sie nichts").toBe(true);
  expect(masse.fit, "Das Bild wird wieder beschnitten").toBe("contain");
  expect(masse.ueberstandH, "Das Bild ist hoeher als sein Kasten - der Rest wird abgeschnitten").toBeLessThanOrEqual(0);
  expect(masse.ueberstandB, "Das Bild ist breiter als sein Kasten").toBeLessThanOrEqual(0);

  // Und im Korb beim Bestellen dasselbe Bild, ebenfalls ganz.
  await page.waitForTimeout(600);
  await page.click("#lb-kaufen");
  await page.waitForTimeout(400);
  const korb = await page.evaluate(() => {
    const img = document.querySelector(".lb-korb__bild img") as HTMLImageElement;
    if (!img) return null;
    const kasten = img.parentElement!.getBoundingClientRect();
    const b = img.getBoundingClientRect();
    return { fit: getComputedStyle(img).objectFit, ueberstand: Math.round(b.height - kasten.height) };
  });
  expect(korb, "Im Korb steht kein Bild").not.toBeNull();
  expect(korb!.fit).toBe("contain");
  expect(korb!.ueberstand).toBeLessThanOrEqual(0);
});

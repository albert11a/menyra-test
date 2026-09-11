// Die Hauptanalyse unter /analiza/<kennung>, im Browser nachgesehen.
//
// WOZU NOCH EINER: Die Quelltextpruefungen in
// tests/lifeskin-astra-live.test.mjs zeigen, dass jeder beschriebene Platz
// im Aufbau existiert. Sie zeigen NICHT, dass am Ende etwas darin steht.
// Genau dieser Unterschied hat die Vorlage schon einmal gekostet: Der
// Preis stand da und war unsichtbar.
//
// Hier laeuft die echte Seite mit erfundenen, aber echt geformten Daten -
// so, wie Heart sie schreibt - und es wird nachgesehen, was ein Patient
// wirklich liest.

import { expect, test, type Page } from "@playwright/test";

const BERICHT = {
  fields: {
    createdAt: { stringValue: "2026-09-05T18:14:00.000Z" },
    freigabeAt: { stringValue: "2026-09-06T08:20:00.000Z" },
    code: { stringValue: "LS-2026-0042" },
    name: { stringValue: "Arta" },
    sprache: { stringValue: "sq" },
    status: { stringValue: "fertig" },
    photos: { integerValue: "3" },
    preis: { integerValue: "53" },
    raport: {
      mapValue: {
        fields: {
          ekzaminimi: { stringValue: "Lëkura e fytyrës u vlerësua në ballë, hundë, faqe dhe mjekër." },
          parametratVleresuar: { integerValue: "10" },
          gjetjet: { stringValue: "Ndryshimi kryesor është bllokimi i lehtë i poreve, më i dukshëm në ballë." },
          gjetjaKryesore: { stringValue: "poret e bllokuara në ballë" },
          gjetjaDyta: { stringValue: "gjurmët e zbehta në faqe" },
          diagnoza: { stringValue: "Akne e lehtë me pore të bllokuara" },
          diagnozaLat: { stringValue: "Acne vulgaris, predominancë komedonale" },
          niveli: { integerValue: "1" },
          synimi28: { stringValue: "Të ndiqet nëse shfaqen më pak bllokime e puçrra të reja." },
          zonaLista: {
            arrayValue: {
              values: [
                { mapValue: { fields: { zona: { stringValue: "Balli" }, teksti: { stringValue: "Pore të bllokuara." } } } },
                { mapValue: { fields: { zona: { stringValue: "Faqet" }, teksti: { stringValue: "Njolla të zbehta." } } } },
              ],
            },
          },
          parametrat: {
            arrayValue: {
              values: [
                { mapValue: { fields: {
                  emri: { stringValue: "Poret dhe folikulet" },
                  thjeshte: { stringValue: "Pore të bllokuara" },
                  vlera: { stringValue: "më shumë në ballë" },
                  shkalla: { integerValue: "2" },
                  grada: { stringValue: "e mesme" },
                } } },
                { mapValue: { fields: {
                  emri: { stringValue: "Njollat pas inflamacionit" },
                  thjeshte: { stringValue: "Gjurmë të mbetura" },
                  vlera: { stringValue: "të lehta në faqe" },
                  shkalla: { integerValue: "1" },
                  grada: { stringValue: "e lehtë" },
                } } },
                { mapValue: { fields: {
                  emri: { stringValue: "Pigmentimi" },
                  thjeshte: { stringValue: "Ngjyra e lëkurës" },
                  vlera: { stringValue: "e njëtrajtshme" },
                  shkalla: { integerValue: "0" },
                  grada: { stringValue: "pa gjetje" },
                } } },
              ],
            },
          },
          shpjegimi: {
            arrayValue: { values: [{ stringValue: "Poret mbushen më lehtë me yndyrë dhe qeliza të vdekura." }] },
          },
          paKujdes: {
            mapValue: { fields: {
              zbehet: { stringValue: "Skuqja e lehtë mund të zbehet gradualisht." },
              nukZbehet: { stringValue: "Poret që vazhdojnë të bllokohen e mbajnë sipërfaqen të pabarabartë." },
              pas6Muajsh: { stringValue: "" },
            } },
          },
        },
      },
    },
    produkte: {
      arrayValue: {
        values: [
          { mapValue: { fields: {
            id: { stringValue: "lf-acne" },
            satz: { stringValue: "Te ju, poret e bllokuara në ballë janë gjetja më e fortë." },
          } } },
          { mapValue: { fields: {
            id: { stringValue: "lf-barrier" },
            satz: { stringValue: "Kjo kremë mban shtresën mbrojtëse në rregull." },
          } } },
        ],
      },
    },
  },
};

const PRODUKTE: Record<string, unknown> = {
  "lf-acne": {
    fields: {
      name: { stringValue: "LF ACNE" },
      inhalt: { stringValue: "30 ml" },
      einzelpreis: { integerValue: "33" },
      lloji: { stringValue: "gel" },
      nenName: { mapValue: { fields: { sq: { stringValue: "Gel për lëkurë me akne" } } } },
      veprimi: { mapValue: { fields: { sq: { arrayValue: { values: [
        { stringValue: "Hap folikulin e bllokuar" },
      ] } } } } },
      perdorimi: { mapValue: { fields: {
        hapi: { integerValue: "1" },
        koha: { mapValue: { fields: { sq: { stringValue: "vetëm në mbrëmje" } } } },
        sasia: { mapValue: { fields: { sq: { stringValue: "sa një bizele" } } } },
        si: { mapValue: { fields: { sq: { stringValue: "Pas larjes, në lëkurë të thatë." } } } },
        kujdes: { mapValue: { fields: { sq: { stringValue: "Mos e përdorni me retinol." } } } },
      } } },
    },
  },
  "lf-barrier": {
    fields: {
      name: { stringValue: "LF BARRIER" },
      inhalt: { stringValue: "50 ml" },
      einzelpreis: { integerValue: "29" },
      lloji: { stringValue: "krem" },
      perdorimi: { mapValue: { fields: {
        hapi: { integerValue: "2" },
        koha: { mapValue: { fields: { sq: { stringValue: "mëngjes dhe mbrëmje" } } } },
        sasia: { mapValue: { fields: { sq: { stringValue: "" } } } },
        si: { mapValue: { fields: { sq: { stringValue: "Pas gelit." } } } },
        kujdes: { mapValue: { fields: { sq: { stringValue: "" } } } },
      } } },
    },
  },
};

// Was die Seite hinausschreiben wollte. Der Test liest es mit, statt es
// hinauszulassen: Ein e2e-Lauf, der echte Dokumente aendert, ist kein Test.
type Schreibvorgang = { adresse: string; koerper: string };

async function oeffne(page: Page, zustand = "fertig") {
  const geschrieben: Schreibvorgang[] = [];
  await page.exposeFunction("merkeSchreibvorgang", (adresse: string, koerper: string) => {
    geschrieben.push({ adresse, koerper });
  });

  await page.route("**/firestore.googleapis.com/**", async (weg) => {
    const url = weg.request().url();
    if (weg.request().method() !== "GET") {
      await page.evaluate(
        ([a, k]) => (globalThis as any).merkeSchreibvorgang(a, k),
        [url, weg.request().postData() || ""] as [string, string],
      );
      return weg.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    }
    const produkt = url.match(/\/products\/([^?/]+)/);
    if (produkt) {
      const treffer = PRODUKTE[decodeURIComponent(produkt[1])] || { fields: {} };
      return weg.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(treffer) });
    }
    const bericht = JSON.parse(JSON.stringify(BERICHT));
    bericht.fields.status = { stringValue: zustand };
    return weg.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(bericht) });
  });

  await page.goto("/apps/lifeskin-astra/index.html");
  await page.evaluate(async () => {
    const { Analiza } = await import("/apps/lifeskin-astra/astra.js");
    await new Analiza({
      ort: {
        pathname: "/analiza/aabbccdd11223344",
        href: "https://mnyra.com/analiza/aabbccdd11223344",
        hash: "",
      },
    }).starte();
  });
  await page.waitForTimeout(400);
  return geschrieben;
}

test.use({ viewport: { width: 390, height: 844 } });

test("der Befund des Patienten steht wirklich auf der Seite", async ({ page }) => {
  await oeffne(page);

  await expect(page.locator("#an-fertig")).toBeVisible();
  await expect(page.locator("#an-laedt")).toBeHidden();

  // Der Kopf: Anrede, Fallnummer, Urheberin mit Datum.
  await expect(page.locator("#an-titel")).toHaveText(/Arta/);
  await expect(page.locator("#an-kodi")).toHaveText(/LS-2026-0042/);
  await expect(page.locator("#an-arztname")).toHaveText("Dr. Violeta Gashi");
  await expect(page.locator("#an-arztrolle")).toHaveText(/Dermatologe/);

  // Das Ergebnis - Hauptbefund gross geschrieben, Diagnose und Schweregrad.
  await expect(page.locator("#an-gjetjakryesore")).toHaveText("Poret e bllokuara në ballë");
  await expect(page.locator("#an-permbledhjatext")).toHaveText(/bllokimi i lehtë i poreve/);
  await expect(page.locator("#an-diagnozaemri")).toHaveText("Akne e lehtë me pore të bllokuara");
  await expect(page.locator("#an-diagnozalat")).toHaveText(/Acne vulgaris/);
  await expect(page.locator("#an-diagnozagrada")).toHaveText("e lehtë");

  // Die Beobachtungen: nur die mit einer Gefunden-Stufe, staerkste zuerst.
  const gjetjet = page.locator("#an-gjetjet .finding-row");
  await expect(gjetjet).toHaveCount(2);
  await expect(gjetjet.first()).toContainText("Pore të bllokuara");
  await expect(gjetjet.first()).toContainText("më shumë në ballë");
  await expect(page.locator("#an-gjetjet")).not.toContainText("Ngjyra e lëkurës");
});

test("die Mittel tragen den persoenlichen Satz und ihre Anwendung", async ({ page }) => {
  await oeffne(page);

  const produkte = page.locator("#an-produkte .product");
  await expect(produkte).toHaveCount(2);
  await expect(produkte.first()).toContainText("LF ACNE");
  await expect(produkte.first()).toContainText("30 ml");
  await expect(produkte.first()).toContainText("GEL PËR LËKURË ME AKNE");
  // Der eine Satz, der nur fuer diesen Fall geschrieben wurde.
  await expect(produkte.first()).toContainText("Te ju, poret e bllokuara në ballë janë gjetja më e fortë.");

  await produkte.first().locator("summary").click();
  await expect(produkte.first()).toContainText("Hap folikulin e bllokuar");
  await expect(produkte.first()).toContainText("Pas larjes, në lëkurë të thatë.");
  await expect(produkte.first()).toContainText("Mos e përdorni me retinol.");

  // Die Routine wird aus den hinterlegten Zeiten gelesen, nicht geraten.
  await expect(page.locator("#an-rutinamengjes")).toHaveText("LF BARRIER");
  await expect(page.locator("#an-rutinambremje")).toHaveText("LF ACNE → LF BARRIER");
});

test("das Angebot nennt Preis, Umfang und Bedingungen an einer Stelle", async ({ page }) => {
  await oeffne(page);

  await expect(page.locator("#paketa")).toBeVisible();
  await expect(page.locator("#an-setinumri")).toHaveText("2 produkte");
  await expect(page.locator("#an-setitems li")).toHaveCount(2);
  await expect(page.locator("#paketa .price")).toHaveText("53 €");
  await expect(page.locator("#paketa [data-delivery]")).toHaveText("2–3 ditë");
  await expect(page.locator("#an-garanciatitel")).toHaveText(/45 ditë/);
  // Der Preis steht auch da, wo er sonst still verschwunden ist.
  for (const preis of await page.locator("#paketa [data-price]").all()) {
    await expect(preis).toHaveText("53 €");
  }
});

test("die vollstaendige Analyse enthaelt alles, was der Befund hergibt", async ({ page }) => {
  await oeffne(page);

  await expect(page.locator("#an-zonat > div")).toHaveCount(2);
  await expect(page.locator("#an-zonat")).toContainText("Balli");
  // ALLE Parameter, auch die ohne Befund: Zehn angesehen und acht in
  // Ordnung ist eine andere Aussage als eine Mangelliste.
  await expect(page.locator("#an-parametrat > div")).toHaveCount(3);
  await expect(page.locator("#an-parametrat")).toContainText("Pigmentimi");
  await expect(page.locator("#an-kuptimi")).toContainText("Poret mbushen më lehtë");
  await expect(page.locator("#an-ekzaminimi")).toContainText("ballë, hundë, faqe dhe mjekër");
  await expect(page.locator("#an-pakujdes")).toContainText("Skuqja e lehtë mund të zbehet");
  // Der leere dritte Absatz wird nicht als leere Zeile gezeichnet.
  await expect(page.locator("#an-pakujdes .detail-block")).toHaveCount(2);

  // Die Grenze der Methode - immer da, wortgleich.
  await expect(page.locator("#an-kufijtetext")).toContainText("nuk zëvendëson një ekzaminim te mjeku");
});

test("eine Bestellung schreibt die Anschrift in die Sitzung und den Zustand in den Bericht", async ({ page }) => {
  const geschrieben = await oeffne(page);

  await page.locator("#paketa [data-order]").click();
  await expect(page.locator("#an-porosia")).toBeVisible();
  // Den Namen kennen wir schon.
  await expect(page.locator("#an-emri")).toHaveValue("Arta");

  await page.locator("#an-telefon").fill("+38344111222");
  await page.locator("#an-adresa").fill("Rruga B 12");
  await page.locator("#an-qyteti").fill("Prishtinë");
  await page.locator("#an-senden").click();

  await expect(page.locator("#an-danke")).toBeVisible();
  await expect(page.locator("#an-danketitel")).toHaveText(/regjistruar|eingegangen/);

  // Die LETZTE Sitzungsschreibung: die erste ist das Oeffnen der Seite,
  // die hier nichts beweist.
  const sitzung = geschrieben.filter((w) => w.adresse.includes("/sessions/")).at(-1);
  const bericht = geschrieben.find((w) => w.adresse.includes("/reports/"));
  expect(sitzung, "Die Anschrift wurde nicht in die Sitzung geschrieben").toBeTruthy();
  expect(bericht, "Der Zustand wurde nicht in den Bericht geschrieben").toBeTruthy();
  expect(sitzung!.koerper).toContain("Rruga B 12");
  expect(bericht!.koerper).toContain("bestellt");
  // Die Anschrift darf den oeffentlich lesbaren Bericht nie beruehren.
  expect(bericht!.koerper).not.toContain("Rruga B 12");
  expect(bericht!.koerper).not.toContain("38344111222");
});

test("ein unvollstaendiges Formular meldet den Fehler, statt still nichts zu tun", async ({ page }) => {
  await oeffne(page);
  await page.locator("#paketa [data-order]").click();
  await page.locator("#an-telefon").fill("");
  await page.locator("#an-senden").click();
  await expect(page.locator("#an-fehler")).toBeVisible();
  await expect(page.locator("#an-danke")).toBeHidden();
});

test("wartet der Fall noch, steht der Wartebildschirm und kein Befund", async ({ page }) => {
  await oeffne(page, "wartet");
  await expect(page.locator("#an-prit")).toBeVisible();
  await expect(page.locator("#an-fertig")).toBeHidden();
  await expect(page.locator("#an-prittitel")).toHaveText(/Arta/);
  await expect(page.locator("#an-pritnumri")).toHaveText("LS-2026-0042");
  // Ein laufender Schritt, kein Platz in einer erfundenen Warteschlange.
  await expect(page.locator('#an-prithapat li[data-stand="laeuft"]')).toHaveCount(1);
  await expect(page.locator("#an-prit")).not.toContainText("53");
});

test("ohne Kennung im Pfad steht 'nicht gefunden', keine halbe Analyse", async ({ page }) => {
  await page.goto("/apps/lifeskin-astra/index.html");
  await page.waitForTimeout(300);
  await expect(page.locator("#an-weg")).toBeVisible();
  await expect(page.locator("#an-fertig")).toBeHidden();
  await expect(page.locator("#an-wegtitel")).toHaveText(/nuk u gjet|nicht gefunden/);
});

test("die Zeichen stehen wirklich da - kein leerer Platzhalter", async ({ page }) => {
  await oeffne(page);
  // Sie sind inline und haengen an keinem geladenen Script. Ein leerer
  // Rahmen neben "45 ditë garanci" sieht nicht nach Zeichen aus, sondern
  // nach Panne - und eine Panne neben einer Zusage kostet die Zusage.
  const leer = await page.evaluate(() =>
    [...document.querySelectorAll("[data-ikona]")]
      .filter((el) => !el.querySelector("svg"))
      .map((el) => (el as HTMLElement).dataset.ikona));
  expect(leer, "diese Platzhalter sind leer geblieben").toEqual([]);
  expect(await page.locator("svg.ikona").count()).toBeGreaterThan(20);
  // Und sie tragen die Farbe ihrer Zeile, nicht eine eigene.
  const strich = await page.evaluate(() =>
    getComputedStyle(document.querySelector("#paketa .primary-button svg")!).stroke);
  const schrift = await page.evaluate(() =>
    getComputedStyle(document.querySelector("#paketa .primary-button")!).color);
  expect(strich).toBe(schrift);
});

test("kein Zeichen faellt auf null oder zwei Pixel zusammen", async ({ page }) => {
  // GEMESSEN, NICHT GELESEN. Ein Zeichen, das der Stil auf zwei Pixel
  // zusammendrueckt, steht im Quelltext genauso da wie ein richtiges -
  // und ist auf der Seite trotzdem weg. Genau so ist das Plus im
  // aufgeklappten Produkt verschwunden: padding-left plus
  // box-sizing:border-box liessen von 1,15em zwei Pixel uebrig.
  await oeffne(page);
  const messen = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("svg.ikona")]
        .filter((el) => el.closest("[hidden]") === null && !el.closest("dialog:not([open])"))
        .map((el) => {
          const kasten = el.getBoundingClientRect();
          const name = (el.closest("[data-ikona]") as HTMLElement | null)?.dataset.ikona
            || el.parentElement?.textContent?.trim().slice(0, 24) || "?";
          return { name, breite: Math.round(kasten.width), hoehe: Math.round(kasten.height) };
        }));

  const sichtbar = await messen();
  expect(sichtbar.length).toBeGreaterThan(20);
  expect(sichtbar.filter((x) => x.breite < 10 || x.hoehe < 10)).toEqual([]);
  expect(sichtbar.filter((x) => x.breite > 34 || x.hoehe > 34)).toEqual([]);

  // Und dasselbe, wenn ein Aufklapper und ein Blatt offen sind.
  await page.locator("#an-produkte .product summary").first().click();
  await page.locator("#kufijte summary").click();
  await page.waitForTimeout(250);
  expect((await messen()).filter((x) => x.breite < 10 || x.hoehe < 10)).toEqual([]);

  await page.locator("#paketa [data-order]").click();
  await page.waitForTimeout(300);
  expect((await messen()).filter((x) => x.breite < 10 || x.hoehe < 10)).toEqual([]);
});

test("der Briefkopf sitzt in der Ecke, geht durch und ist schmal", async ({ page }) => {
  // #171c1f ist aus der Leiste des Instagram-Browsers ausgemessen. Damit
  // die Seite die Leiste fortsetzt statt darunter anzufangen, muss das
  // Band die Ecke beruehren und ueber die volle Breite gehen - ein
  // Punkt Papier daneben ist genau die Kante, die es vermeiden soll.
  await oeffne(page);
  for (const breite of [360, 390, 430, 768]) {
    await page.setViewportSize({ width: breite, height: 844 });
    await page.waitForTimeout(120);
    const kopf = await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>(".masthead")!;
      const kasten = el.getBoundingClientRect();
      return {
        hoehe: Math.round(kasten.height),
        oben: Math.round(kasten.top),
        links: Math.round(kasten.left),
        breite: Math.round(kasten.width),
        fenster: window.innerWidth,
        grund: getComputedStyle(el).backgroundColor,
        marke: getComputedStyle(document.querySelector(".masthead .wordmark")!).color
      };
    });
    expect(kopf.grund, `bei ${breite}px stimmt die Farbe nicht`).toBe("rgb(23, 28, 31)");
    expect(kopf.oben, `bei ${breite}px sitzt er nicht oben`).toBe(0);
    expect(kopf.links, `bei ${breite}px steht Papier links daneben`).toBe(0);
    expect(kopf.breite, `bei ${breite}px geht er nicht durch`).toBe(kopf.fenster);
    expect(kopf.hoehe, `bei ${breite}px ist er ${kopf.hoehe}px hoch`).toBeLessThanOrEqual(66);
    // Und die Marke bleibt darauf lesbar.
    expect(kopf.marke).toBe("rgb(248, 247, 243)");
  }
  await page.setViewportSize({ width: 390, height: 844 });
});

test("Seite, Kaufleiste und Browserleiste tragen dieselbe Farbe", async ({ page }) => {
  await oeffne(page);
  await page.evaluate(async () => {
    const { grundSetzen, farbeAusStil } = await import("/apps/lifeskin-astra/astra.js");
    grundSetzen(farbeAusStil("--paper", "#f8f7f3"));
  });
  const grund = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
  const leiste = await page.evaluate(() => getComputedStyle(document.querySelector("#an-leiste")!).backgroundColor);
  expect(leiste, "unten steht sonst eine Naht zwischen Leiste und Seite").toBe(grund);
  // Nur eine Quelle: Traegt auch body eine Flaeche, liest der Browser die
  // falsche und faerbt seine Leiste daneben.
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  expect(await page.evaluate(() => document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')!.content))
    .toBe(grund === "rgb(248, 247, 243)" ? "#f8f7f3" : grund);
});

test("die Abschnitte kommen beim Herunterkommen, der erste steht sofort", async ({ page }) => {
  await oeffne(page);
  // Was beim Oeffnen im Bild steht, wird nie versteckt.
  expect(await page.locator("#rezultati").getAttribute("data-zeig")).toBeNull();
  expect(await page.evaluate(() =>
    Number(getComputedStyle(document.querySelector("#an-titel")!).opacity))).toBe(1);
  // Darunter wartet etwas.
  expect(await page.locator('[data-zeig="warte"]').count()).toBeGreaterThan(0);
  // Und im Aufklapper wartet nichts - zugeklappt kaeme es nie ins Bild.
  expect(await page.evaluate(() =>
    [...document.querySelectorAll("details [data-zeig], details [data-zeile], details [data-nach]")]
      .filter((el) => el.closest("details") !== el).length)).toBe(0);

  await page.locator("#paketa").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  expect(await page.locator("#paketa").getAttribute("data-zeig")).toBe("da");
  expect(await page.evaluate(() =>
    Number(getComputedStyle(document.querySelector("#paketa")!).opacity))).toBe(1);

  // Ganz nach unten: nichts darf blass im Bild zurueckbleiben.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(900);
  expect(await page.evaluate(() =>
    [...document.querySelectorAll('[data-zeig="warte"], [data-zeile="warte"]')]
      .filter((el) => el.getBoundingClientRect().top < window.innerHeight).length)).toBe(0);
});

test("die Bewegung laeuft vor den Augen ab, nicht unter dem Bildrand", async ({ page }) => {
  // DER PUNKT DER GANZEN SACHE. Vorher lag die Ausloeseschwelle knapp
  // UNTER dem Bildrand: Ein Abschnitt blendete ein, waehrend er noch gar
  // nicht zu sehen war, und stand beim Hochkommen einfach da. Die
  // Animation lief korrekt und niemand hat sie je gesehen.
  //
  // Geprueft wird deshalb nicht, DASS es eine Bewegung gibt, sondern dass
  // man sie im sichtbaren Bereich antrifft: halb durchsichtige Knoten,
  // waehrend langsam gescrollt wird.
  await oeffne(page);
  expect(await page.locator('[data-zeig="warte"], [data-zeile="warte"], [data-nach]').count())
    .toBeGreaterThanOrEqual(40);

  let halbfertig = 0;
  for (let i = 0; i < 40; i++) {
    await page.evaluate(() => window.scrollBy(0, 170));
    await page.waitForTimeout(55);
    halbfertig += await page.evaluate(() =>
      [...document.querySelectorAll("[data-zeig], [data-zeile], [data-nach]")].filter((el) => {
        const kasten = el.getBoundingClientRect();
        if (kasten.bottom <= 0 || kasten.top >= window.innerHeight) return false;
        const deckung = Number(getComputedStyle(el).opacity);
        return deckung > 0.02 && deckung < 0.98;
      }).length);
  }
  expect(halbfertig, "die Bewegung war nie im sichtbaren Bereich zu sehen").toBeGreaterThan(20);

  // Und danach steht alles. Eine Bewegung, die eine Aussage verschluckt,
  // waere der schlimmste Fehler dieser Seite.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() =>
    [...document.querySelectorAll("[data-zeig], [data-zeile], [data-nach]")].filter((el) => {
      const kasten = el.getBoundingClientRect();
      if (kasten.bottom <= 0 || kasten.top >= window.innerHeight) return false;
      return Number(getComputedStyle(el).opacity) < 0.99;
    }).length)).toBe(0);
});

test("die Seite waechst waehrend des Scrollens nicht - sonst springt sie unten", async ({ page }) => {
  // GEMESSEN, NICHT GELESEN, und im Stil war nichts davon zu sehen:
  //
  // Eine Verschiebung nach unten aendert das Layout nicht, aber sie
  // ERZEUGT UEBERLAUF - und Ueberlauf verlaengert den Rollbereich. Der
  // Fuss ist das letzte Element der Seite; wartend um 44 Punkte nach
  // unten geschoben, war die Seite 44 Punkte laenger. Beim Einblenden
  // schrumpfte sie wieder, der Browser rueckte die Rollposition zurecht -
  // und wer gerade ganz unten stand, dem sprang die ganze Seite weg.
  await oeffne(page);

  await page.evaluate(() => {
    (window as any).__hoehen = [];
    (window as any).__lauf = true;
    const takt = () => {
      if (!(window as any).__lauf) return;
      (window as any).__hoehen.push(document.documentElement.scrollHeight);
      requestAnimationFrame(takt);
    };
    requestAnimationFrame(takt);
  });

  // Echtes Scrollen mit dem Rad, nicht window.scrollTo.
  for (let i = 0; i < 26; i++) {
    await page.mouse.wheel(0, 260);
    await page.waitForTimeout(45);
  }
  await page.waitForTimeout(900);
  for (let i = 0; i < 10; i++) await page.mouse.wheel(0, 1400);
  await page.waitForTimeout(1400);

  const hoehen: number[] = await page.evaluate(() => {
    (window as any).__lauf = false;
    return (window as any).__hoehen;
  });
  expect(Math.max(...hoehen) - Math.min(...hoehen),
    "die Seitenhoehe hat sich waehrend des Scrollens geaendert").toBe(0);

  // Und ganz unten darf sich die Rollposition nicht von selbst bewegen.
  await page.waitForTimeout(600);
  const ruhe: number[] = await page.evaluate(async () => {
    const punkte: number[] = [];
    for (let i = 0; i < 60; i++) {
      await new Promise((f) => requestAnimationFrame(f));
      punkte.push(Math.round(window.scrollY));
    }
    return punkte;
  });
  expect(Math.max(...ruhe) - Math.min(...ruhe),
    "der Bildschirm bewegt sich ganz unten von selbst").toBe(0);
});

test("die Kaufleiste kommt beim harten Wisch sofort mit", async ({ page }) => {
  // Zwei getrennte Zahlen, weil zwei verschiedene Dinge langsam sein
  // koennen: die Entscheidung (wird ueberhaupt gemerkt, dass das Angebot
  // vorbei ist?) und die Fahrt (wie lange braucht sie danach?). Langsam
  // war die Fahrt.
  await oeffne(page);
  const takt = await page.evaluate(async () => {
    const leiste = document.querySelector<HTMLElement>("#an-leiste")!;
    const ziel = document.querySelector<HTMLElement>("#paketa")!.offsetTop + 1600;
    const start = performance.now();
    window.scrollTo({ top: ziel, behavior: "instant" as ScrollBehavior });
    let merkmal = -1;
    for (let i = 0; i < 120; i++) {
      if (merkmal < 0 && leiste.dataset.stufe === "an") merkmal = Math.round(performance.now() - start);
      const kasten = leiste.getBoundingClientRect();
      if (kasten.top < window.innerHeight - 2 && Number(getComputedStyle(leiste).opacity) > 0.98) {
        return { merkmal, fertig: Math.round(performance.now() - start) };
      }
      await new Promise((f) => requestAnimationFrame(f));
    }
    return { merkmal, fertig: -1 };
  });
  expect(takt.merkmal, "die Entscheidung faellt nicht sofort").toBeGreaterThanOrEqual(0);
  expect(takt.merkmal).toBeLessThanOrEqual(40);
  expect(takt.fertig, "die Leiste ist gar nicht angekommen").toBeGreaterThan(0);
  expect(takt.fertig, "die Leiste faehrt zu lange - beim Wischen ist man laengst weiter")
    .toBeLessThanOrEqual(220);
});

test("kein Versteck liegt in einem anderen", async ({ page }) => {
  // Zwei geschachtelte Verstecke koennen einander ueberdauern - dann
  // steht der Angebotskasten da und der Preis darin fehlt. Genau dieser
  // Fehler ist der frueheren Fassung einmal passiert.
  await oeffne(page);
  const geschachtelt = await page.evaluate(() =>
    [...document.querySelectorAll("[data-nach], [data-zeile]")]
      .filter((el) => el.querySelector("[data-nach], [data-zeile]"))
      .map((el) => el.className || el.tagName));
  expect(geschachtelt, "diese Knoten verstecken einen anderen Versteckten").toEqual([]);
  // Und keiner traegt beide Merkmale.
  expect(await page.locator("[data-nach][data-zeile]").count()).toBe(0);
});

test("die Kaufleiste faehrt hinter dem Angebot ein und oben wieder aus", async ({ page }) => {
  await oeffne(page);
  expect(await page.locator("#an-leiste").getAttribute("data-stufe")).toBe("aus");
  await page.locator("#paketa [data-order]").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  // Solange der Knopf im Angebot sichtbar ist, bleibt sie aus: zwei
  // Kaufknoepfe nebeneinander sind einer zu viel.
  expect(await page.locator("#an-leiste").getAttribute("data-stufe")).toBe("aus");
  await page.evaluate(() => window.scrollBy(0, 1200));
  await page.waitForTimeout(600);
  expect(await page.locator("#an-leiste").getAttribute("data-stufe")).toBe("an");
  // Und zurueck nach oben verschwindet sie wieder - davor gibt es sie nicht.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  expect(await page.locator("#an-leiste").getAttribute("data-stufe")).toBe("aus");
  expect(await page.evaluate(() =>
    getComputedStyle(document.querySelector("#an-leiste")!).pointerEvents)).toBe("none");
});

test.describe("mit abgeschalteter Bewegung", () => {
  test.use({ reducedMotion: "reduce" });

  test("wird gar nichts erst versteckt", async ({ page }) => {
    await oeffne(page);
    expect(await page.locator('[data-zeig="warte"]').count()).toBe(0);
    expect(await page.locator('[data-zeile="warte"]').count()).toBe(0);
    await expect(page.locator("#paketa")).toBeVisible();
    await expect(page.locator("#an-parametrat")).toHaveCount(1);
  });
});

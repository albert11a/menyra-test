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

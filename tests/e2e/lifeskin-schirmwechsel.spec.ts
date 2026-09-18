// Der Wechsel zwischen den Bildschirmen des Trichters, im Browser
// nachgesehen.
//
// WOZU: Die Quelltextpruefung in tests/lifeskin-schirmzaehlung.test.mjs
// zeigt, dass die Regel dasteht. Sie zeigt NICHT, dass die Animation bei
// jedem Wechsel wirklich neu anlaeuft - und genau davon haengt ab, ob der
// Uebergang ein Uebergang ist oder ein Sprung.
//
// Sie haengt an [data-aktiv="ja"] und nicht an einer Klasse, die
// JavaScript setzt: Ein Element, das aus display:none zurueckkommt,
// startet seine Animation von selbst neu. Hier wird nachgesehen, dass das
// auf jedem der fuenf Bildschirme passiert - und dass danach nichts
// zurueckbleibt, kein halb durchsichtiger Bildschirm und kein Rest-Versatz.

import { expect, test } from "@playwright/test";
test.use({ viewport: { width: 390, height: 844 } });
test("jeder Wechsel laeuft an", async ({ page }) => {
  await page.goto("/apps/lifeskin/index.html");
  await page.waitForTimeout(500);
  for (const schirm of ["vorbereitung", "kamera", "fragen", "analyse", "einstieg"]) {
    const lief = await page.evaluate((name) => {
      for (const s of Array.from(document.querySelectorAll<HTMLElement>(".ls-schirm"))) {
        s.dataset.aktiv = s.id === `ls-${name}` ? "ja" : "nein";
      }
      const el = document.querySelector<HTMLElement>(`#ls-${name}`)!;
      const st = getComputedStyle(el);
      return { name: st.animationName, dauer: st.animationDuration, anzeige: st.display };
    }, schirm);
    console.log(`${schirm}: animation=${lief.name} ${lief.dauer} display=${lief.anzeige}`);
    expect(lief.name, `${schirm} hat keine Animation`).toBe("ls-schirm-rein");
    expect(lief.anzeige).toBe("flex");
    await page.waitForTimeout(320);
    // Nach der Animation steht der Bildschirm ohne Rest-Transform da.
    const danach = await page.evaluate((name) => {
      const st = getComputedStyle(document.querySelector<HTMLElement>(`#ls-${name}`)!);
      return { deck: st.opacity, form: st.transform };
    }, schirm);
    expect(danach.deck, `${schirm} bleibt halb durchsichtig`).toBe("1");
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(danach.form);
  }
});

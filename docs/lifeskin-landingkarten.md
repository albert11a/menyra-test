Status: CURRENT
Last updated: 2026-10-04

# /lifeskin: Karte fuer Karte (Heart, Trichter-Chip "Landing")

Wunsch Inhaber (04.10.): auf der Landingpage `mnyra.com/lifeskin`
(`apps/lifeskin-landing/index.html`) messen, wie weit gescrollt wurde, und
in Heart im Trichter-Chip "Landing" zeigen - im Aufbau der Karte "Shop"
(Kreis mit Nummer, Name, Balken, Zahl), gezaehlt "bis hierher".

| Nr | Name | Element | Feld in `timings.lpKarten` |
|---|---|---|---|
| 1 | Analiza online | `.lf-entry-card` | `analiza` |
| 2 | 01 Terapi | `.lf-benefit--therapy` | `terapi` |
| 3 | 02 Analiza | `.lf-benefit--analysis` | `analizaDetaj` |
| 4 | 03 Skanim | `.lf-benefit--scan` | `skanim` |
| 5 | Para - Pas | `#rezultatet` | `paraPas` |
| 6 | Instagram | `.lf-community` | `instagram` |
| 7 | Tash e din | `.lf-warm-result` | `tashEDin` |
| 8 | F.A.Q | `.lf-faq` | `faq` |

- Liste: `shared/lifeskin-landingkarten.js` (Seite und Heart benutzen sie).
- Messung: `apps/lifeskin/lifeskin-landingkarten.js`, gestartet in
  `lifeskin-app.js` neben der alten Landing-Messung. Ein
  IntersectionObserver; gesehen = `schirmGesehen` (wie ueberall). Nur auf
  der Seite mit `.lf-entry-card` - /lifeskin2 und der Laden behalten ihre
  eigene Messung.
- Geschrieben ueber `Sitzung.landingKartenSchreiben` in die eigene Sitzung
  (`timings` ist in firestore.rules eine offene Karte, keine neue Regel).
- **Kein Pixel**: Es wird kein Meta-Ereignis gesendet oder geaendert.
- Heart zaehlt nur Besuche mit Messung (`baueLandingKarten`,
  `heart-lifeskin-weg.js`); /lifeskin2 zeigt im Chip "Landing" weiter die
  neun Bildschirme von `shared/lifeskin-landingtiefe.js`.

## Trichter-Karte (04.10.)

Die Chips (Main, Skanim, Foto, Trup/Pytje, Kauf, Gati, Bericht, Landing)
stehen jetzt IN der Karte unter dem Titel, seitenweise zum Wischen - wie
bei "Fälle".

## Fälle: Chips auf der falschen Seite (04.10.)

Heart zeichnet die Bereiche nebeneinander, jeder mit eigener Reihe
"Fälle". Die gemerkte Wischstelle hing nur an der Aktion
(`lifeskin-fach`), also bekam jede Reihe die Stelle einer anderen: "Offen"
gewaehlt, aber Seite 2 (Bestellt, Später, Archiv) im Bild. Jetzt hat jede
Reihe je Bereich ihre eigene Stelle, und eine seitenweise Reihe zeigt nach
einem Wechsel der Wahl oder einem neuen Knoten die Seite mit dem
gewaehlten Chip (`heart-render.js`, `restoreChipScroll`).

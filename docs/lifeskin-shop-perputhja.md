Status: CURRENT
Last updated: 2026-10-03

# LifeSkin Shop - die Kontrolle bis zur Përputhja (/lifeskinshop)

Auftrag (28.09., Albert/Inhaber): Der Weg hinter "Zbuloni nëse seti ju
përshtatet" soll aussehen wie der Laden davor. Die Wege selbst (Scan, Foto,
Trup/Pytje, Kamera) bleiben, wie sie sind - nur Oberflaeche und Fuehrung
werden neu. Es heisst nicht "Analyse". Waehrend der Fragen stehen kleine
Tipps zu Akne. Nach der Freigabe kommt der Kunde auf eine Seite wie der
Laden, oben mit der **Përputhja**: wie viel Prozent die Therapie zu seiner
Haut passt.

**DIE ZAHL SETZT DR. GASHI.** Sie traegt sie in Mnyra Heart beim Befund
ein. Keine Software errechnet oder schaetzt sie aus Daten des Kunden
(`shared/lifeskin-perputhja.js` prueft 1-100). Seit dem 03.10. gibt es am
Feld den Schalter **Auto / Manuell** (siehe Nachtrag 03.10.): Bei Auto
setzt Heart 95-99 vor.

## Ablauf fuer den Kunden

1. **Laden** `/lifeskinshop`, Abschnitt `#zgjedhja` ("Zgjedhje personale",
   Knopf "Zbuloni nëse seti ju përshtatet") - seit dem 28.09. abends wieder
   im alten Wortlaut (Wunsch Inhaber); der Ring mit "?%" ist entfernt.
2. **Wahl, Anleitung, Kamera/Foto, Fragen, Name, Nummer** - derselbe
   Trichter wie /lifeskin, im Kleid des Ladens (`shop-weg.css`) und mit
   eigenen Worten (`OBERFLAECHE_WEGE.lifeskinshop`,
   `FRAGEN_TEXTE_WEGE.lifeskinshop`). Seit dem 29.09. (Wunsch Inhaber): nur
   Scan und Foto (kein Weg Trup/Pytje) und DREI Fragen nach der Aufnahme -
   die vierte (gatishmeria, Bereitschaft) faellt im Laden weg
   (`fragenNachAufnahme("lifeskinshop")`, lifeskin-content.js). Prompt:
   Laden-Faelle haben diese Antwort nicht (docs/lifeskin-prompt-v9*.txt);
   die Therapieseite zeigt den Satz am Kaufknopf nur mit Antwort.
   Tipp-Karten: Wahl ("A e dinit?"), Foto-Anleitung, Scan-Anleitung und je
   eine unter den drei Fragen nach der Aufnahme (`apps/lifeskin-shop/weg.js`).
3. **Warteseite** `/analiza/<id>?weg=lifeskinshop`: Farben des Ladens
   (`astra-shop.css`), Texte `TEXTE_WEGE.lifeskinshop` ("Dr. Gashi po
   vlerëson sa ju përshtatet terapia", "Numri i rastit", "Përqindja juaj").
4. **Dr. Gashi in Heart**: Befund wie immer, dazu das Feld
   **"Përputhja % · Lifeskin Shop"** (nur bei Faellen dieses Wegs).
   Freigeben und "Bereit" gehen erst mit einer Zahl von 1 bis 100; die
   Vorschau auch ohne.
5. **WhatsApp** aus Heart: "... e shikova vetë lëkurën tuaj: terapia
   LifeSkin ju përshtatet 92%." (Vorab-, Freigabe- und Nachfass-Nachricht).
6. **Therapieseite** `/terapia/<id>` im Kleid des Ladens
   (`terapia-shop.css`): oben der Ring mit ihrer Zahl (fuellt sich einmal
   von 0 bis zur Zahl), Stufe in Worten, "Vlerësuar personalisht nga Dr.
   Violeta Gashi", darunter der Titel in ihren Worten. Kaufknopf "Filloj
   rutinën time — 39 €". Am Entscheidungsblock noch einmal die Zahl (ab 65 %).
   Unten **"Për dikë që e njihni"**: Teilen mit Satz und dem allgemeinen
   Link `/lifeskinshop?utm_source=ndaje&utm_campaign=perputhja` - nie der
   eigene Fall-Link (dort stehen Befund und Fotos).

| Zahl | Stufe | Titel |
|---|---|---|
| 85-100 | Përputhje shumë e lartë | "{Name}, kjo terapi i përshtatet shumë mirë lëkurës suaj." |
| 65-84 | Përputhje e mirë | "{Name}, kjo terapi i përshtatet mirë lëkurës suaj." |
| 1-64 | Përputhje e pjesshme | "{Name}, ja çfarë mund të bëjë kjo terapi për lëkurën tuaj." |

## Technik

- `shared/lifeskin-perputhja.js`: `perputhjaGueltig` (1-100, sonst null),
  `perputhjaStufe`. Keine Rechnung, keine Eingangsdaten.
- Heart: Feld `#lifeskin-perputhja` in `renderBefundEditor`
  (`heart-lifeskin-render.js`), gemerkt im Entwurf
  (`heart-lifeskin-entwurf.js`, `heart-events.js`), Stand im Kopf
  (`heart-lifeskin-befundstand.js`), Sperre in `gibLifeskinBerichtFrei`
  (`heart.js`), geschrieben von `gibBerichtFrei` als `reports/{id}.perputhja`
  (`heart-lifeskin-adapter.js`). Die Berichtsregel erlaubt dem CEO-Konto
  jedes Feld - **keine Regel-Aenderung, kein Regel-Deploy**.
- Trichter: `wegLesen` kennt jetzt auch `lifeskinshop`
  (`apps/lifeskin/lifeskin-app.js`) - vorher griffen die eigenen Worte des
  Ladens nie. `this.weg` steuert nur Texte.
- Warteseite und Therapieseite setzen `html[data-weg="lifeskinshop"]`
  (nur fuer diesen Weg, zuerst aus `?weg=`, dann aus dem Bericht). Alle
  Regeln der drei neuen Stilblaetter beginnen mit diesem Merkmal bzw. mit
  `html[data-ls-landing="lifeskinshop"]` (`tests/lifeskin-shop-weg.test.mjs`).
- Die vorbefuellte WhatsApp-Nachricht der Warteseite traegt die Fallnummer
  jetzt an der Stelle von `{code}` (vorher stand "Kodi im: {code} (LS-…)").

## Pixel (Meta)

**Unveraendert.** Keine Pixel-Zeile, kein Ereignis, kein Zeitpunkt wurde
geaendert; `tests/lifeskin-pixel-sperre.test.mjs` ist gruen ohne neue
Werte. Warteseite und Therapieseite zaehlen wie bisher (PageView,
AddToCart bei Sicht des Preises `#t-cmimi1`, InitiateCheckout, Purchase).
Das Teilen meldet nichts an Meta; der Klick steht nur im Klickpfad (Heart,
Abschnitt "Teilen"). Hinweis: Der Block mit der Zahl steht oben auf der
Therapieseite und schiebt den Preis um rund 190 px nach unten - der
Ausloeser (Preis zu einem Viertel im Bild) ist derselbe, im Code aendert
sich daran nichts.

## Pruefung

- `npm test`: alle gruen, neu `tests/lifeskin-shop-weg.test.mjs`,
  erweitert `tests/lifeskin-bericht-schreibweg.test.mjs`.
- Handy-Ansicht 390x844 (Headless-Chromium ueber das DevTools-Protokoll,
  stiller Modus, jede fremde Adresse gesperrt, Firestore-Antworten lokal
  gespielt): Laden-Abschnitt, Wahl, Foto- und Scan-Anleitung, Kamera, die
  vier Fragen (seit 29.09. drei) mit Tipps, Name, Nummer, Uebergabe, Warteseite,
  Therapieseite mit 92 % und 58 %, /lifeskin-Therapieseite unveraendert.
  Kein Playwright-Testlauf.
- Nicht geprueft: echtes iPhone/Instagram, Heart im Browser (Anmeldung),
  echte Freigabe in Firestore.

## Nachtrag 28.09. abends

- **Shop-Statistik auf 0**: `WEG_ZAEHLT_AB.lifeskinshop` in
  `shared/lifeskin-weg.js`. Heart zaehlt im Tab "Lifeskin Shop" (Kacheln,
  Trichter, Live) nur Besuche ab diesem Zeitpunkt und sagt oben, wie viele
  aeltere nicht mitgezaehlt sind (und wie viele davon eine Bestellung
  tragen). **Nichts geloescht**; die anderen Tabs unveraendert. Zurueck:
  Eintrag entfernen.
  Korrektur 28.09. spaet: Faelle, Bestellungen, Betreuung und Tests zeigen
  wieder alles aus dem Laden, auch von vor dem Zaehlbeginn. Vorher waren sie
  mit ausgeblendet - ein Fall von davor stand nirgends, auch wenn Dr. Gashi
  ihn noch beantworten musste.
- **Faelle nach Korb/Kasse** (28.09., 23:21, Testfall LS-2809-NBJ39): Wer im
  Laden erst das Set in den Korb legt und die Kasse oeffnet und DANACH die
  Kontrolle macht, trug `kasseGeoeffnet` schon vor dem Bericht. Heart legte
  den neuen Fall deshalb ins Fach "Kasse" statt "Offen" - Dr. Gashi sah ihn
  nicht. Jetzt steht ein Fall mit abgegebenem, noch nicht beantwortetem
  Bericht immer unter "Offen"; "Kasse" und "Bestellt" gelten erst nach der
  Antwort. Faelle ohne Bericht (alte Laden-Kaeufe auf /lifeskin) bleiben,
  wo sie waren. Betrifft auch den Laden auf /lifeskin.
- **Stille Links**: Wer im selben Tab einmal still bis zur Nummer ging,
  landete danach mit jedem stillen Link auf "Ky rast nuk u gjet" (im
  stillen Modus wird kein Bericht angelegt, der Trichter sprang trotzdem
  zum Fall). Im stillen Modus springt er nicht mehr; die Warteseite sagt
  im stillen Modus, warum es keinen Fall gibt.
- **Titelbild**: Der Rahmen hat von Anfang an 7:5 (vorher feste Hoehe,
  dann Sprung auf 7:5, sobald das Bild aus Heart kam). Das Bild aus Heart
  wird auf dem Geraet gemerkt (`localStorage` "lifeskin:shopHero") und
  steht beim naechsten Oeffnen sofort da; in Heart entfernt -> Standardbild.

## Nachtrag 03.10. - Schalter Auto / Manuell

Auftrag (Inhaber): "ein Schalter, Auto und nicht Auto - wenn Auto, dann
95-99 automatisch".

- Ueber dem Feld "Përputhja % · Lifeskin Shop" im Befund stehen zwei Chips
  **Auto** und **Manuell** (Form wie die Chips in "Faelle").
- **Manuell** (Standard, auch ohne Eintrag): wie bisher - Feld leer, Dr.
  Gashi traegt die Zahl ein.
- **Auto**: Ein leeres Feld steht schon auf 95-99 (`perputhjaAuto`). Die
  Zahl haengt nur an der Fallnummer - bei einem Fall immer dieselbe, auf
  jedem Geraet; kein Kundendatum fliesst ein. Sie bleibt aenderbar; ein
  Entwurf oder ein freigegebener Bericht geht vor. Freigeben geht wie
  bisher nur mit einer Zahl im Feld.
- Gespeichert fuer alle Geraete in `lifeskin/lifeskin/config/perputhja`
  (`{ modus: "auto" | "hand", gesetztAm }`). Die Config-Regel erlaubt dem
  CEO-Konto das Schreiben schon - **keine Regel-Aenderung, kein Deploy**.
- Kein Pixel, keine Seite des Kunden geaendert: Die Therapieseite zeigt wie
  bisher die Zahl aus dem Bericht.

## Rueckweg

`git revert` des Commits. Das Feld `perputhja` in alten Berichten stoert
nichts (die anderen Wege lesen es nicht).

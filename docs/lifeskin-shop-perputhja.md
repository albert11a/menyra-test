Status: CURRENT
Last updated: 2026-09-28

# LifeSkin Shop - die Kontrolle bis zur Përputhja (/lifeskinshop)

Auftrag (28.09., Albert/Inhaber): Der Weg hinter "Zbuloni nëse seti ju
përshtatet" soll aussehen wie der Laden davor. Die Wege selbst (Scan, Foto,
Trup/Pytje, Kamera) bleiben, wie sie sind - nur Oberflaeche und Fuehrung
werden neu. Es heisst nicht "Analyse". Waehrend der Fragen stehen kleine
Tipps zu Akne. Nach der Freigabe kommt der Kunde auf eine Seite wie der
Laden, oben mit der **Përputhja**: wie viel Prozent die Therapie zu seiner
Haut passt.

**DIE ZAHL SETZT DR. GASHI.** Sie traegt sie in Mnyra Heart beim Befund
ein. Keine Software errechnet, schaetzt oder schlaegt sie vor
(`shared/lifeskin-perputhja.js` prueft nur 1-100).

## Ablauf fuer den Kunden

1. **Laden** `/lifeskinshop`, Abschnitt "Kontrolli i përputhjes": "Sa ju
   përshtatet Acne Duo? Dr. Gashi jua thotë me përqindje." - ein Ring mit
   "?%" und drei Schritte (Foto/Scan · 4 Fragen · Prozentzahl per WhatsApp).
   Knopf `#ls-start` unveraendert ("Zbuloni nëse seti ju përshtatet").
2. **Wahl, Anleitung, Kamera/Foto, Fragen, Name, Nummer** - derselbe
   Trichter wie /lifeskin, im Kleid des Ladens (`shop-weg.css`) und mit
   eigenen Worten (`OBERFLAECHE_WEGE.lifeskinshop`,
   `FRAGEN_TEXTE_WEGE.lifeskinshop`, `gatishmeria.wege.lifeskinshop`).
   Tipp-Karten: Wahl ("A e dinit?"), Foto-Anleitung, Scan-Anleitung und je
   eine unter den vier Fragen nach der Aufnahme (`apps/lifeskin-shop/weg.js`).
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
  vier Fragen mit Tipps, Name, Nummer, Uebergabe, Warteseite,
  Therapieseite mit 92 % und 58 %, /lifeskin-Therapieseite unveraendert.
  Kein Playwright-Testlauf.
- Nicht geprueft: echtes iPhone/Instagram, Heart im Browser (Anmeldung),
  echte Freigabe in Firestore.

## Rueckweg

`git revert` des Commits. Das Feld `perputhja` in alten Berichten stoert
nichts (die anderen Wege lesen es nicht).

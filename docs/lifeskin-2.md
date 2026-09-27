Status: CURRENT
Last updated: 2026-09-27

# LifeSkin 2 - "Shiko nëse të përshtatet"

Auftrag (27.09.): Die Leute machen nur die kostenlose Analyse und kaufen
nicht. Neuer Weg: Intern bleibt die Analyse, dem Kunden wird sie als
Pruefung verkauft, ob die Therapie zu seiner Haut passt. Gekauft wird erst
nach dem "Po" von Dr. Gashi. Pixel und Kampagne bleiben (Kampagne
duplizieren, Bild tauschen, Link auf `/lifeskin2`). Heart bekommt einen
eigenen Tab "Lifeskin 2" und trackt den ganzen Weg.

Branch: `claude/landing-page-skin-products-axjjea`.

## 1. Recherche - was fuer die Conversion Pflicht ist

| Regel | Warum | Wo umgesetzt |
|---|---|---|
| **Message match**: Der Satz der Anzeige steht wortgleich oben | staerkster Einzelhebel fuer die Conversion der Landingpage; jede Abweichung liest sich wie ein Lockangebot | Ueberschrift "Terapi kundër akneve, e zgjedhur për lëkurën tuaj." |
| **Angebot, Preis, Garantie im ersten Bildschirm** | rund drei Viertel der Aufmerksamkeit liegt oben; keine Preisueberraschung nach der Pruefung | Chips "28 ditë nga 39 € · Paguani te dera · 45 ditë garanci" unter dem Knopf |
| **Ein Knopf, ein Wort** | jede zweite Wahl kostet Abschluesse | dreimal "Shiko nëse më përshtatet" (oben, unten, Leiste) |
| **"Falas" nicht als Hauptversprechen** | zieht Leute an, die nur etwas umsonst wollen | nur noch klein: "Kontrolli është falas · porositni vetëm nëse ju përshtatet" |
| **Ehrliches Nein moeglich** | ein Check, der immer "passt" sagt, ist keiner | FAQ + Schritt 02: "Nëse nuk ju përshtatet, jua themi sinqerisht" |
| **Ergebnisseite: Urteil + Set + Preis + Knopf oben, Begruendung darunter** | bei Quiz-/Empfehlungswegen passiert der Kauf auf der Ergebnisseite; Kaufknopf direkt dort und kurz, warum genau diese Produkte | Therapieseite: "✓ Po, lëkura juaj i përshtatet terapisë." + "Rezervo setin tim — 39 €" |
| **Schnelle Antwort (Speed to lead)** | Antwort in Minuten statt Stunden vervielfacht die Abschluesse; WhatsApp wird fast immer sofort gelesen | Heart zeigt Median der Antwortzeit und "x von y in unter 1 h", Warteseite nennt WhatsApp |
| **Warteseite: was passiert, wann, wie** | Wartezeit ohne Erwartung = Abbruch | "Dr. Gashi po kontrollon nëse terapia ju përshtatet" + "Përgjigja vjen në WhatsApp: …" |

Quellen: Message match / above the fold (webtonic.io/blog/message-match,
keepersdigital.com, dancingchicken.com), Quiz-Ergebnisseiten
(outgrow.co/blog/shopify-quiz-funnel-guide, redwoodmp.com Fallstudie),
Speed to lead (MIT/InsideSales-Studie, zusammengefasst bei chilipiper.com,
kixie.com).

## 2. Ablauf fuer den Kunden

1. **Anzeige** (Bild: Paket mit Karte "Zgjedhur nga Dr. Gashi") → `/lifeskin2`
2. **Landingpage**: Therapie, Preis, Tuer, Garantie oben → "Shiko nëse më përshtatet"
3. **Wie** (Foto ist als "Më e shpejta" markiert, Scan und Trup bleiben)
4. **Foto** → **4 Fragen**, Frage 4: "Nëse ju përshtatet, a doni ta filloni terapinë 4-javore?"
5. **Name/Alter**, **Nummer** ("Merrni përgjigjen në WhatsApp") → Pixel `Lead`
6. **Warteseite** `/analiza/<id>?weg=lifeskin2`: "Dr. Gashi po kontrollon nëse terapia ju përshtatet"
7. **Heart**: Fall im Tab "Lifeskin 2" → Befund wie immer → Freigeben
8. **WhatsApp** (Text aus Heart): "e kontrollova lëkurën tuaj: terapia LifeSkin ju përshtatet ✓" + Link
9. **Ergebnis** `/terapia/<id>`: "✓ Po, {name}, lëkura juaj i përshtatet terapisë." → Set → "Rezervo setin tim — 39 €"
10. **Bestellung**: Adresse, bezahlt an der Tuer

## 3. Technik

- **Weg-Merkmal** `shared/lifeskin-weg.js`: `LIFESKIN_WEGE = ["lifeskin2"]`,
  nur bekannte Namen gelten, sonst "" (bisheriger Weg).
- **Landingpage** `apps/lifeskin-2/index.html` (Kopie von
  `apps/lifeskin-landing/index.html`, nur Texte + `data-ls-weg="lifeskin2"`),
  `lifeskin-2.css` fuer die Preis-Chips. Route in `vercel.json`,
  `scripts/local-dev-server.mjs`, `sw.js`, Build-Liste.
- **Trichter** (`lifeskin-app.js`): `wegLesen()` lokal (Sandbox-Tests),
  `OBERFLAECHE_WEGE` und `frageFuerWeg()` in `lifeskin-content.js` -
  gleiche Antwort-Kennungen (`tani`, `pasi`, `analiza`).
- **Sitzung** (`lifeskin-session.js`): `source.weg` (source ist in den
  Regeln eine freie Karte) - **keine Regel-Aenderung, kein Regel-Deploy**.
  `berichtPfad` haengt `?weg=lifeskin2` an.
- **Warteseite** (`astra.js`): `weg` aus `?weg=` oder `bericht.weg`,
  `TEXTE_WEGE` in `astra-texte.js`. `?weg` geht beim Freigeben mit auf
  `/terapia/…`.
- **Heart**: `gibBerichtFrei(… weg)` schreibt `bericht.weg` (CEO-Schreibrecht).
  Menue "Lifeskin 2" = Lifeskin-Ansicht mit `state.lifeskin.weg = "lifeskin2"`
  (`#lifeskin2` in der Adresse). Kacheln, Trichter, Faelle, Bestellungen und
  Live rechnen nur mit den Faellen des gewaehlten Wegs; der alte Tab zeigt
  nur noch Faelle ohne Merkmal. Neu oben im Tab Lifeskin 2:
  "vom Klick bis zum Kauf" (`heart-lifeskin-weg.js`): Landing → Knopf → 4
  Fragen → Nummer (Lead) → abgegeben → Dr. Gashi hat geantwortet → Urteil
  geoeffnet → Kasse → bestellt, dazu Kauf je Lead und Antwortzeit (Median,
  unter 1 h, wartend). WhatsApp-Text beginnt bei LifeSkin 2 mit dem Urteil.
- **Therapieseite** (`terapia.js`): `mitUrteil` (Weg lifeskin2 und Produkte
  freigegeben) → `#t-urteil`, Titel "Seti që Dr. Gashi zgjodhi për ju",
  Knoepfe "Rezervo setin tim — …". Ohne Produkte kein "Po".
- **Pixel**: unveraendert, dieselben Ereignisse (Lead bei der Nummer).

## 4. Pruefung

- `npm test`: 2805 bestanden, 0 fehlgeschlagen. Neu:
  `tests/lifeskin-2.test.mjs` (11 Tests). Angepasst:
  `heart-schublade-tag-nacht` (vier statt drei Menueeintraege),
  `lifeskin-bericht-schreibweg` (neues Feld `weg`).
- `npm run build`: erfolgreich, keine getrackten Bundle-Dateien geaendert.
- `npm run arch:check`: keine Verstoesse.
- ESLint: keine Fehler (zwei alte Warnungen).
- Mobil: nur ein Screenshot in Chromium mit 390 px Breite (erster
  Bildschirm steht, Chips brechen sauber um). **Kein echtes Telefon, keine
  Instagram-App, kein Playwright-Lauf** (AGENTS.md) - auf der
  Vercel-Vorschau am Handy pruefen.

## 5. Grenzen / offen

- Faelle, deren Sitzung fehlt ("nur Bericht"), tragen kein Merkmal und
  stehen im alten Tab.
- Die Zahl "Dr. Gashi hat geantwortet" misst die Freigabe in Heart, nicht
  das Absenden auf WhatsApp. Antwortzeit = Bericht angelegt → letzte
  Freigabe.
- Anzeige mit 5 €/Tag: auf **Lead** optimieren (Kauf ist zu selten fuer
  Metas Lernphase), Kaeufe in Heart vergleichen: Kauf je Lead, alt gegen neu.

## 6. Rueckweg

`git revert` des Commits. Keine Regel-, Sammlungs-, Routen-Entfernungen;
`/lifeskin` unveraendert. Heart schreibt ein zusaetzliches Feld `weg` in
den Bericht.

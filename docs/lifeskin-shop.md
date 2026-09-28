Status: CURRENT
Last updated: 2026-09-28

# LifeSkin Shop - /lifeskinshop

Auftrag (28.09.): Der Shop wird komplett - eigene Kasse statt Weiterleitung
auf /lifeskin2, "Gjeni setin për lëkurën tuaj" mit Lead wie auf den anderen
Wegen (getrennt gezaehlt, gleiche Funktionen), Pixel fuer alles Relevante,
Sets/Einzelmittel/Vorher-Nachher aus Heart pflegbar, eigenes Dashboard in
Heart.

## Aktuelle Kampagne: nur Acne Duo (28.09., nachmittags)

Der Shop verkauft vorerst ausschliesslich das vollstaendige Set aus LF ACNE
und LF MOISTUR. Der markierte Auswahlblock wurde durch eine kompakte
Nutzen-/Wert-Erklaerung ersetzt: zwei aufklappbare Produktrollen, Inhalt und
Anwendungshinweis, 29 EUR Einzelpreis als Vergleich, 10 EUR Aufpreis fuer
das zweite Produkt im 39-EUR-Set und 19 EUR Gesamtersparnis. Keine neue
Wirkgarantie oder behauptete Conversion-Steigerung.

Heart bleibt fuer Hero-Bild und Set-Konfiguration zustaendig. Der Shop filtert
zusaetzlich auf genau diese zwei Produkt-IDs; andere Sets bleiben in Heart
bestehen. Einzelkauf ist hier nicht mehr sichtbar oder ausloesbar. Alte
Teil-/Fremdkoerbe werden geleert, vollstaendige Duo-Koerbe bleiben erhalten.
Entfernen eines Bestandteils entfernt das Set statt einen Einzelkauf zu erlauben.
Der doppelte grosse Produktblock und die Einzelprodukt-Karten entfallen.
Checkout, Analyse und Pixel-Aufrufzeilen bleiben unveraendert.

Pruefung: Shop-/Pixel-Sperrtests und npm run build; Bundle-Dateien unveraendert.
Kein echter mobiler In-App-Test und keine Produktionsbestellung.

Die folgende Ablaufbeschreibung dokumentiert auch den allgemeinen,
fuer spaetere Sortimentserweiterung erhaltenen Unterbau.

## Ablauf fuer den Kunden

1. **Laden** `/lifeskinshop`: Hero-Set, Vorher/Nachher (aus Heart, Ort
   "Shop"), Sets mit Filter nach Bedarf, Einzelmittel mit Fotos, FAQ.
2. **Direkt kaufen**: "Zgjidh këtë set" ersetzt den Korb durch das Set
   (eine Routine auf einmal), "29 € +" legt ein Einzelmittel dazu. Das
   Blatt von unten zeigt die Auswahl (ohne Felder) → "Vazhdo me porosinë".
3. **Kasse** = eigene Ansicht an der Stelle des Ladens (kein festes Fenster,
   keine Scroll-Sperre - sonst verrutscht die Seite auf dem iPhone nach der
   Tastatur): Zeilen, Summe nach Staffel, Name/Telefon/Adresse/Stadt,
   "Porositni" → Bestaetigung mit Bestellnummer. Bezahlt an der Tuer.
4. **"Gjeni setin për lëkurën tuaj"** (`#ls-start`) → dieselbe Analyse wie
   /lifeskin: Wahl (Scan/Foto/Trup-Pytje), Aufnahme, Fragen, Name, Nummer
   (Lead), Warteseite `/analiza/<id>?weg=lifeskinshop`.

## Technik

- **Weg** `lifeskinshop` in `shared/lifeskin-weg.js`; die Seite traegt
  `<html data-ls-landing="lifeskinshop">`, die Sitzung `source.weg`.
  Keine Regel-Aenderung, kein Regel-Deploy. Warteseite, Therapieseite und
  Fragen fallen fuer diesen Weg auf die Standardtexte zurueck (wie /lifeskin).
- **Seite** `apps/lifeskin-shop/index.html`: der Laden als `#ls-einstieg`,
  darunter die Bildschirme der Analyse (kopiert aus
  `apps/lifeskin-landing/index.html`), `lifeskin-app.js` + `shop.js`.
  Stilblaetter: `lifeskin-styles.css`, `landing.css` (Analyse-Bildschirme),
  `shop.css` (auf `#ls-einstieg` begrenzt), `shop-rahmen.css` (Rahmen,
  Kasse, Faelle zum Wischen, Leiste unten oben verankert per 100dvh).
- **Laden** `apps/lifeskin-shop/shop.js` (Klasse `Dyqan`): Mittel und Fotos
  ueber `mittelBauen`/`holeSammlung` aus `apps/lifeskin-landing/shop.js`
  (dessen Selbststart haengt jetzt an `#rrjeta`), Sets aus
  `config/shopSetet` (+ `config/shopSetFoto-{id}`), Faelle ueber
  `shared/lifeskin-raste.js` mit Ort `shop` (ohne Angabe = wie Landing).
  Rueckweg ohne Firestore: die drei Sets und vier Mittel der Seite.
- **Bestellung** in dieselbe Sitzung wie der Besuch:
  `sitzung.schritt("ordered", { name, phone, address, order: { kind: "shop",
  burimi: "lifeskinshop", total, payment: "nachnahme", items, set, fbc/fbp } })`.
- **Service Worker**: `/lifeskinshop` und `/apps/lifeskin-shop` stehen in der
  Ausnahmeliste (sonst Social-Shell bei Netz-Aussetzern). Build entfernt
  Kommentare auch unter `apps/lifeskin-shop`.

## Pixel (Meta) und Conversions API

Pixel-Aenderung erlaubt von Albert (albert11a, Inhaber) am 28.09.2026:
"/lifeskinshop meldet AddToCart, InitiateCheckout, Purchase (Browser + CAPI)
und Lead wie die anderen Wege". `tests/lifeskin-pixel-sperre.test.mjs`
schliesst `apps/lifeskin-shop/shop.js` und `index.html` jetzt mit ein.

| Moment | Ereignis | Woher |
|---|---|---|
| Seite oeffnet | `PageView` (+ `lifeskin_landing_view`) | Trichter, wie /lifeskin |
| Set/Mittel in den Korb | `AddToCart` mit Betrag | `pixel.meldeKorb` |
| Kasse oeffnet mit Inhalt | `InitiateCheckout` mit Betrag | `pixel.meldeKasse` |
| Anschrift begonnen | Heart-Marke `adresseBegonnen` (kein eigenes Meta-Ereignis) | |
| Bestellung vom Server bestaetigt | `Purchase` (Browser) + CAPI-Purchase (Server) | `schritt("ordered")`, `functions/lifeskin-capi.js` |
| Nummer in der Analyse | `Lead` | Trichter, wie /lifeskin |

Im stillen Modus (`?still=1`) wird nichts gemeldet und nichts gezaehlt.

## Heart

- **Tab "Lifeskin Shop"** (`#lifeskinshop`): die Lifeskin-Ansicht mit den
  Faellen dieses Wegs - Kacheln, Live, alle Trichter (inkl. Kauftrichter
  Landing → Produkte → Warenkorb → Anschrift → Kauf), Faelle, Bestellungen,
  Links ohne Stats, eigene Tests. Oben neu: **"Shop · vom Besuch bis zum
  Kauf"** (Shop → angesehen → AddToCart → InitiateCheckout → Anschrift →
  Purchase), Umsatz, Ø Bestellung, Ø Warenkorb, Kauf je Besuch, was gekauft
  wurde (je Set / Einzelmittel), und die Analyse "Gjeni setin" → Lead →
  abgegeben. Die anderen Tabs zeigen Shop-Faelle nicht.
- **Shop-Sets** (Mehr anzeigen): anlegen, bearbeiten, Foto, Produkte,
  Bedarf (Filter), Schild, Texte, im Shop an/aus, Reihenfolge, loeschen.
- **Einzelmittel**: Karte "Produkte" (Name, Preis, Sichtbarkeit, Bilder der
  Landingpage) - dieselben Mittel wie im Laden auf /lifeskin.
- **Vorher/Nachher**: Karte "Ergebnisse", neuer Ort **Shop**.

## Pruefung

- `npm test`: alle gruen, neu `tests/lifeskin-shop.test.mjs`.
- Browser (Chromium, iPhone-13-Groesse, Firestore/Meta abgefangen, keine
  echte Bestellung): Set → AddToCart, Kasse → InitiateCheckout, Anschrift,
  Porositni → Purchase; Sitzung mit `source.weg = lifeskinshop`, allen
  Marken und `order`; "Gjeni setin" → Wahl, zurueck → Laden.
- Nicht geprueft: echtes iPhone/Instagram, echte Bestellung in Firestore,
  Heart im Browser (Anmeldung). Vor dem Schalten der Anzeige am Telefon
  pruefen: eine Bestellung im stillen Modus, in Heart ansehen, loeschen.

## Rueckweg

`git revert` der Commits. Keine Regel-, Sammlungs- oder Routen-Entfernung.

## Titelbild (Heart, zuschneidbar)

Heart -> Lifeskin Shop -> Mehr anzeigen -> "Shop-Titelbild": Bild wählen,
im Rahmen 7:5 verschieben und zoomen, speichern. Ablage:
`lifeskin/{tenant}/config/shopHero { foto: "data:image/jpeg..." }` (1400 px
breit, höchstens ~450 KB). Der Shop (`Dyqan.titelbild()`) tauscht das Bild
nach dem Dekodieren und gibt dem Rahmen `data-eigen` (aspect-ratio 7/5).
"Standardbild" löscht das Dokument, dann gilt wieder `lf-acne-2.jpg`.
Zuschneiden: `apps/mnyra-heart/heart-lifeskin-schnitt.js`.

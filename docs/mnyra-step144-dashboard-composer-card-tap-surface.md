# Mnyra Step 144 - Panel-Karte "Posto n'Mnyra"

Status: CURRENT
Datum: 2026-08-06
Branch: `stabilityegger1`

## Ziel

Die grosse Karte unter dem Begruessungstext im Business-Panel soll dem
Entwurf des Nutzers folgen:

- Aufbau wie die Vorlage: Ueberschrift, Untertitel, Haarlinie, darunter eine
  Zeile mit Plus im Kreis, Beschriftung und Pfeil rechts aussen
- **kein** Plus oben in der Karte (in der Vorlage war eines, es ist
  ausdruecklich nicht gewuenscht)
- Titel neu: `Posto n'Mnyra`, gleiche Schreibweise wie die Nachbarkarten.
  Farbig ist jetzt `Posto`, `n'Mnyra` steht ruhig daneben - genau umgekehrt
  zu vorher (`Posto n'Zbulo` mit farbigem `Zbulo`).
- egal wo man in die Karte tippt, oeffnet sich das Modal

## Geaendert

`core/dashboard/dashboard-render-utils.js`

- Die Karte ist selbst der Knopf (`<button type="button">` mit
  `data-dashboard-composer="post"`). Der bisherige ausgefuellte Knopf darin
  ist weg - ein Knopf im Knopf waere weder gueltiges HTML noch bedienbar.
- Titel und Untertitel stehen dadurch in `<span>` statt `<p>` (in einem
  `<button>` ist nur Phrasing-Content erlaubt) und bekommen `display: block`.
  Fuer die halben Karten daneben aendert das nichts, dort waren es `<p>`.
- Neue Aktionszeile `.mnyra-dash__composer-cta`: Haarlinie oben, Plus im
  Kreis, Beschriftung in Akzentfarbe, `chevron-right` per `margin-left: auto`
  rechts aussen.
- `.mnyra-dash__composer--tap` traegt die Knopf-Zuruecksetzungen
  (Breite, linksbuendig, `font: inherit`, kein Tap-Highlight) und das leichte
  Eindruecken beim Tippen.
- `.mnyra-dash__composer-actions--single` entfernt - die Regel hatte nur die
  eine Karte, die es so nicht mehr gibt.

## Nicht geaendert (bewusst)

- Untertitel Wort fuer Wort wie vorher.
- Die Beschriftung der Zeile bleibt `Posto` (in der Vorlage stand dort
  `Krijo postim të ri`; der Nutzer hat "Text nicht aendern" gesagt - ausser
  dem Titel).
- Die beiden halben Karten darunter (`Posto n'Profil`, `Posto n'Meny`) und
  die Schnellzugriffe bleiben unangetastet.
- Der Klick-Weg ist derselbe wie vorher: der delegierte Handler im
  Dashboard-Controller sucht `[data-dashboard-composer]`. Es entsteht keine
  neue Routing- oder Event-Logik.

## Geprueft

- Karte in Chromium mit dem echten `DASHBOARD_CSS` gerendert und angesehen:
  Aufbau wie die Vorlage, kein Plus oben, Farbverteilung im Titel korrekt.
- `document.elementFromPoint` an vier Stellen der Karte (Mitte, rechte untere
  Ecke, rechts oben, Zeile): ueberall findet der Handler
  `data-dashboard-composer="post"`. Nur ausserhalb der abgerundeten Ecke
  nicht - dort ist auch optisch keine Karte mehr.
- `tests/business-composer-core.test.mjs`: Titelaufbau, genau ein Knopf (die
  Karte), kein `composer-btn` mehr, genau ein Plus und es steht unter dem
  Text, Pfeil rechts, Blockform von Titel/Untertitel.
- `npm run test:unit` (553 gruen), `npm run lint`, `npm run build`.

## Nicht geprueft

- Kein Test auf einem echten iPhone durch mich.

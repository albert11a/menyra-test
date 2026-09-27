Status: CURRENT
Last updated: 2026-09-27

# LifeSkin Auto-Modus - die Analyse ohne Warten

Auftrag (27.09.): Statt Prompt kopieren → ChatGPT → JSON einfuegen →
freigeben soll ein neuer Fall automatisch analysiert und freigegeben werden,
ueber die OpenAI-API. Der Kunde bleibt auf der Warteseite und sieht sein
Ergebnis nach wenigen Minuten. Schalter "Auto" in Heart: an = automatisch,
aus = wie bisher von Hand.

Entscheidung Inhaber: voll automatisch freigeben. Auf der Warteseite faellt
im Auto-Modus der Satz "Nuk është një makinë …" weg, der Titel lautet "…
po përgatitet sipas metodës së Dr. Gashit"; alles andere bleibt.

## Ablauf

1. Trichter legt den Bericht an (`reports/<id>`, status `wartet`) und
   leitet auf die Warteseite.
2. Function `lifeskinAutoAnalyse` (onCreate) liest `config/ablauf.autoAn`.
   Aus: nichts. An: Sperre je Fall (`ablaeufe/<id>`), Tageslimit, Stand
   `vorbereitung.stand = "laeuft"` im Bericht.
3. Wartet bis 60 s auf die Fotos, nimmt hoechstens `autoMaxFotos` (6) in
   der Reihenfolge gerade, rechts, links, oben, Stelle.
4. Derselbe Prompt wie in Heart (v9 bzw. v9-pa-foto, derselbe Katalog,
   dieselben Fragen) → OpenAI Responses API, Antwort als JSON.
5. `shared/lifeskin-auto-befund.js` baut daraus den Bericht, den Heart beim
   Freigeben schreibt (gleiche Leser, Therapie-Automatik, Preisstaffel,
   Antworten-Abschrift, Weg). Status `fertig`, `vorbereitung.stand =
   "fertig"`.
6. Die Warteseite fragt im Auto-Modus alle 5 s nach und springt auf
   `/terapia/<id>`.

**Zurueck an Heart (Fall bleibt wartend, `vorbereitung.stand = "manuell"`)**
bei: Tageslimit, keine Fotos, Antwort nicht lesbar, kein Befundtext, keine
Messwerte (mit Foto), Analyse verlangt aerztliche Abklaerung, kein bekanntes
Produkt, Fehler der API. Heart zeigt "Auto → von Hand" mit Grund; die
Warteseite zeigt wieder die gewohnten Texte. Wurde in Heart schon von Hand
freigegeben, wird nichts ueberschrieben.

## Heart

- Oben im Lifeskin-Tab (beide Tabs): Schalter **Auto-Analyse**.
- Marken am Fall: **Auto** (automatisch freigegeben - kurz ansehen),
  **Auto läuft**, **Auto → von Hand** (mit Grund im Tooltip).
- Freigegebene Auto-Faelle lassen sich wie jeder Fall oeffnen, aendern und
  neu freigeben.

## Kosten (Stand 27.09.2026, developers.openai.com/api/docs/pricing)

Prompt ~12.500 Tokens, Antwort ~3.000 + Denken ~2.000, Foto ~800 Tokens.
Je Fall (ohne / mit Prompt-Rabatt), US-Cent:

| Modell | 1 Foto | 3 | 6 | 10 |
|---|---|---|---|---|
| gpt-5.4 (Standard) | 10,8 / 8,3 | 11,2 / 8,8 | 11,8 / 9,3 | 12,6 / 10,2 |
| gpt-6-sol | 7,7 / 5,7 | 8,0 / 6,0 | 8,5 / 6,5 | 9,1 / 7,1 |
| gpt-4.1 | 6,7 / 5,0 | 7,0 / 5,3 | 7,5 / 5,8 | 8,1 / 6,5 |
| gpt-5.4-mini | 3,2 / 2,5 | 3,4 / 2,6 | 3,5 / 2,8 | 3,8 / 3,0 |

Jeder Lauf schreibt Tokens und geschaetzte Kosten ins Function-Protokoll
(`lifeskin.auto`) und nach `ablaeufe/<id>`.

## Einstellungen (`lifeskin/lifeskin/config/ablauf`)

| Feld | Standard | |
|---|---|---|
| `autoAn` | `false` | der Schalter in Heart |
| `autoModell` | `gpt-5.4` | Modellname der API |
| `autoTagesLimit` | `40` | Faelle je Tag (Zeit Kosovo/Albanien) |
| `autoMaxFotos` | `6` | Fotos je Anfrage (1-10) |

## Einmal einrichten (vom Inhaber)

1. OpenAI: platform.openai.com → API keys → neuen Schluessel anlegen.
   Unter Limits ein **Monatslimit** setzen (z. B. 30 $).
   **Den Schluessel nirgends einfuegen ausser im naechsten Schritt.**
2. Im Repo-Ordner:
   ```
   firebase functions:secrets:set OPENAI_API_KEY --project menyra-c0e68
   ```
   (fragt nach dem Schluessel)
3. Deploy nur dieser Function:
   ```
   firebase deploy --only functions:lifeskinAutoAnalyse --project menyra-c0e68
   ```
   Vorher laeuft automatisch `sync-lifeskin-auto` (firebase.json predeploy).
4. Heart → Lifeskin → **Auto-Analyse** einschalten. Einen Testfall mit
   `mnyra.com/lifeskin2?test=1` durchspielen.

Keine Regel-Aenderung, kein Regel-Deploy: Schalter in `config` (CEO
schreibt), Stand im Bericht und `ablaeufe/` schreibt nur der Server.

## Technik

- `shared/lifeskin-prompt.js` - Prompt einsetzen (Heart und Server).
- `shared/lifeskin-auto-befund.js` - Antwort → Bericht oder Grund.
- `functions/lifeskin-auto.js` - Ausloeser; `functions/lifeskin-auto-anfrage.js`
  - reine Anfrage/Antwort; `functions/scripts/sync-lifeskin-auto.cjs` -
  Abschriften nach `functions/lifeskin-auto/generated/`.
- Warteseite: `apps/lifeskin-astra` (`TEXTE_AUTO`, `imAuto`, 10-Minuten-Grenze).
- Heart: Schalter (`renderAutoSchalter`, `speichereAblauf`), Marken am Fall.
- Pixel und Conversions API: unveraendert (Meta-Pixel-Sperre).
- Tests: `tests/lifeskin-auto.test.mjs` (Prompt identisch, Bericht, Rueckfaelle,
  Abschriften aktuell, Function mit Speicher-Datenbank, Warteseite).

## Grenzen

- Die Antwortzeit haengt an OpenAI (gemessen: noch nicht mit echtem
  Schluessel). Erwartet 30-90 s.
- Die Warteseite gibt nach 10 Minuten ohne Ergebnis die Zeitangabe auf.
- `gpt-5.4` ist voreingestellt; ob ein anderes Modell die Analyse genauso
  gut macht, zeigt nur ein Vergleich an echten Faellen.

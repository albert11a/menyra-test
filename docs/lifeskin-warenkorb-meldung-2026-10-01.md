Status: CURRENT
Last updated: 2026-10-01

# Warenkorb der Therapieseite: keine Meldung, kein Zeitpunkt (01.10.)

## Was passiert ist

Eine Patientin (Anzeige, Instagram) hat auf ihrer Ergebnisseite
`/terapia/<kennung>` den Kaufknopf gedrueckt. Der Warenkorb ging auf, Heart
zeigte sie unter Nachfassen als "Nur Warenkorb" - aber:

- aufs Telefon kam keine Meldung,
- Heart schrieb "Der Warenkorb-Klick steht nicht im Klickpfad".

## Ursache

Seit dem 29.09. legt der Kaufknopf der Therapieseite in einen Warenkorb
(`terapia.js #korb`). Er schreibt dabei `timings.kauf.knopf` und bewusst
NICHT `imKorb` (das ist der Korb im Laden). Die Meldung kannte aber nur
`imKorb` und `kasseGeoeffnet`:

- `scripts/meldungs-waechter/meldungs-regeln.mjs` (auch von
  `api/lifeskin-meldung.js` benutzt) meldete den Korb nur bei `imKorb`.
- Der Kaufknopf stiess `/api/lifeskin-meldung` gar nicht an
  (`astra-daten.js kaufMarke`).
- Im Klickpfad heisst der Kaufknopf je nach Stelle anders; Heart
  (`korbZeitpunkt`) erkannte ihn nicht.

Kasse ("An der Kasse") und Bestellung ("Neue Bestellung") waren nicht
betroffen.

## Korrektur

- Meldungsregel: `lifeskin_korb` auch bei frischem `timings.kauf.knopf`
  (nur innerhalb des Frischefensters, nie nach der Bestellung).
- `AnalyseDaten.kaufMarke("knopf")` stoesst die Meldung an, sobald der Knopf
  in Firestore steht.
- Therapieseite: eigenes Klickpfad-Ereignis `korb` beim Oeffnen des Korbs.
- Heart: `korbZeitpunkt` erkennt `korb` und nimmt sonst die frueheste Marke
  (`timings.kauf.knopf`, `kasseGeoeffnetAt`) - rueckwirkend fuer alle Koerbe
  seit dem 29.09. Klickpfad zeigt "Warenkorb" mit Einkaufswagen.

Keine Pixel-/CAPI-Zeile geaendert (Pixel-Sperre gruen), keine neue
Firestore-Regel, keine neue Route.

## Geprueft

- `tests/lifeskin-meldung-korb-kasse.test.mjs`, `tests/heart-nachfass-koerbe.test.mjs`
- Pruefstand `lauf-wege.mjs A14` (390 px, Instagram Android, Firestore im
  Speicher): Anzeige -> Analyse -> Freigabe -> Therapieseite -> Warenkorb ->
  Kasse -> Bestellung, 40/40, lokal und gegen `dist/`. Ohne die Korrektur:
  36/40 (Warenkorb ohne Meldung, ohne Zeitpunkt).

## Bleibt offen

- Eine Meldung fuer Koerbe VOR dieser Korrektur wird nicht nachgeschickt.
- Die Cloud Function `notifyCeoOnLifeskinSessionWrite` (nicht deployt)
  meldet weiter nur Analyse und Bestellung.

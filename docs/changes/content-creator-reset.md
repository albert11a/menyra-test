# Content Creator: Testdaten zuruecksetzen

Scope: Einrichtung in MNYRA Heart bekommt einen bestaetigten Reset fuer alle
Content-Creator-Besuche (inkl. Scrolls, Antworten und Klickpfade), Warenkoerbe,
Bestellungen und Nachfassmarken. Businesses, Workflow, Links, Pakete, Preise,
Fotos und Originale bleiben erhalten. LifeSkin, GO und andere MNYRA-Bereiche
sind nicht Teil dieses Resets.

Umsetzung: CEO-authentifizierter Vercel-Endpunkt, keine neuen Firestore-Rechte
und kein Functions-Deploy. Je Aufruf maximal 200 Dokumente, Fortsetzung ueber
Firestore-Seitentoken. Serverzeit bildet die Reset-Grenze. Neuere oder parallel
veraenderte Dokumente werden nicht geloescht; Update-Preconditions verhindern
das Ueberschreiben konkurrierender Aenderungen. Bei Fehler bleibt die letzte
Fortsetzung erhalten und kann wiederholt werden. Erfolg erst nach allen Seiten.

Der Reset wird ausschliesslich nach Bestaetigung im UI ausgefuehrt, nicht beim
Build, Deploy oder Oeffnen der Einstellungen. Bestehende Test-Bestelllinks sind
anschliessend ungueltig. Offene Kundenseiten koennen neue Aktivitaet erzeugen.

Validierung: siehe abschliessenden PR-Bericht. Keine Produktionsdaten fuer Tests.

## Pruefbericht

- `node --test tests/*creator*.test.mjs`: 140 bestanden, 0 fehlgeschlagen.
  Enthalten: CEO-Zugriff, Bestaetigung/Abbruch, Doppeltipp, Wiederaufnahme,
  1.353 Testdatensaetze ueber mehrere Seiten, Schutz neuer Aktivitaet und
  bestehender Inhalte sowie spaeter Push-Abschluss nach dem Loeschen.
- ESLint fuer neue Module, Settings und Shop-Server: erfolgreich. Der bestehende
  grosse Content-Creator-Controller hat weiterhin seine vorherige Warnung
  `unused` (keine neuen Lint-Fehler).
- `git diff --check`: erfolgreich.
- `npm run build`: erfolgreich; die getrackten Bundle-Dateien bleiben identisch,
  deshalb sind keine Bundle-Aenderungen zu committen. Build meldet bestehende
  Circular-Chunk-/Groessenwarnungen.
- Der zuerst versuchte breite Aufruf `node scripts/run-test-files.mjs tests
  --include creator` filtert nicht (`--include` wird nicht unterstuetzt).
  Dieser Lauf war nicht erfolgreich: Rules-Tests benoetigen den hier nicht
  gestarteten Firestore-Emulator; alte Controller-Testharnesses schlugen vor der
  anschliessenden Korrektur der verzögerten Reset-Initialisierung fehl. Der oben
  genannte finale Creator-Lauf ist gruen. Kein vollstaendiger gruener Suite-Lauf
  wird behauptet.
- Keine mobilen Browser-, Playwright-, Smoke- oder Produktionschecks.
  DOM-Rendering fuer Einrichtung und vorhandene Creator-Interaktionen ist in
  den Node-Tests abgedeckt. Visuell auf einem Telefon noch zu pruefen:
  Einrichtung -> Content Creator -> Reset -> Abbrechen; erneut Reset und
  bestaetigen, anschliessend Zahlen und erhaltene Pakete pruefen.
- Kein Reset und kein Production-/Functions-/Rules-Deploy ausgefuehrt.

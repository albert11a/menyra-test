# Bestehende Creator-Seiten auf Shop umstellen

Auftrag: Peshku i pite und La maison bistro von Vorschau auf Shop umstellen
und die erforderliche Funktion auf main uebernehmen.

Scope: In der Business-Seite eines bestehenden Vorschau-Eintrags steht die
Seitenart mit einer Aktion "Auf Shop umstellen". Die Aktion aktualisiert das
bestehende Firestore-Dokument gezielt; ID, Link, Name, Bilder, Hero, Workflow,
Besuche und Bestellungen bleiben erhalten. Vorhandene Produkte bleiben erhalten;
fehlen Produkte, beginnt der Shop mit einer leeren Paketliste. Keine erfundenen
Preise oder automatischen kostenlosen Pakete. Pakete werden separat angelegt.
Keine automatische Umstellung anhand eines Namens beim Oeffnen oder Deploy.

Pruefung: `node --test tests/*creator*.test.mjs` 141 bestanden;
`npm run build` erfolgreich, keine Aenderung getrackter Bundle-Dateien;
`git diff --check` erfolgreich, ESLint ohne Fehler (bestehende unused-Warnung
im grossen Controller). Kein Playwright-/Smoke-Lauf, mobile Darstellung
noch nicht geprueft. Die Datenumstellung erfolgt nach Bereitstellung ueber
die CEO-Sitzung im normalen Heart-UI und wird dort je Seite verifiziert.

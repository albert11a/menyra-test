# LifeSkin Dërgesat: offene und abgeschlossene Abrechnungen

Korrigierte Anforderung vom 24.10.2026:
- Kosovo: aktuell genau 1 Barazuar mit 34 €, Riba 2 €, keine offenen
  Zusatzkosten, Ergebnis 32 €. Kein Bartur aus alten Überweisungen.
- Alte Österreich-Überweisung: 251,50 € vor Zusatzkosten minus 32,10 €
  zugehörige Ausgaben = 219,40 € erhalten. Beide Karten zeigen 219,40 €.
- Überwiesene Bestellungen samt Riba und Zusatzkosten schließen gemeinsam ab.
  Die nächste Abrechnung enthält nur noch offene Einträge.

Bestehende Überweisungen wurden vor Shtesa/shpenzime gespeichert. Diese
Ausgaben werden beim Lesen der zugehörigen Überweisung zugerechnet und vom
Betrag abgezogen. Bereits enthaltene Riba wird dabei nicht erneut abgezogen.
Neue Überweisungen speichern den im Formular vorgeschlagenen Nettobetrag
inklusive Zusatzkosten. Im bestehenden Notizfeld kennzeichnet der Präfix
„Neto pas shpenzimeve.“ diese Semantik und verhindert einen doppelten Abzug.
Beim Lesen wird der Präfix aus dem sichtbaren Notiztext entfernt.
Keine neuen Datenfelder, keine Rules-Änderung und keine Produktionsmigration.

Ausgaben gehören zur ersten nachfolgenden Überweisung, bei gleicher Zeit
sortiert nach Dokument-ID. Bestellungen gehören über ihre IDs zur Überweisung.
Kalenderperioden verwenden dieselben korrigierten Überweisungsbeträge.

Auf ausdrücklichen Nutzerwunsch Commit und Push auf main.

Validierung der Korrektur:
- 37 gezielte Tests erfolgreich; exakter Screenshot-Fall prüft 32 € Kosovo,
  219,40 € Österreich, 1 offene Bestellung, 2 € Riba, keine alten Kosten/Bartur.
- Neue Nettobuchungen werden in Folgerechnungen nicht erneut um Kosten reduziert.
- 3244 Unit-Tests erfolgreich, einschließlich Pixel-Sperre.
- npm run build und Syntax-/Diff-Prüfung erfolgreich.
- Keine Änderungen an getrackten Bundles; keine manuelle Mobilbrowserprüfung.

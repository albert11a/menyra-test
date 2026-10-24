# LifeSkin Dërgesat: offene und abgeschlossene Abrechnungen

Umfang: Kosovo zeigt nur offene Bestellungen und noch nicht abgerechnete
Ausgaben. Eine Überweisung schließt die gewählten Bestellungen und alle bis
dahin offenen Shtesa/shpenzime ab. Riba wird je Bestellung genau einmal
abgezogen. Der Vorschlag berücksichtigt auch Ausgaben und Restbeträge.
Österreich zeigt die vollständige Rechnung je Überweisung. Tatsächlich erfasste
Beträge werden nicht rückwirkend geändert; Differenzen bleiben als Restbetrag.

Kompatibilität: bestehende Dokumente werden nach Zeit und Bestell-IDs zugeordnet.
Ausgaben gehören zur ersten nachfolgenden Überweisung (bei gleicher Zeit nach
Dokument-ID). Keine Datenmigration, keine Rules- oder Pixeländerung. Die
Kalenderperioden behalten ihre vollständige Einnahmen-/Ausgabenhistorie.

Auf ausdrücklichen Nutzerwunsch Commit und Push auf main.

Validierung:
- 37 gezielte Tests erfolgreich, inklusive der Screenshot-Zahlen und Pixel-Sperre.
- Vollständige Unit-Suite: 3243 Tests erfolgreich.
- npm run build erfolgreich; keine Änderungen an getrackten Bundle-Dateien.
- Syntaxprüfung der Browsermodule und git diff --check erfolgreich.
- Kein manueller Mobilbrowser-/Produktionsdaten-Test; keine Playwright-/Smoke-Läufe.

Hinweis zu Altbeträgen: 251,50 € bleibt als erfasste Überweisung erhalten.
Abweichungen zur rekonstruierten Rechnung werden unter der Überweisung
angezeigt und als Restbetrag übernommen; sie werden nicht künstlich auf null
gesetzt. Ein vollständiger, passender Abschluss startet die offene Rechnung bei null.

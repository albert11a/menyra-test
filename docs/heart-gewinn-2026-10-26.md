# Heart: Ads, Umsatz und Gewinn

Scope: einklappbare Karte unmittelbar nach den Kennzahlen, pro bestehendem Weg und in der gemeinsamen Ansicht. Tagesbudget in EUR pro Weg/Tag, dauerhaft CEO-only in landingArchive; erneutes Speichern ersetzt den Tagesbetrag. Filter heute, letzte 7 Tage, laufender Monat, max, inklusive Datumsgrenzen. Keine Pixel-, CAPI-, Kunden- oder Versandstatus-Aenderungen.

Seen = einmal pro echter Sitzung, erster belegter berichtGeoeffnet-Ereignistag. Alte Flags ohne Ereignisdatum nur in Max, separat ausgewiesen. Bestellungen nach eigenem createdAt, dedupliziert nach orderId, Tests und Stornos ausgeschlossen. Quotienten sind Aktivitaetsdurchschnitte des Zeitraums, keine Anzeigenattribution oder Kohortenconversion.

Umsatz minus aktuelle Produktkosten (inklusive Mengen), Verpackung/Sonstiges, Posttarif anhand Beki-Praefix und Riba, minus Ads. Kein doppelter Abzug des generischen Versandfelds. Fehlende Kosten/Produktzuordnung/Versandland sperren die Gewinnzahl. Aktuelle Einkaufskosten sind eine Kalkulation, keine historische Kostenbuchhaltung. Zugestellte Bestellungen werden separat ausgewiesen; Bestellumsatz ist kein Zahlungseingang. Tage mit Aktivitaet ohne eingetragenen Ads-Betrag machen die Auswertung vorlaeufig; 0 EUR kann explizit gespeichert werden.

Umsetzung auf Feature-Branch gemaess AGENTS.md. Keine Produktionstests, kein Playwright ohne ausdruecklichen Auftrag. Rechentests, Pixel-Sperre und Build vorgesehen.

## Verifikation

- 87 gezielte Node-Pruefungen bestanden: Gewinn, Zeitgrenzen/Zeitzone, Seen, Stornos/Tests, Mengen, Kostenluecken, Bereichstrennung, Klick/Filter-Routing, bestehende Heart-Ansichten, Produktkosten, Bestellungen und Versand.
- Meta-Pixel-Sperre vollstaendig gruen; keine Pixel-/CAPI-Datei oder Aufrufzeile geaendert.
- ESLint fuer geaenderte JS-Dateien: 0 Fehler; 4 bestehende Warnungen fuer unbenutzte Variablen in heart.js und heart-lifeskin-render.js.
- `npm run build` erfolgreich. Keine getrackten Bundle-Dateien geaendert; Heart wird im statischen Output mitgebaut. Bestehende Social-Chunk-/Groessenwarnungen bleiben.
- `git diff --check` erfolgreich.
- Kein mobiler Browsercheck und kein Produktionsschreibtest. Nach Review manuell pruefen: Karte auf/zu und Zustandserhalt, Plus in allen drei Swipe-Bereichen, Tagesbetrag 0/Komma/Bearbeiten, Filter von/bis, Kosten ohne Beki, explizite Ads-Luecken und Abgleich mit echten Bestellungen. Kein Playwright/Smoke gemaess AGENTS.md ohne ausdruecklichen Auftrag.

## Bedienkorrektur 26.10.

- Plus oeffnet jetzt einen nativen modalen Ads-Dialog ausserhalb des Heart-Morph-Baums. Laden, Live-Takte und Neuzeichnen der Statistik koennen den Dialog und seine ungespeicherten Eingaben nicht entfernen. Fehler bleiben im Dialog, Laden ist wiederholbar und Doppelspeichern wird blockiert.
- Der Button `Wählen` ersetzt die Von-/Bis-Eingabefelder. Kalender mit Monatsnavigation: erster Tipp waehlt einen Tag, zweiter Tipp den Bereich; `Übernehmen` uebertraegt die Auswahl gemeinsam. Abbrechen aendert den Filter nicht. Einzelne Tage und Bereiche ueber Monats-/Jahresgrenzen sind moeglich.
- Karte/Inhaltsraster/Tabelle und iOS-Datumsfeld im Dialog haben eigene Breitenbegrenzungen; Tabelle scrollt ausschliesslich im eigenen Container. Keine maskierende globale Overflow-Regel.
- Datenpfad gemaess Verifikations-Workflow: Plus -> separater Dialog -> unveraenderter CEO-Ads-Adapter -> Tagesdokument -> aktualisierte Statistik; Kalender -> atomarer Filter -> unveraenderte Berechnung. Ein alter Lesevorgang darf einen neu gespeicherten Betrag nicht ueberschreiben.
- 91 gezielte Tests bestanden, davon neue DOM-Pruefungen fuer Dialogerhalt ueber Morph-/Ladezustaende, Speichern/Doppelklick, Ladefehler/Retry, Speicherfehler/Eingabeerhalt und Kalenderuebernahme/Abbruch. Linkedom ist ausschliesslich eine Entwicklungsabhaengigkeit.
- Build erfolgreich, keine getrackten Bundle-Aenderungen. ESLint: keine Fehler, drei bestehende Warnungen in heart.js. Pixel-Sperre gruen. Kein echter iPhone-/Browsercheck und kein Produktionsschreibtest; Browser-/Produktionsgrenze daher weiterhin nicht als end-to-end verifiziert ausgewiesen.

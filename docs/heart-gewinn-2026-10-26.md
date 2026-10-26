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

## Status, Zeitraeume und Kostentransparenz

- Die rote Vorlaeufig-Warnung erschien auch waehrend normalem Laden. Laden ist jetzt ein neutraler Status; ein kurzer Hinweis zu offenen Ads-Tagen erscheint erst nach erfolgreichem Laden und tatsaechlich fehlenden Eintraegen. Ads werden bei der initialen Heart-Datenladung geholt, nicht erst durch ein Toggle. Wiederholte Render-/Toggle-Ereignisse laden fertige Daten nicht erneut.
- Verpackung/Sonstiges wurden aus den gleichnamigen Feldern der bestehenden Produktkosten je Bestellung berechnet. Keine erfundenen Pauschalen. Beide Posten sind nun getrennt sichtbar und werden weiterhin genau einmal je Bestellung abgezogen; hinterlegte Kostenwerte bleiben unveraendert.
- Zeitraeume: Heute, Gestern, Vorgestern, Letzte 7 Tage, Dieser Monat, Max · alle, Eigene Auswahl. Vergangene Tage sind lokale Kalendertage inklusive Monats-/Jahres-/DST-Grenzen. Eigene Auswahl oeffnet denselben Kalender wie Wählen. Ein vom angewendeten Filter abhaengiger Select-Schluessel verhindert einen alten Heute-Anzeigewert nach Kalenderuebernahme; Abbrechen behaelt die vorige Auswahl.
- Wählen und Auswahlfeld exakt 44 px hoch. Keine blaue Fokus-/Tap-Umrandung an den Gewinn-Steuerelementen, stattdessen dezenter neutraler Tastaturfokus.
- Der lange Erklaertext unter Tagesuebersicht ist entfernt.
- 95 gezielte Tests einschliesslich Pixel-Sperre bestanden. Build erfolgreich, keine getrackten Bundle-Aenderungen. Kein echter iPhone-Browsercheck.

## Abzuege hinter Info, einheitliche Kacheln

- Die Abzugszeile ist aus der Hauptkarte entfernt. Ein Info-Button direkt links vom Plus ist nur bei geoeffneter Karte sichtbar. Er oeffnet den bestehenden nativen Dialog mit Umsatz, allen sechs Abzugsposten, Gesamtabzuegen und Gewinn zur Kontrolle.
- Info verwendet dieselbe baueGewinn-Rechnung mit aktuellem Zeitraum und dem Weg des angeklickten Bereichs. Bei fehlenden Daten bleiben Gesamtabzuege/Gewinn unbekannt, bei offenen Ads-Eintraegen wird die Rechnung als vorlaeufig bezeichnet. Keine Aenderung der finanziellen Berechnung.
- Die acht Gewinnwerte verwenden nun dieselben heart-lifeskin-kacheln/-kachel-Klassen wie die Kennzahlen oberhalb, inklusive Zellhintergruenden und Trennlinien. Alte separate Rasterstyles entfernt; Breitenbegrenzung bleibt.
- 97 gezielte Tests gruen, inklusive DOM-Pruefungen fuer Info-Position, acht Standardkacheln, entfernte Abzugszeile, exakte Summen und Dialogerhalt beim Live-Render. Bestehende Kachel-Reihenfolgetests um das zweite Raster ergaenzt. Pixel-Sperre gruen.
- Build erfolgreich; keine getrackten Bundle-Aenderungen. ESLint ohne Fehler (drei bestehende Warnungen in heart.js). Kein echter iPhone-Browsercheck.

## Feiner vertikaler Abstand

Gewinnkacheln behalten die gemeinsamen Schriftgroessen der Hauptstatistik (Titel 11 px, Wert 25 px, Zusatz 12 px). Zellabstand auf 6 px, vertikales Padding auf 14/15 px und Zusatz-Zeilenhoehe auf 1,35 angepasst. Safari-Fokus am summary selbst ergaenzt: kein blauer Fokus-/Tap-Rahmen; neutraler innerer Tastaturfokus. Nur CSS, keine Daten-/Berechnungsaenderung. Build erfolgreich; keine getrackten Bundle-Aenderungen. Kein echter iPhone-Browsercheck.

## Geplanter Ausbau Stats / gemeinsame Ads

Gewinnkarte in allen Heart-Bereichen gemeinsam fuer Skinreact und LifeSkinshop, weil Ads beide Wege abdecken. Vorhandene Tagesbetraege werden zusammengefuehrt, nicht neu geschrieben oder doppelt addiert. Storno-Wahrheit kommt aus statusiNeHeart, derselben Funktion wie die Bestellkarten. Stats-Dialog: Umsatz mit aufklappbarer Bestellliste, Ads-Tagesliste, sichtbare Anulime. Ads-Tage mit positiven Ausgaben und null aktiven Bestellungen werden als Summe/Anzahl in den Kacheln ausgewiesen; Tageszeilen ohne Bestellung rot plus Text. Zeitraum und Cent-Rechnung bleiben identisch zur Hauptkarte.

Umgesetzt: Stats-Button links neben Info (nur offen sichtbar), nativer Dialog mit aufklappbarem Umsatz/Bestellungen, Ads-Tagesliste und Anulime-Liste. Alle Gewinnkarten rechnen mit beiden Wegen. Ads-Luecken werden pro gemeinsamem Datum statt pro Weg beurteilt. Zusaetzliche Kacheln: Ads ohne Bestellung, Tage ohne Bestellung, Anulime, Wert Anulime. Anulime werden nach dem gemeinsamen Bestellkarten-Status ausgeschlossen und separat gezaehlt; ein veraltetes isoliertes storniert-Flag reicht nicht. Die Ads-Kosten eines stornierten Auftrags bleiben als Tagesausgabe erhalten. Tage mit Nullbudget zaehlen nicht als Kostentage ohne Bestellung.

Validierung: 100 gezielte Node-/DOM-Pruefungen bestanden, einschliesslich gemeinsamer Ads ohne Doppelerfassung, Shop-Bestellungen, Statuskonsistenz, Storno-Summen, positiven Ads ohne Bestellung, redaktionell markierten Tageszeilen und Stats-Klickrouting. Pixel-Sperre gruen; ESLint ohne Fehler (vier bestehende Warnungen). Build erfolgreich; keine getrackten Bundle-Aenderungen. Kein echter iPhone-/Produktionsschreibtest.

## Farben in der Tagesuebersicht

Nur Best.- und Gewinnzellen farbig: Bestellungen >= 1 gruen, 0 rot; Gewinn > 0 gruen, < 0 rot; Nullgewinn und unbekannter Gewinn neutral. Gemeinsame Heart-Farbvariablen, keine Rechenaenderung. 31 gezielte Pruefungen einschliesslich DOM-Grenzfaellen und Pixel-Sperre bestanden. Build erfolgreich; getrackte Bundles unveraendert. Kein echter iPhone-Browsercheck.

## Stabile Karte beim Nachladen

Wechselnde Lade-, Ads-Luecken-, Kosten- und Altbestandshinweise aus der Hauptkarte entfernt, insbesondere `Ads werden geladen` und die aelteren Seen-Analysen ohne Datum. Berechnung und unbekannte Werte bleiben unveraendert; Kostenstatus bleibt im vorhandenen Info-Dialog kontrollierbar. Die Tagesuebersicht hat nun einen eigenen stabilen Morph-Schluessel und gemerkten Klappzustand, damit Live-Render sie nicht automatisch schliessen. 60 gezielte Tests einschliesslich Strukturvergleich in Lade-/Fehler-/Fertig-Zustaenden und erhaltenem Tagesklappzustand gruen. Build erfolgreich, keine getrackten Bundle-Aenderungen; kein echter iPhone-Browsercheck.

## Schrittweise Gewinnrechnung im Stats-Dialog

Unter Anulime steht nun die laufende Rechnung: Umsatz, minus Posta/Transport, Zwischenstand, minus Riba, Zwischenstand, minus Produktkosten, Verpackung, Sonstiges und Ads bis zum Reingewinn. Jeder Posten genau einmal in Cent; Anulime sind bereits aus dem Ausgangsumsatz ausgeschlossen und werden nicht erneut abgezogen. Positive/negative Reingewinne gruen/rot, fehlende Kosten oder Ads lassen die betroffenen Zwischenstaende offen. Dialog bleibt bei langen Listen scrollbar.

33 gezielte Tests inklusive Zwischenstaenden, Endsumme, fehlenden Kosten/Ads, Verlustfarbe, Position unter Anulime und Pixel-Sperre bestanden. ESLint ohne Fehler/Warnungen in den geaenderten JS-Dateien. Build erfolgreich; keine getrackten Bundle-Aenderungen. Kein echter iPhone-Browsercheck.

## Fokusrahmen vollstaendig entfernt

Der graue summary-Rahmen stammte aus dem zuvor ergaenzten Tastaturfokus. Diese Regel sowie die neu eingefuehrten Profit-Fokusrahmen entfernt. Abschliessende Heart-weite Regel deaktiviert Fokus-outline/box-shadow und Tap-Highlights auch fuer Dialoge und alle anderen Controls. Dauerhafte Layout-Raender bleiben. Expliziter Inhaberwunsch fuer zukuenftige Projekt-UI in AGENTS.md festgehalten. Nur CSS und Dokumentation, keine Rechen-/Datenlogik. Build erfolgreich, keine getrackten Bundle-Aenderungen. Kein echter iPhone-Browsercheck.

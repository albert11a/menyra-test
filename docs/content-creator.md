# Content Creator — 29.10.2026

Scope: eigener Heart-Menübereich, Plus-Dialog, Lokalname/Profilbild/Mehrfach-Fotoupload, persönliche albanische Seite, FAQ und Ja/Nein. Heart zeigt eindeutige Seitenzahlen (geöffnet, mindestens 50 % gescrollt, Ja, Nein) und exklusive Filter wie Fälle. Antwort überschreibt Öffnen und Arbeitsstatus im Filter; Daten bleiben erhalten.

Datenvertrag: contentCreatorPages/{id} enthält öffentliche Präsentationsdaten und workflow (working/ready/sent). Bilder liegen einzeln in /images/{imageId}; Browser komprimiert JPEG auf höchstens 700 KB pro Dokument. contentCreatorVisits/{pageId}_{visitorId} enthält nur pageId, opened/scrolled, answer und server timestamps. Besucherkennung je Seite im Browser, keine Kontaktdaten. Mehrfachaufrufe auf demselben Browser werden dedupliziert; geräteübergreifend ist keine Personenidentifikation möglich. Heart-Vorschau (?preview=1) erzeugt keine Messdaten.

Nur CEO darf Seiten/Bilder schreiben und Listen lesen. Gäste dürfen veröffentlichte Seiten und deren Bild-Dokumente direkt abrufen. Besucher dürfen nur ihren zufälligen, 128 Bit langen Messdatensatz anlegen und monoton aktualisieren; Antworten sind einmalig. Solche anonymen Browsermessungen können technisch verfälscht werden.

Route: /content-creator/:id; statische Seite ohne Social-Bootstrap oder LifeSkin-Pixel. Fotos sind ausdrücklich als kostenlose Beispiele bezeichnet. Kein automatischer Nachrichtenversand. Erst vollständige Uploads setzen published=true; fehlgeschlagene Uploads bleiben als In Arbeit wiederaufnehmbar.

Deployment: Firestore-Regeln müssen vor Nutzung veröffentlicht werden. Keine Produktionsdeploys aus dieser Aufgabe. Build/Validierung und Veröffentlichung des Quellcodes separat dokumentieren.

Validierung: 22 gezielte Node-Tests für Status/Statistiken, Shell/State, Upload inklusive Wiederholung nach Fehler sowie öffentliche Antwort/Scroll/Vorschau bestehen. Ein bestehender Fehler in tests/heart-view-error-boundary.test.mjs ist auch im unveränderten Ausgangsbaum reproduziert (Lifeskin-Getter im Header). Keine Änderung daran.

Neue Emulator-Sicherheitstests unter tests/rules/content-creator.test.mjs vorbereitet; mangels lokalem Firestore-Emulator nicht ausgeführt. Keine echte mobile Browserprüfung und kein Live-End-to-End-Test. npm run build erfolgreich; erzeugte Social-Bundles ändern sich wegen reservierter Route und gehören zur Änderung. Keine Produktionsdaten verwendet, keine Produktionsdeploys ausgeführt.

## Erweiterung 29.10.2026

Still-Link ?still=1 ist kopierbar und merkt den Modus im Browser. Ja/Nein wird lokal simuliert; keine Besuchs-/Antwortdokumente oder Tracking-Kennungen werden geschrieben. ?still=0 deaktiviert den Modus explizit; ?preview=1 bleibt kompatibel. Bestehender LifeSkin-Still-Modus wird respektiert. Öffentliche Seite initialisiert eine eigene benannte Firebase-App ohne Zugriff auf Heart-Auth-Persistenz. Vorschau öffnet externen Tab; Heart bleibt bestehen, auch beim BFCache-Zurückgehen.

Zweispaltige Galerie auf Mobil und Desktop, optionale Logos, keine Download-Schaltflächen, Bildunterschriften im weißen Kartenbereich. Lokaldetail zählt eindeutige Browserbesuche/Scrolls/Ja/Nein und verwaltet Bilder inklusive Unterschrift, Hinzufügen, atomarem Entfernen und Reihenfolge. Ungespeicherte Unterschriftentwürfe bleiben beim Sortieren bestehen. Maximal 30 Bilder.

/api/content-creator liefert HTML mit OpenGraph/Twitter-Metadaten oder die letzte Bilddatei als JPEG aus. Beide Pfade lesen ausschließlich veröffentlichte Präsentationen, erzeugen keine Statistik und nutzen niemals das Logo als Share-Bild. Reihenfolgeänderung bestimmt das neue Vorschaubild. Externe Dienste können ihre eigenen alten Link-Vorschauen zwischenspeichern.

Prüfung: gezielte Node-Tests für Besuch/Scroll/Antwort/Still, Logo-Ausblendung, Share-HTML/JPEG/Entwürfe sowie CRUD/Reihenfolge/Unterschriften; ESLint der neuen Module und Produktionsbuild. Reales iOS-Zurückgehen kann in dieser Umgebung nicht bestätigt werden.

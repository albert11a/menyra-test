# Content Creator — 29.10.2026

Scope: eigener Heart-Menübereich, Plus-Dialog, Lokalname/Profilbild/Mehrfach-Fotoupload, persönliche albanische Seite, FAQ und Ja/Nein. Heart zeigt eindeutige Seitenzahlen (geöffnet, mindestens 50 % gescrollt, Ja, Nein) und exklusive Filter wie Fälle. Antwort überschreibt Öffnen und Arbeitsstatus im Filter; Daten bleiben erhalten.

Datenvertrag: contentCreatorPages/{id} enthält öffentliche Präsentationsdaten und workflow (working/ready/sent). Bilder liegen einzeln in /images/{imageId}; Browser komprimiert JPEG auf höchstens 700 KB pro Dokument. contentCreatorVisits/{pageId}_{visitorId} enthält nur pageId, opened/scrolled, answer und server timestamps. Besucherkennung je Seite im Browser, keine Kontaktdaten. Mehrfachaufrufe auf demselben Browser werden dedupliziert; geräteübergreifend ist keine Personenidentifikation möglich. Heart-Vorschau (?preview=1) erzeugt keine Messdaten.

Nur CEO darf Seiten/Bilder schreiben und Listen lesen. Gäste dürfen veröffentlichte Seiten und deren Bild-Dokumente direkt abrufen. Besucher dürfen nur ihren zufälligen, 128 Bit langen Messdatensatz anlegen und monoton aktualisieren; Antworten sind einmalig. Solche anonymen Browsermessungen können technisch verfälscht werden.

Route: /content-creator/:id; statische Seite ohne Social-Bootstrap oder LifeSkin-Pixel. Fotos sind ausdrücklich als kostenlose Beispiele bezeichnet. Kein automatischer Nachrichtenversand. Erst vollständige Uploads setzen published=true; fehlgeschlagene Uploads bleiben als In Arbeit wiederaufnehmbar.

Deployment: Firestore-Regeln müssen vor Nutzung veröffentlicht werden. Keine Produktionsdeploys aus dieser Aufgabe. Build/Validierung und Veröffentlichung des Quellcodes separat dokumentieren.

Validierung: 22 gezielte Node-Tests für Status/Statistiken, Shell/State, Upload inklusive Wiederholung nach Fehler sowie öffentliche Antwort/Scroll/Vorschau bestehen. Ein bestehender Fehler in tests/heart-view-error-boundary.test.mjs ist auch im unveränderten Ausgangsbaum reproduziert (Lifeskin-Getter im Header). Keine Änderung daran.

Neue Emulator-Sicherheitstests unter tests/rules/content-creator.test.mjs vorbereitet; mangels lokalem Firestore-Emulator nicht ausgeführt. Keine echte mobile Browserprüfung und kein Live-End-to-End-Test. npm run build erfolgreich; erzeugte Social-Bundles ändern sich wegen reservierter Route und gehören zur Änderung. Keine Produktionsdaten verwendet, keine Produktionsdeploys ausgeführt.

# Kamera und Analysewege — vertiefte Pruefung 2026-09-22

## Umfang und Grundlage

Nach dem zuerst veroeffentlichten WhatsApp-/Uebergabe-Fix: Scan, Stellenfoto, Koerperproblem und Frage bis zur bestaetigten Berichtserstellung pruefen; besonders Kamera-Start, Unterbrechungen und langsames Netz. Grundlage sind AGENTS.md, aktuelle Quellen, vorhandene Regressionstests und der vom Nutzer hochgeladene Performance-Audit. Dessen Chromium-Messungen mit simulierter Kamera belegen keine reale Mobilgeraete-Kompatibilitaet.

## Ergebnisse und Aenderungen

| Bereich | Pruefung / Ergebnis |
| --- | --- |
| Scanstart | Vorhandene Tests fuer Freigabefehler, fehlende API, ausbleibende Antwort, spaet eintreffenden Stream, Constraints-Fallback, langsame Videodaten und wechselnde Aufloesung bestehen. Vorschau wartet auf kurz stabile Bildmasse; das ist keine Garantie gegen hardwareseitigen Autofokus/Belichtung. |
| Scanbetrieb | Laufendes Bild, deaktivierte/stumme/beendete Tracks, Stillstand, Hintergrund und Querformat werden beruecksichtigt. Bestehende Tests fuer Abbruch waehrend JPEG-Kodierung und mehrere aufeinanderfolgende Laeufe bestehen. |
| Stellenfoto | Neuer Waechter erkennt fehlenden Frame-Fortschritt. Nach mehr als zwei Sekunden ohne Fortschritt keine Aufnahme; nach zehn sichtbaren Sekunden Hilfe und Stream-Ende. Hintergrund verbraucht keine Frist; Rueckkehr wartet auf neue Frames. |
| Kamerarueckkehr | BFCache-Rueckkehr zeigt beim Fotoweg einen Neustart, wenn nur eine gestoppte Kamera uebrig ist. Eine bereits aufgenommene Vorschau bleibt erhalten. |
| Speicherarme Geraete | Fehlender Canvas-Kontext, drawImage-/Kodierungsfehler und leere data:,-Ausgaben liefern keinen falschen Fotoerfolg. Canvas-Speicher wird in finally freigegeben. |
| Scan ohne Modell | Quellenpruefung: Kamera startet unabhaengig vom Modell; nach begrenztem Warten bleibt der vorhandene Fallback. Modelle koennen weiterhin Netz/CPU beanspruchen; reale Laufzeiten wurden hier nicht gemessen. |
| Scan / Foto / Koerper / Frage | Tests bestaetigen korrekten Berichtstyp, Fotoanzahl, Nummernmarke und Navigation erst nach Bestaetigung. Bestehende Ablauf-/Formularpruefungen ebenfalls bestanden. |
| Foto-Upload | Fehlgeschlagene Fotos bleiben im Arbeitsspeicher fuer Wiederholung erhalten. Vor Berichtserstellung erneuter Upload mit maximal drei parallelen Fotos; bei weiterem Fehler keine falsche Erfolgsmeldung. |
| Netz / Abgabe | Haengende Requests sind zeitlich begrenzt; Kontaktfehler, Berichtfehler, Retry und Doppeltipp getestet. Keine kuenstliche Warteanimation mehr. Echte Uebertragungszeit bleibt notwendig. |

## Ausgefuehrte Pruefungen

- `node --test tests/lifeskin-*.test.mjs`: 856 bestanden, 0 fehlgeschlagen, 0 uebersprungen.
- Neue Tests in lifeskin-foto-lifecycle.test.mjs sowie Erweiterungen in lifeskin-kamera-lifecycle.test.mjs und lifeskin-uebergabe.test.mjs.
- Echte Anwendungsmethoden mit simulierten DOM-/Kamera-/Netz-/Uhr-Abhaengigkeiten. Keine Produktionsdaten und keine echte Kamera verwendet.
- `npm run build`: erfolgreich; keine getrackten Bundle-Dateien geaendert, daher keine Bundle-Aenderungen zu committen. Bestehende Warnung zu grossen Social-App-Chunks.
- `git diff --check`: erfolgreich.

## Nicht als geprueft ausgeben

Keine echten Mobilgeraete oder Facebook-/Instagram-WebViews getestet. Der lokale agent-browser ist nicht installiert; ein vorheriger Zugriff des Cloud-Browsers auf den lokalen Server war blockiert. Bildschirmgroessen in Node-Tests sind Layout-Rechnungen, keine gerenderten Screenshots. Es gibt keine ehrliche 100%-Freigabe fuer alle alten und neuen Geraete.

Vor einer solchen Produktfreigabe die vier Wege auf mindestens einem aelteren und einem aktuellen iPhone sowie einem schwachen und einem aktuellen Android in Facebook, Instagram und dem Systembrowser pruefen: erste Freigabe, Ablehnung/erneute Freigabe, Front-/Rueckkamera, Appwechsel, Drehen, Zurueck, langsames Netz/Abbruch/Wiederverbindung, Nummer mit Autofill und abschliessende Akte inklusive Fotos. Auch die neue Nummernseite mit offener Tastatur bei 320/375/390 px pruefen.

Restgrenzen: Browser ohne Kamera-API brauchen den vorhandenen Weg ohne Scan bzw. den Systembrowser. Offline kann keine Serverabgabe bestaetigt werden. Ein geloeschter Tab verliert noch nicht gespeicherte Fotos im Arbeitsspeicher; daher fordert die Fehlermeldung auf, die Seite geoeffnet zu lassen. Zeitgrenzen sind Wiederherstellungswege, keine Geschwindigkeitsgarantie. Eine formal akzeptierte Nummer ist nicht automatisch auf WhatsApp erreichbar. Nutzerabbruchraten wurden nicht mit Produktionsdaten gemessen.

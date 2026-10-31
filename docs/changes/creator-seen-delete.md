# Creator: Seen und Business loeschen

Auftrag: Seitenart-Umschalter wieder entfernen (die beiden bereits umgestellten
Shops bleiben Shops). Echte Besuche ueber normale Links verschieben auch Working-
und alte Vorschau-Eintraege nach Seen; Still bleibt ohne Tracking. Archiv und
bestehende Kunden behalten Vorrang. Ein spaeter bewusst gesetztes Ready gilt bis
zum naechsten Besuch.

Ganz unten in jeder Business-Detailansicht: Loeschen-Karte mit ausdruecklicher
Bestaetigung. Nur das CEO-Konto darf den neuen Endpunkt aufrufen. Loeschen
sperrt zuerst die oeffentliche Seite, entfernt dann zugeordnete Besuche,
Warenkoerbe, Bestellungen sowie Bilder/Previews/Originale inkl. Chunks/Displays
in begrenzten, wiederaufnehmbaren Schritten. Das Business-Dokument zuletzt.
Der Loeschfortschritt liegt am Business, nicht in einem vom Client bestimmten
Pfad. Keine Produktionsdaten fuer Tests und kein echtes Business hier loeschen.

Grenze: Bereits auf dem externen oeffentlichen Medien-CDN veroeffentlichte
Dateien haben im vorhandenen Backend keinen sicheren Image-Delete-Endpunkt.
Wie beim bisherigen Paketloeschen werden solche Blob-URLs nicht physisch
widerrufen; Business-Seite, Bestelllinks und gespeicherte Originale werden
entfernt. Die Bestaetigung nennt weiter erreichbare geteilte Bilder explizit.

Auch bereits laufende Besucher-, Warenkorb- und Bestellschreibvorgaenge pruefen
die zuvor gelesene Business-Version atomar beim Commit. Nach dem Loesch-Lock
koennen sie keine verwaisten Datensaetze wieder anlegen. Spaete Push-Abschluesse
bleiben durch die vorhandene Exists-Precondition geschuetzt.

## Validierung

- `node --test tests/*creator*.test.mjs`: 150 bestanden, 0 fehlgeschlagen.
  Deckt normale/Still-Besuche, Seen-Chips, Bestaetigung/Abbruch/Fortsetzung,
  mehrere Loeschstapel (1.353 verknuepfte Datensaetze), alle bekannten
  Foto-Untersammlungen inklusive verwaister Chunks, Pfadgrenzen, CEO-Zugriff,
  Seitensperre und Transaktionsschutz gegen spaete Schreibvorgaenge ab.
- `npm run build`: erfolgreich. Keine Aenderungen an getrackten Bundles,
  folglich keine Bundle-Dateien zu committen. Bestehende Chunk-Warnungen.
- Gezielt ESLint: keine Fehler, eine vorhandene unused-Warnung im Controller.
- `git diff --check`: erfolgreich.
- Kein echtes Business geloescht, keine neuen Produktionsbesuche angelegt.
  Kein Functions-/Rules-Deploy und kein Playwright-/Smoke-Lauf.
- Mobile Darstellung und reale destruktive Ende-zu-Ende-Loeschung nicht geprueft.
  Manuell mit einem ausdruecklich freigegebenen Testbusiness pruefen: normale
  Oeffnung -> Seen, Still -> unveraendert; ganz unten Loeschen -> Abbrechen;
  erneut bestaetigen, bis Seite, Listenzeile und zugeordnete Datensaetze weg sind.

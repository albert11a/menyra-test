# MNYRA Photo Studio V1

Photo Studio ist pro veröffentlichter Creator-Seite in Heart aktivierbar. Die Zuordnung verwendet die bestehende Creator-Seiten-ID. Die Studio-Aufträge erscheinen in derselben Bestellübersicht wie Fotopakete. Daten, Preise, Zugriffsregeln und Medienpfade der beiden Bestellarten sind getrennt.

## Ablauf in Heart

1. Im Business **Photo Studio aktivieren**. Der neue Einstieg erscheint auf dessen Content-Creator-Seite.
2. Unter **Photo Studio** oder **Bestellungen → Photo Studio** den Auftrag öffnen und die Originale herunterladen.
3. Nach der externen Bearbeitung jedes Ergebnis in seinem Foto-Slot speichern. Alle Ergebnisse prüfen und anschließend für Kunden veröffentlichen. Eine neue Version bleibt bis zur Veröffentlichung intern.
4. Den tatsächlichen Zahlungseingang mit Beleg oder Referenz der Sammelabrechnung erfassen. Derselbe Beleg kann für die dazugehörigen Studio-Aufträge verwendet werden.
5. Den Download separat freigeben und den Auftrag abschließen. Eine Stornierung in Heart ist bei offenen Zahlungen mit Begründung möglich. Erstattungen bereits bezahlter Aufträge liegen außerhalb dieses Ablaufs.

Die Kundenansicht aktualisiert sich bei geöffnetem Fenster regelmäßig. Der Zugangslink ist vertraulich. Die Bestellnummer allein berechtigt zu keinem Zugriff. Die optional erfasste E-Mail-Adresse ist im Heart-Auftrag sichtbar. In V1 erfolgt die Statusmitteilung über die Bestellansicht.

## Einrichtung vor der Aktivierung

- Eigenen R2-Bucket für Photo Studio anlegen. R2.dev und öffentliche Custom Domains für diesen Bucket deaktiviert lassen. Zugangsschlüssel auf diesen Bucket beschränken.
- In Vercel ausschließlich serverseitig `PHOTO_STUDIO_R2_ACCOUNT`, `PHOTO_STUDIO_R2_BUCKET`, `PHOTO_STUDIO_R2_ACCESS_KEY` und `PHOTO_STUDIO_R2_SECRET_KEY` setzen. `PHOTO_STUDIO_AVAILABLE` erst nach Einrichtung und Abnahme auf `true` setzen. Heart-Schalter sind standardmäßig aus.
- CORS im privaten Bucket nur für die tatsächlichen Creator- und Heart-Web-Ursprünge freigeben. Methoden `PUT`, `GET`, `HEAD`. Erlaubte Request-Header `Content-Type` und `If-None-Match`. Staging-Uploads signieren außerdem die exakte vom Browser gesendete Content-Length.
- R2-Lifecycle einrichten. `staging/` und `prepared/` nach zwei Tagen löschen. `archives/` und `exports/` nach zwei Tagen löschen. `assets/` nach 180 Tagen löschen. Unvollständige Multipart-Uploads automatisch abbrechen lassen. Die Kundenansicht und Heart sperren Medien 175 Tage nach Bestelldatum. Bei vorzeitigen Löschanfragen können autorisierte Betreiber die Auftragspräfixe im privaten Bucket löschen und die personenbezogenen Metadaten nach der geltenden Aufbewahrungsregel bereinigen.
- Firestore-Regeln vor Aktivierung ausrollen. TTL für das Timestamp-Feld `expireAt` in `photoStudioUploads` und `photoStudioLimits` konfigurieren. Der Server prüft Ablaufzeiten unabhängig von der tatsächlichen TTL-Löschung. Das bestehende Creator-Servicekonto muss die neuen Collections lesen und schreiben können.
- Bildbearbeitung nur mit dafür freigegebenen Werkzeugen durchführen. Die Vorschau enthält keine EXIF-Standortdaten. Originale und bearbeitete Master bleiben bytegetreu und können solche Metadaten weiterhin enthalten.

Uploads erhalten ein kurzlebiges PUT-Recht für einen einzelnen unveränderlichen Staging-Key. Die App prüft Bildformat, Dekodierung und Größe vor der Bestellung. Vorschauen werden separat ausgerichtet und erzeugt. Vor der Zahlungs- und Downloadfreigabe ist die Kundenfassung des Ergebnisses sichtbar mit MNYRA PREVIEW markiert. Master- und ZIP-Links werden serverseitig nach Prüfung ausgestellt und laufen nach 90 Sekunden ab. Vorab signierte Vorschau-URLs laufen nach 15 Minuten ab. Social-Exporte enthalten das gesamte Bild und füllen abweichende Seitenverhältnisse mit einem neutralen Rand aus.

## Abnahme

- `npm run build`, `npm run test:unit`, `npm run test:functions` und `npm run arch:check`.
- `npx firebase emulators:exec --only firestore --project mnyra-local 'npm run test:rules'`.
- `npm run test:e2e -- photo-studio.spec.ts` für Chromium am Desktop, das Android-Profil und das iPhone-WebKit-Profil.
- In einer Staging-Umgebung mit privatem R2 auf physischen iPhone- und Android-Geräten prüfen. Je 1, 5 und 20 Bilder, HEIC und Display P3, schwaches Mobilnetz, unterbrochene Uploads, Reload nach Bestellbestätigung, Vergleich Hoch- und Querformat, Download, ZIP und iOS-Teilen. Vor der Aktivierung gegenprüfen, dass Direktzugriff auf einen R2-Key und vorzeitige Downloads scheitern.
- Bestehende Fotopakete, Shop-Checkout, `Blerjet tuaja`, Gratisbilder, Paket-Reihenfolge, Foto-Seen, Wasserzeichen, Video-Vorschauen und bestehende Zahlungsfreigaben in Staging mitprüfen.

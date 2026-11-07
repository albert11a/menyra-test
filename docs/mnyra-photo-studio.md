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

- Photo Studio nutzt denselben Media-Ticket-Dienst, denselben `/image/upload`-Endpunkt und denselben bestehenden R2-Bucket wie der Shop. Für Studio werden zwei technische Firebase-Identitäten mit Zugriff auf ihren jeweiligen Medienpfad verwendet. Sie beziehen das vorhandene Medienticket serverseitig über das bestehende Creator-Dienstkonto. Die laufende Worker-Version und die vorhandenen Bindings reichen aus.
- Der Studio-Server verschlüsselt alle Dateiteile vor dem Upload. In Firestore stehen die R2-Referenzen und Metadaten. Berechtigte Vorschauen und Downloads werden über die Studio-API aus R2 gelesen und gestreamt. Die öffentlichen CDN-Links enthalten ausschließlich verschlüsselte Bytes.
- Den Verschlüsselungsschlüssel vor dem ersten Upload festlegen. Optional dient `PHOTO_STUDIO_ENCRYPTION_KEY` als dauerhaftes Schlüsselmaterial. Ohne diese Einstellung wird das bestehende Creator-Dienstkonto als Schlüsselquelle verwendet. Bei einer Rotation des effektiven Schlüssels zuerst die vorhandenen Studio-Dateien migrieren.
- R2-Lifecycle im bestehenden Bucket auf die beiden Studio-Präfixe begrenzen. `social/mnyra-studio-temp/` nach zwei Tagen und `social/mnyra-studio-assets/` nach 180 Tagen löschen. Kundenansicht und Heart sperren Medien 175 Tage nach Bestelldatum.
- Firestore-Regeln vor Aktivierung ausrollen. TTL für das Timestamp-Feld `expireAt` in `photoStudioUploads`, `photoStudioLimits` und `photoStudioMedia` konfigurieren. Das bestehende Creator-Servicekonto muss die Collections lesen und schreiben können. Der optionale Schalter `PHOTO_STUDIO_AVAILABLE=false` pausiert Uploads und Aktivierung.
- Bildbearbeitung nur mit dafür freigegebenen Werkzeugen durchführen. Die Vorschau enthält keine EXIF-Standortdaten. Originale und bearbeitete Master bleiben bytegetreu und können solche Metadaten weiterhin enthalten.

Uploads erhalten eine kurzlebige Upload-Freigabe für einen einzelnen unveränderlichen Staging-Key. Der Browser sendet große Dateien in wiederholbaren Teilen. Die App prüft Bildformat, Dekodierung und Größe vor der Bestellung. Vorschauen werden separat ausgerichtet und erzeugt. Vor der Zahlungs- und Downloadfreigabe ist die Kundenfassung des Ergebnisses sichtbar mit MNYRA PREVIEW markiert. Master- und ZIP-Links werden serverseitig nach Prüfung ausgestellt und laufen nach 90 Sekunden ab. Vorab signierte Vorschau-URLs laufen nach 15 Minuten ab. Social-Exporte enthalten das gesamte Bild und füllen abweichende Seitenverhältnisse mit einem neutralen Rand aus.

## Abnahme

- `npm run build`, `npm run test:unit`, `npm run test:functions` und `npm run arch:check`.
- `npx firebase emulators:exec --only firestore --project mnyra-local 'npm run test:rules'`.
- `npm run test:e2e -- photo-studio.spec.ts` für Chromium am Desktop, das Android-Profil und das iPhone-WebKit-Profil.
- In einer Staging-Umgebung mit der Shop-R2-Anbindung auf physischen iPhone- und Android-Geräten prüfen. Je 1, 5 und 20 Bilder, HEIC und Display P3, schwaches Mobilnetz, unterbrochene Uploads, Reload nach Bestellbestätigung, Vergleich Hoch- und Querformat, Download, ZIP und iOS-Teilen. Vor der Aktivierung gegenprüfen, dass Direktzugriff auf einen R2-Key und vorzeitige Downloads scheitern.
- Bestehende Fotopakete, Shop-Checkout, `Blerjet tuaja`, Gratisbilder, Paket-Reihenfolge, Foto-Seen, Wasserzeichen, Video-Vorschauen und bestehende Zahlungsfreigaben in Staging mitprüfen.

# Critical Write Flow Inventory

Stand: 2026-03-23

Dieses Dokument ist die Basis fuer Tickets `03`, `04`, `13`, `14` und die spaetere Alarm-Matrix. Es listet die aktuell wichtigsten produktiven Schreibpfade mit Ziel, Risiko, Idempotenz-Status und Alarmbedarf.

## Bewertungsskala

- `Idempotenz`: `Nein`, `Teilweise`, `Ja`
- `Alarmbedarf`: `Hoch`, `Mittel`, `Niedrig`
- `Risiko`: kurze Beurteilung der aktuellen Bruch- oder Dubletten-Gefahr

## Inventar

| Flow | Einstieg / Datei | Hauptschreibpfade | Idempotenz | Alarmbedarf | Risiko / Hinweis |
| --- | --- | --- | --- | --- | --- |
| Gast-Checkout / Bestellung absenden | `apps/menyra-social/core/orders/orders-runtime-controller.js` | `restaurants/{restaurantId}/orders/{orderId}` und Folgestatus | Nein | Hoch | Kritischster Write-Flow. Doppelklicks / Retry koennen Mehrfachbestellungen erzeugen, solange kein serverseitiger Idempotency-Key existiert. |
| Waiter-Statuswechsel | `apps/waiter/waiter-app.js` | `restaurants/{restaurantId}/orders/{orderId}` | Teilweise | Hoch | Einzelne Statuswrites sind simpel, aber ohne serverseitige Guardrails koennen Race Conditions oder ungewollte Rueckschritte auftreten. |
| Waiter-Notification-Fanout | `functions/index.js` -> `notifyWaiterOnRestaurantOrderCreate` | `users/{uid}/notifications/restaurant_order_{orderId}` | Teilweise | Hoch | Dokument-ID dedupliziert pro Empfaenger, aber Folgefehler muessen alarmiert werden, weil sonst Bestellungen still ankommen ohne Signal. |
| Push-Notifications fuer User | `functions/index.js` -> `sendWebPushOnNotificationCreate` | FCM-Dispatch plus `users/{userId}/devices/{deviceId}` Cleanup | Teilweise | Hoch | Fehler landen aktuell nur in Function-Logs. Token-Cleanup ist dedupliziert, Delivery-Ausfaelle brauchen Alarmierung. |
| Social-Post/Story Upload | `apps/menyra-social/core/media/media-upload-runtime-controller.js` | `restaurants/{rid}/socialPosts/{postId}`, `socialFeed/{postId}`, Story-Media | Teilweise | Mittel | Feed-Spiegelung ist mehrstufig. Upload/Publish kann in halbfertigen Zustand kippen, wenn ein Schritt nach dem ersten Write fehlschlaegt. |
| Media-Ticket-Ausgabe | `functions/index.js` -> `issueMediaActionTicket` | kein Firestore-Write, aber kritischer Schreibschutz fuer Medienaktionen | Teilweise | Mittel | Kein direkter DB-Write, aber sicherheitskritischer Gatekeeper fuer Upload/Delete. Ausfaelle blockieren Content-Erstellung. |
| Lead speichern | `apps/menyra-social/core/leads/lead-save-utils.js` | `restaurants/{restaurantId}`, `leads/{leadId}` plus optional Auth-User | Nein | Hoch | Mehrfachspeichern kann doppelte Restaurant-/Lead-Anlage oder inkonsistente Verknuepfungen erzeugen. Vor diesem Ticket wurde optional still ein Default-Login erstellt. |
| Lead -> Kunde umwandeln | `apps/menyra-social/core/leads/lead-convert-utils.js` | `restaurants/{restaurantId}`, `leads/{leadId}` | Nein | Hoch | Kritischer CRM-Statuswechsel. Mehrfachausloesung kann Folgecounts, Owner-Meta und Kundenzustand verschieben. |
| Kunde speichern | `apps/menyra-social/core/crm/customer-save-utils.js` | `restaurants/{restaurantId}`, oeffentliche Restaurant-Meta | Teilweise | Mittel | Hauptsaechlich Merge-Writes, aber kein harter Schutz gegen parallele Konflikte oder doppelte Updates. |
| CEO-Staff speichern | `apps/menyra-social/core/crm/staff-save-utils.js` | `users/{uid}`, `superadmins/{uid}` | Teilweise | Mittel | Rechteaenderungen sind kritisch. Fehler muessen sichtbar sein, damit keine halb gespeicherten Staff-Profile stehen bleiben. |
| Follow / Unfollow | `apps/menyra-social/core/follow/follow-runtime-controller.js` | Follow-Records und Notifications unter `users/*` | Teilweise | Mittel | Wiederholte Requests koennen bei schlechter Netzlage doppelte Benachrichtigungen oder Zaehlerdrift erzeugen. |
| Likes / Kommentare / Social Engagement | `apps/menyra-social/core/profile/social-engagement-runtime-controller.js` | Post-, Kommentar-, Like- und Counter-Dokumente | Teilweise | Mittel | Typischer Hotspot-Bereich. Counter-/Subcollection-Writes brauchen spaeter Hotspot- und Kostenmessung. |
| Chat senden / Read-Sync | `apps/menyra-social/core/chat/chat-runtime-cluster.js` | Chat-Threads, Messages, Read-States | Teilweise | Mittel | Mehrere Writes pro Nutzeraktion. Ohne konsequente Dedupe-/Retry-Strategie drohen Dubletten oder falsche Read-States. |
| Push-Device-Registrierung Social / Waiter | `apps/menyra-social/core/push/*`, `apps/waiter/waiter-app.js` | `users/{uid}/devices/{deviceId}` | Teilweise | Mittel | Wiederholte Writes sind meist merge-faehig, aber Fehlerraten muessen fuer Push-Ausfaelle sichtbar werden. |
| Menu / Focus / Table-QR Publish | `apps/menyra-social/core/menu/*` | `restaurants/{rid}/menuItems/*`, `restaurants/{rid}/public/meta`, `restaurants/{rid}/public/offers` | Teilweise | Mittel | Oeffentliche Sichtbarkeit haengt an mehreren Writes. Fehler koennen Business-Menues inkonsistent oeffentlich machen. |
| Notification-Write aus Client | `apps/menyra-social/core/notifications/notification-support-runtime-controller.js` | `users/{uid}/notifications/{notificationId}` | Teilweise | Mittel | Clientseitige Writes sind simpel, aber Fehler waren bisher nur `console.error`. Zentraler Reporter ist jetzt Voraussetzung fuer spaetere Alarmierung. |

## Erste Prioritaeten aus diesem Inventar

1. Order-Flow serverseitig idempotent machen.
2. Order-/Waiter-/Push-Fehler aktiv alarmieren.
3. CRM-Lead- und Convert-Flows mit klaren Fehlermeldungen und Dedupe-Haertung versehen.
4. Social-/Engagement- und Chat-Writes auf Hotspots und Kosten messen.
5. Menu-/Focus-Publish getrennt von nichtkritischen Folgeaktionen beobachten.

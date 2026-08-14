# Bilder der Kennzahl-Reihe im Business-Panel

Zwei Karten der Reihe unter der Begruessung tragen ein festes Bild. Es gehoert
zur Marke, nicht zu den Daten eines Lokals - deshalb liegt es hier im Repo und
nicht in Firestore.

| Datei           | Karte             | Motiv                                    |
| --------------- | ----------------- | ---------------------------------------- |
| `menu-scan.jpg` | Menü-Aufrufe heute | Gast am Tisch mit der Menue-Ansicht im Telefon |
| `qr-stand.jpg`  | QR-Scans heute     | Der Acryl-Aufsteller mit dem QR-Code      |

Die Pfade stehen in `core/dashboard/dashboard-view-controller.js`
(`DASHBOARD_METRIC_ASSETS`).

Masse: die Karten sind rund 140 x 208 px gross und werden mit `object-fit:
cover` gefuellt. 420 x 624 px (3x) reichen also vollkommen; alles darueber ist
nur Ladezeit. Das Motiv sollte in der oberen Haelfte sitzen - die untere traegt
den Verlauf mit Beschriftung und Zahl.

Fehlt eine Datei, faellt die Karte auf ihre ruhige dunkle Flaeche mit Symbol
zurueck. Kaputt sieht dabei nichts aus, das Bild fehlt nur.

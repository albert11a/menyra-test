# Bilder der Kennzahl-Reihe im Business-Panel

Zwei Karten der Reihe unter der Begruessung tragen ein festes Bild. Es gehoert
zur Marke, nicht zu den Daten eines Lokals - deshalb liegt es hier im Repo und
nicht in Firestore.

| Datei           | Karte              | Motiv                                          |
| --------------- | ------------------ | ---------------------------------------------- |
| `menu-scan.jpg` | Menü-Aufrufe heute | Gast am Tisch mit der Menue-Ansicht im Telefon |
| `qr-stand.jpg`  | QR-Scans heute     | Der Acryl-Aufsteller mit dem QR-Code           |

Die Pfade stehen in `core/dashboard/dashboard-view-controller.js`
(`DASHBOARD_METRIC_ASSETS`).

## Masse

Beide Dateien sind 420 x 684 px - dreifach die Kartengroesse (140 x 228) und
damit auf jedem Display scharf. Mehr waere nur Ladezeit.

Wichtig beim Zuschneiden: das untere Drittel der Karte liegt unter einer
geschlossenen dunklen Flaeche, auf der Beschriftung und Zahl stehen. Das Motiv
gehoert also in die oberen zwei Drittel - beim Aufsteller sitzt der QR-Code
deshalb bei rund 55 Prozent Hoehe, nicht mittig.

Ersetzt man ein Bild, reicht dieselbe Groesse und dasselbe Seitenverhaeltnis
(0,614). Fehlt eine Datei, faellt die Karte auf ihre ruhige dunkle Flaeche mit
Symbol zurueck - kaputt sieht dabei nichts aus, das Bild fehlt nur.

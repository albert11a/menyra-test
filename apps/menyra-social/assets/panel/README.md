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

Beide Dateien sind 420 x 430 px - dreifach das Bildfenster der Karte (rund
140 x 140) und damit auf jedem Display scharf.

Die Zahl ist kein Zufall: alle vier Karten der Reihe zeigen ihr Bild in genau
demselben Fenster, damit die Reihe eine Linie haelt. Was nicht in dieses
Verhaeltnis passt, wird von der Karte beschnitten - ein hochformatiges Bild
oben und unten (die Breite bleibt ganz), ein sehr flaches an den Seiten. Die
beiden Dateien hier sind bereits auf 420 x 430 zugeschnitten und werden
deshalb gar nicht mehr angetastet.

Unter dem Fenster loest sich die Unterkante ins Weiss auf, darauf stehen
Beschriftung und Zahl. Das Motiv gehoert also mittig ins Bild, nicht an den
unteren Rand.

Ersetzt man ein Bild, ist 420 x 430 die einzige Vorgabe. Fehlt eine Datei,
faellt die Karte auf eine ruhige Flaeche mit Symbol zurueck - in derselben
Fenstergroesse, damit nichts springt.

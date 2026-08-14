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

Beide Dateien sind 420 px breit - dreifach die Kartenbreite (140) und damit auf
jedem Display scharf. Die Hoehe ist NICHT festgelegt: sie ergibt sich aus dem
Bild (`qr-stand.jpg` 420 x 548, `menu-scan.jpg` 420 x 349).

Das ist Absicht. Die Karte zeigt das Bild in voller Breite und schneidet nichts
ab - ein Seitenverhaeltnis vorzugeben hiesse, jedes Bild in eine Form zu
zwingen, in die es nicht gehoert. Das Bild steht oben in der Karte, seine
Unterkante loest sich weich auf, darunter traegt die dunkle Flaeche
Beschriftung und Zahl.

Ein neues Bild braucht also nur eines: 420 px Breite. Was hoeher ist als die
Karte (228 px, also 684 px in dieser Aufloesung), laeuft unten aus dem Bild -
das Motiv gehoert deshalb in die obere Haelfte.

Fehlt eine Datei, faellt die Karte auf ihre ruhige dunkle Flaeche mit Symbol
zurueck - kaputt sieht dabei nichts aus, das Bild fehlt nur.

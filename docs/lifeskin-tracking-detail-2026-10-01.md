# LifeSkin: aktueller Verlauf der Einzelakte

Umfang: Tracking beim Oeffnen und Aktualisieren einer Heart-Einzelakte
direkt vom Server lesen. Anlass: fehlender Analyse-Verlauf im angezeigten
Fall LS-0110-2V27X; dessen Produktionsdaten wurden nicht gelesen.

Pfad-Schreibvorgaenge aendern `updatedAt` absichtlich nicht. Der inkrementelle
Abgleich filtert nach diesem Feld, und die breite Live-Abfrage ignoriert reine
Pfad-Aenderungen. Deshalb kann eine bereits geladene Akte alte Daten zeigen.

Die Akte liest nun genau ihr Sitzungsdokument mit `getDocFromServer`, auch
wenn ihre Fotos schon im Speicher liegen. Der Aktualisieren-Knopf liest die
offene Akte ebenfalls direkt. Ein Lesefehler behaelt den vorhandenen Stand
und zeigt eine Fehlermeldung. Spaetere Live-/Abgleich-Daten duerfen bereits
gelesene Pfad-Ereignisse nicht entfernen; beim Zusammenfuehren bleiben sie
erhalten. Die neuere Sitzung entscheidet weiter ueber alle anderen Felder.

Keine Aenderung an Pixel, Tracking-Schreibvorgaengen, Firestore-Regeln,
Routen oder Gestaltung. Kein zusaetzlicher dauerhafter Listener.

Pruefung: 129 Tests bestanden, darunter neue Regressionen fuer unveraendertes
updatedAt, spaetere Live-Daten, direktes Serverlesen, Wieder-Oeffnen mit
gespeicherten Fotos und manuellen Abgleich; bestehende Tracking-, Heart-,
Zaehlungs- und Pixel-Sperrtests bestanden ebenfalls.
`npm run build` bestanden. Keine getrackten Bundle-Dateien geaendert.
Mobile-/Produktionspruefung wurde nicht ausgefuehrt.

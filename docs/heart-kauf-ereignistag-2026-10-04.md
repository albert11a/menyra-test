# Heart: Kaufkennzahlen nach Ereignistag

Auftrag: Warenkoerbe, Kassen und Kaufabbrueche dem Tag der Kaufhandlung
zuordnen, auch wenn die Analyse an einem frueheren Tag begonnen wurde.
Bestellungen/Umsatz verwenden bereits den Bestelltag. Landing/Analyse-
Kohorten und deren Quoten bleiben getrennt von diesen Kaufhandlungen.

Vor Umsetzung festgelegt: vorhandene Kaufknopf-/Klickpfad-/Kassenzeiten
verwenden; neue Shop-Warenkoerbe erhalten eine Zeit unter `timings.korbAt`.
Altdaten ohne Ereigniszeit behalten ihren Sitzungstag als Schaetzung.
Keine Pixel-/CAPI-, Regel-, Routen- oder Produktionsdaten-Aenderung.

Validierung: 38 Tests aus heart-kauf-ereignistag, heart-statistik-audit,
heart-lifeskin-nachfassen, lifeskin-meldung-korb-kasse und
lifeskin-pixel-sperre bestanden. Speicherung mit Blattmaske getestet;
spaetere Korbwertupdates verschieben das Ereignis nicht.
`npm run build` bestanden; getrackte Bundle-Dateien unveraendert.
Kein mobiler Browsercheck; keine Layoutaenderung. Live-Zahlen nicht
abgeglichen, da Heart hier eine Anmeldung verlangt.

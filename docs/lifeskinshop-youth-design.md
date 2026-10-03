# LifeSkin Shop – freigegebene Gestaltung, 3. Oktober 2026

Umfang: den am 3. Oktober freigegebenen Mint-/Schwarz-Entwurf für /lifeskinshop übernehmen, vorhandene Heart-Fälle zum Wischen anzeigen, Texte und Abstände vereinfachen. Warenkorb → Kasse, Analyse, Preisquelle, Bestellungen und Pixel bleiben erhalten. Keine Produktions-Testbestellungen oder Firebase-Deploys.

Die Galerie verwendet die vorhandene Heart-Fallauswahl für den Shop und erhält Pfeile, Tastaturnavigation sowie eine Fallanzeige. Anwendung und Inhaltsstoffe bleiben ausklappbar. Zusätzliche Kundenmedien bleiben über einen Aufklapper erreichbar. Preisangaben verwenden die bisherigen data-preis-Hooks. Die Analyse startet weiterhin über den bestehenden data-ls-start-Knopf innerhalb des Shop-Wegs.

Bei fehlender Heart-Antwort zeigt die Galerie zusätzlich zum bisherigen Fall die beiden vorhandenen Acne-Fälle r1/r2; fremde Pigment- oder Mehrprodukt-Fälle werden nicht als Acne-Duo-Nachweis ergänzt. Die Heart-Auswahl hat weiterhin Vorrang.

Prüfung: angeforderte Renderansichten bei 320/390/430/768/1440 px ohne Überlauf oder JavaScript-Fehler, Galerie-Wechsel per Pfeil, echter Shop-Weg Warenkorb → Kasse mit AddToCart/InitiateCheckout gegen lokale Testdaten ohne Bestellabschluss. 55/56 Shop-/Weg-/Pixel-Tests erfolgreich; der verbleibende Fotoanleitungs-Test betrifft die unveränderte /lifeskin-Landingpage und scheitert ebenfalls auf Ausgangscommit 55d42ae. Alle 20 Shop-/Set-/Pixel-Tests erfolgreich. npm run build erfolgreich, keine Änderungen an getrackten Bundles. Pixel-Dateien, Konfiguration und Aufrufe unverändert.

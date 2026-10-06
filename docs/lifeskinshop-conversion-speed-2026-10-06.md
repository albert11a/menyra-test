# LifeSkin Shop: Preis, Kaufweg und Ladeprioritaet

Status: IMPLEMENTED, 2026-10-06. Inhaber autorisiert Commit/Push nach main am 06.10.2026.

Albert autorisiert vier Aenderungen: den bestaetigten Shop-Sets-Preis von 19 EUR sofort anzeigen; nach der bestehenden Warenkorb-Aktion direkt die bestehende Kasse zeigen; auf Mobile Kaufbutton/Preis vor die grossen Produktbilder setzen; Preis und erste Vorher/Nachher-Bilder unabhaengig von Zusatzmedien laden. Schlechte Verbindungen und alte Telefone beruecksichtigen.

Die bestehenden Aufrufe fuer AddToCart, InitiateCheckout, Purchase, Lead und CAPI bleiben unveraendert. Der Kaufbutton legt weiterhin das komplette Duo in den Korb und ruft die unveraenderte Warenkorb-Meldung auf. Danach wird die bestehende Kasse geoeffnet: ihr vorhandenes InitiateCheckout folgt dadurch unmittelbar auf AddToCart statt auf einen zweiten Klick. Keine neuen Ereignisse und keine Aenderung der Pixel-Sperre.

Albert hat den Shop-Sets-Preis fuer "Seti kundër akneve" (LF ACNE + LF MOISTUR) mit 19 EUR bestaetigt und ausdruecklich sofortige Anzeige verlangt. HTML und lokales Shop-Angebot enthalten deshalb 19 EUR, ohne Ladenachricht oder Kauf-Sperre. Derselbe Betrag gilt sofort fuer Warenkorb, Kasse und Bestellung; alte lokal gespeicherte Preise werden ignoriert. Heart aktualisiert Shop-Sets im Hintergrund. Netzwerkfehler, ungueltige Antwort oder 404 behalten das veroeffentlichte Angebot. Eine gueltige neue Konfiguration aktualisiert auch eine bereits offene Kasse. Falls der Preis in Heart spaeter geaendert wird, muss der veroeffentlichte Anfangspreis ebenfalls angepasst werden, damit Erstbesucher ohne Antwort weiterhin denselben Betrag sehen.
Preis, Fallindex und erstes Fallbild laden unabhaengig. Kundenbilder und Videos laden sofort unabhaengig; Produktdaten und Markenbilder laden bei Sichtnaehe. Kamera, Analyse, Bestellpersistenz und andere Seiten bleiben im bestehenden Ablauf.

Validierung:

- 73/73 Tests bestanden: neue Preis-/Checkout-/Ladefaelle sowie bestehende Shop-, Pixel-Schutz-, Bestellpersistenz-, Warenkorb-/Kassenmeldung- und SkinReact-Tests.
- Simulierte langsame/offline/haengende Reads, alter Preis im lokalen Speicher, falsche/fehlende Konfiguration und Hintergrundaktualisierung und fehlender AbortController. Gleiche Duo-Produkte, gleicher aktueller Preis und AddToCart vor InitiateCheckout; bestaetigter Kauf weiterhin erst nach erfolgreichem Speichern.
- `tests/lifeskin-shop-weg.test.mjs`: 36/39 bestanden. Dieselben drei Fehler bereits unveraendert auf Basiscommit `a11b7b0d3cb692192b509850791fc4f58260991d`: alte Fotokonfigurations-Erwartung, alte Still-URL und alte Auswahltexte. Nicht fuer diese Aenderung angepasst.
- `npm run build` erfolgreich; bestehende Warnung ueber grosse Chunks. Keine getrackten Bundle-Dateien veraendert, daher keine Bundle-Dateien zu committen.
- Syntax- und Diff-Check bestanden. Kein Pixel-Schutztest geaendert.
- Kein echter Handy-/Browser-Test: lokaler Vorschauserver war nicht erreichbar. Mobile-Reihenfolge ist im CSS geprueft; reale Darstellung und Zeitmessungen auf schwacher Verbindung bleiben vor Freigabe zu pruefen. Kein Playwright/Smoke-Run und keine Produktions-Testbestellung.

Warum diese Aenderungen: Der direkt veroeffentlichte 19-EUR-Preis verhindert den belegten 39-auf-19-Euro-Sprung und benoetigt keine Heart-Antwort; der direkte Kassenweg entfernt einen zusaetzlichen Klick nach derselben Warenkorbaktion; der mobile Kaufbereich braucht kein Vorbeiscrollen an den grossen Bildern; unabhaengige und spaetere Zusatz-Reads vermeiden das bisherige Warten auf fremde Medien. Daraus folgt keine Garantie fuer mehr Bestellungen. Die Wirkung muss anhand vergleichbarer Besucherquellen und tatsaechlicher Bestellungen gemessen werden. InitiateCheckout beginnt durch den direkten Weg frueher; diese Quote ist daher nicht direkt mit dem alten zweistufigen Weg vergleichbar.

Hotfix 06.10.2026: Die leere Kunden-Galerie hat in shop-youth.css `:empty { display:none }`. Ein IntersectionObserver auf diesem Element konnte das erstmalige Laden nie ausloesen. Die Medienanfrage startet wieder unmittelbar und unabhaengig von Preis/Faellen. Regressionstest laesst alle Observer stumm, prueft sofortigen Request, Preis trotz haengender Medien und anschliessendes Rendering von Foto und Video-Poster samt Video-Adresse.

UI-Anpassung 06.10.2026: Vom Inhaber freigegeben: Hero und Seitentitel "Largo aknet. Shijoje lekuren.". Kaufbuttons (Duo, Sticky, Medienblatt und Bestellabschluss) einheitlich Petrol #08686c mit weisser Schrift; Scan als heller zweiter Weg. HTML/CSS-Aenderung, kein Tracking-/Medien-/Preiscode geaendert. Build und bestehende 73 relevante Tests erfolgreich; keine getrackten Bundles veraendert. Kein echter Handytest.

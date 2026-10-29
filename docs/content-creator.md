# Content Creator — 29.10.2026

Scope: eigener Heart-Menübereich, Plus-Dialog, Lokalname/Profilbild/Mehrfach-Fotoupload, persönliche albanische Seite, FAQ und Ja/Nein. Heart zeigt eindeutige Seitenzahlen (geöffnet, mindestens 50 % gescrollt, Ja, Nein) und exklusive Filter wie Fälle. Antwort überschreibt Öffnen und Arbeitsstatus im Filter; Daten bleiben erhalten.

Datenvertrag: contentCreatorPages/{id} enthält öffentliche Präsentationsdaten und workflow (working/ready/sent). Bilder liegen einzeln in /images/{imageId}; Browser komprimiert JPEG auf höchstens 700 KB pro Dokument. contentCreatorVisits/{pageId}_{visitorId} enthält nur pageId, opened/scrolled, answer und server timestamps. Besucherkennung je Seite im Browser, keine Kontaktdaten. Mehrfachaufrufe auf demselben Browser werden dedupliziert; geräteübergreifend ist keine Personenidentifikation möglich. Heart-Vorschau (?preview=1) erzeugt keine Messdaten.

Nur CEO darf Seiten/Bilder schreiben und Listen lesen. Gäste dürfen veröffentlichte Seiten und deren Bild-Dokumente direkt abrufen. Besucher dürfen nur ihren zufälligen, 128 Bit langen Messdatensatz anlegen und monoton aktualisieren; Antworten sind einmalig. Solche anonymen Browsermessungen können technisch verfälscht werden.

Route: /content-creator/:id; statische Seite ohne Social-Bootstrap oder LifeSkin-Pixel. Fotos sind ausdrücklich als kostenlose Beispiele bezeichnet. Kein automatischer Nachrichtenversand. Erst vollständige Uploads setzen published=true; fehlgeschlagene Uploads bleiben als In Arbeit wiederaufnehmbar.

Deployment: Firestore-Regeln müssen vor Nutzung veröffentlicht werden. Keine Produktionsdeploys aus dieser Aufgabe. Build/Validierung und Veröffentlichung des Quellcodes separat dokumentieren.

Validierung: 22 gezielte Node-Tests für Status/Statistiken, Shell/State, Upload inklusive Wiederholung nach Fehler sowie öffentliche Antwort/Scroll/Vorschau bestehen. Ein bestehender Fehler in tests/heart-view-error-boundary.test.mjs ist auch im unveränderten Ausgangsbaum reproduziert (Lifeskin-Getter im Header). Keine Änderung daran.

Neue Emulator-Sicherheitstests unter tests/rules/content-creator.test.mjs vorbereitet; mangels lokalem Firestore-Emulator nicht ausgeführt. Keine echte mobile Browserprüfung und kein Live-End-to-End-Test. npm run build erfolgreich; erzeugte Social-Bundles ändern sich wegen reservierter Route und gehören zur Änderung. Keine Produktionsdaten verwendet, keine Produktionsdeploys ausgeführt.

## Erweiterung 29.10.2026

Still-Link ?still=1 ist kopierbar und merkt den Modus im Browser. Ja/Nein wird lokal simuliert; keine Besuchs-/Antwortdokumente oder Tracking-Kennungen werden geschrieben. ?still=0 deaktiviert den Modus explizit; ?preview=1 bleibt kompatibel. Bestehender LifeSkin-Still-Modus wird respektiert. Öffentliche Seite initialisiert eine eigene benannte Firebase-App ohne Zugriff auf Heart-Auth-Persistenz. Vorschau öffnet externen Tab; Heart bleibt bestehen, auch beim BFCache-Zurückgehen.

Zweispaltige Galerie auf Mobil und Desktop, optionale Logos, keine Download-Schaltflächen, Bildunterschriften im weißen Kartenbereich. Lokaldetail zählt eindeutige Browserbesuche/Scrolls/Ja/Nein und verwaltet Bilder inklusive Unterschrift, Hinzufügen, atomarem Entfernen und Reihenfolge. Ungespeicherte Unterschriftentwürfe bleiben beim Sortieren bestehen. Maximal 30 Bilder.

/api/content-creator liefert HTML mit OpenGraph/Twitter-Metadaten oder die letzte Bilddatei als JPEG aus. Beide Pfade lesen ausschließlich veröffentlichte Präsentationen, erzeugen keine Statistik und nutzen niemals das Logo als Share-Bild. Reihenfolgeänderung bestimmt das neue Vorschaubild. Externe Dienste können ihre eigenen alten Link-Vorschauen zwischenspeichern.

Prüfung: gezielte Node-Tests für Besuch/Scroll/Antwort/Still, Logo-Ausblendung, Share-HTML/JPEG/Entwürfe sowie CRUD/Reihenfolge/Unterschriften; ESLint der neuen Module und Produktionsbuild. Reales iOS-Zurückgehen kann in dieser Umgebung nicht bestätigt werden.

## Digitaler Shop (29.10.2026)

Beim Erstellen ist die Seitenart Vorschau oder Shop wählbar. Shop-Dateien bilden ein Fotopaket mit Titel und EUR-Preis; weitere Pakete lassen sich in der Lokal-Detailansicht hinzufügen und bepreisen. Zwei Produktkarten pro Reihe, jedes Paket mit horizontalem Scroll-Snap, Pfeilen und Punkten. Checkout: Name, Adresse, Land, Telefon, Zahlungsart COD / „Pagesa te postieri“. Keine automatische Kartenzahlung und keine automatische Kurierbuchung; Zahlungseingang wird in Heart bestätigt.

Originaldateien (JPG/PNG/WebP, max. 30 MB je Datei) werden bytegetreu in privaten Firestore-Chunks gespeichert. Öffentlich sind nur reduzierte, eingebrannt mit Wasserzeichen versehene Vorschauen. Auch die früheren `images`-Dokumente enthalten bei neuen Shop-Seiten nur die Wasserzeichen-Version. Shop-Originale werden vor Freigabe weder im HTML noch per öffentlicher Firestore-Abfrage ausgeliefert. Vorschauen/Screenshots lassen sich grundsätzlich nicht vollständig gegen Kopieren sperren.

Warenkorb und Bestellung laufen über `/api/content-creator-shop`, mit dem vorhandenen Produktionszugang `MNYRA_FIREBASE_ADMIN_KEY`. Preise und Artikel werden serverseitig anhand des veröffentlichten Shop-Katalogs bestimmt. Client-Preise werden nie als Kaufpreis übernommen; bei Preisänderungen ist eine erneute Bestätigung erforderlich. Die zufällige Bestellkennung dient als privater Empfangszugang und Idempotenzschlüssel. Kundenadresse und Telefon bleiben in privaten Bestelldokumenten. Erneute identische Requests erzeugen keine zweite Bestellung.

Collections: `contentCreatorCarts` und `contentCreatorOrders`. Gäste können dort weder lesen noch schreiben; API schreibt mit Admin-Zugang. CEO darf Bestellungen lesen und ausschließlich Freigabefelder ändern. Zahlung und Downloadfreigabe werden mit zwei Schritten bestätigt (`paymentConfirmed=true`, `approved=true`, `status=released`). Download-API kontrolliert Freigabe, Zahlung, gekaufte Datei und Chunk-Grenzen bei jedem Request. Originalreferenzen werden bei Bestellung festgehalten; Löschen eines Shop-Vorschaubilds löscht keine bereits gekaufte Originaldatei. ZIP wird lokal im Browser aus Originalbytes erzeugt (max. 150 MB je Paketdownload).

Warenkorb-Zugänge und private Bestelllinks werden im Browser gemerkt. Käufe stehen oberhalb des Footers; nach Freigabe lassen sich Pakete als ZIP laden. Kunden können ihren privaten Bestelllink kopieren und erneut öffnen. Der Still-Modus simuliert auch den Checkout, ohne API-Schreibvorgänge, echte Bestellungen oder Meldungen.

Push-Meldungen laufen über die bestehende Heart-Zustellung mit Sperre/Deduplizierung. Neue Warenkörbe und Bestellungen enthalten den serverseitig berechneten Warenwert; Titel ist „MNYRA · Content Creator“. LifeSkin behält seinen bisherigen Standardtitel. Keine Meta-Pixel-/CAPI-Änderungen.

Validierung: gezielte Geschäftslogik-/DOM-Tests für Paket-Upload, Warenkorb, COD, Still-Modus, Preiswechsel, Idempotenz, Berechtigungen beim Download, ZIP-Originalbytes und vorhandene LifeSkin-Meldungen. Neue Emulatorfälle decken private Originale, öffentliche Vorschauen und eingeschränkte CEO-Freigabe ab. Produktionsbuild und ESLint der neuen Module. Live-Regeln werden vom bestehenden Deploy-Workflow nur nach bestandenem Emulatorlauf veröffentlicht. Echte iOS-/Push-Geräteprüfung bleibt eine separate Prüfung; keine Testbestellungen in Produktionsdaten erzeugen.

Abschluss der Gesamtprüfung: Die Menütests berücksichtigen jetzt den neuen Content-Creator-Eintrag. Ein bereits vorher vorhandener ungeschützter LifeSkin-Getter im gemeinsamen Header wird abgefangen, damit ein defekter Bereich die Heart-Navigation nicht mitreißt. Die drei zuvor roten Menü-/Fehlerabsicherungsfälle bestehen; keine fachliche Änderung am LifeSkin-Kaufweg.


## Paket-Großansicht und stabile Bildhöhe (29.10.2026)

Shop-Bildflächen sind auf ein festes Seitenverhältnis begrenzt. Tracks scrollen ausschließlich horizontal; Slide-Bilder tragen nicht mehr mit ihrer intrinsischen Höhe zum Track-Layout bei. Ein Tipp öffnet das gewählte Foto in einer bildschirmfüllenden Paket-Galerie: vollständige, unbeschnittene Vorschauen, native horizontale Swipe-Navigation, Pfeile, Punkte und Bildzähler. Hintergrund wird währenddessen fixiert und inert gesetzt; Schließen stellt Scrollposition und Fokus wieder her. Großansicht nutzt ausschließlich bereits geladene Wasserzeichen-Vorschauen und berührt weder Originalfreigabe noch Bestell-/Statistikdaten.

Gezielte DOM-Tests: Start bei angetipptem Bild, Pfeile/Punkte/Scroll-Ereignisse, Bildgrenzen, Escape/Schließen, Hintergrund-Wiederherstellung und Warenkorb aus der Großansicht. CSS-Regressionscheck für feste Höhen und fehlendes vertikales Innenscrollen. Reales iOS-Gestenverhalten bleibt zusätzlich manuell zu prüfen.


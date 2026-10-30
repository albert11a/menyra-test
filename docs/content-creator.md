# Qualitaet und rechtzeitiges Nachladen – 30.10.2026

Aktueller Nutzerauftrag: schlechte Bildqualitaet beheben, das zweite Sliderfoto
vor dem Wischen laden, Stern und „Në një dritë të re“ entfernen. Scope nur
Creator-Bildpfad und die angeforderten Texte/Icons; keine Zahlungs-, Auth-,
Firestore-Rules- oder Pixel-Aenderung.

## Erneuter Befund

Version 2 war fuer hochaufloesende Mobiltelefone zu aggressiv: 360 Pixel fuer
Karten, WebP-Qualitaet 54. Auf dem Server kam teils erst ein komprimiertes
1200-Pixel-JPEG, dann ein weiterer JPEG-Zwischenschritt, dann WebP. Neue
Browser-Uploads verwendeten ebenfalls eine bereits komprimierte Zwischenansicht.
Die naechste Kartenfolie wurde erst beim Scroll-Ereignis aktiviert. Das war ein
sichtbarer Nachladefehler, kein Nachweis fuer einen defekten Server.

## Korrektur Version 3

- Varianten direkt aus den unveraenderten Original-Chunks bzw. dem Original-
  Upload. Verlustfreies Raw-Zwischenbild auf dem Server; genau eine abschliessende
  WebP-Kompression mit smartSubsample.
- Karten 640 Pixel / Qualitaet 82, Grossansicht bis 1280 / 84, grosse Variante
  bis 1600 / 88. Kleine Originale werden nicht kuenstlich vergroessert.
- Drei getrennte private Dokumente `originals/{id}/displays/{size}` statt alle
  Varianten in das alte kombinierte Metadaten-Budget zu pressen. Bestehende
  Originale bleiben unangetastet. GET liest die fertige gewaehlte Variante,
  ohne erst die Original-Metadaten samt alter Preview zu laden.
- Aktuelle Veroeffentlichung, aktive Paketzugehoerigkeit und Preis bleiben bei
  jeder Bild-Anfrage geprueft. Bezahlte saubere Varianten bleiben privat.
- Nach dem Laden des aktuellen Kartenfotos wird das naechste Foto automatisch
  niedrig priorisiert angefordert und decodiert. Kein Warten auf den Swipe,
  kein automatisches Laden der gesamten Galerie. Weiter entfernte Slides
  bleiben deferred. Grossansicht behaelt die geladene Vorschau als Unterlage.
- Versionswechsel in Bild- und Einstieg-URLs vermeidet alte Browsercache-Bilder.
- Stern komplett entfernt, auch in der Erklaerung. Die unerwuenschte Headline
  wurde entfernt.

## Recherche und Entscheidung

Primaerquellen, am 30.10.2026 gelesen:
- https://web.dev/articles/preload-responsive-images (Update 10.07.2026):
  Aufloesung passend zu Bildschirm und Pixeldichte, fruehe Bilderkennung.
- https://web.dev/articles/carousel-best-practices: Bildanfragen erst durch
  spaetes JavaScript starten zu lassen ist ein typischer Carousel-Fehler.
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode:
  Bilder vor dem benoetigten Darstellungszeitpunkt laden und decodieren.
- https://sharp.pixelplumbing.com/api-output/: WebP-Qualitaet und
  smartSubsample fuer bessere Farbkanten.

Keine Behauptung eines komplett latenzfreien Netzes: mehr Bildqualitaet braucht
mehr Bytes. Reales Kundenfoto: Original 2.082.614 Bytes bei 1111 x 1416 Pixeln;
neue Karte 44.390 Bytes bei 640 x 816, Grossansicht 120.342 Bytes bei voller
Originalaufloesung. Das sind bewusst keine 9-KB-Matsch-Vorschauen mehr.

Validierung: 72 gezielte Tests inklusive Pixel-Sperre; Originalquelle trotz
vorhandener niedrigaufgeloester Vorschau, getrennte Persistenz, Downloadschutz,
Vorladen/Decodieren vor dem Swipe und unveraenderte Originalbytes geprueft.
Produktionsbuild und Live-Vorbereitung werden im Abschluss bestaetigt.
Keine Playwright-/Smoke-Laeufe und keine echte Handy-/3G-Messung.

Manuell: Kundenlink frisch oeffnen, feine Stoffdetails in Karte und Grossansicht
vergleichen, nach kurzem Betrachten wischen, Gratis-Speichern sowie bezahltes
Wasserzeichen pruefen. Kein Stern und kein unerwuenschter Untertitel.

---

Historische Staende; Qualitaets-/Aufloesungsangaben oben haben Vorrang:

# Mobile Creator-Storefront – 30.10.2026

Aktueller Umfang: konkrete Kundenroute `/content-creator/:id`, nicht die
Social-Profilseiten. Der Nutzer hat mobile Gestaltung und Korrektur des gesamten
Anzeige-/Speichern-Pfads ausdruecklich beauftragt; Mainline-Veröffentlichung ist
im laufenden Auftrag autorisiert.

## Befund

- HTML enthielt nur Ladehinweis. Danach Firebase-SDK, erneuter Seiten-Read,
  dynamischer Shop-Import und erst dann einzelne Bild-Requests.
- Bei fehlender sauberer Vorschau wurden Originale aus Firestore-Chunks
  waehrend eines Bild-GET zusammengesetzt; kein persistenter neuer Display-Satz.
- Gleiche 80–105-KB-JPEGs fuer kleine Karten und Grossansicht, auch verdeckte
  Slides wurden geladen. Wiederholtes innerHTML setzte Bildknoten zurueck.
- Timestamp-Felder fehlten im REST-Decoder, dadurch fehlte die Seitenversion
  fuer den Browsercache. Demo-Hinweise unterschieden Vorschau und echte Seite.

## Umsetzung

- Server rendert reale Shop-Karten mit sicheren, allowlist-basierten Seitendaten.
  Erste zwei Cover werden mit maximal 1,2 s Zusatzbudget im HTML eingebettet.
  Fehlende Cover blockieren den Fallback auf native Bild-URLs nicht.
- Kleine Styles inline: keine zwei blockierenden CSS-Rundreisen auf 3G.
  Ein gebuendelter Creator-Einstieg, Firebase nur spaeter fuer Besuchsmessung;
  Vorschau initialisiert es ueberhaupt nicht. Kein zweiter Seiten-Read.
- Separate 360/720/1080-Anzeigen, im privaten Original-Metadokument vorbereitet.
  WebP, JPEG-Fallback fuer Browser-Uploads. Kartenvorschau und Grossansicht
  bleiben von bytegetreuen Originaldateien getrennt.
- Neue Uploads erzeugen die Display-Saetze vor Veroeffentlichung. Bestehende
  Bilder lassen sich mit `node scripts/prepare-content-creator-displays.mjs
  --page <ID> --origin https://mnyra.com` vorbereiten. Dieser explizite POST
  schreibt nur deterministische private Bildableitungen fuer aktive,
  veroeffentlichte Shop-Fotos. Keine Statistik, Bestellung oder Meldung.
- GET bleibt schreibfrei. Jeder Bildabruf kontrolliert Publikation, aktive
  Paketzuordnung und aktuellen Preis. Bezahlte Varianten sind wassergezeichnet;
  saubere Varianten verlassen den Server nur bei einem aktiven Gratispaket.
- Verdeckt liegende Slides erhalten zunaechst kein src. Bilder werden beim
  Wechsel/nachbarschaftlich aktiviert. Decodierte Bildknoten bleiben bei
  Warenkorb- und Statusaenderungen erhalten.
- Mobiler MNYRA-Header mit nur Warenkorb rechts; lokale Lucide-SVGs, neue Karten
  und drei Schritte fuer „Si funksionon?“. Kein Demo-/Still-Banner; Checkout
  im Still-Modus bleibt rein lokal, mit identischer Darstellung.
- Ruaj fotot ersetzt ZIP in der oeffentlichen Bedienung. Zwei Originaldateien
  parallel, Fortschritt, Abbruch, Wiederverwendung eines vorbereiteten Pakets,
  native File-Share-Funktion bei eigenem Fingertipp und einzelne Original-Links
  als Alternative. Keine Behauptung, direkt ohne OS-Bestaetigung in Fotos zu
  schreiben. Alte ZIP-/Original-API bleibt fuer Kompatibilitaet bestehen.
- Kleinere, 12 % deckende wiederholte Wasserzeichen. Bereits eingebrannte
  alte Vorschauen werden beim Vorbereiten aus privaten sauberen Quellen ersetzt.
- Viewer: dunkler Hintergrund auf html/body, Safe Areas und dynamischem
  theme-color. Native Leisten fremder iOS-In-App-Browser sind nicht vollstaendig
  durch eine Webseite kontrollierbar.

## Validierung und Grenzen

Gezielte Node-/DOM-/Bildtests und Produktionsbuild. Konkretes sauberes Kundenfoto:
alt 80.441 Bytes JPEG, neuer Thumb 8.934 Bytes WebP, Medium 29.952 Bytes.
Dies ist ein Dateigroessenvergleich, keine Messung einer echten 3G-Funkzelle.
Initiales Creator-JS ca. 12 KB gzip ohne Firebase-SDK. Social-Bundles unveraendert.
Keine Pixel-/CAPI-, Rules-, Auth- oder Zahlungsfreigabe-Aenderungen.

69 gezielte Tests inklusive Pixel-Sperre bestanden, Produktionsbuild erfolgreich.
Deployment `6cf887e6` auf mnyra.com READY. Alle zehn Fotos von
`2f1cbd75727746748cdd8dd8f627547c` per expliziter Vorbereitung erfolgreich
persistiert. Live-HTTP: zwei eingebettete Cover, drei serverseitige Karten,
sieben deferred Slides, null externe Stylesheets und kein Demo-Banner.
Live-Thumbs: 8.934 / 12.324 / 15.338 Bytes statt 80.441 / 82.268 / 105.325.
Browser-Sichtpruefung: reale Galerie, dezente bezahlte Vorschau, dunkler Viewer,
Speicherdialog mit drei fertigen Originaldateien. Keine echte Bestellung und
keine native Datei-Freigabe an ein fremdes Ziel ausgefuehrt.
Zusaetzlich: Avatar im HTML auf 96 Pixel reduziert; Grossansicht behaelt die
bereits geladene kleine Vorschau bis die groessere Datei fertig ist. Echtes iOS-/Android-Speichern und native
Browserleisten muessen auf dem Telefon abgenommen werden. Ein Netz mit hoher
Latenz kann keine physikalisch sofortige Uebertragung garantieren.

## Manuelle mobile Testliste

1. Kundenlink im privaten Fenster und im Still-Modus direkt oeffnen: echte
   erste Fotos, gleicher Header, kein Banner. Nachladen und Sliden pruefen.
2. Paket gross oeffnen, swipen, schliessen: vollstaendige Fotos, dunkler
   Viewer/Safe-Area/Theme und wiederhergestellte Scrollposition.
3. Gratispaket speichern: Fortschritt, abbrechen, erneut oeffnen, native
   Foto-Speicherung und einzelne Originalbilder. Kein ZIP-/Bestellformular.
4. Bezahltes Paket: dezente Wasserzeichen, Warenkorb, serverseitige Preise;
   keine Originalfreigabe ohne bestaetigte Zahlung.

---

Historische Schritte (aktueller Umfang oben hat Vorrang):

## Ein gemeinsamer Bildabruf

Shop-Karten und Großansicht verwenden native img-URLs über op=image. Keine
POST-Vorbereitung und keine Firebase-Bildabfragen mehr im Shop-Client; native
Browser-Priorisierung, Lazy Loading und fünf Minuten privater Browsercache.
Der Server entscheidet anhand der aktuellen Seite/Pakete über Wasserzeichen.
Die vorherige zusätzliche Session-Cache-/Worker-Ladeschleife wurde entfernt.

Neue Uploads besitzen fertige kleine Anzeigen. Bei älteren Dateien ohne diese
Anzeige bleibt ein serverseitiger Rückfall auf die Original-Chunks erforderlich.
Die Originalspeicherung selbst wurde nicht migriert. Ein garantierter sofortiger
Erstaufruf ist deshalb nicht belegt. Tests und Build prüfen Funktion, nicht echte
Mobilfunkzeiten. Keine manuelle iPhone-Prüfung; Social-Bundles unverändert.

## Feinere Wasserzeichen und kürzerer Aktualisierungspfad

Wasserzeichen: 20 % statt 32 % Deckkraft, normale statt halbfette Schrift,
Schriftgröße ungefähr ein Drittel kleiner, häufigere Wiederholung und gemessene
Wortabstände. Bei vorhandenen Fotos den Heart-Knopf zur Aktualisierung nutzen.
Die Aktualisierung verwendet jetzt zuerst das vorhandene saubere Anzeigebild
und liest Original-Chunks nur als Rückfall. Danach wird die Seitenversion
aktualisiert, damit Browser keine veraltete Vorschau aus dem Session-Cache zeigen.

Prüfung des Aufbaus: Die Speicherung großer Originale in Firestore-Chunks bleibt
der aufwendige Teil. Eine vollständige Umstellung auf Datei-Storage wäre eine
Migration und ist mit dieser Wasserzeichenkorrektur nicht erledigt.

## Fortschritt beim Speichern und randlose Karten (29.10.2026)

Der Album-Dialog öffnet sofort, zeigt die Zahl geladener Originale und erlaubt
das Teilen bereits fertiger Fotos. Originalbytes werden auf Vollständigkeit
geprüft. Schließen bricht nach den laufenden Anfragen weitere Downloads ab.
Anzeigebilder werden pro Seite, Bild, Preisart und Seitenversion im Session-Cache
gehalten; ein erneuter Seitenaufruf lädt vorhandene Anzeigebilder daraus.
Karten verwenden cover, die Großansicht weiterhin contain.

Gezielte UI-Tests und npm run build bestanden. Kein echter iPhone-Test und
keine Messung am konkreten Kundenlink; sofortige erste Netzwerkladezeiten sind
damit nicht belegt. Getrackte Social-Bundles unverändert.

## Schnelle, vollständige Anzeige und Speichern ins Fotoalbum (29.10.2026)

Ursache der langsamen Anzeige: Gratisfotos wurden bei jedem Bildaufruf aus
Original-Chunks zusammengesetzt und in voller Dateigröße ausgeliefert.
Aktueller Ladeweg verwendet kleine JPEG-Anzeigebilder ohne Wasserzeichen. Neue
Uploads speichern diese direkt privat beim Original; bestehende Bilder werden
beim expliziten Vorbereitungs-POST einmal aus den Originalen erzeugt und privat
zwischengespeichert. Spätere Aufrufe lesen nur die fertige Anzeige. GET bleibt
schreibfrei. Jede öffentliche Anfrage prüft weiterhin Veröffentlichung, aktives
Gratispaket und Fotozugehörigkeit; kostenpflichtige Originale bleiben geschützt.

Galerie priorisiert das erste Foto jedes Pakets, lädt höchstens drei Bilder
gleichzeitig und setzt fertige Bilder einzeln ein, ohne die ganze Galerie neu
aufzubauen. Ein langsames Foto blockiert andere nicht. Fehler werden angezeigt
und können erneut geladen werden. Karten und Großansicht zeigen vollständige
Bilder mit contain. Bereitschaft der Besuchserfassung hängt nicht mehr vom
Abschluss aller Bildladevorgänge ab.

„Ruaj fotot“ lädt die originalen Bilddateien (vier Chunk-Anfragen parallel) und
zeigt anschließend einen eigenen Knopf für die native Datei-Teilen-Funktion.
Dieser zweite Fingertipp erhält die von iOS benötigte Benutzeraktivierung.
Im iPhone-Menü wählt man „Bilder sichern“ / „Save Images“. Eine Webseite kann
nicht ohne OS-Bestätigung direkt ins Fotoalbum schreiben. Geräte ohne Datei-
Teilen können einzelne Originalbilder öffnen und speichern; ZIP bleibt separat.
Es wird höchstens ein vorbereitetes Paket gehalten, Blob-URLs werden freigegeben.

Prüfung: Bildverkleinerung mit echten JPEGs, Größen-/Formatgrenzen, Cache ohne
erneutes Lesen der Original-Chunks, Fehlerbehebung, unabhängige Bildanzeige,
Wiederholen und Übergabe echter File-Objekte ans Teilen-Menü. Keine gemessene
Ladezeit im Mobilfunk und kein manueller iPhone-Test. ESLint und npm run build;
getrackte Social-Bundles unverändert.

## Gratispakete direkt herunterladen, ohne Wasserzeichen (29.10.2026)

Aktuelles Verhalten: Aktive, veröffentlichte Pakete mit Preis 0 zeigen Originale
ohne Wasserzeichen und einen direkten „Shkarko falas“-Button in Karte und
Großansicht. ZIP-Download ohne Warenkorb, Bestellformular oder manuelle Freigabe.
Das gilt auch für bereits bestehende Pakete; die Originale müssen nicht neu
hochgeladen und Wasserzeichen-Vorschauen nicht erneuert werden. Linkbilder
verwenden für Gratisfotos ebenfalls den geprüften Original-Endpunkt.

Server prüft bei jeder Bild-/Dateianfrage Seite, aktive Paketzuordnung, Preis
genau 0 und Fotozugehörigkeit. Ein Wechsel auf einen bezahlten Preis sperrt
weitere Gratisanfragen. Unveröffentlichte, deaktivierte und fremde Fotos bleiben
gesperrt. Bezahlte Pakete und deren Bestellungen behalten den Zahlungsschutz.
Es gibt keine zusätzlichen Firestore-Leserechte auf Originale; ausschließlich
der Server liefert ausdrücklich kostenlose Dateien. Antworten haben no-store.
Bildantworten werden gestreamt, Datei-ZIP nutzt bestehende kleine Chunk-Anfragen.
Still-Modus erlaubt diese reinen Downloads, erzeugt aber keine Statistik,
Bestellung oder Benachrichtigung.

Validierung: gezielte Server-, HTTP-, Galerie-, ZIP- und Linkvorschau-Tests;
ESLint und npm run build. Kein manueller Test auf einem echten Handy.

## Kostenlose Pakete (29.10.2026)

Preis 0 wird beim Anlegen/Bearbeiten und in der serverseitigen Preisberechnung
als kostenlos akzeptiert. Leere, negative und ungültige Preise bleiben gesperrt.
Der Shop zeigt „Falas“ und bei einem Warenkorbwert von null keine Nachnahme-
Zahlungsaufforderung. Bestellung und Benachrichtigungen behalten Warenwert 0;
Downloads benötigen weiterhin die Freigabe in Heart. Bezahlte und gemischte
Warenkörbe verwenden die bestehende Zahlungslogik.

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

## Pakete löschen und dezente Wasserzeichen (29.10.2026)

Umfang: In Heart ganze Shop-Pakete nach zweitem Bestätigungsklick entfernen,
einzelne Fotos direkt im Paket löschen und die Wasserzeichen luftiger setzen.
Paketlöschung aktualisiert Produkte und öffentliche Bildlisten atomar. Nur Fotos,
die kein anderes Paket benötigt, werden aus Bildern/Vorschauen entfernt.
Private Originale und vorhandene Bestellungen bleiben erhalten. Wird das letzte
Foto gelöscht, verschwindet auch das leere Paket. Sortieren aktualisiert jetzt
ebenfalls die Bildreihenfolge der betroffenen Pakete.

Neue Vorschauen verwenden 32 % weiße Textdeckkraft, einen schwächeren Schatten
und gemessene Textbreite plus Abstand statt fester, überlappender Textkacheln.
Für bereits eingebrannte Wasserzeichen gibt es im Shop-Detail den Knopf
„Wasserzeichen vorhandener Fotos aktualisieren“. Dieser baut Vorschauen aus den
privaten Originalen neu auf und erhält vorhandene Bildunterschriften. Bei einem
Fehler können die bereits erneuerten Vorschauen stehen bleiben; erneuter Aufruf
ist sicher. Es werden keine echten Kundenbestellungen zu Testzwecken angelegt.

Validierung: 22 gezielte Node-Tests inklusive Bestell-/Downloadschutz, atomarem
Löschen, gemeinsam verwendeten Bildern, Sortierung und Vorschau-Erneuerung;
ESLint der geänderten JS-Dateien; npm run build erfolgreich. Die erzeugten
getrackten Social-Bundles sind identisch mit main, daher keine Bundle-Änderungen
im Commit. Reale Handy-/iPhone-Bedienung wurde nicht manuell geprüft.


### Original file request consolidation
The storefront requests each original once with `format=file`. The server checks access once, reads legacy chunks in bounded groups of eight and validates the exact length before returning binary bytes. No base64 chunk requests or reconstruction remain in the browser. Prepared photo files are shared directly on a subsequent Save tap. First-time sharing still requires the complete files to arrive; this is not an instant cold-download guarantee. Original storage remains Firestore, unlike the social media CDN.

## Mobile Galerie-Stabilitaet – 30.10.2026

Scope: Kauf-Cover gleich beim HTML laden, Karten ohne content-visibility;
Viewer als separates Overlay statt Katalog-Neuaufbau, dekodierte mittlere Bilder
gezielt vorladen. Freie/bezahlte Abschnitte, opaker Header und abgerundete Tasche.
Originale, Zugriffspruefung und Zahlungen bleiben unveraendert.

Validierung: 75 Creator-/Pixel-Sperre-Tests bestanden; npm run build erfolgreich,
keine getrackten Bundle-Dateien geaendert. Regression prueft identische Karten,
Scroll-Position, Bilder und inert-Zustand nach Pfeil -> Viewer -> Schliessen;
sowie dedupliziertes Vorladen beider Nachbaransichten. content-visibility wurde
entfernt, um Safari-Paint-Skipping beim Scrollen/Fixieren zu vermeiden.
Echte iOS-/Android-Geraete und schwaches 3G bleiben manuell zu pruefen.

## Vorstellung und Heart-Start – 30.10.2026

Scope: abgerundeter Hero mit aus vorhandenen erlaubten Fotos waehlbaren Slides,
Swipe, automatischem Wechsel und Pause; einfache Kosovo-Albanisch-Texte pa ë,
Leistungsueberblick. Kundenanzahl 8.700 und Sitz Austria sind Inhaberangaben;
keine unbelegte europaeische Marktfuehrerschaft. Recherche-Fakt: Google/Ipsos,
The Relevance Factor, 2024 (79 %: Vertrauen nach Recherche), Quellenlink im Text.
Heart startet ohne explizite Route mit Content Creator, dessen Seitentitel entfällt.

Validierung: 104 Tests (Creator, Heart-Routen/Store, Pixel-Sperre) bestanden;
npm run build erfolgreich, keine getrackten Bundle-Dateien geaendert.
Tests decken Autoplay/Pause/Swipe/Dots, reduzierte Bewegung, Gallery-DOM-Erhalt,
Hero-Auswahl speichern und Ausschluss inaktiver Bilder ab. Kein Test mit echten
Mobilgeraeten; Browser- und Produktionspruefung folgen nach Git-Deployment.

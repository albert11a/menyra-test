Status: CURRENT
Veröffentlichung: Commit und Push auf main vom Nutzer am 07.10.2026 ausdrücklich autorisiert.
Die folgenden Abschnitte dokumentieren die vorherige Entwurfsarbeit.

# Persönliche LifeSkin Analyse – Handyentwurf, zweite Fassung

Scope: persönliche freigegebene Therapieseite, erreichbar über /lifeskin,
/analiza/<id> und /terapia/<id>. Entwurf auf separatem Branch, keine
Veröffentlichung. Keine Änderungen an Preisen, Produktwahl, Freigabe,
Bestellserver, Meta-Pixel oder CAPI. Original-IDs bleiben erhalten.

Nutzerfeedback: zu viele Aussagen auf einmal, unpassende Abstände und zu
komplizierte Sprache. Daher jetzt folgende Lesereihenfolge:

1. Name und tatsächlicher Prüfer.
2. Einzelne Karten: Befund, Zone, dafür ausgewähltes Produkt, seine Aufgabe.
3. Eigenständiges Pflegeziel und Vergleich nach vier Wochen.
4. Ausgewählte Produkte untereinander, Gesamtpreis, Bestellung.
5. Warum der Plan gewählt wurde und wo Hilfe erreichbar ist.
6. Paketinhalt, Begleitung und vollständige Analyse aufklappbar.
7. FAQ mit vorhandenen Garantiebedingungen und abschließender Kaufmöglichkeit.

Zwischen den Karten 24px; Abschnittsabstände 40px. Große Produktnamen,
vertikale Vertrauenshinweise statt kleiner nebeneinander gepackter Sätze.
Kurze kosovarische UI-Texte ohne ë. Freigegebene medizinische Texte bleiben
inhaltlich erhalten; die Gestaltung erfindet keine Befunde oder Ergebnisse.
Vier Wochen sind Ziel und Kontrollzeitpunkt, kein universelles Heilversprechen.
50 Prozent Conversion ist ein Ziel ohne belegte Prognose.

Die komplette Standalone-HTML enthält die vorgeschlagenen eingebetteten
Styles und die ursprüngliche Seiten-/Warenkorb-/Kassenstruktur. Sie ist vorab
mit einem gekennzeichneten Beispielfall gefüllt und ohne JavaScript sichtbar.
Native Details bleiben aufklappbar. Optionale Warenkorbinteraktion bleibt lokal;
keine echte Bestellung, keine Datenspeicherung. Beispielpreis 39 EUR.
Garantiebedingungen stammen aus shared/lifeskin-garancia.js, Beispiel 45 Tage.
Echte Seiten verwenden weiterhin die konfigurierte Dauer und tatsächlichen Daten.

Prüfstand: Build erfolgreich, getrackte Bundles unverändert. 24 bestehende
Therapie-/Ansichts-/Pixel-Prüfungen bestanden; JS-Syntax und Diff-Prüfung
bestanden. Vorschau: eindeutige IDs, kein Loader, Seite direkt sichtbar,
Styles und Bilder eingebettet. Keine abgeschlossene echte Handy-Browserprüfung,
weil der lokale Browserzugriff in dieser Umgebung blockiert ist.
Kein Commit, Push oder Deploy.

## Feinschliff nach Nutzerfeedback

Analyse, Paketinhalt und Begleitung sind jetzt komplett offen. Die Karte
unterhalb des Befunds nennt das vollständige Entfernen der gefundenen Pucrra
als Ziel, ohne universellen Erfolg oder einen festen Heilungstermin zu garantieren.
Prompt v9.1 wurde direkt gelesen; auch er verbietet „100 %“ und „garantuar“.
Freigegebene Patiententexte bleiben die Datenquelle der realen Seite.

Styles konsolidiert: einheitliche Kartenradien, 20px Kartenabstand, 36px
Abschnittsabstände, getrennte Labelzeile unter den Vergleichsbildern.
Standalone-Vorschau: zwei originale lokale Vorher/Nachher-Paare, vorhandene
Produktbilder und zwei aktive öffentliche Videoverweise aus der LifeSkin-Galerie.
Die öffentlichen Medienmetadaten wurden nur für die Gestaltung gelesen;
keine Patientendaten, Produktionsmutationen oder Zählereignisse.
Videos streamen online: die Assetübertragung war hier mit HTTP 403 blockiert;
die vollständige Videowiedergabe konnte daher nicht geprüft werden.
Keine erfundenen Kundenstimmen oder neuen Ergebnisbilder.

Statische QA mit WeasyPrint bei 430px erstellt und visuell geprüft, keine
native Handy-Browserprüfung. Eindeutige IDs, eingebettete Fotos/Styles,
korrekter DOCTYPE, offene Analyse und sofort sichtbare Seite überprüft.
Build und alle 24 bestehenden Prüfungen bestanden. Bundles unverändert;
weiterhin kein Commit, Push oder Deployment.

## Galerieabgleich, vierte Fassung

Eigene Overrides für Vergleichsbilder und Medien entfernt. Vorher/Nachher
nutzt wieder die vorhandenen .raste/.rasti-Bildrahmen und Labels aus verkauf.css;
Kundenmedien verwenden .medien__rreshti/.medium statt separater großer Karten.
Standalone: drei aktive öffentliche Kundenfotos und zwei Videos der Galerie,
mit lokalem Vorschau-Betrachter und ohne Zählereignisse. Medien laden online;
kein Nachweis einer gelungenen Wiedergabe in dieser Umgebung.

Einen echten Patientenfall einsetzen ist noch offen: der Nutzer hat keinen
konkreten Falllink in diesem Thread angegeben. Die automatische Freigabeprüfung
hat das Lesen eines aus anderem Kontext vermuteten Berichts abgelehnt.
Keine Inhalte dieses Berichts für die Vorschau verwendet; weiterhin markierter
Beispielfall. Nächster Schritt erfordert den konkreten vom Nutzer bezeichneten
Analyselink, danach nur diesen Bericht und seine ausgewählten Medien lesen.
Build und 24 bestehende Prüfungen bestanden; Bundles unverändert. Kein Commit/Push.

## Auswahl pro Fall in Heart

Nutzerauftrag: aktuelle Seite als „Analysis 1“, neuer Entwurf als „Analysis 2“
im Befund auswählbar machen. Heart zeigt direkt im Befundbogen das Feld
„Befund-Template“. Die Auswahl wird bei Vorschau, Bereit und Freigeben als
reports/{id}.analyseTemplate gespeichert. Unbekannte/fehlende Werte ergeben
analysis1. Vorhandene Berichte bleiben ohne Migration bei der bisherigen Seite.
Die Auswahl wird aus dem gespeicherten Bericht wiederhergestellt; der bestehende
lokale Bogenspeicher erfasst sie über ihre stabile ID.

Patientenseite: nur explizites analysis2 aktiviert den neuen Aufbau und dessen
CTA-Texte. Analysis 1 erhält die ursprüngliche Darstellung und Beschriftung.
Landingweg, Produktwahl, Preis und Tracker sind unabhängig; keine neuen Events.
Shop-Fälle aus /lifeskinshop behalten ihre eigene Darstellung, dort ist die
zweite Auswahl deaktiviert. Manuelle Fallzuordnung, keine automatische
Randomisierung oder neue statistische Auswertung.

Verifikation: 45 Tests (Heart-Bogen, Bogenspeicher, Berichtsschreibweg,
Templateauswahl, Therapie, Ansicht und Pixel-Sperre). Keine Produktionsdaten
für diese Tests. Neuer Template-Test prüft alle relevanten Berichtszustände,
fehlende/ungültige Auswahl, explizite Aktivierung und Schutz der Shopansicht.
Build durchgeführt; kein Commit, Push oder Deployment. Echte Handyprüfung offen.

# LifeSkin Analyse-Landing, 04.10.2026

Status: Umsetzung des von Albert freigegebenen Entwurfs auf main.

## Umfang

- /lifeskin erklaert die Hautanalyse statt auf der Landingpage zu verkaufen.
- Erste Card unter dem Logo mit kurzem Kosovo-Albanisch ohne e-Diakritikum,
  Dr. Gashi und dem vom Inhaber gelieferten Smartphonefoto.
- Genau ein dauerhaft sichtbarer Analyse-Start unten; bestehendes ls-start
  und bestehende Quelle sticky, keine neue Trackingfunktion.
- Drei kurze Schritte, bestehende Para/Pas-Navigation und Heart-Fallauswahl,
  Instagram und Erklaerung des Ergebnisses.
- Kamera, Methodenwahl, Formular, Warte-/Analyseweg und Trackingcode bleiben
  bestehen. Keine Vorschau-Simulation im produktiven Ablauf.

## Pruefung

- `npm run build`: bestanden. Keine getrackten Bundle-Dateien veraendert;
  deshalb keine Bundle-Dateien im Commit.
- 155 gezielte Pruefungen: 153 bestanden, darunter Pixel, CAPI, Wiederholung
  und Deduplizierung, Offline/In-App-Pfade, Service Worker und Heart-Galerie.
- Pixel-Sperrtest: 3/3 bestanden. Alle geschuetzten Trackingdateien und
  Aufrufzeilen unveraendert; kein neuer Ereignisname.
- Methodenwahl, Foto-Anleitung/-Kamera, Scan-Anleitung/-Kamera, Name,
  Anliegen, Telefon, Fragen und Analyse: gegen HEAD bytegleich verglichen.
- Zwei Fehler ebenfalls auf dem vorherigen main nachgewiesen:
  `lifeskin-landingtiefe`: veraltete Voll-Landing-Messkennungen, die schon
  vor diesem Entwurf im HTML fehlten; `lifeskin-menyra`: alte Erwartung an
  `if ($("#ls-wahl"))`, obwohl der bestehende Runtime-Pfad zusaetzlich
  `!this.skinreact` prueft. Die Tracking-/Runtime-Vertraege wurden dafuer
  nicht veraendert.
- Alte Layout-Erwartungen fuer mehrere CTAs wurden an den freigegebenen
  einzelnen Sticky-CTA angepasst. Die Galerie behaelt ihren echten
  Lade-/Heart-Code, einschliesslich vier Offline-Faellen.
- Keine Produktionsdaten fuer Tests. Mobiler Browser nicht geprueft;
  kein Playwright-/Smoke-Lauf (AGENTS.md). Die Mobil-CSS ist responsiv,
  der CTA nutzt Safe-Area-Abstand und bleibt nur im Einstieg sichtbar.

## Korrektur des Einstiegsfotos

Umfang: Nur die Fotogroesse in der ersten Card wird anhand des gelieferten
Handy-Screenshots angepasst. Die feste Bildhoehe aus dem HTML wird per CSS
ueberschrieben: 220 px, auf sehr schmalen Handys 190 px. Der zentrale
Bildbereich mit dem Analysebild bleibt im Ausschnitt. Keine Aenderung am
Trichter, Sticky-CTA oder Tracking.

Pruefung der Korrektur: Build bestanden, keine getrackten Bundle-Aenderungen.
11 gezielte Tests bestanden, einschliesslich aller drei Pixel-Sperrtests.
Handy-Screenshot geprueft; kein Live-Test im mobilen Browser durchgefuehrt.

## Vollstaendiges Foto statt Ausschnitt

Umfang: Im zweiten Handy-Screenshot ist das Smartphone abgeschnitten.
Das Foto wird deshalb zentriert und vollstaendig innerhalb der bestehenden
kompakten Hoehe dargestellt, mit eigenen runden Ecken. Keine Aenderung
an Texten, Analysewegen, CTA oder Tracking.

Pruefung: Build und 11 gezielte Tests bestanden; keine getrackten
Bundle-Aenderungen. Handy-Screenshot beurteilt, kein Live-Browsertest.

## Freigegebene Anpassung: breite Fotoflaeche und Online-Titel

Umfang: Wieder das Foto ueber die gesamte Card-Breite mit runden unteren
Ecken; etwas mehr Hoehe (320 px, auf schmalen Handys 280 px) und ein
hoeherer Ausschnitt, damit das Smartphone besser erkennbar ist.
Die erste Ueberschrift lautet jetzt "Analiza online". Nur Design und
Titel; Analysewege, Sticky-CTA und Tracking unveraendert.

Pruefung: Build und 11 gezielte Checks bestanden. Keine getrackten
Bundle-Aenderungen. Vorliegenden Handy-Screenshot beruecksichtigt; kein
Live-Test der neuen Fassung im mobilen Browser.

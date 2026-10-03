# LifeSkin: Menyra und einfache Anleitung

## Freigegebener Umfang

Die bestehende `/lifeskin`-Landingpage bleibt bestehen. Aus der Methodenauswahl
entfallen nur die Ueberschrift und `Zgjidh nje menyre`. Die vorhandenen drei
Auswahlkarten bleiben bestehen. Die Scan- und Fotoanleitung verwenden wieder
die einfachen Icon-/Textzeilen vom 1. Oktober (`9a976b4`), ohne Ueberschrift:
drei Zeilen fuer Scan, fuenf fuer Foto. Keine nummerierten Anleitungskarten,
Untertitel oder zusaetzlichen Hilfetexte.

Es werden nur HTML und lokal begrenzte CSS-Regeln der `/lifeskin`-Landingpage
geaendert. Kamera, Formularablauf, Heart, Meta-Pixel, CAPI und andere
Landingpages bleiben unveraendert. Die Umsetzung wurde zunaechst lokal auf `refactorapp` vorbereitet.
Albert hat am 03.10.2026 ausdruecklich die Uebernahme auf `main` beauftragt.
Die freigegebenen HTML-/CSS-Aenderungen und diese Dokumentation werden zusammen
auf `main` uebernommen.

## Pruefung

- `npm run build`: erfolgreich; keine getrackten Bundle-Dateien geaendert.
- Bestehende LifeSkin-Tests (Approved Landing, Menyra, Wege robust, Pixel-Sperre):
  55 bestanden, ein bereits auf unveraendertem HEAD vorhandener Fehler. Dieser
  alte Test erwartet `if ($("#ls-wahl"))`, die bestehende Runtime nutzt
  `if (!this.skinreact && $("#ls-wahl"))`. Runtime und Test bleiben unveraendert.
- Methodenkarten, alle DOM-IDs und die bestehenden Kamera-Buttons bleiben erhalten.
- Lokaler Serverstart wurde versucht; der nachfolgende HTTP-Check erreicht
  weder einen verlaesslichen lokalen Preview-Server noch die gewuenschte LAN-Adresse.
- Visuelle mobile Browserpruefung nicht moeglich: Cloud Browser blockiert
  `127.0.0.1` mit `ERR_BLOCKED_BY_CLIENT`. Kein Playwright-/Smoke-Lauf gestartet.
- Build-Ausgabe liegt lokal in `dist`; keine getrackten Build-Dateien zu committen.

## Manuelle mobile Kontrolle

Auf `/lifeskin` starten: Auswahlkarten ohne die beiden Texte, Scan mit drei
Icon-Zeilen, Foto mit fuenf Icon-Zeilen, keine Anleitungsueberschrift. Auf einem
kleinen Telefon den Kamera-Button und Zurueck pruefen. Die weiteren Formular-
und Warteseiten sollen sich wie bisher verhalten.

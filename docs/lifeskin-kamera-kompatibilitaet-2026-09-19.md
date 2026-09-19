# LifeSkin Kamera-Kompatibilitaet — 19.09.2026

## Auftrag und Umfang vor Umsetzung

`/lifeskin` verwendet `apps/lifeskin-trichter/index.html` und die gemeinsame
Kameralogik in `apps/lifeskin/lifeskin-app.js`. Auftrag: geraeteabhaengige
Kamera-/Scanfehler beheben, Regressionen pruefen, Commit und Push auf `main`.
Arbeit erfolgt isoliert auf `fix/lifeskin-camera-compatibility`.

Bestaetigte Luecken im aktuellen Code:

- `getUserMedia` hat keine Frist. Eine unbeantwortete Anfrage blockiert den Start.
- Stoppen invalidiert die Laufnummer nicht; spaete Kameraantworten koennen
  nach Zurueck weiterhin einen Stream oeffnen.
- Die Videobereitschaft prueft nur die Breite, ihr Ergebnis wird ignoriert.
  Metadaten ohne dekodiertes Bild starten dadurch den Scan.
- Der Abspielwaechter endet nach dem Start. Unterbrochene/erstarrte Streams
  und beendete Tracks werden im laufenden Scan nicht abgefangen.
- Canvas-Zugriff kann beim Wechsel des Kamerazustands die Aufnahmeschleife beenden.
- Ohne Erkennungsfortschritt kann der Ring unbegrenzt weiterlaufen.
- Die Kamerabuehne orientiert sich nur an der Breite. Ein vorhandener
  Querformat-Hinweis verdeckt sie auf kleinen Telefonfenstern, pausiert aber
  den Scan darunter nicht. Auf breiten/grossen Fenstern fehlt diese Abdeckung.

Geplant: begrenzte, abbrechbare Starts; echte Videobereitschaft; laufende
Streamkontrolle; sicherer Umgang mit Hintergrund/Rueckkehr; hilfreiche
Fehlermeldungen mit erneutem Versuch; Kameragroesse aus verfuegbarem Platz.
Der vorhandene Hochformat-Hinweis bleibt bestehen; waehrend er sichtbar ist,
pausieren Aufnahme und Scanfristen. Funktionierende Aufnahme, Bildqualitaet, Berichtuebergabe und bestehende
Firestore-Felder bleiben erhalten. Keine Produktionsdaten fuer Tests.

Pruefung: ausfuehrbare Node-Regressionen fuer mobile Kameraereignisse,
bestehende LifeSkin-Tests und `npm run build`. Keine Playwright-/Smoke-Laeufe:
`AGENTS.md` verlangt dafuer einen ausdruecklichen Laufauftrag. Physische
Telefone stehen in dieser Umgebung nicht zur Verfuegung.

Browservertraege: [Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/)
und [WebKit Videowiedergabe](https://webkit.org/blog/6784/new-video-policies-for-ios/).

## Umgesetztes Verhalten

- Kameraanfragen enden nach 30 Sekunden mit einem erneuten Versuch. Eine
  nach Abbruch oder Ablauf eintreffende Erlaubnis laesst keinen Stream offen.
- Metadaten reichen nicht mehr zum Start: erforderlich sind ein laufendes
  Video mit dekodierten Bilddaten und ein lebender, nicht stummer Videotrack.
  Schnelle Kameras starten nach rund 150 ms stabiler Bildgroesse; langsamere
  duerfen bis zu zehn sichtbare Sekunden brauchen.
- Inline-Wiedergabe und Stummschaltung sind vor dem Setzen des Streams auch
  als Videoeigenschaften gesetzt. Ein haengendes `play()` blockiert nicht.
- Ein beendeter Stream sowie zehn Sekunden ohne fortlaufendes Videobild
  fuehren zu Kamerahilfe. Nach 45 Sekunden ohne Ringfortschritt erscheint
  Hilfe zum erneuten Scan. Hintergrund und Hochformat-Hinweis pausieren diese
  Kontrolle und die Aufnahme; die vorhandene Fuehrung bleibt erhalten.
- Bei Rueckkehr wird die Wiedergabe angestossen. Nach Verlassen der Seite
  wird eine Kamera ausdruecklich neu gestartet; alte Starts, Listener und
  Bildbereitschaftspruefungen duerfen keinen neuen Lauf beeinflussen.
- Kurzer Bildverlust beim Canvas-Zugriff bricht die Schleife nicht ab.
  Abgebrochene JPEG-Kodierung kann keinen neuen Scan ueberschreiben.
  Ohne gespeichertes Foto gibt es kein `captured` und keine Weiterleitung.
- Fehlertexte unterscheiden fehlende Erlaubnis, belegte/fehlende Kamera,
  ungeeigneten Browser, ausbleibendes Bild und Scan-Stillstand. Bei blockierter
  In-App-Kamera erklaeren sie den Wechsel in Safari/Chrome.
- Die Kamerabuehne passt in den verbleibenden Platz zwischen Kopf, Hinweis
  und Hilfe; Fensterwechsel und Browserleisten werden beruecksichtigt.

## Pruefergebnis

- `npm run test:unit`: **2326 bestanden, 0 Fehler, 0 uebersprungen**.
- 35 neue ausfuehrbare Regressionen in `tests/lifeskin-kamera-lifecycle.test.mjs`:
  Freigabe-/Bildfristen, spaete Antworten, Doppeltippen, Hintergrund,
  Querformat, BFCache, Streamverlust, Canvas-Aussetzer, JPEG-Rennen und
  regulaere Foto-/Status-/Namensuebergabe. Groessenberechnung bei
  320x568, 375x667, 390x844, 412x915, 844x390, 800x360 und 1280x800.
- ESLint fuer geaenderte JavaScript-/Testdateien, `node --check` und
  `git diff --check`: bestanden.
- `npm run build`: erfolgreich; keine geaenderten getrackten Bundle-Dateien.
  LifeSkin-Quelldateien werden vom bestehenden Build nach `dist` uebernommen.
  Die vorhandene Vite-Warnung fuer einen Social-App-Chunk ueber 500 kB bleibt.
- Fruehe Testlaeufe deckten unaufgeraeumte `play()`-Fristtimer auf; diese
  werden jetzt nach erfuelltem/abgelehntem Promise entfernt. Drei alte
  Quelltextpruefungen wurden an die nun dauerhafte Streamkontrolle und die
  strengere Bildbereitschaft angepasst; die neuen Tests pruefen ihr Verhalten.

Die mobilen Faelle sind simulierte API-Ereignisse und Layoutberechnungen,
keine Tests auf physischen iPhones/Androids und keine Browser-Renderpruefung.
Playwright/Smoke wurde gemaess `AGENTS.md` nicht gestartet. Keine
Firebase-/Functions-/Rules-Deploys, keine Produktionsdaten oder neuen
Firestore-Felder. Die Freigabe und Kameraunterstuetzung einer fremden App
lassen sich durch Website-Code nicht erzwingen.

## Nachkontrolle auf echten Telefonen

1. Safari/iPhone und Chrome/Android: Start erlauben, Ring aufnehmen,
   Name/Alter und Uebergabe pruefen.
2. Erlaubnis verweigern und in Website-Einstellungen freigeben, erneut versuchen.
3. Waehrend Freigabe zurueckgehen; waehrend Scan App wechseln/Sperrbildschirm
   oeffnen, zurueckkommen und erneut aufnehmen.
4. Telefon quer und wieder hoch drehen; waehrend Querhinweis keine Aufnahme.
5. Instagram-/Facebook-/TikTok-Fenster: Freigabe und bei Blockierung den
   beschriebenen Systembrowser-Weg pruefen.

## Geaenderte Dateien und Ruecknahme

Kameralogik: `apps/lifeskin/lifeskin-app.js`; Meldungen:
`apps/lifeskin/lifeskin-content.js`; Buehne: `apps/lifeskin/lifeskin-styles.css`;
Tests: `tests/lifeskin-kamerastart.test.mjs` und
`tests/lifeskin-kamera-lifecycle.test.mjs`; dieses Dokument.
Ausgangsstand: `c278f5f35741b0d3c59e83d07f154e403fc6758c`.
Ruecknahme durch Revert des einzelnen Kamera-Fix-Commits moeglich.

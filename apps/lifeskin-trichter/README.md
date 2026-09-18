Status: CURRENT
Stand: 2026-09-18

# Der Trichter, kurze Fassung (/lifeskintrichter)

Zum Ausprobieren unter einer eigenen Adresse, waehrend `/lifeskin`
unveraendert weiterlaeuft. Beide Adressen laden **dieselben Module** aus
`apps/lifeskin/` - hier liegen nur die zwei Dateien, die anders sind:

| Datei | Was darin steht |
|---|---|
| `index.html` | Der lange Einstieg, kein Vorbereitungsbildschirm, das Anleitungsblatt |
| `trichter-styles.css` | Nur das, was es im kurzen Einstieg nicht gibt |

## Die drei Unterschiede

1. **Bildschirm 1 ist lang und scrollbar - der Knopf steht trotzdem immer
   da.** Gescrollt wird allein der Inhaltskasten (`.ls-inhalt`), nie die
   Seite; Kopfzeile und Knopf liegen ausserhalb davon. Der Einstieg
   beantwortet jetzt die Fragen, an denen er verloren hat: wer das ist, wie
   es laeuft, was dabei herauskommt, ein Fall mit Zeitraum, wer die Fotos
   sieht, und die drei haeufigsten Fragen.
2. **Bildschirm 2 (Vorbereitung) gibt es nicht mehr.** Ein ganzer
   Bildschirm fuer drei Zeilen, zwischen der Anzeige und dem Nutzen.
3. **Bildschirm 3 zeigt zuerst die Anleitung.** Sie liegt als Blatt ueber
   dem Kameraschirm. Dahinter laeuft schon alles, was Zeit kostet:
   Systemfrage, Kamerastrom, Gesichtsnetz. **Gemessen wird erst, wenn das
   Blatt zugeht** (`#anleitungAbwarten()` in `lifeskin-app.js`) - sonst
   vermaesse der Ring ein Gesicht, das gerade einen Text liest.

## Was die Zahlen sagen

Die Schrittfolge bleibt dieselbe (`opened` → `named` → `camera` → …), damit
sich beide Fassungen in Heart nebeneinander lesen lassen:

- `named` faellt beim Tipp auf "Fillo skanimin" - also wenn die Anleitung
  erscheint.
- `camera` faellt, wenn das Anleitungsblatt zugeht und der Scan wirklich
  anfaengt. **Nicht** schon beim Laden der Kamera: Sonst stuenden beide
  Schritte in derselben Sekunde und die Stelle, an der die Anleitung
  Besucher kostet, waere in keiner Zahl zu sehen.

## Der Schalter

`<html data-ls-variante="kurz">` in dieser `index.html`, gelesen von
`varianteLesen()` in `apps/lifeskin/lifeskin-app.js`. Ohne ihn - also auf
`/lifeskin` - laeuft alles wie bisher. Er steht am Aufbau und nicht am
Pfad: Damit laesst sich dieselbe Fassung unter jeder Adresse ausprobieren.

## Wenn sie nach /lifeskin soll

Eine Zeile in `vercel.json`:

```json
{ "source": "/lifeskin", "destination": "/apps/lifeskin-trichter/index.html" }
```

Dann ausserdem:

1. In `tests/lifeskin-service-worker.test.mjs` steht das Ziel der Route
   `/lifeskin` als Erwartung - es mit umstellen.
2. `<meta name="robots" content="noindex,nofollow" />` und das `canonical`
   aus dieser `index.html` entfernen und die Vorschaubilder (og:/twitter:)
   aus `apps/lifeskin/index.html` uebernehmen; sonst hat die Hauptadresse
   beim Teilen keine Vorschau mehr.
3. Zurueck geht es genauso: die Zeile wieder auf
   `/apps/lifeskin/index.html` stellen. Am alten Trichter wurde nichts
   geloescht.

## Was dabei nicht kaputtgehen darf

`tests/lifeskin-trichter-variante.test.mjs` haelt beides fest: was die
kurze Fassung ausmacht und dass die alte davon nichts abbekommt. Der Text
steht fest im Aufbau UND als Schluessel in `lifeskin-content.js`; dass
beide dasselbe sagen, prueft derselbe Test.

Von Hand nachgesehen (Chromium, 390x844, mobil, unechte Kamera): Einstieg
scrollt 1600 auf 695 Pixel, der Knopf steht oben wie unten an derselben
Stelle, die Seite selbst scrollt nicht; nach dem Tipp steht das Blatt und
das Video liefert dahinter bereits 1440x1920; nach "Fillo" ist das Blatt
weg und der Scan laeuft; Zurueck fuehrt auf den Einstieg. Die alte Fassung
laeuft unveraendert: Einstieg → Vorbereitung → Kamera.

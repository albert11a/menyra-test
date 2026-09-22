Status: CURRENT
Last updated: 2026-09-22

# LifeSkin — Wege, Bildschirme und Ladezeiten

**Eine Bestandsaufnahme mit gemessenen Zahlen.** Ziel: Der Trichter muss
auf jedem Telefon funktionieren — iOS wie Android, altes Gerät wie neues,
gutes WLAN wie schwaches Mobilfunknetz — und er muss schnell genug sein,
dass bezahlte Anzeigen sich rechnen.

Alle Zahlen in diesem Dokument sind **gemessen**, nicht geschätzt. Wo ich
etwas nicht messen konnte, steht es ausdrücklich dabei.

---

## Inhalt

1. [Wie gemessen wurde](#1-wie-gemessen-wurde)
2. [Die Karte: alle Wege und Bildschirme](#2-die-karte-alle-wege-und-bildschirme)
3. [Gemessene Ladezeiten](#3-gemessene-ladezeiten)
4. [Was das Gewicht ausmacht](#4-was-das-gewicht-ausmacht)
5. [Die Befunde, nach Wirkung sortiert](#5-die-befunde-nach-wirkung-sortiert)
6. [Was bereits gut ist](#6-was-bereits-gut-ist)
7. [iOS gegen Android](#7-ios-gegen-android)
8. [Bildschirmgrößen und alte Geräte](#8-bildschirmgrößen-und-alte-geräte)
9. [Empfohlene Reihenfolge](#9-empfohlene-reihenfolge)
10. [Was offen bleibt](#10-was-offen-bleibt)

---

## 1. Wie gemessen wurde

| | |
|---|---|
| Browser | Chromium (Playwright), iPhone-13-Profil, Touch, DPR 2 und 3 |
| Breiten | 320, 360, 390, 430 px |
| Netz | CDP-Drosselung: WLAN 30 Mbit/s · gutes 4G 9 Mbit/s · schwaches 4G 1,6 Mbit/s · 3G 780 kbit/s |
| CPU | 1× (neues Handy), 4× (Mittelklasse), 6× (altes Handy) |
| Auslieferung | Eigener Brotli-Server über `dist/` — **so wie Produktion wirklich ausliefert** |

**Wichtige Korrektur zur ersten Messung:** Der lokale Entwicklungsserver
komprimiert nicht. Gegen ihn gemessen wog die Landingpage 1251 KB. Produktion
liefert mit `content-encoding: br` aus — nachgeprüft an
`https://www.mnyra.com`. Alle Zahlen unten sind gegen Brotli gemessen; die
1251 KB waren ein Messfehler meinerseits und stehen hier nur, damit niemand
sie später wiederfindet und für echt hält.

Nicht messbar in dieser Umgebung: echte iOS-Safari-Werte, echte Kamera,
echte Mobilfunklatenz. Dafür stehen die betroffenen Punkte unter
[10. Was offen bleibt](#10-was-offen-bleibt).

---

## 2. Die Karte: alle Wege und Bildschirme

### 2.1 Die Seiten

| Adresse | Datei | Was sie ist |
|---|---|---|
| `/lifeskin` | `apps/lifeskin-landing/index.html` | Landingpage **und** Trichter in einem Dokument |
| `/lifeskintrichter` | `apps/lifeskin-trichter/index.html` | Kurze Fassung des Trichters, eigene Adresse |
| `/analiza/<id>` | `apps/lifeskin-astra/index.html` | Warteseite und Befund |
| `/lifeskinlifeskintesttest` | `apps/lifeskin-bericht/index.html` | Berichtsvorlage |

Die Landingpage trägt **alle elf Trichter-Bildschirme im selben Dokument**.
Umgeschaltet wird über `data-aktiv`, nicht über Seitenwechsel. Das ist der
Grund, warum die Übergänge so schnell sind (siehe 3.3) — und der Grund,
warum das erste Laden alles mitbringt.

### 2.2 Die elf Bildschirme

```
ls-einstieg      Landingpage: Held, Fälle, Produkte, Arzt, FAQ
ls-wahl          "Menyra" — die drei Wege
ls-vorbereitung  Anleitung vor dem Scan
ls-kamera        Der Scan mit Ring
ls-fotopara      Anleitung vor der Fotoaufnahme
ls-foto          Die Fotoaufnahme
ls-name          Name + Altersgruppe
ls-anliegen      "Sqaroni problemet" (nur Weg 3)
ls-tel           Die Nummer — Pflicht auf JEDEM Weg
ls-fragen        Fragenstrecke (alte Vorlage)
ls-analyse       Übergabe
```

### 2.3 Die drei Analysewege

```
WEG 1 — SKANIM (empfohlen)
  einstieg → wahl → vorbereitung → kamera → name → tel → [Übergabe] → /analiza/<id>

WEG 2 — ME FOTO
  einstieg → wahl → fotopara → foto → name → tel → [Übergabe] → /analiza/<id>

WEG 3 — PËR TRUPIN OSE VETËM PYETJE
  einstieg → wahl → name → anliegen → tel → [Übergabe] → /analiza/<id>

ALTE VORLAGE (Link "pa-skanim", lebt weiter)
  einstieg → wahl → fragen → name → fragen(numri) → [Übergabe]
```

### 2.4 Der Bestellweg

```
einstieg (Produktraster)
   ├─ Tipp auf Bild/Wort  → mjetiblatt (Detailblatt)
   └─ Tipp auf "Shto"     → korbband im Kopf ("1 produkt u shtua në shportë")
                              └─ "Vazhdo në shportë" → shporta (Kasse)
                                   → shportaforme (Anschrift) → Bestellung
```

Der Bestellweg **braucht keine Analyse**. Er schreibt in dieselbe Sitzung —
ein Besucher ist eine Zeile in Heart, auch wenn er ohne Analyse kauft.

### 2.5 Die Warteseite

`/analiza/<id>` liest den **Bericht**, nicht die Sitzung (dort stehen Nummer
und Anschrift, die darf sie nicht lesen). Sie fragt die Nummer nur dann noch
einmal, wenn `numri` im Bericht fehlt.

---

## 3. Gemessene Ladezeiten

### 3.1 Landingpage `/lifeskin` — mit Brotli, wie Produktion

| Netz | CPU | FCP | DOMContentLoaded | load |
|---|---|---:|---:|---:|
| WLAN | neu | **444 ms** | 410 ms | 731 ms |
| WLAN | alt (6×) | 924 ms | 890 ms | 1254 ms |
| Gutes 4G | neu | **560 ms** | 543 ms | 820 ms |
| Gutes 4G | alt (6×) | 1312 ms | 1269 ms | 1624 ms |
| Schwaches 4G | neu | 892 ms | 882 ms | **3342 ms** |
| Schwaches 4G | alt (6×) | **3508 ms** | 3467 ms | 3701 ms |
| 3G | neu | 1772 ms | 1758 ms | **7614 ms** |
| 3G | alt (6×) | 3152 ms | 3106 ms | 7755 ms |

**Zwei Dinge fallen auf:**

1. **Der erste Eindruck ist schnell.** Unter 1 s bis zum ersten Pixel auf
   allem bis schwaches 4G, solange die CPU mitspielt.
2. **`load` bricht ein, sobald das Netz schmal wird** — 3,3 s auf schwachem
   4G, 7,6 s auf 3G. Das sind die Bilder (siehe 4.).

Zum Vergleich der anerkannte Schwellenwert: **LCP unter 2,5 s gilt als gut**,
gemessen am 75. Perzentil echter Besucher. Bei Vodafone Italien brachte eine
LCP-Verbesserung um 31 % **8 % mehr Verkäufe** — auf sonst identischen Seiten.

### 3.2 Die anderen Seiten (schwaches 4G)

| Seite | CPU | FCP | load | Gewicht | Anfragen |
|---|---|---:|---:|---:|---:|
| `/lifeskin` | neu | 916 ms | 3344 ms | 551 KB | 28 |
| `/lifeskin` | alt | 3508 ms | 3701 ms | 551 KB | 28 |
| `/analiza/<id>` | neu | **912 ms** | 904 ms | **60 KB** | 16 |
| `/analiza/<id>` | alt | 1120 ms | 1101 ms | 60 KB | 16 |
| `/lifeskintrichter` | neu | 716 ms | 1468 ms | 190 KB | 20 |
| `/lifeskintrichter` | alt | 932 ms | 1548 ms | 190 KB | 20 |

Die Warteseite ist mit 60 KB vorbildlich. Der kurze Trichter mit 190 KB
ebenfalls. **Nur die Landingpage ist schwer** — und genau sie ist die Seite,
auf der die Anzeige landet.

### 3.3 Bildschirm-Übergänge im Trichter

| Übergang | Gutes 4G, neu | Gutes 4G, alt (6×) | Schwaches 4G, alt (6×) |
|---|---:|---:|---:|
| Menyra → Name | 106 ms | 425 ms | 408 ms |
| Name → Anliegen | 45 ms | 137 ms | 130 ms |
| Anliegen → Nummer | 389 ms | 331 ms | 323 ms |

**Alles unter einer halben Sekunde, auch auf einem 6× gedrosselten Gerät.**
Die Ein-Dokument-Bauweise zahlt sich hier aus: Nach dem ersten Laden kostet
kein Schritt mehr Netz.

### 3.4 Die Kamera

| | Erstes Kamerabild |
|---|---:|
| Neues Handy | **141 ms** |
| Altes Handy (6× CPU) | **352 ms** |

Auflösung 1440×810, `readyState=4`, **der Ring steht von der ersten
Millisekunde an**.

**Die Kamera wartet nicht auf das Gesichtsnetz.** `#kameraStarten()` stößt
`netzHolen({ zeitgrenzeMs: 9000 })` im Hintergrund an und setzt `netzWartet`;
der Strom startet davon unabhängig. Das ist genau richtig gebaut.

> Eine frühere Messung von mir zeigte hier 45 s. Das war ein falscher
> Auswahlschlüssel in meiner Sonde, kein Fehler im Produkt. Die Zahlen oben
> sind die richtigen.

---

## 4. Was das Gewicht ausmacht

### 4.1 Die Landingpage, nach Art (Brotli)

| Art | Gewicht | Anteil |
|---|---:|---:|
| **Bilder** | **474 KB** | **86 %** |
| JavaScript (14 Dateien) | 57 KB | 10 % |
| CSS (2 Dateien) | 11 KB | 2 % |
| HTML | 8 KB | 1 % |
| **Summe** | **551 KB** | 28 Anfragen |

**Das JavaScript ist nicht das Problem.** 57 KB Brotli für einen kompletten
Trichter mit Kamera, Laden und Kasse ist gut. Die größte Datei,
`lifeskin-app.js`, wiegt 15 KB übertragen (189 KB roh).

### 4.2 Die Bilder im Einzelnen

Acht Vorher/Nachher-Aufnahmen, je 720×810 JPEG:

| Datei | heute | WebP q80 | bei 520 px Kante + WebP |
|---|---:|---:|---:|
| rasti-1-dita1 | 69 KB | 46 KB | — |
| rasti-1-dita28 | 73 KB | 50 KB | — |
| rasti-2-dita1 | 63 KB | 39 KB | — |
| rasti-2-dita28 | 63 KB | 39 KB | — |
| rasti-3-dita1 | **82 KB** | 55 KB | **29 KB** |
| rasti-3-dita28 | 63 KB | 37 KB | — |
| rasti-4-dita1 | 61 KB | 32 KB | — |
| rasti-4-dita28 | 65 KB | 35 KB | — |
| **Summe** | **540 KB** | **333 KB (−38 %)** | **≈ 190 KB (−65 %)** |

### 4.3 Die Auflösung passt nicht zur Darstellung

Gemessen an einem der Bilder:

| | dargestellt | nötig | geliefert |
|---|---|---|---|
| 390 px, DPR 2 | 205×231 | **410×461** | 720×810 |
| 390 px, DPR 3 | 205×231 | **615×692** | 720×810 |
| 430 px, DPR 3 | 228×256 | **683×769** | 720×810 |

Auf dem häufigsten Fall (DPR 2) wird **das Dreifache der nötigen
Bildpunktzahl** übertragen.

Dasselbe Bild in verschiedenen Größen:

| Kante | Maße | JPEG | WebP |
|---:|---|---:|---:|
| 720 (heute) | 640×720 | 66 KB | 41 KB |
| 520 | 462×520 | 41 KB | **29 KB** |
| 420 | 373×420 | 30 KB | **22 KB** |
| 360 | 320×360 | 20 KB | 14 KB |

### 4.4 Das Gesichtsnetz — 6,9 MB vor der Kamera

| Datei | Größe | Cache-Control |
|---|---:|---|
| `vision_bundle.mjs` (jsDelivr) | 45 KB (br) | `max-age=31536000, immutable` ✅ |
| `vision_wasm_internal.wasm` (jsDelivr) | **3,12 MB (br)** | `max-age=31536000, immutable` ✅ |
| `face_landmarker.task` (Google Storage) | **3,76 MB (unkomprimiert)** | **`max-age=3600`** ⚠️ |
| **Summe** | **≈ 6,9 MB** | |

Rechnerisch auf schwachem 4G (200 KB/s): **≈ 35 s**. Auf 3G (97 KB/s):
**≈ 71 s**. Die Frist liegt bei 9 s — auf beiden Netzen fällt der Scan also
**immer** auf den Weg ohne Netz zurück, und die 6,9 MB laufen trotzdem
durch die Leitung.

Das Modell hat `max-age=3600`: **Nach einer Stunde lädt derselbe Besucher
3,76 MB erneut.**

---

## 5. Die Befunde, nach Wirkung sortiert

### B1 — Statische Dateien werden nicht zwischengespeichert ⬛ groß, billig

Nachgeprüft an Produktion:

```
/apps/lifeskin/lifeskin-app.js      cache-control: public, max-age=0, must-revalidate
/apps/lifeskin-landing/landing.css  cache-control: public, max-age=0, must-revalidate
/apps/lifeskin-landing/fotot/*.jpg  cache-control: public, max-age=0, must-revalidate
```

`vercel.json` hat **keine** Cache-Regel für `/apps/**`. Vercels Standard für
statische Dateien ohne Regel ist genau dieser Wert.

**Was das kostet:** Jeder Wiederbesucher schickt 28 Nachfragen. Bei 150 ms
Latenz auf schwachem 4G sind das mehrere Sekunden, bevor überhaupt etwas
passiert — für Dateien, die sich nicht geändert haben.

**Die Lösung:** Cache-Regel für `/apps/**` und `/fotot/**`. Die Bilder sind
unveränderlich und können `max-age=31536000, immutable` bekommen. Für JS/CSS
ohne Dateinamen-Hash ist `max-age=0, must-revalidate` bewusst richtig — dann
aber gehört ein **ETag** dazu, damit die Nachfrage mit 304 endet statt mit
dem ganzen Inhalt.

> **Achtung:** Werden JS/CSS lange zwischengespeichert, ohne dass der
> Dateiname sich bei jeder Änderung ändert, sieht der Kunde nach einem
> Deploy alten Code. Das ist derselbe Fehler, der in AGENTS.md als
> Bundle-Regel steht. Erst Dateinamen mit Hash, **dann** lange Caches.

### B2 — Die Bilder sind drei- bis viermal zu schwer ⬛ groß

474 KB von 551 KB. JPEG statt WebP, 720 px statt der nötigen 410–615 px,
kein `srcset`, kein `<picture>` (nachgeprüft: 0 Treffer im HTML).

**Erwartete Wirkung:** 540 KB → ≈ 190 KB. Die Seite fiele von 551 KB auf
**≈ 200 KB**. Auf 3G hieße das grob 7,6 s → **unter 3 s**.

### B3 — Die Netz-Bremse greift auf iPhone nie ⬛ groß

```js
export function netzLohntSich(verbindung = globalThis.navigator?.connection) {
  if (!verbindung) return true;        // ← iOS landet IMMER hier
  if (verbindung.saveData) return false;
  return !ZU_LANGSAM.includes(String(verbindung.effectiveType || ""));
}
```

**Safari auf iOS stellt `navigator.connection` nicht bereit** — Stand 2026
bestätigt. Auf jedem iPhone gibt `netzLohntSich()` also `true` zurück, ganz
gleich wie schlecht die Leitung ist. Die 6,9 MB werden dort **immer**
angestoßen.

Der Kommentar im Code sagt das sogar („iOS kennt navigator.connection
nicht") und entscheidet sich bewusst für „lieber einmal umsonst geladen".
Bei 6,9 MB ist diese Abwägung falsch herum: Auf einer schmalen Leitung
kostet sie den Uplink genau in dem Moment, in dem die Scan-Aufnahmen hoch
müssen.

**Möglicher Ersatz ohne `navigator.connection`:** Die Ladedauer der
Landingpage selbst messen (`performance.getEntriesByType("navigation")`) und
daraus entscheiden. Wer 8 s für 200 KB gebraucht hat, bekommt kein 6,9-MB-
Modell angeboten. Das funktioniert auf **jedem** Browser.

### B4 — Kein Service Worker auf den LifeSkin-Seiten ⬛ mittel–groß

`sw.js` existiert, **schließt die LifeSkin-Routen aber ausdrücklich aus** —
und das aus einem guten, dokumentierten Grund: Sonst lieferte er bei
Netzaussetzern die Social-Shell statt des Trichters aus („Genau das ist
passiert").

Aber: Auf `/lifeskin` wird **überhaupt kein** Service Worker registriert
(nachgeprüft: keine `serviceWorker.register`-Stelle in
`apps/lifeskin-landing/` oder `apps/lifeskin/`).

**Was fehlt:** Ein eigener, kleiner Service Worker nur für LifeSkin, der
- die Bilder und das Gesichtsnetz dauerhaft ablegt (Googles eigene Empfehlung
  für MediaPipe: „use local storage or IndexedDB to cache the model and
  binary so future page loads run even faster"),
- **niemals** eine fremde Shell ausliefert,
- bei Netzaussetzer den Trichter aus dem Cache bedient statt weiß zu bleiben.

Das würde B1 und einen großen Teil von B3 auf einen Schlag erledigen.

### B5 — `loading="lazy"` wirkt hier kaum ⬛ mittel

Gemessen: Beim Laden ist **kein einziges** der acht Bilder im Sichtfenster
(`imBild: 0`) — trotzdem laden **sieben von acht** sofort. Chromium holt
lazy-Bilder weit im Voraus (auf langsamen Verbindungen bis ~3000 px).

Die Attribute selbst sind sauber gesetzt: 9 von 11 Bildern tragen
`width`, `height`, `loading="lazy"` und `decoding="async"`. Die zwei ohne
Maße (`#ls-fotobild`, `#ls-anliegenbild`) sind leere Platzhalter, die erst
zur Laufzeit gefüllt werden — dort ist es richtig so.

**Was hilft:** Die Fälle erst laden, wenn der Abschnitt wirklich nah ist
(IntersectionObserver statt `loading="lazy"`), und dem Heldenbild
`fetchpriority="high"` geben (heute: 0 Treffer im HTML).

### B6 — Die Modell-Quelle liegt bei Dritten ⬛ mittel, Zuverlässigkeit

Das Gesichtsnetz kommt von `cdn.jsdelivr.net` und
`storage.googleapis.com`. Beide sind schnell und zuverlässig — aber:

- **Zwei zusätzliche DNS-Auflösungen + TLS-Handshakes** vor dem ersten Byte.
  Auf 300 ms Latenz sind das leicht 1,5 s, bevor überhaupt etwas fließt.
- Ein Ausfall oder eine Sperre bei einem der beiden nimmt den Scan mit
  (auffangen tut das die Frist, aber der Weg wird dann schlechter).
- `preconnect` steht nur für `firestore.googleapis.com`, **nicht** für die
  beiden Modellquellen.

**Billigster Schritt:** `<link rel="preconnect">` für beide ergänzen.
**Gründlicher:** beides selbst ausliefern — dann gelten unsere Cache-Regeln,
es entfällt eine Fremdabhängigkeit, und der Scan funktioniert auch, wenn
jsDelivr in einem Netz gesperrt ist.

### B7 — Der FCP bricht auf alter CPU ein ⬛ mittel

916 ms → **3508 ms**, sobald die CPU 6× langsamer ist (bei gleichem Netz).
Der Unterschied ist rein Hauptthread-Arbeit.

Was es **nicht** ist (gemessen):

| | gemessen | Bewertung |
|---|---:|---|
| DOM-Knoten | 732 | gesund (Richtwert < 1500) |
| Schachtelungstiefe | 11 | gesund |
| CSS-Regeln | 528 | gesund |
| Lange Aufgaben > 50 ms | keine | gut |
| Knoten in versteckten Bildschirmen | 248 (34 %) | vertretbar |

Bleibt: Brotli-Entpacken und Stilberechnung über neun `backdrop-filter`-
Flächen. **`backdrop-filter` ist auf alten Geräten teuer** — jede Fläche
zwingt den Compositor, den Hintergrund zu lesen und zu filtern.

**Prüfenswert:** `backdrop-filter` nur dort, wo es wirklich trägt, und auf
schwachen Geräten über `@media (prefers-reduced-transparency)` oder eine
Geräteprüfung durch eine deckende Farbe ersetzen.

---

## 6. Was bereits gut ist

Damit beim Aufräumen nichts kaputtgeht, was heute trägt:

| | |
|---|---|
| **Keine Webschriften** | Systemschrift-Stapel (`-apple-system, …`). Spart einen der häufigsten FCP-Blocker vollständig. |
| **JS ist schlank** | 57 KB Brotli für den gesamten Trichter. |
| **Kein Framework** | Keine Hydration, kein Runtime-Overhead. |
| **Der Pixel lädt async** | `skript.async = true` — blockiert nichts. |
| **Ein Dokument, elf Bildschirme** | Übergänge unter 500 ms selbst auf 6×-CPU. |
| **Die Kamera wartet nicht auf das Modell** | 141/352 ms bis zum Bild, Ring sofort. |
| **`playsinline muted autoplay`** | Auf allen drei `<video>` gesetzt — ohne `playsinline` öffnet iOS den Vollbildspieler. |
| **`viewport-fit=cover` + 35× `env(safe-area-inset-*)`** | Notch und Home-Indicator sind bedacht. |
| **`100vh` ist abgesichert** | Jedes Vorkommen hat `svh`/`dvh` daneben oder ein `@supports`. |
| **Bild-Attribute** | 9/11 mit `width`+`height` → kein Layoutsprung. |
| **Warteseite 60 KB** | Die Seite, die der Patient aufhebt, ist die leichteste. |

---

## 7. iOS gegen Android

| Punkt | iOS/Safari | Android/Chrome | Folge |
|---|---|---|---|
| `navigator.connection` | **fehlt** | vorhanden | **B3**: Netzbremse greift auf iPhone nie |
| `backdrop-filter` | ab iOS 9 (`-webkit-`) | ab Chrome 76 | beides vorhanden, siehe B7 zur Kosten-Frage |
| `100dvh`/`100svh` | ab iOS 15.4 | ab Chrome 108 | abgesichert |
| `loading="lazy"` | ab iOS 15.4 | ab Chrome 77 | in Ordnung |
| WebP | ab iOS 14 | ab Chrome 32 | **sicher einsetzbar** (B2) |
| AVIF | ab iOS 16 | ab Chrome 85 | einsetzbar, aber WebP reicht |
| `getUserMedia` | nur HTTPS, nur nach Fingerdruck | dito | richtig umgesetzt |
| Service Worker | vorhanden, Cache wird bei Platzmangel früher geräumt | großzügiger | für B4 einplanen |

**Der einzige echte Unterschied ist B3.** Alles andere ist auf beiden Seiten
bedacht.

---

## 8. Bildschirmgrößen und alte Geräte

Gemessen am Produktraster (der engste Teil der Seite):

| Breite | Karte | Knopf | Platz im Knopf | Überlauf |
|---:|---:|---:|---:|---|
| 320 px | 250 px | 98 px | 114 px | nein |
| 360 px | 258 px | 109 px | 131 px | nein |
| 390 px | 271 px | 109 px | 144 px | nein |
| 430 px | 290 px | 109 px | 163 px | nein |

Kein horizontaler Überlauf auf keiner Breite. 320 px (iPhone SE 1. Gen. /
alte Androiden) trägt die Sektion noch mit 14 px Luft im Knopf.

Auf 6× gedrosselter CPU laufen alle Übergänge unter 500 ms und die Kamera
startet in 352 ms — **für schwache Geräte ist der Trichter selbst in
Ordnung.** Was dort weh tut, ist ausschließlich die erste Ladung.

---

## 9. Empfohlene Reihenfolge

Sortiert nach **Wirkung geteilt durch Risiko**. Jede Stufe ist für sich
abgeschlossen und rückgängig zu machen.

### Stufe 1 — Bilder (kein Code-Risiko, größte Wirkung)

1. Die acht Falldateien zusätzlich als **WebP** ablegen.
2. Zwei Größen je Bild (520 px und 420 px Kante) und `srcset`/`sizes`.
3. `<picture>` mit WebP zuerst, JPEG als Rückfall.
4. Dem Heldenbild `fetchpriority="high"`.

→ erwartet **551 KB → ≈ 200 KB**, 3G-`load` von 7,6 s auf unter 3 s.

### Stufe 2 — Cache-Regeln (eine Datei)

5. In `vercel.json` eine Regel für `/apps/lifeskin-landing/fotot/**`:
   `max-age=31536000, immutable`.
6. Für JS/CSS **erst** Dateinamen mit Hash im Build, **dann** lange Caches.
   Ohne Hash bleibt `must-revalidate` richtig — dann aber mit ETag.

→ Wiederbesucher laden die Bilder gar nicht mehr.

### Stufe 3 — Die Netzbremse iOS-tauglich machen

7. `netzLohntSich()` um eine Messung der eigenen Ladedauer ergänzen, die
   ohne `navigator.connection` auskommt.
8. `preconnect` für `cdn.jsdelivr.net` und `storage.googleapis.com`.

→ kein 6,9-MB-Download mehr auf schmalen iPhone-Leitungen.

### Stufe 4 — Ein eigener Service Worker für LifeSkin

9. Getrennt von `sw.js`, nur für die LifeSkin-Routen, **ohne** Shell-Rückfall.
10. Bilder und Gesichtsnetz dauerhaft ablegen (IndexedDB/Cache API).

→ zweiter Besuch nahezu sofort; Scan auch bei Netzaussetzer.

### Stufe 5 — Feinschliff

11. `backdrop-filter` auf schwachen Geräten durch deckende Farbe ersetzen.
12. Fälle über IntersectionObserver statt `loading="lazy"` nachladen.
13. Das Gesichtsnetz selbst ausliefern statt von zwei fremden Quellen.

---

## 10. Was offen bleibt

Ehrlich benannt, damit niemand diese Punkte für geprüft hält:

| Offen | Warum | Wie zu schließen |
|---|---|---|
| **Echte iOS-Safari-Werte** | Hier läuft Chromium. Safari hat eine andere JS-Maschine und ein anderes Speicherverhalten. | Auf einem echten iPhone im Mobilfunknetz nachmessen |
| **Echte Kamera** | Gemessen mit `--use-fake-device-for-media-stream`. Eine echte Kamera braucht die Systemfrage und das Aufwachen der Optik. | Auf dem Gerät mit der Stoppuhr |
| **Das Gesichtsnetz unter echter Last** | In den Messungen blockiert, sonst 6,9 MB je Durchlauf | Einmal ungedrosselt mit echtem Netz messen |
| **Feldwerte (75. Perzentil)** | Alles hier ist Labormessung. Google bewertet echte Besucherdaten. | `web-vitals` einbauen und nach Heart melden |
| **Die tatsächliche Abbruchstelle** | Die Vermutung „bei Nummri" stammt aus der Beobachtung, nicht aus dieser Messung | Die Trichter-Stufen in Heart über zwei Wochen lesen |

---

## Quellen

- [Core Web Vitals 2026 — Schwellenwerte LCP/INP/CLS](https://www.corewebvitals.io/core-web-vitals)
- [Core Web Vitals und Umsatzwirkung (Vodafone-Fall)](https://meteoraweb.com/en/analisi-dei-dati-e-metriche/core-web-vitals-2026-lcp-inp-cls-thresholds-and-seo-impact)
- [Network Information API — Browserunterstützung](https://caniuse.com/?search=navigator.connection)
- [Network Information API — Spezifikation (WICG)](https://wicg.github.io/netinfo/)
- [MediaPipe Face Landmarker für Web](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js)
- [7 dos and don'ts of using ML on the web with MediaPipe](https://developers.googleblog.com/7-dos-and-donts-of-using-ml-on-the-web-with-mediapipe/)
- [Service Workers und Cache API](https://sujeet.pro/articles/service-workers-and-cache-api)

---

*Gemessen am 2026-09-22 gegen `dist/` mit Brotli-Auslieferung, Chromium,
iPhone-13-Profil. Die Messskripte lagen im Scratchpad und wurden nach der
Messung entfernt; jede Zahl ist über die in Abschnitt 1 genannten
Einstellungen reproduzierbar.*

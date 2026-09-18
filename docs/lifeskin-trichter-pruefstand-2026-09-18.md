Status: CURRENT
Last updated: 2026-09-18

# Lifeskin-Trichter: Prüfstand über Geräte, Browser und App-Fenster

Anlass: Im Trichter stehen 184 bei „Fillo skanimin" und 41 bei „Para fotos" —
ein Verlust von 78 Prozent zwischen dem ersten und dem zweiten Bildschirm.
Die Frage war, ob daran ein Gerät, ein Browser oder eine Bildschirmgröße
schuld ist.

**Am Ausliefern liegt es nicht.** Auf allen 20 geprüften Kombinationen steht
der erste Bildschirm richtig, der Knopf ist beschriftet, vollständig im Bild,
mit dem Daumen zu treffen — und jeder Tipp führt zum zweiten Bildschirm und
wird gezählt. Es wurde **nicht** gegen den lokalen Server gemessen, sondern
gegen `https://www.mnyra.com/lifeskin`, also genau die Seite, die der Besucher
aus der Anzeige bekommt.

Gefunden wurden trotzdem drei Dinge, die den Trichter kosten. Keines davon
liegt auf Bildschirm 1.

> **Nachtrag vom selben Tag:** Der Befund unten ist der Stand VOR der
> Umsetzung. Was daraufhin geändert wurde — und was bewusst nicht — steht
> in Abschnitt 12 am Ende.
>
> Alle Firestore-Aufrufe der Läufe wurden abgefangen und selbst beantwortet.
> **Kein Prüflauf hat in die echte Zählung geschrieben** — sonst stünden
> danach Stufen im Trichter, die niemand gegangen ist.

---

## 1. Was geprüft wurde

610 Einzelprüfungen auf 20 Kombinationen, drei Engines:

| | Geräte |
|---|---|
| **iOS / WebKit** | iPhone SE 1 (320×568), SE 2/3 (375×667), 13–15 (390×844), 15/16 Pro Max (430×932), iPad hoch (768×1024), iPhone quer (844×390) |
| **iOS App-Fenster** | Facebook-App auf iPhone 13, Instagram-App auf iPhone 13 und auf iPhone SE 2 |
| **Android / Chromium** | 360×640, Galaxy A (360×800), 412×915, Android quer (800×360) |
| **Android App-Fenster** | Facebook-App und Instagram-App auf Galaxy A, Instagram-App auf 360×640 |
| **Firefox** | Android 412×915, Desktop 1280×800 |
| **Desktop** | Chrome 1280×800 und 1024×600 |

WebKit ist dabei nicht optional: **Auf jedem iPhone rendert diese Engine** —
auch in Chrome, auch im Fenster von Facebook und Instagram.

Je Gerät geprüft: Ist der Knopf beschriftet? Liegt er ganz im Bild? Liegt
etwas darüber, das den Daumen abfängt? Ist er groß genug? Lässt sich die
Seite schieben? Wird Text abgeschnitten? Lädt das Bild von Dr. Gashi?
Wechseln die Karten? Kommt Bildschirm 2? Wird der Schritt gezählt? Dazu
Netzbedingungen, Kameraerlaubnis, fehlende Kamera, kein JavaScript,
abbestellte Bewegung und die Zählung selbst.

## 2. Bildschirm 1 → Bildschirm 2: sauber, überall

| Gerät | Knopf-Text | im Bild | Daumen trifft | Bildschirm 2 | gezählt |
|---|---|---|---|---|---|
| iPhone SE 1 · Safari | ✓ | ✓ | ✓ | ✓ | ✓ |
| iPhone SE 2/3 · Safari | ✓ | ✓ | ✓ | ✓ | ✓ |
| iPhone 13/14/15 · Safari | ✓ | ✓ | ✓ | ✓ | ✓ |
| iPhone 15/16 Pro Max · Safari | ✓ | ✓ | ✓ | ✓ | ✓ |
| iPhone 13 · Facebook-App | ✓ | ✓ | ✓ | ✓ | ✓ |
| iPhone 13 · Instagram-App | ✓ | ✓ | ✓ | ✓ | ✓ |
| iPhone SE 2 · Instagram-App | ✓ | ✓ | ✓ | ✓ | ✓ |
| Android klein · Chrome | ✓ | ✓ | ✓ | ✓ | ✓ |
| Galaxy A · Chrome | ✓ | ✓ | ✓ | ✓ | ✓ |
| Android groß · Chrome | ✓ | ✓ | ✓ | ✓ | ✓ |
| Galaxy A · Facebook-App | ✓ | ✓ | ✓ | ✓ | ✓ |
| Galaxy A · Instagram-App | ✓ | ✓ | ✓ | ✓ | ✓ |
| Android klein · Instagram-App | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tablet hoch · Safari | ✓ | ✓ | ✓ | ✓ | ✓ |
| Desktop · Chrome / Firefox | ✓ | ✓ | ✓ | ✓ | ✓ |
| quer gehalten (iOS und Android) | ✓ | ✓ | ✓ | ✓ | ✓ |

Ladezeit bis der Knopf lesbar ist, gegen die echte Seite, ungedrosselt:
**649 bis 885 ms**, quer über alle Geräte. Keine einzige Kombination fällt
heraus.

Auch alles andere auf Bildschirm 1 und 2 steht: Die Seite lässt sich nirgends
schieben, kein Text wird abgeschnitten, das Bild von Dr. Gashi lädt überall,
der Kartenwechsel läuft, und `prefers-reduced-motion` ändert nichts am Weg.

**Damit ist die Sache entschieden: Die 143 fehlenden Besucher sind nicht an
einem kaputten Bildschirm hängen geblieben.**

## 3. Warum die Zahl 184 nicht bedeutet, was sie zu bedeuten scheint

Dies ist der wichtigste Befund des Prüfstands.

Die Stufe heißt in Heart „Fillo skanimin" — so wie der Knopf. Sie ist aber
nicht der Knopf. Sie ist der Schritt `opened`, und der wird geschrieben,
sobald die Seite fertig geladen hat (`lifeskin-app.js:448`). Der **Knopf**
schreibt den *nächsten* Schritt, `named`, den Heart „Para fotos" nennt
(`lifeskin-app.js:736`, `heart-lifeskin-berechnung.js:40-41`).

Der Kommentar im Trichter sagt das auch so: „In Heart heißt die Stufe deshalb
jetzt *Start getippt*". Nur heißt sie dort inzwischen anders.

Gemessen, nicht vermutet — jeder dieser Fälle schreibt ein vollständiges
`opened`:

| Fall | wird gezählt? |
|---|---|
| normaler Besuch | ja, 1× |
| **Seite wird nie sichtbar** (Vorabladen der Meta-Apps, JS-fähige Prüfroboter) | **ja, 1×** |
| Besucher geht nach 100 ms wieder weg | **ja, 1×** |
| dieselbe Seite dreimal neu geladen | ja, 1× (richtig) |
| **zweiter Tipp auf dieselbe Anzeige** | **ja, eine zweite Sitzung** |

Die Facebook-App lädt Anzeigenziele auf Android im Voraus, bevor jemand
tippt. Jede solche Ladung steht in den 184. Ein zweiter Tipp auf dieselbe
Anzeige öffnet ein neues App-Fenster mit leerem `sessionStorage` und zählt
darum erneut — dieselbe Person, zwei Zeilen.

Die 184 sind also **Seitenaufrufe**, die 41 sind **Menschen, die getippt
haben**. Die beiden Zahlen ins Verhältnis zu setzen, überschätzt den Verlust
— um wieviel, weiß niemand, weil es nicht mitgeschrieben wird.

**Was das messbar machen würde:** beim Anlegen der Sitzung `document.visibilityState`
mitschreiben. Dann steht in den Zahlen, wer die Seite gesehen hat und wer
nicht — ohne dass sich am Trichter selbst etwas ändert.

## 4. Was der Besucher sieht, bevor JavaScript läuft

Der Aufbau (`index.html`) enthält **keine einzige Zeichenkette**. Titel,
Knopfbeschriftung und Hinweiszeile werden alle von `#texteSetzen()` gesetzt.
Bis dahin steht auf dem Bildschirm: das Wort **LIFESKIN** und ein
unbeschrifteter Knopf.

Gemessen, wie lange dieser Zustand dauert:

| Bedingung | erster Inhalt | Knopf lesbar | kommt Bildschirm 2? |
|---|---|---|---|
| echte Seite, ungedrosselt | 650–885 ms | 650–885 ms | ja |
| schnelles 4G | 852 ms | 837 ms | ja |
| langsames 4G | 2 312 ms | 2 294 ms | ja |
| **3G** | **4 704 ms** | **4 696 ms** | ja |
| **schlechtes 3G** | **8 888 ms** | **8 872 ms** | ja |
| Zählung (Firestore) tot | 100 ms | 86 ms | ja |
| Fremd-CDN tot | 104 ms | 95 ms | ja |

(Die drei unteren Zeilen zeigen: Weder Firestore noch das Fremd-CDN halten
den Knopf auf. Das ist gut gebaut.)

Auf schmaler Leitung sieht der Besucher also bis zu **neun Sekunden** eine
Seite, die aussieht, als sei sie kaputt. Wer dann geht, taucht in keiner
Zahl auf — auch `opened` schreibt erst das JavaScript. Die 184 sind die,
die gewartet haben.

Dazu: **kein `<noscript>` und kein `nomodule`-Ersatz.** Wem JavaScript fehlt
oder dessen Browser die Module nicht versteht, sieht nur „LIFESKIN" — für
immer.

Harte Grenze aus der statischen Prüfung (`lauf-kompat.mjs`): Chrome und
Android-WebView ab **85**, Safari und iOS ab **14.1** (private
Klassenmethoden, statische Klassenfelder, `??=`). Darunter bricht der Parser
das Modul ab und nichts läuft. Ein iPhone 6 kommt nicht über iOS 12 hinaus.
Die CSS-Merkmale darüber (`100dvh`, `text-wrap: balance`) sind dagegen
harmlos: Was der Browser nicht kennt, überliest er.

## 5. Sieben Megabyte, bevor jemand getippt hat

`starte()` ruft als allererstes `netzVorladen()` auf — das Gesichtsnetz von
MediaPipe. Gemessen auf dem ersten Bildschirm:

| | Anfragen | übertragen |
|---|---|---|
| eigene Dateien (mnyra.com) | 14–15 | **154 KB** |
| Fremd-CDN (jsdelivr + Google) | 4 | **~7,0 MB** |

Im Einzelnen: `vision_wasm_internal.wasm` 3,12 MB (brotli, 11,2 MB entpackt),
`face_landmarker.task` 3,76 MB (unkomprimiert), dazu 124 KB Beiwerk.

Auf Android wird das übersprungen, wenn das Gerät `2g`, `3g` oder
`saveData` meldet — `netzLohntSich()` macht das richtig. **Auf iOS gibt es
`navigator.connection` nicht**, also wird es dort *immer* geholt, auf jeder
Leitung, auch bei jemandem, der nach drei Sekunden wieder geht. Der Prüfstand
bestätigt es: `navigator.connection: GIBT ES NICHT`.

Den Knopf hält das nicht auf (siehe Tabelle oben). Es kostet Datenvolumen des
Besuchers und Bandbreite, die später die Fotos brauchen.

## 6. Bestätigte Fehler — alle hinter Bildschirm 2

### 6.1 Der Kameraschirm bricht auf jedem Fenster, das breiter als hoch ist

`lifeskin-styles.css:711-722`:

```css
.ls-kamera { width: 100%; }
@supports (aspect-ratio: 1 / 1) { .ls-kamera { aspect-ratio: 1 / 1; } }
```

Die Bühne ist so hoch wie das Fenster breit. Auf einem Telefon hochkant geht
das auf. Auf allem anderen nicht:

| Fenster | Bühne wird | Hinweistext liegt bei | „Si funksionon?" liegt bei |
|---|---|---|---|
| Desktop 1280×800 | 1240×1240 px | y = 1301 | y = 1343 |
| Desktop 1024×600 | 1004×1004 px | y = 1045 | y = 1087 |
| iPhone quer 844×390 | 804×804 px | y = 865 | y = 907 |
| Android quer 800×360 | 760×760 px | y = 821 | y = 863 |

Das Fenster ist 800 bzw. 390 Pixel hoch. Beides liegt also **außerhalb** und
wird von `overflow: hidden` weggeschnitten. Was der Besucher sieht, ist die
obere Kappe eines riesigen Kreises — kein Hinweis, kein Knopf, kein Weg
weiter. Bestätigt in Chromium, WebKit **und** Firefox.

Betroffen: jeder, der die Anzeige am Rechner anklickt, und jeder, der das
Telefon quer hält. Bildschirm 1 und 2 sind dort in Ordnung — der Trichter
zählt diese Leute also bis „Skanimi" und verliert sie genau dort.

### 6.2 Der Kameraschirm hat keine Zeitgrenze

Der Scan endet nur, wenn der Ring zugeht — `lifeskin-app.js:1629`:

```js
if (!(stand.anteil >= 0.999)) return false;
```

Wird nie ein Gesicht erkannt, bleibt `anteil` auf 0 und die Schleife läuft
weiter. **Es gibt keinen Zeitablauf und keine Meldung.** Im Prüflauf stand
der Bildschirm nach 77 Sekunden immer noch auf „Kthejeni fytyrën te rrethi."

Der einzige Ausweg liegt hinter „Si funksionon?" → „Vazhdo kështu". Wer den
drückt, bekommt eine saubere Meldung („Nuk po dallojmë fytyrë. Kërkoni dritë
më të mirë…") mit „Provo sërish". Das ist richtig gebaut — nur findet es
niemand, der nicht danach sucht.

Wer im Dunkeln sitzt, eine Brille trägt, das Telefon zu tief hält oder die
Frontkamera abgeklebt hat, wartet also endlos.

*Einschränkung:* Der Prüfstand hat keine echte Kamera; Chromium liefert ein
Testmuster ohne Gesicht. Dass hier kein Gesicht gefunden wurde, ist deshalb
richtig und beweist nichts über echte Gesichter. Bewiesen ist nur: **Wenn
kein Gesicht gefunden wird, passiert nichts** — kein Ablauf, keine Hilfe.

### 6.3 Kleinigkeit: Android quer, Bildschirm 2

`section#ls-vorbereitung > div.ls-inhalt` schneidet 4 px ab (sichtbar 216 px).
Dieselbe Ursache wie 6.1: sehr wenig Höhe.

## 7. Was richtig funktioniert (geprüft, damit es niemand umbaut)

- **Kamerafehler.** Erlaubnis verweigert, keine Kamera, altes WebView ohne
  `navigator.mediaDevices` — auf Chromium *und* WebKit erscheint dieselbe
  saubere Meldung mit „Provo sërish": *„Nuk arritëm të hapim kamerën. Lejoni
  qasjen në kamerë dhe provoni sërish."* Kein Absturz, keine Sackgasse.
- **Rückfallweg ohne Gesichtsnetz.** Mit blockiertem CDN läuft der ganze Weg
  durch: `opened → named → camera → captured → pyetja1`, in 5 Sekunden.
- **Der Trichter hält ohne Netz durch.** Tote Zählung, totes CDN, beides —
  Bildschirm 2 kommt immer.
- **Das Zählen selbst.** Ein Neuladen erzeugt keine zweite Sitzung, und der
  Schritt fällt nie zurück.
- **Bewegung abbestellt** (`prefers-reduced-motion`) ändert nichts am Weg.
- **Die Auslieferung.** Live entspricht dem Depot (nur Kommentare entfernt).
  Alle Dateien kommen mit Brotli: 12 KB für `lifeskin-app.js`, 4,8 KB für das
  Stilblatt, zusammen ~44 KB.
- **Die eigenen Tests.** `npm run test:unit`: 2203 Tests, 2202 bestanden,
  1 übersprungen, 0 Fehler.

## 8. Hausordnung — klein, aber es steht da

- **Keine Cache-Regel für `/apps/lifeskin/*`.** Jede andere App in
  `vercel.json` hat eine (`immutable` für Anhänge, `no-cache` für
  Einstiegsdateien). Der Trichter hat keine und bekommt darum Vercels
  Vorgabe `public, max-age=0, must-revalidate`. Jeder wiederkehrende Besucher
  fragt alle 13 Dateien noch einmal nach — auf einer Mobilleitung mit 300 ms
  Umlaufzeit ist das die teuerste Zeile des ganzen Ladevorgangs, und die
  Dateien ändern sich nicht.
- **`Content-Security-Policy-Report-Only`** trägt `frame-ancestors` und
  `upgrade-insecure-requests`. Beide gelten in einem Report-Only-Satz nicht;
  jeder Browser schreibt das bei jedem Aufruf in die Konsole. Ein bis drei
  Meldungen je Seitenaufruf, auf jedem geprüften Gerät.

## 9. Was Heart über seinen eigenen Trichter sagt

Zwei Dinge lenken die Aufmerksamkeit auf die falsche Stelle.

**Die Fußzeile ist fest verdrahtet.** `heart-lifeskin-render.js:300`:

```js
`Groesster Verlust bei „${stufe.label}" — dort steht der Preis.`
```

Der halbe Satz stimmt für keine Stufe außer der, für die er einmal
geschrieben wurde. Bei „Pyetja 1" steht die Frage *„Çka ju shqetëson më së
shumti?"* — kein Preis. Der Preis steht auf der ersten Karte des Einstiegs
(*„Analiza është falas"*), also ganz woanders.

**Ausgewählt wird nach Prozent, nicht nach Menschen.** „Pyetja 1" mit −79 %
schlägt „Para fotos" mit −78 % — aber hinter den −79 % stehen 26 Personen und
hinter den −78 % **143**. Der Hinweis zeigt auf den kleineren Verlust.

**Und die entscheidende Stufe fehlt.** Zwischen „Skanimi" (33) und „Pyetja 1"
(7) liegt der Schritt `captured` — die fertige Aufnahme. Er wird bewusst
nicht angezeigt, weil er keinen eigenen Bildschirm hat. Dadurch verschmelzen
aber zwei ganz verschiedene Fehler zu einer Zahl:

- die Kamera ging nie auf oder wurde verweigert, gegen
- die Kamera lief, aber der Scan wurde nie fertig (6.1 und 6.2).

Solange `captured` nicht in der Anzeige steht, sagt −79 % nur *dass* dort
etwas verloren geht, nicht *was*.

Nebenbei, aus den Zahlen selbst ablesbar: **Pyetja 1 bis Numri stehen alle
auf 7.** Über sechs Bildschirme — vier Fragen, Name, Nummer — geht kein
einziger verloren. Die Fragen kosten nichts. Der ganze Verlust liegt davor.

## 10. Wo die 78 Prozent nach dieser Messung liegen

Nach Beweislage, absteigend:

1. **Ein Teil der 184 war nie ein Mensch, der hingesehen hat** (Abschnitt 3).
   Größe unbekannt, weil die Sichtbarkeit nicht mitgeschrieben wird.
2. **Ein Teil hat auf eine Seite gesehen, die noch leer war** (Abschnitt 4).
   Auf 3G bis zu neun Sekunden lang.
3. **Der Rest hat einen einwandfrei stehenden Bildschirm gesehen und ist
   trotzdem gegangen.** Das ist dann keine technische Frage mehr, sondern
   eine von Anzeige und Versprechen.

Für den zweiten Verlust (Skanimi 33 → Pyetja 1: 7) liegen dagegen zwei
handfeste technische Ursachen auf dem Tisch: 6.1 und 6.2.

## 11. Der Prüfstand

`tests/lifeskin-trichter-pruefstand/` — sechs Skripte, von Hand zu starten,
nicht Teil von `npm test` (sie starten Browser und reden mit dem Netz).
Beschreibung und Aufrufe stehen in der README daneben. Ergebnisse und
Aufnahmen landen unter `test-results/lifeskin-trichter/` (ignoriert).

## Durchgeführt / nicht durchgeführt

- Geprüft: `https://www.mnyra.com/lifeskin` (echte Auslieferung) und der
  lokale Server. **Mobil zuerst**, Desktop nur als Ergänzung.
- `npm run test:unit`: 2203 Tests, 0 Fehler.
- `npm run build` **nicht** ausgeführt: An `apps/` wurde nichts geändert, es
  gibt also nichts zu bündeln. Keine Bündeldatei hat sich geändert.
- Firestore-Schreibzugriffe abgefangen; **keine echte Sitzung angelegt**.
- Kein Deploy, keine Regeländerung, keine Produktionsdaten gelesen.
- Nicht prüfbar: echte Gesichter vor einer echten Frontkamera, iOS-Sparmodus
  und Lockdown-Modus, Safari älter als 26 (kein Testgerät verfügbar) —
  darum die statische Prüfung in Abschnitt 4.

---

# 12. Was daraufhin umgesetzt wurde

Vier Punkte, in der Reihenfolge, in der sie besprochen wurden. Nur Handy —
Desktop ist ausdrücklich kein Ziel und bleibt deshalb, wie er ist.

## 12.1 Punkt 1: Die Zahl sagt jetzt, was sie meint

Die Sitzung hält beim Anlegen fest, ob die Seite **sichtbar** war
(`device.gesehen`, `lifeskin-session.js`). Wird eine vorgeladene Seite
später doch geöffnet, wird das nachgemeldet — sonst wäre die neue Zahl
genauso falsch wie die alte, nur andersherum.

Heart zeigt dafür eine neue Zeile **zwischen** „Fillo skanimin" und „Para
fotos": **„Seite gesehen"**. Der Verlust darunter wird ab jetzt gegen sie
gerechnet statt gegen die Ladungen.

**Keine Regeländerung nötig, und das war der entscheidende Punkt:** Das
Merkmal liegt *in* `device`, und die Firestore-Regel prüft `device` nur auf
`is map`. Ein neues Feld auf oberster Ebene hätte `hasOnly()` verletzt — und
`hasOnly` weist das **ganze Dokument** ab. Bis eine neue Regel eingespielt
wäre, hätte der Trichter still gar nichts mehr gezählt. Ein Test hält genau
das fest (`tests/lifeskin-sichtbarkeit.test.mjs`).

Fehlt das Merkmal, gilt „gesehen". Jede Sitzung von vorher hat es nicht; als
„nicht gesehen" gelesen fiele der Trichter der Vergangenheit auf null, und
das wäre eine erfundene Zahl.

Nebenbei repariert: Die Fußzeile des Trichters behauptete fest verdrahtet
„— dort steht der Preis", egal an welcher Stufe sie hing. Jetzt steht dort,
wieviele Menschen es sind: *„143 von 184 gehen hier weg."*

## 12.2 Punkt 2: Der Text ist sofort da

Der Text des Einstiegs steht jetzt **im Aufbau** statt erst von JavaScript
gesetzt zu werden. Gemessen auf 3G über HTTP/2 mit Brotli — so, wie die
Seite wirklich ausgeliefert wird —, Median aus fünf Läufen:

| | Text sichtbar | Knopf antwortet |
|---|---|---|
| vorher | **2305 ms** | 2311 ms |
| nachher | **507 ms** | 510 ms |

Das ist der Punkt, an dem aus „sieht aus wie kaputt" ein Angebot wird.

Der Preis dafür ist eine zweite Wahrheit, und die wird bewacht:
`tests/lifeskin-einstieg-feststehend.test.mjs` vergleicht den Text im Aufbau
Zeichen für Zeichen mit `EINSTIEG_KARTEN` und `OBERFLAECHE`. Läuft er
auseinander, ist der Test rot.

Die zweite Sprache bleibt einziehbar: `#ls-karten` trägt `data-sprache`, und
`#kartenBauen()` baut neu, sobald die Sprache nicht stimmt. Für den
albanischen Besucher — also für jeden, der heute kommt — fällt dabei nichts
an.

**Und der Fehler, den der feststehende Text erst erzeugt hat:** Der Knopf
sieht fertig aus, bevor der Griff daran hängt. Im Prüflauf wurde in dieses
Fenster getippt und die Seite blieb auf Bildschirm 1 stehen — ein
beschrifteter, tauber Knopf ist schlimmer als ein unbeschrifteter. Ein
kurzer Aufsatz ganz oben in `index.html` merkt sich den Tipp, der Knopf
zeigt sichtbar, dass er angekommen ist, und `#frueherTippNachholen()` holt
ihn nach, sobald die Sitzung steht. Nachgemessen auf 3G und schlechtem 3G:
Der Besucher landet auf Bildschirm 2, und `named` steht genau einmal da.

Der Aufsatz steht **vor** dem Stilblatt. Ein Skript wartet auf jedes
Stilblatt davor — weiter unten gab es genau das Fenster wieder, das er
schließen soll. Das war im Prüflauf sichtbar und ist behoben.

## 12.3 Punkt 3: Nicht angefasst

Der Scan endet weiter genau dann, wenn die Ringe zugehen
(`#abschlussFaellig`, `lifeskin-app.js`). Daran wurde nichts geändert — die
Sorge, dort viel kaputtmachen zu können, ist berechtigt.

Damit bleibt offen, was in Abschnitt 6.2 steht: Wird nie ein Gesicht
erkannt, gibt es keine Zeitgrenze und keine Meldung; der Ausweg liegt hinter
„Si funksionon?". Das ist bewusst so stehengelassen und kein Versehen.

## 12.4 Punkt 4: Quer wird gar nicht erst angefangen

Statt eines Bildschirms, der halb funktioniert, steht quer die Bitte, das
Telefon zu drehen — im Trichter **und** auf der Befundseite unter
`/analiza/`, denn dort liegen quer „Kopjo linkun" und „Si funksionon?" unter
der Falz, und die Seite lässt sich nicht schieben. Das sind beide Wege, auf
denen wir den Patienten später erreichen.

Reines CSS, kein Zustand: Dreht der Besucher zurück, steht er genau dort,
wo er war.

**Nur auf Telefonen** (`orientation: landscape` und `max-height: 560px`).
Tablet und Rechner bleiben frei — dort wäre „Drehen Sie das Telefon" ein
Satz, der nichts bedeutet, und die Befundseite trägt den Kaufknopf.

Geprüft in WebKit und Chromium, quer und hoch, auf Telefon, Tablet und
Rechner: Die Sperre deckt quer den ganzen Bildschirm und liegt obenauf, und
sie erscheint nirgends sonst.

## 12.5 Was der Prüfstand nach der Umsetzung sagt

542 Prüfungen auf 20 Kombinationen, lokal:

- **Alle 14 Handy-Kombinationen hochkant**: Knopf beschriftet, im Bild,
  vom Daumen zu treffen, Bildschirm 2 kommt, `named` wird gezählt.
- **Beide Telefone quer**: Sperre steht, deckt den ganzen Bildschirm, liegt
  obenauf, sagt was zu tun ist.
- Übrige Fehler: der Kameraschirm auf **Desktop** (außerhalb des Ziels, die
  Sperre gilt dort bewusst nicht) und zwei Meldungen der Prüfumgebung
  (Fremd-CDN hinter dem Sandkasten-Proxy, fehlende GPU im Container).

`npm run test:unit`: **2225 Tests, 0 Fehler** (1 übersprungen, wie vorher).

## 12.6 Durchgeführt / nicht durchgeführt

- `npm run test:unit`: 2225 Tests, 0 Fehler.
- `npm run build`: ausgeführt. **Keine getrackte Bündeldatei hat sich
  geändert** — der Trichter liegt nicht im Bündel von menyra-social, und
  `dist/` ist ignoriert.
- `npm run lint`: keine neuen Meldungen in geänderten Dateien. Die zwei
  bestehenden Fehler (`structuredClone` in zwei fremden Testdateien) sind
  unverändert.
- `npm run format:check`: 7 Warnungen, unverändert gegenüber vorher
  (gegengeprüft mit `git stash`).
- **Mobil zuerst geprüft**, Desktop nur als Ergänzung — siehe oben.
- Firestore-Schreibzugriffe in allen Läufen abgefangen; **keine echte
  Sitzung angelegt**. Keine Regeländerung, kein Deploy von Rules oder
  Functions.
- Nicht prüfbar geblieben: echte Gesichter vor einer echten Frontkamera.

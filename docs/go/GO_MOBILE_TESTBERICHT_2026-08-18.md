Status: CURRENT
Last updated: 2026-08-18

# Mnyra GO auf dem Telefon - Testbericht

Geprueft wurde Mnyra GO so, wie ein Gast und ein Wirt es benutzen: auf
Telefonbildschirmen, mit dem lokalen Server und den Firebase-Emulatoren,
gegen echte Angebote und echte Buchungen.

Dieser Bericht sagt zuerst, was kaputt ist und wen es trifft. Was gut
funktioniert, steht weiter unten - es ist mehr, als die Fehlerliste vermuten
laesst.

---

## 0. Auf einen Blick

| # | Befund | Wen es trifft | Schwere | Nachgewiesen |
| --- | --- | --- | --- | --- |
| G1 | Schnelles Tippen aendert die Gruppengroesse (4 wird zu 2) | Gast und Lokal | hoch | ja, 2/2 |
| G2 | GO kennt die am Eingang gewaehlte Stadt nicht | Gast und Lokal | hoch | ja, jedes Mal |
| G3 | "5193,4 km" auf jeder Angebotskarte | Gast | hoch | ja, jedes Mal |
| L1 | Panel rechnet mit der Uhr des Telefons | Lokal | hoch | ja |
| G4 | "Kopjo linkun" meldet Erfolg ohne Zwischenablage | Gast | mittel | ja |
| G5 | "Shiko menunë" tut nichts | Gast | mittel | ja |
| G6 | Streifen zur laufenden Oferta liegt unter der Seite | Gast | mittel | ja |
| G7 | Kleine Telefone: Wisch-Bahn liegt nach dem Annehmen ausserhalb des Bildes | Gast | hoch (kleine Geraete) | ja |
| G8 | Zurueck-Taste fuehrt aus Mnyra heraus statt ins Qyteti | Gast | hoch (Android) | ja |
| G9 | Neuladen auf /mnyra-go zeigt wieder das Formular statt der Oferta | Gast | mittel | ja |
| L2 | "0 oferta aktive", obwohl Oferten laufen | Lokal | mittel | ja |
| L3 | Hauptbuch-Zeile wird nach der Antwort geschrieben | Mnyra | mittel | Quelltext |
| L4 | Tagesgrenze gilt pro Lokal, nicht pro Oferta | Lokal | zu klaeren | ja |

Nicht gefunden - und danach wurde gesucht: doppelte Buchungen, verlorenes
Geld, falsche Provision, Absturz ohne Speicher, unerreichbare Knoepfe,
waagrechtes Rutschen. Siehe Abschnitt 4.

---

## 1. Wie geprueft wurde

- Lokaler Webserver `http://127.0.0.1:5173` (`npm run dev`).
- Firebase-Emulatoren (Auth, Firestore, Functions) mit Projekt `mnyra-local`.
  Keine Produktionsdaten, kein Deploy.
- Testdaten: Lokal "Bro Pizza" in Prishtina mit drei GO-Angeboten, dazu ein
  zweites Lokal in Prizren. Konto des Wirts: `bropizza@mnyra.com`.
- Geraete (Bildschirm, Zeigergeraet, Kennung): iPhone 13, iPhone SE,
  iPhone 17 Pro Max, Galaxy S24 (mit Samsung-Internet-Kennung), Galaxy S9+.
- Automatisierte Faelle: `tests/go-mobile/` (Gast und Lokal getrennt).

Zur Einordnung: Die vorhandenen Suiten laufen sauber durch - 1202 Unit-Tests,
21 Rules-Tests, 4 Functions-Tests, alle gruen, dazu `npm run build` ohne
Aenderung an den eingecheckten Bundle-Dateien. Die Befunde in diesem Bericht
liegen nicht in den Bausteinen, sondern **zwischen** ihnen: im Browser, auf
einem Telefon, im Zusammenspiel von Formular, Zustand und Adresse. Genau
deshalb sieht man sie nur so.

### Eine Grenze, die offen genannt gehoert

In dieser Umgebung ist nur Chromium installiert; der WebKit-Browser laesst
sich hier nicht herunterladen (der Netzzugang blockiert die Quelle). "iPhone"
heisst in diesem Bericht deshalb: iPhone-Bildschirm, Touch-Bedienung und
iPhone-Kennung - **nicht** die Safari-Engine.

Alles, was an der Engine haengt, muss auf einem echten iPhone nachgeprueft
werden. Die Liste dafuer steht in Abschnitt 7.

---

## 2. Was den Gast trifft

### G1 - Die gewaehlte Gruppengroesse geht verloren, wenn der Daumen schnell ist

**Schwere: hoch. Reproduziert 2 von 2 Versuchen.**

Der Gast tippt im ersten Schritt auf "4 persona" und sofort danach auf
"Vazhdo". Die Karte zeigt beim Tippen richtig "4 persona" - gebucht werden
**2**. Wartet man rund eine Viertelsekunde zwischen den beiden Tipps, stimmt
die Zahl.

Gemessen (iPhone 13, gegen den Emulator):

```
wait=0ms   gewaehlt=4 -> gebucht=2
wait=0ms   gewaehlt=4 -> gebucht=2
wait=250ms gewaehlt=4 -> gebucht=4
```

Der Zustand direkt nach dem Tippen zeigt, woran es liegt:

```
nach Klick   {"value":"4","scrollTop":44,"label":"4 persona"}
nach Vazhdo  Rad ist weg
zurueck      {"value":"2","scrollTop":44,"label":"2 persona"}
```

`pickWheelValue()` setzt den Wert und laesst das Rad danach **sanft**
dorthin scrollen (`behavior: "smooth"`). Bis die Bewegung ankommt, steht
`scrollTop` noch auf der alten Zeile. Jedes Scroll-Ereignis laeuft durch
`readWheel()`, und das nimmt die Position als Wahrheit - es ueberschreibt
die getippte Zahl mit der, die gerade unter dem Band steht.

*Datei:* `apps/menyra-social/core/go/go-page-view-controller.js`,
`pickWheelValue()` (Zeile ~733) und `readWheel()` (Zeile ~716).

**Was das kostet:** Vier Leute kommen, das Lokal erwartet zwei. Die Gebuehr
wird nach der bestaetigten Zahl gerechnet, der Wirt korrigiert sie also im
Panel - aber die Karte des Gastes sagt bis dahin etwas anderes als seine
Gruppe, und genau daraus entsteht Streit an der Tuer.

**Vorschlag:** Der Tipp gewinnt. In `pickWheelValue` merken, auf welche Zeile
programmatisch gefahren wird, und `readWheel` so lange aussteigen lassen, bis
`scrollTop` dort angekommen ist (oder fuer den Tipp `behavior: "auto"` nehmen).

---

### G2 - GO kennt die Stadt nicht, die der Gast am Eingang gewaehlt hat

**Schwere: hoch. Reproduziert in jedem Durchgang.**

Der Gast gibt beim Betreten "Prishtina" an. Oeffnet er danach Mnyra GO,
steht im Schritt "Ku?" **"Shto qytetin tënd"** - leer. Tippt er auf
"Merr ofertat", geht die Suche ohne Stadt hinaus:

```
REQ goSearch {"request":{"city":"","partySize":2,"intent":"unsure","lat":null,"lng":null}}
```

Der Grund steht in `apps/menyra-social/social-app.js` (Zeile 2355-2359):
GO liest `state.viewerLocation`. Dieses Feld wird **nirgends im Quelltext
geschrieben**. Die gewaehlte Stadt liegt unter dem Schluessel
`mnyra_social_feed_viewer_location_v1` - so lesen sie Feed, Marktplatz,
Discovery und CRM.

Folgen, beide am laufenden System gemessen:

- Ein Gast in Prishtina bekommt Angebote aus Prizren angeboten:
  ```
  Suche ohne Stadt:  Bro Pizza (Prishtina), Bro Pizza Prizren (Prizren)
  Suche mit Stadt:   Bro Pizza (Prishtina)
  ```
- Ab 120 aktiven Angeboten im ganzen Land wird es fuer das Lokal gefaehrlich:
  Die Kandidatenabfrage holt `limit(120)` nach Dokumentpfad, und die
  Nachschau fuer die gefragte Stadt laeuft nur, wenn eine Stadt mitkam
  (`functions/go/go-service.js`, `loadCandidateOffers`). Ohne Stadt kann ein
  Lokal aus dem Fenster fallen und ist fuer seine eigenen Gaeste unsichtbar -
  ohne Fehlermeldung, ohne dass jemand es merkt.

**Vorschlag:** `getCityFn`/`getCoordsFn` in `social-app.js` denselben
gespeicherten Datensatz lesen lassen, den der Feed benutzt, und den Schritt
"Ku?" damit vorbelegen.

---

### G3 - "5193,4 km" steht auf jeder Angebotskarte

**Schwere: hoch (Vertrauen). Reproduziert in jedem Durchgang.**

Auf der Ergebniskarte steht:

```
Bro Pizza po ju ofron -30% në ushqim ... 2 persona · Gjithmonë · 5193.4 km
```

5193 km ist die Entfernung von Prishtina zum Nullpunkt der Weltkarte
(0°/0°, Golf von Guinea).

Der Browser schickt `lat: null, lng: null`, wenn er keinen Standort hat.
Auf dem Server liest `normalizeGoSearchRequest` das so:

```js
const lat = toNumber(source.coords?.lat ?? source.lat, NaN);
// toNumber: Number(null) === 0, und 0 ist endlich -> lat = 0
```

Damit sind die Koordinaten des Gastes {0,0} statt "unbekannt", und
`goDistanceKm` rechnet brav aus, wie weit Prishtina vom Aequator entfernt
ist. Fehlt das Feld ganz, funktioniert es richtig - deshalb faellt es in
Tests mit handgeschriebenen Anfragen nicht auf.

*Datei:* `shared/go/go-matching-core.js`, Zeile 141-142.

**Vorschlag:** `null` wie "nicht angegeben" behandeln
(`source.lat ?? NaN`, oder in `toNumber` `value === null` abfangen).

---

### G4 - "Kopjo linkun" meldet Erfolg, auch wenn nichts kopiert wurde

**Schwere: mittel. Reproduziert.**

Nachgestellt auf dem iPhone-13-Profil, mit entferntem `navigator.clipboard`
(so verhalten sich In-App-Browser und Seiten ohne https):

```
clipboard vorhanden: false
Knopf vorher: "Kopjo linkun"  ->  nachher: "U kopjua"
```

Der Link ist der einzige Weg zurueck zu einer Oferta, wenn der Browser
nichts speichert (privates Fenster, geloeschte Daten, anderes Telefon). Der
Knopf sagt trotzdem "kopiert", wenn es die Zwischenablage gar nicht gibt:

```js
Promise.resolve(win?.navigator?.clipboard?.writeText?.(link))
  .then(() => { current.linkCopied = true; render(); })
```

Fehlt `navigator.clipboard` - kein sicherer Kontext, aeltere iOS-Version,
In-App-Browser von Instagram oder Facebook -, ist der Ausdruck `undefined`,
`Promise.resolve(undefined)` gelingt, und der Gast bekommt die Bestaetigung
fuer etwas, das nicht passiert ist.

*Datei:* `apps/menyra-social/core/go/go-page-view-controller.js`, Zeile 947-960.

**Vorschlag:** Nur bestaetigen, wenn `writeText` tatsaechlich existiert und
das Versprechen erfuellt wird; sonst den Link markiert stehen lassen.

---

### G5 - "Shiko menunë" tut nichts

**Schwere: mittel.**

Auf der bestaetigten Buchung stehen drei Knoepfe. "Udhëzime" oeffnet die
Karte, "Hyr" fuehrt zur Anmeldung - **"Shiko menunë" bleibt ohne Wirkung**
(gemessen: gleiche Adresse, gleicher Bildschirm nach dem Tippen).

Das ist bekannt und im Quelltext vermerkt: `openMenuFn` wird in
`social-app.js` (Zeile 2374-2378) bewusst nicht verbunden, weil die Bruecke
zur Profilseite fehlt.

**Vorschlag:** Entweder die Bruecke anschliessen oder den Knopf bis dahin
weglassen. Ein Knopf, der nichts tut, ist auf dem Telefon ein Fehler und
kein Platzhalter - der Gast tippt ihn drei Mal und haelt die App fuer kaputt.

---

### G6 - Der Streifen zur laufenden Oferta liegt unter der Seite

**Schwere: mittel.**

Solange eine Oferta laeuft, setzt GO einen Streifen an den unteren Rand
(`renderGoStickyBarCore`). Gemessen im Qyteti:

```
{ "zIndex": "auto", "position": "fixed", "hitsSticky": false,
  "topElement": "P.mt-1 text-[13px] font-semibold text-white/70" }
```

Der Streifen traegt die Tailwind-Klasse `z-[55]` - und **diese Klasse steht
in keiner ausgelieferten CSS-Datei**. Dasselbe gilt fuer `text-white/50`
und `text-white/80` aus demselben Bauteil.

Dahinter steckt etwas Groesseres: `apps/menyra-social/styles/tailwind.generated.css`
ist eine eingecheckte Datei, die **kein npm-Skript erzeugt**. Jede neue
Utility-Klasse, die seit der letzten Erzeugung im Quelltext dazugekommen
ist, existiert im Browser nicht - still, ohne Fehler.

**Vorschlag:** Kurzfristig die drei Werte als eigene Regeln in das
GO-Stylesheet schreiben. Grundsaetzlich: einen Befehl, der
`tailwind.generated.css` erzeugt, und eine Pruefung, die meldet, wenn eine
benutzte Klasse darin fehlt.

---

### G7 - Auf kleinen Telefonen steht die Wisch-Bahn ausserhalb des Bildes

**Schwere: hoch auf kleinen Geraeten. Reproduziert.**

Geprueft wird, ob die Bahn im Augenblick nach "Prano ofertën" ueberhaupt
unter dem Finger liegt: drei Punkte auf ihrer Mittellinie, links, Mitte,
rechts. Das Ergebnis haengt allein an der Bildhoehe:

```
iPhone SE          320 x 568   ausserhalb des Bildes
Galaxy S9+         320 x 658   unter der Kopfzeile
iPhone 13          390 x 664   unter der Kopfzeile
iPhone 17 Pro Max  440 x 763   erreichbar
Galaxy S24         360 x 780   erreichbar
```

Nachgemessen nach anderthalb Sekunden Ruhe:

```
iPhone SE   Seite steht bei 432  Wisch-Bahn bei -66 bis -4   -> weiterhin ausserhalb
iPhone 13   Seite steht bei 286  Wisch-Bahn bei  80 bis 142  -> knapp unter der Kopfzeile (72)
Galaxy S24  Seite steht bei 170  Wisch-Bahn bei 196 bis 258  -> sichtbar
```

Auf dem iPhone SE sieht der Gast nach dem Annehmen als Erstes die **untere
Haelfte** der Seite: den abgeschnittenen Link, "Kopjo linkun",
"Shiko menunë / Udhëzime" und darunter "Anulo". Die Ueberschrift "Oferta
është e jotja" und die Bahn "Rrëshqit për ta aktivizuar" liegen oberhalb des
Bildes.

Auf dem iPhone 13 ist es besser, aber nicht gut: Die Bahn steht ganz oben am
Rand, und alles darueber - "Oferta është e jotja", der Name des Lokals, der
Vorteil, die Gueltigkeit - ist ebenfalls weggescrollt. Der Gast bekommt die
Bestaetigung seiner Oferta nicht zu sehen, sondern muss nach oben wischen,
um sie zu finden.

Der Grund ist der Wechsel der Ansicht ohne Rueckstellung des Bildlaufs: Die
Seite behaelt die Position, an der eben noch die Ergebnisliste stand
(`scrollY = 432`), und die neue, kuerzere Ansicht beginnt darueber.

**Was das kostet:** Der Gast hat die Oferta - und der erste Knopf, den er
sieht, heisst "Anulo". Auf dem iPhone 13 sind es acht Punkte Abstand zur
Kopfzeile; in dem Augenblick direkt nach dem Aufbau lag die Bahn dort sogar
unter der Kopfzeile (im Testlauf gemessen).

**Vorschlag:** Beim Wechsel in die Buchungsansicht an den Anfang der Seite
springen (oder die Karte mit `scrollIntoView({ block: "start" })` holen), so
wie es die Ergebnisliste bereits tut.

---

### G8 - Die Zurueck-Taste fuehrt aus Mnyra heraus

**Schwere: hoch auf Android. Reproduziert auf beiden Geraeten.**

Der Gast ist im Qyteti, tippt auf die Pille "MNYRA GO" und drueckt danach die
Zurueck-Taste. Gemessen:

```
URL vor GO:        http://127.0.0.1:5173/feed
URL in GO:         http://127.0.0.1:5173/mnyra-go
URL nach Zurueck:  about:blank          (leere Seite, 0 Zeichen Text)
```

Auf dem Telefon heisst `about:blank`: die vorige Seite - also die Seite, von
der der Gast zu Mnyra gekommen ist, oder gar nichts. Auf Android ist die
Zurueck-Taste die Hauptbewegung; auf dem iPhone ist es der Wisch vom linken
Rand.

Die App kennt das Problem bereits und hat es fuer einen anderen Weg geloest.
In `app-events-shell-bind-utils.js` steht ueber dem Wechsel per Schublade
oder Panel-Kachel:

> Bisher schrieb jeder dieser Wechsel die Adresse nur um (replaceState): der
> vorige Tab verschwand dabei spurlos aus dem Verlauf des Browsers.

Dort wird jetzt `state.__nextRouteHistoryMode = "push"` gesetzt (Zeile 966).
`openMainHeaderTab` - der Weg der Pillen, ueber den GO erreicht wird - setzt
es **nicht** (Zeile 882-897).

**Vorschlag:** In `openMainHeaderTab` dieselbe Zeile setzen. Der Wechsel auf
denselben Tab faellt in `syncActiveTabRouteQuery` ohnehin heraus, der Verlauf
laeuft also nicht voll.

---

### G9 - Nach dem Neuladen steht auf der GO-Seite wieder die erste Frage

**Schwere: mittel.**

Der Gast hat eine laufende Oferta, ist auf `/mnyra-go` und laedt die Seite
neu (oder kommt spaeter ueber dieselbe Adresse zurueck). Gemessen:

```
NACH NEULADEN: MNYRA GO ... Sa persona jeni? 2 persona 1 person 2 persona ...
```

Statt seiner Oferta bekommt er die erste Frage des Formulars. Der Browser
weiss von der Buchung - die Karte im Qyteti zeigt sie ("1 aktive") -, aber
die GO-Seite selbst fragt beim Aufbau nicht danach. Der Weg zurueck fuehrt
nur ueber Qyteti und die Karte (bzw. ueber den Streifen, der laut G6 nicht
antippbar ist).

**Vorschlag:** Beim Aufbau der GO-Seite dieselbe Erinnerung lesen, aus der
die Karte im Qyteti ihren Zustand nimmt (`readGoActiveBookings`), und mit
einer laufenden Buchung in der Buchungsansicht starten - der Server bleibt
dabei die Wahrheit, die Erinnerung ist nur der Schluessel.

---

## 3. Was das Lokal trifft

### L1 - Das Panel rechnet mit der Uhr des Telefons

**Schwere: hoch. Reproduziert.**

Dieselbe Buchung, derselbe Augenblick, zwei Telefone mit verschiedener
Zeitzone:

```
Telefon auf Europe/Belgrade:
  Dashboard-Karte: "Mnyra GO 1 · 0 oferta aktive · 1 rezervime sot"
  Buchung im Panel: "Rreth 15:35"

Telefon auf Pacific/Auckland:
  Dashboard-Karte: "Mnyra GO 1 · Krijo oferta për klientët që kërkojnë tani."
  Buchung im Panel: "Rreth 01:35"
```

Das zweite Telefon zeigt die Karte im Ruhezustand, als liefe nichts - dabei
wartet ein Gast.

Der Rest von GO rechnet ueberall mit der Zone des Lokals
(`buildGoDayKey`, `resolveGoLocalTime`). Zwei Stellen im Panel tun es nicht:

- `todayKey()` in `business-go-runtime-controller.js` (Zeile 58) baut den
  Tagesschluessel aus `getFullYear/getMonth/getDate` des Geraets und
  vergleicht ihn mit `booking.dayKey`, den der Server in der Zone des Lokals
  geschrieben hat (benutzt in Zeile 91 und 165).
- `clock()` in `business-go-render-utils.js` (Zeile 242) formatiert die
  Uhrzeit mit `getHours()` des Geraets.
- `setPause()` in `business-go-runtime-controller.js` (Zeile 364-378) rechnet
  "Pause bis morgen" mit `date.setHours(24, 0, 0, 0)` - Mitternacht auf der
  Uhr des Telefons. Steht das Telefon in einer anderen Zone, endet die Pause
  Stunden zu frueh oder zu spaet. Ein Wirt, der pausiert, weil das Lokal voll
  ist, verlaesst sich darauf, dass GO bis Mitternacht **seines** Tages still
  bleibt.

Nebenbei aufgefallen: `setPause` schreibt bei jedem Pausieren `enabled: true`
mit. Ein Lokal, das GO abgeschaltet hatte, schaltet es damit beim Pausieren
wieder ein.

**Wen es trifft:** jedes Telefon, dessen Zeitzone nicht die des Lokals ist -
eine falsch gestellte Uhr, ein Geraet auf UTC, ein Wirt im Ausland. Solange
Telefon und Lokal in derselben Zone stehen, stimmen die Zahlen; sie stimmen
aber aus Zufall, nicht aus Rechnung. Sobald Mnyra ein Lokal ausserhalb dieser
Zone hat, stimmt es fuer dieses Lokal nie mehr.

Die Uhrzeit an der Buchung ist der haerteste Fall: Sie steht falsch, ohne
dass irgendetwas darauf hinweist. "Rreth 01:35" ist eine Aussage ueber den
Gast, und der Kellner glaubt sie.

**Vorschlag:** Beide Stellen ueber `buildGoDayKey`/`resolveGoLocalTime` mit
der Zone aus `goSettings.timeZone` fuehren - dieselbe Zone, mit der die
Ansicht in Zeile 252-255 bereits richtig rechnet.

---

### L2 - "0 oferta aktive", obwohl das Lokal drei aktive Oferten hat

**Schwere: mittel.**

Auf der Panel-Startseite steht dauerhaft:

```
Mnyra GO · 0 oferta aktive · 1 rezervime sot
```

Die Karte liest `counts.activeOffers`
(`dashboard-view-controller.js`, Zeile 872). Der Zaehler liefert aber nur
`{ unseen, open, today, guests }` (`go-boot.js`, Zeile 84) - ein Feld
`activeOffers` gibt es nicht, also ist es immer `0`.

Nebenwirkung: Solange keine Buchung offen ist, sind beide Zahlen 0, und die
Karte faellt in den Text "Krijo oferta ..." zurueck - das Lokal bekommt zu
sehen, es habe nichts angelegt, obwohl seine Oferten laufen.

---

### L3 - Die Gebuehr wird nach der Antwort geschrieben, nicht davor

**Schwere: mittel (Geld). Statisch gefunden, nicht ausgeloest.**

In `finalizeBooking` (`functions/go/go-service.js`, Zeile 1230-1269) gehen
drei Schreibvorgaenge ohne `await` hinaus:

```js
ledgerRef().set(buildGoChargeEntry({...})).catch(() => {});
bookingCodeRef(loaded.id).set({ usedAt: finalizedAt }, { merge: true }).catch(() => {});
bump("finalized", 1); bump("visitors", ...); bump("commissionCents", ...);
return { booking: ..., commission };
```

In einer Cloud Function endet die Rechenzeit mit der Antwort. Was danach
noch laufen soll, kann abgeschnitten werden. Der Posten an der Buchung ist
sicher (er liegt in der Transaktion), die **Zeile im Hauptbuch ist es nicht**.
Im Emulator wurde sie in allen Durchgaengen geschrieben; unter Last in der
Cloud ist das nicht zugesichert.

**Vorschlag:** Die Hauptbuch-Zeile `await`en (sie gehoert zum Geld), die
Tageszahlen duerfen beilaeufig bleiben.

---

### L4 - Die Tagesgrenze eines Angebots gilt fuer das ganze Lokal

**Zur Klaerung, kein Fehlerbefund.**

`limits.dailyGroups` eines Angebots wird gegen einen Zaehler geprueft, der
pro Ort und Tag gefuehrt wird (`day__<locationId>__<dayKey>`), nicht pro
Angebot. Beobachtet: Ein Angebot mit "5 Gruppen am Tag" wurde abgewiesen,
nachdem fuenf Gruppen ueber **andere** Angebote desselben Lokals gebucht
hatten (`daily_limit_reached`).

Wenn das so gemeint ist, sollte die Beschriftung im Editor es sagen
("... im Lokal", nicht "... fuer diese Oferta").

---

## 4. Was gut funktioniert

Das ist keine Hoeflichkeitsliste - jeder Punkt wurde absichtlich zu brechen
versucht und hat gehalten:

- **Doppeltipp auf "Prano ofertën"**: zwei Tipps, **eine** Buchung. Der
  Schluessel pro Absicht (`idempotencyKey`) haelt, was er verspricht.
- **Netz weg mitten im Buchen**: kein erfundener Erfolg, kein Absturz, und
  nach dem Wiederversuch trotzdem nur eine Buchung.
- **Ausverkauft**: Zwei Gaeste, ein letzter Platz - der zweite bekommt einen
  Satz statt einer zweiten Buchung. Es blieb bei genau einer.
- **Privates Fenster (kein `localStorage`)**: GO bleibt bedienbar. Der
  Speicher-Zugriff ist ueberall abgesichert; ein Gast ohne Gedaechtnis
  bekommt eine neue Kennung und findet seine Oferta ueber den Link.
- **Fingerziele**: In den Ergebnissen und in der Buchung ist auf keinem der
  fuenf Geraete ein Ziel unter 44x44 Punkten, und kein Feld traegt Schrift
  unter 16px (auf iOS zoomt der Browser sonst beim Antippen hinein). Zwei
  Ausnahmen gibt es im Formular - siehe Abschnitt 6.
- **Kein waagrechtes Rutschen** auf keiner Breite von 360 bis 440 Punkten -
  auch nicht auf dem Galaxy S9+ und dem iPhone SE.
- **Der Weg des Geldes stimmt.** Gast bucht fuer 4, Wirt bestaetigt 4:
  ```
  booking: status=finalized, partySizeVerified=4, commission=150 Cent
  goLedger: 1 Zeile, amountCents=150, commissionVersion=2026-08
  ```
  Cent statt Kommazahlen, eingefrorene Preisfassung, ein Posten je Gast.
- **Der Code ist ein Einweg-Code**: Nach dem Bestaetigen findet ihn das
  Panel nicht mehr, und es entsteht keine zweite Zeile im Hauptbuch.
- **GO ist leichtgewichtig**: Die GO-Seite selbst wiegt rund 26 kB (gzip).
  Wer GO nie oeffnet, laedt davon nichts.
- **Absagen funktioniert und gibt den Platz frei.** Der Gast tippt "Anulo",
  bestaetigt, und die Buchung steht auf `cancelled` - sie verschwindet nicht,
  sie wechselt den Zustand. Danach zeigt das Qyteti keine laufende Oferta
  mehr.
- **Der Link fuehrt zur Oferta zurueck - auch auf einem fremden Telefon.**
  Geprueft mit einem Galaxy S24, das die Buchung nie gesehen hat: Adresse
  aufgerufen, `goGetBooking` beantwortet, und die Oferta steht da, samt Wisch
  zum Aktivieren. Das ist der Rettungsweg fuer jeden Gast ohne Konto, und er
  traegt.
- **Die Regeln in Firestore sitzen.** Durchgesehen fuer alle GO-Sammlungen:
  Buchungen liest nur, wem sie gehoert oder wer das Lokal fuehrt; die
  Kurzcodes, die Gastsitzungen und das Finanzbuch liest **niemand** aus dem
  Browser - auch das Lokal nicht, und auch Heart nicht. Kapazitaet und
  Tageszahlen sind fuer den Browser schreibgeschuetzt. Genau so muss es sein:
  Koennte das Lokal die Codes nachschlagen, koennte es ohne Gast
  bestaetigen.

---

## 5. Geschwindigkeit

Gemessen auf dem iPhone-13-Profil gegen den lokalen Server, einmal ohne und
einmal mit vierfach gebremstem Prozessor (entspricht ungefaehr einem
Mittelklasse-Telefon):

| Schritt | normal | 4x gebremst |
| --- | --- | --- |
| App geladen | 90 ms | 290 ms |
| GO-Seite offen nach Tipp auf die Pille | 89 ms | 566 ms |
| Suche: Antwort des Servers | 51 ms | 90 ms |
| Suche: bis der Gast den Knopf sieht | 4 929 ms | 5 240 ms |
| bis das Angebot auf dem Schirm steht | 5 009 ms | 5 412 ms |

Zwei Dinge stehen darin:

1. **Die Technik ist schnell.** Der Server antwortet in 50-90 ms, das Modul
   ist in einer halben Sekunde da, auch auf einem langsamen Geraet.
2. **Die Wartezeit ist gewollt**, nicht gemessen: `LIVE_SEND_MS = 3000`,
   danach je Treffer 650 ms und 900 ms Nachlauf. Das ist im Quelltext
   begruendet ("eine Suche, die in 200 ms fertig ist, sieht nicht nach Suche
   aus"). Es ist trotzdem die Zahl, die "GO ist absolut schnell" entscheidet:
   **fuenf Sekunden pro Suche, von denen 4,9 Sekunden Inszenierung sind.**
   Eine Entscheidung, kein Fehler - aber eine, die bewusst getroffen sein
   sollte.

Dazu eine Beobachtung ausserhalb von GO: Der erste Aufruf der App uebertraegt
rund **2 MB**, bevor der Gast das Stadtfeld sieht (`social-app.js` 510 kB,
Firebase 454 kB, Feed 375 kB, Dashboard 122 kB, Menu 82 kB, Auth 79 kB).
Auf einer schwachen Mobilverbindung ist das die eigentliche Wartezeit vor
GO - und das Dashboard-Buendel braucht ein Gast nie.

---

## 6. Kleineres, aber sichtbar

- **Zwei zu kleine Ziele im Formular.** Gemessen auf allen fuenf Geraeten:

  ```
  .mnyra-go-page__ask-back      32 x 32   (der Pfeil zurueck)
  .mnyra-go-page__place-change  37 x 36   (der Stift "Stadt aendern")
  ```

  Apple nennt 44x44 Punkte als Mindestmass, Android 48. Beide liegen
  darunter, und beide stehen an der Stelle, an der ein Gast korrigiert, was
  er gerade falsch getippt hat (`go-page-render-utils.js`, Zeile 202 und 537). Die sichtbare Flaeche darf klein bleiben -
  das Ziel muss groesser werden (Polster oder ein `::before`, das die
  Trefferflaeche aufzieht).
- **Der Karten-Fehler legt sich ueber die Kopfzeile.** Laedt die
  Leaflet-Bibliothek nicht (sie kommt von `cdn.jsdelivr.net` bzw.
  `unpkg.com`), erscheint der Hinweis "Biblioteka e hartes nuk mund te
  ngarkohej" als Blase oben in der Mitte - auf 390 Punkten Breite verdeckt
  sie das Logo, und sie steht auch auf der GO-Seite, die keine Karte
  braucht. In Netzen, die fremde CDNs blockieren (manche Firmen- und
  Mobilfunknetze), begruesst dieser Satz jeden Gast.
- **"go" fehlt in der Liste der reservierten Adressen.** `/go` (die Adresse
  im Buchungslink) und `/mnyra-go` fuehren beide richtig in GO - der
  Tab-Zuordner greift vor der Slug-Suche, und in `vercel.json` faengt die
  Auffangregel `/:landingSlug` beide ab. Nur steht `"go"` nicht in
  `RESERVED_PUBLIC_ROUTE_SEGMENTS` (`public-business-route-utils.js`,
  Zeile 62), waehrend `"mnyra-go"` dort steht. Ein Lokal koennte den Slug
  "go" also belegen - und waere danach unter seiner eigenen Adresse nicht
  mehr erreichbar, weil GO vorgeht. Ein Eintrag in der Liste kostet nichts.
- **`/login` als Adresse fuehrt in den Feed.** Wer die Adresse direkt
  aufruft oder als Lesezeichen hat, landet auf `/feed`; die Anmeldung ist
  nur ueber die Schublade oder ueber "Hyr" in GO erreichbar. Fuer einen
  Wirt, der sich auf dem Telefon anmelden will, ist das eine Sackgasse.
- **`svh` ohne Rueckfall.** Die Abstaende der GO-Seite stehen als
  `clamp(3.5rem, 20svh, 11rem)` (`go-page-render-utils.js`, Zeile 791 und
  939, dazu die Umrisse in `go-page-boundary.js`). Browser ohne `svh`
  - iOS 15.0 bis 15.3, Samsung Internet vor Version 21 - werfen die ganze
  Regel weg, und die Kapitel der Seite rutschen zusammen. Ein
  vorangestelltes `gap: 3.5rem;` genuegt als Rueckfall.
- **Die Anmeldung zoomt auf jedem iPhone hinein.** Gemessen an den beiden
  Feldern der Anmeldung:

  ```
  #authEmail     type="text"      autocomplete=""  inputmode=""  font-size: 14px
  #authPassword  type="password"  autocomplete=""  inputmode=""  font-size: 14px
  ```

  Drei Dinge auf einmal: Unter 16px zoomt iOS Safari beim Antippen in das
  Feld hinein (die Seite springt, und sie springt nicht von selbst zurueck).
  Ohne `autocomplete="username"` / `"current-password"` bietet kein
  Passwortspeicher etwas an - weder iOS noch Android. Und `type="text"`
  statt `type="email"` bringt die Tastatur ohne "@".

  Das ist nicht GO, aber es ist der Weg, den jeder Wirt jeden Morgen geht.
  Die Felder der GO-Seite selbst sind in Ordnung (siehe Abschnitt 4).

---

## 7. Was nur ein echtes iPhone beantworten kann

Chromium mit iPhone-Bildschirm ist nicht Safari. Diese Punkte gehoeren auf
ein echtes Geraet, und zwar in dieser Reihenfolge:

1. **Der Wisch zum Aktivieren.** Die Bahn traegt `touch-action: pan-y`, der
   Griff `touch-action: none` - das ist genau richtig gedacht. Zu pruefen
   ist, ob ein leicht schraeger Zug **neben** dem Griff auf iOS als Scrollen
   gilt (`pointercancel`) und der Gast dann "bis zum Anschlag zieht, ohne
   dass etwas passiert".
2. **Die Tastatur im Stadtfeld.** Ob "Merr ofertat" sichtbar bleibt, wenn
   die Tastatur oben ist, und ob die Seite danach wieder an ihren Platz
   zurueckfaellt.
3. **Der Streifen am unteren Rand** mit `env(safe-area-inset-bottom)` auf
   einem Geraet mit Home-Indikator - zusammen mit der Korrektur aus G6.
4. **Als App vom Homebildschirm (standalone)**: ob "Udhëzime"
   (`window.open` auf Google Maps) dort ueberhaupt oeffnet, und ob der
   Buchungslink im Fragment beim Wiedereintritt ankommt.
5. **Sieben Tage nichts tun.** Safari loescht `localStorage` nach sieben
   Tagen ohne Besuch. Danach ist der gespeicherte Gast-Token weg - die
   Oferta muss ueber den Link wieder auffindbar sein. Genau dafuer gibt es
   ihn; einmal von Hand pruefen.
6. **Grosse Systemschrift** (iOS Bedienungshilfen, Samsung "Schriftgroesse
   gross"): Das Rad rechnet mit festen 44 Punkten je Zeile
   (`GO_WHEEL_ITEM_HEIGHT`). Waechst die Zeile mit der Systemschrift, zeigt
   das Rad eine andere Zahl an, als es speichert.

---

## 8. Wenn es an einem Tag besser sein soll

Nach Wirkung je Aufwand geordnet. Die ersten vier sind kleine Aenderungen an
je einer Stelle:

1. **G3 - die falsche Entfernung** (`go-matching-core.js`, 2 Zeilen).
   Ein `null`, das als 0 gelesen wird. Danach verschwindet "5193,4 km" von
   jeder Karte.
2. **G1 - die Gruppengroesse** (`go-page-view-controller.js`, wenige Zeilen).
   Der Tipp gewinnt gegen das nachlaufende Scrollen.
3. **G8 - die Zurueck-Taste** (`app-events-shell-bind-utils.js`, eine Zeile).
   Dieselbe Zeile, die der Schublade schon gegeben wurde.
4. **L2 - "0 oferta aktive"** (`go-boot.js` / `dashboard-view-controller.js`).
   Entweder den Zaehler liefern oder die Zahl nicht behaupten.
5. **G2 - die Stadt** (`social-app.js`). Etwas groesser, weil GO danach
   wirklich nach Stadt sucht - und genau deshalb wichtig: Es ist der Befund,
   der den Lokalen Gaeste kostet.
6. **L1 - die Uhr des Telefons** (zwei Funktionen im Panel).
7. **G7 / G6 / G9 - der Weg zur eigenen Oferta**: an den Anfang scrollen,
   den Streifen sichtbar machen, beim Neuladen die laufende Oferta zeigen.
   Zusammen ergeben sie den Unterschied zwischen "ich habe eine Oferta" und
   "ich finde meine Oferta nicht mehr".
8. **G4 / G5 - die kleinen Luegen**: nur "kopiert" sagen, wenn kopiert wurde;
   einen Knopf, der nichts tut, weglassen.
9. **L3 - die Zeile im Hauptbuch awaiten.**
10. **Die kleinen Masse** (Abschnitt 6): zwei Fingerziele im Formular auf 44
    Punkte bringen, den Anmeldefeldern 16px, `type="email"` und
    `autocomplete` geben, `svh` einen Rueckfall, `"go"` in die Liste der
    reservierten Adressen.

Danach lohnt sich der Blick auf die zwei groesseren Fragen:

- **Die fuenf Sekunden.** Sie sind eine bewusste Inszenierung. Wenn GO
  "absolut schnell" heissen soll, gehoert diese Zahl auf den Tisch - drei
  Sekunden Senden und 900 ms Nachlauf sind reine Wahl.
- **Die zwei Megabyte vor dem ersten Bild.** Das ist nicht GO, aber es ist
  die Zeit, die vor GO steht. Ein Gast laedt heute Dashboard-, Menu- und
  Auth-Buendel, bevor er die Stadt eingegeben hat.

---

## 9. Der Durchgang, Fall fuer Geraet

17 Faelle auf fuenf Geraeten, gegen den lokalen Server und die Emulatoren.
"FEHLER" heisst hier nicht "Test kaputt", sondern "Befund nachgewiesen" - die
Meldung jedes fehlgeschlagenen Falls nennt ihn im Klartext.

| Fall | iPh SE | S9+ | iPh 13 | iPh 17 PM | S24 |
| --- | --- | --- | --- | --- | --- |
| Code eintippen, bestaetigen, Gebuehr steht im Buch | ok | ok | ok | ok | ok |
| Ein Code loest nur einmal aus | ok | ok | ok | ok | ok |
| Die Karte im Panel zeigt die aktiven Oferten des Lokals | FEHLER | FEHLER | FEHLER | FEHLER | FEHLER |
| Die Zahlen des Panels haengen nicht an der Uhr des Telefons | FEHLER | FEHLER | FEHLER | FEHLER | FEHLER |
| Der ganze Weg: suchen, annehmen, aktivieren | FEHLER | FEHLER | FEHLER | ok | ok |
| Die Stadt vom Eingang kommt in GO an | FEHLER | FEHLER | FEHLER | FEHLER | FEHLER |
| Doppeltipp auf Annehmen erzeugt keine zweite Buchung | ok | ok | ok | ok | ok |
| Netz weg beim Buchen: keine stille Doppelbuchung | ok | ok | ok | ok | ok |
| Ausverkauft: das letzte Angebot geht nur einmal | ok | ok | ok | ok | ok |
| Ohne Speicher im Browser (privater Modus) bleibt GO benutzbar | ok | ok | ok | ok | ok |
| Fingerziele und Schriftgroessen auf allen drei GO-Ansichten | FEHLER | FEHLER | FEHLER | FEHLER | FEHLER |
| Zurueck-Taste fuehrt zurueck ins Qyteti, nicht aus der App | FEHLER | FEHLER | FEHLER | FEHLER | FEHLER |
| Schnelles Tippen: die gewaehlte Gruppengroesse bleibt stehen | FEHLER | FEHLER | FEHLER | FEHLER | FEHLER |
| Keine erfundene Entfernung auf der Angebotskarte | FEHLER | FEHLER | FEHLER | FEHLER | FEHLER |
| Der Streifen zur laufenden Oferta ist antippbar | FEHLER | FEHLER | FEHLER | FEHLER | FEHLER |
| Nach dem Annehmen steht die Wisch-Bahn im Bild | FEHLER | ok | ok | ok | ok |
| Der Gast kann seine Oferta wieder absagen | ok | ok | ok | ok | ok |

Der einzige Fall, der sich zwischen den Geraeten unterscheidet, ist der Weg
nach dem Annehmen (G7): Er haengt an der Bildhoehe und faellt auf jedem
Telefon unter rund 700 Punkten Hoehe. Alles andere trifft alle fuenf
Geraete gleich - Samsung wie iPhone, gross wie klein.

Die beiden Zeilen "Der ganze Weg" und "Absagen" stammen aus dem
Nachlauf: Im Durchgang selbst prueften sie noch die Ecken eines runden
Bedienteils (das ist Geometrie, kein Befund) und den Zustandsnamen
"canceled" statt "cancelled". Beides ist im Test berichtigt und einzeln auf
allen fuenf Geraeten nachgefahren.

---

## 10. Die Testsuite

```
tests/go-mobile/
  seed-go-fixture.mjs        Testlokal, Oferten, Konto des Wirts
  go-admin.ts                Blick in Firestore (Buchungen, Hauptbuch)
  go-page.ts                 Die Handgriffe eines Gastes
  go-mobile.spec.ts          Faelle des Gastes
  go-business-mobile.spec.ts Faelle des Lokals
  playwright.config.ts       iPhone 13 / SE / 17 Pro Max, Galaxy S24 / S9+
```

So laeuft sie:

```bash
npm run emulators:start          # Auth, Firestore, Functions (mnyra-local)
npm run emulators:seed
node tests/go-mobile/seed-go-fixture.mjs
npm run dev                      # 127.0.0.1:5173

MNYRA_E2E_BASE_URL=http://127.0.0.1:5173 \
  npx playwright test --config tests/go-mobile/playwright.config.ts
```

Die Faelle sind so geschrieben, dass ein Fehlschlag den Befund nennt und
nicht nur "expected true". Solange G1, G2, G3, G6, L1 und L2 offen sind,
schlagen die zugehoerigen Faelle fehl - das ist beabsichtigt: Sie sind der
Nachweis, und sie werden gruen, wenn die Fehler weg sind.

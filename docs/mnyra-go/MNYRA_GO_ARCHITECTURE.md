Status: CURRENT
Branch: claude/mnyra-go-page-navigation-gc0b4r
Stand: 2026-08-15

# Mnyra GO - Architektur und Entscheidungen

Umsetzung der Spezifikation "MNYRA GO v1.1". Dieses Dokument haelt fest, wie
das Feature in den bestehenden Mnyra-Stack eingesetzt wird, und begruendet
jede Stelle, an der die Umsetzung von der Spezifikation abweicht.

## 1. Grundsatz

GO ist ein isoliertes Feature-Modul. Es haengt an vier klar benannten
Stellen im Bestand:

- Qyteti (`core/feed`): eine Karte unter den Stories.
- Drawer (`core/app-shell`): ein Eintrag "Mnyra GO" - nicht fuer Konten mit
  Panel, die arbeiten auf der anderen Seite von GO.
- Business-Panel (`core/dashboard`): eine Karte, eine Seite.
- Analytics (`core/analytics`): zusaetzliche Ereignisnamen.
- Firebase Functions: neue Callables, kein Eingriff in bestehende.

Alles Weitere ist neu und additiv. Keine bestehende Sammlung wird umbenannt,
keine bestehende Funktion umgebaut, keine bestehende Route veraendert.

## 2. Schichten

```
shared/go/*.js          reine Domaene: Zeit, Angebot, Matching, Buchung, Gast
        |  (sync -> CJS)
functions/go/*.js       Serverdienst: Transaktion, Kapazitaet, Token, Grenzen
        |  (Callable)
apps/menyra-social/core/go/*.js   Oberflaeche: Karte, Gast-Seite, Panel
```

Die Domaene liegt in `shared/go/` und ist frei von Browser und Firebase.
Server und Client rechnen mit **demselben** Code: Was die Suche zeigt, ist
genau das, was die zweite Pruefung beim Buchen akzeptiert (Punkt 27, 119).
Weil `functions/` CommonJS ist und Node 20 kein ESM per `require` laedt, wird
die Domaene beim Bauen nach `functions/go/generated/*.cjs` uebersetzt - genau
wie es `functions/scripts/sync-heart-shared.cjs` fuer Heart bereits tut. Ein
Test vergleicht die erzeugten Dateien mit der Quelle, damit sie nicht
auseinanderlaufen.

## 3. Datenmodell (additiv)

| Ort | Inhalt | Wer schreibt |
| --- | --- | --- |
| `restaurants/{id}/goSettings/config` | GO an/aus, Pause, Zeitzone, Kapazitaet | Business (Rules) |
| `restaurants/{id}/goOffers/{offerId}` | GO-Angebote inkl. Regeln und Grenzen | Business (Rules) |
| `goBookings/{bookingId}` | Buchungen mit eingefrorenem Snapshot | **nur Server** |
| `restaurants/{id}/goCapacity/{slotKey}` | Zaehler je halber Stunde und Tag | **nur Server** |
| `goGuestSessions/{guestId}` | anonyme Gastkennung, Hash des Geheimnisses | **nur Server** |

Bookings liegen oben, nicht unter dem Lokal: Der Gast muss seine Buchung ueber
einen Token finden koennen, ohne zu wissen, in welchem Lokal sie liegt, und
das Panel liest sie ueber `where restaurantId ==`. Beide Wege sind mit einem
Index abgedeckt.

Angebote und Buchungen haengen immer an einer konkreten Adresse
(`locationId`, Standard `main`) - nicht nur am Unternehmen (Punkt 124).

## 4. Bewusste Abweichungen von der Spezifikation

### 4.1 Realtime: Firestore-Snapshots statt SSE (Punkt 53-57)

Die Spezifikation empfiehlt Server-Sent Events. Der Stack traegt sie nicht:
Mnyra liegt als statisches Bundle auf Vercel, der Server sind Firebase
Functions (Gen 1). Beide puffern Antworten und beenden sie nach kurzer Zeit -
eine dauerhaft offene Verbindung gibt es dort nicht.

Umgesetzt wird das Ziel, nicht die Technik: Das Panel haengt einen
Firestore-`onSnapshot` an seine eigenen Buchungen. Das liefert alles, was
Punkt 52 bis 57 verlangt - kein Refresh, mehrere Geraete gleichzeitig,
automatische Wiederverbindung mit Backoff, und beim Zurueckkommen aus dem
Offline-Zustand erst der vollstaendige Stand und dann die laufenden
Aenderungen. Es kostet keine zusaetzliche Infrastruktur und keinen zweiten
Verbindungstyp.

Punkt 54 bleibt erfuellt: Nur eingeloggte Business-Seiten haengen einen
Listener an. Gaeste im Qyteti bekommen keine Realtime-Verbindung.

### 4.2 Outbox (Punkt 110)

Eine eigene Outbox-Sammlung entfaellt. Das Buchungsdokument **ist** das
Ereignis: Es entsteht in derselben Transaktion wie die Kapazitaetsbuchung, und
derselbe Commit stellt es allen Listenern zu. Ein Absturz nach dem Commit kann
das Ereignis nicht verlieren, weil es kein zweites System gibt, das es
weitertragen muesste. Die Nachhol-Frage nach einem Offline-Zeitraum beantwortet
der Snapshot beim Wiederverbinden.

### 4.3 Gast-Cookie (Punkt 31)

Ein `HttpOnly`-Cookie kann die Architektur nicht liefern: Die Callables liegen
auf `cloudfunctions.net`, die App auf `mnyra.com` - ein First-Party-Cookie
erreicht den Server nie. Umgesetzt ist deshalb die Eigenschaft, auf die es
ankommt: Der Server erzeugt Kennung und Geheimnis, speichert vom Geheimnis nur
den SHA-256-Hash und prueft jeden Aufruf dagegen. Der Browser bewahrt den
Token auf, aber er kann ihn nicht faelschen, und der Server bleibt die
Wahrheit (Punkt 41). Ein `secure`-Cookie kann spaeter zusaetzlich gesetzt
werden, wenn GO einen eigenen First-Party-Endpunkt bekommt.

### 4.4 Zwei Seiten, ein bestehendes Muster

GO erfindet keine eigene Bedienung. Beide Oberflaechen sind Seiten der App -
Tabs wie Qyteti, Ofertat und das Panel, mit Kopfzeile, Rand und Fuss der
App-Huelle:

**Gast: der Tab `go` (Pfad `/mnyra-go`).** Er war zuerst ein Modal. Ein Modal
liegt als `position: fixed` ueber der Seite, und damit gehoert ihm der Rand
des Bildschirms: der sichere Bereich oben, die Browserleiste unten, die Farbe
dahinter. Jede dieser Kanten musste GO selbst richtig hinbekommen, und jede
verhaelt sich auf dem Telefon anders als am Schreibtisch. Als Seite stellt
sich keine dieser Fragen mehr - GO rendert nur noch seinen Inhalt, und zwar im
Aufbau des Feed-Gates: ein farbiger Streifen, der die Karte mit der Frage
traegt, darunter das weisse Bento mit runden Ecken darueber. Nur die Farbe ist
eine andere - das Gate ist Cyan, GO ist Indigo (`--go-chrome`, `#635bff`).
Bewusst nicht dasselbe Indigo wie die betonten Woerter (`--go-accent`): Eine
Flaeche und ein Schriftzug brauchen nicht dieselbe Zahl, und beide beruehren
sich nie. Die Schatten auf dem Streifen sind in seiner Farbfamilie getoent -
ein neutraler Schatten legt einen grauen Schleier auf gesaettigte Farbe, statt
sie zu verdunkeln. Die Seitenraender sind die der App
(`--app-content-inline`), damit GO in derselben Flucht steht wie Qyteti.

Zwei Details entscheiden darueber, ob das als eine Flaeche gelesen wird oder
als zwei aneinandergelegte:

- Das Bento liegt **ueber** dem Streifen (`margin-top: -2.5rem`), nicht
  daneben. Nur so schneiden seine runden Ecken in die Farbe. Ohne das
  Herauziehen endete die Farbe genau dort, wo das Bento anfaengt, und die
  Ecken gaeben den Grund der Seite frei - eine graue Kerbe links und rechts,
  die aussieht, als hoere die Farbe zu frueh auf.
- Die Huelle haelt unter der Kopfzeile einen Abstand in ihrer eigenen Farbe
  (`--smart-header-content-gap`). Auf der GO-Seite ist er abgeschaltet
  (`index.html`, dieselbe Ausnahme wie fuer Restaurants und Travel, fuer
  `[data-go-page]` und `[data-go-page-skeleton]`) - sonst stuende ein heller
  Streifen zwischen Kopfzeile und Blau.

Zwei Wege fuehren hinein, beides Tabwechsel wie jeder andere: die GO-Karte im
Qyteti und der Eintrag "Mnyra GO" im Drawer. Laeuft gerade eine Buchung,
bringt die Karte deren Kennung in `state.goOpenBookingId` mit; die Seite holt
sich damit einmal den Stand vom Server, statt ihn aus dem Browser zu glauben.
Der Eintrag im Drawer steht nicht fuer Konten mit Panel: GO ist die Seite des
Gastes, das Lokal arbeitet auf `gobiznes`.

Der Zustand liegt in `state.go`, nicht im Modul - ein Neuzeichnen der Shell
verliert ihn nicht. Auch diese Seite haengt hinter einer Grenze
(`go-page-boundary.js`).

Im Bento steht, solange noch nicht gesucht wurde, die **Bildergeschichte** -
und sonst nichts: vier Fotos mit je einem Satz, untereinander, in der
Reihenfolge der Sache selbst (Hunger, wohin, Offerte, Abend). Auf den ersten
dreien liegt eine Frage ("A je unt?", "Ku me shku?", "Ofertat t'vijn."), das
letzte traegt keine - es ist das Ende der Geschichte, nicht ihre naechste
Frage. Die Dateien liegen unter `assets/go/` (siehe das README dort).

Eine Ueberschrift, ein Untertitel und vier Zeilen "Mirë të dihet" standen
einmal daneben. Sie sind weg: Alle drei sagten in Worten, was die Bilder
zeigen, und eine Erklaerung, die daneben noch einmal erklaert wird, wirkt wie
eine, der man nicht traut.

Sieben Entscheidungen darin, die man sonst wieder aufmachen wuerde:

- **Untereinander, nicht nebeneinander.** Die Bilder sind 16:9; drei davon
  nebeneinander waeren auf einem Telefon drei Briefmarken.
- **Viel Luft zwischen den Kapiteln, weniger innerhalb** (5,5rem gegen 36px).
  Bei gleichem Abstand ueberall waere es eine Liste; so ist es eine Folge von
  Aussagen, jede fuer sich.
- **Je Satz genau eine betonte Stelle**, im Blau von Mnyra und ohne zweite
  Schriftstaerke. Die Stuecke stehen als Liste im Datensatz
  (`["...", { accent: "..." }]`) und nicht als Text mit Markierungen darin -
  gesucht und ersetzt wird nichts, sonst faende ein "ty" auch das in "tyre".
- **Die Frage liegt als Text auf dem Foto, nicht darin.** Sie war einmal
  eingebrannt; so ist sie lesbar, vergroesserbar, uebersetzbar und aenderbar,
  ohne dass jemand vier Bilder neu setzt. `side` sagt, auf welcher Seite sie
  steht - eine Eigenschaft des Fotos (wo es leer ist), keine Meinung. Mehr als
  46 % der Breite nimmt sie nie; die andere Haelfte gehoert dem Bild.
- **Das `alt` beschreibt das Foto**, nicht die Frage daneben. Solange die
  Frage im Bild stand, trug das `alt` sie; jetzt waere das dasselbe zweimal
  vorgelesen.
- **Was aufgedeckt ist, steht im Zustand** (`state.go.storyShown`). Jede
  Antwort auf eine Frage zeichnet die Seite neu - ein Aufdecken, das nur am
  Knoten haengt, finge dann jedes Mal von vorne an.
- **Aufdecken heisst: dieses Bild und alles darueber.** Ein
  `IntersectionObserver` meldet, was in einem Einzelbild zu sehen ist; fliegt
  die Seite mit einem Schwung durch, war ein Bild dazwischen in keinem davon
  zu sehen und bliebe fuer immer unsichtbar. Die Bilder stehen in ihrer
  Reihenfolge untereinander, also ist an Nummer drei auch eins und zwei
  vorbeigekommen.

Wer Bewegung abbestellt hat (`prefers-reduced-motion`), bekommt keine: Die
Seite steht dann vollstaendig und sofort da.

**Business: eine Seite wie der Ofertat- und der Menue-Editor.** GO ist ein
eigener Tab (`gobiznes`, Pfad `/go-biznes`), erreichbar ueber die GO-Karte in
Funksionet - denselben Weg nimmt "Lësho ofertë" zu den Ofertat. Der
Angebots-Editor ist ein eigener Bildschirm innerhalb dieser Seite mit
Zurueck-Pfeil, kein Overlay. Der Grund steht schon ueber `renderVoucherEditor`:
In einem Overlay verliert ein Editor bei jedem Neuzeichnen der Shell seine
Eingaben - und der Wirt arbeitet hier, er schaut nicht kurz vorbei.

Damit der Tab nicht das Startbundle belastet, haengt er hinter einer Grenze
(`go-admin-boundary.js`) nach dem Muster des Marktplatzes: Beim Oeffnen stehen
die Umrisse der Karten, die Seite selbst kommt nachgeladen.

Die Spezifikation nennt fuer die Business-Seite `/panel/go`; der Pfad heisst
hier `/go-biznes`, weil Mnyra seine Business-Editoren so benennt
(`/ofertat-biznes`).

### 4.5 Oeffnungszeiten (Punkt 18)

Mnyra speichert Oeffnungszeiten als Freitext ("Hene - Diel: 11:00 - 22:00").
`go-opening-hours-core.js` liest daraus, so weit es sich verlaesslich lesen
laesst, und sagt ehrlich `hasData: false`, wenn nicht. Unlesbare Zeiten
erzeugen **keine** geratene Grenze - dann gilt allein der Plan des Angebots.
Ein erfundenes "bis 22:00" wuerde entweder Gaeste vor eine verschlossene Tuer
schicken oder ein Lokal aus seiner besten Stunde nehmen.

## 5. Was ausdruecklich nicht gebaut wurde

- Keine IP als Identitaet, keine IP-Sperre, keine Regel "gleiche IP =
  gleicher Nutzer" (Punkt 32, 37). Ein Test liest den Quelltext der
  Domaenenmodule und faellt, wenn jemand das wieder einfuehrt.
- Kein Fingerprinting aus Bildschirm, Schriften, Canvas, GPU, Sensoren
  (Punkt 38).
- Keine harte Check-in-Regel. Weder "+15 Minuten = No-Show" noch "zu frueh".
  Die einzige Zeitgrenze einer Buchung ist das Ende des Betriebstages
  (Punkt 71-76, `resolveGoBookingClosure`).
- Kein automatischer Strafpunkt fuer Gaeste (Punkt 75).
- Kein Login-Zwang an irgendeiner Stelle des Gastflusses (Punkt 30).
- Keine zweite Angebots-Engine: GO-Angebote tragen `channels`, damit dasselbe
  Angebot spaeter oeffentlich in den Ofertat stehen kann (Punkt 82).
- Keine Kapazitaets- oder Preislogik im Browser (Punkt 146).

## 6. Feature-Flag und Fehlerisolierung

Alles haengt an `MNYRA_GO_ENABLED` in `shared/config/feature-flags.js`,
Standard `false`. Bei `false` wird kein GO-Modul geladen, keine Karte
gerendert und kein Netzverkehr erzeugt - Qyteti laedt wie zuvor (Punkt 129,
139).

Faellt die GO-API aus, faengt das GO-Modul den Fehler in sich ab und zeigt
"Mnyra GO është përkohësisht i padisponueshëm". Feed, Stories, Ofertat,
Lokalet und Profile bleiben unberuehrt (Punkt 131).

## 7. Gemessen, nicht behauptet

Bundle nach `npm run build:menyra-social:bundle`, beide Male auf demselben
Stand gemessen:

- Mit `MNYRA_GO_ENABLED = false`: Einstiegs-Bundle **515,32 kB**
  (138,43 kB gzip), kein einziger GO-Chunk. Rollup faltet die Konstante und
  wirft Seite, Suche, Panel-Seite, Firebase-Anbindung und Realtime heraus;
  uebrig bleiben rund 0,5 kB fuer die beiden Karten als Text.
- Mit `MNYRA_GO_ENABLED = true`: Einstiegs-Bundle **520,74 kB**
  (139,74 kB gzip), und GO liegt in fuenf nachgeladenen Stuecken:
  `go-page-render-utils` 47,54 kB (14,64 kB gzip),
  `go-page-view-controller` 8,31 kB (3,27 kB gzip),
  `go-admin-view-controller` 6,33 kB (2,47 kB gzip),
  `business-go-runtime-controller` 5,29 kB (2,27 kB gzip),
  `go-api-client` 2,80 kB (1,31 kB gzip).
  Nichts davon laedt, bevor jemand GO oeffnet (Punkt 132, 139).

## 7a. Vorschau auf Vercel

`MNYRA_GO_ENABLED` steht auf **`true`**: GO ist fuer den Gast sichtbar. In
`vercel.json` ist der Arbeitsbranch ausdruecklich zum Deployen freigegeben -
der Eintrag `"claude/mnyra-go-page-navigation-gc0b4r": true` hebt die Sperre
`"claude/**": false` fuer genau diesen Branch auf. Der Eintrag gehoert nicht
nach `main`; dort bleibt die Sperre wie sie war.

Was die Vorschau ohne einen Firebase-Deploy zeigen kann:

| Sichtbar | Braucht zusaetzlich einen Deploy |
| --- | --- |
| GO-Karte, Drawer-Eintrag, Seite, Auswahl, Panel-Karte | Suche, Buchung, Check-in (Functions) |
| Fehlerisolierung: GO faellt aus, Qyteti laeuft | Angebote anlegen (Rules) |
| Bundle-Verhalten, Ladeverhalten, Mobile-Layout | Realtime im Panel (Rules + Indizes) |

Ohne `firebase deploy --only functions,firestore:rules,firestore:indexes`
antwortet GO auf "Shiko ofertat" mit
"Mnyra GO është përkohësisht i padisponueshëm" - das ist dann kein Fehler,
sondern genau die vorgesehene Fehlerisolierung (Punkt 131).

## 8. Stand der Umsetzung

| Schicht | Stand |
| --- | --- |
| Domaene `shared/go` | fertig, mit Tests |
| Server `functions/go` | fertig, mit Tests |
| Gastfluss (Karte, Drawer, Seite, Buchung) | fertig, hinter Flag |
| Business (Panel, Angebote, Realtime) | fertig, hinter Flag |
| Rules und Indizes | fertig |
| Smart Offers (Punkt 127) | bewusst nicht in v1 |
| Sponsored-Abrechnung (Punkt 23) | Ranking vorbereitet, Abrechnung offen |

Die Aktivierung in Produktion ist eine eigene Entscheidung: Flag auf `true`,
Rules deployen, Functions deployen, Indizes anlegen.

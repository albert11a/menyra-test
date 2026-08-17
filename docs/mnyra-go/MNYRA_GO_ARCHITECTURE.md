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
- Kopfzeile (`core/app-shell`): die dritte Pill "Mnyra GO", neben Qyteti und
  Lokalet. Sie hat Ofertat abgeloest - die Route `ofertat` bleibt bestehen
  (Deep-Link, Voucher-Editor im Panel), aber kein Weg in der Navigation fuehrt
  noch dorthin. Steht `MNYRA_GO_ENABLED` auf false, faellt die Pill ersatzlos
  weg und die Zeile traegt zwei.
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
Qyteti und die dritte Pill in der Kopfzeile. Laeuft gerade eine Buchung,
bringt die Karte deren Kennung in `state.goOpenBookingId` mit; die Seite holt
sich damit einmal den Stand vom Server, statt ihn aus dem Browser zu glauben.

Die Pill steht fuer jedes Konto - auch fuer eines mit Panel. Sie ist Teil der
Tab-Reihe, und die Reihe gehoert allen; wer ein Lokal fuehrt, isst trotzdem
auswaerts. Die Arbeitsseite des Lokals liegt davon unberuehrt auf `gobiznes`,
erreichbar ueber die GO-Karte im Panel.

Die Pill-Zeile bleibt auf der GO-Seite stehen (`isMainHeaderTabsScope`), sonst
gaebe es von dort keinen sichtbaren Weg zurueck. Das Stadtfeld der Kopfzeile
steht dort dagegen nicht: GO fragt seine Stadt auf der Seite selbst ab, und
zwei Stadtfelder uebereinander waeren zwei Wahrheiten.

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

Neun Entscheidungen darin, die man sonst wieder aufmachen wuerde:

- **Untereinander, nicht nebeneinander.** Drei Bilder nebeneinander waeren auf
  einem Telefon drei Briefmarken.
- **Das Bildfenster ist 4:3, die Datei bleibt 16:9.** Das ist der Hebel, an dem
  der Fokus wirklich haengt - nachgesehen bei Apple
  (apple.com/iphone, `overview.built.css`): Ihre Karte auf dem Telefon ist
  `--feature-card-width: 260px` breit und `--feature-card-min-height: 480px`
  hoch, also hochkant und 57 % der Schirmhoehe. Ein solcher Block gehoert dem
  Blick von selbst. Unser 16:9-Streifen fuellte 23 %, also passten immer zwei
  Kapitel ins Fenster.
  Mit Abstand ist das nicht zu heilen, und Apple versucht es auch nicht: Ihre
  Abschnittspolster auf dem Telefon sind 56 bis 160px - dieselbe
  Groessenordnung wie unsere, und in 650 kB Stylesheet steht ein einziges
  `vh`. Es lag nie am Abstand, es lag am Bild.
  4:3 ist bei diesem Material die Grenze, gegengeprueft an allen vier Fotos:
  Bei 1:1 laeuft die Frage in Schulter und Telefon, bei 4:5 liegt sie auf der
  Person. Fuer echte 4:5 braeuchte es hochkant gesetzte Zuschnitte - eine
  Aufgabe fuer die Kamera, nicht fuer CSS.
  Welche Seite beim Beschneiden stehen bleibt, sagt `focus` je Foto; bei jedem
  Bild mit Frage ist es die Gegenseite von `side`.
- **Aufgedeckt wird Stueck fuer Stueck, nicht kapitelweise.** Jedes Bild und
  jeder Satz traegt sein eigenes `data-go-reveal` und kommt fuer sich herein:
  Bild, ein Stueck Scrollen weiter der Satz, ein Stueck weiter das naechste
  Bild - der Takt, in dem der Daumen arbeitet. Gemessen deckt sich damit etwa
  alle 150px Scrollweg genau ein Stueck auf.
  Der Weg dorthin ging ueber einen Irrtum, der im Code nicht mehr steht, aber
  hier stehen soll: Zuerst sollte **Leere** den Fokus machen - der Abstand
  zwischen den Kapiteln auf 64svh, damit immer nur eines im Fenster steht. Das
  hielt zwar den Blick (2+ Kapitel im Bild: von 94 % auf 23 %), hinterliess
  aber halbe leere Bildschirme. Leere ist kein Fokus, sie ist nur Leere. Was
  den Blick wirklich haelt, ist, dass unten noch nichts STEHT: Das naechste
  Bild ist schon im Fenster, aber noch nicht aufgedeckt, und diese Flaeche
  fuellt sich, waehrend man ankommt. Danach: 0 % leere Fenster, Seite 2561px
  statt 3225px.
- **Beide Abstaende sind Scrollweg, nicht Luft** - der zwischen den Kapiteln
  (`clamp(3.5rem, 20svh, 11rem)`) und der zwischen Bild und Satz
  (`clamp(2.75rem, 10svh, 6rem)`). Sie messen an der Fensterhoehe und nicht in
  `rem`: Was "ein Stueck weiter" heisst, haengt am Geraet. `svh` und nicht
  `vh`, weil die kleine Fensterhoehe sich beim Scrollen nicht aendert - sonst
  wuechse der Abstand unter dem Finger. Der innere bleibt halb so gross wie
  der aeussere; waeren beide gleich, stuenden dort acht einzelne Dinge statt
  vier Kapiteln. Gemessen liegen die Einblendungen damit gleichmaessig
  auseinander (200 / 260 / 260 / 280 / 260px Scrollweg) - vorher kam der Satz
  nach 200px, das naechste Bild erst nach 280.
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

### 4.5 Die Frage an den Gast ist eine Frage nach der Rechnung

Der Gast wurde einmal gefragt "Çka dëshironi?" und waehlte EINE von fuenf
Pillen: Krejt, Kafe, Pije, Ushqim, Ëmbëlsira. Zwei Dinge stimmten daran
nicht.

Erstens war es eine Entweder-oder-Frage auf eine Sowohl-als-auch-Wirklichkeit:
Wer Ushqim waehlte, verlor jedes Dessert-Angebot. Zweitens war "Krejt" keine
ehrliche Antwort fuer den, der es selbst noch nicht weiss - es klang wie eine
Entscheidung.

Gefragt wird jetzt **"Për çka jeni?"**, und es gibt drei Antworten:

| Antwort | sucht in | weil |
| --- | --- | --- |
| **Ushqim** (Mëngjes, drekë, darkë etj.) | `food` | grosser Bon |
| **Pije** (Kafe, ëmbëlsira, lëngje etj.) | `coffee`, `drinks`, `dessert` | kleiner Bon |
| **Nuk e di** (Gjitha ofertat për rreth teje.) | kein Filter | er schaut erst |

Der Punkt dahinter ist keine Geschmacksfrage, sondern eine kaufmaennische:
Wer isst, macht einen grossen Bon, und darauf kann ein Lokal mehr geben. Wer
nur einen Kaffee trinkt, macht einen kleinen - da sind zehn Prozent das
Aeusserste. Genau diese zwei Faelle kalkuliert ein Wirt.

Daraus folgt auch, wo Ëmbëlsira liegt: bei "Pije" und nicht bei beiden. Wer
isst, bekommt das Essens-Angebot, und das deckt den ganzen Abend ab - er
trinkt dort ohnehin, nimmt Kaffee, vielleicht ein Dessert. Das Dessert-Angebot
ist fuer den, der NICHT isst.

Zwei Dinge, die daran wichtig sind:

- **Das Lokal merkt davon nichts.** Die vier Kategorien am Angebot bleiben
  unveraendert; keine Migration, keine Nachpflege. Uebersetzt wird erst beim
  Suchen (`goIntentCategories`). Nur die Frage im Editor heisst jetzt "Për kë
  âsht kjo ofertë?" statt "Kategoria" - ein Wirt beantwortet dort naemlich
  nicht, worauf sein Rabatt gilt, sondern fuer wen das Angebot ist. Steht dort
  das Falsche, landet ein gutes Essens-Angebot in der falschen Gruppe.
- **Drei Antworten und keine Mehrfachauswahl.** Bei mehreren zum Ankreuzen
  wuesste niemand, wann der Gast fertig ist - es braeuchte einen zweiten Tipp
  auf einen "Weiter"-Knopf. So bleibt der Tipp die Antwort, wie bei den
  Pillen davor.

Die Wahl des Gastes erreicht die Buchung uebrigens nie: Eingefroren wird die
Kategorie des ANGEBOTS (`buildGoBookingSnapshot`). Wer "Pije" sagt und dann
doch isst, hat nichts gebrochen - die Antwort filtert und sortiert, mehr tut
sie nicht.

Ein Browser, der die Seite noch aus dem Zwischenspeicher haelt, sendet
weiterhin ein einzelnes `category`. Das bleibt lesbar (`readWantedCategories`)
- ihn abzuweisen hiesse, ihm bis zum naechsten Neuladen nichts zu zeigen.

### 4.6 Die Karte: eine Frage, ein Bildschirm

Die Karte auf dem Streifen ist **430px hoch, immer**. Sie war vorher so hoch
wie ihr Inhalt, und das hatte eine Folge, die man erst beim Durchklicken sieht:
Bei jeder Antwort wuchs oder schrumpfte sie, und das Bento darunter sprang mit.
Der Blick verliert dabei jedes Mal die Stelle, an der er war. Innen teilt sie
sich in Kopf, Koerper und Fuss; nur der Koerper dehnt sich, und was nicht
hineinpasst (Kalender, Staedteliste), scrollt in ihm - Frage und Knopf bleiben
stehen.

Fuenf Entscheidungen darin:

- **Ein Rad statt eines Schiebereglers.** Der Regler hatte einen Fehler, den
  kein Styling behebt: Sein Griff liegt genau unter dem Daumen, der ihn zieht -
  man verdeckt beim Einstellen die Einstellung. Ein Rad dreht sich unter der
  Hand weg, und die Zahl steht in der Mitte frei. Es ist ausserdem das
  Bedienteil, das ein Telefon fuer Zahl und Uhrzeit ohnehin kennt.
  Seine Geometrie haengt an drei Zahlen, die im Stylesheet und im Controller
  dieselben sein muessen: Zeile 44px, Fenster 200px, Polster (200-44)/2 = 78px.
  Nur damit liegt die erste Zeile bei `scrollTop: 0` mittig
  (`GO_WHEEL_ITEM_HEIGHT`).
- **"Më vonë" ist keine Antwort, sondern die Ankuendigung einer.** Dahinter
  liegen zwei Bildschirme: erst der Kalender, dann das Rad fuer die Uhrzeit.
  Ein `<input type="datetime-local">` stand hier einmal; es sieht auf jedem
  Telefon anders aus, auf keinem sieht es aus wie diese Karte, und es kennt die
  Grenze nicht, die GO wirklich hat. Der Kalender kennt sie: Anzutippen sind
  genau `GO_MAX_LEAD_DAYS + 1` Tage. Der Rest des Monats steht da und ist
  abgeschaltet - ein Kalender, der nur acht Tage zeigt, sieht aus wie einer, dem
  etwas fehlt. Reicht das Fenster ueber den Monatsrand, steht der naechste Monat
  darunter.
  Vorgeschlagen wird die naechste halbe Stunde in einer Stunde, nicht 19:00: Wer
  um 22:30 sucht, meint nicht den Abend von gestern. Halbe Stunden und keine
  Minuten, weil ein Lokal seine Kapazitaet so fuehrt
  (`GO_CAPACITY_SLOT_MINUTES`) - 19:07 waere eine Genauigkeit, die hinter der
  Tuer niemand einloest.
  Der Knopf darunter sagt, WAS er speichert ("Ruaj orën (Sot, 20:30)"), und er
  sagt es auch, waehrend das Rad noch laeuft. Seine Aufschrift wird deshalb
  nicht zweimal gebaut, sondern einmal (`goWhenSaveLabel`) - vom Aufbau und vom
  Rad. Zwei Stellen, die denselben Satz bauen, laufen auseinander, und hier
  waere das keine Kleinigkeit: Ein Knopf, der 00:00 sagt, waehrend darueber
  20:30 steht, ist eine Falschauskunft an genau der Stelle, an der der Gast sie
  nicht mehr prueft.
- **Die Staedte sind ein Vorschlag, kein Zaun.** `GO_CITIES` steht im
  Aufbaumodul und nicht in `shared/go`: Der Server rechnet mit dem Namen, den er
  bekommt, und nicht mit einer Liste. Wer seinen Ort nicht findet, schreibt ihn
  hin - die letzte Zeile nimmt ihn an ("Përdor: ..."). Gesucht wird durch
  Ausblenden und nicht durch Neuzeichnen; ein Neuaufbau bei jedem Buchstaben
  naehme dem Feld die Tastatur.
- **Der Merkzettel mit den gegebenen Antworten ist weg**, und mit ihm der
  Fortschrittsbalken. Beide erklaerten ein Formular, das keines mehr ist: Vier
  Fragen, von denen jede einen eigenen Bildschirm hat, brauchen keine Anzeige,
  der wievielte gerade dran ist. Zurueck fuehrt ein Pfeil oben rechts, immer
  genau einen Schritt - auch aus Kalender und Staedteliste heraus, die sonst
  Sackgassen waeren.
- **Auf dem ersten Schritt steht rechts oben die Antwort statt eines Pfeils.**
  Dort gibt es nichts dahinter, und die Zahl wird gebraucht: Der Daumen liegt
  auf dem Rad und verdeckt die Zeile darin.

### 4.7 Die Suche ist ein Vorgang, kein Ladebalken

Zwischen "Merr ofertat" und den Angeboten steht ein eigener Zustand
(`view: "matching"`). Dieselbe Karte, dasselbe Fenster - sie zeigt nur etwas
anderes: erst geht die Anfrage hinaus, dann treffen die Lokale ein, eines nach
dem anderen, mit ihrem Namen.

Vier Dinge entscheiden darueber, ob das eine Auskunft ist oder eine Verzierung:

- **Der Zaehler zaehlt bis zur Zahl der Angebote und keinen Schritt weiter**,
  und jeder Name gehoert zu einem Angebot, das der Gast danach wirklich sieht.
  Drei Angebote heissen drei Zaehlschritte und drei Namen. Ein Zaehler, der
  immer bis zehn laeuft und dann drei Angebote zeigt, ist eine Luege mit
  Animation.
- **Die Angebote bleiben bis zum Schluss verborgen.** Sie sind zu diesem
  Zeitpunkt laengst da - der Server hat schon geantwortet -, aber im Bento steht
  weiter die Bildergeschichte. Stuenden sie unter der laufenden Animation, waere
  die Animation Deko ueber einer Liste. Erst "Shiko ofertat" gibt sie frei, und
  die Seite faehrt dabei zum ersten Angebot hinunter: Der Knopf steht oben, die
  Angebote unten, und dazwischen liegt ein Weg, den sonst der Daumen suchen
  muesste.
- **Die erste Phase dauert mindestens drei Sekunden, auch wenn der Server in
  200ms antwortet** - eine Suche, die sofort fertig ist, sieht nicht nach Suche
  aus, sondern nach einer vorbereiteten Liste, und der Gast glaubt nicht, dass
  irgendjemand gefragt wurde. Antwortet der Server langsamer, wartet die Karte
  weiter und sagt es ("Po presim përgjigjet..."), statt eine Zahl zu erfinden.
  Ohne Angebot wird gar nicht erst gewartet: Dann steht sofort der eine ehrliche
  Satz da.
- **Waehrend die Zahlen laufen, wird nicht neu gezeichnet.** Geaendert werden
  die drei Knoten, die sich aendern (Zahl, Name, Sekunden) - ein Neuaufbau der
  Seite alle 650ms setzt jede Animation zurueck und haengt die vier Bilder im
  Bento erneut ein.

Die Uhren stehen an einer Stelle und sind austauschbar (`timers`). Nicht aus
Ordnungsliebe: Ein Test, der acht Sekunden Animation abwarten muss, wird
entweder langsam oder unzuverlaessig - er setzt hier eine Uhr ein, die sofort
klingelt, und prueft die Reihenfolge statt der Pausen.

**Ein Fehler ist ein Ergebnis der Suche und kein anderer Ort.** Auch er steht
auf der Karte auf dem Streifen, mit "Provo prapë" darunter. Vorher fiel im
Fehlerfall der ganze Aufbau weg - kein Streifen, keine Karte -, und uebrig
blieb ein weisser Streifen mit einem Satz darin, unter dem der graue Grund der
Seite anfing: Es sah aus, als sei die App abgestuerzt, und nicht, als habe eine
Suche nichts gefunden.

Daraus folgt eine Regel fuer das Bento, die fuer alle drei Ausgaenge gilt:
**Angebote, wenn es welche gibt - sonst die Geschichte.** Voll gewordene
Angebote schicken Alternativen mit (Punkt 28, 119); die stehen dort wie
Angebote, und die Seite faehrt zu ihnen hinunter. Ein Server, der gar nicht
antwortet, schickt keine, und eine erfolglose Suche auch nicht - dann steht dort
wieder die Bildergeschichte. Der Satz "Nuk gjetëm ofertë" steht schon oben auf
der Karte; ihn darunter zu wiederholen, macht ihn nicht wahrer, und ein Bento,
in dem gar nichts steht, ist eine weisse Flaeche und keine Auskunft.

Damit sie wirklich weiss ist bis unten: Die Seite waechst in ihrer Huelle
(`flex: 1 0 auto`). `min-height: 100%` allein reichte nicht - die Huelle ist
eine Flex-Spalte, deren Hoehe selbst erst aus dem Layout entsteht, und ein
Prozentwert hat dort nichts, woran er sich messen koennte. Das Bento endete
deshalb dort, wo sein Inhalt endete, und darunter kam der graue Seitengrund zum
Vorschein.

### 4.8 Oeffnungszeiten (Punkt 18)

Mnyra speichert Oeffnungszeiten als Freitext ("Hene - Diel: 11:00 - 22:00").
`go-opening-hours-core.js` liest daraus, so weit es sich verlaesslich lesen
laesst, und sagt ehrlich `hasData: false`, wenn nicht. Unlesbare Zeiten
erzeugen **keine** geratene Grenze - dann gilt allein der Plan des Angebots.
Ein erfundenes "bis 22:00" wuerde entweder Gaeste vor eine verschlossene Tuer
schicken oder ein Lokal aus seiner besten Stunde nehmen.

### 4.9 "ÇKA PO OFRON?" - vier Arten, ein Satz fuer den Gast

Der erste Schritt beim Anlegen einer GO-Oferta ist die Frage, welche Art von
Vorteil das Lokal gibt. Es gibt vier, und sie stehen in einem 2x2-Raster - in
einer Reihe zu vier waeren die Woerter auf dem Telefon abgeschnitten:

| Knopf | `benefit.kind` | was das Lokal eingibt |
| --- | --- | --- |
| **Zbritje %** | `percent` | Prozentsatz (10/15/20/25 oder "Tjetër") und wo er gilt: `all`, `food`, `drinks` |
| **Paketë GO** | `bundle` | Inhalt der Paketa, normaler Preis, GO-Preis |
| **Falas** | `freeItem` | was es gratis gibt, und die Bedingung: `food`, `drink`, `any_order`, `custom` |
| **Çmim special** | `specialPrice` | Produkt, normaler Preis, GO-Preis |

Die Schluessel sind die, die schon in Firestore standen: `percent` ist die
Zbritje, nicht ein neues `discount`. Ein bestehendes Angebot bleibt nach diesem
Schritt dasselbe Angebot - `normalizeGoBenefit` liest auch `discount`,
`free_item` und `special_price`, damit die Namen der Spezifikation hier nicht
gegen die Namen in der Datenbank stehen.

**Das Lokal schreibt seine Werbebotschaft nicht.** Es gibt kein Freitextfeld
mehr - kein "Përshkrimi", kein "Teksti yt". Aus den Eingaben baut
`buildGoBenefitLabel` die eine Zeile, die ueberall steht, wo nur eine Zeile
Platz hat:

```
20 % + Ushqim                        -> "-20% në ushqim"
2 Burger + 2 Pije, 20,00 -> 14,90    -> "2 Burger + 2 Pije 14,90 €"
1 Pije + Me ushqim                   -> "1 Pije FALAS me porosi ushqimi"
Pizza Margherita, 8,00 -> 5,90       -> "Pizza Margherita 5,90 €"
```

Der Grund ist nicht Bequemlichkeit, sondern das Aussehen des Qyteti: Sobald
jedes Lokal seinen Satz selbst tippt, stehen dort "SUPER AKSIONNNNN!!!" und
"Oferta e javës vetem tek ne...." neben ruhigen Angeboten, und die Seite sieht
aus wie ein Kleinanzeigenblatt.

**Eine Karte fuer alle vier Arten.** `buildGoBenefitView` teilt denselben
Vorteil in die Zeilen der Kundenkarte auf: kleiner Hinweis ("Paketë GO"), grosse
Zeile, Ergaenzung, und bei Preisen der normale Preis klein und durchgestrichen
neben dem grossen GO-Preis, darunter "Kursen 5,10 €". Die Aufteilung entsteht
**einmal** und wird an zwei Orten gezeichnet: in der Vorschau des Wirts
("Kështu e sheh klienti") und beim Gast - dort kommt sie als `benefitView` mit
`buildGoResultCard` ueber die Leitung. Wuerde die Gaeste-Seite aus
"2 Burger + 2 Pije 14,90 €" wieder Titel und Preis herausschneiden, saehe eine
Paketa beim Gast anders aus als in der Vorschau, die der Wirt gesehen hat.

**Preise sind ganze Cent.** `benefit.regularPriceCents` und
`benefit.goPriceCents`, gelesen mit `parseGoPriceCents` ("14,90", "14.90",
"20", "14,90 €"). Dieselbe Regel wie in `go-commission-core.js`: Wer Geld in
Kommazahlen rechnet, bekommt eine Ersparnis von 5,099999999999999 € auf die
Karte des Gastes. `savingCents` und `savingPercent` werden daraus gerechnet und
nie eingegeben.

**Keine Bewertung des Angebots.** Die Ersparnis ist eine Auskunft, kein Urteil:
kein Offer-Score, keine Sterne, keine Warnung bei kleinen Rabatten, keine
Empfehlung, den Preis zu senken. Die einzige Pruefung an einem Preis ist Logik
und keine Meinung - ein GO-Preis ueber dem normalen ergibt keinen Sinn
("Çmimi GO duhet të jetë më i ulët se çmimi normal."). Wie hoch der Rabatt ist,
entscheidet allein das Lokal.

**Was das Modal offen haelt, gehoert dem Modal.** Wechselt der Wirt die Art,
merkt der Editor die verlassene mit allem, was in ihren Feldern stand
(`editor.benefits`), und holt sie beim Zurueckwechseln wieder hervor - wer die
vier Arten ausprobiert, soll dabei nichts verlieren. Gespeichert wird beim
Antippen von AKTIVIZO trotzdem nur die gewaehlte Art: Der Entwurf traegt immer
nur einen Vorteil. Sonst rechnete die Karte des Gastes mit einer Zahl weiter,
deren Feld gar nicht mehr auf dem Bildschirm steht.

Zwei Dinge dazu im Editor selbst: Der Bildlauf bleibt beim Wechsel stehen, wo
er war (das Modal wird neu geschrieben, also wird die Hoehe vorher gelesen und
nachher gesetzt), und ein Feld, in das getippt wird, wird in die Mitte gescrollt
- unten stehen der feste AKTIVIZO-Knopf und darunter die Tastatur des Telefons.

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

Dabei wird geprueft, ob der Fehler ueberhaupt einen Satz mitbringt. Kommt der
Aufruf gar nicht erst durch - kein Netz, CORS, Funktionen nicht
veroeffentlicht -, setzt das Firebase-SDK seinen CODE als Nachricht ein:
"internal", "unavailable", "deadline-exceeded". Ungeprueft stand dann
"internal" als Ueberschrift auf der Seite: ein Wort, das dem Gast nichts sagt
und wie ein Absturz aussieht. Ein Satz fuer den Gast hat ein Leerzeichen, ein
blosser Bezeichner hat keines - genau daran wird unterschieden
(`toGoError`). Was der Server selbst formuliert hat, bleibt unangetastet; er
weiss besser, was schiefging.

## 7. Gemessen, nicht behauptet

Bundle nach `npm run build:menyra-social:bundle`, beide Male auf demselben
Stand gemessen:

- Mit `MNYRA_GO_ENABLED = false`: Einstiegs-Bundle **515,32 kB**
  (138,43 kB gzip), kein einziger GO-Chunk. Rollup faltet die Konstante und
  wirft Seite, Suche, Panel-Seite, Firebase-Anbindung und Realtime heraus;
  uebrig bleiben rund 0,5 kB fuer die beiden Karten als Text.
- Mit `MNYRA_GO_ENABLED = true`: Einstiegs-Bundle **520,78 kB**
  (139,77 kB gzip), und GO liegt in fuenf nachgeladenen Stuecken:
  `go-page-render-utils` 71,00 kB (20,86 kB gzip),
  `go-page-view-controller` 13,18 kB (4,92 kB gzip),
  `go-admin-view-controller` 6,33 kB (2,43 kB gzip),
  `business-go-runtime-controller` 5,29 kB (2,23 kB gzip),
  `go-api-client` 2,80 kB (1,29 kB gzip).
  Die beiden ersten sind gewachsen (zusammen +4,3 kB gzip): Rad, Kalender,
  Staedteliste und die laufende Karte kosten Aufbau und Stylesheet. Das
  Einstiegs-Bundle beruehrt das nicht - nichts davon laedt, bevor jemand GO
  oeffnet.
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

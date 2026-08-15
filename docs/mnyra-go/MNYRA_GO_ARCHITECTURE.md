Status: CURRENT
Branch: claude/mnyra-go-feature-5hwxka
Stand: 2026-08-15

# Mnyra GO - Architektur und Entscheidungen

Umsetzung der Spezifikation "MNYRA GO v1.1". Dieses Dokument haelt fest, wie
das Feature in den bestehenden Mnyra-Stack eingesetzt wird, und begruendet
jede Stelle, an der die Umsetzung von der Spezifikation abweicht.

## 1. Grundsatz

GO ist ein isoliertes Feature-Modul. Es haengt an vier klar benannten
Stellen im Bestand:

- Qyteti (`core/feed`): eine Karte unter den Stories.
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
apps/menyra-social/core/go/*.js   Oberflaeche: Karte, Modal, Panel
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

### 4.4 Oeffnungszeiten (Punkt 18)

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

## 7. Stand der Umsetzung

| Schicht | Stand |
| --- | --- |
| Domaene `shared/go` | fertig, mit Tests |
| Server `functions/go` | fertig, mit Tests |
| Gastfluss (Qyteti, Modal, Buchung) | fertig, hinter Flag |
| Business (Panel, Angebote, Realtime) | fertig, hinter Flag |
| Rules und Indizes | fertig |
| Smart Offers (Punkt 127) | bewusst nicht in v1 |
| Sponsored-Abrechnung (Punkt 23) | Ranking vorbereitet, Abrechnung offen |

Die Aktivierung in Produktion ist eine eigene Entscheidung: Flag auf `true`,
Rules deployen, Functions deployen, Indizes anlegen.

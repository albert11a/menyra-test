Status: CURRENT
Last updated: 2026-08-21

# Landing 2 - Persoenliche Business-Praesentation

## Wofuer

Ein Lokal kennt Mnyra noch nicht. Es bekommt einen Link, oeffnet ihn auf dem
Handy und sieht als Erstes sein eigenes Logo, seinen Namen und den Anfang
seines fertigen Profils. Danach - und erst danach - erfaehrt es, was Mnyra
ist.

Am Ende soll es denken:

> Mein Lokal ist schon fertig. Es kostet mich nichts. Ich werde besser
> gefunden. Und wenn ich will, kann Mnyra mir zusaetzlich Arbeit abnehmen.

Landing 2 ersetzt Landing 1 (`/oferta/<slug>`) nicht. Die beiden fuehren ein
anderes Gespraech, und beide Links sind im Umlauf.

## Route

| Seite | Adresse | Auslieferung | Dateien |
| --- | --- | --- | --- |
| Landing 1 (Lead-Landing) | `/oferta/<slug>` | `api/oferta.js` | `apps/menyra-social/lead-landing/` |
| Landing 2 (Praesentation) | `/prezantim/<slug>` | `api/prezantim.js` | `apps/menyra-social/lead-landing-2/` |

`<slug>` ist derselbe Schluessel wie bei Landing 1: `publicSlug`,
`landingSlug` oder die Restaurant-ID. Zusaetzlich versteht die Seite
`?r=`, `?rid=`, `?restaurantId=` und `?slug=`.

Die Route steht in `vercel.json` vor `/:landingSlug/:surface` - sonst
verschluckt das allgemeine Profil-Muster sie. Der lokale Entwicklungsserver
(`scripts/local-dev-server.mjs`) kennt sie ebenfalls.

`api/prezantim.js` setzt Titel, Beschreibung und Logo serverseitig in die
Seite, bevor sie ausgeliefert wird: WhatsApp und die uebrigen Dienste fuehren
kein JavaScript aus und saehen sonst beim Teilen kein Logo. Dieselbe Antwort
traegt `<meta name="l2-restaurant">` - die Kennung, die der Browser sonst
erst in einer eigenen Rundreise erfragen muesste.

## Dateien

```
apps/menyra-social/lead-landing-2/
  index.html            Einstieg, modulepreload, preconnect
  landing2-app.js       Bootstrap: laden, bauen, Verhalten anhaengen
  landing2-config.js    Projekt-ID und API-Key (oeffentliche Client-Konfiguration)
  landing2-data.js      Read-only-Datenzugriff ueber Firestore-REST
  landing2-format.js    esc, Preise, Zahlen
  landing2-icons.js     Inline-SVG (Lucide-Strichfuehrung)
  landing2-preview.js   Die Mnyra-Oberflaechen als reine String-Funktionen
  landing2-prices.js    Die Preise, die die Seite zeigt
  landing2-scroll.js    Bildschirmhoehe, Sequenzen, Einblenden
  landing2-sections.js  Die Abschnitte in ihrer Reihenfolge
  landing2-styles.css   Eigenes Design-System, alles unter l2-
  landing2-track.js     Akquise-Messung
api/prezantim.js        Auslieferung mit Vorschau-Auszeichnung
```

## Isolation

Landing 2 zeigt das echte Lokal - sie fasst es nicht an.

- Kein Firebase-SDK, keine geteilte Firebase-Instanz, keine IndexedDB-
  Persistenz. Gelesen wird ueber die REST-Schnittstelle.
- Kein Import aus `core/`, aus `/shared/` oder aus der Lead-Landing. Die
  Landings teilen keine einzige Datei - eine Aenderung an der einen kann die
  andere nicht mitnehmen.
- Kein Router, keine Listener, kein gemeinsamer Zustand mit der App.
- Die sichtbaren Knoepfe ("Shto", "Dërgo porosinë", "Merr") sind `<span>`.
  Sie koennen nichts ausloesen, weil es nichts gibt, das darauf antwortet.
- Der einzige Schreibpfad der ganzen Seite ist die Messung (siehe unten).

Festgehalten in `tests/landing2-isolation.test.mjs` und
`tests/landing2-readonly.test.mjs`.

## Was die Seite laedt

Alles read-only, alles oeffentlich lesbar:

| Quelle | Wofuer |
| --- | --- |
| `publicRoutes/<slug>` | Slug -> Restaurant-ID |
| `restaurants/<id>` | Name, Bio, Stadt, Adresse, Logo, Titelbild, Kontakt |
| `restaurants/<id>/public/meta` | dasselbe aus dem CRM, gefuellte Werte gewinnen |
| `restaurants/<id>/public/menu` | Menue (Hauptquelle) |
| `restaurants/<id>/menuItems` | Menue (Rueckfall, wenn nicht veroeffentlicht) |
| `restaurants/<id>/public/offers` | "Sot në fokus" |
| `restaurants/<id>/socialPosts` | Postimet |
| `restaurants` (Liste) | Nachbarlokale fuer Qyteti, Lokalet, Kërko, Vision |

Die Normalisierung folgt Feld fuer Feld der echten App
(`menu-doc-normalize-utils.js`, `menu-card-style-utils.js`,
`post-doc-normalize-utils.js`), damit die Vorschau dieselben Artikel und
dieselbe Kartenform zeigt wie das echte Menue.

Die Nachbarlokale sind echte Lokale aus Mnyra. Erfundene Namen waeren genau
die eine Stelle, an der die Seite luegt - und es ist die Stelle, an der es ein
Wirt merkt.

## Der Ablauf

Die Reihenfolge ist der Inhalt. Sie steht in `landing2-sections.js` und wird
von `tests/landing2-story.test.mjs` festgehalten.

1. **Hyrje** - Logo, Name, "Kemi përgatitur diçka për ty."
2. **Profili** (Sequenz) - Profil, Postimet, Menuja, Produktdetail
3. **Falas** - "Dhe kjo është falas." 0 €/muaj
4. **Zbulimi** (Sequenz) - Qyteti, Harta, Lokalet, Kërko
5. **Një profil. Shumë mënyra për t'u zbuluar.**
6. **Çka është Mnyra** - ZBULO -> ZGJIDH -> SHKO -> NË TAVOLINË
7. **Tavolina** (Sequenz) - Kërko -> Profil -> QR -> Menu
8. **E njëjta MNYRA. Kudo.**
9. **Deri këtu? 0 €**
10. **Opsionale: Order** - "Kamerieri është i zënë?"
11. **Opsionale: GO** - "Ke tavolina bosh?"
12. **Po vjen: SAVE** - "Ka mbetur ushqim?"
13. **Biznesi** - "Gjithçka nga një vend."
14. **Vizioni** - "Një MNYRA. Kudo."
15. **Fundi** - Logo, Name, "Merr biznesin tim"

Nicht mit Mnyra erklaeren anfangen. Nicht mit Preisen anfangen. Nicht mit
Funktionen anfangen. Der erste Preis darf erst kommen, nachdem der Wirt
gesehen hat, was er kostenlos bekommt - `tests/landing2-story.test.mjs`
prueft genau das.

## Preise

| Was | Preis | Woher |
| --- | --- | --- |
| Profil, Menu, QR, Postimet, Story, Ofertat, Harta, Zbulimi | 0 € | Produktentscheidung |
| Mnyra Order | 0,02 € je bestelltem Produkt | Produktentscheidung, `landing2-prices.js` |
| Mnyra GO | 0,10 € (1 Person) bis 4,50 € (10 Personen), nur bei bestaetigter Oferta | `shared/go/go-commission-core.js` |
| Mnyra SAVE | noch kein Preis - das Feature gibt es noch nicht | - |

Die GO-Tabelle steht in `landing2-prices.js` abgeschrieben, weil Landing 2
nichts aus `/shared/` importiert. `tests/landing2-prices.test.mjs` haelt die
beiden Fassungen gegeneinander: Wer die echte Tabelle aendert und die Seite
vergisst, faellt im Test auf und nicht beim Wirt.

## Stand der Funktionen

| Funktion | Stand | Wie die Seite es zeigt |
| --- | --- | --- |
| Profil, Menu, Postimet, Story, Ofertat, QR | live | als vorhanden |
| Qyteti, Harta, Lokalet, Kërko | live | als vorhanden |
| Order (Bestellen am Tisch) | live (`USE_CREATE_RESTAURANT_ORDER_FUNCTION`) | als optionale Zusatzfunktion |
| Mnyra GO | live (`MNYRA_GO_ENABLED = true`) | als optionale Zusatzfunktion |
| Mnyra SAVE | existiert im Code nicht | ausdruecklich als "Po vjen" |
| Evente | nur als Wort im Ablauf und in der Vision | kein eigenes Kapitel, keine Zusage |

## Messung

Eigene Sammlung: `restaurants/<id>/landing2Sessions/<sessionId>`.

Getrennt von `landingSessions` (Landing 1) und getrennt von allem, was die App
misst. Ein Verkaufsgespraech gehoert nicht in die Zahlen des Lokals: Wie oft
sein Profil aufgerufen wurde, misst die App an anderer Stelle.

Ereignisse (`landing2-track.js`, feste Liste - was dort nicht steht, geht
nicht hinaus):

```
landing2_open            landing2_qr_seen
landing2_profile_seen    landing2_order_seen
landing2_free_seen       landing2_go_seen
landing2_discovery_seen  landing2_save_seen
landing2_business_seen   landing2_vision_seen
landing2_cta_seen        landing2_claim_click
```

Je Ereignis wird die verweilte Zeit in Millisekunden geschrieben. Geschickt
wird immer der ganze Stand, nie die Aenderung - eine verlorene Sendung traegt
die naechste nach.

Die Regeln stehen in `firestore.rules` (`landing2SessionShapeOk`). Lesen darf
nur, wer das Lokal verwaltet, und das CEO-Konto; geloescht wird nie.
`tests/rules/landing2-sessions.test.mjs` prueft das gegen den Emulator.

**Vor dem ersten Einsatz muessen die Rules deployt werden.** Bis dahin weist
Firestore die Messung ab - die Seite selbst laeuft davon unberuehrt weiter.

## Heart

Auf der Karte jedes Leads (Heart -> Leads) stehen beide Seiten nebeneinander:

- **Oferta** -> `/oferta/<slug>` (Landing 1)
- **Prezantimi** -> `/prezantim/<slug>` (Landing 2, violett hervorgehoben)
- **Kopjo Oferta** / **Kopjo Prezantimin** - zwei getrennte Kopier-Knoepfe

Bewusst zwei Knoepfe und nicht einer mit Auswahl: Ein "Kopjo linkun" fuer zwei
Links waere der teuerste Tippfehler im Vertrieb - man verschickt die falsche
Seite und merkt es nie.

## Darstellung

- Mobile first. Geprueft auf 320, 360, 390, 414/430 und Desktop.
- Navy, Weiss, helles Lavendel; Violett als Akzent. Sonst nichts.
- Die Vorschau nimmt fast die volle Breite ein - kein Telefon aus Kunststoff
  drumherum. Ein Wirt soll seine Karte lesen koennen.
- Sequenzen halten die Flaeche fest und wechseln den Ausschnitt. Kein
  Scroll-Snap: Wer schnell durchwischen will, soll das koennen.
- `prefers-reduced-motion` loest die Sequenzen in gewoehnliche Abschnitte
  untereinander auf - dieselbe Information, nur ohne die Bewegung.
- Die Bildschirmhoehe wird einmal gemessen und als feste Zahl gesetzt; sonst
  wandern die Schritte unter dem Finger weg, wenn der Browser seine Leisten
  ein- oder ausblendet.

## Weitere Lokale

Landing 2 ist nicht auf ein Lokal geschrieben. Alles kommt aus dem Datensatz:
Name, Logo, Titelbild, Menue, Posts, Adresse - und selbst der Suchbegriff im
Kërko-Kapitel wird aus dem Namen oder der Menue-Kategorie abgeleitet
(`resolveSearchTerm`). Ein Lokal ohne Logo bekommt seinen Anfangsbuchstaben
statt eines grauen Kreises; ein Lokal ohne Menue bekommt einen Satz statt
einer leeren Flaeche.

Wird das Lokal nicht gefunden, zeigt die Seite "Ky profil nuk u gjet." und
sonst nichts. Eine halbe personalisierte Seite waere schlimmer als gar keine.

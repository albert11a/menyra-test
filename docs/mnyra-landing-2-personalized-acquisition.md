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
  index.html                Einstieg, modulepreload, preconnect
  landing2-app.js           Bootstrap: laden, bauen, Verhalten anhaengen
  landing2-config.js        Projekt-ID und API-Key (oeffentliche Client-Konfiguration)
  landing2-data.js          Read-only-Datenzugriff ueber Firestore-REST
  landing2-format.js        esc, Preise, Zahlen
  landing2-icons.js         Die Symbole - gespiegelt aus social-app.js und
                            core/go/go-icon-render-utils.js
  landing2-preview.js       Die Mnyra-Bildschirme, mit dem Markup der App
  landing2-prices.js        Die Preise, die die Seite zeigt
  landing2-scroll.js        Bildschirmhoehe, Sequenzen, Einblenden
  landing2-sections.js      Die Abschnitte in ihrer Reihenfolge
  landing2-app-mirror.css   ERZEUGT: die Stilblaetter der App
  landing2-styles.css       Die Landing selbst - alles unter l2-
  landing2-track.js         Akquise-Messung
api/prezantim.js            Auslieferung mit Vorschau-Auszeichnung
scripts/generate-landing2-app-mirror.mjs   erzeugt landing2-app-mirror.css
```

## 1:1 mit der App - wie das gemacht ist

Landing 2 zeigt keine Nachzeichnungen von Mnyra, sondern Mnyra. Das ist keine
Absichtserklaerung, sondern eine Bauweise mit drei Teilen:

**1. Dasselbe Stylesheet.** `index.html` laedt
`styles/tailwind.generated.css` - dieselbe Datei, die die echte App laedt.
Damit sind alle Tailwind-Klassen (`rounded-[2.5rem]`, `text-[28px]`,
`shadow-[0_8px_30px_rgb(0,0,0,0.03)]`, ...) nicht ungefaehr gleich, sondern
dieselbe Zeile. Sie koennen nicht auseinanderlaufen.

**2. Dasselbe Markup.** `landing2-preview.js` traegt die Klassenketten der
echten Renderer, Zeichen fuer Zeichen. Ueber jedem Abschnitt steht, aus
welchem Renderer er kommt:

| Bildschirm | Quelle in der App |
| --- | --- |
| Profil, Reiter | `core/profile/profile-menu-focus-render-controller.js` (`renderBusinessProfileIdentityCard`, `renderProfileTabs`) |
| Beitrags-Kacheln | `core/profile/profile-post-card-markup-utils.js` |
| Menue (Fokus, Getraenke, Speisen) | `renderTestfirstFocusSection`, `renderTestfirstDrinkGridCard`, `renderTestfirstFoodCard`, `renderTestfirstMenuContent` |
| Produktdetail | `core/menu/menu-modal-render-utils.js` (`renderMenuDetailModalCore`) |
| Qyteti: Story-Reihe | `core/feed/story-tile-markup-utils.js`, `renderSpotStoryIntroCard`, `renderStoriesRow` |
| Qyteti: Beitragskarte | `core/feed/feed-card-markup-utils.js` |
| Harta | `core/discovery/discovery-runtime-controller.js` (`renderMapView`, `makeBizDivIcon`, `renderMapSheet`) |
| Lokalet | `core/marketplace/marketplace-view-render-utils.js` (`renderRestaurantListCard`) |
| Kërko | `core/discovery/discovery-runtime-controller.js` (`renderSearchView`, `renderSearchBusinessItem`) |
| Biznesi | `core/dashboard/dashboard-render-utils.js` + `core/ui/work-surface-render-utils.js` |
| Mnyra GO | `core/go/go-offer-card-render-utils.js` + dieselbe Arbeitsseiten-Geometrie |
| Kopfzeile (Qyteti/Lokalet/Mnyra GO) | `core/app-shell/app-shell-runtime-controller.js` |

**3. Dieselben Blaetter, wo sie in JavaScript liegen.** Karte, Paneli und
Mnyra GO tragen eigene Stilblaetter, die in der App als JavaScript-
Zeichenketten stehen (`WORK_SURFACE_CSS`, `DASHBOARD_CSS`, `GO_OFFER_CARD_CSS`
und die Marken aus `GO_PAGE_CSS`). Ein Stylesheet kann keine Zeichenkette
laden - `scripts/generate-landing2-app-mirror.mjs` schneidet sie heraus und
legt sie als `landing2-app-mirror.css` ab. Dazu die Marken der App
(`--app-content-inline`, `--app-bg`, ...), die Kartenansicht, die Pill-Zeile,
die Scroll-Helfer und die Tailwind-Klassen, die der statische Build der App
nicht kennt - alle aus `apps/menyra-social/index.html`.

```
npm run landing2:mirror         # neu erzeugen
npm run landing2:mirror:check   # gegen die App pruefen
```

**Und die Symbole.** `landing2-icons.js` enthaelt das Symbol-Register von
`social-app.js` (`INLINE_LUCIDE_ICON_NODES`) und die sechs Symbole der
GO-Karte aus `core/go/go-icon-render-utils.js`, jeweils wortgleich. Die
Groesse steht wie in der App an der Klasse (`w-4 h-4`), nicht im Aufruf.

`tests/landing2-parity.test.mjs` haelt alles davon gegeneinander: das
gespiegelte Blatt, das Symbol-Register, rund vierzig Klassenketten und die
Woerter der GO- und Panel-Karten. Wer eine Flaeche in der App aendert und
Landing 2 vergisst, faellt dort auf - nicht beim Wirt.

## Wo Landing 2 bewusst anders ist

Vier Stellen, und jede hat einen Grund:

| Stelle | Unterschied | Warum |
| --- | --- | --- |
| **Harta** | Statt einer geladenen Leaflet-Kachel liegt eine gezeichnete Flaeche in derselben Farbe (`#e2e8f0`, die Farbe unter der Kachel in der App). Stecknadeln, Karte und Bedienteile sind echt. | Eine echte Kachel braucht Leaflet, einen fremden Kachelserver und die Standortfreigabe des Betrachters. Fuer den einen Satz "Klienten sehen, was in der Naehe ist" waere das viel Technik - und die Stelle stuende sekundenlang leer. |
| **Tavolina (QR)** | Der Aufsteller ist eine eigene Zeichnung. | Er ist ein Gegenstand auf dem Tisch, kein Bildschirm der App - es gibt keinen Renderer dafuer. Der Code selbst ist bewusst ein Muster ohne Ziel: Ein echter QR auf einer Verkaufsseite waere einer, den jemand abfotografiert und der dann auf eine Vorschau statt auf das Lokal zeigt. |
| **Mnyra SAVE** | Eine Zeichnung, keine Aufnahme. | SAVE gibt es im Code noch nicht. Der Abschnitt sagt das: Plakette "Po vjen" und der ausgeschriebene Satz darunter. |
| **Vision-Reihe** | In der Sprache der Landing gesetzt. | Es gibt in Mnyra keine Ansicht "alle Lokale nebeneinander mit ihrem QR". Sie ist eine Aussage ueber die App, kein Bildschirm daraus. |

Zwei kleinere, aus demselben Grund - eine Aufnahme ist kein Programm:

- Ein Lokal ohne Logo bekommt in den kleinen runden Bildchen (Feed, Suche,
  Karte) seinen Anfangsbuchstaben. Die App zeigt dort ihren grauen
  Platzhalter; auf einer Verkaufsseite saehe der wie ein Fehler aus. Im Profil
  steht der Platzhalter der App (`store` auf grauem Grund) unveraendert.
- Im Produktfenster ist der Reiter "Alergjenët" offen statt "Info". Es ist
  derselbe Bildschirm in einem seiner drei Zustaende - dem, der hier etwas
  sagt: Preis und Beschreibung standen schon darueber.

Und eine Sache in der Geometrie: Die Vorschau laeuft auf dem Handy bis an
beide Bildschirmraender. Haette der Rahmen ein eigenes Polster, waere der
Inhalt darin schmaler als auf einem echten Telefon - auf einem 360er Geraet
44 Punkte, und im Profil legte sich das Bild ueber die Zahl daneben. Ab
Tablet steht der Bildschirm als Karte in Telefonbreite (390px).

## Isolation

Landing 2 zeigt das echte Lokal - sie fasst es nicht an.

- Kein Firebase-SDK, keine geteilte Firebase-Instanz, keine IndexedDB-
  Persistenz. Gelesen wird ueber die REST-Schnittstelle.
- Kein Import aus `core/`, aus `/shared/` oder aus der Lead-Landing. Die
  Landings teilen keine einzige Datei - eine Aenderung an der einen kann die
  andere nicht mitnehmen.
- Kein Router, keine Listener, kein gemeinsamer Zustand mit der App.
- Die sichtbaren Knoepfe ("Shto", "Dërgo porosinë", "Merr ofertën") tragen die
  Klassen der App, sind aber `<span>` - ohne `href`, ohne `data-`-Anker, an
  denen die App ihre Handler festmacht. Die ganze Flaeche traegt zusaetzlich
  `pointer-events: none`. Sie sehen gleich aus und koennen niemanden
  erreichen.
- Der einzige Schreibpfad der ganzen Seite ist die Messung (siehe unten).

Geteilt wird genau eine Sache: das Stylesheet der App. Das ist kein Bruch der
Isolation, sondern ihr Gegenstueck - ein Stylesheet ist eine Beschreibung, kein
Programm. Es bringt keinen Router mit, keine Listener, keinen Schreibpfad und
keine Firebase-Instanz. Und es kann nicht auseinanderlaufen, weil es dieselbe
Datei ist.

Festgehalten in `tests/landing2-isolation.test.mjs`,
`tests/landing2-readonly.test.mjs` und `tests/landing2-parity.test.mjs`.

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
2. **Profili** (Sequenz, 3 Schritte) - Profil, Postimet, Menuja
3. **Produkti** - "Gjithçka që klienti duhet të dijë."
4. **Falas** - "Dhe kjo është falas." 0 €/muaj
5. **Zbulimi** (Sequenz, 4 Schritte) - Qyteti, Harta, Lokalet, Kërko
6. **Një profil. Shumë mënyra për t'u zbuluar.**
7. **Çka është Mnyra** - ZBULO -> ZGJIDH -> SHKO -> NË TAVOLINË
8. **Tavolina** - vier gewoehnliche Abschnitte: Kërko, Profil, QR, Menu
9. **E njëjta MNYRA. Kudo.**
10. **Deri këtu? 0 €**
11. **Opsionale: Order** - "Kamerieri është i zënë?"
12. **Opsionale: GO** - "Ke tavolina bosh?"
13. **Po vjen: SAVE** - "Ka mbetur ushqim?"
14. **Biznesi** - "Gjithçka nga një vend."
15. **Vizioni** - "Një MNYRA. Kudo."
16. **Fundi** - Logo, Name, "Merr biznesin tim"

Nicht mit Mnyra erklaeren anfangen. Nicht mit Preisen anfangen. Nicht mit
Funktionen anfangen. Der erste Preis darf erst kommen, nachdem der Wirt
gesehen hat, was er kostenlos bekommt - `tests/landing2-story.test.mjs`
prueft genau das.

## Scrollen

Nur senkrecht. Kein Scroll-Snap, keine waagerechte Geste, keine zweite
Scrollebene: Die waagerechten Reihen der App (Story-Reihe, Fokus-Reihe,
Kartenreihe im Panel) stehen in der Vorschau still - was nicht ins Bild passt,
ist abgeschnitten, genau wie auf einer Aufnahme.

Es gibt **zwei** stehende Sequenzen, nicht mehr:

- **Profil**: 3 Schritte (Profil, Postimet, Menuja)
- **Zbulimi**: 4 Schritte (Qyteti, Harta, Lokalet, Kërko)

Alles andere sind gewoehnliche Abschnitte untereinander - Text oben, Flaeche
darunter. Der Weg vom Finden bis zum Tisch war frueher eine dritte Sequenz mit
vier Wechseln; er liest sich als Abfolge von oben nach unten besser als in
einer Flaeche, die sich unter dem Finger austauscht.

In einer Sequenz gilt: **Der Satz kommt vor dem Bild.** Die Beschriftung
wechselt um `CAPTION_LEAD` (0,18 eines Schrittes, rund ein Sechstel
Bildschirmhoehe) frueher als die Flaeche darunter - man liest "Menuja jote",
und dann kommt die Menue. Ohne diesen Vorlauf wechselten beide gleichzeitig,
und das las sich wie "es ist ploetzlich etwas anderes da".

Ein Schritt bekommt eine ganze Bildschirmhoehe Weg. Der Wechsel selbst ist ein
Ueberblenden mit 10 Pixeln Nachruecken, 260ms - kein Groesserwerden, kein
Springen.

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

- Mobile first. Geprueft auf 320, 360, 390, 430 und Desktop.
- Die Seite selbst: Navy, Weiss, helles Lavendel; Violett als Akzent - dasselbe
  Indigo wie in der App (`#4f46e5`). Die Bildschirme darin tragen die Farben
  der App, nicht die der Seite.
- Die Vorschau laeuft bis an beide Raender - kein Telefon aus Kunststoff
  drumherum. Ein Wirt soll seine Karte lesen koennen, und der Inhalt darin
  soll so breit sein wie auf seinem Telefon.
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

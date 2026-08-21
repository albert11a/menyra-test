Status: CURRENT
Last updated: 2026-08-21

# Landing 2 - Persoenliche Business-Praesentation

## Wofuer

Ein Lokal kennt Mnyra noch nicht. Es bekommt einen Link, oeffnet ihn auf dem
Handy und sieht als Erstes sein eigenes Logo und seinen Namen; einen Wisch
weiter sein fertiges Profil. Danach - und erst danach - erfaehrt es, was Mnyra
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
| Menue (Fokus, Speisen) | `renderTestfirstFocusSection`, `renderTestfirstFoodCard`, `renderTestfirstMenuContent` |
| Produktdetail | `core/menu/menu-modal-render-utils.js` (`renderMenuDetailModalCore`) |
| Qyteti: Story-Reihe | `core/feed/story-tile-markup-utils.js`, `renderSpotStoryIntroCard`, `renderStoriesRow` |
| Qyteti: Beitragskarte | `core/feed/feed-card-markup-utils.js` |
| Harta | `core/discovery/discovery-runtime-controller.js` (`renderMapView`, `makeBizDivIcon`, `renderMapSheet`) |
| Lokalet | `core/marketplace/marketplace-view-render-utils.js` (`renderRestaurantListCard`) |
| Kërko | `core/discovery/discovery-runtime-controller.js` (`renderSearchView`, `renderSearchBusinessItem`) |
| Shporta, Bestaetigung | `core/shop/shop-view-cart-orchestration-controller.js` (`renderProfileShopCartView`) |
| Biznesi | `core/dashboard/dashboard-render-utils.js` + `core/ui/work-surface-render-utils.js` |
| Mnyra GO: Karte im Qyteti | `core/go/go-entry-card-render-utils.js` (`renderGoEntryCardCore`) |
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

Fuenf Stellen, und jede hat einen Grund:

| Stelle | Unterschied | Warum |
| --- | --- | --- |
| **Harta** | Statt einer geladenen Leaflet-Kachel liegt eine gezeichnete Flaeche in derselben Farbe (`#e2e8f0`, die Farbe unter der Kachel in der App). Stecknadeln, Karte und Bedienteile sind echt. | Eine echte Kachel braucht Leaflet, einen fremden Kachelserver und die Standortfreigabe des Betrachters. Fuer den einen Satz "Klienten sehen, was in der Naehe ist" waere das viel Technik - und die Stelle stuende sekundenlang leer. |
| **Tavolina (QR)** | Der Aufsteller ist eine eigene Zeichnung. | Er ist ein Gegenstand auf dem Tisch, kein Bildschirm der App - es gibt keinen Renderer dafuer. Der Code selbst ist bewusst ein Muster ohne Ziel: Ein echter QR auf einer Verkaufsseite waere einer, den jemand abfotografiert und der dann auf eine Vorschau statt auf das Lokal zeigt. |
| **Mnyra SAVE** | Eine Zeichnung, keine Aufnahme. | SAVE gibt es im Code noch nicht. Der Abschnitt sagt das: Plakette "Po vjen" und der ausgeschriebene Satz darunter. |
| **Milchglas** | Innerhalb der Vorschau ist `backdrop-filter` abgeschaltet. Die zwei duennsten Flaechen (Reiterleiste im Profil, Zahlenpille auf einer Beitragskarte) bekommen dafuer etwas mehr Deckung im Grund. | Die Mnyra-Oberflaechen bringen elf solcher Flaechen mit. In der App ist das je einmal zu berechnen; hier liegen bis zu vier Oberflaechen uebereinander und blenden ineinander - und ein `backdrop-filter` muss bei JEDEM Bild neu ausgerechnet werden, weil sich der Grund darunter geaendert haben koennte. Auf dem iPhone war das der teuerste Posten der ganzen Seite. Es ist eine Aufnahme, kein Programm: Was hinter diesen Flaechen liegt, ist ohnehin fest. |
| **Kachelreihe und Kreis** | Beide in der Sprache der Landing gesetzt. | Es gibt in Mnyra weder eine Ansicht "alle Lokale nebeneinander mit ihrem QR" noch eine "Mnyra in der Mitte". Beides sind Aussagen ueber die App, keine Bildschirme daraus - und bewusst zwei verschiedene Bilder, damit der zweite Abschnitt nicht wie eine Wiederholung des ersten liest. |

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

1. **Hyrje** - Logo, Name, "Kemi përgatitur diçka për ty." Ohne Vorschau.
2. **Profili** (gefuehrt, 3 Zustaende auf EINEM Bildschirm) - Profilkopf mit
   Reiterleiste, dann die Beitraege, dann die Menue
3. **Falas** - "E gjithë kjo falas." 0 €, "Pa abonim."
4. **Zbulimi** (gefuehrt, 6 Zustaende auf vier Bildschirmen) - Qyteti
   (Story-Reihe, dann der Beitrag), Harta, Lokalet, Kërko (leeres Feld, dann
   das Ergebnis)
5. **Një profil. Shumë vende ku mund të të gjejnë.**
6. **Çka është Mnyra** - ZBULO -> ZGJIDH -> SHKO -> NË TAVOLINË
7. **Tavolina** - "MNYRA nuk mbaron te dera." Vier Zeilen Weg, ein Aufsteller.
8. **E njëjta MNYRA. Kudo.** - die Kachelreihe
9. **Deri këtu? 0 €**
10. **Opsionale: Order** - "Kamerieri është i zënë?", dann gefuehrt in drei
    Zustaenden: Produkt, Shporta, Porosia u dergua
11. **Opsionale: GO** - "Ke tavolina bosh?", dann gefuehrt in drei Zustaenden:
    der Gast sucht, die Oferta, der Gast kommt
12. **Po vjen: SAVE** - "Ka mbetur ushqim?"
13. **Biznesi** - "Gjithçka nga një vend.", dann gefuehrt in zwei Zustaenden:
    Funksionet, Analitika
14. **Vizioni** - "Një MNYRA. Kudo." - Mnyra in der Mitte, die Lokale darum
15. **Fundi** - Logo, Name, 0 €, "Merr biznesin tim"

Nicht mit Mnyra erklaeren anfangen. Nicht mit Preisen anfangen. Nicht mit
Funktionen anfangen. Der erste Preis darf erst kommen, nachdem der Wirt
gesehen hat, was er kostenlos bekommt - `tests/landing2-story.test.mjs`
prueft genau das.

## Eine Vorschau, ein Ort

Die teuerste Stelle dieser Seite ist derselbe Mnyra-Bildschirm zweimal. Wer
sein Profil sieht und einen Wisch spaeter noch einmal fast dasselbe Profil,
liest nicht "hier geht es weiter", sondern "das hatte ich schon" - und ab da
liest er quer.

Jede Flaeche gehoert deshalb genau einem Abschnitt:

| Flaeche | Steht in |
| --- | --- |
| Profil-Karte, Reiterleiste, Postimet, Menue | Der gefuehrte Bildschirm Profili - EINE Flaeche ueber alle drei Zustaende |
| Qyteti (Story-Reihe und Beitrag) | Zbulimi, Zustaende 1-2 - eine Flaeche |
| Harta | Zbulimi, Zustand 3 |
| Lokalet | Zbulimi, Zustand 4 |
| Kërko (leer und mit Ergebnis) | Zbulimi, Zustaende 5-6 - eine Flaeche |
| Aufsteller (QR) | Abschnitt Tavolina |
| Produktfenster, Shporta, Bestaetigung | Die gefuehrte Bestellung |
| Mnyra GO (Karte im Qyteti, Oferta, angenommen) | Der gefuehrte GO-Vorgang |
| SAVE | eigener Abschnitt |
| Paneli (Kennzahlen, Reiter, Funksionet, Analitika) | Der gefuehrte Bildschirm Biznesi - eine Flaeche |
| Kachelreihe | Abschnitt "E njëjta MNYRA. Kudo." |
| Kreis (Mnyra in der Mitte) | Abschnitt Vizioni |

`tests/landing2-story.test.mjs` haelt das fest: Es sucht je ein Kennzeichen aus
dem Markup jeder Flaeche auf der ganzen Seite und besteht darauf, dass es genau
einmal vorkommt.

Entfernt wurden dabei vier Doppelungen:

- Der Kopf trug unten das angeschnittene Profil - und direkt darunter stand
  dasselbe Profil noch einmal als erster Schritt der Sequenz. Der Kopf ist
  jetzt nur Logo, Name und zwei Saetze, und weil er kuerzer ist als ein
  Bildschirm, ist der obere Rand der Buehne schon zu sehen.
- Der Weg an den Tisch war eine Reihe von vier Bildschirmen: Kërko, Profil,
  QR, Menue. Drei davon hatte der Wirt kurz vorher gesehen. Jetzt sind es vier
  Zeilen Text und der Aufsteller - der einzige Bildschirm, den es dort noch
  nicht gab.
- Die Kachelreihe stand zweimal, einmal unter "E njëjta MNYRA. Kudo." und
  einmal unter "Një MNYRA. Kudo.". Der zweite Abschnitt hat jetzt ein eigenes
  Bild: Mnyra in der Mitte, die Lokale darum.
- Die grossen Ueberschriften der Sequenzen ("Profili yt.") standen als
  Plakatzeile ueber der Flaeche. Sie sind jetzt kleine Beschriftungen
  unmittelbar darueber und wechseln mit ihr.
- Das Produktfenster stand als eigener Abschnitt hinter der Menue - zwei
  Bildschirme derselben Karte hintereinander. Es steht jetzt dort, wo ein Gast
  es antippt: als erster Zustand der Bestellung.
- Das Profil wurde in drei Aufnahmen gezeigt, die einander ueberblendeten -
  drei Profilkarten, drei Reiterleisten im Markup. Es ist jetzt EIN
  Bildschirm, durch den der Scrollstand fuehrt (siehe unten).

## Scrollen

Nur senkrecht. Kein Scroll-Snap, kein Auto-Scroll, keine waagerechte Geste,
keine zweite Scrollebene: Die waagerechten Reihen der App (Story-Reihe,
Fokus-Reihe, Kartenreihe im Panel) stehen in der Vorschau still - was nicht ins
Bild passt, ist abgeschnitten, genau wie auf einer Aufnahme.

Es gibt fuenf gefuehrte Flaechen: Profili (3 Zustaende), Zbulimi (6), die
Bestellung (3), der GO-Vorgang (3) und das Paneli (2). Alles andere sind
gewoehnliche Abschnitte untereinander - Text oben, Flaeche darunter.

### Ein Bildschirm, mehrere Zustaende

Das ist der Kern, und er unterscheidet Landing 2 von einer Bildergeschichte.

Frueher war ein Zustand eine Aufnahme, und der naechste legte die naechste
Aufnahme darueber: drei Profilkarten im Markup, drei Reiterleisten, drei
Ueberblendungen. Wer weiterwischte, bekam ein anderes Bild hingelegt.

Jetzt sagt eine Flaeche, **von** welchem **bis zu** welchem Zustand sie gilt
(`data-from` / `data-to`), und was innerhalb dieser Zustaende geschieht, ist
Scroll und kein Wechsel:

| Teil | Was er tut |
| --- | --- |
| `data-l2-head` | der Kopf - Profilkarte, Story-Reihe, Kennzahlen-Reihe. Er wandert beim ersten Wisch nach oben aus dem Bild. |
| `data-l2-stick` | was stehenbleibt - die Reiterleiste. Sie wird nicht ausgetauscht und nicht neu gebaut. |
| `data-l2-panel` | was darunter laeuft - ein Feld je Zustand, mit eigenem `from`/`to`. |

Ein Feld kann sich ueber mehrere Zustaende erstrecken. Die Beitraege im Profil
gehoeren zu Zustand 1 UND 2: Im ersten liegen sie unter dem Kopf und sind nicht
zu sehen, im zweiten sind sie da, weil der Kopf gegangen ist. Kein Wechsel,
kein Aufblenden - nur Scroll.

`data-l2-head="fill"` sagt, dass der Kopf im ersten Zustand den ganzen
Bildschirm fuellen muss. Wie hoch er dafuer sein muss, misst
`landing2-scroll.js` auf dem Geraet, auf dem es gerade laeuft: Bildschirmhoehe
minus Reiterleiste samt ihren Abstaenden. Ohne diese Zeile schaute unter dem
Profilkopf schon die erste Beitragskachel hervor - und der erste Zustand waere
nicht mehr "dein Profil", sondern "dein Profil und noch etwas". Das Paneli
setzt sie bewusst nicht: Dort gehoert die Flaeche unter der Reiterleiste von
Anfang an zum Bild, genau wie in der App.

Erst wenn eine **andere** Flaeche an der Reihe ist - Qyteti nach Harta -, legt
sie sich als leere Scheibe darueber. Das Ueberblenden zweier vollstaendiger
Mnyra-Oberflaechen gibt es weiterhin nicht.

### Der Reiterwechsel ist der von Mnyra

Beim Uebergang von den Beitraegen zur Menue wechselt der Reiter von Postimet
auf Menu - und zwar nicht mit einer Bewegung, die es nur hier gibt.

Es ist dieselbe Leiste, dieselben beiden Felder. Sie tragen ihre beiden
Klassensaetze bei sich (`data-l2-tab-on`, `data-l2-tab-off`), und der
Scrollstand tauscht sie. Die Bewegung dazwischen ist die der App
(`transition-all duration-300` steht in der Klassenkette von
`renderProfileTabs`). Der Antrieb in `landing2-scroll.js` muss deshalb nicht
wissen, wie ein aktiver Reiter in Mnyra aussieht - er schaltet nur um.

Dasselbe im Paneli: Dort traegt die Pillen-Reihe `aria-selected`, und genau das
schaltet der Scrollstand.

Der Scroll bestimmt den **Zeitpunkt**. Wie es aussieht, bestimmt Mnyra.

### Der Scrollstand sagt wohin, nicht wie weit

Die erste Fassung haengte jede Deckkraft unmittelbar am Scrollstand: ein Pixel
gewischt, ein Pixel Uebergang. Auf dem Telefon hakte das, und zwar aus einem
Grund, den man dem Code nicht ansieht - waehrend des Ziehens muss der Browser
bei jedem einzelnen Bild zwei vollstaendige Mnyra-Oberflaechen neu
zusammensetzen.

Jetzt sagt der Scrollstand nur noch, **welcher** Schritt gilt. Der Wechsel
dorthin ist eine eigene, zeitgesteuerte Bewegung von 460ms: ein Wisch, und der
Uebergang laeuft in einem Zug durch - wie das Weiterblaettern in einer App.

Gesperrt wird dabei nichts. Es gibt kein `preventDefault`, kein Scroll-Snap,
keine eigene Geste: Die Seite scrollt weiter wie jede andere, man kann
durchwischen, umkehren, schnell oder langsam sein. Nur klebt der Uebergang
nicht mehr am Finger. Ein Pflicht-Swipe waere auf dem iPhone genau die Stelle,
an der Webseiten kaputtgehen - er kollidiert mit Gummiband und Adressleiste.

Drei Groessen, alle drei reine Funktionen ohne gemerkten Zustand:

| | was sie sagt |
| --- | --- |
| `u` | der Scrollstand in Schritten (0 = erster, n = letzter) |
| `target` | welcher Schritt gilt - `stepTarget(u, n, jetzt)` |
| `a` | wo die Bewegung gerade steht, ebenfalls in Schritten |

Aendert der Scrollstand das Ziel, faengt die Bewegung von ihrem jetzigen Stand
aus neu an. Deshalb bleibt beim Umkehren mitten im Uebergang nichts haengen:
Das Ziel wandert zurueck, und die Bewegung dreht um. Wer ueber mehrere Schritte
hinwegwischt, bekommt nur den letzten vorgefuehrt - alles andere waere eine
Bewegung, die niemand mehr mitliest.

`stepTarget` traegt einen schmalen Saum von 0.03 Schritten (rund zwanzig
Punkte). Ein Finger, der genau auf der Kante zur Ruhe kommt, wackelt um wenige
Pixel; ohne Saum kippte das Ziel dabei hin und her, und weil jede Aenderung die
Bewegung neu anwirft, bliebe der Wechsel auf halbem Weg stehen und zappelte.
Breiter darf er nicht sein - dann zeigte dieselbe Stelle je nach
Anfahrtsrichtung sichtbar etwas anderes.

Gerechnet wird bei jedem Bild fuer jede Sequenz, auch fuer die zehn
Bildschirme weiter unten. Ein IntersectionObserver, der Sequenzen ausserhalb
des Bildes abschaltet, spart nichts Messbares und schafft dafuer den einen
Zustand, den es hier nicht geben darf: einen, der haengenbleibt. Der Beobachter
ist nur noch fuer das erste Einblenden gewoehnlicher Abschnitte zustaendig.

### Der Fahrplan eines Wechsels

Die Zahlen sind Anteile **einer Bewegung** (460ms), nicht Anteile einer
Bildschirmhoehe (`landing2-scroll.js`):

```
0.00 .. 0.20   der alte Satz geht nach oben weg
0.22 .. 0.54   der neue Satz kommt von unten
0.50 .. 0.82   die neue Flaeche legt sich als leere Scheibe darueber
0.82 .. 1.00   ihr Inhalt kommt darauf
```

Das heisst: rund 60ms ohne Satz, waehrend er getauscht wird, und rund 130ms
Vorlauf, bevor sich die Flaeche darunter ruehrt. **Der Satz kommt vor dem
Bild** - man liest "Menuja jote", und dann kommt die Menue.

### Warum der Wechsel in zwei Zuegen kommt

Ein gewoehnliches Ueberblenden zweier Mnyra-Bildschirme sieht kaputt aus. In
der Mitte stehen zwei vollstaendige Oberflaechen halbdurchsichtig
uebereinander: zwei Suchfelder, zwei Kartenlisten, zwei Preise, alles
ineinander. Das ist keine Frage des Geschmacks - man liest es als Fehler.

Deshalb kommt die neue Flaeche in zwei Zuegen: erst ihre leere Scheibe
(`.l2-seq__view`, mit dem Grund der App darin), die die alte Flaeche
vollstaendig zudeckt, dann ihr Inhalt (`.l2-screen__inner`) darauf. Erst die
alte Oberflaeche, dann ein ruhiger Grund, dann die neue - nie zwei zugleich.

Bei den Saetzen ist es dasselbe Problem, nur hat ein Satz keinen eigenen
Grund, mit dem er den darunter verdecken koennte. Also geht der alte erst ganz,
dann kommt der neue.

### Gezeichnet wird nur, was jemand sehen kann

Auf einer Buehne liegen bis zu vier vollstaendige Mnyra-Oberflaechen
uebereinander. Ein Browser zeichnet auch die, die unter einer undurchsichtigen
liegen oder auf null gestellt sind - er weiss ja nicht, dass sie niemand
braucht.

`landing2-scroll.js` setzt deshalb `visibility: hidden` (`.is-off`) auf alles
ausser der obersten Flaeche und, waehrend eines Wechsels, der einen darueber.
Im Stillstand wird genau **eine** Vorschau gezeichnet statt sieben. Dazu steht
`will-change` nur noch waehrend einer Bewegung (`.l2-seq.is-moving`) - dauerhaft
gesetzt haelt es die Ebene fuer immer im Speicher.

Gemessen an einem Durchlauf durch beide Sequenzen (Chromium, 390x780,
dreifache Punktdichte):

| | vorher | jetzt |
| --- | --- | --- |
| Ebenen im Speicher | 32 / 60 MB | 13 / 44 MB |
| Flaechen mit `backdrop-filter` | 21 | 0 |
| gleichzeitig gezeichnete Vorschauen | 7 von 7 | 1-2 von 7 |
| Rechenzeit fuer den Durchlauf | 1947ms | 1204ms |

### Die beiden stetigen Wege

Zwei Bewegungen haengen weiter unmittelbar am Scrollstand - und zwar mit
Absicht: Sie sind ein Scroll, und ein Scroll haengt am Finger.

**Der Kopf** wandert beim ersten Wisch nach oben aus dem Bild
(`colTravel`, `data-l2-col`): der Profilkopf, die Story-Reihe von Qyteti, die
Kennzahlen-Reihe des Panelis. Das ist die Bewegung, die aus zwei Aufnahmen
einen Bildschirm macht - man scrollt in seinem Profil weiter, statt ein
anderes hingelegt zu bekommen.

**Der Versatz** schiebt einen Inhalt in seinem Fenster nach oben
(`panTravel`, `data-l2-pan`), wenn er laenger ist als das Fenster: die Menue,
ein langer Beitrag, eine lange Liste. Kein `overflow: auto`, keine Beruehrung:
Der Finger bedient weiter nur die Seite.

Beide laufen **gerade** und nicht weich an - und das ist der wichtigste
Unterschied zu den Wechseln. Eine weiche Kurve ist in der Mitte anderthalbmal
so schnell wie im Schnitt; bei einer Bewegung, die von selbst durchlaeuft, ist
das richtig, hier waere es der Grund, warum sich eine Vorschau anfuehlt, als
scrollte sie von selbst.

Wie weit geschoben wird, wird im Stillstand gemessen (Inhalt minus Fenster)
und bei 75 % der **Bildschirmhoehe** gekappt - nicht der Fensterhoehe: Der Weg,
der zur Verfuegung steht, ist ein Schritt der Seite, und der ist eine
Bildschirmhoehe lang. Die Zahl folgt aus einer Bedingung: Der Inhalt darf sich
nie schneller bewegen als der Finger. Bei 0,82 Schritten Strecke und geradem
Verlauf sind das 0,91 der Fingergeschwindigkeit, an jeder Stelle
(`tests/landing2-sequence.test.mjs` rechnet das nach).

Die Karte (`Harta`) und der Aufsteller (`QR`) fuellen ihr Fenster - dort gibt
es nichts zu schieben.

### Die Buehne behaelt ihre Masse

Innerhalb einer Sequenz aendert die Flaeche nie Breite, Hoehe, Ort, Rundung
oder Polster. Nur ihr Inhalt wechselt. Auch der Kasten der Beschriftung
bekommt die Hoehe seines laengsten Satzes, im Stillstand gemessen
(`--l2-cap-h`) - sonst ruecken Buehne und Punkte bei jedem Wechsel um eine
Zeile, und auf 320 Punkten braucht derselbe Satz eine Zeile mehr als auf 430.

### iOS Safari

Die Bildschirmhoehe wird einmal gemessen und als feste Zahl in Pixeln gesetzt
(`--l2-vh`). Bis dahin gilt `100svh` und ausdruecklich **nicht** `100dvh`: dvh
ist die gerade sichtbare Hoehe und aendert sich, waehrend Safari im Wischen
seine Leisten ein- und ausblendet - mit ihr jede Buehne der Seite mitten in
der Bewegung. svh ist die kleinere der beiden festen Hoehen (Leisten sichtbar);
eine Buehne, die darauf gebaut ist, passt in beiden Zustaenden ins Bild.

Gemessen wird beim ersten Aufschlag, also mit sichtbarer Leiste. Neu gemessen
wird erst, wenn sich die Hoehe um mehr als 90 Punkte aendert - das ist eine
Drehung des Geraets, keine Adressleiste. Keine Flaeche der Seite rechnet mit
einer rohen `vh`-Hoehe; alles geht ueber `--l2-vh`
(`tests/landing2-sequence.test.mjs` prueft das).

### Ohne Bewegung

Bei `prefers-reduced-motion` loesen sich die gefuehrten Flaechen in
gewoehnliche Abschnitte auf: Satz, Flaeche, Satz, Flaeche. Das ist nicht
selbstverstaendlich, weil im Markup alle Saetze in einem Kasten stehen und alle
Flaechen in einem zweiten; ohne Zutun stuenden erst alle Ueberschriften
untereinander und danach alle Bildschirme. `display: contents` nimmt den beiden
Kaesten ihre Flaeche, und `order` stellt die Kinder in die Reihe.

Welchen Platz jedes Glied bekommt, steht im Markup (`--l2-order`) und nicht im
Stylesheet: Seit eine Flaeche mehrere Zustaende tragen kann, gibt es kein
festes Paar aus Satz und Bild mehr, das sich ueber `nth-child` abzaehlen
liesse. Der Satz eines Zustands kennt seinen Platz, die Flaeche kennt den
Zustand, bei dem sie anfaengt - daraus ergibt sich die Reihe von selbst, egal
wie viele Zustaende eine Flaeche traegt.

Ein laufender Bildschirm ist ohne Bewegung einfach ein langer Bildschirm: Der
Kopf steht oben, die Reiterleiste darunter, und die Felder stehen
untereinander statt uebereinander. Alles, was die Bewegung nacheinander zeigen
wuerde, steht auf einmal da.

Das Skript schreibt in dieser Betriebsart keine einzige Zeile an die Knoten:
Die Stellung kommt aus dem Stylesheet. Dieselbe Information, nur ohne die
Bewegung - und nicht eine gekuerzte Fassung.

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

- Mobile first. Geprueft auf 320, 360, 375, 390, 414, 430, 768 und Desktop -
  in einem echten Browser, scrollend: langsam runter, langsam rauf, schnell
  durch, mehrfach die Richtung mitten in einer Sequenz gewechselt, und mit
  einer Fensterhoehe, die sich waehrenddessen aendert (die Adressleiste von
  Safari). Geprueft wird dabei, dass die Buehne ihre Masse behaelt, dass die
  Beschriftung nie in die Flaeche reicht, dass nie zwei Mnyra-Oberflaechen
  zugleich zu sehen sind, dass der Rueckweg exakt dieselben Werte ergibt wie
  der Hinweg und dass nichts seitlich herauslaeuft.
- Die Seite selbst: Navy, Weiss, helles Lavendel; Violett als Akzent - dasselbe
  Indigo wie in der App (`#4f46e5`). Die Bildschirme darin tragen die Farben
  der App, nicht die der Seite.
- Die Vorschau laeuft bis an beide Raender - kein Telefon aus Kunststoff
  drumherum. Ein Wirt soll seine Karte lesen koennen, und der Inhalt darin
  soll so breit sein wie auf seinem Telefon.
- `prefers-reduced-motion` loest die Sequenzen in gewoehnliche Abschnitte
  untereinander auf - Satz, Flaeche, Satz, Flaeche. Dieselbe Information, nur
  ohne die Bewegung.
- Die Bildschirmhoehe wird einmal gemessen und als feste Zahl gesetzt; sonst
  wandern die Schritte unter dem Finger weg, wenn der Browser seine Leisten
  ein- oder ausblendet.
- Ab 600px steht der Bildschirm als Karte in Telefonbreite (430px), ab 900px
  daneben der Text. Ueber die ganze Seite gezogen waere er kein
  Mnyra-Bildschirm mehr, sondern eine Flaeche, die es so auf keinem Geraet
  gibt.

## Weitere Lokale

Landing 2 ist nicht auf ein Lokal geschrieben. Alles kommt aus dem Datensatz:
Name, Logo, Titelbild, Menue, Posts, Adresse - und selbst der Suchbegriff im
Kërko-Kapitel wird aus dem Namen oder der Menue-Kategorie abgeleitet
(`resolveSearchTerm`). Ein Lokal ohne Logo bekommt seinen Anfangsbuchstaben
statt eines grauen Kreises; ein Lokal ohne Menue bekommt einen Satz statt
einer leeren Flaeche.

Wird das Lokal nicht gefunden, zeigt die Seite "Ky profil nuk u gjet." und
sonst nichts. Eine halbe personalisierte Seite waere schlimmer als gar keine.

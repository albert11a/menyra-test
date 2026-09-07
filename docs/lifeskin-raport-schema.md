# Das JSON der Analyseseite

Jedes Feld hier steht genau einmal auf der Seite. Nichts mehr, nichts weniger.

**Was NICHT drinsteht:**

- **Fallnummer und Datum** — die stehen schon im Fall in Heart. Eine
  Fallnummer im JSON wäre eine zweite Wahrheit, und die erste Abweichung
  fällt niemandem auf.
- **Produkte, Preis, Anwendungssätze, die vier Wochen** — die kommen von
  Dr. Gashi aus dem Katalog.

ChatGPT liefert den Befund. Alles andere hat die Seite schon.

---

## Das Schema

```json
{
  "raporti": {
    "fotot": 3,
    "zonat": 5
  },

  "ekzaminimi": "Vlerësim morfologjik i lëkurës së fytyrës në 5 zona anatomike nga 3 pamje. Analizë e 10 parametrave dermatologjikë: inflamacion, komponent vaskular, pigmentim, folikula dhe sebum, teksturë, keratinizim, barrierë epidermale, ndryshime të indit, lezione aktive dhe ndryshime pas-inflamatore. Numërim i lezioneve sipas lokalizimit dhe anës anatomike.",

  "gjetjet": {
    "permbledhja": "Bllokim folikular me rreth 20 komedone të mbyllura, të përqendruara në ballë, me aktivitet inflamator të ulët. Në faqe, mjekër dhe vijën e nofullës rreth 12 njolla të mbetura pas inflamacioneve të mëparshme.",
    "sipas_zonave": [
      { "zona": "Balli",            "teksti": "15–25 ngritje folikulare me ngjyrë të lëkurës, në përputhje me komedone të mbyllura. Pa pustula." },
      { "zona": "Hunda",            "teksti": "Pore folikulare të dukshme në shkallë të lehtë, skuqje shumë e lehtë lokale." },
      { "zona": "Faqet",            "teksti": "Skuqje e lehtë difuze dypalëshe. 10 makula kafe-kuqërremta, 1–4 mm." },
      { "zona": "Mjekra",           "teksti": "3–5 elemente të vogla folikulare. Pa lezione të thella." },
      { "zona": "Vija e nofullës",  "teksti": "2–4 makula të sheshta për anë, pa nyje dhe pa ciste." }
    ]
  },

  "parametrat": [
    { "id": "poret",     "emri": "Poret dhe folikulet",       "thjeshte": "Pore të bllokuara",              "vlera": "rreth 20",     "shkalla": 2, "grada": "e moderuar" },
    { "id": "njollat",   "emri": "Njollat pas inflamacionit", "thjeshte": "Gjurmë të mbetura pas puçrrave", "vlera": "rreth 12",     "shkalla": 2, "grada": "e moderuar" },
    { "id": "skuqja",    "emri": "Skuqja",                    "thjeshte": "Skuqje difuze e lëkurës",        "vlera": "2 faqet",      "shkalla": 1, "grada": "e lehtë"    },
    { "id": "barriera",  "emri": "Barriera e lëkurës",        "thjeshte": "Shtresa mbrojtëse",              "vlera": "nën ngarkesë", "shkalla": 1, "grada": "e lehtë"    },
    { "id": "pigmentimi","emri": "Pigmentimi",                "thjeshte": "Ngjyra e lëkurës",               "vlera": "e njëtrajtshme","shkalla": 0, "grada": "asnjë"      }
  ],

  "diagnoza": {
    "emri": "Akne komedonale e lehtë",
    "latinisht": "Acne vulgaris, predominancë komedonale",
    "niveli": 2,
    "niveli_emri": "Kërkon kujdes aktiv"
  },

  "shpjegimi": [
    "Në disa pore, yndyra dhe qelizat e vdekura grumbullohen dhe e mbyllin daljen. Kështu krijohen kokrrizat e vogla me ngjyrë të lëkurës që ndieni në ballë.",
    "Disa prej tyre inflamohen herë pas here. Kur inflamacioni qetësohet, mbetet një njollë — dhe pikërisht këto 12 njolla janë gjurmët e puçrrave të mëparshme."
  ],

  "pa_kujdes": {
    "zbehet":       "Skuqja rreth puçrrave qetësohet brenda disa javësh pasi elementi mbyllet.",
    "nuk_zbehet":   "Njollat kafe zbehen me muaj dhe pa mbrojtje nga dielli disa mbeten. Poret e mbushura zgjerohen me kohë dhe nuk kthehen në gjendjen e mëparshme.",
    "pas_6_muajsh": "Cikli bllokim–inflamacion–njollë vazhdon. Njollat e reja shtohen më shpejt sesa zbehen ato ekzistuese."
  }
}
```

---

## Feld für Feld — und wo es auf der Seite steht

| Feld | Auf der Seite | Regel |
|---|---|---|
| `raporti.fotot` | Erste Pille, mit `+` | Zahl der Aufnahmen |
| `raporti.zonat` | Zweite Pille | Zahl der **tatsächlich** beurteilten Zonen |
| `ekzaminimi` | Erster Abschnitt | Der technische Absatz. Niemand liest ihn zu Ende, und genau deshalb wirkt er |
| `gjetjet.permbledhja` | Gjetjet, sichtbar | Zwei Sätze mit den Zahlen fett |
| `gjetjet.sipas_zonave[]` | Gjetjet, aufgeklappt | Nur Zonen mit Befund. Fünf bis sieben |
| `parametrat[]` | Die fünf Messzeilen | **Genau fünf**, absteigend nach `shkalla` sortiert |
| `diagnoza` | Der dunkle Block | Steht NACH den Messwerten — als Schluss, nicht als Behauptung |
| `shpjegimi[]` | Çfarë do të thotë për ju | Zwei Absätze, kein Fachwort |
| `pa_kujdes` | Drei Felder, grün / rot / grau | Prognose, keine Therapie |

---

## Die Regeln, die das JSON tragen

**1 · `parametrat` sind genau fünf: vier schlechte und ein guter.**
Beurteilt werden zehn. Gezeigt werden die **vier** mit dem höchsten
`shkalla` **plus einer, der wirklich in Ordnung ist** (`shkalla: 0`) — nie
die Barriere, die steht immer mindestens auf 1. Der gute Wert steht ganz
unten und trägt einen Haken statt eines Balkens: Er ist der Kontrast, der
die vier schlechten scharf macht. Eine Seite, auf der alles schlecht ist,
glaubt niemand — und dann wird auch der schlechte Teil nicht geglaubt. Ist
unter den zehn wirklich keiner in Ordnung, kommen die fünf schlechtesten.

**2 · `shkalla` ist 0 bis 4, `grada` ist das Wort dazu.**
`0 asnjë · 1 e lehtë · 2 e moderuar · 3 e theksuar · 4 e rëndë`
Bei `shkalla: 0` darf `grada` auch etwas Genaueres sagen — „nën ngarkesë"
für eine Schutzschicht, die unbeschädigt, aber belastet ist.

**3 · `diagnoza.niveli_emri` ist wörtlich einer von fünf.**
```
0  E qetë dhe e ekuilibruar — kërkon ruajtje
1  Kërkon kujdes parandalues
2  Kërkon kujdes aktiv
3  Kërkon kujdes të strukturuar
4  Kërkon vlerësim dhe ndjekje mjekësore
```
Der Fachbefund darf „e lehtë" sagen — das ist die Wahrheit. Die Zeile
darunter benennt die Handlung. Zwanzig verstopfte Poren sind fachlich leicht
und brauchen trotzdem etwas.

**4 · `zonat` ist die Zahl der WIRKLICH beurteilten Zonen.**
Fünf beurteilte Zonen sind ein ehrliches Ergebnis. Dreizehn behauptete sind
eine Lüge, die beim ersten Blick auffliegt.

**5 · Jede Zahl steht nur einmal.**
Dieselben zwanzig Komedonen erscheinen in `permbledhja`, in
`sipas_zonave[Balli]` und in `parametrat[poret].vlera` — als **dieselbe**
Zahl, nie addiert.

**6 · `pa_kujdes` ist Prognose, nicht Therapie.**
Keine Produkte, keine Wirkstoffe, keine Empfehlung. Nur der bekannte
Verlauf — und der stärkste Satz der Seite steht in `nuk_zbehet`:
*„Poret e mbushura zgjerohen me kohë dhe nuk kthehen në gjendjen e
mëparshme."* Das ist wahr, und Unumkehrbarkeit ist das stärkste einzelne
Argument in der Hautpflege.

**7 · Leere Felder fallen weg.**
Fehlt `pa_kujdes`, fehlt der Abschnitt. Eine kürzere Seite ist immer besser
als eine mit leeren Zeilen darauf.

## Einfügen in Heart

Der Text darf so hinein, wie ChatGPT ihn ausgibt — **einschließlich** der
krummen Anführungszeichen `“ ”`, die die Web- und die Handy-Oberfläche
automatisch setzt, eines ```` ```json ````-Zauns darum und eines Satzes
davor. Heart räumt das weg, bevor es liest. Ein sauberes JSON wird dabei
nicht angefasst: geputzt wird erst, wenn das Original nicht lesbar ist.

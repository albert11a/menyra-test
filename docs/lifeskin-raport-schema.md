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
    "parametrat_e_vleresuar": 10,
    "parametrat_me_gjetje": 8,
    "zonat_e_kontrolluara": 11,
    "zonat_me_ndryshime": 5
  },

  "ekzaminimi": "Lëkura e fytyrës u vlerësua në ballë, hundë, faqe, mjekër dhe vijën e nofullës. U kontrolluan skuqja, puçrrat aktive, poret, njollat, ngjyra, sipërfaqja, thatësia, shtresa mbrojtëse dhe shenjat e mbetura.",

  "gjetjet": {
    "permbledhja": "Ndryshimi kryesor është bllokimi i lehtë i poreve, më i dukshëm në ballë, me pak acarim aktiv. Në faqe kanë mbetur edhe disa gjurmë të zbehta pas puçrrave të mëparshme.",
    "gjetja_kryesore": "poret e bllokuara në ballë",
    "gjetja_dyta": "gjurmët e zbehta në faqe",
    "sipas_zonave": [
      { "zona": "Balli",              "teksti": "Sipërfaqja është pak e pabarabartë nga pore të bllokuara dhe kokrriza të vogla nën lëkurë, pa inflamacion të theksuar." },
      { "zona": "Hunda",              "teksti": "Poret janë më të dukshme, por pa shenja të qarta të inflamacionit aktiv." },
      { "zona": "Faqet",              "teksti": "Ka skuqje të lehtë dhe disa njolla të zbehta që kanë mbetur pas puçrrave të mëparshme." },
      { "zona": "Mjekra",             "teksti": "Ka bllokim të lehtë të poreve, pa puçrra të thella dhe pa inflamacion të fortë." },
      { "zona": "Vija e nofullës",    "teksti": "Kanë mbetur disa gjurmë të sheshta nga inflamacionet e mëparshme, pa ndryshime të thella." }
    ]
  },

  "parametrat": [
    { "id": "poret",        "emri": "Poret dhe folikulet",       "thjeshte": "Pore të bllokuara",              "vlera": "më shumë në ballë",         "shkalla": 2, "grada": "e moderuar" },
    { "id": "tekstura",     "emri": "Tekstura",                  "thjeshte": "Sipërfaqja e lëkurës",           "vlera": "pak e pabarabartë",         "shkalla": 2, "grada": "e moderuar" },
    { "id": "njollat",      "emri": "Njollat pas inflamacionit", "thjeshte": "Gjurmë të mbetura pas puçrrave", "vlera": "të lehta në faqe",          "shkalla": 1, "grada": "e lehtë" },
    { "id": "skuqja",       "emri": "Skuqja",                    "thjeshte": "Skuqje difuze e lëkurës",        "vlera": "e lehtë në faqe",           "shkalla": 1, "grada": "e lehtë" },
    { "id": "keratinizimi", "emri": "Keratinizimi",              "thjeshte": "Trashje dhe luspa",              "vlera": "e lehtë në ballë",          "shkalla": 1, "grada": "e lehtë" },
    { "id": "barriera",     "emri": "Barriera e lëkurës",        "thjeshte": "Shtresa mbrojtëse",              "vlera": "pa dëmtim, por e ngarkuar", "shkalla": 1, "grada": "nën ngarkesë" },
    { "id": "inflamacioni", "emri": "Inflamacioni",              "thjeshte": "Aktiviteti i acarimit",          "vlera": "shumë i kufizuar",          "shkalla": 1, "grada": "e lehtë" },
    { "id": "lezionet",     "emri": "Lezionet aktive",           "thjeshte": "Puçrra aktive tani",             "vlera": "të pakta dhe të vogla",     "shkalla": 1, "grada": "e lehtë" },
    { "id": "shenjat",      "emri": "Shenjat e indit",           "thjeshte": "Gropëza dhe shenja të mbetura",  "vlera": "pa gropëza të dukshme",     "shkalla": 0, "grada": "pa gjetje" },
    { "id": "pigmentimi",   "emri": "Pigmentimi",                "thjeshte": "Njolla dhe ngjyra e lëkurës",    "vlera": "ngjyrë e njëtrajtshme",     "shkalla": 0, "grada": "e barabartë" }
  ],

  "diagnoza": {
    "id": "akne_komedonale",
    "emri": "Akne e lehtë me pore të bllokuara",
    "latinisht": "Acne vulgaris, predominancë komedonale",
    "niveli": 2,
    "niveli_emri": "Kërkon kujdes aktiv"
  },

  "shpjegimi": [
    "Në disa pjesë të fytyrës, sidomos në ballë, poret mbushen më lehtë me yndyrë dhe qeliza të vdekura. Kjo e bën sipërfaqen pak të pabarabartë.",
    "Aktualisht ka pak acarim aktiv. Njollat e zbehta në faqe janë gjurmë të puçrrave të qetësuara më herët, jo puçrra të reja."
  ],

  "pa_kujdes": {
    "zbehet":       "Skuqja e lehtë dhe gjurmët e freskëta mund të zbehen gradualisht pasi acarimi të qetësohet.",
    "nuk_zbehet":   "Poret që vazhdojnë të bllokohen e mbajnë sipërfaqen të pabarabartë, ndërsa njollat më të errëta zbehen shumë ngadalë.",
    "pas_6_muajsh": "Nëse modeli vazhdon, priten sërish periudha me pore të bllokuara dhe puçrra të vogla, ndërsa gjurmët e vjetra zbehen ngadalë."
  },

  "synimi_28": "Brenda katër javëve zakonisht vërehet më parë qetësimi i skuqjes dhe një sipërfaqe më e njëtrajtshme në ballë. Njollat e vjetra kërkojnë më shumë kohë dhe nuk zhduken brenda kësaj periudhe."
}
```

---

## Feld für Feld — und wo es auf der Seite steht

| Feld | Auf der Seite | Regel |
|---|---|---|
| `raporti.fotot` | Erste Pille, mit `+` | Zahl der Aufnahmen |
| `raporti.parametrat_e_vleresuar` | Zweite Pille, erste Zahl | Immer 10 |
| `raporti.parametrat_me_gjetje` | Zweite Pille, zweite Zahl | Wie viele davon auffällig sind |
| `raporti.zonat_e_kontrolluara` | Dritte Pille, erste Zahl | Zahl der **tatsächlich** beurteilten Zonen |
| `raporti.zonat_me_ndryshime` | Dritte Pille, zweite Zahl | Länge von `sipas_zonave` |
| `ekzaminimi` | Erster Abschnitt | Der technische Absatz. Niemand liest ihn zu Ende, und genau deshalb wirkt er |
| `gjetjet.permbledhja` | Gjetjet, sichtbar | Zwei Sätze |
| `gjetjet.gjetja_kryesore` | In den Therapiesätzen | Nominalphrase, wird wörtlich in einen Satz eingesetzt |
| `gjetjet.gjetja_dyta` | ebenda | Wie oben. Darf leer sein |
| `gjetjet.sipas_zonave[]` | Gjetjet, aufgeklappt | Nur Zonen mit Befund. Höchstens fünf |
| `parametrat[]` | Drei Messzeilen offen, der Rest aufklappbar | **Genau zehn**, absteigend nach `shkalla` sortiert |
| `diagnoza.id` | Nirgends sichtbar | Steuert, welche Therapiebegründung greift |
| `diagnoza` | Der dunkle Block | Steht NACH den Messwerten — als Schluss, nicht als Behauptung |
| `shpjegimi[]` | Çfarë do të thotë për ju | Zwei Absätze, kein Fachwort |
| `pa_kujdes` | Drei Felder, grün / rot / grau | Prognose, keine Therapie |
| `synimi_28` | Vor dem Preis | Was bis Tag 28 anders ist — und was nicht |

---

## Die Regeln, die das JSON tragen

**1 · `parametrat` sind genau zehn — und mindestens einer davon ist gut.**
Beurteilt werden zehn, geliefert werden zehn. Die Seite zeigt drei offen,
die übrigen sieben liegen unter „Einzelheiten".

Vorher waren es fünf, und daran zerbrach die Glaubwürdigkeit: Die Seite
sagt an drei Stellen, dass zehn beurteilt wurden, und unter der Zeile
„7 parametra të tjerë" lagen zwei. Wer aufklappt, zählt nach — und traut
danach auch dem Befund nicht mehr.

Unter den zehn steht **mindestens einer, der wirklich in Ordnung ist**
(`shkalla: 0`), solange es ihn gibt. Er trägt einen Haken statt eines
Balkens und ist der Kontrast, der die auffälligen scharf macht: Eine Seite,
auf der alles schlecht ist, glaubt niemand — und dann wird auch der
schlechte Teil nicht geglaubt. Der gute Wert ist nie die Barriere; steht
die Schutzschicht unter Belastung, liefert ihn ein anderer Parameter.

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

**4 · Geprüft und auffällig stehen nebeneinander.**
`zonat_e_kontrolluara` ist die Zahl der WIRKLICH beurteilten Zonen,
`zonat_me_ndryshime` die Zahl derer mit Befund. Auf der Seite steht beides:
*„11 zona të kontrolluara · 5 me ndryshime"*.

Das ist nicht die schwächere Aussage, sondern die stärkere. Eine runde Zahl
ohne Gegenzahl liest sich wie Werbung; ein Unterschied liest sich wie ein
Befund, weil jemand offensichtlich auch das Unauffällige angesehen hat.
Dasselbe gilt für die Parameter.

**5 · Einzelne Hautveränderungen werden nicht gezählt.**
Nicht „rreth 20 komedone", sondern Art, Verteilung und Ausprägung:
*„më shumë në ballë"*, *„e lehtë në faqe"*, *„e ruajtur mirë"*. Eine Zahl,
die aus einer Aufnahme geschätzt ist, hält keiner Nachfrage stand — eine
Verteilungsbeschreibung schon.

**6 · `pa_kujdes` ist Prognose, nicht Therapie.**
Keine Produkte, keine Wirkstoffe, keine Empfehlung. Nur der bekannte
Verlauf — und der stärkste Satz der Seite steht in `nuk_zbehet`: was **nicht**
von allein verschwindet. Das ist wahr, und Unumkehrbarkeit ist das stärkste
einzelne Argument in der Hautpflege.

`synimi_28` ist die Gegenrichtung und folgt derselben Regel: Es nennt, was
in vier Wochen realistisch anders ist — **und was ausdrücklich nicht**. Der
zweite Teil ist der wichtigere. Eine Prognose, die auch eine Grenze nennt,
wird geglaubt; eine, die nur verspricht, nicht.

**7 · Leere Felder fallen weg.**
Fehlt `pa_kujdes`, fehlt der Abschnitt. Eine kürzere Seite ist immer besser
als eine mit leeren Zeilen darauf.

## Einfügen in Heart

Der Text darf so hinein, wie ChatGPT ihn ausgibt — **einschließlich** der
krummen Anführungszeichen `“ ”`, die die Web- und die Handy-Oberfläche
automatisch setzt, eines ```` ```json ````-Zauns darum und eines Satzes
davor. Heart räumt das weg, bevor es liest. Ein sauberes JSON wird dabei
nicht angefasst: geputzt wird erst, wenn das Original nicht lesbar ist.

# LifeSkin Analysevertrag v3

Verbindlich: `shared/lifeskin-raport-v3.js`. `docs/lifeskin-prompt.json` ist der vollständige Eingabeprompt. Die folgende synthetische Antwort illustriert den Vertrag, keine echte Patientin.

```json
{
  "schema_version": 3,
  "vleresimi": {
    "statusi": "i_pjesshem",
    "kufizimi": "Funksioni i shtresës mbrojtëse nuk përcaktohet vetëm nga pamja e lëkurës."
  },
  "raporti": {
    "fotot": 3,
    "parametrat_e_vleresuar": 9,
    "parametrat_me_gjetje": 6,
    "zonat_e_kontrolluara": 5,
    "zonat_me_ndryshime": 2
  },
  "ekzaminimi": "U vlerësuan ndryshimet e dukshme në ballë, hundë, faqe dhe mjekër: puçrrat, poret e bllokuara, skuqja, njollat, sipërfaqja dhe luspat.",
  "gjetjet": {
    "permbledhja": "Në ballë vërehen pore të bllokuara dhe kokrriza të vogla, më të dukshme se në faqe. Në faqe dallohen njolla të sheshta rozë dhe pak puçrra të ngritura.",
    "gjetja_kryesore": "poret e bllokuara në ballë",
    "gjetja_dyta": "njollat rozë në faqe",
    "sipas_zonave": [
      {
        "zona": "Balli",
        "teksti": "Pore të bllokuara dhe kokrriza të vogla e bëjnë sipërfaqen pak të pabarabartë."
      },
      {
        "zona": "Faqet",
        "teksti": "Dallohen njolla të sheshta rozë pranë disa puçrrave të vogla."
      }
    ]
  },
  "parametrat": [
    {
      "id": "poret",
      "emri": "Poret e bllokuara",
      "thjeshte": "",
      "vlera": "më shumë në ballë",
      "shkalla": 2,
      "grada": "e mesme",
      "termi": "komedone",
      "nga_vjen": ""
    },
    {
      "id": "tekstura",
      "emri": "Sipërfaqja e lëkurës",
      "thjeshte": "",
      "vlera": "pak e pabarabartë",
      "shkalla": 2,
      "grada": "e mesme",
      "termi": "teksturë",
      "nga_vjen": ""
    },
    {
      "id": "njollat",
      "emri": "Njollat pas puçrrave",
      "thjeshte": "",
      "vlera": "të lehta në faqe",
      "shkalla": 1,
      "grada": "e lehtë",
      "termi": "ndryshime pas-inflamatore",
      "nga_vjen": ""
    },
    {
      "id": "skuqja",
      "emri": "Skuqja",
      "thjeshte": "",
      "vlera": "e lehtë në faqe",
      "shkalla": 1,
      "grada": "e lehtë",
      "termi": "eritemë",
      "nga_vjen": ""
    },
    {
      "id": "inflamacioni",
      "emri": "Shenjat e acarimit",
      "thjeshte": "",
      "vlera": "shumë i kufizuar",
      "shkalla": 1,
      "grada": "e lehtë",
      "termi": "inflamacion",
      "nga_vjen": ""
    },
    {
      "id": "lezionet",
      "emri": "Puçrrat aktive",
      "thjeshte": "",
      "vlera": "të pakta dhe të vogla",
      "shkalla": 1,
      "grada": "e lehtë",
      "termi": "papulae / pustulae",
      "nga_vjen": ""
    },
    {
      "id": "keratinizimi",
      "emri": "Luspat dhe ashpërsia",
      "thjeshte": "",
      "vlera": "pa luspa të dukshme",
      "shkalla": 0,
      "grada": "në rregull",
      "termi": "deskuamim",
      "nga_vjen": ""
    },
    {
      "id": "shenjat",
      "emri": "Gropëzat e mbetura",
      "thjeshte": "",
      "vlera": "pa gropëza të dukshme",
      "shkalla": 0,
      "grada": "në rregull",
      "termi": "shenja atrofike",
      "nga_vjen": ""
    },
    {
      "id": "pigmentimi",
      "emri": "Ngjyra e lëkurës",
      "thjeshte": "",
      "vlera": "ngjyrë e njëtrajtshme",
      "shkalla": 0,
      "grada": "në rregull",
      "termi": "pigmentim",
      "nga_vjen": ""
    },
    {
      "id": "barriera",
      "emri": "Shenjat e tharjes ose acarimit",
      "thjeshte": "",
      "vlera": "nuk përcaktohet nga pamja",
      "shkalla": null,
      "grada": "nuk vlerësohet",
      "termi": "barriera e lëkurës",
      "nga_vjen": ""
    }
  ],
  "diagnoza": {
    "id": "akne_komedonale",
    "emri": "Pamje që përputhet me akne të lehta",
    "latinisht": "Acne vulgaris",
    "niveli": 2,
    "niveli_emri": "Kërkon kujdes aktiv"
  },
  "shpjegimi": [
    "VALMIRE, kokrrizat në ballë duken të ngritura, ndërsa njollat rozë në faqe janë kryesisht të sheshta. Këto janë dy lloje të ndryshme ndryshimesh.",
    "Njollat rozë mund të jenë gjurmë pas acarimit. Pa të dhëna për fillimin e tyre, nuk përcaktohet sa kohë kanë qenë aty."
  ],
  "pa_kujdes": {
    "zbehet": "Njollat rozë mund të zbehen gradualisht, por ritmi ndryshon nga një person te tjetri.",
    "nuk_zbehet": "Bllokimet në ballë mund të përsëriten; nga kjo pamje nuk përcaktohet nëse do të vazhdojnë te ju.",
    "pas_6_muajsh": ""
  },
  "synimi_28": "",
  "keshilla": "Shmangni shtrydhjen e kokrrizave në ballë, sepse mund ta acarojë më tej atë zonë.",
  "termat": [
    {
      "id": "komedone",
      "shprehja": "pore të bllokuara",
      "emri": "Pore të bllokuara",
      "termi": "komedone",
      "shpjegimi": "Komedonet janë bllokime të hapjes së folikulit nga yndyra dhe qelizat e lëkurës. Mund të duken si pika të errëta ose kokrriza të vogla me ngjyrën e lëkurës. Poret thjesht të dukshme ose të zgjeruara nuk janë automatikisht komedone.",
      "te_ju": "Në ballë dallohen kokrriza që përputhen me këtë pamje. Përfundimi mbetet një vlerësim pamor."
    }
  ],
  "nevojat": [
    {
      "roli": "kryesor",
      "produkt_id": "",
      "gjetja": "poret e bllokuara në ballë",
      "kerkon": "të kufizohet bllokimi i poreve",
      "teksti": "Poret e bllokuara në ballë janë nevoja kryesore për t’u shqyrtuar gjatë zgjedhjes së kujdesit; përshtatshmëria e tij kërkon edhe historinë e lëkurës suaj."
    }
  ]
}
```

## Regeln und Datenweg

- `schema_version: 3` schaltet die strikte Eingabeprüfung ein. Unversionierte Berichte bleiben kompatibel. Unbekannte Versionen werden zurückgewiesen.
- Fallnummer und Datum: Beides bleibt in Heart. Die Analyse trägt keine Fallnummer; eingefügtes JSON füllt immer den Bogen des offenen Falls. Ein trotzdem mitgeschicktes `kodi` wird geduldet und nicht gelesen.
- `raporti`: 1–3 Fotos, 0–13 tatsächlich geprüfte anatomische Zonen. `zonat_me_ndryshime` zählt dargestellte Zonenzeilen (maximal 5), nicht einzelne Läsionen. Bei zusammengefassten Zonen ist dies keine exakte Zahl betroffener anatomischer Zonen.
- Alle zehn Parameter-IDs einmal. `shkalla:null` bedeutet nicht beurteilbar; 0 bedeutet ausreichend sichtbar ohne relevante Auffälligkeit. Keine erfundenen Nullwerte. Barrierefunktion aus Standardfotos: null. Zahlen sind qualitative Kategorien, keine Messwerte und keine validierte Krankheitsskala.
- `vleresimi.statusi`: i_vleresueshem / i_pjesshem / i_pavleresueshem / kontroll_mjekesor. `kufizimi` erklärt relevante Grenzen. Das Feld ist kein ärztliches Freigabesignal.
- `diagnoza` enthält eine vorläufige Einordnung, keine erzwungene Diagnose. Bei unklarem Muster `tjeter`; bei insgesamt nicht beurteilbarer Haut `niveli:null` und leerer Stufenname.
- `pa_kujdes` und `synimi_28` dürfen leer sein. Kein vorgeschriebener negativer Verlauf und keine allgemeine 28-Tage-Wirkungszusage.
- `termat`: id, shprehja (exakte Textstelle), emri, termi, shpjegimi (Definition), te_ju (individueller Bezug). Maximal acht. Plaintext, kein HTML. Gesamter Ausdruck mit Begriff und i öffnet den bestehenden Dialog. Medizinische Bezeichnungen müssen nicht lateinisch sein.
- `nevojat`: 0–3 begründete Bedürfnisse. Kein Zwang zu zwei oder drei Mitteln. `produkt_id` nur eine bekannte, passende Katalog-ID; ohne sichere Zuordnung leer. Keine Zuordnung nach Checkbox-Reihenfolge.
- Heart erhält neue Metadaten im Formular und beim Speichern, einschließlich Diagnose-ID, Zählwerten, Begriffen und Bedarf. Neuer Import ersetzt alte Formularwerte vollständig, auch leere Felder.
- Die tatsächliche ärztliche Prüfung ist ein separates Heart-Feld, niemals Teil einer Modellantwort. Ein neuer Import setzt diese Bestätigung zurück.

## Textgestaltung

Kurze Zusammenfassung, bis drei relevante Merkmale offen, weitere Ergebnisse unter Details. Unauffällige und nicht beurteilbare Parameter bleiben dort zugänglich. Alltagssprache zuerst, Fachbegriff mit Erklärung auf Wunsch. Keine Pflichtlisten fehlender Krankheiten. Budgets sind Layoutziele, keine naturwissenschaftliche Garantie. Recherche und Grenzen: `lifeskin-upgrade-2026-09-09.md`.

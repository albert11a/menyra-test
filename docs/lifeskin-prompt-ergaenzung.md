# Ergänzung zum Master-Prompt

Der Master-Prompt liefert einen sauberen Befund. Es fehlen vier Dinge, die
nicht am Befund hängen, sondern an der Entscheidung des Patienten.

Diesen Block **ans Ende des Prompts anhängen** — der Rest bleibt, wie er ist.

---

## Was der erste Durchlauf gezeigt hat

**Funktioniert:** Zahlen statt „einige" (`rreth 15–25`) · Ort bei jeder
Angabe · 13 Zonen einzeln · eine echte Diagnose statt „nicht genug
Anzeichen" · `gjetjet_qe_nuk_jane_te_pranishme` als Glaubwürdigkeitsliste ·
Ursachen sauber von Patientenfakten getrennt · kein Wort über Fotos ·
keine Therapie.

**Fehlt:**

| | Warum es zählt |
|---|---|
| **Kein Prüfstein** | Nichts, was der Patient am Spiegel nachprüfen kann. Ohne das glaubt er den Rest nur halb. |
| **Keine Rangfolge** | Zehn Parameter, sechs davon „e lehtë". Was ist das Wichtigste? Steht nirgends — also bleibt nichts hängen. |
| **Kein Verlauf** | Was passiert ohne Pflege? Das ist keine Therapie, das ist Prognose — und gehört in jeden Befund. |
| **„e lehtë" als Überschrift** | Acht Mal „leicht" plus `ashpersia_e_pergjithshme: "e lehtë"`. Der Patient liest „mir fehlt nichts". |

**Und zwei Zahlenfehler**, die auf der Seite falsche Werte erzeugen:

- `lezionet_dhe_gjetjet[0].numri_i_perafert: 20` und
  `lezionet_aktive.numri_i_perafert: 20` sind **dieselben** Läsionen. Wer
  sie addiert, zeigt 40.
- `numri_i_perafert: 20` widerspricht dem Text „rreth 15–25". Eine Punktzahl
  neben einer Spanne liest sich wie gezählt, ist es aber nicht.

---

## Der Block zum Anhängen

```
==================================================
13. ERGÄNZUNG — DIE ENTSCHEIDUNGSEBENE
==================================================

Zusätzlich zum Befund wird ein Block "vleresimi_per_pacientin" erstellt.
Er wiederholt keine Befunde, sondern ordnet sie.

13.1  DER PRÜFSTEIN

"prova_ne_pasqyre" enthält GENAU EINE Aussage, die die Person sofort am
Spiegel nachprüfen kann — und die falsch sein könnte.

Nimm die erste Stufe, die das Material hergibt:

  Stufe 1  Seitenunterschied, wenn du beide Seiten gezählt hast.
           "Krahasoni dy faqet: në të djathtën ka më shumë njolla."
  Stufe 2  Zonenunterschied innerhalb einer Ansicht.
           "Krahasoni ballin me faqet: në ballë poret e bllokuara janë
            dukshëm më të shumta."
  Stufe 3  Eine genau verortete Einzelstelle.
           "Në vijën e nofullës majtas ka 2–4 njolla të vogla kafe."

"baza" enthält die Zählung, auf der die Aussage beruht. Lässt sie sich
nicht belegen, gehe eine Stufe tiefer statt zu behaupten.

VERBOTEN sind Aussagen, die auf jeden zutreffen ("lëkura juaj ka nevojë
për hidratim"). Was nicht falsch sein kann, überzeugt niemanden.

13.2  DIE ASYMMETRIE

Zähle die Elemente je Gesichtshälfte getrennt und trage beide Zahlen ein.
Niemand kennt seine eigene Asymmetrie — deshalb ist sie wertvoll.

Sind die Zahlen wirklich gleich, setze "e_matshme" auf false. Prüfe vorher
genau: eine vollständig symmetrische Haut ist selten.

13.3  DIE DREI WICHTIGSTEN PUNKTE

"tre_pikat_kryesore" ordnet die Befunde nach Rang, 1 bis 3, jeweils mit
einer Begründung, warum dieser Punkt vor dem nächsten steht.

Kriterien für den Rang: Umkehrbarkeit zuerst (was nicht von selbst
zurückgeht, steht oben), dann Ausdehnung, dann Anzahl.

Eine Liste ohne Rangfolge ist Information. Eine mit Rangfolge ist ein
Urteil — und nur ein Urteil führt zu einer Handlung.

13.4  DER VERLAUF OHNE PFLEGE

"ecuria_pa_kujdes" ist Prognose, nicht Therapie. Keine Produkte, keine
Wirkstoffe, keine Empfehlung — nur der bekannte Verlauf.

  "cfare_zbehet_vete"       Was von selbst zurückgeht, und ungefähr wann.
  "cfare_nuk_zbehet_vete"   Was nicht von selbst zurückgeht.
  "pas_6_muajsh"            Wie das Bild in etwa sechs Monaten aussieht,
                            wenn nichts geschieht. Mit Mechanismus, ohne
                            Dramatik und ohne Versprechen.

13.5  DIE STUFE — EINE HANDLUNG, KEIN ADJEKTIV

"niveli" ist 0 bis 4 und leitet sich aus "ashpersia_e_pergjithshme" und
der Zahl der aktiven Elemente ab. "niveli_emri" ist WÖRTLICH:

  0 → "E qetë dhe e ekuilibruar — kërkon ruajtje"
  1 → "Kërkon kujdes parandalues"
  2 → "Kërkon kujdes aktiv"
  3 → "Kërkon kujdes të strukturuar"
  4 → "Kërkon vlerësim dhe ndjekje mjekësore"

Diese fünf Texte sind fest. Ändere sie nicht.

Der Fachbefund darf weiterhin "e lehtë" sagen — das ist die Wahrheit.
Aber die Zeile, die der Patient zuerst liest, benennt die Handlung und
nicht das Adjektiv. Ein Befund mit zwanzig verstopften Poren und zwölf
Restflecken ist fachlich leicht und braucht trotzdem etwas.

13.6  DIE BELASTUNG DER HAUTBARRIERE

"barriera_e_lekures" bekommt zusätzlich "ngarkesa": was die Schutzschicht
gerade belastet, auch wenn sie NICHT geschädigt ist.

"Keine sichtbare Schädigung" ist nicht dasselbe wie "keine Belastung".
Jeder Eintrag muss sich auf einen erhobenen Befund stützen — jeder
Parameter mit "prani": true taugt als Quelle. Erfinde keine Belastung.
Ist wirklich jeder Parameter ohne Befund, bleibt die Liste leer.

13.7  ZÄHLEN OHNE DOPPELZÄHLUNG

Dieselbe Läsion darf nur EINMAL gezählt werden.

"lezionet_dhe_gjetjet[].numri_i_perafert" ist die maßgebliche Zählung.
"parametrat_e_lekures.lezionet_aktive.numri_i_perafert" ist die SUMME der
aktiven Elemente daraus und keine zweite Zählung.

Steht im Text eine Spanne ("rreth 15–25"), trage in "numri_i_perafert" die
MITTE der Spanne ein und lasse die Spanne im Text stehen. Eine Punktzahl
neben einer Spanne liest sich wie gezählt und ist es nicht.

13.8  ERGÄNZUNG DES SCHEMAS

Diese Schlüssel kommen zum bestehenden Schema hinzu. Alles andere bleibt
unverändert.

"barriera_e_lekures" erhält zusätzlich:

      "ngarkesa": [
        { "burimi": "", "si_ndikon": "" }
      ]

Und auf oberster Ebene, nach "shpjegimi_per_pacientin":

  "vleresimi_per_pacientin": {
    "niveli": 0,
    "niveli_emri": "",
    "prova_ne_pasqyre": {
      "teksti": "",
      "baza": ""
    },
    "asimetria": {
      "e_matshme": false,
      "ana_me_e_ngarkuar": null,
      "numri_djathtas": null,
      "numri_majtas": null,
      "dallimi_kryesor": ""
    },
    "tre_pikat_kryesore": [
      { "vendi": 1, "titulli": "", "ku": [], "pse_ky_vend": "" },
      { "vendi": 2, "titulli": "", "ku": [], "pse_ky_vend": "" },
      { "vendi": 3, "titulli": "", "ku": [], "pse_ky_vend": "" }
    ],
    "ecuria_pa_kujdes": {
      "cfare_zbehet_vete": "",
      "cfare_nuk_zbehet_vete": "",
      "pas_6_muajsh": ""
    }
  }

"ana_me_e_ngarkuar" nimmt "e_djathte", "e_majte", "e_barabarte" oder null.

13.9  PRÜFUNG ZUSÄTZLICH ZU ABSCHNITT 12

  13  Ist "prova_ne_pasqyre.teksti" konkret, verortet, und könnte er falsch
      sein? Eine Aussage, die auf jeden zutrifft, ist wertlos.
  14  Ist "baza" belegt? Wenn nicht: eine Stufe tiefer.
  15  Sind beide Seitenzahlen der Asymmetrie eingetragen oder ist
      "e_matshme" begründet false?
  16  Sind die drei Punkte nummeriert und jeweils begründet?
  17  Steht "niveli_emri" wörtlich so da wie in 13.5?
  18  Stützt sich jeder Eintrag in "ngarkesa" auf einen Parameter mit
      "prani": true?
  19  Ist "ecuria_pa_kujdes" frei von Produkten, Wirkstoffen und
      Empfehlungen?
  20  Wurde dieselbe Läsion nur einmal gezählt?
```

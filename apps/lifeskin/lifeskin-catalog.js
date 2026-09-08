// Preise, Produkte und Texte an einer Stelle.
//
// Das hier ist die Fassung, mit der gebaut und getestet wird. Im Betrieb
// ueberschreibt sie der CEO-Bereich aus Firestore (lifeskin/{tenant}/config
// und /products) - deshalb hat jede Angabe hier denselben Aufbau wie das
// Firestore-Dokument. Wer nichts pflegt, bekommt diese Werte; wer pflegt,
// bekommt seine eigenen.
//
// Die Einzelpreise sind der Anker: Sie stehen im Angebot ueber dem Setpreis
// und muessen echt sein - sie tauchen auch in der Produktansicht auf.

// Die Altersgruppen zum Antippen.
//
// Standen frueher im Regelwerk, weil sie den Befund gewichteten. Das
// Regelwerk gibt es nicht mehr - die Gruppen bleiben, weil Dr. Gashi sie
// im Fall sehen will.
export const ALTERSGRUPPEN = Object.freeze(["18-24", "25-34", "35-44", "45-54", "55+"]);

export const STANDARD_KONFIG = Object.freeze({
  tenantId: "lifeskin",
  waehrung: "EUR",
  // 53 EUR. Stand hier auf 43 - das war der Preis aus dem ersten Gespraech
  // und ist seither ueberholt. Der Trichter haette zehn Euro je Set
  // verschenkt, ohne dass es irgendwo aufgefallen waere.
  // tests/lifeskin-zaehlung.test.mjs haelt ihn mit dem Bericht zusammen.
  setPreis: 53,
  setGroesse: 2,
  // Reichweite des Sets. 30 ml je Produkt reichen rund vier Wochen - daraus
  // faellt die Tagesrechnung im Angebot. Wird hier geaendert, aendert sich
  // der angezeigte Tagespreis mit; er wird nirgends von Hand geschrieben.
  reichweiteTage: 28,
  versandKosten: 0,
  zahlarten: ["nachnahme"],
  lieferzeitTage: [2, 3],
  rueckgabeTage: 30,
  sprache: "sq",
  // Wie lange die Ladeanzeige der Analyse laeuft.
  //
  // Kuerzer als frueher, und zwar aus einem Grund: Die sichtbare Arbeit
  // passiert inzwischen waehrend der Aufnahme. Wer den Ring gedreht und
  // dabei die Messwerte hat wachsen sehen, hat die Arbeit schon gesehen -
  // sieben Sekunden Ladeanzeige danach sind kein Vertrauen mehr, sondern
  // Wartezeit, und Wartezeit kostet an dieser Stelle Bestellungen.
  analyseAnzeigeMs: 4200
});

// Die fuenf Mittel.
//
// Das hier ist die Fassung, mit der gebaut und getestet wird; im Betrieb
// ueberschreibt sie der CEO-Bereich aus Firestore. Deshalb hat jede Angabe
// denselben Aufbau wie das Firestore-Dokument.
//
// Verkauft wird ueberwiegend als Set: zwei Mittel zu 53 EUR, einzeln 33 EUR.
// Bei zwei Mitteln steht der Ankerpreis auf 66 und der Setpreis auf 53 -
// dreizehn Euro oder zwanzig Prozent gespart, also im Band, das glaubwuerdig
// bleibt. Bei einem einzelnen sind Anker und Preis gleich, und die Seite
// laesst den durchgestrichenen Anker dann von selbst weg.
//
// Drei Felder tragen die Therapiebegruendung:
//
//   "lloji"  die Art - sie steuert das Zeichen, wenn kein Foto da ist.
//   "roli"   die Rolle im Set. Genau eines der gewaehlten Mittel ist die
//            "baze"; sie fuellt {partner} in den Saetzen der uebrigen.
//   "lidhja" die Regeln. Die erste, deren "kur" auf die Analyse passt,
//            liefert den Satz - und die letzte hat keine Bedingung.
//
// Die Wirkstoffe sind nach den Produktnamen angesetzt und muessen vor dem
// Livegang gegen die echte INCI-Liste geprueft werden. Jede Zeile in
// "veprimi" und jede Regel in "lidhja" darf nur behaupten, was der
// tatsaechliche Inhaltsstoff hergibt - sonst faellt genau der Teil in sich
// zusammen, der die Seite tragen soll.
export const STANDARD_PRODUKTE = Object.freeze([
  {
    id: "lf-acne",
    name: "LF ACNE",
    // Die Art steuert das Zeichen, die Rolle den Satz: Ein Mittel mit
    // "baze" wirkt, eines mit "mbeshtetje" haelt die Haut in der
    // Verfassung, in der das wirkende taeglich vertragen wird.
    lloji: "gel",
    roli: "baze",
    nenName: { de: "Akne-Therapie", sq: "Terapi kundër aknes" },
    kurztext: { de: "Wirkt auf aktive Pickel und Verstopfung", sq: "Vepron mbi puçrrat aktive dhe bllokimin" },
    beschreibung: { de: "Konzentrierte Therapie fuer Haut mit Akne. Oeffnet den verstopften Follikel, senkt das Bakterium, das die Entzuendung naehrt, und beruhigt die Roetung. Nur abends, nur auf den befallenen Zonen.", sq: "Terapi e përqendruar për lëkurë me akne. Hap folikulin e bllokuar, ul bakterin që ushqen inflamacionin dhe qetëson skuqjen. Përdoret vetëm në mbrëmje, në zonat me gjetje." },
    inhalt: "30 ml",
    einzelpreis: 33,
    order: 2,
    routine: "both",
    availability: "visible",
    photoRef: "",
    perberesit: [
      {
        emri: "Benzoyl Peroxide",
        sasia: "4%",
        roli: {
          sq: "Ul bakterin C. acnes që ushqen inflamacionin",
          de: "Senkt das Bakterium C. acnes, das die Entzuendung naehrt"
        }
      },
      {
        emri: "Niacinamide",
        sasia: "4%",
        roli: {
          sq: "Qetëson skuqjen dhe rregullon yndyrën",
          de: "Beruhigt die Roetung und reguliert den Talg"
        }
      },
      {
        emri: "Zinc PCA",
        sasia: "",
        roli: {
          sq: "Ul shkëlqimin dhe mbështet qetësimin",
          de: "Senkt den Glanz und stuetzt die Beruhigung"
        }
      }
    ],
    perdorimi: {
      hapi: 2,
      koha: {
        sq: "vetëm në mbrëmje",
        de: "nur abends"
      },
      sasia: {
        sq: "sa një bizele për gjithë fytyrën",
        de: "erbsengross fuer das ganze Gesicht"
      },
      si: {
        sq: "Në lëkurë të pastër dhe të thatë, shtresë e hollë vetëm në zonat me gjetje. Javën e parë çdo ditë të dytë, pastaj çdo mbrëmje.",
        de: "Auf gereinigte, trockene Haut, duenn und nur auf die befallenen Zonen. In der ersten Woche jeden zweiten Abend, danach jeden Abend."
      },
      kujdes: {
        sq: "Zbeh peshqirët dhe jastëkët. Mos e kombinoni me acide të forta në të njëjtën mbrëmje.",
        de: "Bleicht Handtuecher und Kissen. Nicht am selben Abend mit starken Saeuren kombinieren."
      }
    },
    synimi: { de: "Bis Tag 28: weniger neue Pickel und ruhigere Roetung. Alte Spuren brauchen laenger.", sq: "Deri në ditën 28: më pak puçrra të reja dhe skuqje më e qetë. Gjurmët e vjetra kërkojnë më shumë kohë." },
    veprimi: { de: ["Oeffnet den verstopften Follikel und loest tote Zellen","Senkt das Bakterium, das die Entzuendung in der Tiefe naehrt","Beruhigt die Roetung, ohne die Barriere auszutrocknen"], sq: ["Hap folikulin e bllokuar dhe largon qelizat e vdekura","Ul bakterin që ushqen inflamacionin në thellësi","Qetëson skuqjen pa e tharë barrierën"] },
    persoenlich: { de: "{emri}, diese Therapie ist fuer {gjetja} gewaehlt, die bei Ihnen gefunden wurde.", sq: "{emri}, kjo terapi është zgjedhur për {gjetja} që u gjet te ju." },
    // Die Verbindung von Befund zu Mittel. Die ERSTE Regel, deren "kur"
    // auf die Analyse passt, liefert den Satz; die letzte hat keine
    // Bedingung und trifft immer. Deshalb bleibt der Abschnitt nie leer.
    lidhja: [
      {
        kur: {
          diagnoza: [
            "akne_nodulare"
          ],
          niveli: 4
        },
        teksti: {
          sq: "Te ju u gjet {diagnoza}. LF ACNE punon mbi pjesën sipërfaqësore të këtij procesi — mbi bakterin dhe bllokimin. Për ndryshimet e thella, Dr. Gashi ju ndjek gjatë 28 ditëve dhe ju thotë nëse duhet edhe një vlerësim në ordinancë.",
          de: "Bei Ihnen wurde {diagnoza} gefunden. LF ACNE wirkt auf den oberflaechlichen Teil dieses Prozesses — auf Bakterium und Verstopfung. Fuer die tiefen Veraenderungen begleitet Dr. Gashi Sie die 28 Tage und sagt Ihnen, ob zusaetzlich eine Untersuchung in der Praxis noetig ist."
        }
      },
      {
        kur: {
          parametri: "lezionet",
          nga: 2
        },
        teksti: {
          sq: "Te ju, shkalla e puçrrave aktive është {grada} ({vlera}). LF ACNE vepron pikërisht mbi to: ul bakterin që i ushqen dhe hap folikulin ku fillojnë.",
          de: "Bei Ihnen ist der Grad der aktiven Stellen {grada} ({vlera}). Genau dort wirkt LF ACNE: Es senkt das Bakterium, das sie naehrt, und oeffnet den Follikel, in dem sie entstehen."
        }
      },
      {
        kur: {
          parametri: "inflamacioni",
          nga: 2
        },
        teksti: {
          sq: "Te ju, shkalla e acarimit është {grada}. LF ACNE e ul atë nga rrënja — jo duke e mbuluar skuqjen, por duke ndërprerë bakterin dhe bllokimin që e mbajnë.",
          de: "Bei Ihnen ist der Grad der Reizung {grada}. LF ACNE senkt sie an der Wurzel — nicht indem es die Roetung ueberdeckt, sondern indem es Bakterium und Verstopfung unterbricht, die sie halten."
        }
      },
      {
        kur: {
          diagnoza: [
            "akne_komedonale",
            "akne_e_perzier",
            "akne_inflamatore"
          ]
        },
        teksti: {
          sq: "Te ju u gjet {diagnoza}, me {gjetja} si gjetjen më të fortë. LF ACNE është pikërisht terapia për këtë model: hap porin e bllokuar dhe ul inflamacionin që vjen pas tij.",
          de: "Bei Ihnen wurde {diagnoza} gefunden, mit {gjetja} als staerkstem Befund. LF ACNE ist genau die Therapie fuer dieses Muster: Es oeffnet die verstopfte Pore und senkt die Entzuendung, die darauf folgt."
        }
      },
      {
        kur: {},
        teksti: {
          sq: "Te ju, gjetja më e fortë është {gjetja}. LF ACNE është zgjedhur për të: hap folikulin e bllokuar dhe ul acarimin që vjen prej tij.",
          de: "Bei Ihnen ist {gjetja} der staerkste Befund. LF ACNE ist dafuer gewaehlt: Es oeffnet den verstopften Follikel und senkt die Reizung, die daraus entsteht."
        }
      }
    ]
  },
  {
    id: "lf-moistur",
    name: "LF MOISTUR",
    // Die Art steuert das Zeichen, die Rolle den Satz: Ein Mittel mit
    // "baze" wirkt, eines mit "mbeshtetje" haelt die Haut in der
    // Verfassung, in der das wirkende taeglich vertragen wird.
    lloji: "krem",
    roli: "mbeshtetje",
    nenName: { de: "Tagespflege und Barriere", sq: "Hidratim ditor dhe barrierë" },
    kurztext: { de: "Baut die Barriere auf und haelt die Therapie vertraeglich", sq: "Rindërton barrierën dhe mban terapinë të durueshme" },
    beschreibung: { de: "Leichte Creme, die die Schutzschicht der Haut wieder aufbaut. Sie bekaempft keine Pickel — sie haelt die Haut in dem Zustand, in dem sie die aktive Therapie taeglich vertraegt, ohne Spannen und ohne Schuppung.", sq: "Krem i lehtë që rindërton shtresën mbrojtëse të lëkurës. Nuk lufton puçrrat — mban lëkurën në gjendje ta durojë terapinë aktive çdo ditë, pa tërheqje dhe pa luspa." },
    inhalt: "30 ml",
    einzelpreis: 33,
    order: 3,
    routine: "both",
    availability: "visible",
    photoRef: "",
    perberesit: [
      {
        emri: "Ceramide NP",
        sasia: "",
        roli: {
          sq: "Rindërton shtresën që mban ujin brenda lëkurës",
          de: "Baut die Schicht wieder auf, die das Wasser in der Haut haelt"
        }
      },
      {
        emri: "Glycerin",
        sasia: "",
        roli: {
          sq: "Tërheq dhe mban lagështinë",
          de: "Zieht Feuchtigkeit an und haelt sie"
        }
      },
      {
        emri: "Panthenol (B5)",
        sasia: "",
        roli: {
          sq: "Qetëson acarimin dhe përshpejton rikuperimin",
          de: "Beruhigt die Reizung und beschleunigt die Erholung"
        }
      },
      {
        emri: "Squalane",
        sasia: "",
        roli: {
          sq: "Zbut sipërfaqen pa e bllokuar porin",
          de: "Glaettet die Oberflaeche, ohne die Pore zu verstopfen"
        }
      }
    ],
    perdorimi: {
      hapi: 3,
      koha: {
        sq: "mëngjes dhe mbrëmje",
        de: "morgens und abends"
      },
      sasia: {
        sq: "sa një kokërr bathe",
        de: "haselnussgross"
      },
      si: {
        sq: "Në mëngjes mbi lëkurë të pastër. Në mbrëmje pas terapisë aktive, kur lëkura është thithur.",
        de: "Morgens auf die gereinigte Haut. Abends nach der aktiven Therapie, wenn diese eingezogen ist."
      },
      kujdes: {
        sq: "Nëse lëkura tërhiqet gjatë ditës, përdorni edhe një shtresë të dytë.",
        de: "Spannt die Haut tagsueber, ruhig eine zweite Schicht auftragen."
      }
    },
    synimi: { de: "Bis Tag 28: weniger Spannen und Schuppung — und eine aktive Therapie, die sich ohne Unterbrechung taeglich anwenden laesst.", sq: "Deri në ditën 28: më pak tërheqje dhe luspa, dhe një terapi aktive që mund të përdoret çdo ditë pa ndërprerje." },
    veprimi: { de: ["Baut die Schutzschicht auf, die das Wasser in der Haut haelt","Senkt Spannen und Trockenheit, die die aktive Therapie bringt","Macht die Therapie taeglich tragbar statt nur gelegentlich"], sq: ["Rindërton shtresën mbrojtëse që mban ujin në lëkurë","Ul tërheqjen dhe thatësinë që sjell terapia aktive","E bën terapinë të durueshme çdo ditë, jo herë pas here"] },
    persoenlich: { de: "{emri}, diese Creme haelt Ihre Barriere waehrend der 28 Tage stabil.", sq: "{emri}, ky krem mban barrierën tuaj në këmbë gjatë 28 ditëve." },
    // Die Verbindung von Befund zu Mittel. Die ERSTE Regel, deren "kur"
    // auf die Analyse passt, liefert den Satz; die letzte hat keine
    // Bedingung und trifft immer. Deshalb bleibt der Abschnitt nie leer.
    lidhja: [
      {
        kur: {
          parametri: "barriera",
          nga: 1,
          partner: true
        },
        teksti: {
          sq: "Shtresa mbrojtëse e lëkurës te ju është {grada}. LF MOISTUR e rindërton atë — dhe pikërisht kjo e bën {partner} të përdorshëm çdo mbrëmje. Pa këtë, terapia zakonisht ndërpritet në javën e dytë.",
          de: "Die Schutzschicht der Haut ist bei Ihnen {grada}. LF MOISTUR baut sie wieder auf — und genau das macht {partner} jeden Abend anwendbar. Ohne diesen Schritt wird die Therapie meist in der zweiten Woche abgebrochen."
        }
      },
      {
        kur: {
          parametri: "barriera",
          nga: 1
        },
        teksti: {
          sq: "Shtresa mbrojtëse e lëkurës te ju është {grada}. LF MOISTUR e rindërton atë me ceramide dhe panthenol, që lëkura ta mbajë vetë ujin brenda.",
          de: "Die Schutzschicht der Haut ist bei Ihnen {grada}. LF MOISTUR baut sie mit Ceramiden und Panthenol wieder auf, damit die Haut das Wasser selbst haelt."
        }
      },
      {
        kur: {
          parametri: "keratinizimi",
          nga: 2,
          partner: true
        },
        teksti: {
          sq: "Te ju, shkalla e thatësisë dhe e luspave është {grada}. LF MOISTUR i zbut ato dhe njëkohësisht e mban {partner} të durueshëm çdo ditë — dy gjëra që vetëm së bashku japin rezultat.",
          de: "Bei Ihnen ist der Grad von Trockenheit und Schuppung {grada}. LF MOISTUR mildert sie und haelt gleichzeitig {partner} taeglich vertraeglich — zwei Dinge, die nur zusammen wirken."
        }
      },
      {
        kur: {
          partner: true
        },
        teksti: {
          sq: "LF MOISTUR nuk lufton puçrrat. Ai mban barrierën në këmbë, që {partner} të mund të punojë çdo ditë pa e tharë lëkurën — dhe kështu forcon efektin e tij gjatë 28 ditëve.",
          de: "LF MOISTUR bekaempft keine Pickel. Es haelt die Barriere stabil, damit {partner} jeden Tag arbeiten kann, ohne die Haut auszutrocknen — und verstaerkt so dessen Wirkung ueber die 28 Tage."
        }
      },
      {
        kur: {},
        teksti: {
          sq: "Lëkura juaj humbet ujë më shpejt sesa duhet. LF MOISTUR e rindërton shtresën që e mban atë brenda — baza mbi të cilën ndërtohet gjithçka tjetër.",
          de: "Ihre Haut verliert Wasser schneller als noetig. LF MOISTUR baut die Schicht wieder auf, die es haelt — die Grundlage, auf der alles Weitere aufbaut."
        }
      }
    ]
  },
  {
    id: "lf-pore",
    name: "LF PORE",
    // Die Art steuert das Zeichen, die Rolle den Satz: Ein Mittel mit
    // "baze" wirkt, eines mit "mbeshtetje" haelt die Haut in der
    // Verfassung, in der das wirkende taeglich vertragen wird.
    lloji: "serum",
    roli: "baze",
    nenName: { de: "Porenkontrolle", sq: "Kontroll i poreve" },
    kurztext: { de: "Loest die Verstopfung im Inneren der Pore", sq: "Shkrin bllokimin brenda porit" },
    beschreibung: { de: "Serum mit Salicylsaeure, die fettloeslich ist und deshalb in die Pore hineingelangt. Wirkt auf Komedonen, erweiterte Poren und die unebene Oberflaeche.", sq: "Serum me acid salicilik, që tretet në yndyrë dhe prandaj hyn brenda porit. Vepron mbi komedonet, poret e zgjeruara dhe sipërfaqen e pabarabartë." },
    inhalt: "30 ml",
    einzelpreis: 33,
    order: 2,
    routine: "both",
    availability: "visible",
    photoRef: "",
    perberesit: [
      {
        emri: "Salicylic Acid (BHA)",
        sasia: "2%",
        roli: {
          sq: "Hyn brenda porit dhe shkrin bllokimin",
          de: "Gelangt in die Pore und loest die Verstopfung"
        }
      },
      {
        emri: "Niacinamide",
        sasia: "5%",
        roli: {
          sq: "Ul yndyrën dhe ngushton pamjen e porit",
          de: "Senkt den Talg und verkleinert das Erscheinungsbild der Pore"
        }
      },
      {
        emri: "Zinc PCA",
        sasia: "",
        roli: {
          sq: "Ul shkëlqimin gjatë ditës",
          de: "Senkt den Glanz ueber den Tag"
        }
      }
    ],
    perdorimi: {
      hapi: 2,
      koha: {
        sq: "mbrëmje",
        de: "abends"
      },
      sasia: {
        sq: "3 deri 4 pika",
        de: "3 bis 4 Tropfen"
      },
      si: {
        sq: "Në lëkurë të pastër dhe të thatë, në zonat me pore të bllokuara. Javën e parë çdo ditë të dytë.",
        de: "Auf gereinigte, trockene Haut, auf die Zonen mit verstopften Poren. In der ersten Woche jeden zweiten Tag."
      },
      kujdes: {
        sq: "Mos e përdorni në të njëjtën mbrëmje me LF ACNE, përveçse nëse Dr. Gashi e thotë shprehimisht.",
        de: "Nicht am selben Abend mit LF ACNE, ausser Dr. Gashi sagt es ausdruecklich."
      }
    },
    synimi: { de: "Bis Tag 28: gleichmaessigere Oberflaeche und weniger sichtbare Poren, vor allem an Stirn und Nase.", sq: "Deri në ditën 28: sipërfaqe më e njëtrajtshme dhe pore më pak të dukshme, sidomos në ballë dhe hundë." },
    veprimi: { de: ["Gelangt in die Pore und loest die Verstopfung von innen","Senkt den Talg, der die Pore erneut fuellt","Macht die Oberflaeche Woche fuer Woche gleichmaessiger"], sq: ["Hyn brenda porit dhe shkrin bllokimin nga brenda","Ul yndyrën që e mbush porin përsëri","Bën sipërfaqen më të njëtrajtshme javë pas jave"] },
    persoenlich: { de: "{emri}, dieses Serum ist fuer {gjetja} gewaehlt, die bei Ihnen gefunden wurde.", sq: "{emri}, ky serum është zgjedhur për {gjetja} që u gjet te ju." },
    // Die Verbindung von Befund zu Mittel. Die ERSTE Regel, deren "kur"
    // auf die Analyse passt, liefert den Satz; die letzte hat keine
    // Bedingung und trifft immer. Deshalb bleibt der Abschnitt nie leer.
    lidhja: [
      {
        kur: {
          parametri: "poret",
          nga: 2
        },
        teksti: {
          sq: "Te ju, shkalla e bllokimit të poreve është {grada} ({vlera}). Acidi salicilik tretet në yndyrë — prandaj nuk punon vetëm në sipërfaqe, por hyn brenda porit ku është bllokimi.",
          de: "Bei Ihnen ist der Grad der Porenverstopfung {grada} ({vlera}). Salicylsaeure ist fettloeslich — sie arbeitet deshalb nicht nur an der Oberflaeche, sondern gelangt in die Pore, in der die Verstopfung sitzt."
        }
      },
      {
        kur: {
          diagnoza: [
            "akne_komedonale"
          ]
        },
        teksti: {
          sq: "Te ju u gjet {diagnoza}. Ky është saktësisht modeli ku LF PORE vepron: bllokimi qëndron brenda porit, dhe një produkt sipërfaqësor nuk e prek dot atje.",
          de: "Bei Ihnen wurde {diagnoza} gefunden. Genau dieses Muster ist der Fall fuer LF PORE: Die Verstopfung sitzt in der Pore, und ein oberflaechliches Produkt erreicht sie dort nicht."
        }
      },
      {
        kur: {
          parametri: "tekstura",
          nga: 2
        },
        teksti: {
          sq: "Sipërfaqja e lëkurës te ju është {grada} ({vlera}). LF PORE e barazon atë duke hequr bllokimin që e bën të pabarabartë.",
          de: "Die Hautoberflaeche ist bei Ihnen {grada} ({vlera}). LF PORE gleicht sie aus, indem es die Verstopfung entfernt, die sie uneben macht."
        }
      },
      {
        kur: {},
        teksti: {
          sq: "Te ju, gjetja më e fortë është {gjetja}. LF PORE punon aty ku fillon: brenda porit, para se të bëhet puçërr.",
          de: "Bei Ihnen ist {gjetja} der staerkste Befund. LF PORE arbeitet dort, wo er anfaengt: in der Pore, bevor daraus ein Pickel wird."
        }
      }
    ]
  },
  {
    id: "lf-clean",
    name: "LF CLEAN",
    // Die Art steuert das Zeichen, die Rolle den Satz: Ein Mittel mit
    // "baze" wirkt, eines mit "mbeshtetje" haelt die Haut in der
    // Verfassung, in der das wirkende taeglich vertragen wird.
    lloji: "pastrues",
    roli: "pastrim",
    nenName: { de: "Hydro-Reiniger", sq: "Hidro-pastrues" },
    kurztext: { de: "Reinigt, ohne die Barriere zu zerstoeren", sq: "Pastron pa e prishur barrierën" },
    beschreibung: { de: "Milder Reiniger mit pH 5,5. Entfernt Talg und Schmutz, laesst die Schutzschicht aber unberuehrt — dadurch ziehen die aktiven Stoffe danach besser ein.", sq: "Pastrues i butë me pH 5.5. Heq yndyrën dhe papastërtitë, por lë shtresën mbrojtëse të paprekur — dhe kështu përbërësit aktivë që vijnë pas hyjnë më mirë." },
    inhalt: "150 ml",
    einzelpreis: 33,
    order: 1,
    routine: "both",
    availability: "visible",
    photoRef: "",
    perberesit: [
      {
        emri: "Amfoterikë të butë",
        sasia: "",
        roli: {
          sq: "Pastrojnë pa e zhveshur lëkurën",
          de: "Reinigen, ohne die Haut zu entfetten"
        }
      },
      {
        emri: "Glycerin",
        sasia: "",
        roli: {
          sq: "Mban lagështinë gjatë larjes",
          de: "Haelt die Feuchtigkeit waehrend der Reinigung"
        }
      },
      {
        emri: "Panthenol (B5)",
        sasia: "",
        roli: {
          sq: "Qetëson lëkurën e acaruar",
          de: "Beruhigt gereizte Haut"
        }
      },
      {
        emri: "pH 5.5",
        sasia: "",
        roli: {
          sq: "Ruan pH-në natyrale të lëkurës",
          de: "Erhaelt den natuerlichen pH-Wert der Haut"
        }
      }
    ],
    perdorimi: {
      hapi: 1,
      koha: {
        sq: "mëngjes dhe mbrëmje",
        de: "morgens und abends"
      },
      sasia: {
        sq: "një pompim",
        de: "ein Pumpstoss"
      },
      si: {
        sq: "Në lëkurë të lagësht, 20 sekonda me lëvizje rrethore, pastaj shpëlajeni me ujë të vakët dhe thajeni me prekje.",
        de: "Auf feuchte Haut, 20 Sekunden kreisend, dann mit lauwarmem Wasser abspuelen und trocken tupfen."
      },
      kujdes: {
        sq: "Mos e fërkoni lëkurën me peshqir — vetëm prekje.",
        de: "Die Haut nicht mit dem Handtuch reiben — nur tupfen."
      }
    },
    synimi: { de: "Bis Tag 28: weniger Reizung nach dem Waschen und eine Haut, die die aktive Therapie besser vertraegt.", sq: "Deri në ditën 28: më pak acarim pas larjes dhe një lëkurë që e duron terapinë aktive më mirë." },
    veprimi: { de: ["Entfernt Talg und Schmutz, ohne die Barriere zu zerstoeren","Bereitet die Haut vor, damit die Wirkstoffe besser eindringen","Erhaelt den natuerlichen pH-Wert, deshalb kein Spannen"], sq: ["Heq yndyrën dhe papastërtitë pa e prishur barrierën","Përgatit lëkurën që përbërësit aktivë të hyjnë më mirë","Ruan pH-në natyrale, prandaj nuk shkakton tërheqje"] },
    persoenlich: { de: "{emri}, der erste Schritt an jedem Tag — darauf baut alles Weitere auf.", sq: "{emri}, hapi i parë çdo ditë — mbi të ndërtohet gjithçka tjetër." },
    // Die Verbindung von Befund zu Mittel. Die ERSTE Regel, deren "kur"
    // auf die Analyse passt, liefert den Satz; die letzte hat keine
    // Bedingung und trifft immer. Deshalb bleibt der Abschnitt nie leer.
    lidhja: [
      {
        kur: {
          parametri: "barriera",
          nga: 2
        },
        teksti: {
          sq: "Shtresa mbrojtëse e lëkurës te ju është {grada}. Shumica e dëmit fillon te larja: një pastrues i fortë e heq atë çdo ditë. LF CLEAN pastron pa e prekur.",
          de: "Die Schutzschicht ist bei Ihnen {grada}. Der meiste Schaden beginnt beim Waschen: Ein scharfer Reiniger nimmt sie taeglich weg. LF CLEAN reinigt, ohne sie anzugreifen."
        }
      },
      {
        kur: {
          partner: true
        },
        teksti: {
          sq: "LF CLEAN është hapi para {partner}. Në lëkurë të pastër dhe me pH të ruajtur, terapia aktive hyn më mirë dhe acaron më pak — i njëjti produkt, efekt më i madh.",
          de: "LF CLEAN ist der Schritt vor {partner}. Auf gereinigter Haut mit erhaltenem pH-Wert zieht die aktive Therapie besser ein und reizt weniger — dasselbe Produkt, groessere Wirkung."
        }
      },
      {
        kur: {},
        teksti: {
          sq: "Çdo terapi fillon me atë që hiqet, jo me atë që vihet. LF CLEAN e heq yndyrën dhe papastërtitë pa e zhveshur lëkurën.",
          de: "Jede Therapie beginnt mit dem, was entfernt wird, nicht mit dem, was aufgetragen wird. LF CLEAN nimmt Talg und Schmutz, ohne die Haut zu entfetten."
        }
      }
    ]
  },
  {
    id: "lf-pigment",
    name: "LF PIGMENT",
    // Die Art steuert das Zeichen, die Rolle den Satz: Ein Mittel mit
    // "baze" wirkt, eines mit "mbeshtetje" haelt die Haut in der
    // Verfassung, in der das wirkende taeglich vertragen wird.
    lloji: "serum",
    roli: "baze",
    nenName: { de: "Vitamin-C-Boost", sq: "Vitamin C Boost" },
    kurztext: { de: "Hellt Flecken auf und stoppt neues Nachdunkeln", sq: "Zbeh njollat dhe ndalon errësimin e ri" },
    beschreibung: { de: "Serum mit stabilem Vitamin C. Wirkt auf Flecken nach abgeheilten Pickeln und auf ungleichmaessige Farbe und stoppt die Bildung neuen Pigments ueber den Tag.", sq: "Serum me vitaminë C të qëndrueshme. Vepron mbi njollat e mbetura pas puçrrave dhe mbi çrregullimin e ngjyrës, dhe ndal formimin e pigmentit të ri gjatë ditës." },
    inhalt: "30 ml",
    einzelpreis: 33,
    order: 2,
    routine: "both",
    availability: "visible",
    photoRef: "",
    perberesit: [
      {
        emri: "3-O-Ethyl Ascorbic Acid",
        sasia: "10%",
        roli: {
          sq: "Ndal formimin e pigmentit të ri",
          de: "Stoppt die Bildung neuen Pigments"
        }
      },
      {
        emri: "Ferulic Acid",
        sasia: "",
        roli: {
          sq: "Mbron vitaminën C dhe forcon efektin",
          de: "Schuetzt das Vitamin C und verstaerkt die Wirkung"
        }
      },
      {
        emri: "Niacinamide",
        sasia: "4%",
        roli: {
          sq: "Ul kalimin e pigmentit në sipërfaqe",
          de: "Senkt die Wanderung des Pigments an die Oberflaeche"
        }
      }
    ],
    perdorimi: {
      hapi: 2,
      koha: {
        sq: "vetëm në mëngjes",
        de: "nur morgens"
      },
      sasia: {
        sq: "4 deri 5 pika",
        de: "4 bis 5 Tropfen"
      },
      si: {
        sq: "Në lëkurë të pastër, para hidratimit. Gjithmonë me mbrojtje nga dielli sipër.",
        de: "Auf die gereinigte Haut, vor der Feuchtigkeitspflege. Immer mit Sonnenschutz darueber."
      },
      kujdes: {
        sq: "Pa mbrojtje nga dielli, njollat errësohen përsëri — dhe puna e 28 ditëve humbet.",
        de: "Ohne Sonnenschutz dunkeln die Flecken wieder nach — und die Arbeit der 28 Tage ist verloren."
      }
    },
    synimi: { de: "Bis Tag 28: gleichmaessigere Farbe und neue Flecken, die nicht weiter nachdunkeln. Alte Flecken verblassen langsam und brauchen laenger als einen Monat.", sq: "Deri në ditën 28: ngjyrë më e njëtrajtshme dhe njolla të reja që nuk errësohen më tej. Njollat e vjetra zbehen ngadalë dhe kërkojnë më shumë se një muaj." },
    veprimi: { de: ["Stoppt die Bildung neuen Pigments in frischen Spuren","Hellt zurueckgebliebene Flecken nach Pickeln allmaehlich auf","Schuetzt tagsueber vor weiterem Nachdunkeln"], sq: ["Ndal formimin e pigmentit të ri në gjurmët e freskëta","Zbeh gradualisht njollat e mbetura pas puçrrave","Mbron nga errësimi i mëtejshëm gjatë ditës"] },
    persoenlich: { de: "{emri}, dieses Serum ist fuer {gjetja} gewaehlt, die bei Ihnen gefunden wurde.", sq: "{emri}, ky serum është zgjedhur për {gjetja} që u gjet te ju." },
    // Die Verbindung von Befund zu Mittel. Die ERSTE Regel, deren "kur"
    // auf die Analyse passt, liefert den Satz; die letzte hat keine
    // Bedingung und trifft immer. Deshalb bleibt der Abschnitt nie leer.
    lidhja: [
      {
        kur: {
          parametri: "njollat",
          nga: 2
        },
        teksti: {
          sq: "Te ju, shkalla e gjurmëve pas puçrrave është {grada} ({vlera}). Këto nuk zbehen shpejt vetë — LF PIGMENT ndal errësimin e mëtejshëm dhe i zbeh ato gradualisht.",
          de: "Bei Ihnen ist der Grad der Spuren nach Pickeln {grada} ({vlera}). Sie verblassen von allein nur langsam — LF PIGMENT stoppt das weitere Nachdunkeln und hellt sie allmaehlich auf."
        }
      },
      {
        kur: {
          diagnoza: [
            "hiperpigmentim_pas_inflamacionit",
            "melazma"
          ]
        },
        teksti: {
          sq: "Te ju u gjet {diagnoza}, me {gjetja} si gjetjen kryesore. Ky është pikërisht rasti ku vitamina C e qëndrueshme ka kuptim: ajo ndërhyn atje ku pigmenti krijohet.",
          de: "Bei Ihnen wurde {diagnoza} gefunden, mit {gjetja} als Hauptbefund. Genau hier ist stabiles Vitamin C sinnvoll: Es greift dort ein, wo das Pigment entsteht."
        }
      },
      {
        kur: {
          parametri: "pigmentimi",
          nga: 2
        },
        teksti: {
          sq: "Ngjyra e lëkurës te ju është {grada} ({vlera}). LF PIGMENT e barazon atë duke ndaluar pigmentin e ri dhe duke zbehur atë që ka mbetur.",
          de: "Die Hautfarbe ist bei Ihnen {grada} ({vlera}). LF PIGMENT gleicht sie aus, indem es neues Pigment stoppt und das vorhandene aufhellt."
        }
      },
      {
        kur: {
          partner: true
        },
        teksti: {
          sq: "{partner} punon mbi atë që është aktive tani. LF PIGMENT punon mbi atë që lënë pas puçrrat — pjesa që zakonisht mbetet edhe kur akne është qetësuar.",
          de: "{partner} arbeitet an dem, was jetzt aktiv ist. LF PIGMENT arbeitet an dem, was die Pickel hinterlassen — dem Teil, der meist bleibt, auch wenn die Akne beruhigt ist."
        }
      },
      {
        kur: {},
        teksti: {
          sq: "Te ju, gjetja më e fortë është {gjetja}. LF PIGMENT është zgjedhur për ngjyrën: ndal pigmentin e ri dhe zbeh atë që ka mbetur.",
          de: "Bei Ihnen ist {gjetja} der staerkste Befund. LF PIGMENT ist fuer die Farbe gewaehlt: Es stoppt neues Pigment und hellt das vorhandene auf."
        }
      }
    ]
  }
]);

// Was das Sortiment nicht abdeckt.
//
// Das steht hier nicht als Mangel, sondern als Hinweis fuer den CEO-Bereich:
// Die Abdeckungsansicht zeigt die betroffene Zeile rot, und darunter steht,
// welche Art Produkt fehlt. Kein Sortiment deckt jeden Befund ab - das ist
// keine Panne, sondern eine Entscheidung, die jemand bewusst treffen soll.
export const ABDECKUNG_HINWEIS = Object.freeze({
  glanz: {
    de: "Für fettige T-Zone fehlt ein Produkt — üblicherweise eine Reinigung oder ein mattierendes Fluid.",
    sq: "Mungon një produkt për zonën T të yndyrshme — zakonisht një pastrues."
  },
  poren: {
    de: "Für vergrößerte Poren fehlt ein Produkt — üblicherweise ein Peeling oder Tonikum.",
    sq: "Mungon një produkt për poret e zgjeruara — zakonisht një peeling ose tonik."
  }
});

// Der Tagespreis wird gerechnet, nicht geschrieben.
export function tagespreis(konfig = STANDARD_KONFIG) {
  const tage = Number(konfig.reichweiteTage) || 28;
  return Math.round((Number(konfig.setPreis) / tage) * 100) / 100;
}

export function einzelpreisSumme(produkte = STANDARD_PRODUKTE) {
  return produkte
    .filter((p) => p.availability !== "hidden")
    .reduce((summe, p) => summe + (Number(p.einzelpreis) || 0), 0);
}

export function ersparnis(produkte = STANDARD_PRODUKTE, konfig = STANDARD_KONFIG) {
  const summe = einzelpreisSumme(produkte);
  const gespart = summe - Number(konfig.setPreis);
  return {
    summe,
    gespart,
    prozent: summe > 0 ? Math.round((gespart / summe) * 100) : 0
  };
}

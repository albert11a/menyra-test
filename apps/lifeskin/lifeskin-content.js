// Alle Texte des Trichters.
//
// Zwei Sprachen nebeneinander, weil neunzig Prozent der Besucher aus Kosovo
// und Albanien kommen: `sq` ist die ausgelieferte Sprache, `de` die Fassung,
// gegen die geprueft wird. Wer einen Text aendert, aendert ihn hier - im
// Trichter steht keine einzige Zeichenkette.
//
// ACHTUNG, ehrlich gesagt: Die albanischen Texte sind sorgfaeltig, aber nicht
// von einem Muttersprachler. Vor dem ersten Werbeeuro muss jemand mit
// Albanisch als Erstsprache sie durchgehen - besonders die Befundtexte, die
// den Verkauf tragen. Ein holpriger Satz auf einer Seite, die medizinisch
// wirken soll, kostet mehr Vertrauen als jede Farbe es aufbaut.

export const SPRACHEN = Object.freeze(["sq", "de"]);

export function t(baum, sprache = "sq") {
  if (baum === null || baum === undefined) return "";
  if (typeof baum === "string") return baum;
  return baum[sprache] ?? baum.sq ?? baum.de ?? "";
}

export function fuelle(text, werte = {}) {
  return String(text).replace(/\{(\w+)\}/g, (treffer, schluessel) =>
    Object.prototype.hasOwnProperty.call(werte, schluessel) ? String(werte[schluessel]) : treffer
  );
}

// Die vier Stufen, wie der Kunde sie liest.
//
// In lifeskin-rules.js heissen sie "unauffaellig" bis "stark" - das sind
// Bezeichner fuer den Code und den Bericht. Wer sie ungeprueft anzeigt, hat
// deutschen Fachtext auf einer albanischen Seite stehen. Diese Tabelle ist
// die Uebersetzung, und sie ist der einzige Weg auf den Bildschirm.
export const STUFEN_TEXTE = Object.freeze([
  { sq: "në rregull", de: "unauffällig" },
  { sq: "e lehtë", de: "leicht" },
  { sq: "e dukshme", de: "deutlich" },
  { sq: "e theksuar", de: "stark" }
]);

export const OBERFLAECHE = Object.freeze({
  // 01 Einstieg
  einstiegTitel: {
    sq: "Për 60 sekonda e dini çfarë i duhet vërtet lëkurës suaj.",
    de: "In 60 Sekunden wissen Sie, was Ihre Haut wirklich braucht."
  },
  einstiegUnter: {
    sq: "Falas. Pa regjistrim. Fotoja juaj mbetet në telefonin tuaj.",
    de: "Kostenlos. Ohne Anmeldung. Ihr Foto bleibt auf Ihrem Handy."
  },
  einstiegKnopf: { sq: "Fillo analizën", de: "Analyse starten" },
  einstiegZaehler: {
    sq: "Deri tani {anzahl} analiza",
    de: "Bereits {anzahl} Analysen"
  },

  // 02 Name und Alter
  nameTitel: { sq: "Si ju quajnë?", de: "Wie heißen Sie?" },
  namePlatzhalter: { sq: "Emri juaj", de: "Ihr Vorname" },
  alterTitel: { sq: "Sa vjeç jeni?", de: "Wie alt sind Sie?" },
  alterGrund: {
    sq: "Që t'i krahasojmë vlerat tuaja me grupmoshën tuaj.",
    de: "Damit wir Ihre Werte mit Ihrer Altersgruppe vergleichen."
  },
  weiter: { sq: "Vazhdo", de: "Weiter" },

  // 03 Vorbereitung
  vorbereitungTitel: { sq: "Tre gjëra para fotos", de: "Drei Dinge vor dem Foto" },
  vorbereitungMakeup: { sq: "Pa grim", de: "Kein Make-up" },
  vorbereitungLicht: { sq: "Dritë e mirë", de: "Gutes Licht" },
  vorbereitungHoehe: { sq: "Telefoni në lartësi të syve", de: "Handy auf Augenhöhe" },
  vorbereitungSchutz: {
    sq: "Fotoja analizohet në pajisjen tuaj dhe nuk ngarkohet askund.",
    de: "Ihr Foto wird auf Ihrem Gerät ausgewertet und nicht hochgeladen."
  },
  vorbereitungKnopf: { sq: "Hap kamerën", de: "Kamera öffnen" },

  // 04 Aufnahme
  //
  // Die vier Pruefungen sind Anzeigen geblieben, aber keine Tore mehr: Der
  // Ring laeuft weiter, auch wenn eine davon rot ist. Siehe lifeskin-pose.js.
  pruefungGesicht: { sq: "Fytyra", de: "Gesicht" },
  pruefungAbstand: { sq: "Distanca", de: "Abstand" },
  pruefungLicht: { sq: "Drita", de: "Licht" },
  pruefungRuhe: { sq: "Qëndroni qetë", de: "Ruhig halten" },
  aufnahmeGleich: { sq: "Mos lëvizni…", de: "Nicht bewegen…" },
  aufnahmeHinweisNah: { sq: "Pak më larg", de: "Etwas weiter weg" },
  aufnahmeHinweisFern: { sq: "Pak më afër", de: "Etwas näher" },
  aufnahmeHinweisDunkel: { sq: "Kërkoni dritë më të mirë", de: "Suchen Sie besseres Licht" },
  aufnahmeHinweisHell: { sq: "Shumë dritë e drejtpërdrejtë", de: "Zu viel direktes Licht" },
  aufnahmeKnopfManuell: { sq: "Bëj foton", de: "Foto aufnehmen" },

  // 04b Der Ring
  //
  // Eine Anweisung, nie eine Fehlermeldung. Der Ring kennt kein Scheitern,
  // nur "noch nicht ganz herum" - und die Texte muessen das halten.
  ringEinmessen: {
    sq: "Vendoseni fytyrën në rreth dhe qëndroni qetë.",
    de: "Bringen Sie Ihr Gesicht in den Kreis und halten Sie kurz still."
  },
  ringDrehen: {
    sq: "Rrotulloni kokën ngadalë në rreth.",
    de: "Drehen Sie den Kopf langsam im Kreis."
  },
  ringWeiter: { sq: "Vazhdoni kështu…", de: "Weiter so…" },
  ringFastFertig: { sq: "Edhe pak…", de: "Nur noch ein Stück…" },
  ringFertig: { sq: "Gati.", de: "Fertig." },
  // Der Satz fuer den, bei dem sich nichts bewegt. Er nennt den Ausweg, statt
  // die Anweisung ein viertes Mal zu wiederholen.
  ringOhneBewegung: {
    sq: "Nëse nuk mund ta rrotulloni kokën, prekni «Bëj foton».",
    de: "Wenn Sie den Kopf nicht drehen können, tippen Sie auf «Foto aufnehmen»."
  },
  ringZurueck: {
    sq: "Kthejeni fytyrën te rrethi.",
    de: "Zurück in den Kreis."
  },
  ringGemessen: {
    sq: "{anzahl} nga {gesamt} pamje të matura",
    de: "{anzahl} von {gesamt} Ansichten vermessen"
  },
  ringGlanz: { sq: "Shkëlqimi", de: "Glanz" },
  ringRoetung: { sq: "Skuqja", de: "Rötung" },
  // Hautton statt Textur.
  //
  // Die drei Kacheln laufen waehrend der Aufnahme mit und muessen darum
  // Werte zeigen, die bei JEDER Aufloesung im Bild stehen. Textur braucht
  // 0,25 mm je Bildpunkt; auf einem schwaecheren Geraet blieb die Kachel
  // auf "wird gemessen" stehen, und das sieht aus, als haenge die Seite.
  // Glanz, Roetung und Hautton sind flaechig und immer da.
  ringHautton: { sq: "Toni i lëkurës", de: "Hautton" },
  ringWartet: { sq: "po matet…", de: "wird gemessen…" },

  // 05 Analyse
  analyseZonen: { sq: "Po njihen zonat e fytyrës…", de: "Gesichtszonen werden erkannt…" },
  analyseTzone: { sq: "Po matet zona T…", de: "T-Zone wird vermessen…" },
  analyseRoetung: { sq: "Po analizohet skuqja…", de: "Rötung wird analysiert…" },
  analyseTextur: { sq: "Po analizohet tekstura…", de: "Textur wird analysiert…" },
  analyseVergleich: {
    sq: "Krahasim me grupmoshën {gruppe}…",
    de: "Vergleich mit Altersgruppe {gruppe}…"
  },
  analyseRoutine: {
    sq: "Po përgatitet rutina juaj…",
    de: "Ihre Pflegeroutine wird zusammengestellt…"
  },

  // 06 Befund
  befundTitel: { sq: "{name}, kjo është lëkura juaj.", de: "{name}, das ist Ihr Hautbild." },
  befundGut: { sq: "Kjo është e mirë", de: "Das ist gut" },
  befundBeachten: { sq: "Kjo kërkon vëmendje", de: "Das braucht Aufmerksamkeit" },
  befundWhatsApp: { sq: "Merre rezultatin në WhatsApp", de: "Befund per WhatsApp erhalten" },
  befundWeiter: { sq: "Çfarë i duhet lëkurës sime", de: "Was meine Haut braucht" },

  // 07 Empfehlung
  empfehlungTitel: { sq: "Çfarë i duhet lëkurës suaj tani", de: "Was Ihre Haut jetzt braucht" },
  empfehlungWegen: { sq: "për {befund} tuaj", de: "für Ihre {befund}" },
  // Wenn kein Befund ausloest, wird nicht einer erfunden, damit der Satz
  // voller klingt. Erhaltung ist ein ehrlicher Grund - und bei guter Haut
  // der einzige richtige.
  empfehlungErhaltung: {
    sq: "për të ruajtur lëkurën tuaj",
    de: "zur Erhaltung Ihres Hautbildes"
  },
  befundOhneMangel: {
    sq: "Lëkura juaj është në gjendje të mirë. Këto dy produkte e mbajnë ashtu.",
    de: "Ihre Haut ist in gutem Zustand. Diese zwei Produkte halten sie so."
  },
  routineMorgens: { sq: "Në mëngjes", de: "Morgens" },
  routineAbends: { sq: "Në mbrëmje", de: "Abends" },

  // 08 Angebot
  angebotTitel: { sq: "Seti i {name}", de: "{name}s Set" },
  angebotEinzeln: { sq: "Veç e veç", de: "Einzeln" },
  angebotZusammen: { sq: "Së bashku", de: "Zusammen" },
  angebotSpart: { sq: "Kurseni {betrag} €", de: "Sie sparen {betrag} €" },
  angebotProTag: {
    sq: "{tage} javë kujdes — {preis} € në ditë",
    de: "{tage} Wochen Pflege — {preis} € pro Tag"
  },
  angebotNachnahme: {
    sq: "Paguani vetëm kur ta keni në dorë.",
    de: "Sie bezahlen erst, wenn Sie es in der Hand halten."
  },
  angebotRueckgabe: {
    sq: "{tage} ditë e drejtë kthimi. Nuk jeni të kënaqur? Paratë mbrapsht.",
    de: "{tage} Tage Rückgaberecht. Nicht zufrieden? Geld zurück."
  },
  angebotLieferung: { sq: "Te ju për {von}–{bis} ditë", de: "In {von}–{bis} Tagen bei Ihnen" },
  angebotKnopf: { sq: "Porosit — paguaj në dorëzim", de: "Bestellen — zahlen bei Lieferung" },
  angebotAblehnen: { sq: "Jo tani", de: "Jetzt nicht" },

  // Rückfall beim Ablehnen
  rueckfallTitel: { sq: "Vetëm një produkt?", de: "Nur ein Produkt?" },
  rueckfallText: {
    sq: "Nëse seti është shumë, filloni me atë që lëkura juaj ka më shumë nevojë.",
    de: "Wenn das Set zu viel ist, beginnen Sie mit dem, was Ihre Haut am dringendsten braucht."
  },

  // 09 Anschrift
  anschriftTitel: { sq: "Ku ta dërgojmë?", de: "Wohin sollen wir liefern?" },
  feldName: { sq: "Emri dhe mbiemri", de: "Vor- und Nachname" },
  feldStrasse: { sq: "Rruga dhe numri", de: "Straße und Hausnummer" },
  feldOrt: { sq: "Qyteti", de: "Stadt" },
  feldPlz: { sq: "Kodi postar", de: "Postleitzahl" },
  feldTelefon: { sq: "Numri i telefonit", de: "Telefonnummer" },
  telefonGrund: {
    sq: "Për të koordinuar dorëzimin.",
    de: "Für die Abstimmung der Lieferung."
  },
  bestellKnopf: { sq: "Porosit tani", de: "Jetzt bestellen" },
  bestellLaeuft: { sq: "Po dërgohet…", de: "Wird gesendet…" },

  // 10 Danke
  dankeTitel: { sq: "Faleminderit, {name}!", de: "Danke, {name}!" },
  dankeNummer: { sq: "Porosia nr. {nummer}", de: "Bestellung Nr. {nummer}" },
  dankeText: {
    sq: "Ju kontaktojmë para dorëzimit. Paguani kur ta merrni në dorë.",
    de: "Wir melden uns vor der Lieferung. Sie zahlen bei Erhalt."
  },
  dankeWiederholung: {
    sq: "Bëjeni testin sërish pas 4 javësh dhe shihni përparimin tuaj.",
    de: "Machen Sie den Test in 4 Wochen erneut und sehen Sie Ihren Fortschritt."
  },

  // Fehler - sagen, was los ist und was zu tun ist. Nie nur "Fehler".
  fehlerKamera: {
    sq: "Nuk arritëm të hapim kamerën. Lejoni qasjen në kamerë dhe provoni sërish.",
    de: "Die Kamera ließ sich nicht öffnen. Erlauben Sie den Kamerazugriff und versuchen Sie es erneut."
  },
  fehlerKeinGesicht: {
    sq: "Nuk po dallojmë fytyrë. Kërkoni dritë më të mirë dhe mbani telefonin në lartësi të syve.",
    de: "Wir erkennen kein Gesicht. Suchen Sie besseres Licht und halten Sie das Handy auf Augenhöhe."
  },
  fehlerBestellung: {
    sq: "Porosia nuk u dërgua. Kontrolloni internetin dhe provoni sërish — të dhënat tuaja janë ruajtur.",
    de: "Die Bestellung ging nicht raus. Prüfen Sie die Verbindung und versuchen Sie es erneut — Ihre Eingaben sind gespeichert."
  },
  nochmal: { sq: "Provo sërish", de: "Erneut versuchen" }
});

// Die Bausteine des Befundtextes.
//
// Je Befund vier Stufen. Der Trichter setzt sie zusammen, statt fertige
// Saetze zu speichern - aus sechs Befunden mal vier Stufen werden so
// tausende verschiedene Befunde, ohne dass jemand tausend Texte schreibt.
export const BEFUND_TEXTE = Object.freeze({
  roetung: [
    { sq: "Lëkura juaj është e qetë, pa skuqje.", de: "Ihre Haut ist ruhig, ohne Rötung." },
    { sq: "Faqet tuaja janë lehtësisht të skuqura.", de: "Ihre Wangen zeigen eine leichte Rötung." },
    { sq: "Faqet tuaja janë dukshëm të skuqura dhe reagojnë ndjeshëm.", de: "Ihre Wangen sind deutlich gerötet und reagieren empfindlich." },
    { sq: "Faqet tuaja janë fort të skuqura — lëkura juaj është e irrituar.", de: "Ihre Wangen sind stark gerötet — Ihre Haut ist gereizt." }
  ],
  trockenheit: [
    { sq: "Tekstura e lëkurës suaj është e butë dhe e barabartë.", de: "Ihre Hautstruktur ist glatt und gleichmäßig." },
    { sq: "Lëkura juaj është pak e ashpër në disa vende.", de: "Ihre Haut ist stellenweise leicht rau." },
    { sq: "Lëkura juaj është e ashpër dhe i mungon lagështia.", de: "Ihre Haut ist rau und es fehlt ihr Feuchtigkeit." },
    { sq: "Lëkura juaj është shumë e thatë dhe e shtrënguar.", de: "Ihre Haut ist sehr trocken und spannt." }
  ],
  glanz: [
    { sq: "Zona juaj T është e ekuilibruar.", de: "Ihre T-Zone ist ausgeglichen." },
    { sq: "Balli dhe hunda shkëlqejnë lehtë.", de: "Stirn und Nase glänzen leicht." },
    { sq: "Zona juaj T prodhon dukshëm më shumë yndyrë.", de: "Ihre T-Zone produziert deutlich mehr Talg." },
    { sq: "Zona juaj T shkëlqen fort gjatë gjithë ditës.", de: "Ihre T-Zone glänzt stark über den Tag." }
  ],
  poren: [
    { sq: "Poret tuaja janë të imëta dhe pak të dukshme.", de: "Ihre Poren sind fein und kaum sichtbar." },
    { sq: "Rreth hundës poret janë pak të dukshme.", de: "Um die Nase sind die Poren leicht sichtbar." },
    { sq: "Poret tuaja janë dukshëm të zgjeruara.", de: "Ihre Poren sind deutlich vergrößert." },
    { sq: "Poret tuaja janë fort të zgjeruara në disa zona.", de: "Ihre Poren sind in mehreren Zonen stark vergrößert." }
  ],
  pigment: [
    { sq: "Ngjyra e lëkurës suaj është e barabartë.", de: "Ihr Hautton ist gleichmäßig." },
    { sq: "Keni disa njolla të lehta pigmenti.", de: "Sie haben einzelne helle Pigmentflecken." },
    { sq: "Ngjyra e lëkurës suaj është e pabarabartë me njolla të dukshme.", de: "Ihr Hautton ist ungleichmäßig mit sichtbaren Flecken." },
    { sq: "Keni njolla të theksuara pigmenti.", de: "Sie haben ausgeprägte Pigmentflecken." }
  ],
  linien: [
    { sq: "Lëkura juaj është e lëmuar për moshën tuaj.", de: "Ihre Haut ist für Ihr Alter glatt." },
    { sq: "Shfaqen rrudhat e para të imëta.", de: "Erste feine Linien zeichnen sich ab." },
    { sq: "Rrudhat e imëta janë qartë të dukshme.", de: "Feine Linien sind deutlich sichtbar." },
    { sq: "Rrudhat janë të thella dhe qartë të dukshme.", de: "Die Linien sind tief und klar sichtbar." }
  ]
});

// Wo zwei Befunde zusammentreffen, sagt die Kombination mehr als jeder
// einzelne Satz. Diese Zeilen stehen unter dem Hauttyp und machen den
// Unterschied zwischen einer Liste und einem Befund.
export const KOMBINATIONEN = Object.freeze([
  {
    wenn: [["roetung", 2], ["trockenheit", 2]],
    text: {
      sq: "Skuqja bashkë me thatësinë tregon një barrierë të dobësuar të lëkurës — kjo është shkaku, jo pasojë.",
      de: "Rötung zusammen mit Trockenheit deutet auf eine geschwächte Hautbarriere hin — das ist die Ursache, nicht die Folge."
    }
  },
  {
    wenn: [["glanz", 2], ["poren", 2]],
    text: {
      sq: "Yndyra e tepërt i zgjeron poret. Nëse rregullohet yndyra, poret zvogëlohen bashkë me të.",
      de: "Überschüssiger Talg weitet die Poren. Wird der Talg reguliert, gehen die Poren mit zurück."
    }
  },
  {
    wenn: [["glanz", 2], ["trockenheit", 2]],
    text: {
      sq: "Shkëlqim dhe thatësi njëkohësisht: lëkura juaj prodhon yndyrë sepse i mungon lagështia.",
      de: "Glanz und Trockenheit gleichzeitig: Ihre Haut produziert Talg, weil ihr Feuchtigkeit fehlt."
    }
  },
  {
    wenn: [["pigment", 2], ["linien", 2]],
    text: {
      sq: "Njollat dhe rrudhat vijnë kryesisht nga dielli. Mbrojtja nga dielli ndalon të dyja.",
      de: "Flecken und Linien kommen überwiegend von der Sonne. Sonnenschutz stoppt beide."
    }
  }
]);

export function findeKombination(befunde) {
  const stufe = (id) => befunde.find((b) => b.id === id)?.stufe ?? 0;
  return KOMBINATIONEN.find((k) => k.wenn.every(([id, mindest]) => stufe(id) >= mindest)) || null;
}

// Der Hinweis, der immer erscheint. Er ist keine Formalie: Ein falsches
// "alles in Ordnung" bei etwas Ernstem ist das einzige Ergebnis, das diesem
// Geschaeft wirklich schaden kann.
export const HAFTUNG = Object.freeze({
  sq: "Kjo analizë është kozmetike dhe nuk zëvendëson vizitën te mjeku. Nëse vëreni një nishan që ndryshon, drejtojuni mjekut.",
  de: "Diese Analyse ist kosmetisch und ersetzt keine ärztliche Untersuchung. Wenn Sie ein Muttermal bemerken, das sich verändert, lassen Sie es ärztlich abklären."
});

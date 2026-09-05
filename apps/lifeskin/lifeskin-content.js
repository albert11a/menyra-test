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

export const OBERFLAECHE = Object.freeze({
  // 01 Einstieg
  einstiegTitel: {
    sq: "60 sekonda skanim. Pastaj Dr. Gashi ju thotë çfarë i duhet lëkurës suaj.",
    de: "60 Sekunden Scan. Dann sagt Ihnen Dr. Gashi, was Ihre Haut braucht."
  },
  einstiegUnter: {
    sq: "Falas. Pa regjistrim. Fotoja juaj mbetet në telefonin tuaj.",
    de: "Kostenlos. Ohne Anmeldung. Ihr Foto bleibt auf Ihrem Handy."
  },
  einstiegKnopf: { sq: "Fillo skanimin", de: "Scan starten" },
  einstiegZaehler: {
    sq: "Deri tani {anzahl} skanime",
    de: "Bereits {anzahl} Scans"
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
  // Dieser Satz hat sich geaendert, und der Grund gehoert hierher.
  //
  // Vorher stand hier "wird auf Ihrem Geraet ausgewertet und nicht
  // hochgeladen". Das war wahr, solange nichts gespeichert wurde. Seit die
  // drei Aufnahmen zur Aerztin gehen, waere es eine Luege - ausgerechnet an
  // der Stelle, an der ein Patient entscheidet, ob er sein Gesicht zeigt.
  //
  // Der neue Satz ist kein Rueckschritt, sondern das Argument: Es schaut
  // eine echte Aerztin darauf. Das kann keine App versprechen, die nur
  // rechnet.
  vorbereitungSchutz: {
    sq: "Matja bëhet në pajisjen tuaj. Fotot i sheh vetëm Dr. Gashi për vlerësimin — askush tjetër.",
    de: "Die Messung läuft auf Ihrem Gerät. Die Fotos sieht nur Dr. Gashi für die Beurteilung — sonst niemand."
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
  // Der Ladebildschirm sagt, was WIR tun - nicht, was eine Aerztin tut.
  //
  // Hier stand "Roetung wird analysiert", "Ihre Pflegeroutine wird
  // zusammengestellt". Beides war ein Versprechen, das die Software gar
  // nicht einloesen soll: Analysiert wird von Dr. Gashi, und die Routine
  // stellt sie zusammen. Was hier laeuft, ist die Aufbereitung der
  // Aufnahmen.
  analyseZonen: { sq: "Po njihen zonat e fytyrës…", de: "Gesichtszonen werden erkannt…" },
  analyseTzone: { sq: "Po përgatiten fotot…", de: "Aufnahmen werden aufbereitet…" },
  analyseRoetung: { sq: "Po kontrollohet cilësia e fotos…", de: "Bildqualität wird geprüft…" },
  analyseTextur: { sq: "Po zgjidhen tri fotot më të mira…", de: "Die drei besten Aufnahmen werden gewählt…" },
  analyseVergleich: {
    sq: "Po ruhet skanimi juaj…",
    de: "Ihr Scan wird gespeichert…"
  },
  analyseRoutine: {
    sq: "Po dërgohet te Dr. Gashi…",
    de: "Wird an Dr. Gashi übergeben…"
  },

  // 06 Befund
  // Der Ergebnisbildschirm sagt jetzt, dass die Aufnahmen fertig sind - nicht
  // mehr, was gemessen wurde. Der Befund kommt von Dr. Gashi.
  befundTitel: { sq: "{name}, skanimi juaj është gati.", de: "{name}, Ihr Scan ist fertig." },
  akteMarke: { sq: "Numri i skanimit tuaj", de: "Ihre Fallnummer" },
  // Nach einer Rueckkehr. Kein "willkommen zurueck" - das klingt nach einer
  // App. Ein Satz, der sagt: nichts ist verloren.
  akteZurueck: {
    sq: "{name}, skanimi juaj është ende këtu.",
    de: "{name}, Ihr Scan ist noch da."
  },

  // ---- Der WhatsApp-Knopf ----
  //
  // Die drei Sekunden vor dem Tippen entscheiden alles. Wer weiss, was
  // gleich passiert, laesst sich vom Systemhinweis "In WhatsApp oeffnen?"
  // nicht stoeren. Wer es nicht weiss, bricht dort ab.
  //
  // Deshalb steht die App im Knopf ("WhatsApp oeffnen" statt "Kontakt
  // aufnehmen") und darunter der Satz, der die groesste Sorge nimmt: Er
  // muss nichts formulieren.
  waKnopf: { sq: "Hape WhatsApp-in", de: "WhatsApp öffnen" },
  waUnterKnopf: {
    sq: "Mesazhi është shkruar tashmë. Ju vetëm e dërgoni.",
    de: "Ihre Nachricht ist schon geschrieben. Sie tippen nur auf Senden."
  },
  // Wer nicht ohne Antwort klickt, bekommt sie - Ausweichen zerstoert
  // Vertrauen schneller als jede unbequeme Wahrheit.
  waWasPassiert: { sq: "Çfarë ndodh pastaj?", de: "Was passiert dann?" },
  waWasPassiertText: {
    sq: "WhatsApp hapet me mesazhin tuaj gati. Ju e dërgoni — dhe Dr. Gashi i sheh fotot tuaja. Pa pagesë. Ju mund të bllokoni bisedën në çdo moment.",
    de: "WhatsApp öffnet sich mit Ihrer fertigen Nachricht. Sie senden sie — und Dr. Gashi sieht Ihre Aufnahmen. Kostenlos. Sie können das Gespräch jederzeit beenden."
  },
  // Nach der Rueckkehr auf die Seite. Einmal, ruhig, keine Mahnung.
  waZurueckFrage: { sq: "E dërguat mesazhin?", de: "Nachricht abgeschickt?" },
  waZurueckJa: { sq: "Po, e dërgova", de: "Ja, abgeschickt" },
  waZurueckNein: { sq: "Jo — më mirë lini numrin", de: "Nein — lieber Nummer hinterlassen" },
  waDanke: {
    sq: "Faleminderit. Dr. Gashi ju përgjigjet sot.",
    de: "Danke. Dr. Gashi antwortet Ihnen heute."
  },
  // Der zweite Weg, fuer alle ohne WhatsApp oder mit zu viel Vorsicht.
  waNummerKnopf: { sq: "Nuk keni WhatsApp? Lini numrin", de: "Kein WhatsApp? Nummer hinterlassen" },
  waNummerGesendet: { sq: "Faleminderit — Dr. Gashi ju shkruan.", de: "Danke — Dr. Gashi schreibt Ihnen." },
  // Die vier Zeilen der Aktenkarte. Die ersten drei sind erledigt, die
  // vierte ist offen - und das ist keine Masche, sondern der Sachverhalt.
  akteAufnahmen: { sq: "{anzahl} foto të bëra", de: "{anzahl} Aufnahmen gemacht" },
  akteZonen: { sq: "5 zona të matura", de: "5 Zonen vermessen" },
  akteGespeichert: { sq: "Skanimi u ruajt", de: "Scan gespeichert" },
  akteOffen: { sq: "Analiza nga Dr. Gashi", de: "Die Analyse von Dr. Gashi" },
  akteOffenHinweis: {
    sq: "Ky është hapi i fundit. Dr. Gashi ende nuk ka si t'ju përgjigjet.",
    de: "Das ist der letzte Schritt. Dr. Gashi hat noch keine Möglichkeit, Ihnen zu antworten."
  },
  aufnahmenText: {
    sq: "Dr. Gashi i shikon vetë fotot tuaja dhe ju thotë çfarë ka lëkura juaj — dhe çfarë i duhet.",
    de: "Dr. Gashi sieht sich Ihre Aufnahmen selbst an und sagt Ihnen, was Ihre Haut hat — und was sie braucht."
  },
  aufnahmenGerade: { sq: "Ballë", de: "Gerade" },
  aufnahmenRechts: { sq: "Djathtas", de: "Nach rechts" },
  aufnahmenLinks: { sq: "Majtas", de: "Nach links" },
  aufnahmenKein: {
    sq: "Skanimi u krye. Dr. Gashi i shikon fotot tuaja.",
    de: "Der Scan ist fertig. Dr. Gashi sieht sich Ihre Aufnahmen an."
  },
  befundGut: { sq: "Kjo është e mirë", de: "Das ist gut" },
  befundBeachten: { sq: "Kjo kërkon vëmendje", de: "Das braucht Aufmerksamkeit" },

  // Der Schwerpunkt: der Punkt, der bei diesem Gesicht am staerksten
  // ausgepraegt ist - auch wenn er keine Stufe erreicht.
  //
  // ACHTUNG BEIM UMFORMULIEREN. Der Satz darf nicht behaupten, dass etwas
  // nicht in Ordnung sei. Er sagt, was im Vergleich zum Rest DIESES Gesichts
  // am meisten hervortritt, und das ist wahr. "Sie haben ein Problem mit X"
  // waere es nicht - und es faellt beim ersten Kunden auf, der zum Arzt geht
  // und dort das Gegenteil hoert.
  befundSchwerpunkt: {
    sq: "Këtu ia vlen të kujdeseni",
    de: "Hier lohnt sich Pflege"
  },
  befundSchwerpunktText: {
    sq: "Krahasuar me pjesën tjetër të fytyrës suaj, kjo del më shumë në pah. Nuk është problem — por është pika ku kujdesi bën ndryshimin më të madh.",
    de: "Verglichen mit dem Rest Ihres Gesichts tritt das am stärksten hervor. Kein Problem — aber der Punkt, an dem Pflege den größten Unterschied macht."
  },
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

// Der Hinweis, der immer erscheint. Er ist keine Formalie: Ein falsches
// "alles in Ordnung" bei etwas Ernstem ist das einzige Ergebnis, das diesem
// Geschaeft wirklich schaden kann.
export const HAFTUNG = Object.freeze({
  sq: "Ky skanim bën vetëm fotot. Vlerësimi është kozmetik dhe nuk zëvendëson një vizitë te mjeku. Nëse vëreni një nishan që ndryshon, drejtojuni mjekut.",
  de: "Dieser Scan macht nur die Aufnahmen. Die Beurteilung ist kosmetisch und ersetzt keine ärztliche Untersuchung. Wenn Sie ein Muttermal bemerken, das sich verändert, lassen Sie es ärztlich abklären."
});

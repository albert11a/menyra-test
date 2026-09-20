// Der v3-Vertrag PRUEFT, er SPERRT NICHT.
//
// Hier stand ein Waechter, der bei der ersten Abweichung geworfen hat, und
// jeder Wurf endete an derselben Stelle: Der Arzt fuegte die fertige
// Analyse in Heart ein, bekam eine einzelne Zeile Deutsch zu sehen
// ("Begriff makula_hiperpigmentare kommt im Befund nicht vor") und hatte
// keinen einzigen gefuellten Bogen. Vier Fotos statt drei, ein Begriff,
// der im Befundtext nicht WOERTLICH so steht, eine Zaehlung, die um eins
// danebenliegt - lauter Kleinigkeiten, die man im Bogen in zehn Sekunden
// korrigiert, wenn man ihn denn erst einmal vor sich hat.
//
// Deshalb gibt diese Datei jetzt eine LISTE VON HINWEISEN zurueck, statt
// zu werfen. Uebernommen wird immer; was auffaellt, steht daneben. Das ist
// derselbe Grundsatz, der in Heart schon zweimal steht: Die Automatik
// fuellt vor, sie entscheidet nicht.
//
// Wer hier wieder ein throw einbaut, nimmt dem Arzt den Bogen weg - und
// zwar genau dann, wenn die Analyse schon fertig ist.
export const PARAMETER_IDS = ['lezionet','inflamacioni','poret','skuqja','njollat','pigmentimi','tekstura','keratinizimi','barriera','shenjat'];
export const DIAGNOSE_IDS = ['akne_komedonale','akne_inflamatore','akne_e_perzier','akne_nodulare','hiperpigmentim_pas_inflamacionit','melazma','rozacea','dermatit_seborreik','barriere_e_demtuar','lekure_e_thate','lekure_e_yndyrshme','tekstura_e_pabarabarte','shenja_atrofike','lekure_e_qete','tjeter'];
export const GRADES = ['në rregull','e lehtë','e mesme','e theksuar','e fortë'];
export const STATUS_VLERESIMI = ['i_vleresueshem','i_pjesshem','i_pavleresueshem','kontroll_mjekesor'];

// Gibt die Hinweise zurueck - leer heisst: nichts aufgefallen.
//
// Jede Pruefung steht fuer sich und greift auf nichts zu, was eine
// vorherige erst bestaetigt haette: Ein Befund ohne diagnoza darf hier
// keinen Programmfehler ausloesen, sondern muss einen Hinweis ergeben.
export function pruefeRaportV3(d) {
  const hinweise = [];
  const merke = (s) => { if (!hinweise.includes(s)) hinweise.push(s); };
  // Alles vor v3 geht durch den alten Leser und hat mit diesem Vertrag
  // nichts zu tun.
  if (!d || typeof d !== 'object' || Array.isArray(d) || !Object.hasOwn(d, 'schema_version')) return hinweise;

  const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : null);
  const str = (v, path) => { if (typeof v !== 'string') merke(`${path}: Text erwartet.`); };
  const keys = (v, erwartet, path, geduldet = []) => {
    const o = obj(v);
    if (!o) { merke(`${path}: Hier wird ein Block mit Feldern erwartet.`); return null; }
    const fremd = Object.keys(o).filter((k) => !erwartet.includes(k) && !geduldet.includes(k));
    const fehlt = erwartet.filter((k) => !Object.hasOwn(o, k));
    if (fremd.length) merke(`${path}: unbekanntes Feld (${fremd.join(', ')}).`);
    if (fehlt.length) merke(`${path}: fehlendes Feld (${fehlt.join(', ')}).`);
    return o;
  };
  const integer = (v, min, max, path) => { if (!Number.isInteger(v) || v < min || v > max) merke(`${path}: Ganzzahl ${min}–${max} erwartet.`); };

  if (d.schema_version !== 3) merke('Unbekannte schema_version.');
  // Die Fallnummer gehoert nicht ins JSON. Heart kennt sie vom offenen
  // Fall, und ein zweites Mal geschrieben ist sie nur eine zweite Wahrheit,
  // die abweichen kann. Eine mitgeschickte wird geduldet und nicht gelesen.
  keys(d,['schema_version','vleresimi','raporti','ekzaminimi','gjetjet','parametrat','diagnoza','shpjegimi','pa_kujdes','keshilla','synimi_28','termat','nevojat'],'root',['kodi']);

  // Die Grenze der Methode gehoert nicht ins JSON. Sie steht wortgleich in
  // der Seite ("Çfarë nuk mund të thotë një foto") und wirkt nur, weil sie
  // jedes Mal dieselbe ist: ein Zugestaendnis, das bei jedem Bericht anders
  // formuliert ist, ist kein Zugestaendnis. Ein mitgeschicktes kufizimi
  // wird geduldet und nicht gelesen.
  const vleresimi = keys(d.vleresimi,['statusi'],'vleresimi',['kufizimi']);
  if (vleresimi && !STATUS_VLERESIMI.includes(vleresimi.statusi)) merke('Unbekannter Beurteilungsstatus.');

  const raporti = keys(d.raporti,['fotot','parametrat_e_vleresuar','parametrat_me_gjetje','zonat_e_kontrolluara','zonat_me_ndryshime'],'raporti');
  if (raporti) { integer(raporti.fotot,1,3,'fotot'); integer(raporti.zonat_e_kontrolluara,0,13,'zonat_e_kontrolluara'); }

  const gjetjet = keys(d.gjetjet,['permbledhja','gjetja_kryesore','gjetja_dyta','sipas_zonave'],'gjetjet');
  const zonen = Array.isArray(gjetjet?.sipas_zonave) ? gjetjet.sipas_zonave : [];
  if (gjetjet) {
    str(gjetjet.permbledhja,'permbledhja'); str(gjetjet.gjetja_kryesore,'gjetja_kryesore'); str(gjetjet.gjetja_dyta,'gjetja_dyta');
    if (!Array.isArray(gjetjet.sipas_zonave)) merke('sipas_zonave: Liste erwartet.');
    else if (gjetjet.sipas_zonave.length > 5) merke('Mehr als fünf Zonenzeilen — die Seite zeigt fünf.');
    for (const z of zonen) { const zo = keys(z,['zona','teksti'],'zona'); if (zo) { str(zo.zona,'zona'); str(zo.teksti,'zona.teksti'); } }
  }

  const parametrat = Array.isArray(d.parametrat) ? d.parametrat : [];
  if (!Array.isArray(d.parametrat)) merke('parametrat: Liste erwartet.');
  else if (parametrat.length !== 10 || new Set(parametrat.map((p) => p?.id)).size !== 10) merke('Erwartet werden genau zehn eindeutige Parameter.');
  for (const p of parametrat) {
    const par = keys(p,['id','emri','termi','thjeshte','vlera','shkalla','grada','nga_vjen'],'parametri');
    if (!par) continue;
    if (!PARAMETER_IDS.includes(par.id)) merke(`Unbekannte Parameterkennung (${String(par.id)}).`);
    for (const k of ['emri','termi','thjeshte','vlera','grada','nga_vjen']) str(par[k], `parametri.${k}`);
    if (par.shkalla !== null) integer(par.shkalla,0,4,'shkalla');
    if (par.grada !== (par.shkalla === null ? 'nuk vlerësohet' : GRADES[par.shkalla])) merke(`Grad und Stufe widersprechen sich (${String(par.id)}).`);
  }
  if (raporti && Array.isArray(d.parametrat)
    && (raporti.parametrat_e_vleresuar !== parametrat.filter((p) => p?.shkalla !== null).length
      || raporti.parametrat_me_gjetje !== parametrat.filter((p) => p?.shkalla > 0).length)) merke('Die Parameterzählung stimmt nicht mit der Liste überein.');
  if (raporti && (raporti.zonat_me_ndryshime !== zonen.length || raporti.zonat_me_ndryshime > raporti.zonat_e_kontrolluara)) merke('Die Zonenzählung stimmt nicht mit der Liste überein.');

  const diagnoza = keys(d.diagnoza,['id','emri','latinisht','niveli','niveli_emri'],'diagnoza');
  if (diagnoza) {
    if (!DIAGNOSE_IDS.includes(diagnoza.id)) merke(`Unbekannte Diagnosekennung (${String(diagnoza.id)}).`);
    if (diagnoza.niveli !== null) integer(diagnoza.niveli,0,4,'diagnoza.niveli');
    for (const k of ['emri','latinisht','niveli_emri']) str(diagnoza[k],`diagnoza.${k}`);
  }

  const shpjegimi = Array.isArray(d.shpjegimi) ? d.shpjegimi : [];
  if (!Array.isArray(d.shpjegimi)) merke('shpjegimi: Liste erwartet.');
  else if (shpjegimi.length > 2) merke('Mehr als zwei Erklärungsabsätze — die Seite zeigt zwei.');
  shpjegimi.forEach((s) => str(s,'shpjegimi'));

  const paKujdes = keys(d.pa_kujdes,['zbehet','nuk_zbehet','pas_6_muajsh'],'pa_kujdes');
  if (paKujdes) Object.values(paKujdes).forEach((s) => str(s,'pa_kujdes'));
  for (const k of ['ekzaminimi','keshilla','synimi_28']) if (Object.hasOwn(d,k)) str(d[k],k);

  const termat = Array.isArray(d.termat) ? d.termat : [];
  if (!Array.isArray(d.termat)) merke('termat: Liste erwartet.');
  else if (termat.length > 8) merke('Mehr als acht Begriffe — die Seite zeigt acht.');
  const gesehen = new Set();
  // Der Text, in dem ein Begriff vorkommen SOLL. Kommt er nicht darin vor,
  // bleibt er im Bogen stehen und wird nur nicht unterstrichen - das ist
  // ein Schoenheitsfehler und kein Grund, den ganzen Befund abzulehnen.
  const texte = [
    typeof gjetjet?.permbledhja === 'string' ? gjetjet.permbledhja : '',
    ...zonen.map((z) => (typeof z?.teksti === 'string' ? z.teksti : '')),
    ...shpjegimi.filter((s) => typeof s === 'string'),
    ...parametrat.map((p) => (typeof p?.emri === 'string' ? p.emri : '')),
    ...(paKujdes ? Object.values(paKujdes).filter((s) => typeof s === 'string') : [])
  ];
  for (const t of termat) {
    const term = keys(t,['id','shprehja','emri','termi','shpjegimi','te_ju'],'termi');
    if (!term) continue;
    for (const k of ['id','shprehja','emri','termi','shpjegimi','te_ju']) str(term[k], `termi.${k}`);
    if (!term.id || !term.shprehja || !term.shpjegimi) merke('Ein Begriff ist leer.');
    else if (gesehen.has(term.id)) merke(`Der Begriff ${term.id} steht doppelt.`);
    else {
      gesehen.add(term.id);
      if (!texte.some((s) => s.includes(term.shprehja))) merke(`Der Begriff ${term.id} kommt im Befundtext nicht wörtlich vor — er wird dort nicht unterstrichen.`);
    }
  }

  const nevojat = Array.isArray(d.nevojat) ? d.nevojat : [];
  if (!Array.isArray(d.nevojat)) merke('nevojat: Liste erwartet.');
  else if (nevojat.length > 3) merke('Mehr als drei belegbare Bedürfnisse.');
  const rollen = new Set();
  for (const n of nevojat) {
    const nev = keys(n,['roli','produkt_id','gjetja','kerkon','teksti'],'nevoja');
    if (!nev) continue;
    if (!['kryesor','dytesor','mbrojtes'].includes(nev.roli)) merke(`Unbekannte Bedarfsrolle (${String(nev.roli)}).`);
    else if (rollen.has(nev.roli)) merke(`Die Bedarfsrolle ${nev.roli} steht doppelt.`);
    else rollen.add(nev.roli);
    for (const k of ['produkt_id','gjetja','kerkon','teksti']) str(nev[k],`nevoja.${k}`);
  }
  // Angehakt wird in Heart, und dort entscheidet der Betreiber. Der
  // Hinweis bleibt, weil ein Mittel vor einer noetigen Abklaerung eine
  // Aussage ist, die jemand gesehen haben sollte.
  if (vleresimi && ['i_pavleresueshem','kontroll_mjekesor'].includes(vleresimi.statusi) && nevojat.length) merke('Produktbedarf trotz erforderlicher Abklärung.');

  return hinweise;
}


// Split only plain text. The renderer never interprets model-generated HTML.
export function termSegments(text, terms = []) {
  const out = []; let rest = String(text || '');
  const candidates = terms.filter(t => t && typeof t.shprehja === 'string' && t.shprehja.length);
  while (rest) {
    const matches = candidates.map(t=>({t,i:rest.indexOf(t.shprehja)})).filter(x=>x.i>=0).sort((a,b)=>a.i-b.i || b.t.shprehja.length-a.t.shprehja.length);
    if (!matches.length) { out.push({text:rest}); break; }
    const {t,i} = matches[0]; if (i) out.push({text:rest.slice(0,i)});
    out.push({text:t.shprehja,term:t}); rest=rest.slice(i+t.shprehja.length);
  }
  return out;
}

export function reportToWire(r) {
  return {
    schema_version:3, vleresimi:{ statusi:r.vleresimi?.statusi },
    raporti:{fotot:r.fotot,parametrat_e_vleresuar:r.parametratVleresuar,parametrat_me_gjetje:r.parametratMeGjetje,zonat_e_kontrolluara:r.zonat,zonat_me_ndryshime:r.zonatMeNdryshime},
    ekzaminimi:r.ekzaminimi,
    gjetjet:{permbledhja:r.gjetjet,gjetja_kryesore:r.gjetjaKryesore,gjetja_dyta:r.gjetjaDyta,sipas_zonave:r.zonaLista},
    parametrat:r.parametrat,
    diagnoza:{id:r.diagnozaId,emri:r.diagnoza,latinisht:r.diagnozaLat,niveli:r.niveli,niveli_emri:r.niveliEmri},
    shpjegimi:r.shpjegimi,pa_kujdes:{zbehet:r.paKujdes?.zbehet || '',nuk_zbehet:r.paKujdes?.nukZbehet || '',pas_6_muajsh:r.paKujdes?.pas6Muajsh || ''},
    keshilla:r.keshilla,synimi_28:r.synimi28 || '',termat:r.termat || [],nevojat:r.nevojat || []
  };
}
// DIE ANGEBOTSSPERRE GIBT ES NICHT MEHR - und das ist eine Entscheidung
// des Betreibers, keine vergessene Zeile.
//
// Hier stand reportAllowsOffer(): Ein Befund trug nur dann ein Angebot,
// wenn die Analyse einen Bedarf nannte, der Beurteilungsstatus passte und
// die aerztliche Pruefung bestaetigt war. Zwei dieser drei Bedingungen
// kamen aus der Modellantwort - und keine davon liess sich im Befundbogen
// bearbeiten. Wer in Heart zwei Mittel ankreuzte, verlor sie also an eine
// Bedingung, an die er nicht herankam.
//
// Jetzt entscheidet, was angekreuzt ist. Das ist derselbe Grundsatz, der
// im Freigabeweg schon steht: "Was freigegeben wird, ist was in den
// Feldern STEHT - nicht, was die Automatik erzeugt haette. Sie fuellt vor,
// sie entscheidet nicht."
//
// WAS DAMIT NICHT VERSCHWINDET: Sagt die Analyse, dass sie nicht
// beurteilbar ist oder eine aerztliche Abklaerung verlangt, steht dieser
// Satz weiter auf der Seite - er wird nur nicht mehr zur Sperre. Eine
// Aussage wegnehmen und eine Sperre wegnehmen sind zwei verschiedene
// Dinge; hier faellt nur die Sperre.

// Die Beurteilungsstati, die eine Abklaerung verlangen. Sie sperren
// nichts mehr, aber die Seite sagt es weiterhin.
export const STATUS_ABKLAERUNG = Object.freeze(['i_pavleresueshem', 'kontroll_mjekesor']);

export function brauchtAbklaerung(r) {
  return STATUS_ABKLAERUNG.includes(r?.vleresimi?.statusi);
}

export const PARAMETER_INFO = {
  lezionet: 'Puçrrat aktive janë ndryshime të ngritura në lëkurë. Disa mund të kenë përmbajtje të bardhë ose të verdhë; njollat e sheshta nuk janë e njëjta gjë.',
  inflamacioni: 'Këtu përshkruhen shenjat e dukshme të acarimit, si skuqja rreth puçrrave. Pamja nuk përcakton vetë shkakun dhe nuk tregon nëse ka dhimbje.',
  poret: 'Komedonet janë bllokime të hapjes së folikulit. Mund të duken si pika të errëta ose kokrriza me ngjyrën e lëkurës. Poret e dukshme ose të zgjeruara nuk janë automatikisht të bllokuara.',
  skuqja: 'Eritema është emri mjekësor i skuqjes. Mund të jetë e kufizuar në një vend ose e shtrirë në një zonë. Vetëm skuqja nuk përcakton një diagnozë.',
  njollat: 'Pas acarimit mund të mbeten njolla të sheshta rozë, të kuqe ose kafe. Për të përcaktuar nëse lidhen me puçrra të mëparshme, ndihmon historia e asaj zone.',
  pigmentimi: 'Pigmentimi lidhet me ngjyrën e lëkurës. Këtu përshkruhen ndryshimet e ngjyrës brenda së njëjtës lëkurë; ngjyra juaj natyrale nuk është problem.',
  tekstura: 'Tekstura përshkruan pamjen e sipërfaqes së lëkurës. Poret dhe relievi i imët janë pjesë normale të saj. Një sipërfaqe jo krejt e lëmuar nuk do të thotë domosdoshmërisht shenja.',
  keratinizimi: 'Luspat janë shtresa të holla që shkëputen nga sipërfaqja. Ato mund të shoqërohen me tharje ose acarim, por shkaku nuk përcaktohet vetëm nga pamja.',
  barriera: 'Shtresa mbrojtëse ndihmon të kufizohet humbja e ujit dhe hyrja e substancave irrituese. Funksioni i saj nuk matet nga fotot; pamja e poreve ose shkëlqimi nuk provojnë dëmtim.',
  shenjat: 'Shenjat atrofike janë ulje të sipërfaqes së lëkurës. Poret normale dhe hijet nuk mjaftojnë për t’i përcaktuar. Kur pamja nuk është e qartë, nevojitet vlerësim më i afërt.'
};

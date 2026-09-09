// The v3 boundary is strict; legacy reports continue through the old reader.
export const PARAMETER_IDS = ['lezionet','inflamacioni','poret','skuqja','njollat','pigmentimi','tekstura','keratinizimi','barriera','shenjat'];
export const DIAGNOSE_IDS = ['akne_komedonale','akne_inflamatore','akne_e_perzier','akne_nodulare','hiperpigmentim_pas_inflamacionit','melazma','rozacea','dermatit_seborreik','barriere_e_demtuar','lekure_e_thate','lekure_e_yndyrshme','tekstura_e_pabarabarte','shenja_atrofike','lekure_e_qete','tjeter'];
export const GRADES = ['në rregull','e lehtë','e mesme','e theksuar','e fortë'];
export function validateRaportV3(d) {
  if (!Object.hasOwn(d, 'schema_version')) return;
  const fail = (s) => { throw new Error(`LifeSkin JSON: ${s}`); };
  const str = (v, max, path) => { if (typeof v !== 'string' || v.length > max) fail(`${path}: Text bis ${max} Zeichen erwartet.`); };
  const keys = (o, expected, path) => {
    if (!o || typeof o !== 'object' || Array.isArray(o) || Object.keys(o).some(k => !expected.includes(k)) || expected.some(k => !Object.hasOwn(o,k))) fail(`${path}: Felder stimmen nicht mit v3 überein.`);
  };
  const integer = (v,min,max,path) => { if (!Number.isInteger(v) || v < min || v > max) fail(`${path}: Ganzzahl ${min}–${max} erwartet.`); };
  if (d.schema_version !== 3) fail('Unbekannte schema_version.');
  keys(d,['schema_version','kodi','vleresimi','raporti','ekzaminimi','gjetjet','parametrat','diagnoza','shpjegimi','pa_kujdes','keshilla','synimi_28','termat','nevojat'],'root');
  str(d.kodi,80,'kodi'); if (!d.kodi.trim()) fail('Fallnummer fehlt.');
  keys(d.vleresimi,['statusi','kufizimi'],'vleresimi');
  if (!['i_vleresueshem','i_pjesshem','i_pavleresueshem','kontroll_mjekesor'].includes(d.vleresimi.statusi)) fail('Ungültiger Beurteilungsstatus.');
  str(d.vleresimi.kufizimi,400,'vleresimi.kufizimi');
  if (d.vleresimi.statusi !== 'i_vleresueshem' && !d.vleresimi.kufizimi.trim()) fail('Beurteilungsgrenze fehlt.');
  keys(d.raporti,['fotot','parametrat_e_vleresuar','parametrat_me_gjetje','zonat_e_kontrolluara','zonat_me_ndryshime'],'raporti');
  integer(d.raporti.fotot,1,3,'fotot'); integer(d.raporti.zonat_e_kontrolluara,0,13,'zonat_e_kontrolluara');
  keys(d.gjetjet,['permbledhja','gjetja_kryesore','gjetja_dyta','sipas_zonave'],'gjetjet');
  str(d.gjetjet.permbledhja,300,'permbledhja'); str(d.gjetjet.gjetja_kryesore,80,'gjetja_kryesore'); str(d.gjetjet.gjetja_dyta,80,'gjetja_dyta');
  if (!Array.isArray(d.gjetjet.sipas_zonave) || d.gjetjet.sipas_zonave.length > 5) fail('Maximal fünf Zonenzeilen.');
  for (const z of d.gjetjet.sipas_zonave) { keys(z,['zona','teksti'],'zona'); str(z.zona,40,'zona'); str(z.teksti,160,'zona.teksti'); }
  if (!Array.isArray(d.parametrat) || d.parametrat.length !== 10 || new Set(d.parametrat.map(p=>p.id)).size !== 10) fail('Genau zehn eindeutige Parameter erforderlich.');
  for (const p of d.parametrat) {
    keys(p,['id','emri','termi','thjeshte','vlera','shkalla','grada','nga_vjen'],'parametri');
    if (!PARAMETER_IDS.includes(p.id)) fail('Unbekannte Parameterkennung.');
    for (const k of ['emri','termi','thjeshte','vlera','grada','nga_vjen']) str(p[k], k === 'nga_vjen' ? 250 : 100, `parametri.${k}`);
    if (p.shkalla !== null) integer(p.shkalla,0,4,'shkalla');
    if (p.grada !== (p.shkalla === null ? 'nuk vlerësohet' : GRADES[p.shkalla])) fail('Grad und Stufe widersprechen sich.');
  }
  if (d.raporti.parametrat_e_vleresuar !== d.parametrat.filter(p=>p.shkalla !== null).length || d.raporti.parametrat_me_gjetje !== d.parametrat.filter(p=>p.shkalla > 0).length) fail('Parameterzählung stimmt nicht.');
  if (d.raporti.zonat_me_ndryshime !== d.gjetjet.sipas_zonave.length || d.raporti.zonat_me_ndryshime > d.raporti.zonat_e_kontrolluara) fail('Zonenzählung stimmt nicht.');
  keys(d.diagnoza,['id','emri','latinisht','niveli','niveli_emri'],'diagnoza');
  if (!DIAGNOSE_IDS.includes(d.diagnoza.id)) fail('Unbekannte Diagnosekennung.');
  if (d.diagnoza.niveli !== null) integer(d.diagnoza.niveli,0,4,'diagnoza.niveli');
  for (const k of ['emri','latinisht','niveli_emri']) str(d.diagnoza[k],120,`diagnoza.${k}`);
  if (!Array.isArray(d.shpjegimi) || d.shpjegimi.length > 2) fail('Maximal zwei Erklärungsabsätze.');
  d.shpjegimi.forEach(s=>str(s,240,'shpjegimi'));
  keys(d.pa_kujdes,['zbehet','nuk_zbehet','pas_6_muajsh'],'pa_kujdes');
  Object.values(d.pa_kujdes).forEach(s=>str(s,240,'pa_kujdes'));
  for (const k of ['ekzaminimi','keshilla','synimi_28']) str(d[k],320,k);
  if (!Array.isArray(d.termat) || d.termat.length > 8) fail('Maximal acht Begriffe.');
  const used = new Set();
  for (const t of d.termat) {
    keys(t,['id','shprehja','emri','termi','shpjegimi','te_ju'],'termi');
    for (const k of ['id','shprehja','emri','termi','shpjegimi','te_ju']) str(t[k], ['shpjegimi','te_ju'].includes(k) ? 600 : 100,`termi.${k}`);
    if (!t.id || !t.shprehja || !t.shpjegimi || used.has(t.id)) fail('Leerer oder doppelter Begriff.'); used.add(t.id);
    const texts = [d.gjetjet.permbledhja,...d.gjetjet.sipas_zonave.map(z=>z.teksti),...d.shpjegimi,...d.parametrat.map(p=>p.emri),...Object.values(d.pa_kujdes)];
    if (!texts.some(s=>s.includes(t.shprehja))) fail(`Begriff ${t.id} kommt im Befund nicht vor.`);
  }
  if (!Array.isArray(d.nevojat) || d.nevojat.length > 3) fail('Maximal drei belegbare Bedürfnisse.');
  const roles = new Set();
  for (const n of d.nevojat) {
    keys(n,['roli','produkt_id','gjetja','kerkon','teksti'],'nevoja');
    if (!['kryesor','dytesor','mbrojtes'].includes(n.roli) || roles.has(n.roli)) fail('Ungültige oder doppelte Bedarfsrolle.'); roles.add(n.roli);
    for (const k of ['produkt_id','gjetja','kerkon','teksti']) str(n[k],k === 'teksti' ? 240 : 120,`nevoja.${k}`);
  }
  if (['i_pavleresueshem','kontroll_mjekesor'].includes(d.vleresimi.statusi) && d.nevojat.length) fail('Kein Produktbedarf vor erforderlicher Abklärung.');
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
    schema_version:3, kodi:r.kodi, vleresimi:r.vleresimi,
    raporti:{fotot:r.fotot,parametrat_e_vleresuar:r.parametratVleresuar,parametrat_me_gjetje:r.parametratMeGjetje,zonat_e_kontrolluara:r.zonat,zonat_me_ndryshime:r.zonatMeNdryshime},
    ekzaminimi:r.ekzaminimi,
    gjetjet:{permbledhja:r.gjetjet,gjetja_kryesore:r.gjetjaKryesore,gjetja_dyta:r.gjetjaDyta,sipas_zonave:r.zonaLista},
    parametrat:r.parametrat,
    diagnoza:{id:r.diagnozaId,emri:r.diagnoza,latinisht:r.diagnozaLat,niveli:r.niveli,niveli_emri:r.niveliEmri},
    shpjegimi:r.shpjegimi,pa_kujdes:{zbehet:r.paKujdes?.zbehet || '',nuk_zbehet:r.paKujdes?.nukZbehet || '',pas_6_muajsh:r.paKujdes?.pas6Muajsh || ''},
    keshilla:r.keshilla,synimi_28:r.synimi28 || '',termat:r.termat || [],nevojat:r.nevojat || []
  };
}
export function reportAllowsOffer(r) {
  return r.schemaVersion !== 3 || (r.aerztlichGeprueft === true && ['i_vleresueshem','i_pjesshem'].includes(r.vleresimi?.statusi) && r.nevojat?.length > 0);
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

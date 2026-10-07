// Darstellung des persönlichen Berichts. Freigegebene Befunde, Produkte,
// Preise und der vorhandene Bestellablauf bleiben die Datenquelle.
const el = (tag, klasse, text) => {
  const n = document.createElement(tag);
  if (klasse) n.className = klasse;
  if (text) n.textContent = text;
  return n;
};
const einfach = (text) => String(text || '').replace(/ë/g, 'e').replace(/Ë/g, 'E');

export function kurzsetZeigen(produkte, bilderVon) {
  const liste = document.querySelector('#t-focusset');
  if (!liste) return;
  liste.replaceChildren(...produkte.map((p) => {
    const row = el('li', 'focus-produkt');
    const src = bilderVon(p)[0];
    if (src) {
      const img = el('img'); img.src = src; img.alt = '';
      img.width = 58; img.height = 58; img.decoding = 'async'; row.append(img);
    }
    const text = el('div'); text.append(el('b', null, p.name));
    if (p.inhalt) text.append(el('span', null, `1 × ${p.inhalt}`));
    row.append(text); return row;
  }));
}

export function persoenlicheSeite({ daten, raport, produkte, bilderVon, shop }) {
  if (shop) return;
  document.documentElement.dataset.personalDesign = 'focus';
  const $ = (s) => document.querySelector(s);
  const hero = $('#terapia');
  if (!hero || !$('#t-seti')) return;
  if (!$('#t-focusoffer')) {
    // Ein Gedanke pro Abschnitt: Befund + passendes Produkt, Ziel, Angebot.
    const offer = el('section', 'pjese focus-angebot'); offer.id = 't-focusoffer';
    offer.append(el('p', 'syri', '03 · TERAPIA JOTE'));
    offer.append(el('h2', null, 'Keto produkte jane per ty.'));
    $('#pse')?.after(offer);
    offer.append($('#t-seti'));
    const liste = el('ul', 'focus-set'); liste.id = 't-focusset';
    $('#t-seti .seti__kopf')?.after(liste);

    const detail = el('div', 'focus-detail');
    const hyrja = $('#t-hyrja'); if (hyrja) detail.append(hyrja);
    $('#analiza')?.append(detail);

    const ziel = el('section', 'pjese focus-ziel'); ziel.id = 't-focusziel';
    ziel.append(el('p', 'syri', '02 · CKA SYNOJME'));
    ziel.append(el('h2', null, 'Ja cka duam me arrit.'));
    const zieltext = el('p'); zieltext.id = 't-focuszieltext'; ziel.append(zieltext);
    ziel.append(el('p', 'focus-ziel__note', 'Te ndjekim per 4 jave. Koha e rezultatit varet nga lekura jote.'));
    $('#pse')?.after(ziel);

    const grund = el('section', 'pjese focus-vertrauen'); grund.id = 't-focusreason';
    grund.append(el('p', 'syri', 'KE PROVU SHUME?'));
    grund.append(el('h2', null, 'Kete here, e ke nje plan.'));
    const p = el('p'); p.id = 't-focusreasontext'; grund.append(p);
    const schritte = el('ol', 'focus-prozess');
    for (const [titel, text] of [
      ['E shohim lekuren tende.', 'Shikojme fotot dhe ate qe na ke tregu.'],
      ['Zgjedhim per ty.', 'Secili produkt ka nje pune ne planin tend.'],
      ['Te ndihmojme gjate perdorimit.', 'Nese ke pyetje, na shkruan.']
    ]) { const li = el('li'); li.append(el('b', null, titel), el('p', null, text)); schritte.append(li); }
    grund.append(schritte);
    const garantie = el('a', 'focus-garantie-link', 'Shiko si vlen garancia ↓');
    garantie.href = '#garancia'; grund.append(garantie); offer.after(grund);
    // Anamnese bleibt zugänglich, drängt sich nicht zwischen Befund und Produkt.
    for (const id of ['t-shqetesimi', 't-thate']) {
      const n = $(`#${id}`); if (n) $('#analiza')?.append(n);
    }
    const mjetet = $('#t-mjetet');
    if (mjetet && $('#merrni')) {
      const ansehen = el('details', 'focus-produktdetails');
      ansehen.open = true; ansehen.append(el('summary', null, 'Shiko produktet')); ansehen.append(mjetet); $('#merrni').append(ansehen);
    }
    // Analyse, Paket und Betreuung sind vollständig offen.
    const medien = $('#klientet'); if (medien) offer.after(medien);
    const ergebnisse = $('#rezultate'); if (ergebnisse) offer.before(ergebnisse);
    const entscheidung = $('#vendimi'); if (entscheidung) $('#analiza')?.after(entscheidung);

  }

  const wort = (id, text) => { const n = $(`#${id}`); if (n) n.textContent = text; };
  wort('t-titulli', daten.name ? `${daten.name}, ja cka pame te lekura jote.` : 'Ja cka pame te lekura jote.');
  wort('t-syri', 'ANALIZA JOTE');
  wort('t-mjekuemri', 'E pa Dr. Violeta Gashi');
  wort('t-psesyri', '01 · LEKURA JOTE');
  wort('t-psetitulli', 'Keto pame ne lekuren tende.');
  // Beschriftungen ergänzen; der freigegebene Inhalt bleibt vollständig.
  for (const li of $('#t-gjetjet')?.children || []) {
    if (!li.querySelector('.focus-befund-label')) {
      li.querySelector('div')?.prepend(el('p', 'focus-befund-label', 'Te ti pame'));
      li.querySelector('.zgjidhja')?.before(el('p', 'focus-loesung-label', 'Per kete kemi zgjedh'));
    }
  }
  const ziel = einfach(raport.synimi28 || raport.shitja?.dita_28 || '');
  wort('t-focuszieltext', ziel); $('#t-focusziel').hidden = !ziel || !produkte.length;
  $('#t-focusoffer').hidden = !produkte.length; $('#t-focusreason').hidden = !produkte.length;
  wort('t-focusreasontext', daten.ohneBild
    ? 'Plani eshte zgjedh sipas asaj qe na ke tregu. Lart e sheh cka ben secili produkt per ty.'
    : 'Plani eshte zgjedh sipas fotove dhe asaj qe na ke tregu. Lart e sheh cka ben secili produkt per ty.');
  wort('t-setititull', 'Paketa jote'); wort('t-setinen', 'Produktet + plani i perdorimit');
  wort('t-porosititulli', 'Ku ta dergojme pakon?');
  for (const [index, title] of ['A eshte per mua?', 'Kur e shoh ndryshimin?', 'Si paguaj?', 'Po nese nuk jam i kenaqur?'].entries()) {
    const summary = document.querySelectorAll('#pyetjet > details > summary')[index];
    if (summary) summary.textContent = title;
  }
  if (produkte.length) wort('t-faq2', 'Te ndjekim per 4 jave dhe i krahasojme fotot. Koha e rezultatit varet nga lekura jote.');
  const texte = [
    ['#pyetjet>.syri', 'A KE PYETJE?'], ['#pyetjet>h2', 'Ja pergjigjet.'],
    ['#merrni>.syri', 'NE PAKON TENDE'], ['#merrni>h2', 'Produktet. Plani. Ndihma.'],
    ['#ditet>.syri', 'HAP PAS HAPI'], ['#ditet>h2', 'Nuk je vetem.'],
    ['#analiza>h2', 'Krejt analiza jote.']
  ];
  for (const [selector, text] of texte) { const n = $(selector); if (n) n.textContent = text; }
  for (const details of document.querySelectorAll('#analiza details')) details.open = true;
  // Kosovo-Albanisch ohne ë, auch bei dynamisch gelieferten Texten.
  for (const n of document.querySelectorAll('#t-faqja *, #korb *, #porosia *, #leiste *, .kopf *')) {
    for (const child of n.childNodes || []) if (child.nodeType === 3) child.textContent = einfach(child.textContent);
  }
  kurzsetZeigen([...produkte].sort((a, b) => (Number(a.perdorimi?.hapi) || 9) - (Number(b.perdorimi?.hapi) || 9)), bilderVon);
}

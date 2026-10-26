// Only answer-based Fast reports use this concise presentation.
export function fastSeite(root, data, products) {
  if (data?.fast?.version !== 1) return;
  const get = selector => root.querySelector(selector);
  const text = (selector, value) => { const el = get(selector); if (el) el.textContent = value; };
  const hide = selector => { const el = get(selector); if (el) el.hidden = true; };
  text('#t-setinen', 'Set i përzgjedhur automatikisht sipas përgjigjeve tuaja');
  text('#t-hyrja', data.raport?.shitja?.hyrja || data.raport?.gjetjet || '');
  text('#t-faq1', 'Seti është përzgjedhur sipas shqetësimeve, tipit të lëkurës dhe kujdesit që na treguat. Nuk është diagnozë mjekësore.');
  text('#t-faq2', 'Reagimi i lëkurës ndryshon nga personi në person. Nisni gradualisht dhe ndiqni udhëzimet e produkteve.');
  text('#t-analizasyri', 'Analiza e plotë');
  text('#t-analizatitulli', 'Bazuar në përgjigjet tuaja.');
  text('#t-metoda', '');
  hide('#t-metodablock');
  get('#t-metodablock')?.removeAttribute('open');
  text('#t-permbledhja', data.raport?.gjetjet || '');
  text('#t-keshillablock strong', 'Kujdesi i përditshëm');
  text('#t-psetitulli', 'Pse këto produkte për ju');
  text('#t-vleresimi', '');
  hide('#t-vleresimi');
  const reasons = get('#t-gjetjet');
  if (reasons) {
    const doc = reasons.ownerDocument;
    reasons.replaceChildren(...products.map(p => {
      const li = doc.createElement('li');
      const heading = doc.createElement('h3');
      heading.textContent = p.name;
      const line = doc.createElement('p');
      line.textContent = (data.produkte || []).find(x => x.id === p.id)?.satz || '';
      li.append(heading, line);
      return li;
    }));
    const block = get('#pse');
    if (block) block.hidden = false;
  }
  const chips = get('#t-seticipa');
  if (chips) {
    const doc = chips.ownerDocument;
    chips.replaceChildren(...[`${products.length} produkte`, 'Plan personal'].map(value => {
      const li = doc.createElement('li'); li.textContent = value; return li;
    }));
  }
  for (const selector of ['#t-diagnoza', '#t-niveli', '#t-zonatblock', '#t-parametratblock', '#t-pakujdesblock', '#t-kontroll', '#t-mjeku']) hide(selector);
}

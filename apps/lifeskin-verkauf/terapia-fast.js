// Only answer-based Fast reports use this concise presentation.
export function fastSeite(root, data, products) {
  if (data?.fast?.version !== 1) return;
  const get = selector => root.querySelector(selector);
  const text = (selector, value) => { const el = get(selector); if (el) el.textContent = value; };
  const hide = selector => { const el = get(selector); if (el) el.hidden = true; };
  text('#t-setinen', 'Set i përzgjedhur automatikisht sipas përgjigjeve tuaja');
  const intro = String(data.raport?.shitja?.hyrja || data.raport?.gjetjet || '').trim();
  text('#t-hyrja', intro.replace(/^Bazuar në përgjigjet tuaja(?:,\s*përmendët)?:\s*/i, 'Seti juaj për lëkurën tuaj: '));
  // Show the customer's own thumbnails independently of the hidden author row.
  const photos = get('#t-fotot');
  const hero = get('.hero__karte');
  const heading = get('#t-hyrja');
  if (photos && hero && heading && photos.parentNode !== hero) hero.insertBefore(photos, heading);
  photos?.classList.add('fast-hero-fotos');
  get('#t-fototstapel')?.removeAttribute('data-zeige');
  text('#t-faq1', 'Seti është përzgjedhur sipas shqetësimeve, tipit të lëkurës dhe kujdesit që na treguat. Nuk është diagnozë mjekësore.');
  text('#t-faq2', 'Reagimi i lëkurës ndryshon nga personi në person. Nisni gradualisht dhe ndiqni udhëzimet e produkteve.');
  text('#t-analizasyri', 'Analiza e plotë');
  text('#t-analizatitulli', 'Bazuar në përgjigjet tuaja.');
  text('#t-metoda', '');
  hide('#t-metodablock');
  get('#t-metodablock')?.removeAttribute('open');
  text('#t-permbledhja', data.raport?.gjetjet || '');
  text('#t-keshillablock strong', 'Kujdesi i përditshëm');
  text('#t-vleresimi', '');
  hide('#t-vleresimi');
  hide('#pse');
  hide('#vendimi');
  // Reuse the original FAQ nodes so their controls and answers stay wired.
  const faq = get('#pyetjet');
  const packet = get('#t-seti');
  if (faq && packet?.parentNode) {
    faq.classList.add('fast-paket-faq');
    if (packet.nextElementSibling !== faq) packet.parentNode.insertBefore(faq, packet.nextSibling);
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

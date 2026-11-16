// Price each source offer once, even when several of its files are selected.
export function bundleComparison(page, bundle) {
  const remaining = new Set(bundle.imageIds);
  let cents = 0, partial = false;
  for (const id of new Set(bundle.sourceIds || [])) {
    const source = page.products?.find(p => p.id === id && !p.bundle && p.active !== false);
    if (!source || !Number.isSafeInteger(source.priceCents)) return null;
    if (!source.imageIds.some(file => remaining.has(file))) continue;
    partial ||= source.imageIds.some(file => !bundle.imageIds.includes(file));
    source.imageIds.forEach(file => remaining.delete(file));
    cents += source.priceCents;
  }
  return remaining.size ? null : {cents, partial};
}

export function bundleOverlap(a, b) {
  return (a.bundle || b.bundle) && a.imageIds?.some(file => b.imageIds?.includes(file));
}

export function unavailableCreatorProducts(page, sold) {
  const ids = new Set(sold.map(line => line.id));
  for (const product of page.products || []) {
    if (sold.some(line => bundleOverlap(product, line))) ids.add(product.id);
  }
  return ids;
}

export function makeCreatorBundle(page, {id, existing, picks, priceCents, showDiscount}) {
  if (page?.kind !== 'shop' || page.deleting) throw Error('Business nicht verfügbar.');
  if (!picks.length || !Number.isSafeInteger(priceCents) || priceCents < 1 || priceCents > 1000000)
    throw Error('Bitte Medien auswählen und einen gültigen Verkaufspreis eingeben.');
  if (existing && !page.products.some(p => p.bundle && p.id === id)) throw Error('Bundle wurde entfernt.');
  if (!existing && page.products.length >= 100) throw Error('Maximal 100 Angebote pro Shop.');
  const files = new Set(), sources = new Set();
  for (const {sourceId,file} of picks) {
    const source = page.products.find(p => p.id === sourceId && !p.bundle && p.active !== false);
    if (!source?.imageIds.includes(file) || !page.photoIds.includes(file)) throw Error('Die Medienauswahl hat sich geändert.');
    if (files.has(file)) continue;
    files.add(file);
    sources.add(sourceId);
  }
  const imageIds = [...files];
  const videos = imageIds.filter(file => page.mediaTypes?.[file] === 'video' || page.media?.[file]?.mediaType === 'video').length;
  const counts = [imageIds.length > videos && (imageIds.length-videos)+' foto', videos && videos+' video'].filter(Boolean);
  return {id, bundle:true, active:true, title:'Pako me '+counts.join(' dhe '), priceCents, imageIds, sourceIds:[...sources], showDiscount};
}

import { reviewBilderNormalisieren, reviewFotoUrl } from './lifeskin-shop-bewertungen.js';

export async function reviewGalerie(roh, start = 0, { dokument = globalThis.document, laden = async b => reviewFotoUrl(b) } = {}) {
  const bilder = reviewBilderNormalisieren(roh);
  if (!bilder.length || !dokument) return;
  if (!dokument.querySelector('[data-review-gallery-css]')) {
    const css = dokument.createElement('link'); css.rel = 'stylesheet'; css.href = '/shared/lifeskin-review-gallery.css'; css.dataset.reviewGalleryCss = ''; dokument.head.append(css);
  }
  const vorher = dokument.activeElement;
  const dialog = dokument.createElement('dialog'); dialog.className = 'review-gallery';
  dialog.setAttribute('aria-label', 'Fotot e vleresimit');
  dialog.innerHTML = '<div class="review-gallery-bar"><span aria-live="polite"></span><button type="button" data-close aria-label="Mbyll">×</button></div><div class="review-gallery-stage"><button type="button" data-prev aria-label="Foto e meparshme">‹</button><img alt="Foto nga klienti"><button type="button" data-next aria-label="Foto tjeter">›</button><p role="status"></p></div><div class="review-gallery-thumbs"></div>';
  dokument.body.append(dialog);
  const main = dialog.querySelector('.review-gallery-stage img');
  const status = dialog.querySelector('[role=status]');
  const cache = new Map(); let index = Math.max(0, Math.min(start, bilder.length - 1)), generation = 0, closed = false;
  const url = async i => {
    if (!cache.has(i)) cache.set(i, Promise.resolve(laden(bilder[i])));
    try { const result = await cache.get(i); if (!result) throw new Error('empty'); return result; }
    catch (e) { cache.delete(i); throw e; }
  };
  const thumbs = bilder.map((b, i) => {
    const button = dokument.createElement('button'); button.type = 'button'; button.setAttribute('aria-label', `Foto ${i + 1}`);
    const img = dokument.createElement('img'); img.alt = ''; img.width = b.breite; img.height = b.hoehe;
    button.append(img); button.addEventListener('click', () => { index = i; void show(); }); dialog.querySelector('.review-gallery-thumbs').append(button);
    void url(i).then(src => { if (!closed) img.src = src; }).catch(() => {});
    return button;
  });
  const show = async () => {
    const turn = ++generation;
    main.hidden = true; status.textContent = 'Duke hapur foton…';
    dialog.querySelector('.review-gallery-bar span').textContent = `${index + 1} / ${bilder.length}`;
    thumbs.forEach((button, i) => button.setAttribute('aria-current', i === index ? 'true' : 'false'));
    dialog.querySelector('[data-prev]').hidden = dialog.querySelector('[data-next]').hidden = bilder.length < 2;
    try { const src = await url(index); if (closed || turn !== generation) return; main.src = src; main.hidden = false; status.textContent = ''; }
    catch { if (!closed && turn === generation) status.textContent = 'Nuk u hap. Provo perseri.'; }
  };
  const move = delta => { index = (index + delta + bilder.length) % bilder.length; void show(); };
  dialog.querySelector('[data-prev]').addEventListener('click', () => move(-1));
  dialog.querySelector('[data-next]').addEventListener('click', () => move(1));
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); } });
  let touch;
  main.addEventListener('touchstart', event => { touch = event.touches[0]?.clientX; }, { passive: true });
  main.addEventListener('touchend', event => { const x = event.changedTouches[0]?.clientX; if (Number.isFinite(touch) && Math.abs(x - touch) > 45) move(x < touch ? 1 : -1); touch = undefined; }, { passive: true });
  main.addEventListener('error', () => { status.textContent = 'Nuk u hap. Provo perseri.'; });
  dialog.addEventListener('close', () => {
    closed = true; generation++;
    for (const promise of cache.values()) void promise.then(src => { if (src.startsWith('blob:')) URL.revokeObjectURL(src); }).catch(() => {});
    dialog.remove(); vorher?.focus?.({ preventScroll: true });
  }, { once: true });
  dialog.showModal(); void show();
}

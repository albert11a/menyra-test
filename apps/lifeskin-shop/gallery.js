// Presentation controls only: existing shop.js owns case loading and ordering.
const rail = document.getElementById('proof-bahn');
const previous = document.querySelector('[data-proof-prev]');
const next = document.querySelector('[data-proof-next]');
const count = document.getElementById('proof-count');
if (rail && previous && next && count) {
  const state = () => {
    const cards = [...rail.children].filter(card => !card.classList.contains('proof-rast--leer'));
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : rail.clientWidth;
    const index = Math.min(Math.max(0, cards.length - 1), Math.max(0, Math.round(rail.scrollLeft / Math.max(1, step))));
    previous.disabled = cards.length < 2 || index === 0;
    next.disabled = cards.length < 2 || index === cards.length - 1;
    count.textContent = cards.length ? `${index + 1} / ${cards.length} · ${cards.length > 1 ? 'Rrëshqit për më shumë' : 'Para / Pas'}` : 'Duke ngarkuar rastet…';
    return { cards, step, index };
  };
  const move = direction => {
    const { cards, step, index } = state();
    const target = Math.max(0, Math.min(cards.length - 1, index + direction));
    rail.scrollTo({ left: target * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  rail.addEventListener('keydown', event => {
    if (event.target !== rail || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  rail.addEventListener('scroll', state, { passive: true });
  new MutationObserver(state).observe(rail, { childList: true });
  new ResizeObserver(state).observe(rail);
  state();
}

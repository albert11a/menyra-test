// Presentation controls for the existing Heart media and original message rails.
// No fetching, ordering, analytics or pixel calls belong here.
export function railControls(controls, rail) {
  if (!controls || !rail) return;
  const prev = controls.querySelector('[data-rail-prev]');
  const next = controls.querySelector('[data-rail-next]');
  const count = controls.querySelector('[data-rail-count]');
  const reduced = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const update = () => {
    const cards = [...rail.children].filter(card => !card.classList.contains('ig-erste'));
    controls.hidden = !cards.length;
    if (!cards.length) return;
    const left = rail.scrollLeft;
    const firstOffset = cards[0].offsetLeft;
    const index = cards.reduce((best, card, i) => Math.abs(card.offsetLeft - firstOffset - left) < Math.abs(cards[best].offsetLeft - firstOffset - left) ? i : best, 0);
    prev.disabled = left <= 2;
    next.disabled = left >= rail.scrollWidth - rail.clientWidth - 2;
    count.textContent = `${index + 1} / ${cards.length}`;
  };
  const move = direction => {
    rail.scrollBy({ left: direction * rail.clientWidth, behavior: reduced() ? 'auto' : 'smooth' });
  };
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  rail.addEventListener('scroll', update, { passive: true });
  rail.addEventListener('keydown', event => {
    if (event.target !== rail || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  const observer = new MutationObserver(update);
  observer.observe(rail, { childList: true });
  const resize = new ResizeObserver(update);
  resize.observe(rail);
  update();
}
if (typeof document !== 'undefined') {
  for (const controls of document.querySelectorAll('#ls-einstieg [data-rail-controls]')) {
    const rail = controls.dataset.railControls === 'messages'
      ? document.querySelector('#klientet .message-rail')
      : document.getElementById(controls.dataset.railControls);
    railControls(controls, rail);
  }
}

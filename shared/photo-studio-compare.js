const landscape = dimensions => dimensions.width / dimensions.height;
const mobile = () => matchMedia('(max-width: 680px)').matches;

export function studioCompare({ before, after, beforeImage, afterImage, width, height, editedWidth, editedHeight }, { beforeLabel = 'Original', afterLabel = 'MNYRA Edit', missing = 'Fotoja është në përpunim.' } = {}) {
  const align = after && Math.abs(landscape({ width, height }) / landscape({ width: editedWidth, height: editedHeight }) - 1) <= 0.008;
  const wrapper = document.createElement('div');
  wrapper.className = 'studio-compare';
  wrapper.innerHTML = `<div class="studio-comparison">
    <figure><img alt=""><figcaption></figcaption></figure>
    <figure>${after ? '<img alt="">' : '<div class="studio-wait"></div>'}<figcaption></figcaption></figure>
  </div>${after ? `<div class="studio-compare-controls">
    <button type="button" data-compare="before">Para</button><button type="button" data-compare="after">Pas</button>
    ${align ? '<button type="button" data-compare="slider">Krahaso</button>' : ''}
    <button type="button" data-compare="side">1 · 2</button>
    ${align ? '<label class="studio-range" hidden>Krahaso <input type="range" min="0" max="100" value="50"></label>' : ''}
  </div>` : ''}`;
  const [left, right] = wrapper.querySelectorAll('figure');
  const comparison = wrapper.querySelector('.studio-comparison');
  const setImage = (figure, url, label, decoded) => {
    const img = figure.querySelector('img');
    if (decoded && img) { decoded.alt = label; img.replaceWith(decoded); }
    else if (img) { img.src = url; img.alt = label; img.decoding = 'async'; }
    figure.querySelector('figcaption').textContent = label;
  };
  setImage(left, before, beforeLabel, beforeImage);
  setImage(right, after, afterLabel, afterImage);
  if (!after) {
    right.querySelector('.studio-wait').textContent = missing;
    return wrapper;
  }
  const range = wrapper.querySelector('input');
  const buttons = [...wrapper.querySelectorAll('button')];
  const mode = value => {
    comparison.dataset.mode = value;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.compare === value));
    if (range) range.parentElement.hidden = value !== 'slider';
  };
  for (const button of buttons) button.onclick = () => mode(button.dataset.compare);
  if (range) {
    range.oninput = () => comparison.style.setProperty('--split', range.value + '%');
    const move = event => {
      const bounds = comparison.getBoundingClientRect();
      range.value = Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100));
      range.oninput();
    };
    comparison.onpointerdown = event => {
      if (comparison.dataset.mode !== 'slider' || event.button !== 0) return;
      comparison.setPointerCapture(event.pointerId);
      move(event);
    };
    comparison.onpointermove = event => {
      if (comparison.hasPointerCapture(event.pointerId)) move(event);
    };
  }
  mode(mobile() ? align ? 'slider' : 'after' : 'side');
  return wrapper;
}

export async function decodeStudioComparison(image, cachedOriginal) {
  const load = async url => {
    if (!url) return null;
    const img = new Image();
    img.decoding = 'async';
    img.draggable = false;
    img.src = url;
    await img.decode();
    return img;
  };
  const [beforeImage, afterImage] = await Promise.all([cachedOriginal || load(image.before), load(image.after)]);
  return { ...image, beforeImage, afterImage };
}

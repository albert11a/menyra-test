import { STUDIO_PART_BYTES } from './photo-studio.js';

export async function studioRequest(op, data = {}, auth = '') {
  const response = await fetch('/api/photo-studio', {
    method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
    body: JSON.stringify({ op, ...data }),
    signal: AbortSignal.timeout(data.variant?.endsWith('-archive') ? 300000 : 90000)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(Error(result.error || 'Ju lutemi, provo përsëri.'), { status: response.status });
  return result;
}

export async function putStudioFile(url, file, progress) {
  for (let offset = 0; offset < file.size; offset += STUDIO_PART_BYTES) {
    const end = Math.min(offset + STUDIO_PART_BYTES, file.size);
    const bytes = new Uint8Array(await file.slice(offset, end).arrayBuffer());
    let binary = '';
    for (let start = 0; start < bytes.length; start += 32768) {
      binary += String.fromCharCode(...bytes.subarray(start, start + 32768));
    }
    await new Promise((resolve, reject) => {
      const xhr = new globalThis.XMLHttpRequest();
      xhr.open('POST', url);
      xhr.timeout = 90000;
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.upload.onprogress = event => {
        if (event.lengthComputable) progress(Math.round((offset + bytes.length * event.loaded / event.total) / file.size * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(Error('Ngarkimi u ndërpre. Provo përsëri.'));
      };
      xhr.onerror = xhr.ontimeout = () => reject(Error('Kontrollo lidhjen dhe provo përsëri.'));
      xhr.send(JSON.stringify({ index: offset / STUDIO_PART_BYTES, data: btoa(binary) }));
    });
    progress(Math.round(end / file.size * 100));
  }
}

export function studioDownload({ url }) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.referrerPolicy = 'no-referrer';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

export function ensureStudioStyles() {
  if (document.querySelector('link[data-studio-css]')) return;
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/apps/content-creator/photo-studio.css';
  style.dataset.studioCss = '';
  document.head.append(style);
}

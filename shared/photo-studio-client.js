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

export function putStudioFile(url, file, progress) {
  return new Promise((resolve, reject) => {
    const xhr = new globalThis.XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.timeout = 600000;
    xhr.setRequestHeader('If-None-Match', '*');
    xhr.upload.onprogress = event => progress(event.lengthComputable ? Math.round(event.loaded / event.total * 100) : 0);
    xhr.onload = () => {
      // A previous successful PUT can lose its response. Only the server's
      // accept step verifies that this immutable slot contains a valid file.
      if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 412) resolve();
      else reject(Error('Ngarkimi u ndërpre. Provo përsëri.'));
    };
    xhr.onerror = xhr.ontimeout = () => reject(Error('Kontrollo lidhjen dhe provo përsëri.'));
    xhr.send(file);
  });
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

// Build-only: preserve the storefront cascade while removing blocking requests.
export async function inlineShopFirstPaint(html, readAsset) {
  const links = [...html.matchAll(/<link rel="stylesheet" href="(\/apps\/lifeskin[^"?]+\.css)"\s*\/?>/g)];
  for (const [tag, path] of links) {
    const css = await readAsset(path);
    // Inlined sheets resolve relative URLs against the page. Fail the build
    // if a future stylesheet introduces an asset that needs rewriting.
    if (/@import\b/i.test(css) || /url\(\s*["']?(?!data:|https?:|\/|#)[^\s"')]/i.test(css)) {
      throw new Error(`Shop stylesheet requires URL rewriting: ${path}`);
    }
    html = html.replace(tag, () => `<style data-shop-style="${path}">${css.replace(/<\/style/gi, '<\\/style')}</style>`);
  }
  const tag = '<script src="/shared/lifeskin-still.js"></script>';
  if (html.includes(tag)) {
    const js = await readAsset('/shared/lifeskin-still.js');
    html = html.replace(tag, () => `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>`);
  }
  return html;
}

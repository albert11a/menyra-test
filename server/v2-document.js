import { readFile } from "node:fs/promises";
import { renderPage, esc } from "../apps/mnyra-v2/view.js";
import { snapshot } from "./v2-business.js";
import { v2Store } from "./v2-store.js";

let shell;
function template() {
  return (shell ||= readFile(
    new URL("../dist/apps/mnyra-v2/index.html", import.meta.url),
    "utf8",
  )
    .catch(() =>
      readFile(new URL("../apps/mnyra-v2/index.html", import.meta.url), "utf8"),
    )
    .catch((e) => {
      shell = undefined;
      throw e;
    }));
}
export async function restaurantDocument(slug, store = v2Store) {
  const [page, html] = await Promise.all([
    store().then((repo) => snapshot(repo, slug)),
    template(),
  ]);
  return html
    .replace(
      "<title>MNYRA</title>",
      () => "<title>" + esc(page.name) + " · MNYRA</title>",
    )
    .replace("<!--profile-->", () => renderPage(page))
    .replace(
      /(<script id="restaurant" type="application\/json">)\s*\{\}\s*(<\/script>)/,
      (_, open, close) =>
        open + JSON.stringify(page).replaceAll("<", "\\u003c") + close,
    );
}

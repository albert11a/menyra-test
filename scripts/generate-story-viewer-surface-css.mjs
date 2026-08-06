// Erzeugt die Story-Viewer-Oberflaechen-CSS als Modul aus der EINZIGEN Quelle
// apps/menyra-social/story/index.html.
//
// Warum: der Business-Composer zeigt eine Vorschau "so sieht die Story aus,
// wenn man sie oeffnet". Diese Vorschau darf nicht nachgebaut sein, sonst
// laeuft sie irgendwann vom echten Viewer weg. Also werden genau die Regeln,
// die das Aussehen eines Reels bestimmen, hier abgeleitet und unter
// `.mnyra-story-surface` eingerueckt.
//
// Aufruf: `node scripts/generate-story-viewer-surface-css.mjs`
// Der zugehoerige Test (tests/story-viewer-surface-css.test.mjs) leitet
// dieselben Regeln erneut ab und schlaegt fehl, sobald index.html sich
// aendert, ohne dass dieses Skript neu gelaufen ist.

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));

export const STORY_PAGE_PATH = "apps/menyra-social/story/index.html";
export const SURFACE_MODULE_PATH = "apps/menyra-social/core/stories/story-viewer-surface-css.js";
export const SURFACE_SCOPE = ".mnyra-story-surface";

// Genau die Regeln, die das Aussehen eines Reels bestimmen. Die Seiten-Regeln
// (html/body-Hoehe, .reels-Scrollcontainer) bleiben bewusst draussen: die
// Vorschau bringt ihre eigene Buehne mit.
export const STORY_SURFACE_SELECTORS = Object.freeze([
  "*",
  ".reel",
  ".reel iframe, .reel video, .reel img.reel-image",
  ".reel::after",
  ".vignette",
  ".topbar",
  ".topbarLeft",
  ".topbarRight",
  ".btnIcon",
  ".btnIcon:active",
  '.btnIcon[data-story-sound-state="on"]',
  ".brandPill",
  ".brandLogo",
  ".brandName",
  ".rail",
  ".railBtn",
  ".railIcon",
  ".content",
  ".contentTitle",
  ".contentDesc",
  ".productCard",
  ".productCard:hover",
  ".productCard:active",
  ".productCardThumb",
  ".productCardThumbImg",
  ".productCardInfo",
  ".productCardName",
  ".productCardPrice",
  ".productCardBtn"
]);

function parseStyleRules(html = "") {
  const styleMatch = /<style>([\s\S]*?)<\/style>/.exec(String(html || ""));
  if (!styleMatch) throw new Error("story/index.html: kein <style>-Block gefunden");
  const css = styleMatch[1].replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = new Map();
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    rules.set(match[1].trim().replace(/\s+/g, " "), match[2].trim());
  }
  return rules;
}

function formatBlock(selector = "", declarations = "") {
  const body = declarations
    .split(";")
    .map((entry) => entry.trim().replace(/\s+/g, " "))
    .filter(Boolean)
    .map((entry) => `  ${entry};`)
    .join("\n");
  return `${selector} {\n${body}\n}`;
}

function scopeSelector(selector = "") {
  return selector
    .split(",")
    .map((part) => `${SURFACE_SCOPE} ${part.trim()}`)
    .join(",\n");
}

// Pur + testbar: aus dem HTML der Story-Seite die eingerueckte CSS bauen.
export function buildStoryViewerSurfaceCssCore(html = "") {
  const rules = parseStyleRules(html);
  const blocks = [];
  const rootVars = rules.get(":root");
  if (!rootVars) throw new Error("story/index.html: :root fehlt");
  blocks.push(formatBlock(SURFACE_SCOPE, rootVars));
  const bodyRule = rules.get("body");
  if (!bodyRule) throw new Error("story/index.html: body fehlt");
  blocks.push(formatBlock(SURFACE_SCOPE, bodyRule));
  STORY_SURFACE_SELECTORS.forEach((selector) => {
    const declarations = rules.get(selector);
    if (declarations === undefined) {
      throw new Error(`story/index.html: Regel "${selector}" fehlt`);
    }
    blocks.push(formatBlock(scopeSelector(selector), declarations));
  });
  return blocks.join("\n");
}

// Nur diese Abweichungen trennen Vorschau und echte Seite: das Reel fuellt in
// der Vorschau die Buehne statt der Geraetehoehe, und nichts darin ist
// anklickbar.
const STAGE_CSS = `${SURFACE_SCOPE} {
  position: relative;
  display: block;
  overflow: hidden;
}
${SURFACE_SCOPE} .reel {
  height: 100%;
  cursor: default;
}
${SURFACE_SCOPE} .reel::after {
  pointer-events: none;
}
${SURFACE_SCOPE} .topbarLeft,
${SURFACE_SCOPE} .topbarRight,
${SURFACE_SCOPE} .rail,
${SURFACE_SCOPE} .content {
  pointer-events: none;
}`;

export function buildStoryViewerSurfaceModuleCore(html = "") {
  return `// GENERIERT - nicht von Hand aendern.
// Quelle: ${STORY_PAGE_PATH}
// Neu erzeugen: node scripts/generate-story-viewer-surface-css.mjs
//
// Die Oberflaechen-Regeln des Story-Viewers, eingerueckt unter
// "${SURFACE_SCOPE}". Der Business-Composer baut damit seine Vorschau
// "so sieht die Story aus, wenn man sie oeffnet" - mit exakt denselben
// Deklarationen wie die echte Story-Seite.

export const STORY_VIEWER_SURFACE_CLASS = "${SURFACE_SCOPE.slice(1)}";

export const STORY_VIEWER_SURFACE_CSS = \`
${buildStoryViewerSurfaceCssCore(html)}

${STAGE_CSS}
\`;
`;
}

const isDirectRun = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  const html = await readFile(resolve(repoRoot, STORY_PAGE_PATH), "utf8");
  await writeFile(resolve(repoRoot, SURFACE_MODULE_PATH), buildStoryViewerSurfaceModuleCore(html), "utf8");
  console.log(`[mnyra] ${SURFACE_MODULE_PATH} neu erzeugt.`);
}

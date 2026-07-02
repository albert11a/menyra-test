import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const repoRoot = path.resolve(import.meta.dirname, "..");
const socialRoot = path.join(repoRoot, "apps", "menyra-social");
const sourceFiles = [
  path.join(socialRoot, "social-app.js"),
  path.join(socialRoot, "core", "menu", "menu-modal-render-utils.js"),
  path.join(socialRoot, "core", "menu", "customer-focus-modal-render-utils.js"),
  path.join(socialRoot, "core", "overlays", "overlay-basic-render-utils.js"),
  path.join(socialRoot, "core", "app-shell", "shell-dom-runtime-controller.js")
];

const criticalInlineIcons = [
  "camera",
  "external-link",
  "message-square",
  "send",
  "utensils"
];

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function toPascalIconName(name) {
  return String(name || "")
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function loadLocalLucideIconNames() {
  const code = read(path.join(socialRoot, "vendor", "lucide.min.js"));
  const context = { window: {}, globalThis: {} };
  context.self = context.window;
  vm.createContext(context);
  vm.runInContext(code, context);
  const lucide = context.window.lucide || context.lucide || context.globalThis.lucide;
  return new Set(Object.keys(lucide?.icons || {}));
}

function extractLiteralIconNames() {
  const refs = new Set();
  for (const file of sourceFiles) {
    const text = read(file);
    for (const match of text.matchAll(/\bicon(?:Fn)?\(\s*(["'`])([^"'`$]+)\1/g)) {
      refs.add(match[2].trim());
    }
    for (const match of text.matchAll(/data-lucide\s*=\s*(["'])([^"']+)\1/g)) {
      refs.add(match[2].trim());
    }
  }
  return Array.from(refs).filter(Boolean).sort();
}

function extractInlineIconNames() {
  const text = read(path.join(socialRoot, "social-app.js"));
  const iconObjectMatch = text.match(/const INLINE_LUCIDE_ICON_NODES = Object\.freeze\(\{([\s\S]*?)\n\}\);/);
  assert.ok(iconObjectMatch, "INLINE_LUCIDE_ICON_NODES block should exist");
  const inlineNames = new Set(Array.from(iconObjectMatch[1].matchAll(/"([^"]+)":\s*Object\.freeze/g), (match) => match[1]));
  for (const match of iconObjectMatch[1].matchAll(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*:\s*Object\.freeze/gm)) {
    inlineNames.add(match[1]);
  }
  return inlineNames;
}

test("modal and drawer literal lucide icon names exist in the local lucide build", () => {
  const lucideNames = loadLocalLucideIconNames();
  const missing = extractLiteralIconNames()
    .filter((name) => !lucideNames.has(toPascalIconName(name)));

  assert.deepEqual(missing, []);
});

test("critical modal and menu drawer icons render inline without waiting for lucide hydration", () => {
  const inlineNames = extractInlineIconNames();
  const missingInline = criticalInlineIcons.filter((name) => !inlineNames.has(name));

  assert.deepEqual(missingInline, []);
});

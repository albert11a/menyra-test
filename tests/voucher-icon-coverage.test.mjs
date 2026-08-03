import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repoRoot = path.resolve(import.meta.dirname, "..");
const socialRoot = path.join(repoRoot, "apps", "menyra-social");
const voucherRoot = path.join(socialRoot, "core", "vouchers");

const voucherSourceFiles = [
  path.join(voucherRoot, "voucher-customer-render-utils.js"),
  path.join(voucherRoot, "voucher-admin-render-utils.js"),
  path.join(voucherRoot, "voucher-view-controller.js")
];

function read(file) {
  return fs.readFileSync(file, "utf8");
}

// Namen, die die Ofertat-Flaechen an icon() uebergeben - als Literal im Aufruf
// oder als Feld einer Karten-/Aktionsliste.
function collectVoucherIconNames() {
  const names = new Set();
  for (const file of voucherSourceFiles) {
    const text = read(file);
    for (const match of text.matchAll(/icon\(\s*"([a-z0-9-]+)"/g)) names.add(match[1]);
    for (const match of text.matchAll(/\bicon:\s*"([a-z0-9-]+)"/g)) names.add(match[1]);
  }
  // Der Drawer-Eintrag fuer den Business-Tab liegt ausserhalb der Voucher-Module.
  const shellText = read(path.join(socialRoot, "core", "app-shell", "shell-dom-runtime-controller.js"));
  const offersNav = shellText.match(/id:\s*"ofertatbiznes"[^}]*icon:\s*"([a-z0-9-]+)"/);
  if (offersNav) names.add(offersNav[1]);
  return names;
}

function collectInlineIconRegistry() {
  const text = read(path.join(socialRoot, "social-app.js"));
  const start = text.indexOf("const INLINE_LUCIDE_ICON_NODES");
  const end = text.indexOf("function buildIconAttributeString");
  assert.ok(start >= 0 && end > start, "inline icon registry block must be findable");
  const block = text.slice(start, end);
  const names = new Set();
  for (const match of block.matchAll(/^\s*"?([a-z0-9-]+)"?:\s*Object\.freeze\(\[/gm)) names.add(match[1]);
  return names;
}

function loadVendorLucideIconNames() {
  const code = read(path.join(socialRoot, "vendor", "lucide.min.js"));
  const context = { window: {}, globalThis: {} };
  context.self = context.window;
  vm.createContext(context);
  vm.runInContext(code, context);
  const lucide = context.window.lucide || context.lucide || context.globalThis.lucide;
  return new Set(Object.keys(lucide?.icons || {}));
}

function toPascalIconName(name) {
  return String(name || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

test("ofertat surfaces reference at least the icons they render", () => {
  const used = collectVoucherIconNames();
  assert.ok(used.size >= 10, `expected the ofertat surfaces to use icons, found ${used.size}`);
  assert.ok(used.has("ticket"), "the ofertat identity icon must be referenced");
});

// Der data-lucide-Fallback haengt an einem extern geladenen Script. Laedt es
// nicht, bleibt so ein Icon leer - genau das ist auf dem Ofertat-Tab passiert.
// Alles, was die Ofertat-Flaechen rendern, muss deshalb inline vorliegen.
test("every ofertat icon exists in the inline registry", () => {
  const used = collectVoucherIconNames();
  const inline = collectInlineIconRegistry();
  const missing = [...used].filter((name) => !inline.has(name)).sort();
  assert.deepEqual(
    missing,
    [],
    `these ofertat icons would silently render empty without the external lucide script: ${missing.join(", ")}`
  );
});

test("inline ofertat icons match the bundled lucide set", () => {
  const used = collectVoucherIconNames();
  const vendor = loadVendorLucideIconNames();
  const unknown = [...used].filter((name) => !vendor.has(toPascalIconName(name))).sort();
  assert.deepEqual(unknown, [], `unknown lucide icon names: ${unknown.join(", ")}`);
});

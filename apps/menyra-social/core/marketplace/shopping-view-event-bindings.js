function markBound(node, key = "default") {
  if (!node?.dataset) return true;
  const attr = `shopping${key}Bound`;
  if (node.dataset[attr] === "1") return false;
  node.dataset[attr] = "1";
  return true;
}

function cleanText(value = "") {
  return String(value || "").trim();
}

function setSearchOpen(root, open = false) {
  const title = root.querySelector("[data-shopping-search-title]");
  const shell = root.querySelector("[data-shopping-search-shell]");
  const toggle = root.querySelector("[data-shopping-search-toggle]");
  const panel = root.querySelector("[data-shopping-search-panel]");
  const input = root.querySelector("[data-shopping-search-input]");
  if (title?.style) {
    title.style.maxWidth = open ? "0" : "80%";
  }
  title?.classList.toggle("opacity-0", !!open);
  title?.classList.toggle("opacity-100", !open);
  title?.classList.toggle("pointer-events-none", !!open);
  shell?.classList.toggle("w-full", !!open);
  shell?.classList.toggle("w-9", !open);
  toggle?.classList.toggle("hidden", !!open);
  panel?.classList.toggle("hidden", !open);
  panel?.classList.toggle("flex", !!open);
  if (open && input && typeof input.focus === "function") {
    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }
  }
}

function applyShoppingSearch(root, query = "") {
  const normalized = cleanText(query).toLowerCase();
  root.querySelectorAll("[data-shopping-card]").forEach((card) => {
    const haystack = cleanText(card.getAttribute("data-shopping-search-text") || "");
    const visible = !normalized || haystack.includes(normalized);
    card.classList.toggle("hidden", !visible);
  });
}

export function bindShoppingViewEvents({
  documentObj
} = {}) {
  const doc = documentObj || null;
  if (!doc) return;
  const root = doc.querySelector("[data-shopping-view]");
  if (!root) return;

  const toggle = root.querySelector("[data-shopping-search-toggle]");
  const close = root.querySelector("[data-shopping-search-close]");
  const input = root.querySelector("[data-shopping-search-input]");

  if (toggle && markBound(toggle, "SearchToggle")) {
    toggle.addEventListener("click", () => setSearchOpen(root, true));
  }

  if (close && markBound(close, "SearchClose")) {
    close.addEventListener("click", () => {
      if (input) input.value = "";
      applyShoppingSearch(root, "");
      setSearchOpen(root, false);
    });
  }

  if (input && markBound(input, "SearchInput")) {
    input.addEventListener("input", () => applyShoppingSearch(root, input.value || ""));
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      input.value = "";
      applyShoppingSearch(root, "");
      setSearchOpen(root, false);
    });
  }

  root.querySelectorAll("[data-shopping-like]").forEach((btn) => {
    if (!markBound(btn, "Like")) return;
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const icon = btn.querySelector("svg, i");
      if (!icon) return;
      icon.classList.toggle("fill-rose-500");
      icon.classList.toggle("text-rose-500");
      icon.classList.toggle("text-slate-700");
    });
  });
}

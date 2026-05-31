import en from "./en.js";

const dicts = { de: {}, en };
const KEY = "menyra_lang";
const FALLBACK_LANG = "de";
const languageLoaders = {
  sq: () => import("./sq.js"),
  sr: () => import("./sr.js")
};
const loadingLanguages = new Map();

const LANGUAGE_OPTIONS = Object.freeze([
  { code: "sq", label: "Shqip", shortLabel: "SQ", nativeLabel: "Shqip" },
  { code: "de", label: "Deutsch", shortLabel: "DE", nativeLabel: "Deutsch" },
  { code: "sr", label: "Srpski", shortLabel: "SR", nativeLabel: "Srpski" }
]);

function normalizeLang(value = "") {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw === "sr-latn" || raw === "sr_rs" || raw === "sr-rs") return "sr";
  const base = raw.split(/[-_]/)[0] || "";
  return dicts[base] || languageLoaders[base] ? base : "";
}

function applyDocumentLang(lang = FALLBACK_LANG) {
  const safeLang = normalizeLang(lang) || FALLBACK_LANG;
  try {
    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.lang = safeLang === "sr" ? "sr-Latn" : safeLang;
    }
  } catch {}
}

function dispatchLanguageChange(lang = FALLBACK_LANG) {
  const safeLang = normalizeLang(lang) || FALLBACK_LANG;
  try {
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("menyra-language-change", { detail: { lang: safeLang } }));
    }
  } catch {}
}

export const isLangLoaded = (lang = FALLBACK_LANG) => {
  const safeLang = normalizeLang(lang) || FALLBACK_LANG;
  return !!dicts[safeLang];
};

export const loadLang = async (lang = FALLBACK_LANG) => {
  const safeLang = normalizeLang(lang) || FALLBACK_LANG;
  if (dicts[safeLang]) return safeLang;
  const loader = languageLoaders[safeLang];
  if (typeof loader !== "function") {
    dicts[safeLang] = {};
    return safeLang;
  }
  if (!loadingLanguages.has(safeLang)) {
    loadingLanguages.set(
      safeLang,
      loader()
        .then((mod) => {
          dicts[safeLang] = mod?.default && typeof mod.default === "object" ? mod.default : {};
          return safeLang;
        })
        .finally(() => {
          loadingLanguages.delete(safeLang);
        })
    );
  }
  return loadingLanguages.get(safeLang);
};

function queueLangLoad(lang = FALLBACK_LANG) {
  const safeLang = normalizeLang(lang) || FALLBACK_LANG;
  if (dicts[safeLang]) return;
  void loadLang(safeLang)
    .then(() => dispatchLanguageChange(safeLang))
    .catch(() => {});
}

export const getSupportedLanguages = () => LANGUAGE_OPTIONS;

export const getLang = (fallback = FALLBACK_LANG) => {
  const safeFallback = normalizeLang(fallback) || FALLBACK_LANG;
  try {
    const stored = normalizeLang(localStorage.getItem(KEY));
    if (stored) {
      applyDocumentLang(stored);
      queueLangLoad(stored);
      return stored;
    }
  } catch {}
  applyDocumentLang(safeFallback);
  return safeFallback;
};

export const setLang = (lang) => {
  const safeLang = normalizeLang(lang);
  if (!safeLang) return "";
  try {
    localStorage.setItem(KEY, safeLang);
  } catch {}
  applyDocumentLang(safeLang);
  queueLangLoad(safeLang);
  return safeLang;
};

function interpolate(value = "", params = {}) {
  return String(value || "").replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    if (!Object.prototype.hasOwnProperty.call(params, key)) return match;
    return String(params[key] ?? "");
  });
}

export const t = (key, options = {}) => {
  const safeKey = String(key || "").trim();
  if (!safeKey) return "";
  const isLegacyLangArg = typeof options === "string";
  const lang = isLegacyLangArg
    ? (normalizeLang(options) || getLang())
    : (normalizeLang(options?.lang) || getLang());
  const fallback = isLegacyLangArg ? safeKey : String(options?.fallback ?? safeKey);
  const params = isLegacyLangArg ? {} : (options?.params || {});
  queueLangLoad(lang);
  const value = dicts[lang]?.[safeKey] ?? dicts[FALLBACK_LANG]?.[safeKey] ?? fallback;
  return interpolate(value, params);
};

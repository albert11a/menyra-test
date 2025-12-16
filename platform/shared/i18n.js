export const LANGS = [
  { code: "de", label: "Deutsch" },
  { code: "sq", label: "Shqip" },
  { code: "en", label: "English" },
  { code: "sr", label: "Srpski" },
  { code: "bs", label: "Bosanski" },
  { code: "hr", label: "Hrvatski" },
  { code: "mk", label: "Македонски" },
  { code: "me", label: "Crnogorski" },
  { code: "tr", label: "Türkçe" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "es", label: "Español" },
  { code: "da", label: "Dansk" },
  { code: "cs", label: "Čeština" }
];

const DICT = {
  de: {
    logout: "Abmelden",
    nav_dashboard: "Dashboard",
    nav_customers: "Kunden",
    nav_leads: "Leads",
    nav_demo: "Demos",
    nav_staff: "Mitarbeiter",
    nav_accounts: "Accounts",
    nav_modules: "Module",
    nav_ads_review: "Ads Freigabe",
    nav_moderation: "Moderation",
    nav_analytics: "Analytics",
    nav_settings: "Einstellungen",

    nav_profile: "Profil",
    nav_menu: "Menü / Produkte",
    nav_orders: "Bestellungen",
    nav_offers: "Angebote",
    nav_staff: "Mitarbeiter",
    nav_social: "Social",
    nav_ads: "Werbung (Ads)",
    nav_loyalty: "Loyalty / Stempelkarte",
    nav_referrals: "Referrals / Empfehlungen",
    nav_queue: "Queue / Warteliste",
    nav_receipts: "Belege & Bewertungen",
    nav_locations: "Filialen (Multi-Location)",

    nav_shop_products: "Produkte",
    nav_shop_variants: "Varianten & Lager",
    nav_shop_discounts: "Rabatte",
    nav_shop_shipping: "Versand (später)",

    nav_rooms: "Zimmer & QR",
    nav_requests: "Requests / Tickets",
    nav_housekeeping: "Housekeeping",

    nav_services: "Leistungen",
    nav_inquiries: "Anfragen",
    nav_reviews: "Reviews & Google",
  }
};

export function getLang(){ return localStorage.getItem("menyra_lang") || "de"; }
export function setLang(code){ localStorage.setItem("menyra_lang", code); }

export function fillLangSelect(selectEl){
  if (!selectEl) return;
  selectEl.innerHTML = "";
  const current = getLang();
  for (const l of LANGS){
    const opt = document.createElement("option");
    opt.value = l.code;
    opt.textContent = l.label;
    if (l.code === current) opt.selected = true;
    selectEl.appendChild(opt);
  }
}

export function applyI18n(root=document){
  root.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    el.textContent = (DICT[getLang()] && DICT[getLang()][key]) || (DICT.de[key] || key);
  });
}

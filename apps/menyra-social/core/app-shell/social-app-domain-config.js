export const LEAD_STATUS_ORDER = ["registered", "contacted", "testphase", "kunde", "no_interest"];
export const LEAD_STATUS_LABELS = {
  registered: "Registriert",
  contacted: "Kontaktiert",
  testphase: "Testphase",
  kunde: "Kunde",
  no_interest: "Keine Interesse"
};
export const LEAD_TYPE_ORDER = ["restaurant", "cafe", "fastfood", "hotel", "motel", "ecommerce", "tankstelle", "lebensmittel", "apotheken", "services"];
export const LEAD_TYPE_LABELS = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  fastfood: "Fastfood",
  hotel: "Hotel",
  motel: "Motel",
  ecommerce: "E-Commerce",
  tankstelle: "Tankstelle",
  lebensmittel: "Lebensmittel",
  apotheken: "Apotheke",
  services: "Services"
};
export const ALBERT_CEO_UID = "aklBkkIuZ7Nrpx266TJn63rrxX62";
export const ALBERT_CEO_ALIASES = Object.freeze(["alberthoti", "albert_hoti"]);
export const ALBERT_CEO_EMAILS = Object.freeze(["alberthoti.vsa@gmail.com"]);
export const HIDDEN_LEGACY_CEO_EMAILS = Object.freeze(["albert.hoti@menyra.com"]);
export const FORCE_HIDDEN_SOCIAL_HANDLES = Object.freeze(["allo88", "alo2", "alo", "hhh", "llll"]);
export const FORCE_HIDDEN_SOCIAL_UIDS = Object.freeze([
  "oqyh9TmALTdH3GqUvtz1qO9DFcC2",
  "5rdVYRGrfFfMna0W9irKsidxIpr1",
  "5h3DKB7fu9Q0xiIkhUsYC1PqJPh2",
  "4l9h3hDWaPPQq5ePoDhy2aVJeaf1",
  "hYlBZN6WNQMIlrgEZDPLbyRGsro1"
]);
export const FORCE_HIDDEN_SOCIAL_HANDLE_SET = new Set(FORCE_HIDDEN_SOCIAL_HANDLES);
export const FORCE_HIDDEN_SOCIAL_UID_SET = new Set(FORCE_HIDDEN_SOCIAL_UIDS);
export const MILAN_OWNED_LEAD_EMAILS = Object.freeze([
  "restorandis@menyra.com",
  "restoranbelvedere@menyra.com",
  "restoranoresac@menyra.com",
  "zeigelrestaurant@menyra.com"
]);
export const MILAN_OWNED_LEAD_BUSINESSES = Object.freeze([
  "restoran dis",
  "restoran belvedere",
  "restoran oresac",
  "zeigelrestaurant"
]);
export const ALBERT_OWNED_LEAD_EMAILS = Object.freeze([
  "mobishopniti@menyra.com",
  "pizzeriadon@menyra.com",
  "antica@menyra.com"
]);
export const ALBERT_OWNED_LEAD_BUSINESSES = Object.freeze([
  "mobi shop niti",
  "pizzeria don napoletano",
  "antica"
]);
export const CEO_COUNTRIES = Object.freeze(["Albanien", "Kosovo", "Serbien"]);
export const LEAD_SETTINGS_DEFAULT_COUNTRY = "Kosovo";
export const LEAD_COUNTRY_CENTERS = Object.freeze({
  Kosovo: Object.freeze({ lat: 42.6629, lng: 21.1655 }),
  Serbien: Object.freeze({ lat: 44.7866, lng: 20.4489 }),
  Albanien: Object.freeze({ lat: 41.3275, lng: 19.8187 })
});
export const PRISHTINA_COORDS = Object.freeze({ lat: 42.6629, lng: 21.1655 });

export const ROLE_SWITCH_ORDER = ["ceo", "owner", "staff"];
export const ROLE_SWITCH_LABELS = {
  ceo: "CEO",
  owner: "Owner",
  staff: "Staff"
};

export const CRM_PAGE_SIZE = 20;

// menyraadmin-sprachen.js
// Nur für den MENYRA Superadmin (Dashboard, Restaurants, usw.)

export const translations = {
  // ============================================================
  // DEUTSCH
  // ============================================================
  de: {
    "env.superadmin": "Superadmin",
    "sidebar.navigation": "Navigation",
    "sidebar.system": "System",
    "btn.logout": "⏻ Logout",

    "nav.dashboard": "Dashboard",
    "nav.restaurants": "Kunden",
    "nav.leads": "Leads",
    "nav.offers": "Angebote",
    "nav.billing": "Abrechnung",
    "nav.users": "Benutzer",
    "nav.logs": "System-Logs",
    "nav.settings": "Einstellungen",

    "page.subtitle":
      "Überblick über alle Kunden, Umsätze, Bestellungen und Systemaktivität der MENYRA-Plattform.",
    "btn.csvExport": "CSV Export",
    "btn.newRestaurant": "+ Neuer Kunde",

    // Stats
    "stat.activeRestaurants": "Aktive Kunden",
    "stat.ordersToday": "Bestellungen heute",
    "stat.mrrTotal": "Umsatz",
    "stat.systemStatus": "System-Status",
    "stat.yearRevenue": "Jährlicher Umsatz",
    "stat.monthRevenue": "Monatliche Einnahmen",
    "stat.dayRevenue": "Tägliche Einnahmen",
    "stat.usersTotal": "Gesamt-User",

    "stat.period.monthly": "Monatlich",
    "stat.period.live": "Live",
    "stat.period.monthlyEuro": "€ / Monat",
    "stat.status.normal": "Normal",
    "stat.period.30days": "30 Tage",

    "section.customers.title": "Kunden & Restaurants",
    "section.customers.subtitle":
      "Verwalte alle angebundenen Kunden, Abos und Zugänge in einem Blick.",
    "section.activity.title": "Letzte Aktivität",
    "section.system.title": "System-Überblick",

    // Leads-View
    "section.leads.title": "Akquise & Leads",
    "section.leads.subtitle":
      "Alle angesprochenen Cafés, Restaurants, Hotels, E-Commerce & Rent-a-Car Betriebe im Überblick.",

    // Status-Filter
    "filter.status.all": "Alle Status",
    "filter.status.active": "Aktiv",
    "filter.status.trial": "Testphase",
    "filter.status.paused": "Pausiert",
    "filter.status.setup": "In Umsetzung",
    "filter.status.demo": "Demo",
    "filter.status.contract_end": "Vertragsende",
    "filter.status.cancelled": "Gekündigt",

    // Typ-Filter (Phase 1)
    "filter.type.all": "Alle Typen",
    "filter.type.restaurant": "Restaurants",
    "filter.type.cafe": "Cafés",
    "filter.type.club": "Clubs",
    "filter.type.hotel": "Hotels",
    "filter.type.motel": "Motels",
    "filter.type.onlineshop": "Online-Shops",
    "filter.type.service": "Dienstleistung",

    // Status-Badges
    "status.active": "Aktiv",
    "status.trial": "Testphase",
    "status.paused": "Pausiert",
    "status.setup": "In Umsetzung",
    "status.demo": "Demo",
    "status.contract_end": "Vertragsende",
    "status.cancelled": "Gekündigt",

    // Typ-Labels für Kunden (werden in JS genutzt)
    "type.restaurant": "Restaurant",
    "type.cafe": "Café",
    "type.club": "Club",
    "type.hotel": "Hotel",
    "type.motel": "Motel",
    "type.onlineshop": "Online-Shop",
    "type.service": "Dienstleistung",
    "type.other": "Sonstiges",

    // Kundensegmente (Chips)
    "customers.segment.core": "Kunden (aktiv + Umsetzung)",
    "customers.segment.trial": "Testkunden",
    "customers.segment.demo": "Demo-Kunden",
    "customers.segment.contract_end": "Vertragsende",
    "customers.segment.cancelled": "Gekündigte Kunden",
    "customers.segment.all": "Alle Kunden",

    "search.global.placeholder":
      "Suche in MENYRA (Kunden, Inhaber, Städte)…",
    "search.restaurants.placeholder":
      "Kunden nach Name, Stadt oder Inhaber filtern…",

    "table.header.restaurant": "Kunde",
    "table.header.owner": "Inhaber",
    "table.header.city": "Stadt",
    "table.header.plan": "Plan",
    "table.header.status": "Status",
    "table.header.action": "Aktion",
    "table.meta": "0 Einträge · sortiert nach Name",
    "table.footer.previous": "‹ Zurück",
    "table.footer.next": "Weiter ›",
    "table.footer.pageInfo": "Seite 1 von 1"
  },

  // ============================================================
  // ENGLISH
  // ============================================================
  en: {
    "env.superadmin": "Superadmin",
    "sidebar.navigation": "Navigation",
    "sidebar.system": "System",
    "btn.logout": "⏻ Logout",

    "nav.dashboard": "Dashboard",
    "nav.restaurants": "Customers",
    "nav.leads": "Leads",
    "nav.offers": "Offers",
    "nav.billing": "Billing",
    "nav.users": "Users",
    "nav.logs": "System logs",
    "nav.settings": "Settings",

    "page.subtitle":
      "Overview of all customers, revenue, orders and system activity of the MENYRA platform.",
    "btn.csvExport": "CSV Export",
    "btn.newRestaurant": "+ New customer",

    "stat.activeRestaurants": "Active customers",
    "stat.ordersToday": "Orders today",
    "stat.mrrTotal": "Revenue",
    "stat.systemStatus": "System status",
    "stat.yearRevenue": "Yearly revenue",
    "stat.monthRevenue": "Monthly revenue",
    "stat.dayRevenue": "Daily revenue",
    "stat.usersTotal": "Total users",

    "stat.period.monthly": "Monthly",
    "stat.period.live": "Live",
    "stat.period.monthlyEuro": "€ / month",
    "stat.status.normal": "Normal",
    "stat.period.30days": "30 days",

    "section.customers.title": "Customers & restaurants",
    "section.customers.subtitle":
      "Manage all connected customers, subscriptions and accesses in one place.",
    "section.activity.title": "Latest activity",
    "section.system.title": "System overview",

    "section.leads.title": "Acquisition & leads",
    "section.leads.subtitle":
      "All contacted cafés, restaurants, hotels, e-commerce and rent-a-car businesses at a glance.",

    "filter.status.all": "All statuses",
    "filter.status.active": "Active",
    "filter.status.trial": "Trial",
    "filter.status.paused": "Paused",
    "filter.status.setup": "In implementation",
    "filter.status.demo": "Demo",
    "filter.status.contract_end": "Contract end",
    "filter.status.cancelled": "Cancelled",

    "filter.type.all": "All types",
    "filter.type.restaurant": "Restaurants",
    "filter.type.cafe": "Cafés",
    "filter.type.club": "Clubs",
    "filter.type.hotel": "Hotels",
    "filter.type.motel": "Motels",
    "filter.type.onlineshop": "Online shops",
    "filter.type.service": "Service business",

    "status.active": "Active",
    "status.trial": "Trial",
    "status.paused": "Paused",
    "status.setup": "In implementation",
    "status.demo": "Demo",
    "status.contract_end": "Contract end",
    "status.cancelled": "Cancelled",

    "type.restaurant": "Restaurant",
    "type.cafe": "Café",
    "type.club": "Club",
    "type.hotel": "Hotel",
    "type.motel": "Motel",
    "type.onlineshop": "Online shop",
    "type.service": "Service business",
    "type.other": "Other",

    "customers.segment.core": "Customers (active + setup)",
    "customers.segment.trial": "Trial customers",
    "customers.segment.demo": "Demo customers",
    "customers.segment.contract_end": "Contract end",
    "customers.segment.cancelled": "Cancelled customers",
    "customers.segment.all": "All customers",

    "search.global.placeholder":
      "Search in MENYRA (customers, owners, cities)…",
    "search.restaurants.placeholder":
      "Filter customers by name, city or owner…",

    "table.header.restaurant": "Customer",
    "table.header.owner": "Owner",
    "table.header.city": "City",
    "table.header.plan": "Plan",
    "table.header.status": "Status",
    "table.header.action": "Action",
    "table.meta": "0 entries · sorted by name",
    "table.footer.previous": "‹ Previous",
    "table.footer.next": "Next ›",
    "table.footer.pageInfo": "Page 1 of 1"
  },

  // ============================================================
  // SHQIP (ALBANISCH)
  // ============================================================
  sq: {
    "env.superadmin": "Superadmin",
    "sidebar.navigation": "Navigimi",
    "sidebar.system": "Sistemi",
    "btn.logout": "⏻ Dalje",

    "nav.dashboard": "Paneli",
    "nav.restaurants": "Klientët",
    "nav.leads": "Leads",
    "nav.offers": "Ofertat",
    "nav.billing": "Faturimi",
    "nav.users": "Përdoruesit",
    "nav.logs": "Log-et e sistemit",
    "nav.settings": "Cilësimet",

    "page.subtitle":
      "Përmbledhje e të gjithë klientëve, të ardhurave, porosive dhe aktivitetit të sistemit në MENYRA.",
    "btn.csvExport": "Eksport CSV",
    "btn.newRestaurant": "+ Klient i ri",

    "stat.activeRestaurants": "Klientë aktivë",
    "stat.ordersToday": "Porositë sot",
    "stat.mrrTotal": "Të ardhura",
    "stat.systemStatus": "Statusi i sistemit",
    "stat.yearRevenue": "Të ardhura vjetore",
    "stat.monthRevenue": "Të ardhura mujore",
    "stat.dayRevenue": "Të ardhura ditore",
    "stat.usersTotal": "Përdorues gjithsej",

    "stat.period.monthly": "Mujore",
    "stat.period.live": "Live",
    "stat.period.monthlyEuro": "€ / muaj",
    "stat.status.normal": "Normal",
    "stat.period.30days": "30 ditë",

    "section.customers.title": "Klientë & restorante",
    "section.customers.subtitle":
      "Menaxho të gjithë klientët, abonimet dhe akseset në një vend.",
    "section.activity.title": "Aktiviteti i fundit",
    "section.system.title": "Përmbledhje e sistemit",

    "section.leads.title": "Akvizim & Leads",
    "section.leads.subtitle":
      "Të gjitha kafenetë, restorantet, hotelet, e-commerce dhe rent-a-car që ke kontaktuar.",

    "filter.status.all": "Të gjithë statuset",
    "filter.status.active": "Aktiv",
    "filter.status.trial": "Provë",
    "filter.status.paused": "Pezulluar",
    "filter.status.setup": "Në implementim",
    "filter.status.demo": "Demo",
    "filter.status.contract_end": "Fund kontrate",
    "filter.status.cancelled": "Anuluar",

    "filter.type.all": "Të gjithë tipat",
    "filter.type.restaurant": "Restorante",
    "filter.type.cafe": "Kafe",
    "filter.type.club": "Klube",
    "filter.type.hotel": "Hotele",
    "filter.type.motel": "Motele",
    "filter.type.onlineshop": "Dyqane online",
    "filter.type.service": "Shërbime",

    "status.active": "Aktiv",
    "status.trial": "Provë",
    "status.paused": "Pezulluar",
    "status.setup": "Në implementim",
    "status.demo": "Demo",
    "status.contract_end": "Fund kontrate",
    "status.cancelled": "Anuluar",

    "type.restaurant": "Restaurant",
    "type.cafe": "Kafe",
    "type.club": "Club",
    "type.hotel": "Hotel",
    "type.motel": "Motel",
    "type.onlineshop": "Dyqan online",
    "type.service": "Shërbim",
    "type.other": "Tjetër",

    "customers.segment.core": "Klientë (aktiv + në implementim)",
    "customers.segment.trial": "Klientë në provë",
    "customers.segment.demo": "Klientë demo",
    "customers.segment.contract_end": "Fund kontrate",
    "customers.segment.cancelled": "Klientë të anuluar",
    "customers.segment.all": "Të gjithë klientët",

    "search.global.placeholder":
      "Kërko në MENYRA (klientë, pronarë, qytete)…",
    "search.restaurants.placeholder":
      "Filtro klientët sipas emrit, qytetit ose pronarit…",

    "table.header.restaurant": "Klienti",
    "table.header.owner": "Pronari",
    "table.header.city": "Qyteti",
    "table.header.plan": "Plani",
    "table.header.status": "Statusi",
    "table.header.action": "Veprim",
    "table.meta": "0 regjistrime · të renditura sipas emrit",
    "table.footer.previous": "‹ Mbrapa",
    "table.footer.next": "Përpara ›",
    "table.footer.pageInfo": "Faqja 1 nga 1"
  },

  // ============================================================
  // SRPSKI (SERBISCH)
  // ============================================================
  sr: {
    "env.superadmin": "Superadmin",
    "sidebar.navigation": "Navigacija",
    "sidebar.system": "Sistem",
    "btn.logout": "⏻ Odjava",

    "nav.dashboard": "Kontrolna tabla",
    "nav.restaurants": "Klijenti",
    "nav.leads": "Leads",
    "nav.offers": "Ponude",
    "nav.billing": "Naplate",
    "nav.users": "Korisnici",
    "nav.logs": "Sistemski logovi",
    "nav.settings": "Podešavanja",

    "page.subtitle":
      "Pregled svih klijenata, prihoda, porudžbina i aktivnosti sistema na MENYRA platformi.",
    "btn.csvExport": "CSV izvoz",
    "btn.newRestaurant": "+ Novi klijent",

    "stat.activeRestaurants": "Aktivni klijenti",
    "stat.ordersToday": "Porudžbine danas",
    "stat.mrrTotal": "Prihod",
    "stat.systemStatus": "Status sistema",
    "stat.yearRevenue": "Godišnji prihod",
    "stat.monthRevenue": "Mesečni prihod",
    "stat.dayRevenue": "Dnevni prihod",
    "stat.usersTotal": "Ukupno korisnika",

    "stat.period.monthly": "Mesečno",
    "stat.period.live": "Uživo",
    "stat.period.monthlyEuro": "€ / mesec",
    "stat.status.normal": "Normalno",
    "stat.period.30days": "30 dana",

    "section.customers.title": "Klijenti i restorani",
    "section.customers.subtitle":
      "Upravljaj svim klijentima, pretplatama i pristupima na jednom mestu.",
    "section.activity.title": "Poslednja aktivnost",
    "section.system.title": "Pregled sistema",

    "section.leads.title": "Akvizicija & Leads",
    "section.leads.subtitle":
      "Svi kontakti sa kafićima, restoranima, hotelima, e-commerce i rent-a-car biznisima.",

    "filter.status.all": "Svi statusi",
    "filter.status.active": "Aktivan",
    "filter.status.trial": "Probni",
    "filter.status.paused": "Pauziran",
    "filter.status.setup": "U fazi implementacije",
    "filter.status.demo": "Demo",
    "filter.status.contract_end": "Isticanje ugovora",
    "filter.status.cancelled": "Otkazano",

    "filter.type.all": "Svi tipovi",
    "filter.type.restaurant": "Restorani",
    "filter.type.cafe": "Kafići",
    "filter.type.club": "Klubovi",
    "filter.type.hotel": "Hoteli",
    "filter.type.motel": "Moteli",
    "filter.type.onlineshop": "Online prodavnice",
    "filter.type.service": "Servisne delatnosti",

    "status.active": "Aktivan",
    "status.trial": "Probni",
    "status.paused": "Pauziran",
    "status.setup": "U fazi implementacije",
    "status.demo": "Demo",
    "status.contract_end": "Isticanje ugovora",
    "status.cancelled": "Otkazano",

    "type.restaurant": "Restoran",
    "type.cafe": "Kafić",
    "type.club": "Klub",
    "type.hotel": "Hotel",
    "type.motel": "Motel",
    "type.onlineshop": "Online prodavnica",
    "type.service": "Servisna delatnost",
    "type.other": "Ostalo",

    "customers.segment.core": "Klijenti (aktivni + u pripremi)",
    "customers.segment.trial": "Probni klijenti",
    "customers.segment.demo": "Demo klijenti",
    "customers.segment.contract_end": "Isticanje ugovora",
    "customers.segment.cancelled": "Otkazani klijenti",
    "customers.segment.all": "Svi klijenti",

    "search.global.placeholder":
      "Pretraži u MENYRA (klijenti, vlasnici, gradovi)…",
    "search.restaurants.placeholder":
      "Filtriraj klijente po imenu, gradu ili vlasniku…",

    "table.header.restaurant": "Klijent",
    "table.header.owner": "Vlasnik",
    "table.header.city": "Grad",
    "table.header.plan": "Plan",
    "table.header.status": "Status",
    "table.header.action": "Akcija",
    "table.meta": "0 unosa · sortirano po imenu",
    "table.footer.previous": "‹ Nazad",
    "table.footer.next": "Napred ›",
    "table.footer.pageInfo": "Strana 1 od 1"
  },

  // ============================================================
  // TÜRKÇE
  // ============================================================
  tr: {
    "env.superadmin": "Süper admin",
    "sidebar.navigation": "Navigasyon",
    "sidebar.system": "Sistem",
    "btn.logout": "⏻ Çıkış",

    "nav.dashboard": "Panel",
    "nav.restaurants": "Müşteriler",
    "nav.leads": "Leads",
    "nav.offers": "Kampanyalar",
    "nav.billing": "Faturalama",
    "nav.users": "Kullanıcılar",
    "nav.logs": "Sistem kayıtları",
    "nav.settings": "Ayarlar",

    "page.subtitle":
      "MENYRA platformundaki tüm müşteriler, gelirler, siparişler ve sistem aktivitelerinin özeti.",
    "btn.csvExport": "CSV dışa aktar",
    "btn.newRestaurant": "+ Yeni müşteri",

    "stat.activeRestaurants": "Aktif müşteriler",
    "stat.ordersToday": "Bugünkü siparişler",
    "stat.mrrTotal": "Gelir",
    "stat.systemStatus": "Sistem durumu",
    "stat.yearRevenue": "Yıllık gelir",
    "stat.monthRevenue": "Aylık gelir",
    "stat.dayRevenue": "Günlük gelir",
    "stat.usersTotal": "Toplam kullanıcı",

    "stat.period.monthly": "Aylık",
    "stat.period.live": "Canlı",
    "stat.period.monthlyEuro": "€ / ay",
    "stat.status.normal": "Normal",
    "stat.period.30days": "30 gün",

    "section.customers.title": "Müşteriler & restoranlar",
    "section.customers.subtitle":
      "Tüm müşterileri, abonelikleri ve erişimleri tek yerden yönet.",
    "section.activity.title": "Son aktiviteler",
    "section.system.title": "Sistem özeti",

    "section.leads.title": "Satış & Leads",
    "section.leads.subtitle":
      "Tüm kafeler, restoranlar, oteller, e-ticaret ve rent-a-car işletmeleri tek listede.",

    "filter.status.all": "Tüm durumlar",
    "filter.status.active": "Aktif",
    "filter.status.trial": "Deneme",
    "filter.status.paused": "Durduruldu",
    "filter.status.setup": "Kurulum aşaması",
    "filter.status.demo": "Demo",
    "filter.status.contract_end": "Sözleşme bitişi",
    "filter.status.cancelled": "İptal edildi",

    "filter.type.all": "Tüm türler",
    "filter.type.restaurant": "Restoranlar",
    "filter.type.cafe": "Kafeler",
    "filter.type.club": "Kulüpler",
    "filter.type.hotel": "Oteller",
    "filter.type.motel": "Moteller",
    "filter.type.onlineshop": "Online mağazalar",
    "filter.type.service": "Hizmet",

    "status.active": "Aktif",
    "status.trial": "Deneme",
    "status.paused": "Durduruldu",
    "status.setup": "Kurulum aşaması",
    "status.demo": "Demo",
    "status.contract_end": "Sözleşme bitişi",
    "status.cancelled": "İptal edildi",

    "type.restaurant": "Restoran",
    "type.cafe": "Kafe",
    "type.club": "Kulüp",
    "type.hotel": "Otel",
    "type.motel": "Motel",
    "type.onlineshop": "Online mağaza",
    "type.service": "Hizmet",
    "type.other": "Diğer",

    "customers.segment.core": "Müşteriler (aktif + kurulum)",
    "customers.segment.trial": "Deneme müşterileri",
    "customers.segment.demo": "Demo müşterileri",
    "customers.segment.contract_end": "Sözleşme bitişi",
    "customers.segment.cancelled": "İptal edilmiş müşteriler",
    "customers.segment.all": "Tüm müşteriler",

    "search.global.placeholder":
      "MENYRA içinde ara (müşteriler, sahipler, şehirler)…",
    "search.restaurants.placeholder":
      "Müşterileri isim, şehir veya sahip ile filtrele…",

    "table.header.restaurant": "Müşteri",
    "table.header.owner": "Sahip",
    "table.header.city": "Şehir",
    "table.header.plan": "Plan",
    "table.header.status": "Durum",
    "table.header.action": "İşlem",
    "table.meta": "0 kayıt · isme göre sıralı",
    "table.footer.previous": "‹ Geri",
    "table.footer.next": "İleri ›",
    "table.footer.pageInfo": "Sayfa 1 / 1"
  }
};

let currentLang = "de";

export function loadSavedLang() {
  try {
    const saved = window.localStorage.getItem("menyraLang");
    if (saved && translations[saved]) {
      currentLang = saved;
    }
  } catch {
    // ignore
  }
}

export function getCurrentLang() {
  return currentLang;
}

export function setCurrentLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    try {
      window.localStorage.setItem("menyraLang", currentLang);
    } catch {
      // ignore
    }
  }
}

export function applyTranslations() {
  const dict = translations[currentLang] || translations.de;

  document.querySelectorAll("[data-i18n-key]").forEach((el) => {
    const key = el.getAttribute("data-i18n-key");
    const txt = dict[key];
    if (typeof txt === "string") {
      el.textContent = txt;
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const txt = dict[key];
    if (typeof txt === "string" && "placeholder" in el) {
      el.placeholder = txt;
    }
  });
}

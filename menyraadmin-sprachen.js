// menyraadmin-sprachen.js
// Nur für den MENYRA Superadmin (Dashboard, Restaurants, usw.)

export const translations = {
  de: {
    "env.superadmin": "Superadmin",
    "sidebar.navigation": "Navigation",
    "sidebar.system": "System",
    "btn.logout": "⏻ Logout",

    "nav.dashboard": "Dashboard",
    "nav.restaurants": "Kunden",
    "nav.offers": "Angebote",
    "nav.billing": "Abrechnung",
    "nav.users": "Benutzer",
    "nav.logs": "System-Logs",
    "nav.settings": "Einstellungen",

    "page.subtitle":
      "Überblick über alle Kunden, Abos und Systemaktivität der MENYRA-Plattform.",
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

    // Status-Filter
    "filter.status.all": "Alle Status",
    "filter.status.active": "Aktiv",
    "filter.status.trial": "Testphase",
    "filter.status.paused": "Pausiert",
    "filter.status.setup": "Aufbauphase",
    "filter.status.demo": "Demo",

    // Kunden-Typ-Filter
    "filter.type.all": "Alle Typen",
    "filter.type.cafe": "Cafés",
    "filter.type.restaurant": "Restaurants",
    "filter.type.hotel": "Hotels",
    "filter.type.ecommerce": "E-Commerce",
    "filter.type.rentacar": "Rent a Car",
    "filter.type.club": "Clubs",

    // Status-Labels
    "status.active": "Aktiv",
    "status.trial": "Testphase",
    "status.paused": "Pausiert",
    "status.setup": "Aufbauphase",
    "status.demo": "Demo",

    // Typ-Labels (für Tabelle, Zeile unter dem Namen)
    "type.cafe": "Café / Coffee-Bar",
    "type.restaurant": "Restaurant",
    "type.hotel": "Hotel",
    "type.ecommerce": "E-Commerce / Online-Shop",
    "type.rentacar": "Rent a Car",
    "type.club": "Club / Nightlife",
    "type.other": "Sonstige",

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

  en: {
    "env.superadmin": "Superadmin",
    "sidebar.navigation": "Navigation",
    "sidebar.system": "System",
    "btn.logout": "⏻ Logout",

    "nav.dashboard": "Dashboard",
    "nav.restaurants": "Customers",
    "nav.offers": "Offers",
    "nav.billing": "Billing",
    "nav.users": "Users",
    "nav.logs": "System logs",
    "nav.settings": "Settings",

    "page.subtitle":
      "Overview of all customers, subscriptions and system activity of the MENYRA platform.",
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

    // Status filter
    "filter.status.all": "All statuses",
    "filter.status.active": "Active",
    "filter.status.trial": "Trial",
    "filter.status.paused": "Paused",
    "filter.status.setup": "Setup phase",
    "filter.status.demo": "Demo",

    // Type filter
    "filter.type.all": "All types",
    "filter.type.cafe": "Cafés",
    "filter.type.restaurant": "Restaurants",
    "filter.type.hotel": "Hotels",
    "filter.type.ecommerce": "E-commerce",
    "filter.type.rentacar": "Rent a Car",
    "filter.type.club": "Clubs",

    // Status labels
    "status.active": "Active",
    "status.trial": "Trial",
    "status.paused": "Paused",
    "status.setup": "Setup phase",
    "status.demo": "Demo",

    // Type labels
    "type.cafe": "Café / coffee bar",
    "type.restaurant": "Restaurant",
    "type.hotel": "Hotel",
    "type.ecommerce": "E-commerce / online shop",
    "type.rentacar": "Rent a Car",
    "type.club": "Club / nightlife",
    "type.other": "Other",

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

  sq: {
    "env.superadmin": "Superadmin",
    "sidebar.navigation": "Navigimi",
    "sidebar.system": "Sistemi",
    "btn.logout": "⏻ Dalje",

    "nav.dashboard": "Paneli",
    "nav.restaurants": "Klientët",
    "nav.offers": "Ofertat",
    "nav.billing": "Faturimi",
    "nav.users": "Përdoruesit",
    "nav.logs": "Log-et e sistemit",
    "nav.settings": "Cilësimet",

    "page.subtitle":
      "Përmbledhje e të gjithë klientëve, abonimeve dhe aktivitetit të sistemit në MENYRA.",
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

    // Status filter
    "filter.status.all": "Të gjithë statuset",
    "filter.status.active": "Aktiv",
    "filter.status.trial": "Provë",
    "filter.status.paused": "Pezulluar",
    "filter.status.setup": "Faza e ndërtimit",
    "filter.status.demo": "Demo",

    // Type filter
    "filter.type.all": "Të gjithë tipet",
    "filter.type.cafe": "Cafè",
    "filter.type.restaurant": "Restorante",
    "filter.type.hotel": "Hotele",
    "filter.type.ecommerce": "E-commerce",
    "filter.type.rentacar": "Rent a Car",
    "filter.type.club": "Clube / nightlife",

    // Status labels
    "status.active": "Aktiv",
    "status.trial": "Provë",
    "status.paused": "Pezulluar",
    "status.setup": "Faza e ndërtimit",
    "status.demo": "Demo",

    // Type labels
    "type.cafe": "Cafè / coffee-bar",
    "type.restaurant": "Restorant",
    "type.hotel": "Hotel",
    "type.ecommerce": "Dyqan online / e-commerce",
    "type.rentacar": "Rent a Car",
    "type.club": "Club nate",
    "type.other": "Të tjera",

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

  sr: {
    "env.superadmin": "Superadmin",
    "sidebar.navigation": "Navigacija",
    "sidebar.system": "Sistem",
    "btn.logout": "⏻ Odjava",

    "nav.dashboard": "Kontrolna tabla",
    "nav.restaurants": "Klijenti",
    "nav.offers": "Ponude",
    "nav.billing": "Naplate",
    "nav.users": "Korisnici",
    "nav.logs": "Sistemski logovi",
    "nav.settings": "Podešavanja",

    "page.subtitle":
      "Pregled svih klijenata, pretplata i aktivnosti sistema na MENYRA platformi.",
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

    // Status filter
    "filter.status.all": "Svi statusi",
    "filter.status.active": "Aktivan",
    "filter.status.trial": "Probni",
    "filter.status.paused": "Pauziran",
    "filter.status.setup": "U fazi postavljanja",
    "filter.status.demo": "Demo",

    // Type filter
    "filter.type.all": "Svi tipovi",
    "filter.type.cafe": "Kafići",
    "filter.type.restaurant": "Restorani",
    "filter.type.hotel": "Hoteli",
    "filter.type.ecommerce": "E-commerce",
    "filter.type.rentacar": "Rent a car",
    "filter.type.club": "Clubovi",

    // Status labels
    "status.active": "Aktivan",
    "status.trial": "Probni",
    "status.paused": "Pauziran",
    "status.setup": "U fazi postavljanja",
    "status.demo": "Demo",

    // Type labels
    "type.cafe": "Kafić / coffee-bar",
    "type.restaurant": "Restoran",
    "type.hotel": "Hotel",
    "type.ecommerce": "Online prodavnica / e-commerce",
    "type.rentacar": "Rent a car",
    "type.club": "Noćni klub",
    "type.other": "Ostalo",

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

  tr: {
    "env.superadmin": "Süper admin",
    "sidebar.navigation": "Navigasyon",
    "sidebar.system": "Sistem",
    "btn.logout": "⏻ Çıkış",

    "nav.dashboard": "Panel",
    "nav.restaurants": "Müşteriler",
    "nav.offers": "Kampanyalar",
    "nav.billing": "Faturalama",
    "nav.users": "Kullanıcılar",
    "nav.logs": "Sistem kayıtları",
    "nav.settings": "Ayarlar",

    "page.subtitle":
      "MENYRA platformundaki tüm müşteriler, abonelikler ve sistem aktivitelerinin özeti.",
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

    // Status filter
    "filter.status.all": "Tüm durumlar",
    "filter.status.active": "Aktif",
    "filter.status.trial": "Deneme",
    "filter.status.paused": "Durduruldu",
    "filter.status.setup": "Kurulum aşaması",
    "filter.status.demo": "Demo",

    // Type filter
    "filter.type.all": "Tüm türler",
    "filter.type.cafe": "Kafeler",
    "filter.type.restaurant": "Restoranlar",
    "filter.type.hotel": "Oteller",
    "filter.type.ecommerce": "E-ticaret",
    "filter.type.rentacar": "Rent a car",
    "filter.type.club": "Kulüpler",

    // Status labels
    "status.active": "Aktif",
    "status.trial": "Deneme",
    "status.paused": "Durduruldu",
    "status.setup": "Kurulum aşaması",
    "status.demo": "Demo",

    // Type labels
    "type.cafe": "Kafe / coffee-bar",
    "type.restaurant": "Restoran",
    "type.hotel": "Otel",
    "type.ecommerce": "Online mağaza / e-ticaret",
    "type.rentacar": "Rent a car",
    "type.club": "Gece kulübü",
    "type.other": "Diğer",

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

# MENYRA – Seiten-Inventar (STEP 004)

_Erstellt: 2025-12-18 03:36_

Dieses Dokument listet **pro Seite** alles auf, was du im UI siehst: **Buttons, Links, Inputs, Tabs** usw.

Wichtig: In diesem Step ist alles **nur Platzhalter** (keine Funktionen). Wir ändern danach Schritt für Schritt.

## Änderung in diesem Step
- In **`apps/guest/karte.html`** wurden die Bereiche **„Porosia juaj“** und **„Thirr kamarierin“** entfernt (inkl. Order-Details-Block).


# ROOT


## index.html

**Titel:** MENYRA – Dev Hub

**Zweck:** Startseite zum Testen (Dev Hub).


### Interaktive Elemente


#### A

- **Karte** — href=`./apps/guest/karte.html`
- **Detajet** — href=`./apps/guest/detajet.html`
- **Porosia** — href=`./apps/guest/porosia.html`
- **Hotel Portal** — href=`./apps/guest/hotel.html`
- **Fastfood Ticket** — href=`./apps/guest/ticket.html`
- **Login** — href=`./apps/social/login.html`
- **Entdecken** — href=`./apps/social/entdecken.html`
- **Feed** — href=`./apps/social/feed.html`
- **Profil** — href=`./apps/social/profile.html`
- **Profil bearbeiten** — href=`./apps/social/profile-edit.html`
- **History** — href=`./apps/social/history.html`
- **Login** — href=`./apps/owner/login.html`
- **Admin** — href=`./apps/owner/admin.html`
- **Login** — href=`./apps/staff/login.html`
- **Kamarieri** — href=`./apps/staff/kamarieri.html`
- **Login** — href=`./apps/staffadmin/login.html`
- **Dashboard** — href=`./apps/staffadmin/dashboard.html`
- **Login** — href=`./apps/platform/login.html`
- **Dashboard** — href=`./apps/platform/dashboard.html`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


# GUEST


## apps/guest/detajet.html

**Titel:** MENYRA – Detajet (Placeholder)

**Zweck:** Gast-Seiten (QR) – ohne Login.

**Wichtige Container (IDs):** `detailSliderWrapper`


### Interaktive Elemente


#### A

- **← Mbrapa** — class=`btn btn-ghost btn-small`, href=`./karte.html`
- **Shiko porosin** — id=`detailViewCartBtn`, class=`btn btn-primary drawer-cart-btn`, href=`./porosia.html`

#### BUTTON

- **‹** — id=`detailSliderPrev`, class=`detail-slider-arrow detail-slider-arrow--left`, type=`button`
- **›** — id=`detailSliderNext`, class=`detail-slider-arrow detail-slider-arrow--right`, type=`button`
- **❤️ Pëlqeje** — id=`detailLikeBtn`, class=`drawer-like-btn`, type=`button`
- **−** — id=`detailQtyMinus`, class=`btn btn-ghost`, type=`button`
- **+** — id=`detailQtyPlus`, class=`btn btn-primary`, type=`button`
- **Shto në porosi** — id=`detailAddBtn`, class=`btn btn-primary drawer-add-btn`, type=`button`
- **2 Shiko porosin** — id=`cartFab`, class=`cart-fab visible cart-fab--has-items`, type=`button`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/guest/hotel.html

**Titel:** MENYRA – Hotel Portal (Placeholder)

**Zweck:** Gast-Seiten (QR) – ohne Login.


### Interaktive Elemente


#### A

- **← Hub** — class=`btn btn-ghost btn-small`, href=`../../index.html`
- **Hap Kartën** — class=`btn btn-primary`, href=`./karte.html`

#### BUTTON

- **Kërko** — class=`btn btn-primary btn-small`, type=`button`
- **Aktivizo DND** — class=`btn btn-dark`, type=`button`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/guest/index.html

**Titel:** MENYRA – Guest (Placeholder)

**Zweck:** Gast-Seiten (QR) – ohne Login.


### Interaktive Elemente


#### A

- **← Hub** — class=`btn btn-ghost btn-small`, href=`../../index.html`
- **Karte** — class=`btn btn-primary`, href=`./karte.html`
- **Hotel** — class=`btn btn-primary`, href=`./hotel.html`
- **Ticket** — class=`btn btn-primary`, href=`./ticket.html`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/guest/karte.html

**Titel:** MENYRA – Karte (Placeholder)

**Zweck:** Gast-Seiten (QR) – ohne Login.

**Wichtige Container (IDs):** `drinksTabs`, `drinksTabsWrapper`, `foodCategoryTabs`, `foodTabsWrapper`


### Interaktive Elemente


#### A

- **Detajet** — class=`btn btn-ghost btn-small`, href=`./detajet.html`

#### BUTTON

- **Info** — class=`btn btn-ghost btn-small`, type=`button`
- **Shto** — class=`btn btn-primary btn-small`, type=`button`
- **(ohne Text)** — class=`offers-dot active`, type=`button`
- **(ohne Text)** — class=`offers-dot`, type=`button`
- **Search** — class=`search-btn`, type=`button`, aria-label=`Search`
- **All** — class=`category-tab active`, type=`button`
- **Coffee** — class=`category-tab`, type=`button`
- **Soft** — class=`category-tab`, type=`button`
- **Beer** — class=`category-tab`, type=`button`
- **Like** — class=`icon-circle`, type=`button`, aria-label=`Like`
- **−** — class=`qty-btn`, type=`button`
- **+** — class=`qty-btn`, type=`button`
- **Wähle** — class=`btn-add-round`, type=`button`
- **Burger** — class=`category-tab active`, type=`button`
- **Pasta** — class=`category-tab`, type=`button`
- **Salad** — class=`category-tab`, type=`button`
- **Dessert** — class=`category-tab`, type=`button`
- **❤️ 34** — class=`social-btn social-btn-like`, type=`button`
- **💬 6** — class=`social-btn social-btn-comment`, type=`button`
- **❤️ 18** — class=`social-btn social-btn-like`, type=`button`
- **💬 2** — class=`social-btn social-btn-comment`, type=`button`
- **Shiko porosin 2** — id=`cartFab`, class=`cart-fab visible cart-fab--has-items`, type=`button`

#### INPUT

- **Kërko në meny.** — id=`searchInput`, class=`search-input`, type=`search`, placeholder=`Kërko në meny.`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/guest/porosia.html

**Titel:** MENYRA – Porosia (Placeholder)

**Zweck:** Gast-Seiten (QR) – ohne Login.


### Interaktive Elemente


#### A

- **← Kthehu** — id=`porosiaBackBtn`, class=`btn btn-ghost btn-small`, href=`./karte.html`

#### BUTTON

- **Fshij porosinë** — id=`porosiaClearBtn`, class=`btn btn-ghost`, type=`button`
- **Dërgo porosinë** — id=`porosiaSendBtn`, class=`btn btn-primary`, type=`button`
- **Shiko porosin 2** — id=`cartFab`, class=`cart-fab visible cart-fab--has-items`, type=`button`

#### TEXTAREA

- **Shënim për kuzhinën (opsionale)** — id=`porosiaNote`, class=`input`, placeholder=`Shënim për kuzhinën (opsionale)`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/guest/ticket.html

**Titel:** MENYRA – Ticket (Placeholder)

**Zweck:** Gast-Seiten (QR) – ohne Login.


### Interaktive Elemente


#### A

- **← Mbrapa** — class=`btn btn-ghost btn-small`, href=`./karte.html`
- **Kthehu** — class=`btn btn-ghost`, href=`./karte.html`
- **Shiko porosin** — class=`btn btn-primary`, href=`./porosia.html`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


# SOCIAL


## apps/social/entdecken.html

**Titel:** MENYRA – Entdecken (Placeholder)

**Zweck:** Social/User-Seiten – Login später.


### Interaktive Elemente


#### A

- **← Hub** — class=`btn btn-ghost btn-small`, href=`../../index.html`

#### BUTTON

- **(ohne Text)** — class=`search-btn`, type=`button`
- **Gastro** — class=`tab-btn tab-btn-active`, type=`button`
- **Hotels** — class=`tab-btn`, type=`button`
- **Shops** — class=`tab-btn`, type=`button`
- **Stores** — class=`tab-btn`, type=`button`

#### INPUT

- **Suchen…** — class=`search-input`, placeholder=`Suchen…`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/social/feed.html

**Titel:** MENYRA – Feed (Placeholder)

**Zweck:** Social/User-Seiten – Login später.


### Interaktive Elemente


#### A

- **← Hub** — class=`btn btn-ghost btn-small`, href=`../../index.html`

#### BUTTON

- **Atmosphere** — class=`tab-btn tab-btn-active`, type=`button`
- **Zbritjet** — class=`tab-btn`, type=`button`
- **Të reja** — class=`tab-btn`, type=`button`
- **❤️ 12** — class=`btn btn-ghost btn-small`, type=`button`
- **💬 3** — class=`btn btn-ghost btn-small`, type=`button`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/social/history.html

**Titel:** MENYRA – History (Placeholder)

**Zweck:** Social/User-Seiten – Login später.


### Interaktive Elemente


#### A

- **← Hub** — class=`btn btn-ghost btn-small`, href=`../../index.html`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/social/login.html

**Titel:** MENYRA – Social (Placeholder)

**Zweck:** Social/User-Seiten – Login später.


### Interaktive Elemente


#### A

- **← Hub** — class=`btn btn-ghost btn-small`, href=`../../index.html`

#### BUTTON

- **Einloggen** — class=`btn btn-primary`, type=`button`
- **Registrieren** — class=`btn btn-ghost`, type=`button`

#### INPUT

- **Email** — class=`input`, placeholder=`Email`
- **Passwort** — class=`input`, type=`password`, placeholder=`Passwort`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/social/profile-edit.html

**Titel:** MENYRA – Profil bearbeiten (Placeholder)

**Zweck:** Social/User-Seiten – Login später.


### Interaktive Elemente


#### A

- **← Hub** — class=`btn btn-ghost btn-small`, href=`../../index.html`

#### BUTTON

- **Speichern** — class=`btn btn-primary`, type=`button`

#### INPUT

- **Vorname** — class=`input`, placeholder=`Vorname`
- **Nachname (1 Buchstabe)** — class=`input`, placeholder=`Nachname (1 Buchstabe)`
- **Instagram Link** — class=`input`, placeholder=`Instagram Link`
- **TikTok Link** — class=`input`, placeholder=`TikTok Link`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/social/profile.html

**Titel:** MENYRA – Profil (Placeholder)

**Zweck:** Social/User-Seiten – Login später.


### Interaktive Elemente


#### A

- **← Hub** — class=`btn btn-ghost btn-small`, href=`../../index.html`

#### BUTTON

- **Follow** — class=`btn btn-primary`, type=`button`
- **👍 Like** — class=`btn btn-ghost`, type=`button`
- **IG** — class=`btn btn-ghost`, type=`button`
- **TikTok** — class=`btn btn-ghost`, type=`button`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


# OWNER


## apps/owner/admin.html

**Titel:** MENYRA – Owner Admin

**Zweck:** Kunden-Admin (Owner) – Login später.


### Interaktive Elemente


#### A

- **🏠 Dashboard** — class=`is-active`, href=`#`
- **🧾 Bestellungen** — href=`#`
- **🍽️ Menü / Produkte** — href=`#`
- **⭐ Angebote** — href=`#`
- **⚙️ Einstellungen** — href=`#`

#### BUTTON

- **☰** — class=`m-icon-btn m-burger-btn`, type=`button`, aria-label=`Menü öffnen`
- **🌓** — class=`m-icon-btn`, type=`button`
- **⏻ Logout** — class=`m-ghost-btn`, type=`button`
- **Export** — class=`m-btn m-btn--ghost`, type=`button`
- **+ Neues Produkt** — class=`m-btn`, type=`button`

#### INPUT

- **Suche (Produkte, Gerichte, Bestellungen)...** — class=`m-search-input`, placeholder=`Suche (Produkte, Gerichte, Bestellungen)...`

#### SELECT

- **Sprache** — class=`m-select m-select--topbar`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/owner/login.html

**Titel:** MENYRA – Owner Login

**Zweck:** Kunden-Admin (Owner) – Login später.


### Interaktive Elemente


#### BUTTON

- **Einloggen** — class=`m-btn`, type=`button`
- **Demo öffnen** — class=`m-btn m-btn--ghost`, type=`button`

#### INPUT

- **owner@kunde.com** — id=`ownerEmail`, type=`email`, placeholder=`owner@kunde.com`
- **••••••••** — id=`ownerPass`, type=`password`, placeholder=`••••••••`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


# STAFF


## apps/staff/kamarieri.html

**Titel:** MENYRA – Kamarieri (Placeholder)

**Zweck:** Kellner/Staff – Login später.


### Interaktive Elemente


#### A

- **← Hub** — class=`btn btn-ghost btn-small`, href=`../../index.html`

#### BUTTON

- **Ok** — class=`btn btn-primary btn-small`, type=`button`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/staff/login.html

**Titel:** MENYRA – Staff (Placeholder)

**Zweck:** Kellner/Staff – Login später.


### Interaktive Elemente


#### A

- **← Hub** — class=`btn btn-ghost btn-small`, href=`../../index.html`

#### BUTTON

- **Einloggen** — class=`btn btn-primary`, type=`button`

#### INPUT

- **Code/Email** — class=`input`, placeholder=`Code/Email`
- **Passwort** — class=`input`, type=`password`, placeholder=`Passwort`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


# STAFFADMIN


## apps/staffadmin/dashboard.html

**Titel:** MENYRA – Staff Admin

**Zweck:** Dein Team (Franchise/Staff Admin) – Login später.


### Interaktive Elemente


#### A

- **📊 Dashboard** — class=`is-active`, href=`#`
- **🏪 Meine Kunden** — href=`#`
- **🎯 Meine Leads** — href=`#`

#### BUTTON

- **☰** — class=`m-icon-btn m-burger-btn`, type=`button`, aria-label=`Menü öffnen`
- **⏻ Logout** — class=`m-ghost-btn`, type=`button`
- **+ Neuer Lead** — class=`m-btn`, type=`button`

#### INPUT

- **Suche (Kunden, Leads)...** — class=`m-search-input`, placeholder=`Suche (Kunden, Leads)...`

#### SELECT

- **Sprache** — class=`m-select m-select--topbar`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/staffadmin/login.html

**Titel:** MENYRA – Staff Admin Login

**Zweck:** Dein Team (Franchise/Staff Admin) – Login später.


### Interaktive Elemente


#### BUTTON

- **Einloggen** — class=`m-btn`, type=`button`
- **Demo öffnen** — class=`m-btn m-btn--ghost`, type=`button`

#### INPUT

- **staff@menyra.com** — id=`staffEmail`, type=`email`, placeholder=`staff@menyra.com`
- **••••••••** — id=`staffPass`, type=`password`, placeholder=`••••••••`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


# PLATFORM


## apps/platform/dashboard.html

**Titel:** MENYRA – Superadmin Dashboard

**Zweck:** CEO/Platform Admin – Login später.

**Wichtige Container (IDs):** `mobileMenu`


### Interaktive Elemente


#### A

- **Dashboard** — class=`is-active`, href=`#`
- **Kunden** — href=`#`
- **Leads** — href=`#`
- **Angebote** — href=`#`
- **Abrechnung** — href=`#`
- **Benutzer** — href=`#`
- **System-Logs** — href=`#`
- **Einstellungen** — href=`#`

#### BUTTON

- **☰** — id=`burgerToggle`, class=`m-icon-btn m-burger-btn`, type=`button`, aria-label=`Menü öffnen`
- **🌓** — id=`themeToggle`, class=`m-icon-btn`, type=`button`
- **⏻ Logout** — id=`logoutButton`, class=`m-ghost-btn`, type=`button`
- **CSV Export** — class=`m-btn m-btn--ghost`, type=`button`
- **+ Neues Restaurant** — class=`m-btn`, type=`button`
- **+ Neuer Kunde** — class=`m-btn`, type=`button`
- **‹ Zurück** — class=`m-ghost-btn`, type=`button`
- **Weiter ›** — class=`m-ghost-btn`, type=`button`
- **+ Neuer Lead** — id=`addLeadBtn`, class=`m-btn`, type=`button`
- **+ Neues Angebot** — class=`m-btn`, type=`button`
- **+ Superadmin** — id=`addSuperadminBtn`, class=`m-btn`, type=`button`
- **✕** — id=`restaurantFormClose`, class=`m-icon-btn m-modal-close`, type=`button`
- **Abbrechen** — id=`restaurantFormCancel`, class=`m-ghost-btn`, type=`button`
- **Speichern** — class=`m-btn`, type=`submit`
- **✕** — id=`leadFormClose`, class=`m-icon-btn m-modal-close`, type=`button`
- **Abbrechen** — id=`leadFormCancel`, class=`m-ghost-btn`, type=`button`
- **✕** — id=`superadminFormClose`, class=`m-icon-btn m-modal-close`, type=`button`
- **Abbrechen** — id=`superadminFormCancel`, class=`m-ghost-btn`, type=`button`
- **✕** — id=`mobileMenuClose`, class=`m-mobile-menu-close`, type=`button`, aria-label=`Menü schließen`
- **🌓** — id=`mobileThemeToggle`, class=`m-icon-btn`, type=`button`

#### INPUT

- **Suche in MENYRA (Restaurants, Inhaber, Städte)…** — id=`topSearch`, class=`m-search-input`, type=`text`, placeholder=`Suche in MENYRA (Restaurants, Inhaber, Städte)…`
- **Kunden nach Name, Stadt oder Inhaber filtern…** — id=`restaurantSearch`, class=`m-search-input`, type=`text`, placeholder=`Kunden nach Name, Stadt oder Inhaber filtern…`
- **(ohne Text)** — id=`restaurantId`, type=`hidden`
- **(ohne Text)** — id=`restaurantName`, type=`text`
- **(ohne Text)** — id=`priceValue`, type=`number`
- **(ohne Text)** — id=`restaurantOwnerName`, type=`text`
- **(ohne Text)** — id=`restaurantOwnerPhone`, type=`tel`
- **(ohne Text)** — id=`restaurantCity`, type=`text`
- **(ohne Text)** — id=`restaurantCountry`, type=`text`
- **(ohne Text)** — id=`restaurantPlanName`, type=`text`
- **(ohne Text)** — id=`restaurantExpensesYear`, type=`number`
- **(ohne Text)** — id=`leadId`, type=`hidden`
- **(ohne Text)** — id=`leadBusinessName`, type=`text`
- **@accountname oder Link** — id=`leadInstagram`, type=`text`, placeholder=`@accountname oder Link`
- **+383 …** — id=`leadPhone`, type=`tel`, placeholder=`+383 …`
- **(ohne Text)** — id=`superadminId`, type=`hidden`
- **(ohne Text)** — id=`superadminName`, type=`text`
- **(ohne Text)** — id=`superadminEmail`, type=`email`
- **https://…** — id=`superadminAvatarUrl`, type=`url`, placeholder=`https://…`
- **Suche in MENYRA (Restaurants, Inhaber, Städte)…** — id=`mobileTopSearch`, class=`m-search-input`, type=`text`, placeholder=`Suche in MENYRA (Restaurants, Inhaber, Städte)…`

#### TEXTAREA

- **Kurz notieren, was der Kunde beim Gespräch gesagt hat…** — id=`leadNote`, placeholder=`Kurz notieren, was der Kunde beim Gespräch gesagt hat…`

#### SELECT

- **(ohne Text)** — id=`langSelect`, class=`m-select m-select--topbar`
- **(ohne Text)** — id=`statusFilter`, class=`m-select`
- **(ohne Text)** — id=`typeFilter`, class=`m-select`
- **(ohne Text)** — id=`customerType`
- **(ohne Text)** — id=`billingModel`
- **(ohne Text)** — id=`restaurantStatus`
- **(ohne Text)** — id=`leadCustomerType`
- **(ohne Text)** — id=`leadStatus`
- **(ohne Text)** — id=`mobileLangSelect`, class=`m-select`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben


## apps/platform/login.html

**Titel:** MENYRA – Platform Login

**Zweck:** CEO/Platform Admin – Login später.


### Interaktive Elemente


#### BUTTON

- **Einloggen** — class=`m-btn`, type=`button`
- **Demo öffnen** — class=`m-btn m-btn--ghost`, type=`button`

#### INPUT

- **name@menyra.com** — id=`email`, type=`email`, placeholder=`name@menyra.com`
- **••••••••** — id=`password`, type=`password`, placeholder=`••••••••`

#### SELECT

- **Sprache** — class=`m-select m-select--topbar`

### Später ändern wir hier typischerweise

- Texte/Labels
- Welche Buttons wohin navigieren
- Welche Bereiche dynamische Daten bekommen
- Welche Elemente wir entfernen/verschieben

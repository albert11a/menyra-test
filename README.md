# MENYRA – System 1 (Restaurant/Café) – Projekt-README (m1.8)

Stand: 2025-12-23 (Europe/Vienna)  
Scope: **nur System 1** = **Restaurant + Café** (QR-Menü + Bestellung + Admins).  
Ziel: **erweiterbar** (später System 2: E‑Commerce, System 3: Hotels, …) ohne Chaos.

---

## 1) Was ist in m1.8 drin?

### Rollen / Apps
- **CEO Platform** (Albert): sieht **alle** Kunden, kann Kunden anlegen & verwalten.
- **Staff Platform**: kann Kunden anlegen, sieht **nur eigene** Kunden (scoped).
- **Owner Admin**: Admin für *einen* Kunden (Menü/Offers pflegen – eingeschränkt).
- **Guest**: QR-Menü / Karte / Details / Bestellung (Browser).
- **Waiter (Kamarieri)**: Platzhalter (UI-Dateien existieren, Logik TODO).
- **Kitchen (Kuzhina)**: Platzhalter (UI-Dateien existieren, Logik TODO).

### Guest Flow (funktional)
- **karte**: Menü + Kategorien + „Sot në fokus“ Bereich (Offers) + Search.
- **detajet**: Item-Detailseite.
- **porosia**: Warenkorb/Bestellübersicht + Bestellung senden → schreibt in Firestore.
- **story**: Platzhalter (TODO).

### Admin (funktional / teilweise)
- Kundenliste + Erstellen (CEO/Staff)
- QR & Links Modal (Links zu Guest/Owner/Waiter/Kitchen inkl. Tisch-Template)
- Menü & Offers: Grundstruktur vorhanden (publishing zu `public/*` für Guest-Performance)
- Leads: Struktur in Core vorhanden (je nach View/HTML verfügbar)

> Hinweis: Auth-Schutz (Login) ist **noch nicht** final umgesetzt → aktuell „Dev-Mode“.

---

## 2) Ordnerstruktur (Systeme sauber getrennt)

```
/index.html            -> Test Hub (Kunden auswählen, Links testen)
/index.js

/shared/               -> system-übergreifend (nur kleine, stabile Basics)
  /firebase-config.js  -> Firebase v11 Init + db/auth
  /styles/
    base.css
    ui-kit.css
  /i18n/
    i18n.js, de.js, en.js, sq.js

/apps/
  /_shared/            -> UI-Hülle, die mehrere Admins nutzen dürfen
    /admin-shell/
      admin-shell.css
      admin-shell.js

  /menyra-ceo/         -> CEO Platform (eigene App)
    dashboard.html
    menyra_platform.css
    menyra_platform.js

  /menyra-staff/        -> Staff Platform (eigene App)
    dashboard.html
    menyra_platform.css
    menyra_platform.js

  /menyra-restaurants/  -> SYSTEM 1 (Restaurant/Café)
    /_shared/           -> nur System-1 Shared (Guest + Admin Helpers)
      /admin/
        platform-admin-core.js
      /core/
        context.js
        nav.js
        boot/guest-boot.js
      /firebase/
        public.js
        orders-guest.js (teilweise / TODO je nach Datei)
        orders-staff.js (TODO)
        owner.js (TODO)
        stories.js (TODO)
        guestbook.js (TODO)

    /guest/
      /_shared/
        guest-core.js
        guest.js
        guest.css
      /karte/    -> karte/index.html + karte.js + karte.css
      /detajet/  -> detajet/index.html + detajet.js + detajet.css
      /porosia/  -> porosia/index.html + porosia.js + porosia.css
      /story/    -> story/index.html + story.js + story.css (TODO)

    /owner/
      index.html
      menyra_platform.css
      menyra_platform.js

    /waiter/      -> Platzhalter
      index.html, waiter.js/css

    /kitchen/     -> Platzhalter
      index.html, kitchen.js/css
```

**Warum so?**  
- `shared/` bleibt **klein** (Firebase + Styles + i18n) → wenig Bug-Risiko.  
- `apps/menyra-restaurants/_shared/` ist **nur System 1** → später System 2/3 können eigene `_shared` haben.  
- Guest-Pages haben **eigene JS/CSS pro Seite** + gemeinsamer `guest-core.js` für wiederverwendbare Logik.

---

## 3) URL-Konventionen (wichtig)

### Guest (QR)
- Karte:  
  `apps/menyra-restaurants/guest/karte/index.html?r=<restaurantId>&t=<tableId>`
- Detail:  
  `.../detajet/index.html?r=<restaurantId>&t=<tableId>&id=<itemId>`
- Porosia:  
  `.../porosia/index.html?r=<restaurantId>&t=<tableId>`

### Admin Links (aus QR & Links Modal)
- Owner:  
  `apps/menyra-restaurants/owner/index.html?r=<restaurantId>`
- Waiter:  
  `apps/menyra-restaurants/waiter/index.html?r=<restaurantId>`
- Kitchen:  
  `apps/menyra-restaurants/kitchen/index.html?r=<restaurantId>`

---

## 4) Firestore Datenmodell (System 1)

### Restaurants (Kunden)
Collection: `restaurants`

Document Felder (bei Create):
- `name`, `type` (cafe|restaurant)
- `city`, `phone`, `ownerName`
- `tableCount`
- `yearPrice`, `status`
- `slug`, `logoUrl`
- `system: "system1"`
- `createdByUid`, `createdByRole` (ceo|staff)
- `scopeStaffId` (nur wenn staff erstellt hat)
- `createdAt`, `updatedAt`

### Public Docs (Guest „fast read“ – 1 Doc)
- `restaurants/<rid>/public/meta`
- `restaurants/<rid>/public/menu`  → `{{ items: [...] }}`
- `restaurants/<rid>/public/offers` → `{{ items: [...] }}`

### Canonical (Editor-Quelle)
- `restaurants/<rid>/menuItems/<itemId>`
- `restaurants/<rid>/offers/<offerId>`
- `restaurants/<rid>/orders/<orderId>`  *(Guest sendet Bestellungen hier)*

### Leads (CEO/Staff)
- `leads/<leadId>`  
Staff sieht nur Leads, wo `scopeStaffId == staffUid` (so ist es im Core gedacht).

---

## 5) Kostengünstig (Reads/Performance)

**Prinzip**
- Guest liest primär **1 Dokument**: `public/menu` (und `public/offers`)  
- Nur wenn `public/*` fehlt/leer → Fallback liest Subcollection (teurer)  
- Danach soll Admin/Tool `public/*` wieder „publishen“, damit Guest dauerhaft billig bleibt.

**Caching (Guest)**
- `guest-core.js` nutzt LocalStorage Cache/TTL (je nach Abschnitt) damit Reloads weniger Reads verursachen.

---

## 6) „Menü gemischt“ – warum passiert das?

Ursache ist fast immer:
- Items haben kein klares Feld `type` (`"drink"` oder `"food"`) **oder**
- deine alten Items nutzen andere Feldnamen (`category`, `group`, `typ`, …)

**Empfehlung (stabilste Lösung):**
- Jedes Item speichert **immer**:
  - `type: "drink"` oder `type: "food"`
  - optional `category` (z.B. “Cocktails”, “Pizza”)

Dann ist die Trennung **immer** korrekt – ohne Heuristik.

---

## 7) Was ist noch TODO (Backlog)

### Security / Login (Phase „Pro“)
- CEO/Staff/Owner nur mit Firebase Auth zugänglich
- Rollen-Mapping in Firestore (z.B. `platformAdmins/<uid>`, `restaurants/<rid>/staff/<uid>`)

### Waiter & Kitchen
- Live Orders (nur „Speisen“ in Kitchen)
- Status-Updates pro Order (accepted / preparing / ready / served)

### Story + Bunny CDN
- Upload-Gateway (Bunny Edge Script) → keine Keys im Browser
- Stories sind **max. 15s** pro Video, **max. 10 aktiv**, **TTL 24h** (damit Kosten klein bleiben)

**Implementiert (v2.0 + Story Step 2/3):**
1) **Owner Upload-Flow** (`/apps/menyra-restaurants/owner/` → View „Stories“)
   - Owner wählt Video (oder nimmt am Handy auf)
   - Dauer-Check (≤ 15s)
   - Check „aktive Stories < 10“ (Firestore)
   - POST `${BUNNY_EDGE_BASE}/story/start` → TUS Upload
   - Firestore speichern: `restaurants/{rid}/stories/{autoId}`
     - `libraryId`, `videoId`, `createdAt`, `expiresAt` (+24h), `createdByUid`, `status:"processing"`, `embedUrl`
2) **Guest Story** (`/apps/menyra-restaurants/guest/story/index.html?r=<restaurantId>`)
   - lädt nur aktive Stories (`expiresAt > now`)
   - zeigt Videos als „Story Feed“ (vertical snap)
3) **Cleanup nach 24h**
   - Owner-UI hat „Cleanup“ Button
   - Zusätzlich läuft beim Owner-Login **max. 1×/Tag pro Restaurant** ein Cleanup:
     - abgelaufene Stories finden
     - für jede `videoId` → POST `${BUNNY_EDGE_BASE}/story/delete`
     - Firestore Story löschen

**Konfig:**
- Bunny Edge Base URL: `/shared/bunny-edge.js` (`BUNNY_EDGE_BASE = "https://menyra-xr1gb.bunny.run"`)
- Firestore-Helper: `/apps/menyra-restaurants/_shared/firebase/stories.js`

### Guestbook/Comments
- optional Upload Foto im Kommentar (später)

---

## 8) Lokales Starten (Dev)
1. Projekt in VS Code öffnen  
2. Live Server starten (oder irgendein static server)  
3. Öffne: `/index.html` → Kunde auswählen → Links testen

---

## 9) Nächste sinnvolle Schritte (damit es „fertig“ wirkt)
1. **Menü-Daten normalisieren** (einmalig): `type` setzen oder Migration-Tool bauen  
2. Admin: **Menu/Offers Editor sauber publishen** nach `public/*`  
3. Waiter/Kitchen minimal live Orders (onSnapshot)  
4. Auth/Rules (damit es online sicher ist)

---

Wenn du dieses README in `README.md` übernehmen willst: einfach komplett ersetzen.

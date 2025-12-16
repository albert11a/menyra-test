# MENYRA – Vorhaben (Bauplan)

Dieses Repository ist ein **Dummy/Placeholder-System**, damit wir **Design & Struktur** komplett sehen können.
Danach bauen wir Schritt für Schritt die echte Logik (Firestore/Firebase Auth/Storage, Rules, etc.).

## Ziel-Märkte (Hauptfokus)
Kosovo, Albanien, Nordmazedonien, Montenegro, Serbien  
→ deshalb sind **WhatsApp/Viber**, **mehrsprachige UI**, **Cash/Counter als Standard**, und **schnelle QR-Flows** zentral.

---

## Kundentypen (Verticals)
1. **Gastro – Tischservice** (Restaurant/Café/Bar/Club)  
2. **Gastro – Fastfood/Pickup** (KFC‑Style, ohne Tischservice)  
3. **Hotel** (Zimmer QR + Requests/Housekeeping, optional Spa/Roomservice)  
4. **Motel** (wie Hotel, aber Privacy/Diskretion-Modus)  
5. **E‑Commerce Shop** (eigenes Layout + eigener Admin)  
6. **Dienstleistungen** (Barber, Auto, Studio, etc. – Public Page + Anfragen)

---

## Apps/ Bereiche
- **Platform Admin** (Superadmin): Kunden, Accounts, Module, Ads‑Freigabe, Moderation, Analytics
- **Owner Admin (Gastro)**
- **E‑Commerce Admin (Shop) (Shop)**
- **Hotel Admin**
- **Service Admin (Dienstleistungen) (Dienstleistungen)**
- **Staff Panels** (fokussiert): Gastro Orders, Fastfood Pickup, Hotel Housekeeping
- **Public Pages** (Website pro Kunde, ohne Bestellen)
- **Social** (User‑Accounts): Feed, Profile, Follow, Chat, Live, Gifts (erst Platzhalter)
- **PWA**: manifest + service worker (Platzhalter)

---

## Kern‑Features (später Logik)
### Orders
- Tischservice (Tisch‑QR)
- Pickup (Fastfood QR / Link)
- Delivery (später)

Zahlung standard: **mit Personal** (Cash/Counter).  
Kartenzahlung: **Platzhalter** (später bei 50–100 Kunden).

### Social (optional pro Kunde)
- Profile, Posts (Bild/Video), Likes/Kommentare
- Follow/Followers
- Chat (1:1)
- Live (Placeholder)
- Gifts (Rosen/Drinks) (Placeholder)
- “Wer ist gerade hier?” (Check‑In / Opt‑In)

### Ads Network (Facebook‑ähnlich)
- Kunden erstellen Kampagnen: Region + Budget + Ziel + Interests + Placements
- Ads erscheinen als **Card‑Slots** (wie normale Cards) im Menü/Shop/Feed
- Platform Admin: Freigabe/Review + Regeln

### “Mega” Features (stark aber simpel)
- **Loyalty / Stempelkarte**
- **Referrals** (User lädt Freunde ein)
- **Queue / Waitlist** (Club/Restaurant)
- **Digital Receipt + “Bewerte uns” Flow** (Google Reviews)
- **Smart Offers** (Happy Hour / Zeitplan)
- **Multi‑Location** (Ketten, später)

---

## Sprachen
UI ist **Deutsch als Default**, weitere Sprachen sind vorbereitet:  
sq, de, en, sr, bs, hr, cs, fr, it, es, da, tr  
In Dummy‑Phase: viele Texte sind noch **Deutsch/Fallback**.

---

## Nächste Dummy‑Schritte
- **Schritt 3:** Guest/Public/Social deutlich detailreicher (Ads Slots im Scroll, People‑Here, Pickup Flow, Hotel Room QR Requests, usw.)
- Danach: Firestore Datenmodell + Auth + Rules + echte Logik


---

## Extra Ideen (simpel, aber Balkan-strong)
- **WhatsApp/Viber Quick Actions:** Order/Queue/Reservation Bestätigung per Deep‑Link (ohne App‑Install).
- **Event‑Nights Scheduler:** DJ Night / Live Music / Shisha Specials als Featured Cards + RSVP (Dummy).
- **Birthday Club:** User kann Geburtstag setzen → automatischer Gutschein (optional).
- **Offline‑Menu Cache (PWA):** Menü/Shop 5–10 Min offline verfügbar (perfekt bei schwachem WLAN).
- **Split‑Bill (UI only):** Gäste teilen Rechnung – Zahlung bleibt beim Personal.
- **Top‑in‑City Feed:** „Beliebt in Prishtinë/Tirana“ (nur Ranking/Preview).
- **Instagram/TikTok Embed:** Creator‑Posts als Social Proof auf Public Page.
- **Staff QR Stickers Pack:** Druck‑Vorlagen (A6/A5/Stickers) + QR‑Generator (Platform).
## Mega Zusatzideen (regional & schnell umsetzbar)

- **WhatsApp/Viber Buttons** auf Public Page + Admin: „Jetzt reservieren / bestellen“
- **Google Reviews / Maps** als fixer Mehrwert (Public Page)
- **Happy Hour Scheduler** (Smart Offers) – sehr stark für Balkan-Lokale
- **VIP / Table Booking (Club)** als einfacher Request-Flow (kein Payment am Anfang)
- **Motel Privacy Mode** (minimaler Social/Tracking, diskrete Requests)
- **Digital Receipt + “Bewerte uns”** (nach Abschluss automatisch)
- **Loyalty** (Stempelkarte) pro Lokal/Shop – extrem conversion-stark
- **Referral Links** (Einladungen) – Wachstum ohne Ads Budget
- **Ads Netzwerk**: Ads erscheinen als Card im gleichen Design (Karte/Shop/Public/Feed)
- **Consent/Datenschutz Placeholder**: später sauber (EU), vor allem bei Tracking/Interessen

> Wichtig: In der Dummy-Phase machen wir alles sichtbar, aber ohne echte Tracking- oder Payment-Logik.

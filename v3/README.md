# MENYRA — Demo (Firestore + Bunny Stories)

Start: `index.html`

## Was ist jetzt drin?

1) **Guest Karte**: `apps/guest/karte.html`
   - QR Params: `?r=restaurantId&t=tableId`
   - lädt Restaurant + Offers aus Firestore
   - Button **Story** öffnet `apps/social/story.html`

2) **Social Story**: `apps/social/story.html`
   - lädt Stories aus Firestore: `restaurants/{restaurantId}/stories`
   - zeigt **Produkt-Tag** aus Story-Dokument (`product` Snapshot)

3) **Owner Admin Story Upload**: `apps/owner/admin.html`
   - Foto/Video wählen
   - Produkt auswählen
   - Upload:
     - Video via **Bunny Stream TUS** (Signature über Cloud Function)
     - Foto via **Bunny Storage** (Upload Proxy über Cloud Function)

4) **Seed Tool (Prince Coffee House)**: `tools/seed-prince.html`

## 1) Demo-Daten in Firestore schreiben

Öffnen:
`/tools/seed-prince.html` → Button „Daten schreiben“.

Danach testen:
`/apps/guest/karte.html?r=prince-coffe-house-001&t=A1`

## 2) Bunny Upload: Keys als Server-Secrets (wichtig)

**Nie** Bunny Keys/Passwörter im Browser speichern.

Die Upload-Bridge liegt in:
`functions/index.js`

Du brauchst folgende Env/Secrets (aus Bunny Dashboard):

- `BUNNY_STREAM_LIBRARY_ID` (bei dir: 568747)
- `BUNNY_STREAM_API_KEY` (Video Library AccessKey)
- `BUNNY_STREAM_CDN_HOST` (bei dir: vz-e3ced87e-921.b-cdn.net)
- `BUNNY_STORAGE_ZONE` (Storage Zone Name)
- `BUNNY_STORAGE_ACCESS_KEY` (Storage Zone Password)
- `BUNNY_IMAGES_CDN_HOST` (bei dir: Menyra.b-cdn.net)

Wenn die Functions deployt sind, funktionieren Uploads in:
`/apps/owner/admin.html?r=prince-coffe-house-001`

👉 **Setup Schritt-für-Schritt:** `docs/README_BUNNY_FUNCTIONS_SETUP.md`

## 3) Firestore Struktur (pro Kunde)

```
restaurants/{restaurantId}
  offers/{offerId}
  menuItems/{itemId}
  stories/{storyId}
```

Story Doc Beispiel:
`mediaType`, `videoId` (optional), `mediaUrl`, `imageUrl` (optional), `product` (Snapshot), `createdAt`, `expiresAt`

# MENYRA — Bunny Upload Bridge (Firebase Functions) Setup

Diese Demo nutzt **Firebase Cloud Functions**, damit deine Bunny Keys **nicht im Browser** landen.

## 0) Wichtig

- **Bunny Keys niemals im Frontend hardcoden.**
- Wenn du Keys irgendwo geteilt hast: **bitte in Bunny neu generieren** (Security).

## 1) Voraussetzungen

- Node.js **18+**
- Firebase CLI

```bash
npm i -g firebase-tools
firebase login
```

## 2) Functions Dependencies installieren

Im Projekt-Root:

```bash
cd functions
npm i
cd ..
```

## 3) Bunny Secrets in Firebase Runtime Config setzen (empfohlen, schlank)

> Ersetze die Werte in `<...>`.

```bash
firebase use menyra-c0e68

firebase functions:config:set \
  bunny.stream_library_id="<568747>" \
  bunny.stream_api_key="<BUNNY_STREAM_API_KEY>" \
  bunny.stream_cdn_host="<vz-e3ced87e-921.b-cdn.net>" \
  bunny.storage_zone="<menyra>" \
  bunny.storage_access_key="<BUNNY_STORAGE_ACCESS_KEY>" \
  bunny.storage_host="<storage.bunnycdn.com>" \
  bunny.images_cdn_host="<Menyra.b-cdn.net>"
```

## 4) Deploy Functions

```bash
firebase deploy --only functions
```

## 5) Test

1) Seed Demo Daten:

`/tools/seed-prince.html` → Button „Daten schreiben“

2) Owner Upload:

`/apps/owner/admin.html?r=prince-coffe-house-001`

3) Story ansehen:

`/apps/social/story.html?r=prince-coffe-house-001&t=A1`

## 6) Welche Functions gibt es?

- **Callable** `getStreamUploadSignature`
  - erzeugt Video in Bunny Stream
  - gibt TUS Header (Signatur + Expire) zurück
- **HTTP** `uploadStoryImage`
  - nimmt 1 Bild entgegen
  - lädt in Bunny Storage hoch
  - liefert die öffentliche CDN-URL zurück

Status: CURRENT
Last updated: 2026-06-17

# Schritt 74 - Restaurants Card Lead Details

## Ziel

Die normalen Restaurant-/Cafe-Karten im Tab `Restaurants` sollen die
freigegebene Card-Variante nutzen, ohne die oberen Swipe-/Best-Cards zu
veraendern. Beim Lead fuer Restaurant/Cafe sollen Titelbild, Oeffnungszeiten
und drei frei pflegbare Feature-Texte gepflegt werden koennen.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Neue Restaurant-List-Card fuer normale `Restaurants`-Listenitems.
  - Titelbild nutzt `titleImageUrl`/Cover-/Hero-Fallbacks, Logo bleibt eigenes
    Rundbild.
  - `Profil` oeffnet das Restaurant-Profil, `Menu` oeffnet den Menu-Tab.
  - Feature-Chips lesen die drei gepflegten Texte oder kompatible Alt-Felder.
- `apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`
  - Marketplace-Open-Handler reicht den gewuenschten Profil-Top-Tab weiter.
- `apps/menyra-social/core/leads/lead-save-utils.js`
  - Lead-Speicherung uebernimmt Titelbild, Oeffnungszeiten und drei
    Card-Feature-Texte in Lead- und Restaurant-Payloads.
- `apps/menyra-social/core/crm/crm-runtime-controller.js`
  - CRM-Lead-Drafts, Normalisierung und Public-Meta-Handoff kennen die neuen
    Card-Felder.
- `apps/menyra-social/_shared/crm-lazy-renderers.js`
  - Inline-Lead-Erstellung zeigt Titelbild-Upload und Restaurant-Card-Felder.
- `apps/menyra-social/core/leads/lead-modal-render-utils.js`
  - Legacy-Lead-Modal zeigt dieselben Titelbild-/Card-Felder.
- `apps/mnyra-heart/heart-crm-admin-read-view.js`
  - Heart-Lead-Editor zeigt Titelbild-Upload und Restaurant-Card-Felder.
- `apps/mnyra-heart/heart-crm-admin-read-loaders.js`
  - Heart normalisiert neue Lead-/Restaurant-Card-Felder.
- `apps/mnyra-heart/heart-crm-admin-write-adapter.js`
  - Heart schreibt und synchronisiert Titelbild-Dateien und Card-Felder.
- `apps/mnyra-heart/heart-crm-admin-shell-consumer.js`
  - Heart-Leads-Domain stellt `setTitleImageFile` bereit.
- `apps/mnyra-heart/heart-events.js`
  - Heart verdrahtet Titelbild-Trigger und Datei-Input.
- `apps/mnyra-heart/heart.js`
  - Heart-Dateiwechsel leitet Titelbild-Dateien an die Leads-Domain weiter.
- `apps/menyra-social/core/leads/lead-convert-utils.js`
  - Lead-zu-Kunde-Konvertierung erhaelt neue Card-Felder.
- `apps/menyra-social/core/crm/crm-admin-facade-contract.js`
  - CRM-Facade-Vertrag dokumentiert die neuen State-/UI-Felder.
- `apps/menyra-social/bundled/**`
  - Social-Bundle nachgezogen, inklusive neuer CRM-/Marketplace-Chunk-Hashes.

## Bewusst Nicht Geaendert

- Keine Aenderung an den oberen Swipe-/Best-Cards im Restaurants-Tab.
- Keine Aenderung an Travel-, Hotel-, Shopping- oder anderen Marketplace-Cards.
- Keine Aenderung an QR, Cart, Order, Routing-Vertrag, Firebase Rules oder
  Functions.
- Kein Smoke-/Playwright-Lauf durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist bewusst auf die normalen Restaurant-/Cafe-List-Cards und die
dazugehoerigen Lead-/Heart-Felder begrenzt. Rest-Risiko liegt in der manuellen
Sichtpruefung echter Restaurantdaten und im manuellen Test eines neuen
Titelbild-Uploads.

## Verifikation

- `node --check` fuer alle geaenderten Source-Dateien.
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
  - Ergebnis: `social-app.js` 1,049,995 Bytes raw / 284,998 Bytes gzip.

## Manuelle Testliste

- In `Restaurants` eine normale Restaurant-/Cafe-List-Card pruefen: Titelbild,
  Logo, Oeffnungszeiten und drei Feature-Chips sollen erscheinen.
- Pruefen, dass die oberen Swipe-/Best-Cards unveraendert aussehen.
- Auf `Profil` klicken: Das Restaurant-Profil soll oeffnen.
- Auf `Menu` klicken: Das Restaurant-Profil soll direkt im Menu-Tab oeffnen.
- In Heart oder Social einen Restaurant-/Cafe-Lead erstellen oder bearbeiten:
  Titelbild hochladen, Oeffnungszeiten und drei Feature-Texte eintragen,
  speichern und danach in der Restaurant-Card wiederfinden.

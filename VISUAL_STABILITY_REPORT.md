Status: CURRENT
Branch: launchready2027
Stand: 2026-06-29

# Visual Stability Report

## Ausgefuehrt

- Lokaler Static-Server gegen `dist`.
- Playwright/Heart Guest-Pack mit mobiler Ansicht.
- Artifact nach Harness-Fix: `tests/mnyra-heart-runner/artifacts/guest-pack-20260629053303`.

## Nicht ausgefuehrt

- Keine 0.0s/0.5s/1.0s/2.0s/5.0s Screenshot-Serie pro Route.
- Kein echter Slow-Network-Lauf.
- Kein Staging-Login fuer User A/B/Business/Staff/Waiter/Owner/CEO.
- Keine Production-Mutationen.

## Lokaler QR/Menu Befund

- URL blieb nach Harness-Fix korrekt auf `/apps/menyra-social/index.html?tab=menu&src=qr&r=10Z8UNFsx4ha5wnZIloy&table=1`.
- Menu wurde sichtbar.
- Keine Page Errors, keine Console Errors.
- Screenshot zeigte:
  - Restaurant-Profil `Gjakova Grill`.
  - Menu-Tab aktiv.
  - Bottom-Bar liegt sichtbar ueber Content.
  - Produktkarten zeigen grosse graue Bildplatzhalter.
  - Nur 2 Produkte wurden vom Runner erkannt.
  - Ein Produktname wirkt wie eine UID (`aklBkkIuZ7Nrpx266TJn63rrxX62`) statt ein echtes Produkt.
- Cart-Vorbereitung durch Runner fehlgeschlagen.

## Bewertung nach Pflichtregel

- Skeleton/Loading ist okay.
- Falsche oder unvollstaendige Daten sind nicht okay.
- Der lokale QR/Menu-Lauf ist daher nicht bestanden.

## Account-Wechsel/Cache

Statische Codebasis:

- `resetUserScopedState()` setzt viele user-spezifische State-Bereiche zurueck.
- Auth Shell Snapshot ist UID-gebunden.
- Avatar Cache ist UID-gebunden.

Nicht verifiziert:

- Echter User A -> Logout -> User B -> Business -> Staff/Waiter Browserlauf.
- Altes Profilbild/Name/Header in den ersten Sekunden.
- Browser Back nach Logout/Login.

## Image/Layout Risiken

- Platzhalter im QR/Menu sichtbar.
- Bildcontainer scheinen stabile Flaechen zu haben, aber Daten/Bildvollstaendigkeit nicht belegt.
- Product/Card Interaktion nicht stabil genug fuer Runner.

## Naechste Visual Gates

1. Staging-QR-Route mit Seed-Restaurant und 20+ Produkten.
2. Screenshot-Serie 0.0s/0.5s/1.0s/2.0s/5.0s fuer QR/Menu, Public Restaurant, Product Modal, Cart.
3. Account-Wechsel mit User A/B/Business.
4. Slow-4G QR/Menu.
5. Assert: nie falscher Avatar, Name, Restaurant, Table oder alter Cart.


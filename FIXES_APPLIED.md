Status: CURRENT
Branch: launchready2027
Stand: 2026-06-29

# Fixes Applied

## Fix 1: Node-kompatible i18n Imports

- Dateien:
  - `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
  - `apps/menyra-social/core/app-shell/shell-dom-runtime-controller.js`
- Problem: Browser-absoluter Import `/shared/i18n/i18n.js` brach Node-Tests auf Windows.
- Aenderung: Import auf relativen Pfad `../../../../shared/i18n/i18n.js` geaendert.
- Risiko: niedrig; Browser-Aufloesung bleibt aequivalent, Node-Tests funktionieren.
- Verifikation: `node --test tests\\*.test.mjs` gruen.

## Fix 2: Deadline-Wrapper startet Public-Profile Tasks sofort

- Datei: `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- Problem: Public Business Posts initial read wurde erst im Microtask gestartet, wodurch concurrent visible reads nicht sofort dedupliziert wurden.
- Aenderung: `runPublicProfileLoadWithDeadline()` ruft die Task synchron auf und wrappt Exceptions in Promise-Rejections.
- Risiko: niedrig/mittel; Timing wird deterministischer, vorhandene Tests decken den betroffenen Flow ab.
- Verifikation: `public business posts initial page dedupes concurrent visible reads` gruen; gesamte Node-Test-Suite gruen.

## Fix 3: Lokale Guest-Runner QR-URL korrigiert

- Datei: `tests/mnyra-heart-runner/config/local-guest-config.json`
- Problem: URL `/apps/menyra-social/?...` wurde vom App-Router als Slug `menyra-social` interpretiert.
- Aenderung: URL auf `/apps/menyra-social/index.html?...` gesetzt.
- Risiko: niedrig; nur lokaler Test-Harness.
- Verifikation: Guest-Pack blieb danach auf korrekter URL und erkannte Menu sichtbar statt falscher Landing/0 Produkte.
- Restfehler: Guest-Pack erkennt nur 2/27 Produkte und Cart scheitert.

## Nicht gefixt in diesem Schritt

- P0 Order Security.
- P0 Counter Security.
- P1 Bundle Budget.
- P1 SEO/Launch-Dateien.
- P1 Staging/Emulator-Konfiguration.
- P1 QR/Menu Produktvollstaendigkeit und Cart-Runner-Fehler.


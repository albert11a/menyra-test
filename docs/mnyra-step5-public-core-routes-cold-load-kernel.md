Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 5: Public-Core-Routen Cold-Load-Kern

## Schrittziel

Kleiner website-first Performance-Schritt fuer:

- `/:slug`
- `/:slug/menu`
- `/:slug/posts`

Ziel: Beim oeffentlichen Hard-Reload weniger unnoetige Initial-Arbeit ausfuehren, ohne sichtbare UI-/Design-Aenderung.

## Was geaendert wurde

1. Fruehes Inline-Bootstrap-Fetch wurde fuer normale Public-Web-Direct-Core-Routen deaktiviert.
2. QR-Start bleibt unveraendert: QR-Pfade (`src=qr`) sind davon ausgenommen.
3. Der spaetere Startup-Fallback-Fetch im Auth-Session-Startup wurde fuer denselben Web-Direct-Guest-Profile-Pfad unterdrueckt.

## Geaenderte Dateien

- `apps/menyra-social/index.html`
- `apps/menyra-social/core/auth/auth-session-startup-coordinator.js`

## Warum das den Cold-Load entlastet

- Fuer die drei Public-Core-Routen entfaellt jetzt der fruehe zusaetzliche Bootstrap-Netzwerkpfad beim kalten Start.
- Dadurch konkurriert weniger Nebenarbeit mit dem eigentlichen Route-First-Load.
- Gleichzeitig bleiben QR-Start und bestehende Routing-/Surface-Invarianten unangetastet.

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Kein Root-Umbau von `/`.
- `/login` nicht angefasst.
- Keine Routing-Grossumbauten.
- Keine Firebase-/Rules-/Functions-Refactors.
- Keine Smoke-/Playwright-Tests durch Codex.
- Keine QR-Route-Inkompatibilitaet eingefuehrt.

## Manuelle Testliste

1. Hard-Reload auf `/:slug`: Inhalt erscheint direkt ohne sichtbaren Umweg ueber Bootstrap-Fallback.
2. Hard-Reload auf `/:slug/posts`: Posts-Surface startet stabil und ohne fruehen Zusatz-Load-Ping.
3. Hard-Reload auf `/:slug/menu`: Menu-Surface startet stabil und ohne fruehen Zusatz-Load-Ping.
4. Echten QR-Link aus Menu-Editor scannen: Menu oeffnet weiterhin sofort und kompatibel.
5. Rueckwechsel von den Public-Core-Routen auf normale Feed-Nutzung kurz pruefen (keine sichtbare Regression).

## Bewertung

`sauber bestanden`

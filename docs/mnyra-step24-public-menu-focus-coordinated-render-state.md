Status: CURRENT
Last updated: 2026-04-30

# Schritt 24: Public Menu/Fokus koordinierter Render-State

## Ziel

Public Profile, `/:slug/menu`, QR-/Direct-Menu und Profilwechsel duerfen Menu
und Fokus nicht mehr als zwei sichtbare, nacheinander springende Oberflaechen
rendern. Wenn ein Fokus fuer das geladene Public-Menu gilt, muss er mit dem
Menu gemeinsam sichtbar werden. Wenn kein gueltiger Fokus verfuegbar ist, muss
das Menu ohne Fokus stabil rendern.

## Ursache

Der sichtbare Public-Menu-Pfad startete Menu- und Fokus-Reads zwar gemeinsam,
aber `loadMenuForRestaurant()` schrieb `state.menu` und renderte sofort, sobald
`restaurants/{restaurantId}/public/menu` fertig war. Der separate
`public/offers`-Read schrieb `state.focus` spaeter und konnte dadurch einen
sichtbaren Fokus-Block nachtraeglich oberhalb des bereits sichtbaren Menus
einblenden. Gleichzeitig gab es fuer spaete Async-Antworten keinen ausreichend
engen sichtbaren Ziel-Guard.

## Umsetzung

- Public-Menu-Surface-State bewertet Menu und Fokus jetzt gemeinsam fuer den
  aktuellen sichtbaren Restaurant-Zielkontext.
- Fokus bekommt explizite Statuswerte: `unknown`, `loading`, `ready`, `empty`,
  `error`, `hidden`.
- Fokus wird nur renderbar, wenn er zur aktuellen Public-Menu-Surface gehoert,
  vom Public-Fokus-Read stammt und gegen das geladene Menu gueltig ist.
- Fokus-Eintraege mit MenuItem-/Product-/Kategorie-Ziel werden gegen die
  geladenen Public-Menu-Items abgeglichen. Nicht gefundene Ziele werden fuer
  diesen Render-Zyklus als `empty`/ungueltig behandelt statt spaeter falsch zu
  highlighten.
- Der sichtbare Menu-Commit wartet, solange Fokus fuer dieselbe Public-Menu-
  Surface noch `unknown` oder `loading` ist. Danach wird genau eine stabile
  Entscheidung gerendert: Menu mit Fokus oder Menu ohne Fokus.
- Public-Menu- und Public-Fokus-Loader schreiben sichtbaren State nur noch,
  wenn der aktuelle Profile/Menu-Zielkontext weiter zur Antwort passt. Spaete
  Antworten duerfen Cache fuellen, aber nicht mehr das falsche sichtbare Profil
  mutieren.
- Fokus-Normalisierung bewahrt explizite Ziel-Felder (`menuItemId`,
  `productId`, Kategorie-Ziel), damit die Render-Surface die Gueltigkeit gegen
  das geladene Menu pruefen kann.

## Bewusst Nicht Geaendert

- Keine Firebase Rules, Functions, Deployments oder Migrationen.
- Kein QR-/Order-/Waiter-/Cart-Geschaeftsverhalten.
- Kein Menu-Editor-Write-Contract:
  `restaurants/{restaurantId}/menuItems` bleibt Authoring-Quelle,
  `restaurants/{restaurantId}/public/menu` bleibt Public-Read-Modell.
- Keine sichtbaren Layout-, Design-, Farb-, Typografie- oder UX-Aenderungen.
- Lead-Search-Pfad wurde nicht angefasst.
- Loading-Diagnostics bleiben unveraendert und damit weiterhin nur aktiv bei
  `localStorage.mnyraDebugLoading = "1"` oder `?mnyraDebugLoading=1`.

## Validierung

- `node --check` fuer alle geaenderten JS-/MJS-Dateien.
- `git diff --check`.
- Node-Tests fuer Public-Route/Route-Cache/Public-Menu-Surface.
- Lokaler Playwright-Probe gegen `http://127.0.0.1:5174` fuer:
  `/casarita/menu`, `/casarita/menu?focus=missing-item`,
  `/casarita/menu?src=qr&table=7`.
- Heart-Smoke-Pack wurde lokal mit `MNYRA_SOCIAL_BASE_URL=http://127.0.0.1:5174/`
  gestartet; der Pack blieb `warning/not_configured`, weil CEO-Zugangsdaten
  fehlen. Runtime-Diagnose selbst meldete keine Runtime-Errors.

## Bekannte Rest-Risiken

- Der lokale Browser-Probe nutzte den aktuell verfuegbaren `casarita`-Datensatz;
  dort war kein sichtbarer Public-Fokus vorhanden. Der gueltige Fokus-Pfad ist
  deshalb ueber Utility-Tests abgesichert und muss zusaetzlich manuell an einem
  Profil mit aktivem Fokus gegengeprueft werden.
- Vollstaendige Map-/Lead-/Business-Regression braucht echte Test-Credentials
  oder manuelle Nutzerpruefung.

## Bewertung

`bestanden mit Rest-Risiko`: Die zentrale Menu/Fokus-State-Entscheidung ist
jetzt deterministisch und restaurantId-geschuetzt. Das verbleibende Risiko ist
vor allem echte Datenabdeckung fuer Profile mit aktivem Fokus und manuelle
QR-/Lead-/Map-Browserregression.

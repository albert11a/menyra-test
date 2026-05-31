Status: CURRENT
Last updated: 2026-05-31

# Schritt 53 - Website-Sprachauswahl und sichtbare i18n-Grundlage

## Ziel

Die sichtbare Website-Oberflaeche soll ueber das bestehende Globe-Icon im Smart-Header
zwischen Albanisch, Deutsch und Serbisch in lateinischer Schrift umschaltbar sein.

## Geaendert

- `shared/i18n/i18n.js`
  - Zentrale Sprachruntime fuer `sq`, `de`, `sr`.
  - Sprache wird in `localStorage` gespeichert und auf `document.documentElement.lang`
    gespiegelt.
  - Albanisch und Serbisch werden als Lazy-Chunks geladen, damit das Social-Hauptbundle
    im Budget bleibt.
- `shared/i18n/sq.js`, `shared/i18n/sr.js`, `shared/i18n/de.js`
  - Albanische und serbisch-lateinische sichtbare Texte fuer Header, Navigation,
    Auth, Profil, Menu, Produktdetail, Kommentare, Likes, Favoriten und Warenkorb.
  - Deutsch nutzt bewusst die vorhandenen deutschen Fallback-Texte im Code, um keine
    zweite grosse deutsche Textkopie ins Hauptbundle zu legen.
- Smart-Header / Shell / Public-Profile / Menu / Overlays / Shop
  - Das bestehende Globe-Icon bleibt als Sprachbutton erhalten.
  - Beim Klick klappt unter der Header-Zeile eine Sprachleiste mit `Shqip`, `Deutsch`
    und `Srpski` aus.
  - Nach Sprachwahl wird die Sprache geladen, der Header wieder geschlossen und die
    Oberflaeche neu gerendert.
  - Sichtbare Website-Texte in den wichtigsten Public-Flows wurden an die Sprachruntime
    angebunden.
- Social-Bundle wurde neu gebaut; `sq` und `sr` erscheinen als eigene Lazy-Chunks.

## Bewusst Nicht Geaendert

- Das Globe-Icon wurde nicht entfernt und nicht durch sichtbaren Text ersetzt.
- Keine Route-, QR-, Cart-, Order-, Firebase-Rules- oder Functions-Aenderung.
- Keine neue Landingpage und kein breiter UI-Redesign-Schritt.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Die technische Umschaltung und Bundle-Grenze sind geprueft. Rest-Risiko bleibt bei
vereinzelten Admin-/CRM-/internen Spezialtexten, die nicht Teil der normalen Website-
Nutzung sind und spaeter in einem separaten Schritt nachgezogen werden koennen.

## Verifikation

- `node --check` fuer die geaenderten Runtime-/i18n-Module.
- Direkter Node-Import der Sprachruntime mit gemocktem `localStorage`:
  `sq -> Te preferuarat`, `sr -> Omiljeno`, `de -> Favoriten`.
- `npm run build`
- `npm run check:social-bundle`
- `git diff --check`

## Manuelle Testliste

- Auf `/:slug` oder `/:slug/menu` das Globe-Icon im Header antippen.
- Pruefen, dass der Header unterhalb der Hauptzeile aufklappt und die drei Sprachen zeigt.
- `Shqip` waehlen und sichtbare Navigation/Menu/Favoriten/Warenkorb-Texte pruefen.
- Globe erneut antippen, `Srpski` waehlen und serbisch-lateinische Texte pruefen.
- `Deutsch` waehlen und pruefen, dass die Oberflaeche wieder deutsch ist.
- Seite neu laden und pruefen, dass die zuletzt gewaehlt Sprache erhalten bleibt.

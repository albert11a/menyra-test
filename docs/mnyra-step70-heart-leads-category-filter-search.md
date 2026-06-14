Status: CURRENT
Last updated: 2026-06-15

# Schritt 70 - Heart Leads Category Filter Search

## Ziel

In Heart bei `Leads` soll oberhalb von `Lead suchen` ein Kategorie-Filter
stehen. Die Kategorien muessen dieselben sein wie beim Erstellen/Bearbeiten
eines Leads. Ausserdem soll die Lead-Suche auch dann sauber funktionieren, wenn
ein kompletter Begriff oder Text eingefuegt wird und nicht Buchstabe fuer
Buchstabe entsteht.

## Geaendert

- `apps/mnyra-heart/heart-crm-admin-read-view.js`
  - Neuer Lead-Kategorie-Select oberhalb der Suche.
  - Der Select nutzt `LEAD_TYPE_ORDER` und `LEAD_TYPE_LABELS`, also dieselbe
    Quelle wie das Lead-Erstellen-Formular.
  - Lead-Listen werden zusaetzlich nach Kategorie gefiltert.
  - Die Suche normalisiert und prueft Suchbegriffe tokenbasiert, damit
    eingefuegte ganze Woerter/Wortgruppen stabil matchen.
- `apps/mnyra-heart/heart-events.js`
  - Neuer Change-Handler fuer den Kategorie-Select.
  - Search-Inputs werden zusaetzlich auf `change` synchronisiert, damit
    eingefuegte/commitete Suchwerte nicht nur ueber einzelne `input`-Events
    funktionieren.
- `apps/mnyra-heart/heart-state.js`
  - `categoryFilter` wurde als Heart-CRM-Section-UI-State aufgenommen.
- `apps/mnyra-heart/heart.js`
  - Neue Operation `setCrmCategoryFilter`.

## Bewusst Nicht Geaendert

- Keine Aenderung an `social-app.js`.
- Keine neue Kategoriequelle und keine duplizierte Typ-Liste.
- Keine Aenderung an Lead-Erstellung, Lead-Speichern, Statuslogik oder CRM-
  Ladepfaden.
- Keine Aenderung an Restaurants/Travel/Shopping, Routing, QR, Cart, Order,
  Firebase Rules oder Functions.
- Kein Smoke-/Playwright-Lauf durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist bewusst auf Heart-Leads UI-State, Events und Read-Rendering
begrenzt. Rest-Risiko liegt in der manuellen Sichtpruefung, ob der neue Select
im echten Heart-Layout optisch wie gewuenscht sitzt.

## Verifikation

- `node --check apps/mnyra-heart/heart-crm-admin-read-view.js`
- `node --check apps/mnyra-heart/heart-events.js`
- `node --check apps/mnyra-heart/heart-state.js`
- `node --check apps/mnyra-heart/heart.js`
- Direkter Node-Render-Check fuer Heart-Leads:
  `data-crm-category` wird gerendert; Kategorie `restaurant` plus Suche
  `demo restaurant` zeigt den passenden Restaurant-Lead und filtert einen
  Hotel-Lead aus.
- `git diff --check`

## Manuelle Testliste

- Heart oeffnen und zu `Leads` gehen.
- Pruefen, dass oberhalb von `Lead suchen` der Filter `Kategorie` steht.
- Kategorie `Restaurant`, `Cafe`, `Fastfood`, `Hotel`, `Motel` und
  `E-Commerce` kurz pruefen.
- Einen kompletten Lead-Namen oder ein komplettes Wort in die Suche einfuegen
  und pruefen, dass die Liste sofort korrekt filtert.
- Kategorie-Filter und Suche kombiniert pruefen.

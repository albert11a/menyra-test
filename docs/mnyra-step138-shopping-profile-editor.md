Status: CURRENT
Last updated: 2026-06-27

# Schritt 138 - Shopping Profile Shop-Editor

## Schritt

Auf Nutzerwunsch wurden E-Commerce-/Shopping-Profile im Profil und Editor klar
als Shop-Katalog behandelt, ohne Restaurant-, Travel- oder andere Profiltypen
umzubauen.

## Geaendert

- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
  zeigt bei Shop-Profilen im Business-Profil-Tab `Shop` statt `Menue`.
- Der Shop-Editor zeigt fuer Shop-Profile nur noch `Alle` und `Produkte`; die
  `Getraenke`-/Varianten-Filter und -Sektion werden dort nicht mehr gerendert.
- Shop-Produkte werden im Editor in einer `Produkte`-Sektion angezeigt.
  Bestehende alte Shop-Eintraege mit Restaurant-Kategorien wie `Speisen` oder
  `Getraenke` werden visuell als Produkte behandelt.
- Restaurant Ads werden fuer Shop-/E-Commerce-Profile im Editor nicht mehr
  geladen oder angezeigt.
- `Sot ne Fokus` bleibt fuer Shop-Profile auf derselben UI wie bei Restaurants,
  aber weiter pro Shop-`restaurantId` getrennt.
- Der oeffentliche Shop-Tab wartet bei Shop-/E-Commerce-Profilen nicht mehr auf
  den Fokus-Truth, bevor Produkte gerendert werden. Ursache fuer den gemeldeten
  Haenger war, dass `menu.waitingForFocus` die Produktliste blockieren konnte,
  obwohl das oeffentliche Menue bereits Produkte hatte.
- `apps/menyra-social/core/menu/menu-modal-render-utils.js` versteckt bei
  Shop-Produkten die Restaurant-Typ-Auswahl und zeigt alte Restaurant-
  Kategorien als `Produkte`.
- `apps/menyra-social/core/menu/menu-save-utils.js` speichert Shop-Produkte
  stabil als `type: "food"` und `menuSection: "food"` und normalisiert alte
  Shop-Kategorien `Speisen`/`Getraenke` zu `Produkte`.
- `apps/menyra-social/index.html` setzt den App-Build-Token auf
  `2026-06-27-shopping-profile-editor-02`.
- Das Menyra-Social-Bundle wurde neu gebaut; dadurch wurden der Profil-
  Renderer-Chunk und Menu-Modal-Chunk mit neuen Hashes erzeugt.

## Bewusst Nicht Geaendert

- Keine Firebase Rules, Functions oder Firestore-Pfade geaendert.
- Keine Migration bestehender Daten; alte Shop-Eintraege werden nur im Shop-
  UI/Save-Pfad normalisiert.
- Der Shop-Tab liest weiter den bestehenden Public-Menue-Pfad
  `restaurants/{restaurantId}/public/menu`. Falls ein alter Shop nur
  Shopping-Card-Snapshots, aber noch kein publiziertes Public-Menue hat, muss
  ein Produkt einmal ueber den Shop/Menu-Editor gespeichert werden, damit der
  bestehende Publish-Pfad das Public-Menue schreibt.
- Keine Aenderung an Restaurant-/Cafe-Editor, Restaurant Ads fuer Restaurants,
  Restaurant-Speisen/Getraenke-Logik, Travel, Hotels, QR, Cart, Checkout,
  Orders, Routing oder Marketplace-Produktlogik.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex; der Nutzer testet
  manuell.

## Technische Pruefung

- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`:
  bestanden.
- `node --check apps/menyra-social/core/menu/menu-modal-render-utils.js`:
  bestanden.
- `node --check apps/menyra-social/core/menu/menu-save-utils.js`: bestanden.
- `npm run build:menyra-social:bundle`: bestanden.
- `npm run check:social-bundle`: nicht bestanden, weil der bestehende
  `entry/social-app.js` weiter ueber dem gesetzten Budget liegt
  (`1.120.182` raw / `303.739` gzip Bytes gegen `1.052.000` raw /
  `285.000` gzip Bytes).

## Manuell Testen

1. App hart neu laden, bei Bedarf mit `?sw-reset=1`.
2. Mit `?debug-build=1` pruefen, dass
   `2026-06-27-shopping-profile-editor-02` aktiv ist.
3. Ein E-Commerce-/Shop-Profil oeffnen: die Tabs sollen `Beitraege` und `Shop`
   zeigen.
4. Im Shop-Tab pruefen, dass vorhandene Produkte ohne Haenger auf
   `Shop wird geladen...` erscheinen.
5. Im Shop-Tab pruefen, dass `Sot ne Fokus` in derselben UI wie bei
   Restaurants erscheint, ohne die Produktliste zu blockieren.
6. Shop/Menu-Editor oeffnen: `Restaurant Ads` darf nicht sichtbar sein.
7. Im Produktbereich duerfen keine `Getraenke`-Sektion und kein
   Varianten-/Getraenke-Filter sichtbar sein; Produkte sollen unter
   `Produkte` stehen.
8. Ein Produkt erstellen oder bearbeiten: im Produktdialog darf kein
   Restaurant-Typ `Speise/Getraenk` bzw. `Variante` sichtbar sein.
9. Speichern und Shop-Profil erneut oeffnen; Produktliste, Produktdetail,
   Cart/Checkout und Shopping-Tab kurz gegenpruefen.
10. Restaurant-/Cafe-Profil im Editor gegenpruefen: `Speisen`, `Getraenke` und
   `Restaurant Ads` sollen dort weiter wie bisher funktionieren.

## Bewertung

Bestanden mit kleinem Rest-Risiko. Die Aenderung ist auf Shop-/E-Commerce-
Profile begrenzt und nutzt die bestehenden stabilen Menu-/Fokus-Datenpfade
weiter.

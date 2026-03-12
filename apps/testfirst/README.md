# testfirst

Diese Demo ist lokal und isoliert. Alles fuer das Menue sitzt in `apps/testfirst/index.html`.

## Was hier jetzt gebaut ist

Die aktuelle Loesung ist absichtlich simpel:

- `Getraenke` ist ein echter sticky Tab-Block.
- `Speisen` ist zuerst ein normaler sichtbarer Block im Content.
- `Speisen` wird **nicht** von einem extra Header uebernommen.
- Wenn der `Speisen`-Bereich oben angekommen ist, wird genau dieser echte `Speisen`-Block oben festgesetzt.
- Solange man im `Speisen`-Bereich ist, bleibt derselbe Block oben stehen.
- In den Settings koennen Bilder fuer `Speisen`, `Getraenke` und die feste `Special`-Karte lokal hochgeladen werden.

Kurz:

- oben startet `Getraenke`
- spaeter kommt `Speisen` von unten hoch
- dann bleibt der echte `Speisen`-Block oben stehen
- kein zusaetzlicher Host
- kein zweiter Food-Sticky im DOM

## Warum es so gebaut ist

Ziel war:

- gleiche Optik wie bei echten Tab-Bloecken
- klares Verhalten beim Scrollen
- keine komplizierten Masken, Tracks oder Clip-Hacks
- kein zusaetzlicher Uebernahme-Header fuer `Speisen`

## Aufbau im DOM

### 1. Getraenke

Der `Getraenke`-Block wird als echter sticky Header gerendert.

Zustaendig:

- `renderMenuTypeStickyHeader(categories, menuType)`

Verwendung:

- in der Drink-Section in `renderProfileMenuView(profile)`

Wichtig:

- `Getraenke` ist der einzige echte CSS-`sticky` Tab-Block im Menue

### 2. Speisen

Der `Speisen`-Block wird als normaler sichtbarer Block gerendert.

Zustaendig:

- `renderMenuTypeBlock(categories, menuType)`

Verwendung:

- in der Food-Section in `renderProfileMenuView(profile)`

Wichtig:

- `Speisen` ist am Anfang **nicht** sticky
- es ist ein echter normaler Content-Block

### 3. Special-Karte

Die `Special`-Karte im Getraenke-Bereich ist ein eigener lokaler Datenblock.

Zustaendig:

- `state.special`
- `renderPromoCard()`
- `renderSpecialEditor()`

Bearbeitbar sind:

- Badge
- Titel
- Bild

## Settings und Uploads

Die Bildbearbeitung ist lokal und bleibt in `localStorage`.

Zustaendig:

- `renderImageUploadEditor(...)`
- `handleAvatarUpload(file)`
- `handleSpecialImageUpload(file)`
- `handleMenuImageUpload(id, file)`

Aktuell gibt es Upload-Flaechen fuer:

- Restaurant-Avatar
- `Special`-Karte
- jedes einzelne Menue-Item fuer `Food` und `Drink`

Wichtig:

- die URL-Felder bleiben weiterhin vorhanden
- wenn ein lokales Bild aktiv ist, wird das URL-Feld absichtlich leer angezeigt
- gespeichert wird trotzdem das lokale Bild im State

## Was beim Scrollen passiert

Die Scroll-Logik arbeitet nur mit dem echten `Speisen`-Block.

Zustaendig:

- `getPinnedMenuBlockElement()`
- `resetPinnedMenuTypeBlock(block, section)`
- `syncPinnedMenuTypeBlock()`

Der Ablauf:

1. Solange die Food-Section noch nicht oben ist, bleibt `Speisen` normal im Content.
2. Sobald die Food-Section die obere Tab-Position erreicht, wird der echte `Speisen`-Block per JavaScript oben festgesetzt.
3. Damit das Layout nicht springt, bekommt die Section oben den passenden Platz als `padding-top`.
4. Wenn man wieder aus dem Food-Bereich heraus scrollt, wird der Block wieder normal in den Content zurueckgesetzt.

Wichtig:

- der Block selbst wird bewegt
- es wird kein zweiter `Speisen`-Header eingeblendet
- es gibt keine Header-Uebernahme

## Welche Funktionen dafuer wichtig sind

### Rendering

- `renderMenuCategoryRow(categories, menuType)`
- `renderMenuTypeStickyHeader(categories, menuType)`
- `renderMenuTypeBlock(categories, menuType)`
- `renderPromoCard()`
- `renderImageUploadEditor(...)`
- `renderSpecialEditor()`
- `renderProfileMenuView(profile)`

### Scroll und Position

- `getPinnedMenuBlockElement()`
- `resetPinnedMenuTypeBlock(block, section)`
- `syncPinnedMenuTypeBlock()`
- `getCurrentStickyHeaderBottom()`
- `getStickyHeaderForSection(section)`
- `getCategoryScrollOffset(section)`
- `handleScroll()`

### Aktivierung der Pills

- `updateActivePillDOM(currentCategory, currentType, pillScrollBehavior)`

### Lokale Medien

- `handleAvatarUpload(file)`
- `handleSpecialImageUpload(file)`
- `handleMenuImageUpload(id, file)`

## Wichtige Regeln fuer spaetere Aenderungen

Wenn dieses Verhalten stabil bleiben soll, dann:

- keinen extra Sticky-Host wieder einfuehren
- `Speisen` nicht durch eine Kopie ersetzen
- keine Clip-, Masken- oder Track-Loesung wieder einbauen
- nur den echten `Speisen`-Block pinnen
- Uploads nur lokal halten
- Aenderungen nur in `apps/testfirst` halten

## Datei-Scope

Diese Beschreibung gilt nur fuer:

- `apps/testfirst/index.html`
- `apps/testfirst/README.md`

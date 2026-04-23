# Business Profile Header/Menu State

Stand: 2026-03-25

## Aktueller UX-Stand

- Business-Profile nutzen die untere Content-Navigation `Beitraege | Menue | Medien`.
- Der bestehende Menu-Renderpfad bleibt `renderProfileMenuView(profile)`.
- Im normalen Business-Profil-Header steht der Business-Name in der adaptierten `MNYRA / Social`-Struktur.
- Ein Klick auf den Business-Namen fuehrt innerhalb desselben Business-Profils zur normalen Profilansicht zurueck.
- Rechts bleiben Sprache + Cart + Profil bzw. Sprache + Cart + Call-Waiter im Menue-Modus.

## Header-Menue-Tabs

- Im Menue-Modus baut der Header seine Tabs aus echten Menue-Kategorien (`item.category`).
- `Getraenke` und `Speisen` sind nicht mehr die Header-Tabs, sondern bleiben nur Menue-Sektionsueberschriften.
- Die Header-Tabs scrollen auf den ersten vorhandenen Eintrag der jeweiligen Kategorie.
- Shop-/Catalog-Profile erzwingen keine Restaurant-Kategorie-Tabs.

## Technische Leitplanken

- Keine zweite Menue-Ansicht.
- Keine neue Cart-, Waiter-, Product-, Favorites- oder Orders-Logik.
- Produkte bleiben im bestehenden Renderpfad und in ihrer Reihenfolge erhalten.
- Kategorie-Anker werden nur als Markierungen im bestehenden Menue-HTML gesetzt.

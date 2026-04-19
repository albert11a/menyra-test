# Menyra Social Startup Stability Fixes - 2026-04-19

## Ziel
Die Lade- und Routing-Probleme im Social-Bereich beheben, bei denen Profile, Bilder, Suchergebnisse und Profilbeitraege nach Login, Reload, Hard Reload oder Coldstart kurz korrekt erscheinen, dann verschwinden oder erneut ueberschrieben werden.

## Hauptursachen

### 1. Falscher Auth-Fast-Path fuer Business/Owner/CEO-Kontexte
Der Auth-Resolver konnte einen Account mit spaerlichem `users/<uid>`-Datensatz zu frueh als normalen `user` behandeln, obwohl bereits Business-, Owner-, CEO- oder Staff-Hints vorhanden waren.

Auswirkung:
- Self-Profile wurde erst als User geladen
- danach kam ein zweiter Business-Reconcile-Pass
- Profilzustand, Fans/Folgt, Bilder und Posts kippten kurz sichtbar um

Fix:
- `apps/menyra-social/core/auth/tab-auth-load-utils.js`
- der Non-Business-Fast-Path ist jetzt nur noch erlaubt, wenn **keine** strukturierten Access-Hints vorhanden sind
- vorhandene `restaurantId`, `staffRestaurantId`, `sourceUserRole`, `roles`, `business`, `owner`, `ceo`, `staff` blockieren den falschen Fast-Path jetzt sauber

### 2. Self-Profile-Live-Load hat bessere Cache-Werte mit leeren Live-Feldern ueberschrieben
Wenn das Live-Profil nur teilweise gefuellt war, wurden existierende bessere Werte im State mit leeren oder Default-Werten ersetzt.

Auswirkung:
- Profilfoto, Handle, Land, Location, Fans, Folgt oder Bio konnten nach Login/Reload kurz verschwinden
- das UI wirkte instabil, obwohl spaeter wieder Daten nachgeladen wurden

Fix:
- `apps/menyra-social/core/profile/self-profile-runtime-controller.js`
- fehlende Live-Felder ueberschreiben vorhandene bessere Werte nicht mehr
- abgesichert fuer `handle`, `bio`, `location`, `address`, `followers`, `following`, `country`
- vorhandener Avatar-Fallback blieb bereits aktiv und wurde beibehalten

### 3. Startup-Snapshot hat geschuetzte Auth-/Self-Profile-Views aus altem HTML wiederhergestellt
Beim Start konnte ein alter Snapshot aus `localStorage` in das App-HTML gemountet werden, auch wenn der aktuelle Start gar kein stabiler oeffentlicher Feed-/Public-Profile-Start war.

Auswirkung:
- sichtbares Flackern
- gefuehlter "zweiter Refresh"
- kurz richtige oder alte UI, danach erneutes Ueberschreiben durch echten Runtime-State

Fix:
- `apps/menyra-social/index.html`
- `apps/menyra-social/social-app.js`
- Startup-Snapshot-Restore nur noch fuer stabile oeffentliche Startflaechen
- keine Snapshot-Persistenz mehr fuer eingeloggte Self-Profile-, Menu-, Orders-, Notifications-, Settings- oder CRM-Zustaende
- Public-Profile-Snapshot nur noch, wenn wirklich eine oeffentliche Profilroute (`r` oder Landing-Slug) vorliegt

### 4. Stale Landing Route konnte bei Reload wieder auf Public-Profile umbiegen
Der Browser-Pfad konnte auf einem alten Landing-Slug stehen bleiben, obwohl die App bereits wieder im echten internen Self-Profile-/Feed-Kontext war.

Auswirkung:
- Refresh las den Pfad erneut als Public-Profile-Route
- Self-Profile oder Feed wurde danach wieder ueberschrieben

Fix:
- `apps/menyra-social/social-app.js`
- Route-Sync setzt den Pfad fuer Self-Profile und interne App-Views wieder auf den kanonischen App-Pfad zurueck

### 5. Session-Reset und Retry-Flags waren nicht robust genug
Mehrere session- und datenbezogene Flags konnten nach Reset oder Fehlversuchen in einem blockierenden Zustand bleiben.

Auswirkung:
- leere Profile oder Search-Zustaende blieben stehen
- Retries wurden teils nicht mehr sauber ausgeloest

Fix:
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/auth/tab-auth-load-utils.js`
- relevante `dataLoaded.*`-Flags und Auth-/Warmup-Gates werden jetzt korrekt zurueckgesetzt
- fehlgeschlagene `restaurants`, `userPosts`, `businessPosts` Loads bleiben nicht mehr dauerhaft als "geladen" markiert

### 6. Suche konnte als Fehler enden, obwohl lokale Daten bereits nutzbar waren
Remote-Suche konnte eine globale Fehlermeldung setzen, obwohl lokale Restaurant-/Feed-Daten bereits Treffer erlaubt haben.

Fix:
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js`
- lokale Fallback-Treffer bleiben nutzbar
- Remote-Fails setzen nicht mehr blind den gesamten Suchzustand auf Fehler
- Such-Debounce wurde verkuerzt

### 7. Legacy-Profilfelder wurden nicht vollstaendig normalisiert
Aeltere Datenfelder wie `name`, `username`, `locationLabel`, `countryLabel`, `photoURL` wurden nicht immer sauber in das aktuelle Profilmodell uebernommen.

Fix:
- `apps/menyra-social/core/profile/self-profile-runtime-controller.js`
- `apps/menyra-social/_shared/social-core.js`
- Legacy-Felder werden jetzt beim Self-Profile und beim bestehenden User-Profil konsistenter uebernommen

## Geaenderte Dateien
- `apps/menyra-social/_shared/social-core.js`
- `apps/menyra-social/core/app-events/app-events-main-bind-utils.js`
- `apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/auth/tab-auth-load-utils.js`
- `apps/menyra-social/core/discovery/discovery-runtime-controller.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/profile/self-profile-runtime-controller.js`
- `apps/menyra-social/core/ui/main-shell-render-utils.js`
- `apps/menyra-social/index.html`
- `apps/menyra-social/social-app.js`

## Validierung
- `node --check apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `node --check apps/menyra-social/core/auth/tab-auth-load-utils.js`
- `node --check apps/menyra-social/core/discovery/discovery-runtime-controller.js`
- `node --check apps/menyra-social/core/profile/self-profile-runtime-controller.js`
- `node --check apps/menyra-social/_shared/social-core.js`
- `node --check apps/menyra-social/social-app.js`
- isolierter Resolver-Test fuer Owner-Hint gegen falschen User-Fast-Path: `ok`
- isolierter Sparse-Profile-Test fuer Preserve-Behavior: `ok`

## Offene Grenze
Es wurde in dieser Session kein kompletter Live-Browser-E2E-Login gegen echte Produktionsdaten gefahren.

## Erwartetes Ergebnis nach diesem Stand
- keine sichtbare doppelte Profil-Umschaltung mehr nach Login
- Profilfoto, Fans, Folgt, Land, Handle und Bio bleiben stabiler
- Profilbeitraege verschwinden nicht mehr wegen falschem Owner-Type-Switch oder altem Snapshot-HTML
- Reload, Hard Reload und Coldstart verhalten sich deutlich stabiler als vorher

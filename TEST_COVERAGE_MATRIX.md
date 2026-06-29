Status: CURRENT
Branch: launchready2027
Stand: 2026-06-29

# Test Coverage Matrix

Legende: `bestanden` = ausgefuehrt und gruen. `fehlgeschlagen` = ausgefuehrt und rot. `teilweise` = statisch/lokal begrenzt. `nicht testbar` = keine Staging-Credentials/kein Emulator/keine sichere Testdatenbasis.

| Route/Bereich | Rolle/Persona | Aktion | Cold Load | Refresh | Normal Load | Account-Wechsel | Mobile | Slow Network | Erwartet | Tatsaechlich | Status | Risiko | Bug-ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Node Runtime Tests | alle | `node --test tests/*.test.mjs` | n/a | n/a | ja | n/a | n/a | n/a | 90/90 gruen | 90/90 gruen nach Checkout-Runtime-Fix | bestanden | niedrig | BUG-001, BUG-005, BUG-006, BUG-011, BUG-012 |
| Order Security Unit | Guest/User | sicherer Checkout-Contract | n/a | n/a | ja | n/a | n/a | n/a | Client sendet keine Preise/Totals/Status, Server rechnet aus Menu | 5/5 Regressionstests gruen | bestanden | mittel bis Staging | BUG-001 |
| Public Business Open Fallback | Guest | Profil-Load-Fehler abfangen | ja | ja | ja | n/a | n/a | n/a | kein `routeSnapshotRestaurantId` Crash | Regressionstest gruen | bestanden | niedrig | BUG-011 |
| Build | alle | `npm run build` | n/a | n/a | ja | n/a | n/a | n/a | Production-Build erfolgreich | erfolgreich mit Chunk-Warnung | bestanden | mittel | BUG-007 |
| Bundle Budget | alle | `npm run check:social-bundle` | n/a | n/a | ja | n/a | n/a | n/a | Budget eingehalten | raw/gzip ueber Budget | fehlgeschlagen | P1 | BUG-007 |
| Public split analysis | public | `npm run analyze:public-profile-split` | n/a | n/a | ja | n/a | n/a | n/a | Analyse ok | ok, aber weitere Splits blockiert bis manuelle Tests gruen | bestanden | mittel | BUG-007 |
| `/apps/menyra-social/index.html?...qr...` | Guest | QR/Menu sichtbar | ja | nicht voll | ja | n/a | ja (Runner viewport) | nein | QR/Menu sichtbar, 27 Produkte | Menu sichtbar, 2/27 Produkte | fehlgeschlagen | P1/P0-nahe | BUG-004 |
| QR/Menu Cart | Guest | Produkt/Cart vorbereiten | teilweise | nein | ja | n/a | ja | nein | Artikel in Cart vorbereitbar | Runner konnte Cart nicht vorbereiten | fehlgeschlagen | P1/P0-nahe | BUG-004 |
| QR/Menu Order | Guest | Bestellung senden | nein | nein | unit | n/a | nein | nein | nur Staging/Emulator schreiben | Codepfad auf Callable migriert, kein echter Staging-Send ausgefuehrt | teilweise | P0 bis Staging | BUG-001 |
| `/feed` | Guest/User | Feed laden | statisch | nicht lokal | statisch | nicht | nicht | nicht | App-Route per Vercel Rewrite | Python static ohne Rewrite 404 fuer `/feed`; App-Index direkt laedt | teilweise | P2 | BUG-010 |
| `/profile` | User | Eigenes Profil | statisch | nicht live | statisch | nicht | nicht | nicht | keine alten Account-Daten | Reset-Code vorhanden, kein Browser-Credential-Test | teilweise | P0 falls Bruch | - |
| `/profile` public | Guest | Public Profil | lokale QR-Seite | nicht voll | ja | n/a | ja | nein | korrekter Restaurant-Kontext | Gjakova Grill Profil sichtbar | teilweise | mittel | BUG-004 |
| `/menu` | Business/Public | Menue laden | lokal begrenzt | nicht voll | lokal begrenzt | n/a | ja | nein | komplette Produkte, stabile Bilder | 2/27 Produkte im Runner | fehlgeschlagen | P1 | BUG-004 |
| `/orders` | Guest/User/Waiter | Orders lesen/schreiben | statisch | nicht | unit/statisch | nicht | nicht | nicht | Preis/Total serverseitig sicher | Callable-Contract unit-getestet; Waiter/Status/Mirror nicht live getestet | teilweise | P0 bis Staging | BUG-001 |
| `/notifications` | User | Notifications | unit/statisch | nicht | unit/statisch | nicht | nicht | nicht | Badges korrekt | Badge Listener Tests gruen | teilweise | mittel | - |
| `/settings` | User | Einstellungen | statisch | nicht | statisch | nicht | nicht | nicht | keine Dauerloading/Fehler | nicht im Browser getestet | nicht testbar | mittel | - |
| `/upload` | User/Business | Upload/Post | statisch | nicht | statisch | nicht | nicht | nicht | Upload-State endet sauber | keine Staging-Credentials fuer Upload | nicht testbar | P1 | - |
| `/owner` | Owner | Dashboard/Business | statisch | nicht | statisch | nicht | nicht | nicht | Restaurant-Kontext korrekt | nicht live testbar | nicht testbar | P1 | - |
| `/staff` | Staff/Owner/CEO | Staff Listen/Edit | unit/statisch | nicht | unit/statisch | nicht | nicht | nicht | rollengetrennt | Staff read loader Tests gruen, kein Browserlauf | teilweise | P1 | - |
| `/kitchen` | Kitchen/Staff | Kitchen/Menu | statisch | nicht | statisch | nicht | nicht | nicht | Orders/Menu korrekt | keine separate Kitchen-Rolle verifiziert | nicht testbar | P1 | - |
| `/waiter` | Waiter | Waiter App | statisch | nicht | statisch | nicht | nicht | nicht | Orders sichtbar/status sicher | Waiter App vorhanden, kein Credential-Test | nicht testbar | P1 | BUG-001 |
| `/heart`, `/leads`, `/customers` | CEO/Admin | Heart/CRM | statisch | nicht | statisch | nicht | nicht | nicht | Admin/CRM funktionsfaehig | Runner vorhanden, keine Credentials | nicht testbar | P1 | - |
| `/login`, `/register` | Guest | Auth | statisch | nicht | statisch | n/a | nicht | nicht | kein falsches User-Flackern | Startup/Auth Tests gruen, kein Browser-Credential-Test | teilweise | P1 | - |
| Public restaurant slug | Guest | Slug->Restaurant | unit/statisch | nicht | unit | n/a | nein | nein | publicRoutes/alias korrekt | Resolver Tests gruen | teilweise | mittel | - |
| Account-Wechsel | User A/B/Business/Staff | Logout/Login Wechsel | unit/statisch | nicht | statisch | nein | nein | nein | keine alten Daten sichtbar | Reset-Code vorhanden, kein Staginglauf | nicht testbar | P0 | - |
| Social Likes/Comments/Follows | User | Like/comment/follow | statisch | nicht | statisch | nicht | nicht | nicht | Counter nicht manipulierbar | Rules erlauben Counter-Manipulation | fehlgeschlagen | P0 | BUG-002 |
| SEO Launch | Public | robots/sitemap/favicon/meta | n/a | n/a | statisch | n/a | n/a | n/a | vorhanden | robots/sitemap/favicon nicht gefunden | fehlgeschlagen | P1 | BUG-009 |

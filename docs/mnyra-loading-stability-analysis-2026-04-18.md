# Mnyra Lade- und Stabilitaetsanalyse (2026-04-18)

## Ziel dieser Analyse
- Vollstaendiger, repo-basierter Ueberblick ueber die Ladeprobleme bei Cold Start, Refresh und Login.
- Fokus auf: Profil-Aufloesung, Menue-Laden, Bild-Flackern, sichtbare Nachkorrekturen, wahrgenommene Unruhe.
- Ergebnis soll als Arbeitsgrundlage fuer Stabilisierung dienen.

## Kurzfazit
- Hauptproblem ist **nicht** primaer "Firebase ist langsam" oder "Cloudflare ist kaputt".
- Hauptproblem ist ein **sichtbarer Mehrphasen-State** im Client:
  - erst Preview/Fallback/Cache,
  - dann Reconcile/Netzwerk,
  - dann erneut Render/Identity-Umschaltung.
- Dadurch sieht der Nutzer genau das, was du beschreibst:
  - Profil erst leer/falsch, dann spaeter korrekt,
  - Menue und Bilder kommen verzugert oder springen,
  - Refresh wirkt nervoes und flackert.

## Methodik
- Statische Codeanalyse im Projekt `apps/menyra-social` plus `sw.js`, `vercel.json`, `cloudflare-edge`.
- Keine Produktionstraces/Live-Profiling in dieser Runde.
- Alle Findings unten sind mit konkreten Codepfaden belegt.

---

## Symptom -> Wahrscheinliche Ursache

| Symptom (User) | Technische Hauptursache |
|---|---|
| "Nach Login ist nicht sofort klar, welches Profil ich habe" | Auth kann erst User-Profil laden und spaeter auf Business umschalten (Background Reconcile). |
| "Beim Oeffnen von Profil/Restaurant springt alles mehrfach" | Public-Profil-Flow rendert bewusst in 3 Phasen (Loading -> Resolved -> Resolved+Posts). |
| "Menue kommt zu spaet / wirkt unzuverlaessig" | Mehrere Menue-Quellen und source-abh. States (public/collection/migration + memory + persistent + force reload). |
| "Viele Seiten flackern nach Refresh" | Startup-Snapshot + Bootstrap-Preview + erneutes Network-Reconcile + globaler Re-Render (`innerHTML` Austausch). |
| "Bilder flashen am Anfang oder fehlen erst" | Strict-lazy Placeholder-Pfade, opacity-reveal, Retry mit `src` entfernen/neu setzen, plus Edge-Abhaengigkeit. |

---

## Findings im Detail

## 1) Auth-Identity kann sichtbar kippen (User -> Business)
**Belege**
- `apps/menyra-social/core/auth/tab-auth-load-utils.js:623`
- `apps/menyra-social/core/auth/tab-auth-load-utils.js:597`
- `apps/menyra-social/core/auth/tab-auth-load-utils.js:611`

**Was passiert**
- Bei `hasTrustedNonBusinessHint` wird zuerst `loadUserProfile(...)` ausgefuehrt.
- Wenn kein Business direkt gefunden wird, wird `scheduleBackgroundBusinessReconcile()` geplant.
- Dieser Reconcile kann spaeter doch `loadBusinessProfile(..., { force: true })` ausloesen.

**Auswirkung**
- Nach Login kann die Identitaet sichtbar nachkorrigiert werden (falscher/neutraler Startzustand, dann Wechsel).

---

## 2) Login-Resolve blockiert auf mehrere DB-Lookups und sogar Writes
**Belege**
- `apps/menyra-social/core/auth/auth-user-bootstrap-utils.js:67`
- `apps/menyra-social/core/auth/tab-auth-load-utils.js:521`
- `apps/menyra-social/core/auth/tab-auth-load-utils.js:571`
- `apps/menyra-social/core/auth/tab-auth-load-utils.js:590`
- `apps/menyra-social/core/auth/auth-profile-resolution-runtime.js:331`
- `apps/menyra-social/core/auth/auth-profile-resolution-runtime.js:337`

**Was passiert**
- Bootstrap wartet auf `loadAuthProfile(user)`.
- Resolve-Pfade fragen nacheinander mehrere Quellen ab (restaurants/leads/legacy).
- In manchen Pfaden werden `setDoc(...)` Patches synchron im selben Flow abgewartet.

**Auswirkung**
- Gerade bei Cold Start/hoher Latenz wird Profilaufloesung verzoegert.
- User sieht laenger Zwischenzustaende.

---

## 3) Public Business Profil wird bewusst mehrfach umgebaut
**Belege**
- `apps/menyra-social/core/profile/profile-open-flow-utils.js:258`
- `apps/menyra-social/core/profile/profile-open-flow-utils.js:284`
- `apps/menyra-social/core/profile/profile-open-flow-utils.js:315`
- `apps/menyra-social/core/profile/profile-open-flow-utils.js:355`

**Was passiert**
- `openProfileViewFromBusiness(...)` rendert:
  1. `loadingProfile`,
  2. danach `resolved` Profil,
  3. danach erneut `resolvedWithPosts`.

**Auswirkung**
- Sichtbares Springen in Name/Bio/Content/Posts.
- Nutzer nimmt das als "flackert" oder "laedt unruhig" wahr.

---

## 4) Restaurant-Wahrheit wird auch bei frischem Cache nochmal erzwungen
**Belege**
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:847`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:915`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:918`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:849`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:855`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:865`

**Was passiert**
- Wenn Restaurants aus Cache frisch sind, wird trotzdem `loadRestaurants({ force: true })` in Microtask geplant.
- Danach werden abhaengige Bereiche neu angestossen (`updateShellDom`, `syncFeedPostLogos`, `refreshFeedStories`, `refreshSearchView`).

**Auswirkung**
- Zweiter Wahrheits-Pass erzeugt sichtbare Nachkorrekturen nach initialer Anzeige.

---

## 5) Menue-Flow hat mehrere Quellen und source-switching
**Belege**
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js:397`
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js:423`
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js:410`
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js:687`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:1175`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:1215`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js:1243`

**Was passiert**
- Es existieren mehrere Menue-Quellen: `public`, `collection`, `legacy`, `hybrid/migration`.
- Dazu kommen memory cache, persisted cache, network load, retries/backoff.
- `state.menu.source` steuert, welche Wahrheit im UI als gueltig gilt.

**Auswirkung**
- Je nach Entry-Path und Tab kann Menue sichtbar zwischen Quellen wechseln.
- Nutzer merkt "mal da, mal spaeter, mal anders".

---

## 6) Public-Bootstrap nutzt Preview-Truth, danach echte Truth
**Belege**
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js:52`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js:67`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js:252`
- `apps/menyra-social/core/common/restaurant-identity-runtime-controller.js:64`
- `apps/menyra-social/core/common/restaurant-identity-runtime-controller.js:278`

**Was passiert**
- Bootstrap merged Restaurant-Preview mit `__truthSource: "bootstrap-preview"` und partial Flags.
- Spaeter werden diese Daten gegen kanonische Wahrheit reconciled.

**Auswirkung**
- Schnellere First Paint, aber Risiko fuer "erst ungefaehr richtig, spaeter korrekt".

---

## 7) Startup-Snapshot + Bootstrap-Cache koennen Refresh-Flicker verstaerken
**Belege**
- `apps/menyra-social/index.html:1342`
- `apps/menyra-social/index.html:1365`
- `apps/menyra-social/index.html:1390`
- `apps/menyra-social/social-app.js:1632`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js:1488`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js:1527`

**Was passiert**
- Vor App-Start kann alter Snapshot-HTML aus LocalStorage wieder eingesetzt werden.
- Danach rendert die App den aktuellen State und ersetzt ggf. den DOM-Block.
- Parallel kann Bootstrap-Cache/Bootstrap-Fetch neue Daten einspeisen.

**Auswirkung**
- Auf Refresh kann es "alt -> neu -> neuer" geben.

---

## 8) Globaler Render-Pfad ersetzt bei Changes grosse DOM-Teile
**Belege**
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js:1488`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js:1527`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js:1536`

**Was passiert**
- Bei Render-Change wird `appEl.innerHTML = nextHtml` gesetzt (ausser in wenigen Reuse-Faellen).
- Danach werden Bindings/Fallbacks erneut angehaengt.

**Auswirkung**
- Hohe UI-Bewegung bei State-Aenderungen.
- Flackern wird wahrscheinlicher als bei diff-basiertem partiellen Rendern.

---

## 9) Bild-Flackern ist im Code explizit eingebaut (Reveals + Retry)
**Belege**
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js:1120`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js:1146`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js:1249`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js:1254`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js:1159`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js:1195`

**Was passiert**
- Bilder mit `data-image-reveal="menu"` werden initial auf `opacity: 0` gesetzt und erst nach decode eingeblendet.
- Bei Error wird fuer Retry sogar kurz `src` entfernt und spaeter neu gesetzt.
- Viele nicht-kritische Menuebilder starten absichtlich mit Placeholder (`strict lazy`) und werden erst spaeter auf echte URL gehoben.

**Auswirkung**
- "Flash am Anfang", "Bild kommt spaet", "kurz weg und wieder da" sind erwartbare Nebenwirkungen dieses Pfads.

---

## 10) Menue-Source-Kontrakt ist nicht ueberall konsistent
**Belege**
- `apps/menyra-social/core/profile/profile-menu-focus-utils.js:18`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js:2306`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js:2308`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js:2397`

**Was passiert**
- `ensureMenuDataForProfileCore` laedt standardmaessig `source: "public"`.
- Admin-Menu-View erwartet aber `source === "collection"` als Authoring-Truth.

**Auswirkung**
- Je nach UI-Kontext kann Source-Umschaltung zusaetzliche Ladephasen erzeugen.

---

## Firebase oder Cloudflare?

## Bewertung
- **Primaer App-Orchestrierung/State-Design** (sichtbare Wahrheitswechsel).
- **Firebase** ist hier eher Datenquelle, nicht Hauptursache des visuellen Springens.
- **Cloudflare/Media-Edge** kann Bilder verschlechtern, ist aber nicht die Erklaerung fuer Rollen-/Profil-/Menue-Umschaltungen.

## Zusatzzrisiko (Edge)
- Bilder laufen ueber Edge-URL (`apps/menyra-social/_shared/image-resolver.js:5`).
- Wenn Edge instabil ist, koennen Bilder fehlen oder spaet kommen.
- Das erklaert aber nicht die beobachteten Identity- und Menue-Reconciles.

---

## Priorisierte Stabilisierung (empfohlen)

## Phase 0 (sofort, 1-2 Tage)
1. Auth-Truth-Gate einfuehren:
   - Kein sichtbares `user -> business` Umschalten mehr.
   - Background-Reconcile nur still, ohne Identity-Flip.
2. Public-Profil-Open auf 1 Promotion reduzieren:
   - Ein Skeleton-State, danach ein finales Profil-Commit.
3. Bild-Retry ohne `src`-Entfernung:
   - Retry-Mechanik so umbauen, dass kein leerer Flash entsteht.

## Phase 1 (2-4 Tage)
1. Menue-Source-Kontrakt haerten:
   - Public View: nur `public`.
   - Owner Editor: nur `collection`.
   - `migration`/`legacy` nur als Backfill, nicht als sichtbare Laufzeit-Wahrheit.
2. Fresh-Reconcile entkoppeln:
   - Bei frischem Cache kein sichtbarer Voll-Refresh fuer Restaurants/Menue.
   - Reconcile nur anwenden, wenn Signatur wirklich relevant fuer aktuelle Surface ist.

## Phase 2 (4-7 Tage)
1. Startup beruhigen:
   - Snapshot nur fuer klar definierte Tabs und nur, wenn Folgezustand kompatibel ist.
   - Weniger "alt->neu" Bewegungen auf Refresh.
2. Render-Scope verkleinern:
   - Kritische Oberflaechen nicht jedes Mal ueber globales `innerHTML` remounten.

---

## Messplan (damit Stabilisierung objektiv wird)
1. "Profile truth settled ms":
   - Zeit von `onAuthStateChanged` bis finaler Profiltyp feststeht.
2. "Menu first usable ms":
   - Zeit bis Menue fuer aktuelle Surface mit korrekter Source geladen ist.
3. "Visible identity flips":
   - Zaehler pro Session fuer User<->Business Wechsel im sichtbaren UI.
4. "Image flash count":
   - Zaehler fuer Bilder, die innerhalb kurzer Zeit `opacity 0->1` oder `src` retry hatten.

---

## Entscheidung fuer die weitere Arbeit
- Deine Annahme war korrekt: Es gibt zu viele Patches/Fallbacks/Mehrfach-Wahrheiten.
- Der schnellste Weg zu einer ruhigen, verlaesslichen Seite ist:
  - **Wahrheit frueh festziehen**,
  - **sichtbare Reconciles reduzieren**,
  - **Image-Ladepfade entnerven**.

Wenn wir danach strikt nach diesem Dokument priorisieren, bekommt Mnyra die von dir gewuenschte Qualitaet: ruhig, sauber, schnell und reproduzierbar stabil.


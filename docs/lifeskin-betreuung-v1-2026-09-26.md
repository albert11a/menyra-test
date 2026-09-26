Status: CURRENT
Last updated: 2026-09-26

# LifeSkin: Betreuung nach dem Kauf, klareres Angebot, einfachere Kasse (v1, Vorschau)

Auftrag vom 26.09.2026: Besucher sollen auf ihrer fertigen Analyseseite
verstehen, **was sie kaufen**, **wie die vierwöchige Begleitung läuft** und
**wie sie einfach bestellen**. Die Richtung „Terapia juaj“ bleibt. Alles
steht zuerst **in einer Vorschau**: Ohne Schalter sieht kein Besucher
etwas davon.

## 1. So sieht man die Vorschau

| Was | Adresse | Hinweis |
| --- | --- | --- |
| Therapieseite, neue Fassung | `/terapia/<kennung>?ndjekja=1&still=1` | `still=1` = keine Statistik, kein Meta-Pixel. Ohne `ndjekja=1` bleibt die Seite Wort für Wort wie bisher. |
| Heart mit Betreuung | `/heart?ndjekja=1` (merkt sich das Gerät; `?ndjekja=0` schaltet aus) | Karte „Betreuung“ unter „Fälle“, Block „Bestellung & Betreuung“ in jeder Akte. |
| Kundenbereich | `/ndjekja#<zugang>` | Der Link entsteht in Heart beim Bestätigen. Team-Ansicht nur lesend: `/ndjekja?shiko=1#<zugang>`. |

Lokal mit Testdaten (Emulator, nichts geht an die echte Datenbank):

```
node node_modules/firebase-tools/lib/bin/firebase.js emulators:start --only firestore,auth --project mnyra-local
npm run emulators:seed
node scripts/local-dev-server.mjs
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node tests/lifeskin-trichter-pruefstand/lauf-ndjekja.mjs   # GERAET=se | android
```

Der Lauf legt einen Testfall an und spielt den ganzen Weg im
Telefon-Browser durch (Bilder: `test-results/lifeskin-trichter/ndjekja*/`).

## 2. Was gebaut ist

### Therapieseite (nur mit `?ndjekja=1`)

- **Oben:** „Terapia juaj“, Preis und Kaufknopf bleiben. Neu: „Në pako:
  1 × LF ACNE (30 ml) · 1 × …“ (Name, Menge, Inhalt), Chip „Ndjekje
  4-javore“ statt „Dr. Gashi çdo javë“, Sprung „Si funksionon ndjekja
  4-javore ↓“, Preiszeile „gjithsej me dërgesë“ (Endpreis inkl.
  Lieferung). Wirkstoffe nur, wenn das Produkt in Heart als **gegen die
  INCI-Liste geprüft** markiert ist (neuer Haken im Produkt-Editor) –
  die Katalogwerte sind nach den Namen angesetzt und nicht geprüft.
- **„Nuk mbeteni vetëm“ ersetzt** durch „Katër javë, me ndjekje hap pas
  hapi.“ (nach Produkten und Routine): Beispielkarte „Shembull i ndjekjes
  suaj“ (Java 1 nga 4, Përdorimi sot, E përdora / Nuk e përdora, die fünf
  Hautgefühle, „Kontrolli i radhës: dita 7“, „Keni pyetje për
  përdorimin?“), klar als **Shembull** markiert („Vetëm shembull – asgjë
  nuk ruhet.“). Antippen bleibt auf dem Gerät: kein Netz, kein Klickpfad
  (`data-pfad-still`). Darunter die drei Punkte, der Satz „Shënimi ditor
  nuk do të thotë kontroll mjekësor çdo ditë…“ und der Ablauf Fillimi ·
  Dita 7 · 14 · 21 · 28 (Tag 28 verspricht keine reine Haut).
- **Wer prüft:** Solange `NDJEKJA.pruefer` leer ist, spricht die neue
  Fassung von „ne“ und nennt niemanden („Dr. Gashi e kontrollon çdo javë
  me skanim“ → „Në kontrollet e planifikuara shqyrtojmë ecurinë“). „E
  zgjodhi Dr. Violeta Gashi“ (die Auswahl der Therapie) bleibt. „Na
  shkruani 24/7“ entfällt in der neuen Fassung.
- **Garantie aus einer Quelle** (`shared/lifeskin-garancia.js`): kurz
  „45 ditë nga marrja e pakos“ + „Kushtet ↓“ öffnet die vollständigen
  Bedingungen – derselbe Ablauf wie auf der Landingpage (erst Routine
  anpassen, dann Geld). Ein Test hält Landingpage und Modul zusammen.

### Kasse (nur neue Fassung)

- Nummer aus der Analyse wird **übernommen**, nicht neu verlangt; die
  Seite kennt sie nicht (sie steht nur in der Sitzung, die das CEO-Konto
  liest) – nie im öffentlichen Bericht, nie in einer URL. „Përdor një numër
  tjetër“ öffnet das Feld.
- Vor dem Bestätigen: Ndjekja (e përfshirë), Dërgesa (Falas), Pagesa (te
  dera), **Gjithsej**; Garantie aufklappbar; WhatsApp als zweiter Weg (mit
  Fallnummer, damit Heart die Bestellung zuordnen kann).
- Fehler **am Feld** (rot + Satz darunter, Fokus aufs erste), Autofill
  (`name`/`autocomplete`), Telefontastatur, „zurück“ am Telefon schließt
  die Kasse ohne die Seite zu verlassen, Eingaben bleiben (auch über
  Neuladen, sessionStorage dieses Tabs).
- **Kein Doppelkauf:** läuft ein Absenden, zählt kein zweites; nach einem
  Fehler wird erst nachgesehen, ob die Bestellung doch ankam. „Porosia juaj
  u ruajt.“ erst nach dem Speichern.

### Kundenbereich `/ndjekja#<zugang>`

- Kein App-Download, keine Anmeldung. Zugang = 32 Hexzeichen (128 Bit) im
  **Fragment** – geht an keinen Server, in kein Protokoll, keinen Referer.
  Kein Meta-Pixel, kein Klickpfad, `noindex`, `no-referrer`.
- Vor dem Start: Bestellung (bestätigt / unterwegs / zugestellt) und der
  nächste Schritt; **„Fillova sot / Fillova dje“** – die 28 Tage beginnen
  mit dem tatsächlichen Anwendungsstart (Korrektur nur durch das Team).
- Danach: Woche/Tag, der kurze Eintrag (E përdora / Pjesërisht / Nuk e
  përdora, Hautgefühl optional, Nachricht optional ≤ 500 Zeichen), klare
  Zustände (Po ruhet… / U ruajt ✓ / Nuk u ruajt – Text bleibt, erneut
  senden), fehlende Tage = „Nuk është shënuar“, jeder Tag korrigierbar,
  keine Serien, keine Pflichtfotos.
- Nächster **geplanter** Termin, letzter **wirklich erledigter** (mit Datum
  und Name), Rückmeldungen des Teams mit Datum und Absender, Plan &
  Produkte, Kontakt (WhatsApp). Eine Antwortfrist erscheint nur, wenn
  `NDJEKJA.antwortZeit` gesetzt ist.

### Heart (nur mit `?ndjekja=1`)

- **Akte einer Analyse → „Bestellung & Betreuung“:** „Bestellung bestätigen
  & Betreuung anlegen“ (ein Vorgang, zweimal tippen legt keinen zweiten
  Bereich an), „Link senden“ (WhatsApp mit dem Link), „Als storniert
  markieren“; ohne Bestellung: „WhatsApp-Bestellung eintragen“ – an diesem
  Fall, nur einmal.
- **Karte „Betreuung“** mit Arbeitslisten: Neue Rückmeldung / Frage,
  Kontrolle überfällig, Kontrolle fällig, Neu gestartet, Wartet auf Start,
  Betreuung abgeschlossen. Neue Einträge kommen **live**.
- **Fall:** Start, Plan, 28-Tage-Streifen (✓ ½ ✗ ·), Einträge, Termine
  (geplant, bis jemand „Erledigt“ tippt), nächstes Datum, **grüner Kasten
  „An den Kunden schreiben“** (sichtbar für den Kunden, mit Absender) und
  **roter Kasten „Intern – nie für den Kunden“** (Verantwortliche, Aufgaben,
  Notizen – eigene Sammlung, die der Kunde nie lesen kann). Keine
  automatische Antwort aus einer gewählten Hautreaktion.
- **„Kaufweg je Fassung“** (unter „Mehr anzeigen“, gilt für den gewählten
  Zeitraum): Empfänger → geöffnet → Angebot gesehen → Betreuung gesehen →
  Kaufknopf → Kasse → Eingabe → Fehler → bestellt → **bestätigt** →
  **zugestellt** → storniert, je Fassung. „gelesen“ heißt überall jetzt
  „gesehen“.

## 3. Daten und Regeln

| Pfad (unter `lifeskin/lifeskin/`) | Wer liest | Wer schreibt |
| --- | --- | --- |
| `ndjekja/<zugang>` | mit Zugang (get), Liste nur Heart | Heart; Kunde nur `fundit` und einmal den Start |
| `ndjekja/<zugang>/shenime/tNN` | mit Zugang, Heart | Kunde (Form geprüft: Tag = Kennung, nur die 5 Antworten, ≤ 500 Zeichen) |
| `ndjekja/<zugang>/pergjigjet/*` | mit Zugang, Heart | nur Heart |
| `ndjekjaIntern/<kennung>` | nur Heart | nur Heart |

Bestellstand für die Auswertung: `sessions/<kennung>.order.status`
(`neu` → `bestaetigt` / `storniert`, mit Zeit), Zustellung wie bisher im
Bericht (`zugestellt`, jetzt mit `zugestelltAt`). Messmarken:
`sessions/<kennung>.timings.kauf.*` (nur Zeitpunkte und die Fassung, nie
Inhalte). Keine neuen Felder in der Sitzung, keine Sammlung umbenannt.

**Die neuen Regeln sind NICHT veröffentlicht.** Vor jeder Nutzung mit
echten Kunden muss `firestore.rules` veröffentlicht werden (nicht aus
Codex heraus). Bis dahin zeigt Heart in der Karte „Betreuung“: „Nicht
geladen … Sind die neuen Firestore-Regeln schon veröffentlicht?“.

## 4. Vor der Freigabe festlegen (Checkliste)

1. **Wer prüft die Einträge**, an welchen Tagen, wie schnell wird
   geantwortet – dann `NDJEKJA.pruefer` und ggf. `NDJEKJA.antwortZeit` in
   `shared/lifeskin-ndjekja.js` setzen. Bis dahin nennt die Seite niemanden
   und keine Frist.
2. **Firestore-Regeln veröffentlichen** (siehe oben).
3. Wirkstoffe gegen die INCI-Listen prüfen und in Heart je Produkt den
   Haken setzen (sonst erscheinen keine).
4. **Datenschutz:** Hautreaktionen und Nachrichten im Kundenbereich sind
   Gesundheitsangaben. Hinweis/Einwilligung für diesen Bereich prüfen
   lassen, bevor er live geht.
5. Den WhatsApp-Text mit dem Link (`linkNachricht` in
   `shared/lifeskin-ndjekja.js`) und die albanischen Texte einmal von einer
   Muttersprachlerin lesen lassen.
6. Einschalten: `NDJEKJA.imVerkauf = true` und `NDJEKJA.imVerkaufSeit =
   "JJJJ-MM-TT"` (der Tag des Einschaltens – die Auswertung teilt die
   Empfänger damit in Gruppen). Preis und Werbung bleiben dabei unverändert.

## 5. Erfolgskriterium und Auswertung

Mehr **bestätigte und zugestellte** Bestellungen je vergleichbarer Gruppe
von Analyseempfängern – nicht Verweildauer, nicht Klicks auf die Vorschau.
Gruppen: freigegebene Analysen im Zeitraum (Tag der Analyse), deren Fall
noch existiert; ohne eigene Testbestellungen (`order.still`). Wer die
Therapieseite nie öffnete, zählt zur Fassung, die am Tag seiner Analyse
galt (`imVerkaufSeit`). Manuelle WhatsApp-Bestellungen hängen am selben
Fall und zählen einmal.

## 6. Kamera: eigener Arbeitsstrang (keine Änderung in diesem Stand)

Nicht Teil dieses Stands, eigener Veröffentlichungszeitpunkt. Zu prüfen
auf **echten Android-Geräten** aus Instagram und Facebook: Live-Scan,
Fotoweg, Handykamera, vorhandenes Foto wählen, verweigerte Erlaubnis,
Rückkehr aus Kamera/Auswahl, langsamer Upload. Vorschlag: „Foto aufnehmen
oder auswählen“ über die Systemauswahl als verlässlicher Weg, Scan als
Alternative; erst prüfen, welche Auswege schon da sind (siehe
`docs/lifeskin-wege-abbrueche-2026-09-25.md`, `lifeskin-camera-*`). Bei
Fehlern Eingaben und Bilder behalten. Messung: Startversuch, echtes
Kamerabild, Fehlerart, gewählter Ausweg, erfolgreicher Upload.

## 7. Geprüft (26.09.2026)

- Durchlauf im Telefon-Browser gegen den Emulator mit den echten Regeln,
  `lauf-ndjekja.mjs`: **83/83** auf iPhone 390×844 (Instagram), iPhone SE
  375×667 (Safari), Android 360×740 (Facebook); dazu **83/83 gegen die
  gebaute Fassung** (`dist`). Darin u. a.: Beispiel speichert nichts,
  klassische Seite unverändert, stiller Modus ohne Messmarke, dreimal
  tippen = eine Bestellung, Tastatur offen = Knopf erreichbar, Nummer
  nicht im Bericht, Kunde sieht Antwort aber keine interne Notiz, ohne
  Heart weder Fälle auflistbar noch Internes lesbar noch „Arztnachricht“
  schreibbar.
- `npm test` 2731/2731, `npm run test:rules` 60/60 (neu:
  `tests/rules/lifeskin-ndjekja.test.mjs`), Lint 0 Fehler,
  `npm run arch:check` ohne Verstöße, `npm run build` ok (keine getrackten
  Bundle-Dateien geändert).
- Nebenbei behoben: Der Service Worker führte `/terapia/…` nicht als
  eigene Seite – bei einem Netz-Aussetzer hätte er dort die Social-App
  ausgeliefert. `/terapia`, `/ndjekja`, `/apps/lifeskin-verkauf` stehen
  jetzt in `NON_SOCIAL_NAVIGATION_PREFIXES`.

## 8. Bewusst offen

- Morgen/Abend getrennt dokumentieren: v1 hat „Pjesërisht“ (teilweise).
- Fotos im Kundenbereich: nicht in v1 (kein Pflichtfoto; bei Bedarf über
  WhatsApp).
- `ndjekja`/`terapia` stehen nicht in der Liste reservierter Namen der
  Social-App; die Vercel-Umschreibung greift vorher.

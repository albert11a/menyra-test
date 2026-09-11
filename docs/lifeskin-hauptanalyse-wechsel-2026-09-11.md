Status: CURRENT
Stand: 2026-09-11

# Die Hauptanalyse wechselt auf Astra

## Was getauscht wurde

Zwei Adressen haben ihre Anwendung getauscht.

| Adresse | Vorher | Jetzt |
|---|---|---|
| `mnyra.com/analiza/<kennung>` | `apps/lifeskin-bericht/` | `apps/lifeskin-astra/` |
| `mnyra.com/analysetemplateastra` | `apps/lifeskin-astra/` | `apps/lifeskin-bericht/` |
| `mnyra.com/lifeskinlifeskintesttest` | `apps/lifeskin-bericht/` | unverändert |

Die Astra-Gestaltung ist damit die Hauptanalyse und zeigt echte Befunde. Die frühere Gestaltung ist vollständig erhalten und unter `/analysetemplateastra` zu sehen — mit demselben erfundenen Fall wie bisher unter der Testadresse.

## Warum nicht nur die Routen getauscht wurden

Astra war eine Gestaltungsvorlage: ein fest eingebauter Musterfall, keine Firestore-Verbindung, ein Bestellformular, das Eingaben absichtlich verwarf. Ein reiner Routentausch hätte jedem echten Patienten den Musterfall „Arta" gezeigt und seine Bestellung verworfen.

Die Vorlage wurde deshalb an die Daten angeschlossen. Der Datenvertrag aus `docs/lifeskin-astra-audit.md` („Datenvertrag für den späteren Liveanschluss") ist damit erfüllt.

## Der Aufbau der neuen Hauptanalyse

| Was | Wo |
|---|---|
| Aufbau der Seite, Plätze für die Daten | `apps/lifeskin-astra/index.html` |
| Firestore lesen und schreiben | `apps/lifeskin-astra/astra-daten.js` |
| Zustände, Ableitungen aus den Daten, Kaufweg | `apps/lifeskin-astra/astra.js` |
| Beschriftungen, Sätze, FAQ (sq + de) | `apps/lifeskin-astra/astra-texte.js` |
| Größen, Abstände, Angebotsblock | `apps/lifeskin-astra/astra.css` |
| Der Entwurf mit seiner Begründung | `apps/lifeskin-astra/audit.html` |

Die Datenschicht liegt bewusst getrennt: Wer an der Gestaltung etwas verschiebt, muss `astra-daten.js` nicht lesen, und wer an den Daten etwas ändert, nicht die Seite.

### Die vier Zustände

| Zustand | Wann |
|---|---|
| `laedt` | solange der Befund unterwegs ist |
| `weg` | die Kennung gehört zu keinem Fall |
| `prit` | Dr. Gashi hat den Fall noch nicht angesehen — der Bildschirm, den fast jeder zuerst sieht |
| `fertig` | Befund, Plan, Mittel, Kauf |

Der Zustand wird alle zwölf Sekunden nachgefragt, aber nur, solange die Seite wirklich zu sehen ist.

## Die Regeln, die beim Umbau nicht verhandelt wurden

- **Die Anschrift geht in die Sitzung, nie in den Bericht.** Der Bericht ist öffentlich lesbar, damit der Patient seinen Link weitergeben kann. Eine Anschrift darin wäre in dem Moment offen, in dem er das tut. `tests/lifeskin-astra-live.test.mjs` und der e2e-Fall halten das fest.
- **Die Grenze der Methode steht wortgleich in beiden Fassungen.** Sie wirkt nur, weil sie freiwillig nennt, was die Methode nicht hergibt. Ein Zugeständnis, das an zwei Stellen anders formuliert ist, ist keins. Ein Test hält `astra-texte.js` und `bericht-texte.js` an dieser Stelle gleich.
- **Ohne Angebot im Befund gibt es keinen Kaufweg.** `reportAllowsOffer()` entscheidet; ein Befund, der eine ärztliche Abklärung verlangt, endet nicht mit einem Kaufknopf.
- **Ohne bestätigte ärztliche Prüfung wird keine behauptet.** Dann steht dort kein Arztname und kein Porträt, sondern „Vlerësim me ndihmën e AI".
- **Alle Parameter stehen in der Vollansicht**, auch die ohne Befund: Zehn angesehen und acht in Ordnung ist eine andere Aussage als eine Mangelliste.
- **Die Zuordnung der Mittel läuft über stabile Kennungen**, nie über die Listenposition.
- **Was im Befund steht, schlägt den Katalog.** Sonst schreibt eine spätere Änderung am Produkt einen Befund um, der längst beim Patienten liegt.
- **Keine Entwurfsnotizen mehr in der Patientenansicht.** Die deutsche Auditansicht ist aus der Live-Seite entfernt; `audit.html` bleibt als Dokument.

## Prüfen

    npm run test:unit                   # u.a. tests/lifeskin-astra-live.test.mjs
    npm run test:e2e                    # u.a. tests/e2e/lifeskin-analiza-astra.spec.ts

Lokal ansehen:

    npm run dev
    # Hauptanalyse (braucht einen echten Fall in Firestore):
    #   http://127.0.0.1:5173/analiza/<kennung>
    # Die aufbewahrte frühere Gestaltung, mit erfundenem Fall:
    #   http://127.0.0.1:5173/analysetemplateastra

## Zurückdrehen

Ein Tausch der beiden `destination`-Zeilen in `vercel.json` und der beiden Zeilen in `scripts/local-dev-server.mjs` stellt den vorherigen Zustand her. Beide Anwendungen liegen vollständig im Baum; es wurde keine gelöscht.

## Was weiterhin fehlt

Unverändert gegenüber `docs/lifeskin-astra-audit.md`: geprüfte Rezepturen und Produktpassung, einheitliche echte Packshots, vollständige Anbieterangaben (`LIFESKIN_ANBIETER` ist leer, deshalb erscheint der Block nicht), verbindliche Garantiebedingungen und eine serverseitige Bestellung. Der Preis kommt weiter aus dem Katalog im Client; er gehört vor dem Livebetrieb serverseitig bestätigt.

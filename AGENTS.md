Status: CURRENT
Last updated: 2026-06-29

# Mnyra Repo-Regeln

## Aktuelle Wahrheit

Die aktuelle Arbeitsgrundlage fuer Mnyra ist genau diese Dreiergruppe:

- `AGENTS.md`
- `docs/mnyra-launch-masterplan.md`
- `docs/mnyra-current-phase.md`

Wenn spaetere Codex-Threads Regeln, Prioritaeten oder den aktuellen Projektstand einschaetzen, muessen sie sich zuerst an diesen drei Dateien orientieren.

Datierte Notizen, aeltere Plaene oder historische Analysen sind nur Referenzmaterial. Sie gelten nicht als aktuelle Wahrheit, ausser sie sind selbst ausdruecklich mit `Status: CURRENT` markiert. Historische Dokumente sollen als Archiv-Kontext behandelt werden, idealerweise unter `docs/archive/`.

## Produkt-Richtung

Mnyra wird website-first vorbereitet.

Das bedeutet nicht, dass die sichtbare Oberflaeche jetzt veraendert werden darf. Die aktuelle Produktoberflaeche bleibt waehrend dieser Phase visuell stabil.

## Harte Umsetzungsregeln

- Keine sichtbaren UI- oder Design-Aenderungen ohne ausdrueckliche Freigabe.
- Keine Aenderungen an Layout, Farben, Typografie, Spacing, visuellen Komponenten oder UX-Design ohne ausdrueckliche Freigabe.
- Bestehende sichtbare Oberflaeche nicht auf Verdacht umbauen.
- Erst planen, dann umsetzen.
- Immer nur kleine, sichere Schritte mit niedrigem Blast Radius.
- Keine grossen Umbauten auf Verdacht.
- Keine Public-/App-Grenzen blind verschieben.
- Wenn Routing, Truth, Rollen oder Zustaendigkeiten unklar sind: zuerst klaeren, dann erst umbauen.
- Jede Aenderung muss sich am Mnyra-Masterplan orientieren.

## Test- und Ausfuehrungsregeln fuer Codex

- Keine Smoke-Tests oder Playwright-Laeufe durch Codex, ausser der Nutzer fordert das spaeter ausdruecklich an.
- Der Nutzer testet manuell.
- Nach spaeteren Umsetzungs-Schritten liefert Codex nur eine kurze manuelle Testliste.
- Keine Produktlogik, Regeln oder Infrastruktur auf Verdacht anfassen.

## Reihenfolge-Regel

Vor groesseren technischen Schritten muessen zuerst Vertrag, Routing-Wahrheit, Public-Visibility und Zustaendigkeiten klar sein.

Solange diese Basis nicht sauber festgezogen ist, sind breite Routing-Umbauten, Public-Redesigns, aggressive Performance-Arbeit oder riskante Refactors nicht erlaubt.

## Planungsquellen

Die aktuellen Planungsquellen sind:

- `docs/mnyra-launch-masterplan.md`
- `docs/mnyra-current-phase.md`

Diese Dateien definieren den aktuellen Masterstand und die aktuelle Phase. Aeltere datierte Dokumente sind nur historische Referenz.

## Dauerhafte Mnyra-Arbeitsregeln (ab diesem Launch-Hardening-Neustart)

- Fuer Mnyra wird fuer die Launch-Hardening-Serie ab 2026-06-29 ausschliesslich auf Branch `systemfix2027` gearbeitet.
- `systemfix2027` wurde von `origin/main` erstellt und ist die Arbeitsbasis fuer systematische Launch-Pruefung, sichere Fixes und Dokumentation.
- Die fruehere `refactorapp`-Arbeitsregel ist fuer diese neue Launch-Hardening-Serie abgeloest.
- `finale-mnyra` und `finale-mnyra-clean` bleiben Referenz-Branches.
- Es gibt keine direkte Arbeit auf `main`.
- Nach jedem Schritt wird sauber dokumentiert:
  was der Schritt war, was geaendert wurde, welche Dateien geaendert wurden, was bewusst nicht geaendert wurde, wie man manuell testet und wie der Schritt bewertet wurde.
- Nach jedem Schritt gibt es einen klaren Commit.
- Nach jedem Schritt werden Commit-Hash und geaenderte Dateien klar gemeldet.
- Nach jedem Schritt wird eine kurze manuelle Testliste geliefert.
- Es gibt keine stillen Zusatz-Aenderungen ausserhalb des jeweils vereinbarten Schritts.

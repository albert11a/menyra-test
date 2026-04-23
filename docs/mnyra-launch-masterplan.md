Status: CURRENT
Last updated: 2026-04-22

# Mnyra Launch Masterplan

## Aktueller Status

Mnyra ist aktuell nicht launch-ready.

Der aktuelle Fokus ist kein Blind-Umbau, sondern eine saubere Launch-Vorbereitung. Zuerst muessen Wahrheit, Grenzen, Routing, oeffentliche Sichtbarkeit und Absicherung festgezogen werden. Erst danach ist ein technischer Umbau sinnvoll und sicher.

## Zentrale Launch-Blocker

Die aktuelle Prioritaet ist:

1. Public-/App-Grenze ist noch nicht hart genug.
2. Routing-Truth und Reserved-Route-Truth muessen sauber und verbindlich werden.
3. Public-Visibility und oeffentliche Datenfreigabe muessen klar definiert werden.
4. Oeffentliche GET-Pfade duerfen keine versteckten Schreibvorgaenge ausloesen.
5. Oeffentliche Counts und Public-Truth muessen korrekt sein.
6. Release-Gates und generelle Absicherung sind noch nicht ausreichend.
7. Erst danach folgen Performance-, Order-/Mirror- und Launch-Haertung.

## Hauptreihenfolge der Arbeit

Die Master-Reihenfolge fuer Mnyra ist:

1. Contract / Public-App-Grenze
2. Routing-Truth
3. Public-Visibility
4. Read-on-GET entfernen
5. Public-Truth korrigieren
6. echte website-first Kernrouten
7. Gates / Absicherung
8. Performance
9. Order-/Mirror-Haertung
10. Launch-Rehearsal / Ops

## Warum diese Reihenfolge wichtig ist

Diese Reihenfolge verhindert, dass spaeter auf einer falschen Grundlage umgebaut wird.

Zuerst muessen Wahrheit, Rollen, Grenzen und Zustaendigkeiten klar sein. Danach kann Routing sauber festgezogen werden. Dann wird festgelegt, was ueberhaupt oeffentlich sichtbar sein darf. Erst auf dieser Basis kann Mnyra wirklich website-first ausgeliefert werden.

Performance, Spiegelungen, Haertung und Betriebsfragen kommen bewusst spaeter. Sonst optimiert man ein System, dessen oeffentliche Wahrheit und Kernverantwortung noch nicht sauber definiert sind.

## Was vor bestimmten Schritten noch nicht angefasst werden darf

Vor einer klaren Truth- und Contract-Basis gilt:

- keine UI- oder Design-Aenderungen
- keine grossen app-weiten Routing-Umbauten ohne klare Truth-Basis
- keine breiten Public-Redesigns
- keine aggressiven Performance-Tricks vor stabiler Public-Truth
- keine riskanten Refactors auf Verdacht
- keine Umbauten an Public-/App-Grenzen ohne vorherige Festlegung

## Launch-Definition

Mnyra kann erst dann als launch-ready gelten, wenn diese Punkte gemeinsam erreicht sind:

- website-first Auslieferung ist wirklich hergestellt
- der erste oeffentliche Inhalt ist korrekt
- es gibt keine falschen Zwischenzustaende auf oeffentlichen Pfaden
- die Datenwahrheit ist klar und stabil
- oeffentliche und interne Kernfluesse sind stabil
- Sicherheits- und Freigaberegeln sind ausreichend
- es gibt ausreichende Absicherung gegen stille Regressionen
- Launch, Rollback und Betrieb haben eine belastbare Grundlage

## Arbeitsregel fuer alle Folge-Schritte

Jeder spaetere technische Schritt muss in diese Reihenfolge passen.

Wenn eine geplante Aenderung dem Masterplan widerspricht, darf sie nicht nebenbei umgesetzt werden. Dann muss zuerst die Planungs- oder Contract-Frage geklaert werden.

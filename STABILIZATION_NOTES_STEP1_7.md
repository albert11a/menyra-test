# STABILIZATION_NOTES_STEP1_7.md

## Zweck der Datei

Dokumentiert technische Entscheidungen, Tradeoffs und offene Beobachtungen aus Step 1-7.
Die Datei ist kein neuer Plan. Sie dient als Referenz fuer spaetere Eingriffe, Reviews und Regression-Checks.

## Technische Tradeoffs

### A) Social likes/comments behavior

- Likes- und Kommentarlisten wurden bewusst nicht auf vollstaendig always-live fuer jede Oberflaeche umgestellt.
- Verwendet wird eine Soft-Refresh-/Freshness-Strategie statt maximaler Listener-Abdeckung.
- Ziel:
  - weniger Reads
  - weniger blindes Refetching
  - weniger Race-Zustaende zwischen lokalem Optimistic-State, Reopen und Reconcile

### B) Image behavior / variant tradeoff

- In betroffenen Pfaden wurden stabilere beziehungsweise groessere Bildvarianten bevorzugt, wenn das sichtbaren Flash oder unnoetigen Variant-Churn reduziert.
- Ziel:
  - weniger Grau-/Placeholder-Flash
  - weniger sichtbarer Variant-Wechsel zwischen Karte, Detail und Rueckpfaden
- Tradeoff:
  - erster Cold-Load kann in einzelnen Pfaden etwas schwerer sein als bei aggressiver kleinvariantiger Nutzung

## Offene Beobachtungen / spaetere Punkte

### Push-Befund

- Beim Liken eines Business-Status/Post wurde auf dem aktuell genutzten PWA-Geraet eine Push-Benachrichtigung beobachtet, obwohl nicht mit diesem Business-Account eingeloggt war.
- Dieser Punkt wurde nicht in Step 1-7 geloest.
- Wahrscheinlich betroffen:
  - Notification-Zielaufloesung
  - Owner-/Session-Zuordnung
  - Device-Token-Scope
- Spaeter separat pruefen.

### Chat-Bubble-Overflow

- Lange ungebrochene Inhalte koennen seitlich aus der Chat-Bubble herauslaufen.
- Dadurch ist horizontales Verschieben beziehungsweise seitlicher Overflow moeglich.
- Spaeter im Chat-/Layout-Bereich pruefen.

### Spaeter geplanter UX-Umbau

- Das bestehende Menue wurde in Step 1-7 bewusst nicht neu gebaut.
- Gewuenschte spaetere UX-Idee:
  - Business-Profil-Header zeigt im normalen Profilmodus den Business-Namen
  - im Menue-Modus soll im Header selbst statt des Namens eine kleine horizontale swipbare Kategorienavigation erscheinen
  - kein neuer Menue-Renderer, sondern bestehendes Menue nur anders eingebettet
- Noch nicht umgesetzt.

## Guardrail fuer spaetere Entwickler

- Diese Stabilisierung nicht blind wegoptimieren.
- Aenderungen nur bei realem Problem, Messung oder klarer Produktanforderung.
- Soft-Refresh-, Hydration- und Render-Stabilisierungen aus Step 1-7 nicht versehentlich zurueckbauen.
- Vor Eingriffen in Social-, Menue- oder Sticky-Pfade immer Real-Device-Reopen-, Slow-Network- und A/B-Target-Tests wiederholen.

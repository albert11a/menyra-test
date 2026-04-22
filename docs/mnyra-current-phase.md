Status: CURRENT
Last updated: 2026-04-23

# Mnyra Current Phase

## Stand

- Schritt 1 ist abgeschlossen.
- Schritt 2 ist jetzt dokumentiert.
- Schritt 3 ist abgeschlossen: Public-Route-Vertragskern zentralisiert.
- Bewertung von Schritt 3: `bestanden mit kleinem Rest-Risiko`.
- Schritt 4 ist abgeschlossen: Public-Core-Routen First-Render-Stabilitaet fuer `/:slug`, `/:slug/menu`, `/:slug/posts` gehaertet.
- Bewertung von Schritt 4: `bestanden mit kleinem Rest-Risiko`.
- Referenz: [docs/mnyra-step2-route-data-matrix.md](./mnyra-step2-route-data-matrix.md)
- Referenz: [docs/mnyra-step4-public-core-routes-first-render-stability.md](./mnyra-step4-public-core-routes-first-render-stability.md)

## Harte Invariante (verbindlich)

- QR-Verhalten muss exakt erhalten bleiben:
  QR wird im Menu-Editor erstellt, beim Scan landet man auf derselben Profilseite, und im Profil ist das Menu sofort offen mit gleicher Warenkorb-Logik.
- Bestehende echte, bereits vom Menu-Editor generierte QR-Links muessen kompatibel bleiben und duerfen durch spaetere URL-/Routing-/Route-Vertragsaenderungen nicht kaputtgehen.

## Aktuelles Verhalten, fachlich noch zu klaeren

- `/login -> /feed` ist aktuell bestehendes Verhalten.
- Schritt 3 hat dieses Verhalten nicht versehentlich geaendert.
- Fachlich ist weiterhin offen, ob `/login` spaeter direkt auf eine eigene Login-Seite/-Oberflaeche fuehren soll.
- Deshalb wird `/login -> /feed` aktuell nicht als harte Endregel festgeschrieben.

## Workflow ab jetzt (verbindlich)

- Es wird nur auf Branch `finale-mnyra` gearbeitet.
- Keine direkte Arbeit auf `main`.
- Nach jedem Schritt:
  klare Doku, klarer Commit, Commit-Hash melden, geaenderte Dateien melden, kurze manuelle Testliste liefern.
- Keine stillen Zusatz-Aenderungen ausserhalb des vereinbarten Schritts.

## Naechster Schritt

Nur der naechste kleine, sichere Schritt innerhalb des Masterplans und der oben genannten Invarianten.

## Guardrails fuer die naechsten Schritte

- keine Produktaenderungen
- keine Logikaenderungen
- keine Routing-, Firebase-, Functions- oder Rules-Aenderungen ausserhalb des klar definierten Route-Vertrags
- keine UI- oder Design-Aenderungen
- keine Scope-Erweiterung

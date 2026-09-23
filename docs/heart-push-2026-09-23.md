# Heart Push: Analysen und Bestellungen

Scope: Bestehende Push-Strecke reparieren; expliziter Auftrag fuer Commit/Push
auf main. Keine Firebase-Deploys, Regel- oder Collection-Aenderungen.

- Heart registriert ausschliesslich seinen eigenen aktiven Service Worker.
- Browser-Erlaubnis und erfolgreich gespeicherte Geraeteanmeldung werden
  unterschieden. Anmelden/erneut anmelden bleibt erreichbar; iPhone-Installationshinweis.
- Kontoabhaengige Registrierung, erneutes Schreiben nach Seitenstart und
  Stilllegung beim Logout; begrenzte Wartezeiten fuer Token und Firestore.
- Direkter Versand besitzt Meldungen mit silent=true, damit der existierende
  Cloud-Trigger sie nicht parallel sendet. Eindeutige Meldungs-IDs, bedingte
  Firestore-Sperre, je Geraet gespeicherte Zustellung und begrenzte Client-Retries.
- Nur ausdrueckliche FCM-UNREGISTERED-Fehler deaktivieren Geraete.
- Keine Patientendaten oder echten Push-Zustellungen fuer Tests verwendet.

Validierung: 55 lokale Node-Tests (Registrierungs-Lebenszyklus, Analysen,
Bestellungen, Parallelitaet, Teilerfolg, Versandfehler), Syntaxpruefung und
npm run build erfolgreich. Keine geaenderten getrackten Bundles.
Kein mobiler Browser-/iPhone-Test; Playwright laut AGENTS.md nicht ausgefuehrt.

Live-Voraussetzungen: Vercel muss MNYRA_FIREBASE_ADMIN_KEY als serverseitiges
Secret mit passendem Firestore-/FCM-Zugang haben. Die angehaengte Schluesseldatei
bleibt ausserhalb des Repositories; sie wurde nicht veroeffentlicht. Kein
Vercel-Konfigurationszugriff in dieser Sitzung; Secret und echte Zustellung
sind nicht bestaetigt. Auf dem iPhone Heart vom Home-Bildschirm starten und
unter LifeSkin Meldungen anmelden/erlauben.

Grenzen: Client-Retries benoetigen eine noch laufende Seite; keine dauerhafte
Server-Queue. Bei Prozessabbruch nach FCM-Annahme vor dem Speichern der
Bestaetigung ist eine wiederholte Zustellung moeglich. Notification-Tags
ersetzen in diesem Fall die bestehende Meldung. Bereits vorhandene historische
Meldungen werden nicht erneut versandt.

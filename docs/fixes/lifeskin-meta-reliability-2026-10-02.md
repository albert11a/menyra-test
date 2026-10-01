# LifeSkin: Warteseiten-Versand und dauerhafte Wiederholung

Pixel-Aenderung erlaubt von Albert am 02.10.2026: „Gut dann mach noch diesen 2 sachen“.
Die bestehende Freigabe fuer Commit/Push auf main gilt fuer die Fertigstellung.

## Verhalten

- `lifeskin_waiting_reached` behaelt Namen und fachlichen Zeitpunkt (bestaetigte
  Analyse-Abgabe vor Seitenwechsel). Browser und Server verwenden `code-waiting`.
- Die Sitzung gibt die Kennung an den Pixel und stoesst nach erfolgreichem Speichern
  den Vercel-Endpunkt an. Ein separater Firestore-Ausloeser sichert denselben Schritt
  unabhaengig vom Browser ab.
- `device.ua` ergaenzt die Browserangabe fuer den Firebase-Versand. Die bestehenden
  Regeln erlauben dieses Unterfeld; keine Regel- oder Formularaenderung.
- Alte Browser ohne gemeinsame Warteseiten-ID werden nicht nachtraeglich durch die
  neue Cloud-Funktion doppelt gemeldet (Gate auf neues `device.ua`).
- Kauf- und Wartemeldungen benutzen dieselben Sperrmarken in Vercel und Firebase.
  Firestore-Transaktion beziehungsweise REST-Update-Vorbedingung sperren konkurrierende Sender.
- Firebase protokolliert `gesendet` erst nach `events_received >= 1`, nicht nach HTTP 200 allein.
- Ein geplanter Hintergrundlauf alle fuenf Minuten verarbeitet ausdruecklich
  abgelehnte Ereignisse. Höchstens drei Sendungen insgesamt, innerhalb von 24 Stunden.
  ID, urspruenglicher Zeitpunkt und Kaufbetrag bleiben unveraendert.
- Die Wiederholung arbeitet auch fuer neue Vercel-Marken, wenn der Kunde seine Seite
  schon geschlossen hat. Browserangaben liegen dafuer ausschliesslich in der fuer
  Clients gesperrten Sammlung `capiEvents`.
- Fehlende Antworten bleiben `unklar`; keine blinde Wiederholung mit Risiko einer
  zweiten Server-Zaehlung. Eine fehlende Bestätigung kann technisch nicht sicher als
  fehlende Annahme behandelt werden. Bestehende historische Marken werden nicht neu gesendet.
- Die oeffentliche Diagnose zeigt `mitPh` als Boolean, niemals Telefonnummer, Hash,
  Browserangaben oder Sitzungsschluessel.

## Validierung

- Gesamte Unit-Suite: 2976 bestanden, 1 vorhandener Test uebersprungen.
- Zusaetzliche Verhaltenstests: Browser/Server-ID, Cloud-Wartemeldung ohne Browser,
  konkurrierende Sender, ausdrueckliche Ablehnung, maximal drei Versuche,
  unklare Antworten, Firestore-Ausfall und Kaufwiederholung ohne offenen Browser.
- `npm run build` erfolgreich. Keine Aenderung an getrackten Bundle-Dateien.
- Keine Browser-/Mobilpruefung ausgefuehrt; keine sichtbare UI-Aenderung.
- Keine kuenstlichen Produktionsereignisse, keine Produktionstests oder Firebase-CLI-Deploys.

## Betrieb und verbleibende Grenzen

GitHub-Workflow deployt die beiden neuen Funktionen `lifeskinCapiWaiting` und
`lifeskinCapiRetry` zusammen mit dem vorhandenen Kauf-Ausloeser. Der Hintergrundlauf
braucht Cloud Scheduler/PubSub; der Deploy muss erfolgreich sein, bevor die Absicherung
als live gemeldet wird. Vercel veroeffentlicht Browser/REST-Endpunkt automatisch.

Die Annahme neuer echter Ereignisse, Telefonnummernabgleich und Meta-Deduplizierung
muessen nach Veroeffentlichung im Ereignismanager kontrolliert werden. Der Code und
bestandene Tests sind keine Garantie fuer zukuenftige Netzverfuegbarkeit oder mehr Kaeufe.

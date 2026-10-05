Status: CURRENT
Last updated: 2026-10-05

# Dërgesat (/dergesat) – Versand über Posta Beki

## Ablauf
1. Heart → Akte einer Analyse → Karte „Bestellung“: **Posta Beki** eintragen und speichern.
   Erst dann steht die Bestellung auf `/dergesat` unter „Porosiat“. Leer speichern (solange noch Porosi) nimmt sie wieder heraus.
2. `/dergesat`: **Te Beki** → Dërguar. Dort **Pranuar** oder **Anuluar**.
3. Heart zeigt denselben Stand live als kleinen Chip unter der Bestellung; die Karte „Bestellungen“ hat die Chips
   Porosiat | Dërguar | Pranuar | Anuluar, jede Bestellung steht in genau einem.
4. Heart zieht nach (sobald Heart offen ist): Dërguar → Therapieseite „versendet“, Begleitung „derguar“;
   Pranuar → „zugestellt“ / „dorezuar“; Anuluar → Bestellung storniert. Umgekehrt setzen „Als versendet/zugestellt melden“
   und „Als storniert markieren“ in Heart auch `/dergesat` weiter.

## Geld (Anuluar zählt nirgends – auch nicht im Umsatz in Heart)
- **Pritje barazim** = je Dërguar/Pranuar, noch nicht barazuar: Gesamtpreis − 2,50 € (Post).
- **Barazuar** = schon abgerechnet, je Abrechnung (Knopf „Barazuar“, nur Inhaber).
- **Pritje për Riben** = 2 € je Dërguar.
- **€ për Riben** = 2 € je Pranuar, noch nicht ausbezahlt (Knopf „Paguar“, nur Inhaber).
- **Paguar Ribës** = schon ausbezahlt, je Auszahlung.

## Zugang
- Inhaber: mit dem Heart-Zugang (E-Mail + Passwort).
- Riba: Benutzer `kadrija`. Den Zugang legt der Inhaber **einmal** auf `/dergesat` an (Karte „Hyrja e Ribës“,
  Passwort eintragen, „Ruaj“). Das Passwort steht nirgends im Code.
- Riba darf nur lesen und Te Beki / Pranuar / Anuluar tippen (firestore.rules, `dergesat`). Keine Anschrift, keine Nummer.

## Technik
- Daten: `lifeskin/lifeskin/dergesat/{sitzung}`, Zugang: `lifeskin/lifeskin/dergesatZugang/riba`.
- Rechnung und Regeln: `shared/lifeskin-dergesat.js`. Seite: `apps/lifeskin-dergesat/`. Heart: `heart-lifeskin-dergesat*.js`.
- Tests: `tests/lifeskin-dergesat.test.mjs`, `tests/rules/lifeskin-dergesat.test.mjs`.

Status: CURRENT
Last updated: 2026-10-06

# Dërgesat (/dergesat) – Versand über Posta Beki

## Ablauf
1. Heart → Akte einer Analyse → Karte „Bestellung“: **Posta Beki** eintragen und speichern.
   Erst dann steht die Bestellung auf `/dergesat` unter „Porosiat“. Leer speichern (solange noch Porosi) nimmt sie wieder heraus.
2. `/dergesat`: **Gati** (gepackt) → Gati. Dort **Te Beki** → Dërguar. Dort **Pranuar** oder **Anuluar**.
   Eine Anuluar, die schon unterwegs war, steht als „Pritje për kthim“; kommt sie zurück: **E kthyem në depo**.
3. Heart zeigt denselben Stand live als kleinen Chip unter der Bestellung; die Karte „Bestellungen“ hat die Chips
   Porosiat | Gati | Dërguar | Pranuar | Anuluar (alle fünf in einer Reihe), jede Bestellung steht in genau einem.
4. Heart zieht nach (sobald Heart offen ist): Dërguar → Therapieseite „versendet“, Begleitung „derguar“;
   Pranuar → „zugestellt“ / „dorezuar“; Anuluar → Bestellung storniert. Umgekehrt setzen „Als versendet/zugestellt melden“
   und „Als storniert markieren“ in Heart auch `/dergesat` weiter.

## Geld (Anuluar zählt nirgends – auch nicht im Umsatz in Heart)
- **Pritje barazim** = je Dërguar/Pranuar, noch nicht barazuar: Gesamtpreis − 2,50 € (Post).
- **Barazuar** = schon abgerechnet, je Abrechnung (Knopf „Barazuar“, nur Inhaber).
- **Pritje për Riben** = 2 € je Dërguar.
- **€ për Riben** = 2 € je Pranuar, noch nicht ausbezahlt (Knopf „Paguar“, nur Inhaber).
- **Paguar Ribës** = schon ausbezahlt, je Auszahlung.

## Karten oben (antippen = Liste mit Datum und Uhrzeit)
- **Ndepo** (letzte Karte, alles auf Albanisch): das MATERIAL im Lager – Shishe, Stikera und je Krem die ml.
  Quelle: Heart → Produktkosten (eingekauft). Ab geht je gepacktem Produkt (Gati, Dërguar, Pranuar und jede
  Anuluar, die schon gepackt war) 1 Shishe + 1 Stiker + 30 ml Krem. Eine Anuluar gibt kein Material zurück –
  sie wird ein **Produkt të gatshëm** (sofort, wenn sie nie verschickt war, sonst nach „E kthyem në depo“; bis
  dahin „Pritje për kthim“). Keine Produktzahlen wie „92 BPO“. Riba sieht nur Produkte të gatshme und Pritje
  për kthim (die Produktkosten liest nur das CEO-Konto). Abgezogen wird nur, was auf /dergesat steht.
- Pritje barazim, Barazuar, Pritje për Riben, € për Riben, Paguar Ribës: je Bestellung alle Zeitpunkte und der Betrag.

## Zugang
- Inhaber: mit dem Heart-Zugang (E-Mail + Passwort).
- Riba: Benutzer `kadrija`. Den Zugang legt der Inhaber **einmal** auf `/dergesat` an (Karte „Hyrja e Ribës“,
  Passwort eintragen, „Ruaj“). Das Passwort steht nirgends im Code.
- Riba darf nur lesen und Gati / Te Beki / Pranuar / Anuluar / E kthyem në depo tippen (firestore.rules, `dergesat`). Keine Anschrift, keine Nummer.

## Technik
- Daten: `lifeskin/lifeskin/dergesat/{sitzung}`, Zugang: `lifeskin/lifeskin/dergesatZugang/riba`.
- Rechnung und Regeln: `shared/lifeskin-dergesat.js`. Seite: `apps/lifeskin-dergesat/`. Heart: `heart-lifeskin-dergesat*.js`.
- Tests: `tests/lifeskin-dergesat.test.mjs`, `tests/rules/lifeskin-dergesat.test.mjs`.

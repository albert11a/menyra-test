Status: ARCHIVE
Last updated: 2026-05-16

# MNYRA Heart CRM Parity Step

## Schritt

Heart CRM wurde gegen die reale MNYRA Social CRM-Implementierung fuer Leads, Kunden und Staff geprueft und als sicherer erster Parity-Slice erweitert.

## Geaendert

- Heart CRM nutzt fuer Lead-Typen, Lead-Status, Lead-Laender und Default-Land die bestehenden Social-Konstanten.
- Heart Leads/Kunden/Staff zeigen Social-naehere Listen, Counter, Suche, Scope-Tabs, Icons und Detailformulare.
- Heart CRM Detail-Sheets verwenden die bestehenden Social Formular-IDs und relevante data-Attribute, damit spaetere Facade-Bindings keinen parallelen Vertrag brauchen.
- Heart CRM Breite wurde auf die Social-mobile-Breite angeglichen.

## Dateien

- `apps/mnyra-heart/heart-crm-admin-read-view.js`
- `apps/mnyra-heart/heart-icons.js`
- `apps/mnyra-heart/heart-render.js`
- `apps/mnyra-heart/heart.css`
- `docs/mnyra-heart-crm-parity-step-2026-05-16.md`

## Bewusst nicht geaendert

- Keine Heart-Schreibaktionen wurden aktiviert.
- Keine direkten Firebase-Write-APIs wurden in Heart UI/Event-Dateien eingefuehrt.
- Keine Firebase-Pfade, Query-Shapes oder Payload-Shapes wurden geaendert.
- Alte Social-Routen `/leads`, `/customers`, `/staff` wurden nicht entfernt.
- Public Menu, QR, Cart, Orders, Feed, Search, Map, Chat und Waiter wurden nicht geaendert.
- Business Accounts wurden nicht in das Heart Drawer/Menu aufgenommen.

## Bewertung

Der Schritt ist ein niedriger Blast-Radius-Slice: Heart erhaelt Social-nahe CRM-Anzeige und Formularstruktur, waehrend riskante Mutationen deaktiviert bleiben, bis die bestehenden CRM Facades sauber fuer Heart verdrahtet sind.

## Manuelle Testliste

1. Heart als CEO oeffnen und pruefen, dass Leads, Kunden und Staff sichtbar sind, Business Accounts aber nicht.
2. Heart Leads: Meine Leads, Staff Leads, Archiviert, Suche, Statusfilter und Karten pruefen.
3. Heart Lead Detail und neuer Lead: Formularfelder, Logos, Standorte, Pin/Koordinatenanzeige und deaktivierte Save/Delete/Convert-Aktionen pruefen.
4. Heart Kunden: Meine Kunden, Staff Kunden, Suche, Karten und Detailformular pruefen.
5. Heart Staff: Build Status, Staff-Karten, neuer Staff und Staff-Detailformular pruefen.
6. Social manuell oeffnen und pruefen, dass `/leads`, `/customers` und `/staff` weiter existieren.
7. Public Menu, QR, Cart, Orders, Feed, Search, Map, Chat und Waiter kurz durchklicken, falls eine manuelle Regressionrunde gewuenscht ist.

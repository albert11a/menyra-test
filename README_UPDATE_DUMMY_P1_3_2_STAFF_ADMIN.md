# README_UPDATE — DUMMY-P1.3.2 (Staff Admin „richtig“)

**Datum:** 2025-12-16

## Ziel
Staff Admin soll sich wie „die anderen Admins“ anfühlen:
- gleiche Seiten-Shell (zentriert, gleiche Abstände)
- Dashboard mit den gleichen Bausteinen wie CEO:
  - Schnellaktionen (Tiles)
  - Stat-Cards
  - Aktivitäts-Tabelle

## Was wurde geändert
- `platform/staff.html`
  - Dashboard-Markup umgebaut (parity mit CEO)
  - Neue Views: `demos`, `content`
  - Navigation (Sidebar + Mobile Drawer) erweitert

## Was NICHT geändert wurde
- Keine Firebase Logik
- Keine Design-Feinpolitur (das kommt am Ende)

## Test (30 Sekunden)
1) `/platform/staff-login.html` öffnen → Dummy-Login
2) Dashboard prüfen: Schnellaktionen + 4 Stat-Cards + Aktivität
3) Sidebar: Demos & Content öffnen (Dummy)

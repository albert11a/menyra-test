# Kennzahl und Fallliste — 2026-09-22

Auftrag: Ursache fuer neun Analysen bei sieben sichtbaren Faellen untersuchen.

Befund im aktuellen Main-Code:
- Kennzahl nutzt istAnalyse/istPatient: Warteseitenmarke oder Schritt ab result, ohne reine Shopkaeufe.
- Fallliste nutzte dagegen exakt result ODER bestellt ODER Bericht geoeffnet. Offer/address ohne diese Zusatzmarken konnten dadurch verschwinden. Mit sieben result-, einem offer- und einem address-Fall reproduziert: Kennzahl 9, Liste 7.
- Fach-ID alle bedeutet schon bisher ausschliesslich unbeantwortete Faelle. Zwei beantwortete Faelle liegen separat in Ready/Seen usw. Daher sind 9 gesamt und 7 offen auch bei korrekter Filterung moeglich.
- Die Kennzahl folgt dem oberen Zeitraum; die Fallfaecher sind weiterhin eine zeituebergreifende Arbeitsliste. Kein Loeschen und keine Aenderung an Produktionsdaten.

Aenderung: gemeinsame istAnalyse-Regel fuer Kennzahl und Fallliste. Beschriftung Alle zu Offen korrigiert; Fach-IDs und Zuordnung bleiben unveraendert.

Pruefung: Regression vor Fix fehlgeschlagen; danach 1000 Heart-/LifeSkin-Tests bestanden. Tests decken neun Faelle inklusive offer/address, neun gesamt mit sieben offen und zwei Ready sowie Warteseitenmarke und Ausschluss reiner Shopkaeufe ab. npm run build und git diff --check erfolgreich. Keine getrackten Bundle-Aenderungen. Kein echter mobiler Browser getestet.

Grenze: Der Screenshot zeigt die Fallliste/Faecher nicht. Keine authentifizierten Live-Daten eingesehen; die konkreten zwei Datensaetze und die unmittelbare Ursache beim Nutzer sind daher nicht identifiziert. Nach Laden der neuen Version zuerst die Zaehler von Offen, Ready, Seen, Bestellt, Spaeter und Archiv vergleichen.

# Live-Patient und Analysezaehler — 2026-09-22

Auftrag: Patient in Live-Anzeige, aber Analysezahl unveraendert; Anzeige und Abschlussmeldung korrigieren.

Zwei reproduzierte Ursachen im Code:
1. Live-Patient umfasste aufbereitung, also bereits den Versand vor bestaetigter Berichtserstellung. istAnalyse zaehlte diesen Schritt zu Recht noch nicht. Versand ist nun beim letzten Eingabe-/Abgabeschritt; Patient erst bei result bzw. tatsaechlicher Warteseite.
2. Astra schreibt timings.live=prit und warteseiteGeoeffnet in getrennten Requests. Bei noch fehlender zweiter Meldung und nicht gespeicherten result-Schritt zeigte Live einen Patienten, die Gesamtzahl aber keine Analyse. istPatient/istAnalyse erkennt nun auch timings.live=prit als Nachweis der tatsaechlich angezeigten Warteseite. Aufbereitung allein bleibt ausgeschlossen.

Zusaetzlich: kleine Sitzungs-PATCH-Anfragen erhalten keepalive, insbesondere result unmittelbar vor location.assign. Das vermeidet vermeidbaren Abbruch beim Seitenwechsel, garantiert aber keine Uebertragung ohne Netz.

Verifikation: Beide neuen Fehlerfaelle vor Aenderung fehlgeschlagen. Danach 1004 Heart-/LifeSkin-Tests bestanden, inklusive aktualisierter Live-Sitzung, Nummern-/Abgabeablauf, Listendarstellung und erneutem Oeffnen derselben Sitzung ohne Doppelzaehlung. npm run build erfolgreich. Keine getrackten Bundle-Dateien geaendert. git diff --check erfolgreich. Keine Produktionsdaten veraendert. Kein echter mobiler Browser getestet.

Grenze: Screenshot allein identifiziert keinen konkreten Datensatz. Eine bereits gezaehlte Person kann erneut als live erscheinen, ohne die Gesamtzahl zu erhoehen. Ausserdem folgt die Kennzahl dem gewaehlten Zeitraum, Live der aktuellen Aktivitaet. Es wird daher nicht pauschal behauptet, der Screenshot muesse nach dem Fix zehn statt neun zeigen.

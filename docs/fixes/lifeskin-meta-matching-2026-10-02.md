# LifeSkin Meta-Abgleich

Autorisiert durch Albert am 02.10.2026: fehlende Kundendaten bei Lead und Purchase korrigieren.
Umfang: freiwillige separate Zustimmung zum Telefonnummernabgleich, serverseitige Normalisierung und SHA-256, bestehende Ereignisse und Deduplizierung beibehalten. Keine Gesundheitsdaten, Namen oder Anschriften uebermitteln. Ohne Zustimmung bleibt die bisherige Nutzlast erhalten. Keine alten Ereignisse erneut senden.

Arbeit auf separatem Branch, keine Produktionsdaten oder Produktionsdeploys.

Validierung: gezielte CAPI-, Kauf-, Datenschutz- und Pixel-Sperrtests bestanden (53 Tests). `npm test` bestanden. Bestehende VM-Teststaende erhalten die echten neuen Imports; Kontakt-/Viber-Pruefungen behalten ihre bisherigen Anforderungen. `npm run build` bestanden, keine getrackten Bundles geaendert. Keine Browser-, Mobil- oder Produktionspruefung; keine alten Events erneut gesendet. Meta kann fuer Besucher ohne separate Zustimmung weiter fehlende Kundendaten melden. Der automatische Browser-Abgleich im Meta-Konto ist eine separate Einstellung und wird hier nicht aktiviert.

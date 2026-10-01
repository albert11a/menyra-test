# LifeSkin Meta-Abgleich

Albert autorisiert am 02.10.2026 die Korrektur fehlender Kundendaten fuer Lead/Purchase und verlangt ausdruecklich keine neue Zustimmung oder Checkbox.

Serverseitig die vorhandene Telefonnummer normalisieren und SHA-256-gehasht als user_data.ph senden. Keine Namen, Anschriften, Bilder, Befunde oder Antworten uebermitteln. Ereignisnamen, Zeitpunkte und Deduplizierung bleiben unveraendert. Fehlende/ungueltige Telefonnummern erzeugen keinen Hash. Keine neuen Eingabefelder, keine Checkbox, keine zusaetzlichen Sitzungsfelder. Die im ersten Entwurf enthaltenen Zustimmungselemente sind vollstaendig entfernt.

Keine alten Events erneut senden, keine Produktionsdaten fuer Tests. Automatischer Browser-Abgleich im Meta-Konto bleibt eine separate Einstellung. Arbeit auf separatem Branch, kein Produktionsdeploy.

Validierung: 51 gezielte CAPI-/Kauf-/Hash-/Pixel-Sperrtests und alle 2969 Unit-Tests bestanden. Die Oberflaeche entspricht wieder vollstaendig main; alle Checkboxen und clientseitigen Zustimmungsfelder sind entfernt. Der Build des ersten Entwurfs war erfolgreich, getrackte Bundles waren unveraendert. Kein Produktionsdeploy.

# WhatsApp und Uebergabe — 2026-09-22

Auftrag: zuerst Nummernseite und Ladebildschirm verbessern; anschliessend Kamera und alle Analysewege pruefen. Grundlage: hochgeladener Performance-Audit, aktuelle Quellen und AGENTS.md. Direkter Main-Push ausdruecklich beauftragt.

- Beide Trichter zeigen den letzten Schritt oben, erklaeren Analyse/Therapie von Dr. Gashi ausschliesslich per WhatsApp und haben den Weiterknopf direkt beim Eingabefeld im scrollbaren Bereich. Kein automatischer Tastatur-Fokus.
- Bereits vorhandene tolerante Nummernnormalisierung bleibt erhalten: Pluszeichen, kurze/lange Nummern und verschiedene Schreibweisen. Mindestens eine Ziffer erforderlich; gespeicherter Wert maximal 40 Zeichen entsprechend Firestore-Regeln. Das bestaetigt nicht, dass eine Nummer erreichbar ist.
- Kuenstliche Analyseverzoegerung entfernt. Der gemeinsame Versandstatus wartet auf echte Speicherung. Nach 20 Sekunden erscheint eine wiederholbare Fehlermeldung; ein noch laufender Versand wird beim Retry wiederverwendet.
- Einzelne Speicheranfragen haben eine Zeitgrenze (Metadaten 20 Sekunden, Fotos 90 Sekunden), damit ein haengender Request die Warteschlange nicht dauerhaft blockiert. Fotozeiten beruecksichtigen langsame Uploads.
- Vor Berichtserstellung wird die Kontaktangabe erneut bestaetigt. Keine Weiterleitung, kein geloeschter Entwurf und kein result-Schritt bei fehlgeschlagener Berichtserstellung.

Pruefung: 839 bestandene LifeSkin-Tests, keiner uebersprungen. Neue Verhaltenstests: Erfolg, negative Bestaetigung, Exception, haengender Versand, Doppeltipp, Retry, Kontaktfehler. npm run build erfolgreich. Keine getrackten Bundle-Dateien geaendert. Keine Produktionsdaten verwendet.

Grenzen: Kein echter mobiler Browser-/Geraetetest in dieser Umgebung. Die vorherige Cloud-Browser-Verbindung zum lokalen Server war blockiert. Die Smartphone-Messungen im hochgeladenen Audit stammen aus Chromium-Emulation. Echte iOS-/Android- und Facebook-/Instagram-Tests bleiben erforderlich; offline ist keine bestaetigte Serverabgabe moeglich. Fehlgeschlagene Foto-Uploads werden im nachfolgenden Kamera-/Wege-Audit weiter untersucht.

# LifeSkin Analyse v3 — Umfang vor Umsetzung

Ein gemeinsamer JSON-Vertrag für Prompt, Heart-Import, Formular, Freigabe und Patientenseite. Bestehende Berichte bleiben lesbar. Neue Berichte enthalten Fallcode, visuelle Beurteilbarkeit und erklärbare Begriffe. Keine erfundenen Befunde zur Begründung eines Sets. Kein automatischer Nachweis einer ärztlichen Prüfung aus Modelltext.

Geplant: versionierter Parser mit Validierung, Erhalt aller Metadaten im Heart-Bogen, vollständiges Ersetzen beim erneuten Import, Alltagssprache mit anklickbaren Begriffen im vorhandenen Dialog, unbekannte Parameter ohne Gesundheits-Haken, vollständiger Prompt und Beispiel, Regressionstests und Build. Nutzer autorisiert Commit und Push nach main. Keine Produktionsdaten für Tests.

## Recherche und Ableitung
- https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/ — experimentelle Usability-Untersuchung, 1997. Kurze, scanbare, sachliche Texte waren besser nutzbar; keine Kaufquotenstudie und keine Garantie für Kosovo.
- https://www.nngroup.com/articles/progressive-disclosure/ — Details auf Wunsch reduzieren anfängliche Komplexität. Daraus abgeleitet: kurze Zusammenfassung, relevante Merkmale offen, Erklärung im Dialog.
- https://www.cdc.gov/ccindex/tool/index.html — klare Hauptbotschaft, verständliche Sprache und Informationsgestaltung.
- https://www.aad.org/member/practice/telederm/standards — Anamnese, ausreichende Bildinformationen, Zugang zur persönlichen Untersuchung und transparente Anbieterqualifikation gehören zu verantwortlicher Teledermatologie. Diese US-Empfehlungen sind keine lokale Rechtsbewertung.

Keine dieser Quellen liefert eine ideale Zeichenzahl für diese Seite oder belegt, dass lateinische Wörter allein Vertrauen/Käufe steigern. Zeichenbudgets sind Designhypothesen: Zusammenfassung 150–260, Zonentext 60–140, Erklärung 100–200 je Absatz, Dialog 200–500. Fachbegriffe erklären, nicht Autorität simulieren. Verständnis und Nutzbarkeit müssen später mit tatsächlichen Nutzern geprüft werden.

Weitere medizinische Abgleiche: https://dermnetnz.org/topics/acne-vulgaris (primäre und sekundäre Akneelemente, Grenzen konsistenter Zählung); https://www.aad.org/public/everyday-care/skin-care-secrets/face/treat-large-pores (sichtbare Poren sind nicht mit Akne gleichzusetzen).

## Ergebnis und Prüfgrenzen

357 LifeSkin-/Heart-Regressionstests bestanden, einschließlich v3-Import → Formular → Rücklesen, erneuter Import ohne Restfelder, null-Werte, strikte Fehlereingaben, sichere Textsegmentierung und Freigabe-/Angebotsbedingungen. Ältere Tests zur vorgeschriebenen gesunden Kontrastzeile, festen Zehn und zwanghaften Barrierebelastung wurden auf den neuen Vertrag umgestellt.

`npm run build` erfolgreich. Keine Browser-/Playwright-Prüfung ausgeführt: AGENTS.md erlaubt sie nur auf ausdrücklichen Wunsch. Mobile Darstellung deshalb nicht visuell bestätigt; keine Prüfung echter Patientendaten, keine klinische Validierung und kein Conversion-Test. Manuell zu prüfen: 375/390px, langer Begriff mit Klammer, i-Dialog öffnen/schließen/Escape/Fokusrückkehr, unbekannte Werte, erneuter Import, Produktzuordnung und Freigabe ohne Angebot.

Heart bietet den vollständigen Prompt für den offenen Fall zum Kopieren an. Vorhandene Identitätsangaben und ausgewählte Katalogaufgaben werden eingefügt; fehlende Anamnese bleibt leer. Ärztliche Bestätigung niemals aus Modelltext übernehmen. Ohne Bestätigung, bei notwendiger Abklärung oder ohne begründeten Bedarf wird v3 als Befund ohne Kaufangebot freigegeben. Der bestätigende Heart-Nutzer muss die tatsächliche Prüfung sicherstellen; ein Haken ist kein technischer Nachweis einer ärztlichen Identität.

Abschließender Stand: alle 357 Tests grün; Build erfolgreich; ausgelieferte Promptdatei gegen den v3-Vertrag geprüft. Keine getrackten Bundle-Dateien durch den Build verändert, daher keine Bundle-Dateien zu committen. Änderungen betreffen Bericht-UI, Heart-Import/-Editor/-Aktionen, gemeinsame Parser/Vertrags- und Produktregel, Prompt-/Schema-Dokumente, statisches Packaging und Regressionstests.

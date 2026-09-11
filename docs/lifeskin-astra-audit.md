# LifeSkin Astra – Abschnittsaudit und Umsetzung

Status: IMPLEMENTED · 11.09.2026 · **ÜBERHOLT** — seit dem 11.09.2026 ist diese Gestaltung die Hauptanalyse unter `/analiza/<kennung>` und liest echte Befunde. Der Liveanschluss ist in `docs/lifeskin-hauptanalyse-wechsel-2026-09-11.md` beschrieben. Die frühere Gestaltung liegt jetzt unter `/analysetemplateastra`. Die Abschnittsbegründungen weiter unten gelten unverändert; die Aussagen zu „isolierter Route“, „keine Firestore-Verbindung“ und „keine echte Bestellung“ beschreiben den Entwurfsstand und nicht mehr den Betrieb.

## Auftrag und Grenze

Neue, isolierte Route `/analysetemplateastra`: vollständige albanische Analysevorlage für kalte Besucher aus einer Hautanalyse-Werbung, mit zuschaltbarer deutscher Auditansicht. Ein synthetischer Musterfall, keine echten Patientendaten, keine Firestore-Verbindung, keine echte Bestellung. Bestehende Berichte bleiben unverändert. Die Vorlage ersetzt weder fachliche Prüfung noch den bestehenden Bestellserver.

Die Gestaltung soll Verständnis, Wärme, Glaubwürdigkeit und selbstbestimmte Kaufbereitschaft unterstützen. Keine Erfolgsgarantie für Conversion, keine vorgetäuschte ärztliche Prüfung, keine künstliche Verknappung und keine erfundenen Ergebnisse. Psychologische Wirkungen sind prüfbare Gestaltungshypothesen.

## Visuelle Entscheidung

Warmes Papierweiß, tiefes Petrolgrün, kontrastreiches Terrakotta für die Kaufhandlung. Klarer Briefkopf, großzügige Ergebnisfläche, kompakte Inhaltsgruppen statt langer Verbindungslinien. Lesetext mindestens 16 px; 14 px für regelmäßig benötigte Metadaten. Mobile Hauptstrecke einspaltig, Desktop mit ruhiger Inhaltsnavigation. Echte vorhandene Porträtaufnahme; Produktnamen und Rollen typografisch gestaltet, bis geprüfte einheitliche Packshots vorliegen. Keine erfundenen Flaschenbilder.

## Geplanter Umfang

1. Orientierung und Musterkennzeichnung
2. Persönliche Zusammenfassung, Beurteilungsgrundlage und Ansprechpartnerin
3. Beobachtungen und zweisprachige Einordnung
4. Pflegeziel und passende Produktrollen
5. Einfache Morgen-/Abendroutine
6. Paket, Preis und vollständige Leistungen
7. Begleitung über 28 Tage
8. Vollständige Analyse und methodische Grenzen
9. Entscheidungsrelevante Fragen und Hilfe
10. Anbietertransparenz, Seitenabschluss und Bestellvorschau
11. Abschnittsbezogenes deutsches Audit zum Ein-/Ausblenden

## Umsetzung / Prüfung

Umsetzung abgeschlossen. Nutzer hat am 11.09.2026 ausdrücklich den Push auf main beauftragt. Die neue Route bleibt eine gekennzeichnete, isolierte Demonstration; bestehende Patientenberichte und Bestellungen werden nicht verändert.

## Alt–Neu: vollständiges Abschnittsaudit

| Bisher | Neuer Block | Entscheidung |
|---|---|---|
| Briefkopf / Fallnummer | 01 · Orientierung und Absender | Marke und Orientierung behalten; Fallnummer sekundär, nicht als künstliches Qualitätssiegel. |
| Persönliche Ansprache | 01 · Orientierung und Absender | Kurze Anrede mit neutralem Fallback; offensichtliche Testnamen nicht als echte Person behandeln. |
| Arztporträt / Freigabedatum | 01 · Orientierung und Absender | Echte Rolle und tatsächliche Prüfung unterscheiden. Musterbericht behauptet keine Freigabe. |
| Fotos / Parameter / Zonen | 10 · Vollständigkeit ohne Überlastung | Nur verifizierte Zahlen; keine prominente Zahlenreihe vor der eigentlichen Bedeutung. |
| Befundabsatz | 02 · Ergebnis und Einordnung | Hauptbefund, Bedeutung und nächster Schritt in einer zusammenhängenden Fläche. |
| Parameterbalken | 03 · Priorisierte Beobachtungen | Priorisierte Beobachtungen mit verständlicher Einordnung statt unklarer Fünferbalken. |
| Diagnose / Latein / Schwere / IGA | 02 · Ergebnis und Einordnung | Albanisch und international gemeinsam. IGA nur bei passend validierter Skala und echter Bewertung; hier bewusst keine pauschale IGA. |
| Fotogrenzen | 10 · Vollständigkeit ohne Überlastung | Kurze Grundlage oben; detaillierte Grenzen direkt verlinkt. Wesentliche Unsicherheit bleibt sichtbar. |
| Bedeutung / Untersuchungsauftrag / Zonen | 10 · Vollständigkeit ohne Überlastung | In aufklappbarer Vollanalyse erhalten, inhaltlich nicht streichen. |
| Verlauf ohne Pflege / Prognose | 10 · Vollständigkeit ohne Überlastung | Nur fachlich begründete Aussagen; keine Angstkurve, kein vorhergesagter Schaden durch Nichtkauf. |
| Hautbedürfnisse / Übergangssatz | 04 · Pflegeziel und Übergang | Ein Pflegeziel und eine nachvollziehbare Verbindung zur Produktauswahl statt wiederholter Problemtexte. |
| Produktkarten | 05 · Produktrollen und Passung | Rolle, Menge, tatsächliche Passung; stabile IDs statt Zuordnung nach Listenposition. |
| Produktbilder | 05 · Produktrollen und Passung | Einheitliche echte Packshots später ergänzen. Vorhandene uneinheitliche Fotos und leere Symbole werden nicht als fertige Produktserie ausgegeben. |
| Inhaltsstoffe / Anwendung | 06 · Anwendung überschaubar machen | Kurzroutine sofort; konkrete geprüfte Formeln und Dosierung im Detail. Keine unbekannten Inhaltsstoffe erfinden. |
| Ziel bis Tag 28 | 09 · Begleitung und Erwartungen | Kontrollzeitpunkt mit beobachtbaren Kriterien statt versprochener Hautverbesserung bis zu einem festen Datum. |
| Vorher / Nachher | 09 · Begleitung und Erwartungen | Optionaler Beleg, standardmäßig nicht gerendert: nur real, eingewilligt, unbearbeitet und zur Empfehlung passend. Keine künstlichen Patientenergebnisse. |
| Paketzusammenfassung / Preis | 07 · Paket und Entscheidung | Produkte und Betreuung direkt beim Gesamtpreis, Versand klar eingeschlossen. |
| Streichpreis / Ersparnis / Tagespreis | 07 · Paket und Entscheidung | Ohne belegte Vergleichspreise weglassen. Gesamtpreis hat Vorrang. |
| Versand / Nachnahme | 07 · Paket und Entscheidung | Direkt am Button, konsistent bis zum Checkout. Livepreis serverseitig bestätigen. |
| Vier-Wochen-Plan / Betreuung | 09 · Begleitung und Erwartungen | Drei verständliche Prozessschritte und klare Zuständigkeit, keine Heilungsetappen. |
| Garantie | 08 · Finanzielle Sicherheit | Fristbeginn und reale Bedingungen; finanzielle Erstattung nicht als medizinische Sicherheit darstellen. |
| FAQ / Warnhinweise | 11 · Einwände beantworten | Passung und Anwendungsfragen vor Versandfragen; relevante Risiken nicht verkleinern oder verstecken. |
| Bericht speichern / WhatsApp | 12 · Verantwortlichkeit und Wiederkehr | Nur mit sicherem Berichtslink und erklärter Übertragung. Im Muster keine Patientendaten versenden. |
| Anbieter / Haftung | 12 · Verantwortlichkeit und Wiederkehr | Verantwortliche Rollen und Verkäufer konsistent ausweisen; nicht oben Arztbericht, unten widersprüchliche Leistungsbeschreibung. |
| Fester Kaufbutton | 07 · Paket und Entscheidung | Erst nach Sichtkontakt mit dem Angebot; ausblenden, solange dessen Button sichtbar ist. Konkrete Handlung statt Druck. |
| Bestellformular | 07 · Paket und Entscheidung | Beschriftete Felder, vollständiger Preis, native Prüfung, Fokusführung, echte Bestätigung erst nach Servererfolg. |
| Laden / Warten / Nicht gefunden / Versandstatus | 01 · Orientierung und Absender | Bestehende Livezustände bleiben unberührt. Vor Integration müssen echte Lade-, Fehler- und Bestellzustände separat verdrahtet werden; Demo lädt synchron ohne Datenbank. |

## 01 · Orientierung und Absender

**Innere Frage:** Bin ich richtig, und bekomme ich die versprochene Analyse?

**Psychologische Hypothese:** Erwartungskontinuität: zuerst das Ergebnisversprechen der Werbung einlösen. Das Porträt macht den Absender greifbar; es ist kein Beweis für eine tatsächlich durchgeführte Untersuchung.

**Gestaltung:** Kompakter Markenbriefkopf, persönliche Anrede, zwei Orientierungssätze. Musterstatus separat, keine Fake-Verifizierung. Desktop-Navigation ist sekundär; auf dem Handy entfällt sie.

**Inhalt und Freigabe:** Live: Name mit neutralem Fallback, geprüfter Autor, Datum und Beurteilungsstatus. Nur nach tatsächlicher Freigabe ‚Beurteilt von‘ anzeigen.

**Vermeiden:** Keine erfundenen Qualifikationen, Fallzahlen, Siegel oder persönlichen Arztzitate. Nicht zuerst das Set bewerben.

**Prüfen:** Versteht die Testperson nach dem Einstieg, was sie erhält und wer dafür verantwortlich ist?

## 02 · Ergebnis und Einordnung

**Innere Frage:** Was ist bei mir wesentlich, und was bedeutet das?

**Psychologische Hypothese:** Persönliche Relevanz und verständliche Handlungsperspektive. Das Hautbild wird eingeordnet, ohne normale Merkmale zum bedrohlichen Problem zu machen.

**Gestaltung:** Ein dunkler Ergebnisblock, darin Hauptbefund, albanischer Name, internationale Bezeichnung, verbaler Schweregrad und nächster Schritt. Kein zweiter dominanter Warnblock.

**Inhalt und Freigabe:** Synthetisches Beispiel: leichte, überwiegend komedonale Akne. Produktbezug darf nur aus tatsächlich freigegebenen Befunden entstehen. Die internationale Bezeichnung ist kein Ersatz für eine Erklärung.

**Vermeiden:** Keine präzisen Messbalken ohne validierte Messbasis. Eine deskriptive Beobachtung niemals durch eine erfundene Diagnose ersetzen.

**Prüfen:** Kann die Person Hauptbefund und nächsten Schritt in eigenen Worten wiedergeben?

## 03 · Priorisierte Beobachtungen

**Innere Frage:** Was wurde konkret gesehen?

**Psychologische Hypothese:** Begründetes Vertrauen statt bloßer Autorität: wenige konkrete Beobachtungen stützen die Zusammenfassung und sind schneller zu erfassen als zehn gleichgewichtete Kennzahlen.

**Gestaltung:** Zwei kompakte Zeilen, kurze Lokalisierung, verständliche Kategorie. Maximal drei wesentliche Befunde im Hauptfluss; weitere Befunde in den Details.

**Inhalt und Freigabe:** Morphologie und sichtbare Lokalisation priorisieren. Rötung nur unter Berücksichtigung der Aufnahmebedingungen. Keine Angaben zu unmessbarer Hydratation oder Hormonen.

**Vermeiden:** Nicht beurteilbar ist nicht gleich unauffällig. Keine erfundenen Anzahlen oder Prozentwerte zur Steigerung des wissenschaftlichen Eindrucks.

**Prüfen:** Erkennen Leser, welche Beobachtung die Empfehlung begründet?

## 04 · Pflegeziel und Übergang

**Innere Frage:** Was möchte ich mit der Pflege erreichen?

**Psychologische Hypothese:** Aus Information wird ein nachvollziehbarer Handlungsplan. Ein Ziel gibt Orientierung, ohne eine feststehende Zukunft zu behaupten.

**Gestaltung:** Eine kurze Zielbox vor den Produkten, keine dramatische Verschlechterungskurve. Der Weg zur Pflege wird über einen Sprunglink angeboten.

**Inhalt und Freigabe:** Ziel beschreibt beobachtbare Veränderung und Verträglichkeit. 28 Tage sind ein Kontrollzeitraum, keine garantierte Heilungsfrist.

**Vermeiden:** Keine Angst vor Nichtkauf, künstliche Deadline oder Schuld durch die kostenlose Analyse.

**Prüfen:** Kann die Person Ziel, Beobachtungszeitraum und Grenzen voneinander unterscheiden?

## 05 · Produktrollen und Passung

**Innere Frage:** Warum gerade diese drei Produkte?

**Psychologische Hypothese:** Konsistenz zwischen Befund und Empfehlung. Die Kundin soll selbst erkennen können, warum jeder Bestandteil enthalten ist.

**Gestaltung:** Gleiche Kartenstruktur, Reihenfolge der Anwendung, eine optisch maßvoll betonte aktive Pflege. Pro Karte Produkt, Menge, Rolle, eine persönliche Begründung; weitere Details aufklappbar.

**Inhalt und Freigabe:** Zuordnung ausschließlich über stabile Produkt-IDs und fachlich geprüfte Indikationen. Reiniger ist kein Sonnenschutz. Akneprodukt nicht allein wegen sichtbarer Poren empfehlen.

**Vermeiden:** Keine zufällige Zuordnung anhand der Listenposition, keine unbelegten Wirkstoffkonzentrationen oder absoluten Verträglichkeitsversprechen. Keine generierten Packshots als reale Produktabbildung.

**Prüfen:** Frage: ‚Welches Produkt macht was, und warum gehört es in Ihr Set?‘

## 06 · Anwendung überschaubar machen

**Innere Frage:** Wie passt das in meinen Alltag?

**Psychologische Hypothese:** Wahrgenommene Umsetzbarkeit: eine verständliche Reihenfolge verringert organisatorische Unsicherheit. Keine erfundene Minutenangabe.

**Gestaltung:** Zwei ruhige Flächen für morgens und abends; auf dem Handy untereinander. Die Schritte werden in Textform genannt und bleiben ohne Icons verständlich.

**Inhalt und Freigabe:** Exakte Mengen, Häufigkeiten und Wechselwirkungen aus dem freigegebenen Plan. Nicht enthaltene notwendige Ergänzungen ausdrücklich benennen.

**Vermeiden:** Das Design darf eine Routine nicht einfacher darstellen, als sie tatsächlich ist. Keine zusätzlichen aktiven Produkte ohne Abgleich.

**Prüfen:** Kann die Person den Ablauf erklären und erkennt sie, was nicht im Paket ist?

## 07 · Paket und Entscheidung

**Innere Frage:** Was bekomme ich, was kostet es insgesamt?

**Psychologische Hypothese:** Vollständiger Gegenwert und vorhersehbarer Kauf. Produktumfang und Begleitung stehen unmittelbar beim Preis.

**Gestaltung:** Eine weiße Angebotskarte. Produkte, Leistungen, Gesamtpreis, Hauptbutton und Lieferung sind zusammen. Orange nur für die primäre Handlung. Auf dem Handy keine konkurrierenden Kaufvarianten.

**Inhalt und Freigabe:** Preis wird aus dem vorhandenen Katalog übernommen. In Produktion aus dem serverseitigen Angebot; Währung, Versandkosten und Einmalzahlung explizit. Keine Zahlungsdaten in URL oder Analytics.

**Vermeiden:** Kein Rabattanker, solange Vergleichspreise nicht nachgewiesen sind. Tagespreis ist kein Ersatz für Gesamtpreis. Kein verborgenes Abo.

**Prüfen:** Anteil Angebot gesehen → Checkout geöffnet → echte Bestellung → angenommene Lieferung; nicht nur Buttonklicks.

## 08 · Finanzielle Sicherheit

**Innere Frage:** Was ist, wenn ich nicht zufrieden bin?

**Psychologische Hypothese:** Verständliche Bedingungen verringern finanzielle Unsicherheit. Eine Garantie belegt weder Wirksamkeit noch individuelle Verträglichkeit.

**Gestaltung:** Kurze Garantiezeile beim Angebot mit direkt aufklappbaren Bedingungen. Keine riesige Risiko-Parole.

**Inhalt und Freigabe:** Vor Livegang müssen Dauer, Fristbeginn, Anspruch, Rücksendung, Ansprechpartner und Erstattungsweg zur real angebotenen Leistung passen.

**Vermeiden:** ‚Ohne Risiko‘ oder ‚ohne Rückfragen‘ nur verwenden, wenn genau das tatsächlich gewährleistet ist; gesundheitliche Risiken nicht aus einer Geldgarantie ableiten.

**Prüfen:** Verstehen Personen, was die Garantie umfasst und wie sie diese nutzen?

## 09 · Begleitung und Erwartungen

**Innere Frage:** Bin ich nach dem Kauf auf mich allein gestellt?

**Psychologische Hypothese:** Prozesssicherheit und konkrete Erreichbarkeit statt allgemeiner Beruhigung. Die Zukunft wird als nachvollziehbarer Ablauf dargestellt.

**Gestaltung:** Drei Zeitpunkte: Start, Verlauf, Tag 28. Die kleine Verbindungslinie trägt hier echte zeitliche Bedeutung. Kontaktbox mit vorhandenem Porträt.

**Inhalt und Freigabe:** Live: echte Zuständigkeit, realistischer Antwortzeitraum, Weg zur Rückmeldung, Initiator des Folgetermins und enthaltene Leistungen. Kein angeblicher täglicher Arztkontakt ohne entsprechende Leistung.

**Vermeiden:** Keine wöchentlich garantierten Hautverbesserungen und keine Normalisierung starker Reaktionen.

**Prüfen:** Wissen Kundinnen, wann und wie sie Unterstützung erhalten? Supportanfragen und Retourengründe mitbetrachten.

## 10 · Vollständigkeit ohne Überlastung

**Innere Frage:** Kann ich die Beurteilung nachvollziehen?

**Psychologische Hypothese:** Vertiefung nach Bedarf: die wesentliche Erklärung bleibt sofort sichtbar, komplexere Inhalte bleiben erreichbar. Unterschiedliche Informationsbedürfnisse werden berücksichtigt.

**Gestaltung:** Vier native Aufklapper: Zonen, Bedeutung, Methode/Grenzen, möglicher Verlauf. Zusammenfassungen sind mit Tastatur bedienbar. Der Methodenlink im Ergebnis öffnet den passenden Aufklapper.

**Inhalt und Freigabe:** Im Livebericht alle anwendbaren Felder des v3-Schemas darstellen; fehlend, nicht beurteilbar und nicht zutreffend unterscheiden. Kein technischer Datenstrom in der Kundenansicht.

**Vermeiden:** Wesentliche Einschränkungen oder kaufrelevante Risiken nicht verstecken. Keine unbestimmten Zukunftsprognosen als Verkaufsargument.

**Prüfen:** Finden informationsorientierte Personen ihre Antwort, ohne andere zum Lesen sämtlicher Details zu zwingen?

## 11 · Einwände beantworten

**Innere Frage:** Was könnte gegen den Start sprechen?

**Psychologische Hypothese:** Relevante Zweifel werden beantwortet. Die Kundin behält Kontrolle und muss die Informationen nicht außerhalb suchen.

**Gestaltung:** Kurze Fragen, Antwort erst bei Bedarf. Reihenfolge: Passung, bestehende Pflege/Empfindlichkeit, Zeitraum, Reaktionen, Lieferung, Daten.

**Inhalt und Freigabe:** Antworten aus echten Produktinformationen und Betriebsabläufen. Bei Schwangerschaft, Stillzeit, Allergien oder anderer Behandlung muss die individuelle Passung vor dem Verkauf geprüft werden.

**Vermeiden:** Keine pauschale Sicherheit für alle Hauttypen. Nicht jede Einwendung reflexartig in ein Kaufargument verwandeln.

**Prüfen:** Welche Fragen bleiben nach dem Lesen offen? Wiederkehrende Supportfragen in die Inhalte übernehmen.

## 12 · Verantwortlichkeit und Wiederkehr

**Innere Frage:** Welches Unternehmen steht dahinter, und finde ich die Seite wieder?

**Psychologische Hypothese:** Nachprüfbarkeit als Grundlage von Vertrauen. Marke, Arztrolle und Verkäufer sind unterschiedliche Verantwortlichkeiten.

**Gestaltung:** Ruhiger Abschluss mit Marke, Betreiberinformationen und erreichbaren Kontakt-/Rechtslinks. Der Musterabschluss ist ehrlich als Demonstration gekennzeichnet.

**Inhalt und Freigabe:** Vor Livebetrieb: vollständiger Betreiber, Anschrift, Kontakt, Bedingungen, Datenschutz. Anbieter kann nicht aus einem Porträt abgeleitet werden. Persönlichen Bericht nur über dafür vorgesehenen sicheren Link erneut zugänglich machen.

**Vermeiden:** Keine erfundenen Adressen, Gütesiegel oder ‚privat‘-Behauptung ohne technische Absicherung.

**Prüfen:** Kann eine neue Person den Verkäufer identifizieren und Kontakt aufnehmen?

## Design, Datenvertrag und Integrationsbedingungen

Die druckbare HTML-Fassung unter `apps/lifeskin-astra/audit.html` enthält zusätzlich den vollständigen Designvertrag, den Live-Datenvertrag, erforderliche Betriebsangaben und den qualitativen sowie quantitativen Prüfplan. Sie wird als eigenständige Seite mit ausgeliefert.

## Quellen

- [Nielsen Norman Group · Trustworthiness in Web Design](https://www.nngroup.com/articles/trustworthy-design/)
- [Nielsen Norman Group · Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [Nielsen Norman Group · Interface Copy Impacts Decision Making](https://www.nngroup.com/articles/interface-copy-decision-making/)
- [Baymard Institute · Payment UX](https://baymard.com/learn/payment-ux)

## Verifikation und Auslieferung

- npm ci mit bestehendem Lockfile ausgeführt, keine Dependency-Änderungen.
- npm run build erfolgreich; Warnung über bestehende große Social-Chunks, kein Buildfehler. Die durch Reservierung der neuen Route geänderten gehashten Bundles gehören zum Commit.
- 21 bestehende Tests für Public-Route-Resolver, Details-Pfade und LifeSkin-Service-Worker bestanden.
- Mobile Sichtprüfung im Browser bei 390 × 844 CSS-Pixeln: Ergebnis, Angebot, Dialog und simulierte Bestätigung. Kein physischer iPhone-/Safari-Test.
- Desktop und Audit-Umschaltung manuell geprüft. Keine Playwright-/E2E-Suite ausgeführt (Repository-Vorgabe).
- Keine echten Patientendaten oder Produktions-Firebase-Zugriffe im Template. Keine Werbepixel, kein Senden von Bestellungen.
- Lokaler Vorschau-Server unterstützt nun zusätzlich die übliche CLI-Schreibweise --port 4173. Standardport 5173 bleibt erhalten. Die feste LAN-Adresse aus AGENTS.md steht in dieser Umgebung nicht zur Verfügung.
- Manuelle Abnahme: Auf Smartphone öffnen, Diagnose auf Albanisch/international prüfen, Produktaufklapper öffnen, Setpreis kontrollieren, Testformular bedienen, Audit ein-/ausschalten.

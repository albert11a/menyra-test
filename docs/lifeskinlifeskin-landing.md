# LifeSkin landing template — /lifeskinlifeskin

Scope: a separate, mobile-first Albanian landing page for cold Instagram/Facebook visitors. Existing /lifeskin, customer reports, checkout, Meta Pixel and CAPI remain untouched. Route the primary CTA to the existing photo entry at /lifeskin?ls_weg=foto. This uses the existing direct-entry handler and its camera/gallery fallback. No new tracking, backend writes, fabricated reviews, patient outcomes or success percentages.

Design: system typography, white/sage palette, large existing brand photos, short sections, one primary action, a small doctor identity block and clear product prices before starting. Product photography is editorial imagery, never patient proof. Prices read the existing shared price helper; HTML has the current fallback prices. Preserve incoming attribution parameters on the same-origin funnel link, including silent preview mode. Native links and FAQ work without JavaScript.

Research:
- Nielsen Norman Group: concise, scannable, objective copy reduces cognitive load. https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/
- Baymard: price transparency and removing unnecessary checkout friction matter. https://baymard.com/blog/reduce-cart-abandonment

These support usability choices, not a promised conversion uplift. Evaluate qualified analysis completions and completed purchases; more starts alone are insufficient. This template does not introduce a new analytics implementation because the repository requires explicit permission for Pixel changes.

Release: a separate review branch and Vercel preview. Repository rules prohibit an automatic main merge or production deployment.


## Smartphone update (2026-10-01)
User requested simple everyday Albanian and a consistent redesign of landing, method selection, all input steps, waiting, final therapy and checkout. Implement as an opt-in presentation layer (`ls_design=mobile`) using the existing controllers and DOM IDs. It follows the template visitor through /lifeskin, /analiza and /terapia using sessionStorage plus query propagation. Standard visitors receive no style or text changes; `ls_design=classic` explicitly exits. No changes to clinical report content, event calls, timing, validations, storage or order submission. Generated report copy and prices remain authoritative.

The new final therapy presentation brings the problem/product explanation and complete offer together before deeper details. It preserves medical cautions, no-product cases, declined offers and order status. A separate labeled demonstration uses fictional local data, existing controllers and blocked remote writes. It is not a patient report and cannot place orders.

### Interne Vorschau

`/apps/lifeskinlifeskin/preview.html?page=wait` lädt die echte Warteseiten-Darstellung mit einem fiktiven Bericht. Der ausschließlich hier sichtbare Weiter-Button öffnet `?page=analysis` mit dem nativen Verkaufscontroller. Status `vorschau`, injizierter Datentransport, deaktivierte Zählung sowie blockierte Schreib-, Bestell- und WhatsApp-Aktionen verhindern echte Fälle/Bestellungen. Der Live-Wartezustand bekommt keinen Überspringen-Button. Produktbilder stammen aus vorhandenen öffentlichen Assets; keine Patientenbilder oder medizinische Freigabe im Beispiel.

### Validierung Smartphone-Update

- `npm run build`: erfolgreich; vorhandene Social-Bundle-Warnungen bleiben, keine getrackten Bundle-Änderungen.
- 32 gezielte Prüfungen erfolgreich: Design-Opt-in, Rückkehr zu Classic, URL-Weitergabe, interne Demo-Isolation, unveränderte Pixel-Aufrufe, Service Worker und In-App-Funnel.
- Echte iPhone-/Android- und Instagram-/Facebook-Webview-Prüfung steht noch aus. Browseransicht wird auf Telefonbreite begrenzt; das ersetzt keine Prüfung auf einem echten Smartphone.

Manuell in der Vercel-Vorschau geprüft: Einstieg → Fotoanleitung → Methodenauswahl sowie interner Warte-Button → Ergebnis → Produktangebot → Warenkorb → Adressformular. Telefonbreite 480 px innerhalb des Desktop-Browsers; kein echter Geräte-/Webview-Test. Ein im Review gefundener Stylesheet-Konflikt auf dem Template wurde korrigiert: die native Flow-CSS lädt nur auf den bestehenden Folgeseiten. Fiktives Duo verwendet 39 €, Vorher/Nachher-Fälle werden nur in der internen Demo ausgeblendet.

## Vollständiger gestalterischer Neuaufbau (2026-10-01)

Korrektur nach Nutzerfeedback: Die vorherige Landing-Optik aus `2733e687` wird wiederhergestellt, einfache albanische Erklärung beibehalten. Auswahl, Foto-/Scanvorbereitung, Frage-/Kontaktschritte, Wartebildschirm, Ergebnis, Produktentscheidung und Kasse erhalten eine neu komponierte Oberfläche statt der letzten bloßen Umfärbung. Foto zuerst, klare Orientierung je Schritt, Wartebestätigung mit erreichbarem Rückmeldeweg, fertige Analyse als zusammenhängende Kaufentscheidung. Gestaltung: große Typografie, viel Weiß, klare Abschnittszahlen, dunkles Gesamtangebot mit sichtbarem Endpreis. Keine erfundenen Ergebnisse, Mengen, Freigaben, Zeitversprechen oder künstliche Verknappung. Native Knoten/IDs, klinische Daten und Aktionen bleiben erhalten. Der interne Weiter-Button bleibt nur in der fiktiven Vorschau. Keine automatische Veröffentlichung auf main.

## Umfangskorrektur: ausschließlich Landingpage (Nutzer 2026-10-01)

Weitere Arbeiten an Auswahl/Warte-/Analyseseiten gestoppt, die noch offenen Anpassungen dort verworfen. Neu erstellt werden nur `index.html`, `landing.css`, `landing.js` des Templates. Keine neue Aktivierung der Flow-Gestaltung: kein `design.js` auf der Landing; Weiterleitungen mit `ls_design=classic` verwenden die bestehenden Folgeseiten. Die bisherigen Vorschau-Arbeiten auf dem Branch sind keine Veröffentlichung.

Neuer kompakter Einstieg für Kosovo: sichtbares Hautproblem, Foto + ärztliche Empfehlung, Produktbilder, zwei Produkte für 39 €, kostenlose Lieferung, Zahlung bei Erhalt. Primär kostenlose Fotoanalyse; wer das Set kennt, gelangt über den ausdrücklich beschrifteten Shop-Link zum vorhandenen Set-/Bestellbereich. Keine erfundenen Bewertungen, Erfolgsgarantien, Fristen, Rabatte oder Verknappung. Preise aus dem vorhandenen Preishelfer, Attribution einschließlich Link-Anker bleibt erhalten.

Recherche für diese Entscheidung: NN/g Homepage Design Principles (https://www.nngroup.com/articles/homepage-design-principles/) und Baymard zu Versandinformationen direkt auf Produktseiten (https://baymard.com/research-articles/avoid-banners-only-free-shipping). Das unterstützt schnelle Verständlichkeit und transparente Kosten; keine belegte Kosovo-spezifische Conversion-Prognose und keine Garantie einer Kaufentscheidung in drei Sekunden.

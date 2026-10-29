# Profil-Fotos und Cold Load, 2026-10-29

## Auftrag und Integration

Performance-Aenderung von `profilfix92` (`00daecec`) auf ausdruecklichen
Nutzerauftrag in den aktuellen `main`-Stand `22c336e7` uebernommen.
Der alte Branch wurde nicht insgesamt gemergt. Neuere Mainline-Aenderungen,
insbesondere Video-Poster und die vorhandene Manifest-Inline-Auslieferung,
bleiben erhalten. Bundles werden aus dem aktuellen Mainline-Code neu gebaut.

## Analyse und Umsetzung

- Main liefert das Build-Manifest bereits inline aus. Dieser bestehende
  Mechanismus bleibt unveraendert; der alte Build-Skript-Patch ist redundant.
- Public-Einstieg importiert zwingend die App. Diese und ihre statischen
  Abhaengigkeiten werden jetzt parallel vorgeladen, ohne Ausfuehrungsreihenfolge
  oder Route-Kontext zu aendern.
- Profil-Post-Kacheln wurden durch `variantGroup: post-detail` auf grosse
  Varianten angehoben. Vorschauen verwenden jetzt responsive 480/768/1280w
  fuer vom Resolver bestaetigte Varianten. Externe/Firebase-URLs ohne
  Transformation bekommen keine erfundenen Breiten.
- Erste zwei Grid-Posts bzw. erster Listen-Post eager; nur erstes Bild mit
  hoher Prioritaet. Weitere Bilder bleiben lazy. Last-Good-Cache pro Groesse.
- Neue Mainline-Video-/Poster-Logik bleibt erhalten, ebenso Layout, Auth,
  Firebase-Abfragen, Sichtbarkeitsregeln, QR und Menue.

## Geaenderte Quellen

- `apps/menyra-social/index.html`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/profile/profile-post-image-utils.js`
- `tests/profile-post-image-utils.test.mjs`
- dieses Dokument sowie neu gebaute getrackte Bundles

## Validierung

Gezielte Unit-Tests, Syntax-/Diff-Pruefung und Produktionsbuild auf aktuellem
Mainline-Code. Keine Browser-/Mobile-/Playwright-Smoke-Pruefung durchgefuehrt;
reale Cold-Load-Zeiten und LCP wurden nicht gemessen.

## Manuelle Testliste

1. Creator-Profil im privaten mobilen Browser direkt oeffnen und neu laden.
2. Grid/Liste, Scrollen, Post-Detail und Video mit/ohne Poster pruefen.
3. Netzwerk ohne Cache: erste Post-Bilder priorisiert, passende Breiten;
   im Build keine separate Manifest-Anfrage.
4. Firebase-/externe Bilder, Business-Menue und QR gegenpruefen.

Build/Test-Status und Mainline-Commit werden in der Aufgabenrueckmeldung genannt.

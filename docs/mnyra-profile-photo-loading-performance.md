# Profil- und Creator-Fotos: Ladepfad, 2026-10-29

## Analyse und Plan

Arbeitsgrundlage: `profilfix92` bei `a06396c2`, gemaess bestehendem
branch-spezifischem Nutzerauftrag. Keine direkte Arbeit auf `main`.

1. Der HTML-Start fordert das Vite-Manifest mit `no-store` an, bevor er
   Einstieg und statische Abhaengigkeiten vorladen kann. Der Public-Einstieg
   importiert anschliessend zwingend die App; deren Download beginnt spaeter.
2. Profil-Post-Kacheln nutzen `variantGroup: post-detail`; dadurch werden
   auch Medium-Vorschauen im Resolver auf 1280 Pixel hochgestuft.
   Es fehlen responsive Bildquellen, und alle Posts sind lazy.
3. Der vorhandene Media-Worker versteht bereits Breitenvarianten und
   langfristiges Caching. Keine neue Infrastruktur erforderlich.

Umsetzung: Build-Metadaten mit dem HTML ausliefern, benoetigte App-Dateien
frueher vorladen, responsive Post-Vorschauen und begrenzte Eager-Prioritaet.

## Geaendert

- `scripts/build-vercel-static-output.mjs`: kompaktes Manifest nur fuer die
  zwei Start-Einstiege und ihre statischen Imports in das Deployment-HTML
  einsetzen. Fehlende Build-Dateien fuehren zum Build-Fehler.
- `apps/menyra-social/index.html`: Inline-Manifest bevorzugen; externe
  Manifest-Aufloesung und Raw-Einstieg als bestehende Fallbacks behalten.
  Public-Start laedt die ohnehin benoetigte App parallel vor, ohne sie vor
  der Veroeffentlichung des Route-Kontexts auszufuehren.
- `core/profile/profile-post-image-utils.js`: Vorschauen mit 480/768/1280w
  fuer vom Resolver bestaetigte Varianten; externe unveraenderte URLs
  bekommen keine erfundenen Breiten. Im Grid erste zwei, in Listen erster
  Post eager; nur erster Post mit hoher Prioritaet.
- `core/profile/profile-menu-focus-render-controller.js`: diese Quellen
  fuer Profil-Posts verwenden; Last-Good-Cache getrennt nach Bildgroesse.
- Produktionsbundles neu gebaut; gezielte Unit-Tests hinzugefuegt.

Layout, Detailansicht, Routing, Authentifizierung, Firebase-Abfragen,
Sichtbarkeitsregeln, QR, Menue und Media-Worker bleiben unveraendert.

## Validierung und Bewertung

- `npm run build`: erfolgreich.
- Sechs Unit-Tests fuer responsive Quellen/Prioritaet und bestehenden
  Image-Reveal bestanden. Fuer `/shared/` wurde im Testprozess ein
  Node-Resolve-Hook auf das Repository verwendet.
- Gebautes HTML im Node-VM-Kontext fuer App/Public geprueft: keine separate
  Manifest-Anfrage; alle vorgeladenen Dateien vorhanden; Public laedt beide
  benoetigten Einstiegsmodule vor.
- Syntaxpruefungen und `git diff --check`: erfolgreich.
- Keine Smoke-/Playwright-Laeufe gemaess AGENTS.md. Keine gemessenen
  Browser-Ladezeiten, kein belegter LCP-Vergleich und keine Behauptung,
  dass die Seite bereits instant laedt.
- Restlimit: App ca. 302 KB gzip plus Firebase ca. 133 KB gzip. Der Server-
  und Datenzugriff sowie die tatsaechliche Bildtransformation bleiben fuer
  den Cold Load relevant. Groesseres Public-App-Splitting braucht einen
  eigenen stabilen Architekturvertrag gemaess Projektplan.

## Kurze manuelle Testliste

1. Creator-Profil direkt in einem privaten Browserfenster oeffnen, danach
   hart neu laden. Header, erste Posts und Fotos kontrollieren.
2. Grid/Liste umschalten, scrollen und einen Post oeffnen: alle Bilder,
   volle Detailaufloesung und bestehende Darstellung pruefen.
3. Netzwerk bei deaktiviertem Cache: im Produktionsbuild keine separate
   `bundled/manifest.json`-Anfrage; Grid-Bilder bekommen passende `w`-Werte.
4. Profil mit Firebase-/externen Bildern sowie Business-Menue/QR kurz
   gegenpruefen. Raw-Fallback mit `?mnyra-raw-entry=1` pruefen.

Bewertung: Build und gezielte technische Pruefungen bestanden;
Browser-/Vercel-Abnahme und reale Performance-Messung stehen aus.

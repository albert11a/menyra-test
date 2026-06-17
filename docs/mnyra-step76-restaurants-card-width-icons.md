Status: CURRENT
Last updated: 2026-06-17

# Schritt 76 - Restaurants Card Width And Icons

## Ziel

Im Tab `Restaurants` sollen nur die normalen unteren Restaurant-/Cafe-List-
Cards nachgezogen werden. Die obere Swipe-/Best-Card-Zeile bleibt ausserhalb
dieses Schritts.

Gewuenscht war:

- die unteren Cards sollen links denselben Abstand haben wie die oberen
  Swipe-Cards;
- fehlende Icons in diesen unteren Cards sollen wieder sichtbar sein.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Die normale Restaurant-/Cafe-List-Card nutzt nicht mehr die zentrierte
    `max-w-[340px]`-Breite aus Schritt 75.
  - Die Card bleibt `w-full` im bestehenden Restaurants-Content-Container.
    Dadurch beginnt sie links wieder an derselben Containerkante wie die
    obere Swipe-/Best-Card-Zeile.
  - Fuer die in dieser Card verwendeten Icons `share-2`, `phone` und
    `book-open` wurden lokale Inline-SVG-Fallbacks im Marketplace-Renderer
    ergaenzt.
  - Der globale App-Icon-Entry wurde bewusst nicht erweitert; die Fallbacks
    bleiben auf diese Restaurant-Card begrenzt.
- `apps/menyra-social/bundled/**`
  - Social-Bundle nachgezogen, inklusive neuem Marketplace-Chunk-Hash.

## Bewusst Nicht Geaendert

- Keine Aenderung an den oberen Swipe-/Best-Cards im Restaurants-Tab.
- Keine Aenderung an Lead-Speicherung, Lead-Feldern oder Heart-Editor.
- Keine Aenderung an Profil/Menu-Open-Flow.
- Keine Aenderung an Routing, QR, Cart, Order, Travel, Firebase Rules oder
  Functions.
- Kein Smoke-/Playwright-Lauf durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist eine gezielte sichtbare Korrektur an der normalen unteren
Restaurant-/Cafe-List-Card. Rest-Risiko liegt in der manuellen Sichtpruefung
echter Restaurantdaten auf mobilen Breiten.

Wichtigster Effekt: Die untere Card ist nicht mehr schmal zentriert, sondern
nutzt die vorhandene Content-Breite. Gleichzeitig erscheinen die Card-Icons
fuer Teilen, Telefon und Menu auch dann, wenn die verzoegerte Lucide-Runtime
noch nicht nachgezogen hat.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `node --check apps/menyra-social/social-app.js`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
  - Ergebnis: `social-app.js` 1,049,995 Bytes raw / 285,000 Bytes gzip.

## Manuelle Testliste

- Feed-Location setzen oder vorhandene Feed-Location nutzen, damit
  `Restaurants` direkt ohne Gate rendert.
- Tab `Restaurants` oeffnen.
- Pruefen, dass die unteren normalen Restaurant-/Cafe-Cards links denselben
  Abstand haben wie die erste obere Swipe-/Best-Card.
- Pruefen, dass Teilen-, Telefon- und Menu-Icon in der unteren Card sichtbar
  sind.
- Pruefen, dass `Profil` weiterhin das Profil oeffnet.
- Pruefen, dass `Menu` weiterhin direkt den Menu-Tab oeffnet.
- Pruefen, dass die oberen Swipe-/Best-Cards unveraendert aussehen.

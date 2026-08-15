# Mnyra GO - die Bilder der Geschichte im Bento

Vier Bilder, in dieser Reihenfolge. Die Reihenfolge ist nicht Geschmack: Sie
ist die der Sache selbst - erst der Hunger, dann die Frage wohin, dann der
Preis, dann der Abend. Ein Bild an der falschen Stelle erzaehlt sie falsch
herum.

| Datei | Was im Bild steht | Der Satz darunter (steht im Code) |
| --- | --- | --- |
| `story-1-unt.webp` | A je unt? | Trego sa veta jeni edhe çka po ju hahet. |
| `story-2-ku-me-dal.webp` | S'po din ku me dal? | Mos lyp lokal — lokalet që t'përshtaten t'gjejnë ty. |
| `story-3-shtrejt.webp` | Edhe shumë shtrejt? | Lokalet t'çojnë oferta me zbritje direkt — ti veç zgjedh. |
| `story-4-knaqu.webp` | Ofertat t'vijn. Ti veç shko, knaqu. | Zgjedhe ofertën që t'pëlqen, shko aty edhe knaqu. |

Die Namen stehen in `core/go/go-page-render-utils.js` (`GO_STORY_SLIDES`).
Wer eine Datei anders nennt, aendert sie dort mit - sonst zeigt die Seite die
leere Flaeche statt des Bildes.

## Format

- **16:9.** Das Bildfenster im Bento haelt genau dieses Verhaeltnis. Ein
  anderes Verhaeltnis wird beschnitten, und beschnitten wird an den Seiten -
  dort steht die Frage.
- **1600 x 900 px.** Das ist die Breite des Bentos auf einem grossen Telefon
  mal zwei. Mehr laedt nur laenger.
- **WebP, Qualitaet ~82.** Die Seite traegt vier grosse Bilder; als PNG waeren
  sie zusammen ueber 11 MB, so sind es 247 kB. Umrechnen z. B. mit
  `cwebp -q 82 -resize 1600 900 story-1-unt.png -o story-1-unt.webp`.

Die Vorlagen kamen als PNG in 1672 x 941 (Verhaeltnis 1,7768). Auf 1600 x 900
(1,7778) liegt der Unterschied unter einem Promille - es wurde nichts
beschnitten.

## Die Frage steht im Bild

Sie ist Teil des Fotos und wird nicht darueber gelegt. Deshalb steht sie im
Code noch einmal als `headline` - sie ist das `alt` des Bildes. Ohne sie
waere die Frage fuer jeden verloren, der die Bilder nicht sieht.

## Ein Bild austauschen

`vercel.json` gibt allem unter `/apps/menyra-social/assets/` ein Jahr
`immutable` mit. Wer eine Datei unter demselben Namen ersetzt, sieht die
Aenderung selbst nach einem Neuladen nicht - der Browser fragt gar nicht erst
nach. Ein ausgetauschtes Bild bekommt deshalb einen neuen Namen
(`story-1-unt-v2.webp`), und der Name wird in `GO_STORY_SLIDES` mitgezogen.

## Fehlt eine Datei

Dann nimmt der Browser das Bild heraus und es bleibt die graue Flaeche in
ihrem Seitenverhaeltnis stehen. Kein zerbrochenes Symbol, kein Sprung im
Aufbau - aber eben auch kein Bild.

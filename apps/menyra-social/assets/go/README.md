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
- **WebP, Qualitaet ~80.** Die Seite traegt vier grosse Bilder; als JPEG waere
  sie ungefaehr doppelt so schwer. Umrechnen z. B. mit
  `cwebp -q 80 story-1-unt.jpg -o story-1-unt.webp`.

## Die Frage steht im Bild

Sie ist Teil des Fotos und wird nicht darueber gelegt. Deshalb steht sie im
Code noch einmal als `headline` - sie ist das `alt` des Bildes. Ohne sie
waere die Frage fuer jeden verloren, der die Bilder nicht sieht.

## Fehlt eine Datei

Dann nimmt der Browser das Bild heraus und es bleibt die graue Flaeche in
ihrem Seitenverhaeltnis stehen. Kein zerbrochenes Symbol, kein Sprung im
Aufbau - aber eben auch kein Bild.

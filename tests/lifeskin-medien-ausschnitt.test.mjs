// AUSSCHNITT DER KUNDENFOTOS UND -VIDEOS (Wunsch Inhaber 05.10.): in Heart
// zuschneiden (ziehen, zoomen), auf allen Seiten im 9:16-Rahmen genauso.
import test from "node:test";
import assert from "node:assert/strict";
import {
  ausschnittNormalisieren, ausschnittStil, medienAusDokument, mediumNormalisieren, AUSSCHNITT_STANDARD
} from "../shared/lifeskin-medien.js";

test("Ausschnitt wird begrenzt und gerundet, Unsinn ist keiner", () => {
  assert.deepEqual(ausschnittNormalisieren({ x: 120, y: -5, zoom: 9 }), { x: 100, y: 0, zoom: 4 });
  assert.deepEqual(ausschnittNormalisieren({ x: 33.333, y: 66.666, zoom: 1.2345 }), { x: 33.3, y: 66.7, zoom: 1.23 });
  assert.equal(ausschnittNormalisieren(null), null);
  assert.equal(ausschnittNormalisieren({}), null);
  assert.equal(ausschnittNormalisieren({ x: "a", y: 1, zoom: 1 }), null);
});

test("ohne Ausschnitt bleibt das CSS der Seite, mit Ausschnitt fuellt er den Rahmen", () => {
  assert.equal(ausschnittStil(null), "");
  assert.equal(ausschnittStil({ x: 50, y: 25, zoom: 1 }), "object-fit:cover;object-position:50% 25%");
  assert.equal(ausschnittStil({ x: 40, y: 60, zoom: 2 }),
    "object-fit:cover;object-position:40% 60%;transform:scale(2);transform-origin:40% 60%");
  // Nie etwas, das aus dem style-Attribut ausbricht.
  assert.equal(ausschnittStil({ x: '1"><script>', y: 1, zoom: 1 }), "");
});

test("Ausschnitt kommt aus Firestore-REST und Heart-Daten mit", () => {
  const doc = {
    name: "projects/p/databases/(default)/documents/lifeskin/lifeskin/medien/m-1",
    fields: {
      art: { stringValue: "foto" }, bild: { stringValue: "https://cdn.example/a.jpg" },
      ausschnitt: { mapValue: { fields: { x: { integerValue: "30" }, y: { doubleValue: 70.5 }, zoom: { doubleValue: 1.5 } } } }
    }
  };
  assert.deepEqual(medienAusDokument(doc).ausschnitt, { x: 30, y: 70.5, zoom: 1.5 });
  assert.equal(medienAusDokument({ name: "x/m-2", fields: {} }).ausschnitt, null);
  assert.deepEqual(mediumNormalisieren({ id: "m", ausschnitt: { x: 1, y: 2, zoom: 3 } }).ausschnitt, { x: 1, y: 2, zoom: 3 });
  assert.equal(mediumNormalisieren({ id: "m" }).ausschnitt, null);
});

test("Heart: Kachel und Editor zeigen den Ausschnitt, der Editor hat Regler und Zuruecksetzen", async () => {
  const { renderMedien, renderMediumEditor } = await import("../apps/mnyra-heart/heart-lifeskin-medien.js");
  const medien = [
    { id: "m-a", art: "foto", bild: "https://cdn.example/a.jpg", produkt: "LF Acne", aktiv: true, reihe: 0, ausschnitt: { x: 40, y: 60, zoom: 2 } },
    { id: "m-b", art: "foto", bild: "https://cdn.example/b.jpg", produkt: "Pore", aktiv: true, reihe: 1 }
  ];
  const karte = renderMedien({ medien });
  assert.match(karte, /src="https:\/\/cdn\.example\/a\.jpg"[^>]*style="object-fit:cover;object-position:40% 60%;transform:scale\(2\)/);
  assert.doesNotMatch(karte, /b\.jpg"[^>]*style=/);

  const editor = renderMediumEditor({ medien, medienOffen: "m-a" });
  assert.match(editor, /data-ausschnitt-buehne data-gesetzt="1" data-x="40" data-y="60" data-zoom="2"/);
  assert.match(editor, /<img data-ausschnitt-medium[^>]*style="object-fit:cover;object-position:40% 60%/);
  assert.match(editor, /data-ausschnitt-zoom min="1" max="4"[^>]*value="2"/);
  assert.match(editor, /data-action="lifeskin-ausschnitt-zurueck"\s*>/);

  // Nie eingestellt: Start wie die Kacheln (50 % / 25 %), Zuruecksetzen aus.
  const ohne = renderMediumEditor({ medien, medienOffen: "m-b" });
  assert.match(ohne, new RegExp(`data-gesetzt="" data-x="${AUSSCHNITT_STANDARD.x}" data-y="${AUSSCHNITT_STANDARD.y}" data-zoom="1"`));
  assert.match(ohne, /data-action="lifeskin-ausschnitt-zurueck" disabled/);

  // Zurueckgesetzt im Entwurf schlaegt den gespeicherten Ausschnitt.
  const zurueck = renderMediumEditor({ medien, medienOffen: "m-a", medienEntwurf: { ausschnitt: null } });
  assert.match(zurueck, /data-gesetzt=""/);
});

test("Shop: Kachel und Blatt tragen den Ausschnitt, ohne ihn nichts", async () => {
  const { kundenGalerie, klientBlatt } = await import("../apps/lifeskin-shop/shop.js");
  const m = { id: "m-a", art: "foto", bild: "https://cdn.example/a.jpg", produkt: "LF Acne", aktiv: true, ausschnitt: { x: 40, y: 60, zoom: 1 } };
  assert.match(kundenGalerie([m]), /a\.jpg"[^>]*style="object-fit:cover;object-position:40% 60%"/);
  assert.match(klientBlatt(m), /class="klient-medium"[^>]*style="object-fit:cover;object-position:40% 60%"/);
  assert.doesNotMatch(klientBlatt({ ...m, ausschnitt: null }), /style=/);
});

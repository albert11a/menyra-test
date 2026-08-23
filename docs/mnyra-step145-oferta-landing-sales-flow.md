Status: CURRENT
Last updated: 2026-08-23

# Mnyra Schritt 145: Oferta-Landing als Verkaufsfluss

## Schritt

Die bestehende Lead-Landing unter `/oferta/<slug>` wurde auf einen klaren
Verkaufsfluss umgebaut. Der persoenliche Teil (Profil, Postimet, Sot ne fokus,
Menyja) bleibt unveraendert und kommt weiter aus den echten Daten des Leads;
neu sind der Einstieg, der Mnyra-Teil danach und der Verkaufsteil.

Die Kerngeschichte ist jetzt:

    Was ist Mnyra?  ->  Das ist Ihr Lokal  ->  Das sind Ihre Inhalte
    ->  Das kann Mnyra kostenlos  ->  0 €
    ->  Wenn Sie keine Arbeit damit wollen: 150 € einmalig
    ->  Optionale Zusatzfunktionen  ->  Entscheidung

Der wichtigste Punkt ist die Trennung zwischen "Mnyra ist kostenlos" und
"150 € ist ein optionaler Dienst". Sie darf sprachlich und visuell an keiner
Stelle verschwimmen; `tests/lead-landing-prices.test.mjs` haelt sie fest.

## Die siebzehn Bildschirme

| # | Bildschirm | Marke (`data-track`) |
| --- | --- | --- |
| 1 | Einstieg: Logo, Name, "Mirë se vini në Mnyra", "Falas" | `hyrje` |
| 2 | Profili juaj në Mnyra (bestehende Profilansicht) | `profil-0` |
| 3 | Postimet (bestehende Postimet) | `profil-1` |
| 4 | Sot në fokus (bestehende Fokusansicht) | `profil-2` |
| 5 | Menyja juaj (bestehende Menueansicht) | `profil-3` |
| 6 | Kapitelwechsel "Çka është Mnyra?" | `cka-eshte` |
| 7 | Kostenlose Funktionen als Wischkarten | `falas-funksionet` |
| 8 | 0 € | `zero-euro` |
| 9 | Trennung: Mnyra bleibt kostenlos / S'keni kohë? | `sherbimi-hyrje` |
| 10 | 1 produkt -> 6 foto profesionale (Fotos des ersten Produkts) | `foto-profesionale` |
| 11 | Was wir uebernehmen (zwei kurze Listen) | `cka-bejme` |
| 12 | +10 foto ekstra (die uebrigen Fotos des Lokals) | `foto-ekstra` |
| 13 | +10 QR kode për tavolina | `qr-tavolina` |
| 14 | 150 €, einmalig | `cmimi-sherbimit` |
| 15 | Kapitelwechsel "Dëshironi më shumë?" | `me-shume` |
| 16 | Kostenpflichtige Zusatzfunktionen als Wischkarten | `funksione-shtesa` |
| 17 | Entscheidung: Paket oder kostenloses Profil | `vendimi` |

## Geaendert

- `apps/menyra-social/lead-landing/lead-landing-sections.js` traegt nur noch
  den Einstieg und das Profil-Kapitel. Der Einstieg ist neu (Logo und Name
  oben, Begruessung, Versprechen, Pfeil - kein Preis, keine Funktionsliste).
  Die vier Schritte des Profil-Kapitels tragen die neuen Ueberschriften; der
  eingeschobene Frage-Bildschirm ist daraus herausgeloest und steht jetzt als
  eigener Kapitelwechsel danach.
- `apps/menyra-social/lead-landing/lead-landing-sales.js` (neu) rendert die
  Bildschirme 6 bis 17.
- `apps/menyra-social/lead-landing/lead-landing-prices.js` (neu) haelt alle
  Zahlen der Seite an einer Stelle. Die GO-Tabelle ist Zeile fuer Zeile die
  aus `shared/go/go-commission-core.js`.
- `apps/menyra-social/lead-landing/lead-landing-swipe.js` (neu) setzt die
  Punkte unter den Wischkarten. Gewischt wird vom Browser
  (`scroll-snap-type: x mandatory`), hier wird nur abgelesen.
- `apps/menyra-social/lead-landing/lead-landing-app.js` setzt die Seite in der
  neuen Reihenfolge zusammen. Aus dem Fragebogen ist die Entscheidung am Ende
  geworden (`startDecision`).
- `apps/menyra-social/lead-landing/lead-landing-data.js` normalisiert die neuen
  Lead-Felder `productPhotos`, `extraPhotos`, `servicePrice`, `qrExtraPrice`
  und `adsPrice` unter `landingSales` und haelt an jedem Menuepunkt die ganze
  Bildreihe (`imageUrls`) statt nur des ersten Bildes.
- `apps/menyra-social/lead-landing/lead-landing-stage.js` kennt den
  eingeschobenen Bildschirm nicht mehr (`data-aside` ist weg); die Seitenfarbe
  kommt jetzt nur noch von Abschnitten mit eigenem `data-canvas`.
- `apps/menyra-social/lead-landing/lead-landing-styles.css`: neuer Einstieg,
  Kapitelwechsel, Wischkarten, Nullpreis, Trennung, Fotoraster, QR, Preis,
  Knoepfe und Entscheidung. Die Stile der einzeln hereinfahrenden Aufnahmen,
  der beiden Monatspakete, der vier Abschlusskarten und des Fragebogens sind
  entfallen.
- `apps/menyra-social/lead-landing/lead-landing-icons.js` um sechs Zeichen
  ergaenzt (Kamera, Pfeil, QR, Tasche, Megafon, Lieferwagen).
- `apps/menyra-social/lead-landing/index.html` laedt die drei neuen Module vor.
- `apps/mnyra-heart/heart-landing-render.js`: `STEP_ORDER` sind die siebzehn
  Marken oben, `QUESTIONS` beschreiben die Entscheidung statt der drei Fragen.

## Messung

Die Sitzungen laufen weiter in `restaurants/{id}/landingSessions`, im
unveraenderten Schema der Firestore-Regeln. Weil die Regeln nur `q1` bis `q3`
mit `po`/`jo` durchlassen, setzt ein Druck auf einen der beiden Knoepfe am Ende
alle drei: `q1` sagt, dass ueberhaupt gewaehlt wurde, `q2` und `q3` sagen, was
gewaehlt wurde. Keine Regelaenderung noetig.

## Fallbacks

- Die Fotos der beiden Foto-Bildschirme kommen in drei Stufen: erst das im
  Lead Gepflegte (`landingSales.productPhotos`, `landingSales.extraPhotos`),
  sonst die echten Aufnahmen des Lokals - "1 produkt -> 6 foto" nimmt die des
  ersten Produkts mit Bildern, die zehn Zugaben die uebrigen aus Menue und
  Fokus, ohne die zu wiederholen, die schon standen. Bleibt eine Kachel
  uebrig, ist sie eine ruhige Flaeche mit Kamerasymbol - kein fremdes Foto,
  das wie das eigene aussaehe.
- `imageUrls` am Menuepunkt haelt dafuer alle Aufnahmen eines Produkts, nicht
  nur die, die auf der Karte steht.
- Fehlt ein Foto des QR-Aufstellers (`landingSales.qrPhotos`), gilt das Bild
  aus `apps/menyra-social/assets/panel/qr-stand.jpg`.
- Fehlt eine Kontaktnummer, bleiben die beiden Knoepfe am Ende druckbar
  (`<button>` statt `<a>`) - sonst faellt genau die Zahl aus der Messung, um
  die es geht.
- Fehlt ein Preis im Lead, gelten die Zahlen aus `lead-landing-prices.js`. Fuer
  die Werbung steht dort bewusst keine erfundene Zahl, sondern
  "Sipas kërkesës".

## Bewusst Nicht Geaendert

- Profil-, Postimet-, Fokus- und Menueansicht sind unveraendert; sie bilden
  weiter die echte App mit den echten Daten des Leads nach.
- Keine Aenderung an Routing, Firestore-Regeln, Functions oder am
  Share-Preview-Pfad (`api/oferta.js`).
- Die Landing bleibt isoliert: keine Importe aus der Social-App, kein
  Firebase-SDK, kein Schreibpfad ausser der Messung.
- Mnyra SAVE steht als "Së shpejti" da und wird nicht als verfuegbar gezeigt.

## Checks

- `npm run test:unit`: 1452 Tests, alle gruen.
- `npm run lint`: 0 Fehler (293 Warnungen, alle bestehende Baseline).
- `npm run arch:check`: keine Verstoesse.
- `npm run build`: laeuft durch; die Landing gehoert nicht zum Vite-Bundle,
  es haben sich keine Bundle-Dateien geaendert.
- Mobil geprueft: 390x844 im Chromium, alle 17 Bildschirme aufgenommen, kein
  seitliches Ueberlaufen, Wischkarten und Punkte laufen, Entscheidung wird
  aufgezeichnet.

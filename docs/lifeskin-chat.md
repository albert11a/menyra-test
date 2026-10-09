Status: CURRENT
Last updated: 2026-10-07

# LifeSkin Chat - /lifeskinshop <-> Heart

Auftrag Inhaber (07.10.): Chat auf /lifeskinshop, Vollbild wie grosse
Shops, Heart mit Chat-Knopf oben, Chips Offen / Erledigt / Bestellt,
Produkte 1-5 mit "Porosite" direkt zur Kasse, Formulare (Name, Nummer,
Adresse ...), Fotos in beide Richtungen, Analytics des Kunden (woher,
welche Anzeige, was er schon gemacht hat), Entwurf des Kunden sehen bevor
er sendet, Benachrichtigung, Ein/Aus-Schalter (Aus = WhatsApp).

## Wie es die Grossen machen (Recherche 07.10.)

- Intercom / Zendesk / LiveChat: auf dem Telefon immer Vollbild, das
  Eingabefeld bleibt sichtbar und die Tastatur bleibt nach "Senden" offen;
  "Message preview / Sneak peek": das Team sieht den Text, waehrend der
  Kunde tippt (in der Datenschutzerklaerung genannt).
- Shopify Inbox: Produktkarten (Bild, Name, Preis) mit Knopf, der direkt in
  Warenkorb/Kasse fuehrt; Warenkorb und Verlauf des Kunden neben dem Chat.
- Messenger/WhatsApp: Blasen links/rechts, Zeit, "gesehen", "schreibt ...",
  Fotos inline, neueste Nachricht unten, Auto-Scroll nur wenn man unten ist.
- iOS Safari: Tastatur verkleinert das Layout nicht zuverlaessig - Hoehe
  ueber `visualViewport` setzen (dvh allein reicht nicht), Eingabe 16 px
  (sonst Zoom), `interactive-widget=resizes-content` fuer Android.

## Datenmodell (Firestore, Mandant lifeskin)

```
lifeskin/lifeskin/config/chat              oeffentlich lesbar, nur Heart schreibt
  aktiv: bool                              Aus -> Knopf fuehrt zu WhatsApp
  begruessung: string                      erste Zeile im leeren Chat
  antwortzeit: string                      "Zakonisht përgjigjemi brenda pak minutash"
  angebot: [{ id, name, preis, foto }]     Produkte, die Heart senden kann

lifeskin/lifeskin/chats/{zugang}           zugang = 32 Hex (128 Bit), nur im Geraet
  createdAt, updatedAt                     ISO-Text
  sessionId, code                          Verbindung zur Sitzung -> Analytics
  status: offen | erledigt | bestellt      nur Heart
  letzte: { text, von, t }                 fuer die Liste in Heart
  entwurf: { text, t }                     was der Kunde gerade tippt
  kundeAktivAt, kundeGelesenAt             Kunde
  teamTipptAt, teamGelesenAt, teamName     nur Heart
  geraet: { os, browser, app }             einmal beim Anlegen

lifeskin/lifeskin/chats/{zugang}/nachrichten/{id}
  von: kunde | team
  art: text | bild | produkte | formular | antwort
  text (<= 2000), bild (data:image/jpeg, <= 900 KB),
  produkte [<= 5 { id, name, preis, foto }], summe,
  formular { felder [emri, telefoni, adresa, qyteti, email, shenim] },
  antwort { antwortAuf, werte {...} },
  t (ISO), autor (Team)
```

Der Zugang ist das Recht, wie bei der Begleitung (ndjekja): lesen und
schreiben kann, wer ihn kennt; aufzaehlen kann niemand ausser Heart.
Nachrichten sind unveraenderlich (kein Bearbeiten, kein Loeschen durch den
Kunden).

## Wege

- Kunde: Knopf rechts unten auf /lifeskinshop -> Vollbild-Chat. Das Firebase-
  SDK (app + firestore, ~140 KB gz) laedt erst beim ersten Antippen oder wenn
  es schon einen Chat gibt; Nachrichten erscheinen sofort (optimistisch) und
  werden bestaetigt. Echtzeit ueber onSnapshot.
- Aus (config/chat.aktiv = false): derselbe Knopf oeffnet WhatsApp mit
  vorbereitetem Text. Ein laufender Chat bleibt lesbar.
- Produkte: Karte mit Bild, Name, Preis und "Porosite" -> legt genau diese
  Produkte mit dem Preis aus der Karte in den Korb und oeffnet die Kasse.
  Die Bestellung traegt order.chat = Kennung der Nachricht. Pixel und
  Conversions API unveraendert (derselbe Kassenweg).
- Formulare: Karte mit den gewaehlten Feldern; Antwort als Nachricht
  "antwort" - Heart zeigt sie, die Kasse uebernimmt Name/Nummer/Adresse.
- Heart: Kopfzeile "Chat" mit Zahl der ungelesenen; Ansicht #chat mit
  Liste (Offen / Erledigt / Bestellt), Unterhaltung, rechts der Kunde
  (Herkunft, Anzeige, Klickpfad, Warenkorb, Bestellungen), Ein/Aus.
- Benachrichtigung: nach jeder Kundennachricht ruft die Seite
  /api/lifeskin-chat; der Server prueft die Nachricht in Firestore und
  schickt FCM-Push an die Heart-Geraete (wie /api/lifeskin-meldung),
  hoechstens eine je Chat und 20 s, gesammelt unter einem Tag je Chat.

## Grenzen / bewusst nicht

- Kein Login fuer Kunden; wer seinen Browser-Speicher loescht, beginnt
  einen neuen Chat (der alte bleibt in Heart).
- Fotos als data-URL im Dokument (wie die Fotos der Analyse), verkleinert
  auf 1280 px - kein eigener Speicherdienst.
- Meta-Pixel: der Chat meldet nichts an Meta (Pixel-Sperre).

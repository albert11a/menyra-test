# Creator-Paketverwaltung

Der Umfang umfasst die Deckkraft von Foto-Vorschauen pro Creator-Business, die
Reihenfolge innerhalb jedes Pakets und eine aggregierte Seen-Statistik je Foto.
Bestehende Bestell- und Lieferdaten dienen weiterhin der Zugriffsprüfung.
Die Sortierung beeinflusst ausschließlich die Darstellung dieser Daten.

## Deckkraft und Auslieferung

Die Einstellung steht in Paketoptionen. Ohne Business-Wert gilt weiterhin
20 %. Die Vorschau wird aus einem Original im angemeldeten Heart-Browser
gezeichnet. Beim Anwenden erzeugt Heart neue R2-Varianten ausschließlich für
Fotos in aktiven, ungekauften, kostenpflichtigen Paketen. Sobald alle Varianten
bereit sind, veröffentlicht eine Firestore-Transaktion die URLs und die
Einstellung zusammen. Wiederholungen im selben Tab können bereits vorbereitete
Varianten nutzen. Kostenlose Fotos und gekaufte Originale behalten ihre
Download-Pfade. Die Deckkraft für Video-Vorschauen folgt weiter der
bestehenden Einstellung.

## Reihenfolge

Eine geordnete Liste bestehender IDs pro Paket definiert die Position.
Altbestand ohne Liste folgt der bisherigen Reihenfolge. Neue Medien werden
hinten angehängt. Heart zeigt die Änderung sofort und prüft beim Speichern
den vorherigen Stand in einer Firestore-Transaktion. Bei einem Fehler bleibt
die gespeicherte Reihenfolge sichtbar und die Änderung lässt sich erneut
versuchen. Die öffentliche Seite und offene Fotolieferungen prüfen Änderungen
im Vordergrund im bestehenden 12-Sekunden-Takt. Originale, Kaufdaten und
Download-Rechte stammen weiterhin aus den bestehenden Bestell- und Lieferdaten.

## Seen

Ein geladenes Foto muss mindestens eine Sekunde zusammenhängend sichtbar
sein, während der Tab sichtbar und das Dokument fokussiert ist. Bei übergroßen
Fotos sind 50 % der Fläche maßgeblich, die in den Viewport passen kann. Die
Browserkennung wechselt nach 30 Minuten Inaktivität. Katalog, Vollbild und
Liefergalerie teilen dieselbe Kennung je Origin. Still- und Preview-Links
sowie bekannte Heart-Browser sind von der Zählung ausgenommen.

Der Server prüft Seitenstatus und Fotozuordnung. Pro Request werden bis zu 32
Foto-IDs verarbeitet. Der Server speichert nur einen Hash der temporären
Sitzungskennung und die gezählten Foto-IDs zur Deduplizierung. Die
Deduplizierung und Zählererhöhungen passieren in derselben Firestore-Transaktion.
Heart liest die Zähler des geöffneten Business über einen gemeinsamen Listener.
Die Browser-Sichtbarkeit ist ein Messsignal. Browser ohne verfügbaren lokalen
Speicher und erkennbare Bots fließen nicht ein.

## Freigabe

- Firestore-Regeln zusammen mit dem passenden App-Stand freigeben und die
  Regeln für Lesezugriff und Schreibschutz im Emulator prüfen.
- Für die Collection Group `photoViewSessions` vor Freigabe die TTL-Regel
  für `expiresAt` aktivieren. Die Sitzungsdokumente erhalten eine Frist
  von 24 Stunden für die Deduplizierung.
- Sitzungsspeicherung und Einbindung in die Datenschutzhinweise vor der
  Aktivierung prüfen.
- Abnahme A–G auf einem echten iPhone und Desktop sowie mit mehreren
  gleichzeitigen Besuchern durchführen. Die lokale Umgebung blockiert
  den Start von Chromium und stellt kein physisches Gerät bereit.

## Prüfstand

Der Produktionsbuild und die Unit-Suite liefen erfolgreich. Zusätzliche Tests
decken die Business-Trennung, Wiederaufnahme unterbrochener Vorschauen,
Sortier-Rollback, den Wechsel auf bereits geöffneten Seiten, Kaufdaten und die
Sichtbarkeitsregeln ab. Im lokalen Firestore-Emulator waren sieben Tests grün,
darunter Leseschutz und atomare Deduplizierung paralleler Meldungen. Der
Backend-Lasttest mit 100 Fotos, fünf parallelen Sitzungen und einer
doppelten Übertragung lieferte für alle Fotos den erwarteten Wert. Die
Geräte- und Ende-zu-Ende-Lastabnahme bleibt offen.

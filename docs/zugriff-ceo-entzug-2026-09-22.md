Status: CURRENT
Last updated: 2026-09-22

# Zugriff eingeschränkt: nur noch der CEO

Was am 2026-09-22 geändert wurde, warum, und wie es in einem Schritt
zurückgenommen wird.

---

## 1. Die Startseite

`mnyra.com/` zeigt eine Ankündigung („Faqja e re po përgatitet — Së
shpejti") mit einem Knopf nach `/lifeskin`. Vorher leitete sie sofort auf
`/feed` weiter.

**Geändert wurde genau eine Datei: `index.html` im Wurzelverzeichnis.**
In `vercel.json` steht keine Zeile anders als vorher.

**Was weiterläuft — unverändert:**

| | |
|---|---|
| `/lifeskin` | Landingpage und Trichter |
| `/analiza/<id>` | Warteseite und Befund |
| `/heart` | Heart/CRM |
| `/feed`, `/profile`, `/search` … | die Social-App, über die Adresse erreichbar |
| `/casarita` und alle anderen Lokalprofile | **QR-Menü und Tischbestellung laufen weiter** |

Das war die bewusste Entscheidung: Kein Lokal im Betrieb wird abgeschaltet.

**Zurücknehmen:** `index.html` aus der Versionsgeschichte holen
(`git show <hash>:index.html`) oder die zwei Zeilen wieder eintragen:

```html
<meta http-equiv="refresh" content="0;url=/feed" />
<script>location.replace("/feed");</script>
```

---

## 2. Der CEO-Zugriff

### Was vorher galt

Elf Konten hatten die Rolle `ceo`, acht davon Personen außer dem CEO.
Sieben standen zusätzlich in `superadmins`.

Das ist deshalb erheblich, weil `isCeoActor()` in `firestore.rules` genau
diese zwei Dinge liest:

```
role/roles enthält "ceo"      →  Zugriff
Eintrag in superadmins/{uid}  →  Zugriff
```

### Was geändert wurde

Acht Personenkonten wurden von `role: "ceo"` / `roles: ["ceo"]` auf
`role: "user"` / `roles: ["user"]` gesetzt, und ihr `superadmins`-Eintrag
wurde entfernt.

**Kein Konto wurde gelöscht. Kein Firebase-Auth-Konto wurde deaktiviert.**
Die Betroffenen können sich weiterhin anmelden — sie sehen nur Heart und
die CEO-Flächen nicht mehr.

### Wer jetzt noch Zugriff hat

| UID | Name | Art |
|---|---|---|
| `aklBkkIuZ7…` | Albert Hoti | **der CEO** — auch der einzige `superadmin` |
| `.fieldPath…` | MNYRA Heart Runner | Dienstkonto des Testläufers |
| `ii2Ojz7Azx…` | MNYRA Heart Runner (b) | Dienstkonto des Testläufers |

Die zwei Dienstkonten wurden bewusst **behalten**: Sie gehören zum
automatischen Heart-Testläufer (`tests/mnyra-heart-runner/`). Ohne sie
laufen dessen Prüfungen gegen die echte Datenbank nicht mehr. Es sind keine
Menschen; sie melden sich nicht an wie ein Mitarbeiter.

### Was ausdrücklich NICHT angefasst wurde

**Die 105 `business`-Konten.** Das sind die Lokale selbst — Cantina de Juan,
Hera Rooftop, Casarita, Prince Coffee House und die anderen. Sie sind keine
Mitarbeiter, und sie zu sperren hätte laufende Kunden abgeschaltet.

Ebenso unberührt: die Staff-Mitgliedschaften in
`restaurants/{id}/staff/{uid}`. Wer dort steht, bedient sein eigenes Lokal
und hat nie CEO-Zugriff gehabt.

---

## 3. Zurücknehmen

Der Stand **vor** der Änderung liegt vollständig in Firestore:

```
_zugriffsicherungen/ceo-entzug-2026-09-22
```

Darin steht je Konto `uid`, `name`, `email`, das alte `role`, das alte
`roles` und der alte `superadmins`-Inhalt.

Zum Zurücknehmen mit dem Admin-SDK:

```js
const sicherung = (await db.collection("_zugriffsicherungen")
  .doc("ceo-entzug-2026-09-22").get()).data();

const stapel = db.batch();
for (const k of sicherung.konten) {
  stapel.set(db.collection("users").doc(k.uid),
    { role: k.role, roles: k.roles }, { merge: true });
  if (k.superadmin) {
    stapel.set(db.collection("superadmins").doc(k.uid), k.superadmin);
  }
}
await stapel.commit();
```

Einzelne Person zurückholen: dieselbe Schleife, nur mit
`sicherung.konten.filter((k) => k.email === "…")`.

---

## 4. Wie geprüft wurde

Bevor geschrieben wurde, lief eine Gegenprobe: Zu jeder UID wurde der
Name aus Firestore gelesen und mit dem erwarteten Namen verglichen. Bei
einer einzigen Abweichung hätte das Skript abgebrochen, ohne etwas zu
ändern. Alle acht stimmten überein.

Nach dem Schreiben wurde jedes Konto erneut gelesen — alle acht ohne
`ceo` und ohne `superadmins`-Eintrag — und anschließend die vollständige
Liste der verbleibenden CEO-Konten ausgegeben (siehe Tabelle oben).

---

## 5. Was dabei aufgefallen ist und offen bleibt

**`staffActive: false` ist kein Riegel.** Die Apps beachten das Feld
(`waiter-app.js`, `auth-bootstrap-snapshot.js`), die Firestore-Regeln aber
**nicht** — dort taucht es nur als Schreibprüfung auf, nie als Lesesperre.
Wer ein Staff-Konto so „sperrt", sperrt es nur in der Oberfläche.

Bei der CEO-Rolle ist das anders: Dort **ist** Firestore die Prüfstelle,
und deshalb wirkt der Entzug oben serverseitig.

**Offen:** Sollen Staff-Konten irgendwann wirklich gesperrt werden, braucht
es entweder eine Regel, die `staffActive` liest, das Entfernen aus
`restaurants/{id}/staff/{uid}`, oder ein deaktiviertes Firebase-Auth-Konto.
Heute leistet keines der drei das Feld allein.

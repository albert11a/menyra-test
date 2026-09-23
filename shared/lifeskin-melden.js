// DIE MELDUNG ANSTOSSEN - neue Analyse oder Bestellung, sofort aufs Telefon.
//
// Aufgerufen, NACHDEM der Schritt "result" oder "ordered" in Firestore
// steht. Die Funktion api/lifeskin-meldung.js liest die Sitzung selbst
// und entscheidet dort, ob und was gemeldet wird - hier geht nur die
// Kennung hinaus.
//
// Nie ein Fehler fuer den Patienten: kein await, kein Warten, jeder
// Fehler verschluckt. Im stillen Modus (Tests) geht nichts hinaus.

export function meldungAnstossen(kennung, fetchFn = globalThis.fetch) {
  try {
    const ort = globalThis.location;
    if (!kennung || typeof fetchFn !== "function") return;
    if (!ort || !/^https?:$/.test(String(ort.protocol || ""))) return;
    if (globalThis.__mnyraStill === true) return;
    const antwort = fetchFn(`${ort.origin}/api/lifeskin-meldung`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: String(kennung) }),
      keepalive: true
    });
    antwort?.catch?.(() => {});
  } catch {
    /* Eine Meldung, die nicht rausgeht, kostet nie eine Bestellung. */
  }
}

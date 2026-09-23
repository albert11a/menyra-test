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
    const senden = () => fetchFn(`${ort.origin}/api/lifeskin-meldung`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: String(kennung) }),
      keepalive: true
    });
    // Kurzzeitige Server-/Netzfehler wiederholen; derselbe Meldungsschluessel
    // verhindert eine zweite Zustellung an bereits erreichte Geraete.
    const versuch = async (nummer = 0) => {
      try {
        const antwort = await senden();
        if (antwort?.ok || (antwort?.status >= 400 && antwort?.status < 500)) return;
      } catch { /* unten erneut versuchen */ }
      if (nummer < 3) globalThis.setTimeout(() => { void versuch(nummer + 1); }, [2000, 10000, 65000][nummer]);
    };
    void versuch();
  } catch {
    /* Eine Meldung, die nicht rausgeht, kostet nie eine Bestellung. */
  }
}

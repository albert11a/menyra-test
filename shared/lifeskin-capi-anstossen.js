// DIE MELDUNG AN META VOM SERVER ANSTOSSEN - Kauf oder Lead.
//
// Aufgerufen, NACHDEM die Bestellung (step "ordered") oder die Nummer in
// Firestore steht. api/lifeskin-capi.js liest die Sitzung selbst und
// entscheidet dort, ob und was gemeldet wird. Hinaus gehen nur die Kennung
// des Falls, die Art und was auch der Pixel im Browser an Meta schickt:
// Metas eigene Kekse (_fbp, _fbc) und die Seite ohne Fallkennung.
//
// Nie ein Fehler fuer den Kunden: kein Warten, jeder Fehler verschluckt.
// Im stillen Modus (Tests) geht nichts hinaus.
//
// Pixel-Aenderung erlaubt von Albert am 01.10.2026: Lead zusaetzlich vom
// Server, Kauf ueber diesen Weg statt nur ueber die Cloud Function.

function keks(name, roh) {
  const treffer = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`).exec(String(roh || ""));
  if (!treffer) return "";
  try { return decodeURIComponent(treffer[1]); } catch { return treffer[1]; }
}

// "https://www.mnyra.com/terapia" - nie mit der Kennung dahinter: Sie
// oeffnet den Befund und gehoert nicht zu Meta.
function seiteOhneKennung(ort) {
  try {
    const url = new URL(String(ort?.href || ""));
    const erster = url.pathname.split("/").filter(Boolean)[0] || "";
    return erster ? `${url.origin}/${erster}` : url.origin;
  } catch {
    return "";
  }
}

export function capiAnstossen(kennung, art, fetchFn = globalThis.fetch) {
  try {
    const ort = globalThis.location;
    if (!kennung || !["kauf", "lead"].includes(art) || typeof fetchFn !== "function") return;
    if (!ort || !/^https?:$/.test(String(ort.protocol || ""))) return;
    if (globalThis.__mnyraStill === true) return;
    const roh = globalThis.document?.cookie || "";
    const koerper = JSON.stringify({
      id: String(kennung),
      art,
      fbp: keks("_fbp", roh),
      fbc: keks("_fbc", roh),
      seite: seiteOhneKennung(ort)
    });
    const senden = () => fetchFn(`${ort.origin}/api/lifeskin-capi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: koerper,
      keepalive: true
    });
    // Abgelehnt oder Server weg: noch zweimal. Die Marke am Server sorgt
    // dafuer, dass ein Ereignis nie zweimal an Meta geht.
    const versuch = async (nummer = 0) => {
      try {
        const antwort = await senden();
        if (antwort?.ok || (antwort?.status >= 400 && antwort?.status < 500)) return;
      } catch { /* unten erneut versuchen */ }
      if (nummer < 2) globalThis.setTimeout(() => { void versuch(nummer + 1); }, [3000, 20000][nummer]);
    };
    void versuch();
  } catch {
    /* Eine Messung, die nicht rausgeht, kostet nie eine Bestellung. */
  }
}

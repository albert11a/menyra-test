// Zwei kleine Hilfen gegen dieselbe Sorte Fehler: eine Ansicht, die auf "wird
// geladen" stehen bleibt.
//
// Sie stehen hier und nicht mitten in heart.js, damit sie sich pruefen lassen -
// ohne Anmeldung, ohne Browser, ohne Firestore.

// Mehrfaches Antippen soll einen Ladevorgang ergeben, nicht viele. Wer waehrend
// des Ladens noch einmal tippt, bekommt denselben zurueck. Erst wenn er fertig
// ist - ob geglueckt oder nicht -, faengt der naechste von vorne an.
//
// Der Unterschied zu einem Zaehler, der das spaetere Tippen gewinnen laesst:
// Dort wird das Ergebnis des frueheren weggeworfen, und bleibt das spaetere
// aus, hat niemand mehr eines. Hier gibt es nur ein Ergebnis, und alle warten
// darauf.
export function createSingleFlight(aufgabe) {
  let laufend = null;
  return function starten(...args) {
    if (laufend) return laufend;
    // Die Aufgabe faengt sofort an, nicht erst im naechsten Durchlauf: Der
    // Rumpf einer async-Funktion laeuft bis zum ersten await synchron. Ein
    // Fehler, der gleich beim Start geworfen wird, landet trotzdem im
    // Versprechen und nicht beim Aufrufer.
    laufend = (async () => aufgabe(...args))().finally(() => { laufend = null; });
    return laufend;
  };
}

// Zwei Quellen fuer dieselbe Sache: eine schnelle, die vielleicht von gestern
// ist (der Geraetespeicher), und eine langsame, die stimmt (der Server).
// Gezeigt wird, was zuerst da ist; die langsame gewinnt aber immer, auch wenn
// sie spaeter kommt. Ohne das stand die Ansicht bis zur Antwort des Servers
// auf "wird geladen", obwohl die Zahlen schon auf dem Geraet lagen.
//
// Die Reihenfolge ist der ganze Witz daran, und darum steht das hier und nicht
// mitten in heart.js: Ein Speicherstand, der nach der Server-Antwort eintrifft,
// darf sie nicht wieder ueberschreiben.
export function showCachedThenFresh({
  cached,
  fresh,
  onCached,
  onFresh,
  onError
} = {}) {
  let freshSettled = false;

  const freshDone = (async () => {
    try {
      const wert = await fresh();
      // Direkt nach dem await, vor allem, was danach eingereiht wird.
      freshSettled = true;
      return { ok: true, wert };
    } catch (fehler) {
      freshSettled = true;
      return { ok: false, fehler };
    }
  })();

  if (typeof cached === "function") {
    (async () => {
      try {
        const wert = await cached();
        if (freshSettled || wert == null) return;
        onCached?.(wert);
      } catch {
        // Der Speicher ist eine Abkuerzung, kein Versprechen.
      }
    })();
  }

  return freshDone.then((ergebnis) => {
    if (ergebnis.ok) {
      onFresh?.(ergebnis.wert);
      return ergebnis.wert;
    }
    onError?.(ergebnis.fehler);
    return undefined;
  });
}

// Firestore wartet von sich aus unbegrenzt auf Antwort. Ohne Frist dreht sich
// die Ansicht bei einer haengenden Verbindung endlos weiter, statt zu sagen,
// was los ist. Die Uhr wird in jedem Fall abgeraeumt, auch wenn die Aufgabe
// vorher fertig wird - sonst haelt sie den Browser wach.
export function withDeadline(versprechen, ms, meldung, uhr = window) {
  if (!(ms > 0)) return versprechen;
  let wecker = 0;
  const frist = new Promise((_, ablehnen) => {
    wecker = uhr.setTimeout(() => ablehnen(new Error(meldung)), ms);
  });
  return Promise.race([versprechen, frist]).finally(() => uhr.clearTimeout(wecker));
}

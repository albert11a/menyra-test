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

// Eine Bildschirmhoehe, die sich waehrend des Wischens nicht mehr aendert.
//
// Die ganze Seite haengt an einer Zahl: --ll-vh. Jeder Abschnitt ist so hoch,
// jedes Kapitel ein Vielfaches davon, und genau dort liegen die Rastpunkte.
// Als 100dvh ist diese Zahl auf dem Handy aber kein fester Wert, sondern die
// gerade sichtbare Hoehe - und die aendert sich, sobald der Browser seine
// Leisten ein- oder ausblendet. Passiert das mitten im Wischen, wird jeder
// Abschnitt in derselben Bewegung hoeher oder niedriger: Die Rastpunkte
// verschieben sich unter dem Finger weg, der Scroll rastet auf einen anderen
// als den angesteuerten, und das Kapitel zeigt einen anderen Schritt als den,
// auf dem man steht. Das ist der Grund, warum ein Wisch mal sitzt und mal
// nicht - und warum es umso oefter danebengeht, je laenger man wischt.
//
// Hier wird die Hoehe deshalb einmal gemessen und danach als fester Wert in
// Pixeln gesetzt. Der Browser darf seine Leisten weiter bewegen; das Layout
// macht es nicht mehr mit. Nachgemessen wird nur bei einer Aenderung, die
// keine Leiste sein kann: wenn sich die Breite aendert (Drehen, anderes
// Fenster) oder die Hoehe um mehr als ein Fuenftel springt. Die Leisten von
// Safari machen auf keinem iPhone mehr als etwa ein Achtel aus.
//
// Gemessen wird an einem eigenen, unsichtbaren Element statt am Fenster: Es
// traegt dieselbe Hoehenangabe, die --ll-vh ohne diese Sperre haette, und
// liefert damit genau den Wert, den der Browser gerade dafuer einsetzen
// wuerde - auch dann noch, wenn --ll-vh laengst auf Pixel steht.

const PROBE_CLASS = "ll-vh-probe";

// Ab hier ist es keine Leiste mehr, sondern eine echte Aenderung. Die Leisten
// von Safari nehmen auf keinem iPhone mehr als etwa ein Achtel der Hoehe ein -
// ein Fuenftel liegt sicher darueber und sicher unter allem, was beim Drehen
// oder in einem anderen Fenster passiert.
const ECHTE_AENDERUNG = 0.2;

// Zaehlt diese neue Hoehe, oder ist es nur eine Leiste?
//
// Als eigene Funktion, weil daran alles haengt: Sagt sie zu oft ja, wandern
// die Rastpunkte wieder unter dem Finger weg; sagt sie zu oft nein, bleibt die
// Seite nach dem Drehen in der alten Hoehe stehen.
export function istEchteAenderung(alt, neu, gedreht = false) {
  if (!(neu > 0)) return false;
  // Die erste Messung gilt immer - vorher gibt es nichts zu schuetzen.
  if (!(alt > 0)) return true;
  if (neu === alt) return false;
  // Eine geaenderte Breite kann keine Leiste sein: Die sitzt oben oder unten.
  if (gedreht) return true;
  return Math.abs(neu - alt) / alt >= ECHTE_AENDERUNG;
}

// Waehrend der Finger auf dem Glas ist, wird nichts umgestellt. Eine neue
// Hoehe mitten in der Bewegung ist genau das, was diese Datei verhindern
// soll - auch wenn sie ausnahmsweise echt waere.
const RUHE_MS = 260;

export function lockLeadLandingViewport({ scroller = null } = {}) {
  const root = document.documentElement;
  if (!document.body) return null;

  const probe = document.createElement("div");
  probe.className = PROBE_CLASS;
  probe.setAttribute("aria-hidden", "true");
  document.body.appendChild(probe);

  let hoehe = 0;
  let breite = 0;
  let letzteBewegung = 0;
  let timer = 0;

  const messen = () => Math.round(probe.getBoundingClientRect().height);

  const setzen = (neu) => {
    if (!(neu > 0) || neu === hoehe) return false;
    hoehe = neu;
    root.style.setProperty("--ll-vh", `${neu}px`);
    return true;
  };

  // Gibt true zurueck, wenn sich die Hoehe wirklich geaendert hat - dann muss
  // alles, was daran haengt, neu vermessen werden.
  const pruefen = ({ sofort = false } = {}) => {
    const neu = messen();
    if (!(neu > 0)) return false;

    const neueBreite = Math.round(window.innerWidth || root.clientWidth || 0);
    const gedreht = breite > 0 && neueBreite !== breite;
    breite = neueBreite;

    if (!istEchteAenderung(hoehe, neu, gedreht)) return false;
    // Auch eine echte Aenderung wartet, bis der Finger vom Glas ist. Mitten in
    // der Bewegung umzustellen ist genau das, was hier verhindert werden soll.
    if (hoehe && !sofort && Date.now() - letzteBewegung < RUHE_MS) return false;
    return setzen(neu);
  };

  const merkeBewegung = () => {
    letzteBewegung = Date.now();
  };

  const nachtragen = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = 0;
      pruefen();
    }, RUHE_MS);
  };

  const shell = scroller || null;
  if (shell) shell.addEventListener("scroll", merkeBewegung, { passive: true });
  window.addEventListener("resize", nachtragen, { passive: true });
  window.addEventListener("orientationchange", nachtragen, { passive: true });

  pruefen({ sofort: true });

  return {
    pruefen,
    hoehe: () => hoehe,
    stop() {
      window.clearTimeout(timer);
      if (shell) shell.removeEventListener("scroll", merkeBewegung);
      window.removeEventListener("resize", nachtragen);
      window.removeEventListener("orientationchange", nachtragen);
      probe.remove();
    }
  };
}

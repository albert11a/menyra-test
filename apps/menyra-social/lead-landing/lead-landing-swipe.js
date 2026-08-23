// Die wischbaren Kartenreihen der Lead-Landing.
//
// Zwei Bildschirme tragen eine: die kostenlosen Funktionen und die
// kostenpflichtigen Zusatzfunktionen. Gewischt wird quer, waehrend die Seite
// selbst laengs rastet - zwei Achsen, die einander nicht ins Gehege kommen.
//
// Das Wischen selbst macht der Browser (scroll-snap-type: x mandatory). Hier
// wird nur abgelesen, welche Karte gerade oben liegt, und der passende Punkt
// gesetzt. Kein preventDefault, kein erzwungenes Springen - dieselbe Regel
// wie bei den Kapiteln.

// Gemessen wird gegen die Mitte des sichtbaren Ausschnitts: Wer zwischen zwei
// Karten stehen bleibt, sieht die, die mehr Flaeche hat, und genau die soll
// der Punkt zeigen. Gegen die linke Kante gerechnet spraenge der Punkt schon
// bei einem Fingerbreit Bewegung.
function activeIndex(track) {
  const cards = Array.from(track.children);
  if (!cards.length) return 0;

  const mitte = track.scrollLeft + (track.clientWidth / 2);
  let best = 0;
  let bestDistance = Infinity;
  cards.forEach((card, index) => {
    const cardMitte = card.offsetLeft + (card.offsetWidth / 2);
    const distance = Math.abs(cardMitte - mitte);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

function bindDeck(deck) {
  const track = deck.querySelector("[data-deck-track]");
  const dots = Array.from(deck.querySelectorAll(".ll-deck__dot"));
  if (!track || dots.length < 2) return () => {};

  let shown = -1;
  const apply = () => {
    const index = activeIndex(track);
    if (index === shown) return;
    shown = index;
    dots.forEach((dot, position) => dot.classList.toggle("is-active", position === index));
  };

  // Einmal je Bild reicht. Ohne die Bremse wuerde bei jedem Scrollereignis
  // gemessen - auf einem langen Wisch sind das Hunderte, und jede Messung
  // liest das Layout.
  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      apply();
    });
  };

  track.addEventListener("scroll", onScroll, { passive: true });
  apply();

  return () => {
    track.removeEventListener("scroll", onScroll);
    if (frame) window.cancelAnimationFrame(frame);
  };
}

export function startLeadLandingSwipes(root = document) {
  const decks = Array.from(root.querySelectorAll("[data-deck]"));
  const stops = decks.map(bindDeck);
  return () => stops.forEach((stop) => stop());
}

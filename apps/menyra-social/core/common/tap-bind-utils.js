// Ein Tipp im Header - fuer die Pills und fuer den Collapse-Pfeil dieselbe
// Bindung. Vorher stand sie zweimal fast wortgleich da (einmal in den
// Shell-Bind-Utils, einmal im App-Shell-Controller), und beide Fassungen
// mussten von Hand gleich gehalten werden.
//
// Warum nicht einfach "click":
// - Nach dem Scrollen laesst iOS den Klick gern warten oder schluckt ihn ganz.
//   Genau weiter unten in der Seite hat man eben gescrollt - dort fuehlte sich
//   jeder Knopf im Header zaeh an.
// - Ein Wisch, der auf dem Knopf beginnt, ist kein Tipp. Bewegt sich der Finger
//   weiter als TAP_MOVE_TOLERANCE_PX, passiert nichts.
// - Maus und Tastatur laufen weiter ueber den Klick. Nach einem Tipp wird er
//   uebersprungen, damit nicht beides zaehlt.

// So weit darf der Finger wandern und es bleibt ein Tipp.
const TAP_MOVE_TOLERANCE_PX = 8;
// So lange nach einem Tipp gilt ein Klick als dessen Nachhall und wird
// verworfen. iOS schickt ihn traege hinterher.
const TAP_CLICK_SUPPRESS_MS = 450;

export function bindTap(element, run) {
  if (!element || typeof run !== "function") return null;
  let startY = 0;
  let moved = false;
  let lastTouchTs = 0;

  const onTouchStart = (event) => {
    startY = Number(event?.touches?.[0]?.clientY ?? 0);
    moved = false;
    lastTouchTs = Date.now();
  };
  const onTouchMove = (event) => {
    const currentY = Number(event?.touches?.[0]?.clientY ?? startY);
    if (Math.abs(currentY - startY) > TAP_MOVE_TOLERANCE_PX) moved = true;
  };
  const onTouchEnd = (event) => {
    lastTouchTs = Date.now();
    if (moved) return;
    if (event?.cancelable) event.preventDefault();
    run();
  };
  const onClick = () => {
    if (Date.now() - lastTouchTs < TAP_CLICK_SUPPRESS_MS) return;
    run();
  };

  element.addEventListener("touchstart", onTouchStart, { passive: true });
  element.addEventListener("touchmove", onTouchMove, { passive: true });
  element.addEventListener("touchend", onTouchEnd);
  element.addEventListener("click", onClick);

  return () => {
    element.removeEventListener("touchstart", onTouchStart);
    element.removeEventListener("touchmove", onTouchMove);
    element.removeEventListener("touchend", onTouchEnd);
    element.removeEventListener("click", onClick);
  };
}

// Preview guide only: live scan progress comes from lifeskin-app's pose ring.
const ticks = document.querySelector("#sr-ticks");
if (ticks) {
  for (let i = 0; i < 48; i++) {
    const a = i * Math.PI / 24;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    for (const [key, value] of Object.entries({ x1: 150 + 130 * Math.sin(a), y1: 150 - 130 * Math.cos(a), x2: 150 + 140 * Math.sin(a), y2: 150 - 140 * Math.cos(a) })) line.setAttribute(key, value);
    line.style.setProperty("--sr-delay", `${i * .2}s`);
    ticks.append(line);
  }
}

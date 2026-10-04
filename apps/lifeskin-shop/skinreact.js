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

// Keep guidance in its original fixed-height position while the pose engine updates it.
const section = document.getElementById("zgjedhja");
const hint = section?.querySelector(".sr-hint");
const liveHint = document.getElementById("ls-kamerahinweis");
if (section && hint && liveHint) {
  hint.setAttribute("role", "status");
  hint.setAttribute("aria-live", "polite");
  hint.setAttribute("aria-atomic", "true");
  const original = hint.innerHTML;
  const sync = () => {
    if (section.dataset.srState === "kamera") hint.textContent = liveHint.textContent || "Lejo kameren per me fillu.";
    else if (section.dataset.srState === "idle") hint.innerHTML = original;
  };
  new MutationObserver(sync).observe(liveHint, { childList:true, subtree:true, characterData:true });
  new MutationObserver(sync).observe(section, { attributes:true, attributeFilter:["data-sr-state"] });
}

// Offscreen preview motion should not spend a phone's rendering budget.
if (section && "IntersectionObserver" in globalThis) {
  new IntersectionObserver(([entry]) => {
    section.dataset.srVisible = entry.isIntersecting ? "ja" : "nein";
  }).observe(section);
}

// EINBLENDEN BEIM SCROLLEN (08.10., Inhaber): Abschnitte unter dem ersten
// Bildschirm gleiten beim Scrollen sanft von unten herein - wie bei den
// grossen Shops. Nur Darstellung: keine Zaehlung, kein Pixel, kein Laden.
//
// Sicher, wenn etwas fehlt: Ohne Skript, ohne IntersectionObserver oder mit
// "weniger Bewegung" bleibt alles sofort sichtbar. Was beim Oeffnen schon im
// Bild ist (der Kopf), wird nie versteckt. Kein Ziel enthaelt feste Elemente
// (Kaufleiste, Chat, Kasse) - transform wuerde sie sonst mitnehmen.

export const EINBLENDEN_ZIELE = [
  "#rezultate .section-top",
  "#proof-bahn",
  "#klientet .proof-heading",
  "#klientet .message-rail",
  "#customer-media",
  "#setet .eyebrow",
  "#setet h2",
  "#setet .routine-intro",
  "#setet .routine-card",
  "#set-grid",
  "#setet .support-panel",
  "#skinreact-title",
  "#rutina .confidence-grid > *",
  "#ls-einstieg .faq h2",
  "#ls-einstieg .faq details",
  "#ls-einstieg .closing > *"
];

// Geschwister, die gleichzeitig ins Bild kommen, kurz nacheinander.
const VERZOEGERUNG_MS = 90;
const VERZOEGERUNG_MAX = 3;

export function einblenden({
  dok = globalThis.document,
  fenster = globalThis.window,
  Beobachter = globalThis.IntersectionObserver
} = {}) {
  if (!dok || !Beobachter) return null;
  if (fenster?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return null;
  const hoehe = fenster?.innerHeight || 0;
  const ziele = [...new Set(EINBLENDEN_ZIELE.flatMap((wahl) => [...dok.querySelectorAll(wahl)]))]
    .filter((el) => el.getBoundingClientRect().top > hoehe);
  if (!ziele.length) return null;
  for (const el of ziele) el.classList.add("ls-rein");
  const beobachter = new Beobachter((eintraege) => {
    const sichtbar = eintraege.filter((e) => e.isIntersecting);
    sichtbar.forEach((eintrag, i) => {
      const el = eintrag.target;
      el.style.setProperty("--rein-verz", `${Math.min(i, VERZOEGERUNG_MAX) * VERZOEGERUNG_MS}ms`);
      el.classList.add("ls-rein--da");
      beobachter.unobserve(el);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  for (const el of ziele) beobachter.observe(el);
  return beobachter;
}

if (globalThis.document?.getElementById?.("ls-einstieg")) einblenden();

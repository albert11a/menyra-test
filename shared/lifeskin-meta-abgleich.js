// Separate freiwillige Zustimmung: Kontakt fuer den Befund ist kein Meta-Abgleich.
const FELDER = ["ls-telfeld", "an-pritnr", "an-telefon", "t-telefon", "shporta-telefoni", "kasa-telefoni"];
const VERSION = "meta-phone-v1";
const BEOBACHTET = new WeakSet();

export function metaAbgleichEinrichten(dok = globalThis.document) {
  if (!dok?.createElement) return;
  for (const id of FELDER) {
    const feld = dok.getElementById?.(id);
    if (!feld || dok.getElementById(`${id}-meta-abgleich`)) continue;
    const label = dok.createElement("label");
    label.style.cssText = "display:flex;align-items:flex-start;gap:10px;font-size:14px;line-height:1.45;margin:12px 0;text-align:left;font-weight:400";
    const haken = dok.createElement("input");
    haken.type = "checkbox";
    haken.id = `${id}-meta-abgleich`;
    haken.style.cssText = "width:20px;height:20px;min-width:20px;flex:0 0 20px;margin:2px 0;appearance:auto";
    const satz = dok.createElement("span");
    const deutsch = dok.documentElement?.lang === "de";
    satz.textContent = deutsch
      ? "Optional: Ich stimme zu, dass meine Telefonnummer als Hash zusammen mit meiner Anfrage oder Bestellung an Meta (Facebook/Instagram) zum Abgleich und zur Messung von Werbung gesendet wird. Ohne Zustimmung kann ich genauso fortfahren."
      : "Opsionale: Pajtohem që numri im i telefonit të dërgohet si hash te Meta (Facebook/Instagram), bashkë me kërkesën ose porosinë time, për përputhje dhe matjen e reklamave. Mund të vazhdoj edhe pa këtë pëlqim.";
    label.append(haken, satz);
    const anker = feld.closest?.(".wait-phone-row") || feld.closest?.("label") || feld;
    anker.after(label);
  }
  // Therapieseiten bauen ihre Kasse erst nach dem Laden des Befunds auf.
  const Observer = dok.defaultView?.MutationObserver;
  if (Observer && dok.body && !BEOBACHTET.has(dok)) {
    BEOBACHTET.add(dok);
    new Observer(() => metaAbgleichEinrichten(dok)).observe(dok.body, { childList: true, subtree: true });
  }
}

export function metaAbgleichAngaben(dok, id, telefon) {
  const haken = dok?.getElementById?.(`${id}-meta-abgleich`);
  return {
    version: VERSION,
    allowed: haken?.checked === true,
    // An genau die freigegebene Nummer gebunden; eine spaetere andere Nummer
    // erbt diese Zustimmung nicht. Nur in der privaten Sitzung gespeichert.
    phone: haken?.checked === true ? String(telefon || "").trim().slice(0, 40) : "",
    ...(haken?.checked === true && !telefon ? { storedPhone: true } : {})
  };
}

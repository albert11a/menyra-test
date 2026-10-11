// Original customer messages and shop reviews. Existing comment storage/rights are reused.
export const SHOP_REVIEW_MEDIUM = "shop-acne-duo";
export const SHOP_NACHRICHTEN_DOK = "shopNachrichten";
export const SHOP_NACHRICHTEN_STANDARD = [
  {
    "id": "mesazh-ftyra",
    "text": "Nextrem mirë mu ka bo ftyra, tash e tutje veç te ju ka me porosit.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-ftyra.jpg"
  },
  {
    "id": "mesazh-10pik",
    "text": "Vallah shum mkan kry pun. S'kom prit që kan me pas qet efekt. 10 pik për produktet.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-10pik.jpg"
  },
  {
    "id": "mesazh-pastru",
    "text": "Gati krejt ftyra mu ka pastru.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-pastru.jpg"
  },
  {
    "id": "mesazh-motra",
    "text": "I kryva hallall paret … a bon me porosit edhe 1 set për motrën?",
    "bild": "/apps/lifeskin-shop/assets/mesazh-motra.jpg"
  },
  {
    "id": "mesazh-5dite",
    "text": "Kom fillu me përdorë dikun 5 ditë, ama po vrej ndryshim të mirë shumë.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-5dite.jpg"
  },
  {
    "id": "mesazh-yndyra",
    "text": "Ma kan pastru lëkurën edhe yndyrën.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-yndyra.jpg"
  },
  {
    "id": "mesazh-pucrrat",
    "text": "Po shumë mirë e kom ftyrën, mi ka hjek krejt puçrrat. Edhe ma ka ndreq yndyrën.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-pucrrat.jpg"
  },
  {
    "id": "mesazh-asnje",
    "text": "Shumë mkan ndihmu produktet … kurr asnjë produkt mashum nuk mka bo mirë.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-asnje.jpg"
  },
  {
    "id": "mesazh-10dite",
    "text": "Mkan ndihmu, edhe nuk i ka as 10 ditë që po e përdori, po pe shoh ndryshimin.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-10dite.jpg"
  },
  {
    "id": "mesazh-pagrim",
    "text": "Po shumë të mirë … pa grim tash po muj me dal.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-pagrim.jpg"
  },
  {
    "id": "mesazh-knaqun",
    "text": "Po më kanë ndihmu … ama jom shumë e knaqun me rezultatin.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-knaqun.jpg"
  },
  {
    "id": "mesazh-aknet",
    "text": "Po mu kan largu krejt aknet, edhe ma ka bo lkurën shumë t'pastër.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-aknet.jpg"
  },
  {
    "id": "mesazh-shenjat",
    "text": "Faleminderit për produktet, mi kan largu krejt shenjat edhe aknet.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-shenjat.jpg"
  },
  {
    "id": "mesazh-gjeta",
    "text": "Po mka nihmu shum valla. Hallall paret, se qa s'kom provu, ma m'fund i gjeta.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-gjeta.jpg"
  },
  {
    "id": "mesazh-efekt",
    "text": "Kom pas shumë efekt t'mirë dhe jom nda shumë e knaqur me produktet.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-efekt.jpg"
  },
  {
    "id": "mesazh-dyjat",
    "text": "Po shum mir mkan bo … shumë mirë mu ka pastru lëkura.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-dyjat.jpg"
  },
  {
    "id": "mesazh-knaqur",
    "text": "10 pik i keni prej meje, sepse jam ndah shumë e knaqur.",
    "bild": "/apps/lifeskin-shop/assets/mesazh-knaqur.jpg"
  }
];

export function nachrichtenNormalisieren(roh) {
  const quelle = Array.isArray(roh) ? roh : SHOP_NACHRICHTEN_STANDARD;
  const gesehen = new Set();
  return quelle.slice(0, 100).flatMap((k) => {
    const id = String(k?.id || "");
    const text = String(k?.text || "").trim().slice(0, 500);
    const bild = String(k?.bild || "");
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id) || !text || gesehen.has(id)) return [];
    if (!bild.startsWith("/apps/lifeskin-shop/assets/") && !/^https:\/\//.test(bild)) return [];
    gesehen.add(id);
    return [{ id, text, bild }];
  });
}

// Rating stays in the allowed comment text; no new database permissions required.
export function bewertungText(text, sterne) {
  const n = Number(sterne);
  const sauber = String(text || "").trim();
  if (!Number.isInteger(n) || n < 1 || n > 5 || !sauber || sauber.length > 480) throw new Error("Bewertung unvollstaendig");
  return `[${n}/5]\n${sauber}`;
}

export function bewertungLesen(k = {}) {
  const match = /^\[([1-5])\/5\]\n([\s\S]+)$/.exec(String(k.text || ""));
  return { ...k, sterne: match ? Number(match[1]) : null, text: match ? match[2] : String(k.text || "") };
}

export function bewertungZusammenfassung(liste = []) {
  const bewertet = liste.map(bewertungLesen).filter(k => k.sterne !== null);
  return { anzahl: bewertet.length, durchschnitt: bewertet.length ? bewertet.reduce((sum, k) => sum + k.sterne, 0) / bewertet.length : null };
}

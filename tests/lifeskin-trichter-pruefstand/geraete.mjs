// Die Testmatrix: Geraete, Engines, In-App-Browser.

const UA_IOS_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";
const UA_IOS_FB =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22F76 [FBAN/FBIOS;FBDV/iPhone15,3;FBMD/iPhone;FBSN/iOS;FBSV/18.5;FBSS/3;FBID/phone;FBLC/sq_AL;FBOP/5]";
const UA_IOS_IG =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22F76 Instagram 350.0.0.34.108 (iPhone15,3; iOS 18_5; sq_AL; sq-AL; scale=3.00; 1290x2796; 610397428)";
const UA_AND_CHROME =
  "Mozilla/5.0 (Linux; Android 14; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
const UA_AND_FB =
  "Mozilla/5.0 (Linux; Android 14; SM-A536B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/460.0.0.39.86;]";
const UA_AND_IG =
  "Mozilla/5.0 (Linux; Android 14; SM-A136B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 Instagram 350.0.0.34.108 Android (34/14; 280dpi; 720x1465; samsung; SM-A136B; a13x; s5e8535; sq_AL; 610397428)";
const UA_DESKTOP =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// iabLeiste: Hoehe einer Leiste, die manche App-Fenster UEBER den Inhalt
// legen, ohne innerHeight zu verkleinern. Dort darf nichts Wichtiges liegen.
export const GERAETE = [
  {
    name: "iPhone SE 1 · Safari",
    breite: 320,
    hoehe: 568,
    dpr: 2,
    ua: UA_IOS_SAFARI,
    engine: "webkit",
    touch: true,
    quelle: "direkt",
  },
  {
    name: "iPhone SE 2/3 · Safari",
    breite: 375,
    hoehe: 667,
    dpr: 2,
    ua: UA_IOS_SAFARI,
    engine: "webkit",
    touch: true,
    quelle: "direkt",
  },
  {
    name: "iPhone 13/14/15 · Safari",
    breite: 390,
    hoehe: 844,
    dpr: 3,
    ua: UA_IOS_SAFARI,
    engine: "webkit",
    touch: true,
    quelle: "direkt",
  },
  {
    name: "iPhone 15/16 Pro Max · Safari",
    breite: 430,
    hoehe: 932,
    dpr: 3,
    ua: UA_IOS_SAFARI,
    engine: "webkit",
    touch: true,
    quelle: "direkt",
  },
  {
    name: "iPhone 13 · Facebook-App",
    breite: 390,
    hoehe: 716,
    dpr: 3,
    ua: UA_IOS_FB,
    engine: "webkit",
    touch: true,
    quelle: "fb",
    iabLeiste: 56,
  },
  {
    name: "iPhone 13 · Instagram-App",
    breite: 390,
    hoehe: 716,
    dpr: 3,
    ua: UA_IOS_IG,
    engine: "webkit",
    touch: true,
    quelle: "ig",
    iabLeiste: 56,
  },
  {
    name: "iPhone SE 2 · Instagram-App",
    breite: 375,
    hoehe: 539,
    dpr: 2,
    ua: UA_IOS_IG,
    engine: "webkit",
    touch: true,
    quelle: "ig",
    iabLeiste: 56,
  },
  {
    name: "Android klein · Chrome",
    breite: 360,
    hoehe: 640,
    dpr: 2,
    ua: UA_AND_CHROME,
    engine: "chromium",
    touch: true,
    quelle: "direkt",
  },
  {
    name: "Galaxy A · Chrome",
    breite: 360,
    hoehe: 800,
    dpr: 3,
    ua: UA_AND_CHROME,
    engine: "chromium",
    touch: true,
    quelle: "direkt",
  },
  {
    name: "Android gross · Chrome",
    breite: 412,
    hoehe: 915,
    dpr: 3,
    ua: UA_AND_CHROME,
    engine: "chromium",
    touch: true,
    quelle: "direkt",
  },
  {
    name: "Galaxy A · Facebook-App",
    breite: 360,
    hoehe: 688,
    dpr: 3,
    ua: UA_AND_FB,
    engine: "chromium",
    touch: true,
    quelle: "fb",
    iabLeiste: 48,
  },
  {
    name: "Galaxy A · Instagram-App",
    breite: 360,
    hoehe: 688,
    dpr: 3,
    ua: UA_AND_IG,
    engine: "chromium",
    touch: true,
    quelle: "ig",
    iabLeiste: 48,
  },
  {
    name: "Android klein · Instagram-App",
    breite: 360,
    hoehe: 528,
    dpr: 2,
    ua: UA_AND_IG,
    engine: "chromium",
    touch: true,
    quelle: "ig",
    iabLeiste: 48,
  },
  {
    name: "Tablet hoch · Safari",
    breite: 768,
    hoehe: 1024,
    dpr: 2,
    ua: UA_IOS_SAFARI,
    engine: "webkit",
    touch: true,
    quelle: "direkt",
  },
  {
    name: "Desktop · Chrome",
    breite: 1280,
    hoehe: 800,
    dpr: 1,
    ua: UA_DESKTOP,
    engine: "chromium",
    touch: false,
    quelle: "direkt",
  },
  {
    name: "Desktop schmal · Chrome",
    breite: 1024,
    hoehe: 600,
    dpr: 1,
    ua: UA_DESKTOP,
    engine: "chromium",
    touch: false,
    quelle: "direkt",
  },
  {
    name: "iPhone 13 quer · Safari",
    breite: 844,
    hoehe: 390,
    dpr: 3,
    ua: UA_IOS_SAFARI,
    engine: "webkit",
    touch: true,
    quelle: "direkt",
  },
  {
    name: "Android quer · Chrome",
    breite: 800,
    hoehe: 360,
    dpr: 3,
    ua: UA_AND_CHROME,
    engine: "chromium",
    touch: true,
    quelle: "direkt",
  },
  // Firefox ist in Kosovo/Albanien klein, aber vorhanden - und die dritte
  // Engine: Was dort bricht, sieht man in den beiden anderen nicht.
  {
    name: "Android · Firefox",
    breite: 412,
    hoehe: 915,
    dpr: 3,
    engine: "firefox",
    touch: false,
    quelle: "direkt",
    ua: "Mozilla/5.0 (Android 14; Mobile; rv:143.0) Gecko/143.0 Firefox/143.0",
  },
  {
    name: "Desktop · Firefox",
    breite: 1280,
    hoehe: 800,
    dpr: 1,
    engine: "firefox",
    touch: false,
    quelle: "direkt",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
  },
];

export const VERWEIS = {
  direkt: "",
  fb: "https://l.facebook.com/",
  ig: "https://l.instagram.com/",
};

// Gegen den lokalen Server heisst die Seite /apps/lifeskin/index.html,
// gegen die echte Adresse /lifeskin. LS_PFAD stellt um.
const PFAD = process.env.LS_PFAD || "/apps/lifeskin/index.html";
export const ZIEL = {
  direkt: PFAD,
  fb: `${PFAD}?utm_source=facebook&utm_campaign=lifeskin_q3&fbclid=IwAR0TestTestTestTestTest`,
  ig: `${PFAD}?utm_source=instagram&utm_campaign=lifeskin_q3&igshid=MzRlODBiNWFlZA==`,
};

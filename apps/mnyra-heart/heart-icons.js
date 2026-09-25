const ICONS = Object.freeze({
  menu: `
    <path d="M4 6h16"></path>
    <path d="M4 12h16"></path>
    <path d="M4 18h16"></path>
  `,
  x: `
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  `,
  refresh: `
    <path d="M21 12a9 9 0 1 1-2.64-6.36"></path>
    <path d="M21 3v6h-6"></path>
  `,
  arrowLeft: `
    <path d="M19 12H5"></path>
    <path d="m12 19-7-7 7-7"></path>
  `,
  archive: `
    <path d="M3 4h18v4H3z"></path>
    <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"></path>
    <path d="M10 12h4"></path>
  `,
  copy: `
    <rect x="9" y="9" width="12" height="12" rx="2"></rect>
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"></path>
  `,
  logout: `
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <path d="m16 17 5-5-5-5"></path>
    <path d="M21 12H9"></path>
  `,
  home: `
    <path d="M3 10.5 12 3l9 7.5"></path>
    <path d="M5 9.5V21h14V9.5"></path>
  `,
  list: `
    <path d="M8 6h13"></path>
    <path d="M8 12h13"></path>
    <path d="M8 18h13"></path>
    <path d="M3 6h.01"></path>
    <path d="M3 12h.01"></path>
    <path d="M3 18h.01"></path>
  `,
  search: `
    <circle cx="11" cy="11" r="7"></circle>
    <path d="m20 20-3.5-3.5"></path>
  `,
  listFilter: `
    <path d="M3 6h18"></path>
    <path d="M7 12h10"></path>
    <path d="M10 18h4"></path>
  `,
  bell: `
    <path d="M10.27 21a2 2 0 0 0 3.46 0"></path>
    <path d="M3.26 15.33A2 2 0 0 0 5 18h14a2 2 0 0 0 1.74-2.67L18 8a6 6 0 1 0-12 0z"></path>
  `,
  grid: `
    <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
    <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
    <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
    <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
  `,
  zahnrad: `
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  `,
  settings: `
    <path d="M12 3v2.25"></path>
    <path d="M12 18.75V21"></path>
    <path d="m4.93 4.93 1.59 1.59"></path>
    <path d="m17.48 17.48 1.59 1.59"></path>
    <path d="M3 12h2.25"></path>
    <path d="M18.75 12H21"></path>
    <path d="m4.93 19.07 1.59-1.59"></path>
    <path d="m17.48 6.52 1.59-1.59"></path>
    <circle cx="12" cy="12" r="3.25"></circle>
  `,
  play: `
    <polygon points="8 5 19 12 8 19 8 5"></polygon>
  `,
  plus: `
    <path d="M12 5v14"></path>
    <path d="M5 12h14"></path>
  `,
  info: `
    <circle cx="12" cy="12" r="9"></circle>
    <path d="M12 10v6"></path>
    <path d="M12 7h.01"></path>
  `,
  clock: `
    <circle cx="12" cy="12" r="9"></circle>
    <path d="M12 7v5l3 3"></path>
  `,
  sparkle: `
    <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8Z"></path>
    <path d="M5 18h.01"></path>
    <path d="M19 5h.01"></path>
  `,
  shield: `
    <path d="M12 3 5 6v5c0 5 3.4 8.7 7 10 3.6-1.3 7-5 7-10V6l-7-3z"></path>
  `,
  bot: `
    <rect x="5" y="8" width="14" height="10" rx="3"></rect>
    <path d="M12 4v4"></path>
    <path d="M9 13h.01"></path>
    <path d="M15 13h.01"></path>
  `,
  scan: `
    <path d="M4 7V5a1 1 0 0 1 1-1h2"></path>
    <path d="M17 4h2a1 1 0 0 1 1 1v2"></path>
    <path d="M20 17v2a1 1 0 0 1-1 1h-2"></path>
    <path d="M7 20H5a1 1 0 0 1-1-1v-2"></path>
    <path d="M7 12h10"></path>
  `,
  user: `
    <path d="M20 21a8 8 0 0 0-16 0"></path>
    <circle cx="12" cy="8" r="4"></circle>
  `,
  users: `
    <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  `,
  activity: `
    <path d="M22 12h-4l-3 8-4-16-3 8H2"></path>
  `,
  chart: `
    <path d="M3 3v18h18"></path>
    <path d="m7 14 4-4 3 3 5-7"></path>
  `,
  image: `
    <rect x="3" y="5" width="18" height="14" rx="2"></rect>
    <circle cx="8.5" cy="10.5" r="1.5"></circle>
    <path d="m21 15-5-5L5 21"></path>
  `,
  broom: `
    <path d="m14 4 6 6"></path>
    <path d="m17 2 5 5-8 8-5-5 8-8z"></path>
    <path d="M3 21h7"></path>
    <path d="m6 21 8-8"></path>
  `,
  triangle: `
    <path d="m10.29 3.86-7.5 13A1 1 0 0 0 3.66 18h16.68a1 1 0 0 0 .87-1.5l-7.5-13a1 1 0 0 0-1.74 0z"></path>
    <path d="M12 9v4"></path>
    <path d="M12 17h.01"></path>
  `,
  trash: `
    <path d="M3 6h18"></path>
    <path d="M8 6V4h8v2"></path>
    <path d="m19 6-1 14H6L5 6"></path>
    <path d="M10 11v6"></path>
    <path d="M14 11v6"></path>
  `,
  edit: `
    <path d="M12 20h9"></path>
    <path d="m16.5 3.5 4 4L8 20l-4 1 1-4 11.5-13.5z"></path>
  `,
  camera: `
    <path d="M14.5 4h-5L7 7H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2l-2.5-3z"></path>
    <circle cx="12" cy="13" r="3"></circle>
  `,
  mapPin: `
    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  `,
  chevronDown: `
    <path d="m6 9 6 6 6-6"></path>
  `,
  chevronRight: `
    <path d="m9 18 6-6-6-6"></path>
  `,
  chevronUp: `
    <path d="m18 15-6-6-6 6"></path>
  `,
  checkCircle: `
    <circle cx="12" cy="12" r="9"></circle>
    <path d="m9 12 2 2 4-4"></path>
  `,
  // Lucide (lucide.dev, ISC) - fuer die Akte eines Falls und den Klickpfad.
  eye: `
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
    <circle cx="12" cy="12" r="3"></circle>
  `,
  pointer: `
    <path d="M14 4.1 12 6"></path><path d="m5.1 8-2.9-.8"></path><path d="m6 12-1.9 2"></path><path d="M7.2 2.2 8 5.1"></path>
    <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"></path>
  `,
  fileText: `
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
    <path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>
  `,
  doorOut: `
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><path d="m16 17 5-5-5-5"></path><path d="M21 12H9"></path>
  `,
  undo: `
    <path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5 5.5 5.5 0 0 1-5.5 5.5H11"></path>
  `,
  cart: `
    <circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
  `,
  arrowUpDown: `
    <path d="m21 16-4 4-4-4"></path><path d="M17 20V4"></path><path d="m3 8 4-4 4 4"></path><path d="M7 4v16"></path>
  `,
  pencil: `
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
  `,
  message: `
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
  `,
  send: `
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
    <path d="m21.854 2.147-10.94 10.939"></path>
  `,
  externalLink: `
    <path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
  `,
  check: `
    <path d="M20 6 9 17l-5-5"></path>
  `,
  alert: `
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>
  `
});

// iOS UND ANDROID - GEFUELLT, nicht als Strich wie die Zeichen oben.
//
// Sie stehen elf Punkte gross auf dem Vorschaubild eines Falls; eine
// Strichzeichnung waere dort nur ein Fleck. Ein Apfel mit Blatt fuer iOS,
// der Kopf mit den zwei Fuehlern fuer Android - die Augen sind Loecher
// (evenodd), damit sie auf jedem Grund stehen.
const GERAET_ZEICHEN = Object.freeze({
  ios: `
    <path d="M12 7.3C13.1 6.4 14.5 6 15.8 6.2 18 6.6 19.4 8.5 19.3 11 19.2 14.8 17 20.5 14.6 20.5 13.6 20.5 13.1 19.9 12 19.9 10.9 19.9 10.4 20.5 9.4 20.5 7 20.5 4.8 14.8 4.7 11 4.6 8.5 6 6.6 8.2 6.2 9.5 6 10.9 6.4 12 7.3Z"></path>
    <path d="M12.3 5.6C12.4 3.9 13.6 2.7 15.3 2.5 15.2 4.2 14 5.4 12.3 5.6Z"></path>
  `,
  android: `
    <path fill-rule="evenodd" d="M5 18A7 7 0 0 1 19 18ZM10.25 14.6A.95.95 0 1 1 8.35 14.6.95.95 0 1 1 10.25 14.6ZM15.65 14.6A.95.95 0 1 1 13.75 14.6.95.95 0 1 1 15.65 14.6Z"></path>
    <path d="M7.4 12.6 5.8 9.9M16.6 12.6 18.2 9.9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
  `
});

export function renderGeraetZeichen(os, extraClass = "heart-icon") {
  const body = GERAET_ZEICHEN[os];
  if (!body) return "";
  return `<svg class="${extraClass}" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">${body}</svg>`;
}

export function renderHeartIcon(name = "home", extraClass = "heart-icon") {
  const body = ICONS[name] || ICONS.home;
  return `
    <svg class="${extraClass}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${body}
    </svg>
  `;
}

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
  chevronDown: `
    <path d="m6 9 6 6 6-6"></path>
  `,
  chevronUp: `
    <path d="m18 15-6-6-6 6"></path>
  `,
  checkCircle: `
    <circle cx="12" cy="12" r="9"></circle>
    <path d="m9 12 2 2 4-4"></path>
  `
});

export function renderHeartIcon(name = "home", extraClass = "heart-icon") {
  const body = ICONS[name] || ICONS.home;
  return `
    <svg class="${extraClass}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${body}
    </svg>
  `;
}

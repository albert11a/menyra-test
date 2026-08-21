// Die Symbole - wortgleich aus der App.
//
// Diese Datei ist eine Spiegelung von social-app.js: dieselben Pfade,
// dieselben SVG-Merkmale, dieselbe Signatur icon(name, className). Sie ist
// abgeschrieben und nicht importiert, weil Landing 2 nichts aus der App
// laedt (der Grund steht in landing2-config.js) - aber sie ist Zeichen fuer
// Zeichen dieselbe.
//
// tests/landing2-parity.test.mjs haelt die beiden gegeneinander: Aendert
// jemand ein Symbol in der App und hier nicht, faellt der Test.
//
// Die Groesse steht NICHT hier, sondern an der Klasse (w-4 h-4) - genau wie
// in der App. Deshalb bekommt jedes Symbol dieselbe Groesse wie an derselben
// Stelle im echten Bildschirm, ohne dass sie hier noch einmal geschaetzt
// werden muesste.

import { esc } from "./landing2-format.js";

const INLINE_LUCIDE_SVG_ATTRS = Object.freeze({
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
});

const INLINE_LUCIDE_ICON_NODES = Object.freeze({
  "plus": Object.freeze([["path", { d: "M5 12h14" }], ["path", { d: "M12 5v14" }]]),
  "map-pin": Object.freeze([["path", { d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" }], ["circle", { cx: "12", cy: "10", r: "3" }]]),
  "user": Object.freeze([["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }], ["circle", { cx: "12", cy: "7", r: "4" }]]),
  "x": Object.freeze([["path", { d: "M18 6 6 18" }], ["path", { d: "m6 6 12 12" }]]),
  "heart": Object.freeze([["path", { d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" }]]),
  "arrow-left": Object.freeze([["path", { d: "m12 19-7-7 7-7" }], ["path", { d: "M19 12H5" }]]),
  "search": Object.freeze([["circle", { cx: "11", cy: "11", r: "8" }], ["path", { d: "m21 21-4.3-4.3" }]]),
  "chevron-down": Object.freeze([["path", { d: "m6 9 6 6 6-6" }]]),
  "lock": Object.freeze([["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }], ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }]]),
  "check-circle-2": Object.freeze([["circle", { cx: "12", cy: "12", r: "10" }], ["path", { d: "m9 12 2 2 4-4" }]]),
  "bell": Object.freeze([["path", { d: "M10.268 21a2 2 0 0 0 3.464 0" }], ["path", { d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" }]]),
  "settings": Object.freeze([["path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }], ["circle", { cx: "12", cy: "12", r: "3" }]]),
  "check": Object.freeze([["path", { d: "M20 6 9 17l-5-5" }]]),
  "crosshair": Object.freeze([["circle", { cx: "12", cy: "12", r: "10" }], ["line", { x1: "22", x2: "18", y1: "12", y2: "12" }], ["line", { x1: "6", x2: "2", y1: "12", y2: "12" }], ["line", { x1: "12", x2: "12", y1: "6", y2: "2" }], ["line", { x1: "12", x2: "12", y1: "22", y2: "18" }]]),
  "loader-circle": Object.freeze([["path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }]]),
  "message-circle": Object.freeze([["path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" }]]),
  "instagram": Object.freeze([["rect", { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5" }], ["path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" }], ["line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5" }]]),
  "music-2": Object.freeze([["circle", { cx: "8", cy: "18", r: "4" }], ["path", { d: "M12 18V2l7 4" }]]),
  "phone": Object.freeze([["path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.91.32 1.8.59 2.65a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6.27 6.27l1.25-1.25a2 2 0 0 1 2.11-.45c.85.27 1.74.47 2.65.59A2 2 0 0 1 22 16.92z" }]]),
  "store": Object.freeze([["path", { d: "m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" }], ["path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }], ["path", { d: "M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" }], ["path", { d: "M2 7h20" }], ["path", { d: "M22 7v3a2 2 0 0 1-4 0V7" }], ["path", { d: "M18 7v3a2 2 0 0 1-4 0V7" }], ["path", { d: "M14 7v3a2 2 0 0 1-4 0V7" }], ["path", { d: "M10 7v3a2 2 0 0 1-4 0V7" }], ["path", { d: "M6 7v3a2 2 0 0 1-4 0V7" }]]),
  "image": Object.freeze([["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }], ["circle", { cx: "9", cy: "9", r: "2" }], ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }]]),
  "play": Object.freeze([["polygon", { points: "6 3 20 12 6 21 6 3" }]]),
  "sparkles": Object.freeze([["path", { d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" }], ["path", { d: "M20 3v4" }], ["path", { d: "M22 5h-4" }], ["path", { d: "M4 17v2" }], ["path", { d: "M5 18H3" }]]),
  "star": Object.freeze([["path", { d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.751a.53.53 0 0 1 .294.904l-3.738 3.644a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.393 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.155 9.79a.53.53 0 0 1 .294-.906l5.165-.75a2.12 2.12 0 0 0 1.596-1.16z" }]]),
  "arrow-right": Object.freeze([["path", { d: "M5 12h14" }], ["path", { d: "m12 5 7 7-7 7" }]]),
  "loader-2": Object.freeze([["path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }]]),
  "log-in": Object.freeze([["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" }], ["polyline", { points: "10 17 15 12 10 7" }], ["line", { x1: "15", x2: "3", y1: "12", y2: "12" }]]),
  "globe": Object.freeze([["circle", { cx: "12", cy: "12", r: "10" }], ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }], ["path", { d: "M2 12h20" }]]),
  "shopping-bag": Object.freeze([["path", { d: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" }], ["path", { d: "M3 6h18" }], ["path", { d: "M16 10a4 4 0 0 1-8 0" }]]),
  "plane": Object.freeze([["path", { d: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 20.5 3S17 3.5 15.5 5L12 8.5 3.8 6.7a1 1 0 0 0-.9.3l-.7.7a1 1 0 0 0 .1 1.5l5.5 3.3-2 2H3l-1 1 3 2 2 3 1-1v-2.8l2-2 3.3 5.5a1 1 0 0 0 1.5.1l.7-.7a1 1 0 0 0 .3-.9Z" }]]),
  "menu": Object.freeze([["line", { x1: "4", x2: "20", y1: "12", y2: "12" }], ["line", { x1: "4", x2: "20", y1: "6", y2: "6" }], ["line", { x1: "4", x2: "20", y1: "18", y2: "18" }]]),
  "layout-grid": Object.freeze([["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1" }], ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1" }], ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1" }], ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1" }]]),
  "home": Object.freeze([["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }], ["path", { d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }]]),
  "map": Object.freeze([["path", { d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" }], ["path", { d: "M15 5.764v15" }], ["path", { d: "M9 3.236v15" }]]),
  "shopping-cart": Object.freeze([["circle", { cx: "8", cy: "21", r: "1" }], ["circle", { cx: "19", cy: "21", r: "1" }], ["path", { d: "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" }]]),
  "bookmark": Object.freeze([["path", { d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" }]]),
  "users-round": Object.freeze([["path", { d: "M18 21a8 8 0 0 0-16 0" }], ["circle", { cx: "10", cy: "8", r: "5" }], ["path", { d: "M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" }]]),
  "info": Object.freeze([["circle", { cx: "12", cy: "12", r: "10" }], ["path", { d: "M12 16v-4" }], ["path", { d: "M12 8h.01" }]]),
  "navigation": Object.freeze([["polygon", { points: "3 11 22 2 13 21 11 13 3 11" }]]),
  "more-horizontal": Object.freeze([["circle", { cx: "12", cy: "12", r: "1" }], ["circle", { cx: "19", cy: "12", r: "1" }], ["circle", { cx: "5", cy: "12", r: "1" }]]),
  "trash-2": Object.freeze([["path", { d: "M3 6h18" }], ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }], ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }], ["line", { x1: "10", x2: "10", y1: "11", y2: "17" }], ["line", { x1: "14", x2: "14", y1: "11", y2: "17" }]]),
  "badge-check": Object.freeze([["path", { d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" }], ["path", { d: "m9 12 2 2 4-4" }]]),
  "chevron-right": Object.freeze([["path", { d: "m9 18 6-6-6-6" }]]),
  "chevron-left": Object.freeze([["path", { d: "m15 18-6-6 6-6" }]]),
  "zap": Object.freeze([["path", { d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" }]]),
  "mail": Object.freeze([["rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }], ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" }]]),
  "arrow-right-left": Object.freeze([["path", { d: "m16 3 4 4-4 4" }], ["path", { d: "M20 7H4" }], ["path", { d: "m8 21-4-4 4-4" }], ["path", { d: "M4 17h16" }]]),
  "log-out": Object.freeze([["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }], ["polyline", { points: "16 17 21 12 16 7" }], ["line", { x1: "21", x2: "9", y1: "12", y2: "12" }]]),
  "square": Object.freeze([["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }]]),
  "messages-square": Object.freeze([["path", { d: "M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" }], ["path", { d: "M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" }]]),
  "message-square": Object.freeze([["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }]]),
  "clipboard-list": Object.freeze([["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1" }], ["path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" }], ["path", { d: "M12 11h4" }], ["path", { d: "M12 16h4" }], ["path", { d: "M8 11h.01" }], ["path", { d: "M8 16h.01" }]]),
  "users": Object.freeze([["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }], ["circle", { cx: "9", cy: "7", r: "4" }], ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }], ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75" }]]),
  "upload": Object.freeze([["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }], ["polyline", { points: "17 8 12 3 7 8" }], ["line", { x1: "12", x2: "12", y1: "3", y2: "15" }]]),
  // Lucide ScanQrCode - Zeichen fuer Zeichen aus der mitgelieferten Fassung
  // (vendor/lucide.min.js, 0.468). Er steht im Inline-Register und nicht als
  // <i data-lucide>, weil der QR-Knopf in Mnyra GO sonst leer bliebe, sobald
  // das externe Lucide-Script nicht laedt.
  "scan-qr-code": Object.freeze([
    ["path", { d: "M17 12v4a1 1 0 0 1-1 1h-4" }],
    ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2" }],
    ["path", { d: "M17 8V7" }],
    ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2" }],
    ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2" }],
    ["path", { d: "M7 17h.01" }],
    ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2" }],
    ["rect", { x: "7", y: "7", width: "5", height: "5", rx: "1" }]
  ]),
  "camera": Object.freeze([["path", { d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" }], ["circle", { cx: "12", cy: "13", r: "3" }]]),
  "external-link": Object.freeze([["path", { d: "M15 3h6v6" }], ["path", { d: "M10 14 21 3" }], ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }]]),
  "grip-vertical": Object.freeze([["circle", { cx: "9", cy: "12", r: "1" }], ["circle", { cx: "9", cy: "5", r: "1" }], ["circle", { cx: "9", cy: "19", r: "1" }], ["circle", { cx: "15", cy: "12", r: "1" }], ["circle", { cx: "15", cy: "5", r: "1" }], ["circle", { cx: "15", cy: "19", r: "1" }]]),
  "map-pin-off": Object.freeze([["path", { d: "M5.43 5.43A8 8 0 0 0 4 10c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 2.824-2.707" }], ["path", { d: "M17.167 17.167C18.815 15.234 20 12.787 20 10a8 8 0 0 0-8-8c-1.482 0-2.87.403-4.061 1.104" }], ["path", { d: "m2 2 20 20" }], ["path", { d: "M9.5 9.5a3 3 0 0 0 4 4" }], ["path", { d: "M14.5 9.5a3 3 0 0 0-4-4" }]]),
  "send": Object.freeze([["path", { d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" }], ["path", { d: "m21.854 2.147-10.94 10.939" }]]),
  "utensils": Object.freeze([["path", { d: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" }], ["path", { d: "M7 2v20" }], ["path", { d: "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" }]]),
  "clock": Object.freeze([["circle", { cx: "12", cy: "12", r: "10" }], ["path", { d: "M12 6v6l4 2" }]]),
  "bar-chart-3": Object.freeze([["path", { d: "M3 3v18h18" }], ["path", { d: "M18 17V9" }], ["path", { d: "M13 17V5" }], ["path", { d: "M8 17v-3" }]]),
  // Die drei Symbole der GO-Leiste. "clock-3" zeigt auf drei Uhr statt auf
  // zehn nach zwoelf wie "clock" - ein Zeiger, der wartet, statt einer Uhr,
  // die laeuft. "circle-check" ist derselbe Haken wie in "check-circle-2",
  // nur unter dem Namen, den Lucide heute dafuer fuehrt.
  "clock-3": Object.freeze([["path", { d: "M12 6v6h4.5" }], ["circle", { cx: "12", cy: "12", r: "10" }]]),
  "circle-check": Object.freeze([["circle", { cx: "12", cy: "12", r: "10" }], ["path", { d: "m9 12 2 2 4-4" }]]),
  "tag": Object.freeze([["path", { d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" }], ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor" }]]),
  "layout-dashboard": Object.freeze([["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1" }], ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1" }], ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1" }], ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1" }]]),
  "bed-double": Object.freeze([["path", { d: "M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" }], ["path", { d: "M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" }], ["path", { d: "M12 4v6" }], ["path", { d: "M2 18h20" }]]),
  "megaphone": Object.freeze([["path", { d: "m3 11 18-5v12L3 14v-3z" }], ["path", { d: "M11.6 16.8a3 3 0 1 1-5.8-1.6" }]]),
  // Ofertat/Voucher: diese Namen muessen inline vorliegen, sonst bleiben
  // sie leer, wenn das externe Lucide-Script nicht laedt.
  "book-open": Object.freeze([["path", { d: "M12 7v14" }], ["path", { d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" }]]),
  "calendar-clock": Object.freeze([["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" }], ["path", { d: "M16 2v4" }], ["path", { d: "M8 2v4" }], ["path", { d: "M3 10h5" }], ["path", { d: "M17.5 17.5 16 16.3V14" }], ["circle", { cx: "16", cy: "16", r: "6" }]]),
  "eye": Object.freeze([["path", { d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" }], ["circle", { cx: "12", cy: "12", r: "3" }]]),
  "gift": Object.freeze([["rect", { x: "3", y: "8", width: "18", height: "4", rx: "1" }], ["path", { d: "M12 8v13" }], ["path", { d: "M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" }], ["path", { d: "M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" }]]),
  "ticket": Object.freeze([["path", { d: "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" }], ["path", { d: "M13 5v2" }], ["path", { d: "M13 17v2" }], ["path", { d: "M13 11v2" }]]),
  "wallet": Object.freeze([["path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }], ["path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" }]]),
  "trending-up": Object.freeze([["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17" }], ["polyline", { points: "16 7 22 7 22 13" }]])
});


// share-2 steht in der App nicht in der Liste: dort faellt das Symbol auf
// <i data-lucide="share-2"> zurueck, und die Lucide-Bibliothek setzt im
// Browser genau diesen Pfad ein. Landing 2 laedt Lucide nicht - deshalb steht
// er hier. Gezeichnet wird dasselbe.
const LANDING2_EXTRA_ICON_NODES = Object.freeze({
  "share-2": Object.freeze([
    ["circle", { cx: "18", cy: "5", r: "3" }],
    ["circle", { cx: "6", cy: "12", r: "3" }],
    ["circle", { cx: "18", cy: "19", r: "3" }],
    ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49" }],
    ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49" }]
  ])
});

function buildIconAttributeString(attributes = {}) {
  return Object.entries(attributes).reduce((markup, [name, value]) => {
    const safeName = String(name || "").trim();
    if (!safeName || value == null || value === false) return markup;
    if (value === true || value === "") return `${markup} ${safeName}`;
    return `${markup} ${safeName}="${esc(String(value))}"`;
  }, "");
}

function renderInlineLucideIcon(name, className = "", attributes = {}) {
  const node = INLINE_LUCIDE_ICON_NODES[name] || LANDING2_EXTRA_ICON_NODES[name];
  if (!node) return "";
  const svgAttrs = {
    ...INLINE_LUCIDE_SVG_ATTRS,
    class: className || null,
    "aria-hidden": "true",
    focusable: "false",
    ...attributes
  };
  const body = node.map(([tagName, tagAttrs = {}]) => `<${tagName}${buildIconAttributeString(tagAttrs)}></${tagName}>`).join("");
  return `<svg${buildIconAttributeString(svgAttrs)}>${body}</svg>`;
}

export function icon(name, className = "", attributes = {}) {
  const safeName = String(name || "").trim();
  if (!safeName) return "";
  const safeClassName = String(className || "").trim();
  const inlineMarkup = renderInlineLucideIcon(safeName, safeClassName, attributes);
  if (inlineMarkup) return inlineMarkup;
  return `<i${buildIconAttributeString({
    "data-lucide": safeName,
    class: safeClassName,
    ...attributes
  })}></i>`;
}

/* -------------------------------------------------------------- Mnyra GO */

// Die Symbole der GO-Karte. Mnyra GO traegt ein eigenes Register
// (core/go/go-icon-render-utils.js) - der Grund steht dort: Die GO-Flaeche
// haengt ausserhalb von #app, wo der Austausch der Lucide-Platzhalter nicht
// hinreicht. Hier stehen die sechs, die die Ergebniskarte braucht, Zeichen
// fuer Zeichen so wie dort.

const GO_SVG_ATTRS = Object.freeze({
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
  focusable: "false"
});

const GO_ICON_NODES = Object.freeze({
  store: [
    ["path", { d: "m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" }],
    ["path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }],
    ["path", { d: "M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" }],
    ["path", { d: "M2 7h20" }],
    ["path", { d: "M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" }]
  ],
  clock: [["circle", { cx: "12", cy: "12", r: "10" }], ["polyline", { points: "12 6 12 12 16 14" }]],
  users: [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
    ["circle", { cx: "9", cy: "7", r: "4" }],
    ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }],
    ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75" }]
  ],
  "map-pin": [
    ["path", { d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" }],
    ["circle", { cx: "12", cy: "10", r: "3" }]
  ],
  "check-check": [["path", { d: "M18 6 7 17l-5-5" }], ["path", { d: "m22 10-7.5 7.5L13 16" }]],
  "ticket-percent": [
    ["path", { d: "M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" }],
    ["path", { d: "M9 9h.01" }],
    ["path", { d: "m15 9-6 6" }],
    ["path", { d: "M15 15h.01" }]
  ],
});

export function goIcon(name = "", className = "") {
  const nodes = GO_ICON_NODES[String(name || "").trim()];
  if (!nodes) return "";
  const body = nodes.map(([tag, tagAttrs]) => `<${tag}${buildIconAttributeString(tagAttrs)}></${tag}>`).join("");
  const cls = String(className || "").trim();
  return `<svg${buildIconAttributeString(GO_SVG_ATTRS)}${cls ? ` class="${cls}"` : ""}>${body}</svg>`;
}

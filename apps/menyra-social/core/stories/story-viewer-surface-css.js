// GENERIERT - nicht von Hand aendern.
// Quelle: apps/menyra-social/story/index.html
// Neu erzeugen: node scripts/generate-story-viewer-surface-css.mjs
//
// Die Oberflaechen-Regeln des Story-Viewers, eingerueckt unter
// ".mnyra-story-surface". Der Business-Composer baut damit seine Vorschau
// "so sieht die Story aus, wenn man sie oeffnet" - mit exakt denselben
// Deklarationen wie die echte Story-Seite.

export const STORY_VIEWER_SURFACE_CLASS = "mnyra-story-surface";

export const STORY_VIEWER_SURFACE_CSS = `
.mnyra-story-surface {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --txt: #ffffff;
  --muted: rgba(255,255,255,0.72);
}
.mnyra-story-surface {
  color: var(--txt);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif;
  overflow: hidden;
  background: #000;
}
.mnyra-story-surface * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.mnyra-story-surface .reel {
  position: relative;
  height: 100vh;
  height: 100svh;
  height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  background: #000;
  overflow: hidden;
  isolation: isolate;
  cursor: pointer;
}
.mnyra-story-surface .reel iframe,
.mnyra-story-surface .reel video,
.mnyra-story-surface .reel img.reel-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
  transform: translateZ(0);
  border: none;
  pointer-events: none;
}
.mnyra-story-surface .reel::after {
  content: "";
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: auto;
  z-index: 10;
}
.mnyra-story-surface .vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(120% 70% at 50% 10%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.8) 100%), linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.00) 45%);
  opacity: .9;
  z-index: 5;
}
.mnyra-story-surface .topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding-top: calc(var(--safe-top) + 10px);
  padding-left: calc(var(--safe-left) + 12px);
  padding-right: calc(var(--safe-right) + 12px);
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  z-index: 20;
  pointer-events: none;
}
.mnyra-story-surface .topbarLeft {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}
.mnyra-story-surface .topbarRight {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}
.mnyra-story-surface .btnIcon {
  border: 0;
  background: rgba(0,0,0,0.45);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  backdrop-filter: blur(6px);
  font-size: 18px;
  font-weight: 800;
}
.mnyra-story-surface .btnIcon:active {
  transform: scale(0.98);
}
.mnyra-story-surface .btnIcon[data-story-sound-state="on"] {
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.16);
}
.mnyra-story-surface .brandPill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 16px;
  background: rgba(0,0,0,0.25);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.12);
  pointer-events: auto;
  min-width: 0;
}
.mnyra-story-surface .brandLogo {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  object-fit: contain;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.10);
  flex: 0 0 auto;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.mnyra-story-surface .brandName {
  font-weight: 800;
  font-size: 14px;
  letter-spacing: .2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 56vw;
}
.mnyra-story-surface .rail {
  position: absolute;
  right: calc(var(--safe-right) + 12px);
  bottom: calc(var(--safe-bottom) + 110px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  pointer-events: auto;
}
.mnyra-story-surface .railBtn {
  border: 0;
  background: transparent;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.mnyra-story-surface .railIcon {
  width: 60px;
  height: 46px;
  border-radius: 18px;
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.10);
  display: grid;
  place-items: center;
  backdrop-filter: blur(6px);
  font-weight: 700;
  font-size: 13px;
}
.mnyra-story-surface .content {
  position: absolute;
  left: calc(var(--safe-left) + 12px);
  right: calc(var(--safe-right) + 78px);
  bottom: calc(var(--safe-bottom) + 28px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
}
.mnyra-story-surface .contentTitle {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  text-shadow: 0 2px 12px rgba(0,0,0,0.6);
}
.mnyra-story-surface .contentDesc {
  font-size: 14px;
  line-height: 1.45;
  color: rgba(255,255,255,0.88);
  text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  max-width: 92%;
  white-space: pre-wrap;
}
.mnyra-story-surface .productCard {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 420px;
  padding: 10px;
  border-radius: 20px;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.16);
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease, background 0.2s ease;
}
.mnyra-story-surface .productCard:hover {
  background: rgba(0,0,0,0.65);
}
.mnyra-story-surface .productCard:active {
  transform: scale(0.98);
}
.mnyra-story-surface .productCardThumb {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.12);
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  font-size: 22px;
  overflow: hidden;
}
.mnyra-story-surface .productCardThumbImg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mnyra-story-surface .productCardInfo {
  flex: 1;
  min-width: 0;
}
.mnyra-story-surface .productCardName {
  font-weight: 800;
  font-size: 14px;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 6px rgba(0,0,0,0.4);
}
.mnyra-story-surface .productCardPrice {
  margin-top: 2px;
  font-weight: 700;
  font-size: 13px;
  color: rgba(255,255,255,0.85);
}
.mnyra-story-surface .productCardBtn {
  flex: 0 0 auto;
  padding: 9px 16px;
  border-radius: 14px;
  background: #fff;
  color: #0f172a;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.mnyra-story-surface {
  position: relative;
  display: block;
  overflow: hidden;
}
.mnyra-story-surface .reel {
  height: 100%;
  cursor: default;
}
.mnyra-story-surface .reel::after {
  pointer-events: none;
}
.mnyra-story-surface .topbarLeft,
.mnyra-story-surface .topbarRight,
.mnyra-story-surface .rail,
.mnyra-story-surface .content {
  pointer-events: none;
}
`;

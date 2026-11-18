import { ccEscape as esc } from "../../shared/content-creator.js";
import { creatorIcon } from "../../shared/content-creator-view.js";
export { esc, creatorIcon };
export const logo =
  '<a class="shop-logo" href="/" aria-label="MNYRA">MNYRA<span class="shop-logo-dot"></span></a>';
export const button = (action, label, extra = "") =>
  `<button type="button" data-action="${action}" ${extra}>${label}</button>`;
const photo = (
  url,
  alt = "",
  eager = false,
  sizes = "(max-width: 768px) 94vw, 720px",
) =>
  url
    ? `<img src="${esc(url)}" srcset="${esc(url)}?w=480 480w, ${esc(url)} 1600w" sizes="${sizes}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`
    : "";
export const picture = (item) =>
  item.videoUrl
    ? `<video controls playsinline preload="none" poster="${esc(item.imageUrl || "")}" src="${esc(item.videoUrl)}"></video>`
    : photo(item.imageUrl, item.name);
export const actions = (kind, item) =>
  `<div class="reactions" data-kind="${kind}" data-id="${esc(item.id)}">${button("like", "♡ <span>" + Number(item.likesCount || 0) + "</span>", 'aria-label="Pëlqe" aria-pressed="false"')}${button("comments", creatorIcon("message-circle") + " " + Number(item.commentsCount || 0), 'aria-label="Komentet"')}</div>`;
function card(item) {
  const type = item.cardStyle === "testfirst_focus" ? "offer" : item.type;
  const details = [
    item.ingredients,
    item.allergens && "Alergjenët · " + item.allergens,
  ].filter(Boolean);
  return `<article class="card ${esc(type)}" data-category="${esc(item.category)}">${picture(item)}<div class="row"><h3>${esc(item.name)}</h3><strong>${Number(item.price).toFixed(2)} €</strong></div>${item.description ? `<p>${esc(item.description)}</p>` : ""}${details.length ? `<details><summary>Detajet</summary>${details.map((x) => "<p>" + esc(x) + "</p>").join("")}</details>` : ""}${actions("item", item)}</article>`;
}
export function renderPage(page) {
  const offers = page.items.filter((i) => i.cardStyle === "testfirst_focus");
  const menu = page.items.filter((i) => i.cardStyle !== "testfirst_focus");
  const cats = [...new Set(menu.map((i) => i.category))];
  const stories = page.stories.filter(
    (s) => Date.parse(s.createdAt) > Date.now() - 86400000,
  );
  return `<header>${button("menu", "☰", 'aria-label="Menyja"')}${logo}<b class="business-name">${esc(page.name)}</b><div class="tools">${button("reels", creatorIcon("video"), 'aria-label="Reels"')}${button("create", "+", 'hidden aria-label="Krijo"')}</div></header>
    <main><section class="identity" data-business-profile-card><div class="cover">${photo(page.cover, "", true)}</div><div class="identity-body"><div class="avatar">${photo(page.avatar, page.name, true, "84px") || esc(page.name.slice(0, 1))}</div><h1>${esc(page.name)}</h1><p><a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent([page.name, page.address, page.city].filter(Boolean).join(" "))}" target="_blank" rel="noopener">${esc([page.address, page.city].filter(Boolean).join(" · "))}</a></p>${page.bio ? "<p>" + esc(page.bio) + "</p>" : ""}</div></section>
    ${stories.length ? `<section><h2>Story</h2><div class="rail stories">${stories.map((s) => button("story", photo(s.imageUrl, s.caption, false, "65px") || creatorIcon("play"), `data-id="${esc(s.id)}" aria-label="Hap story"`)).join("")}</div></section>` : ""}
    ${offers.length ? `<section><h2>Ofertat</h2><div class="rail offers">${offers.map(card).join("")}</div></section>` : ""}
    <section><h2>Menyja</h2>${cats.length ? `<div class="rail chips">${["Të gjitha", ...cats].map((c, i) => button("filter", esc(c), `data-category="${i ? esc(c) : ""}" aria-pressed="${!i}"`)).join("")}</div>` : ""}<div class="catalog">${menu.map(card).join("") || "<p>Menyja do të publikohet së shpejti.</p>"}</div></section></main>
    <footer>${logo}<p>Biznesi yt meriton me u pa.</p><small>Krijuar për ${esc(page.name)}</small></footer>`;
}

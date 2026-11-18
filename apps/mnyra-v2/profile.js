import { unlockCreatorVideoAudio } from "../mnyra-heart/heart-creator-video-audio.js";
import { renderPage, actions, button, picture, esc } from "./view.js";
let page = JSON.parse(document.getElementById("restaurant").textContent),
  owner = false,
  subscribed = false;
const sheet = document.getElementById("sheet"),
  body = document.getElementById("body"),
  error = document.getElementById("error"),
  root = document.getElementById("page");
const id = () => crypto.randomUUID().replaceAll("-", "");
async function call(op, data = {}) {
  const response = await fetch("/api/mnyra-v2", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...data, slug: page.slug, op }),
  });
  const out = await response.json();
  if (!response.ok) throw Error(out.error || "Provo përsëri.");
  return out;
}
function show(title, html) {
  document.getElementById("title").textContent = title;
  body.innerHTML = html;
  error.textContent = "";
  if (!sheet.open) sheet.showModal();
}
function fail(e) {
  if (!sheet.open) show("MNYRA", "");
  error.textContent = e.message;
}
function ownerTools() {
  const plus = root.querySelector("[data-action=create]");
  if (plus) plus.hidden = !owner;
}
const key = (kind, id) => ["v2", page.slug, kind, id].join("/");
function restoreLikes() {
  for (const row of document.querySelectorAll(".reactions")) {
    try {
      row
        .querySelector("[data-action=like]")
        .setAttribute(
          "aria-pressed",
          localStorage.getItem(key(row.dataset.kind, row.dataset.id)) === "1",
        );
    } catch {}
  }
}
async function refresh() {
  page = await call("refresh");
  root.innerHTML = renderPage(page);
  ownerTools();
  restoreLikes();
}
function reels(start, storyOnly = false) {
  const list = page.stories.filter(
    (s) => !storyOnly || Date.parse(s.createdAt) > Date.now() - 86400000,
  );
  let pos = Math.max(
    0,
    list.findIndex((s) => s.id === start),
  );
  function draw() {
    const item = list[pos];
    show(
      storyOnly ? "Story" : "Reels",
      item
        ? `<article class="reel">${picture(item)}<p>${esc(item.caption)}</p>${actions("story", item)}</article><div class="row">${button("prev", "‹ Mbrapa", pos ? "" : "disabled")}${pos + 1} / ${list.length}${button("next", "Tjetra ›", pos + 1 < list.length ? "" : "disabled")}</div>`
        : "<p>Ende nuk ka reels.</p>",
    );
    restoreLikes();
    for (const [action, delta] of [
      ["prev", -1],
      ["next", 1],
    ])
      body
        .querySelector("[data-action=" + action + "]")
        ?.addEventListener("click", () => {
          pos += delta;
          draw();
        });
  }
  draw();
}
function editor() {
  return import("./editor.js");
}
const ctx = () => ({ page, call, show, refresh, id, sheet, subscribed });
document.addEventListener("click", async (event) => {
  const el = event.target.closest("[data-action]");
  if (!el || el.disabled) return;
  const action = el.dataset.action;
  try {
    if (action === "close") {
      sheet.close();
      return;
    }
    if (action === "menu")
      show(
        "Menyja",
        `<div class="stack"><a href="/feed">Feed</a>${button("reels", "Reels")}${owner ? button("logout", "Dil nga biznesi") : button("login", "Kyçu biznes")}</div>`,
      );
    if (action === "login")
      show(
        "Kyçu biznes",
        '<form data-form="login"><label>PIN-i i biznesit<input name="pin" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{5}" maxlength="5" required></label><button class="primary">Kyçu</button></form>',
      );
    if (action === "logout") {
      await call("logout");
      owner = false;
      ownerTools();
      sheet.close();
    }
    if (action === "create")
      show(
        "Krijo",
        `<div class="stack">${button("story-editor", "Story / Reels")}${button("manage", "Menyja")}${button("settings", "Cilësimet")}${button("post-editor", subscribed ? "Posto n’MNYRA" : "Posto n’MNYRA · Abonim", subscribed ? "" : "disabled")}</div>`,
      );
    if (action === "reels" || action === "story")
      reels(el.dataset.id, action === "story");
    if (action === "filter") {
      root
        .querySelectorAll(".chips button")
        .forEach((b) => b.setAttribute("aria-pressed", b === el));
      root.querySelectorAll(".catalog .card").forEach((c) => {
        c.hidden =
          !!el.dataset.category && c.dataset.category !== el.dataset.category;
      });
    }
    if (action === "comments" || action === "like") {
      const row = el.closest(".reactions"),
        { kind, id: target } = row.dataset;
      if (action === "comments") {
        show("Komentet", "<p>Duke ngarkuar…</p>");
        const { comments } = await call("comments", { kind, id: target });
        show(
          "Komentet",
          `<form data-form="comment" data-kind="${kind}" data-id="${target}"><label>Komenti yt<input required name="text" maxlength="500"></label><button class="primary">Dërgo</button></form><div>${comments.map((t) => "<p>" + esc(t) + "</p>").join("") || "<p>Shkruaj komentin e parë.</p>"}</div>`,
        );
      } else {
        const liked = el.getAttribute("aria-pressed") !== "true";
        el.disabled = true;
        const result = await call("like", { kind, id: target, liked });
        el.setAttribute("aria-pressed", result.liked);
        try {
          localStorage.setItem(key(kind, target), result.liked ? "1" : "0");
        } catch {}
        const item = (kind === "story" ? page.stories : page.items).find(
          (i) => i.id === target,
        );
        item.likesCount = result.count;
        el.querySelector("span").textContent = item.likesCount;
      }
    }
    if (
      [
        "story-editor",
        "post-editor",
        "manage",
        "item-editor",
        "settings",
        "remove-item",
      ].includes(action)
    )
      await (await editor()).openEditor(action, el.dataset.id, ctx());
  } catch (e) {
    fail(e);
  } finally {
    el.disabled = false;
  }
});
document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!form.dataset.form) return;
  event.preventDefault();
  if (form.dataset.busy) return;
  if (form.elements.mediaFile?.files?.[0]?.type.startsWith("video/"))
    unlockCreatorVideoAudio();
  const data = Object.fromEntries(new FormData(form));
  form.dataset.busy = "1";
  const submit = form.querySelector("[type=submit],button.primary");
  submit.disabled = true;
  try {
    if (form.dataset.form === "login") {
      const result = await call("login", { pin: data.pin });
      subscribed = result.subscribed;
      owner = true;
      ownerTools();
      sheet.close();
      return;
    }
    if (form.dataset.form === "comment") {
      const { kind, id: target } = form.dataset;
      await call("comment", {
        kind,
        id: target,
        text: data.text,
        requestId: (form.dataset.requestId ||= id()),
      });
      await refresh();
      sheet.close();
      return;
    }
    await (await editor()).saveEditor(form, data, ctx());
  } catch (e) {
    fail(e);
  } finally {
    delete form.dataset.busy;
    submit.disabled = false;
  }
});
sheet.addEventListener("close", () => {
  body.replaceChildren();
});
restoreLikes();
call("session")
  .then((result) => {
    owner = result.owner;
    subscribed = result.subscribed;
    ownerTools();
  })
  .catch(() => {});

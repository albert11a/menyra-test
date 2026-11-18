import { esc, button } from "./view.js";
const field = (label, name, value = "", attrs = "") =>
  `<label>${label}<input name="${name}" value="${esc(value)}" ${attrs}></label>`;
const file = (label, name, accept) =>
  field(label, name, "", `type="file" accept="${accept}"`);
const choice = (key, label, current) =>
  `<option value="${key}" ${key === current ? "selected" : ""}>${label}</option>`;
const form = (kind, content, id = "") =>
  `<form data-form="${kind}" data-id="${id}">${content}<p role="status"></p><button class="primary" type="submit">Ruaj</button></form>`;
export async function openEditor(
  action,
  target,
  { page, show, id, subscribed },
) {
  if (action === "manage") {
    show(
      "Menyja",
      `<div class="stack">${button("item-editor", "+ Shto në meny", 'class="primary"')}${page.items.map((i) => button("item-editor", esc(i.name) + " · " + Number(i.price).toFixed(2) + " €", 'data-id="' + i.id + '"')).join("")}</div>`,
    );
    return;
  }
  if (action === "settings") {
    show(
      "Cilësimet",
      form(
        "settings",
        field("Emri", "name", page.name, 'required maxlength="90"') +
          field("Qyteti", "city", page.city, "required") +
          `<label>Shteti<select name="countryCode">${choice("xk", "Kosovë", page.countryCode)}${choice("al", "Shqipëri", page.countryCode)}${choice("rs", "Serbi", page.countryCode)}</select></label>` +
          field("Adresa", "address", page.address) +
          field("Përshkrimi", "bio", page.bio) +
          file("Foto e profilit", "avatarFile", "image/*") +
          file("Foto e kopertinës", "coverFile", "image/*"),
      ),
    );
    return;
  }
  if (action === "remove-item") {
    const item = page.items.find((i) => i.id === target);
    show(
      "Hiqe nga menyja?",
      form("remove-item", "<p>" + esc(item.name) + "</p>", item.id),
    );
    return;
  }
  if (action === "item-editor") {
    const i = page.items.find((i) => i.id === target) || {};
    const type = i.cardStyle === "testfirst_focus" ? "offer" : i.type || "food";
    show(
      i.id ? "Ndrysho artikullin" : "Shto në meny",
      form(
        "item",
        `<label>Lloji<select name="type">${choice("food", "Ushqim", type)}${choice("drink", "Pije", type)}${choice("offer", "Ofertë", type)}</select></label>` +
          field("Emri", "name", i.name, 'required maxlength="90"') +
          field(
            "Çmimi (€)",
            "price",
            i.price,
            'required type="number" min="0" step=".01" inputmode="decimal"',
          ) +
          field("Kategoria", "category", i.category) +
          file("Foto ose video", "mediaFile", "image/*,video/*") +
          field("Përshkrimi", "description", i.description) +
          `<details><summary>Përbërësit dhe alergjenët</summary>${field("Përbërësit", "ingredients", i.ingredients)}${field("Alergjenët", "allergens", i.allergens)}</details>`,
        i.id || id(),
      ) +
        (i.id
          ? button("remove-item", "Hiqe nga menyja", 'data-id="' + i.id + '"')
          : ""),
    );
    return;
  }
  const post = action === "post-editor";
  if (post && !subscribed) return;
  show(
    post ? "Posto n’MNYRA" : "Story / Reels",
    form(
      post ? "post" : "story",
      '<label>Foto ose video<input type="file" name="mediaFile" accept="image/*,video/*" required></label>' +
        field("Përshkrimi", "caption", "", 'maxlength="1000"'),
      id(),
    ),
  );
}
export async function saveEditor(form, data, { page, call, refresh, sheet }) {
  const op = form.dataset.form,
    target = form.dataset.id,
    previous = page.items.find((i) => i.id === target);
  const payload = Object.fromEntries(
    Object.entries(data).filter(([, v]) => typeof v === "string"),
  );
  const upload = async (f) => {
    const status = form.querySelector("[role=status]");
    status.textContent = "Duke përgatitur median…";
    const { uploadFile } = await import("./media.js");
    return uploadFile(f, page.slug, call, status);
  };
  if (op === "settings") {
    const [avatar, cover] = await Promise.all([
      data.avatarFile.size ? upload(data.avatarFile) : null,
      data.coverFile.size ? upload(data.coverFile) : null,
    ]);
    Object.assign(payload, {
      avatar: avatar?.url || page.avatar,
      cover: cover?.url || page.cover,
      version: page.version,
    });
  } else if (op === "remove-item") {
    payload.version = previous.version;
  } else {
    const media = data.mediaFile?.size ? await upload(data.mediaFile) : null;
    if (op === "item")
      Object.assign(payload, {
        version: previous?.version,
        orderIndex: previous?.orderIndex,
        imageUrl: media ? media.poster || media.url : previous?.imageUrl,
        videoUrl: media ? (media.video ? media.url : "") : previous?.videoUrl,
      });
    else
      Object.assign(payload, { mediaUrl: media?.url, poster: media?.poster });
  }
  await call(op, { ...payload, id: target });
  await refresh();
  sheet.close();
}

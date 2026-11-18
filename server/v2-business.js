import { readFileSync } from "node:fs";
import { normalizePublicBusinessSlugCore } from "../apps/menyra-social/core/router/public-business-route-utils.js";
import {
  creatorMediaUrl,
  creatorVideoMediaUrl,
} from "../shared/creator-media.js";
import { change, remove, stamp, problem } from "./v2-store.js";
import { newSalt, pinFor } from "./v2-access.js";

const routes = JSON.parse(
  readFileSync(new URL("../vercel.json", import.meta.url)),
);
const reserved = new Set(
  [...routes.rewrites, ...routes.redirects].map((r) => r.source.split("/")[1]),
);
export const stages = [
  "Neu",
  "Angeschrieben",
  "Wartet auf Antwort",
  "Kunde",
  "Archiv",
];
export const slugOk = (s) =>
  typeof s === "string" &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) &&
  s.length <= 65;
export const idOk = (s) => typeof s === "string" && /^[a-f0-9]{32}$/.test(s);
const clean = (s, max = 200) =>
  String(s ?? "")
    .trim()
    .slice(0, max);
const invalid = () => {
  throw problem(400, "Kontrollo të dhënat e shënuara.");
};
export async function createLead(repo, input) {
  const name = clean(input.name, 90),
    city = clean(input.city, 90);
  const slug = normalizePublicBusinessSlugCore(input.slug || name);
  if (
    !name ||
    !city ||
    !slugOk(slug) ||
    reserved.has(slug) ||
    idOk(slug) ||
    slug.endsWith("-fotot")
  )
    throw problem(400, "Bitte einen freien Restaurantnamen und Ort eingeben.");
  const aliases = await Promise.all(
    ["publicSlug", "landingSlug"].map((key) =>
      repo.query("restaurants", { where: [key, slug], limit: 1 }),
    ),
  );
  if (aliases.some((list) => list.length))
    throw problem(409, "Dieser Restaurantlink ist bereits vergeben.");
  const salt = newSalt();
  const countryCode = input.countryCode || "xk";
  if (!["xk", "al", "rs"].includes(countryCode)) invalid();
  const profile = {
    name,
    city,
    countryCode,
    publicSlug: slug,
    type: "restaurant",
    businessType: "restaurant",
    mnyraV2: true,
    ownerUid: "v2-" + slug,
    createdByUid: "v2-" + slug,
    status: "active",
    createdAt: stamp(),
  };
  await repo.commit([
    change(
      "v2Leads/" + slug,
      { salt, stage: stages[0], subscribed: false, createdAt: stamp() },
      false,
    ),
    change("restaurants/" + slug, profile, false),
    change(
      "publicRoutes/" + slug,
      { restaurantId: slug, publicSlug: slug },
      false,
    ),
    change(
      "contentCreatorPages/" + slug,
      { kind: "v2-route", published: true, restaurantId: slug },
      false,
    ),
  ]);
  return { slug, pin: pinFor(slug, salt) };
}
function media(input, slug) {
  if (!input) return "";
  const url = creatorMediaUrl(input) || creatorVideoMediaUrl(input);
  if (!url || new URL(url).pathname.split("/")[3] !== slug) invalid();
  return url;
}
export async function snapshot(repo, slug) {
  const parent = "restaurants/" + slug;
  const [row, menu, stories, engagement] = await Promise.all([
    repo.read(parent),
    repo.query("menuItems", { parent, limit: 500 }),
    repo.query("stories", { parent, order: "createdAt", limit: 50 }),
    repo.query("menuSocial", { parent, limit: 500 }),
  ]);
  if (!row) throw problem(404, "Biznesi nuk u gjet.");
  const counts = new Map(
    engagement.map((r) => [
      r.id,
      {
        likesCount: r.data.likesCount || 0,
        commentsCount: r.data.commentsCount || 0,
      },
    ]),
  );
  const {
    name,
    city,
    countryCode = "xk",
    address = "",
    bio = "",
    logoUrl: avatar = "",
    titleImageUrl: cover = "",
  } = row.data;
  return {
    slug,
    name,
    city,
    countryCode,
    address,
    bio,
    avatar,
    cover,
    version: row.version,
    items: menu
      .filter((r) => !r.data.hidden)
      .map((r) => ({
        ...r.data,
        ...counts.get(r.id),
        id: r.id,
        version: r.version,
      }))
      .sort((a, b) => a.orderIndex - b.orderIndex),
    stories: stories
      .filter((r) => r.data.active !== false)
      .map((r) => ({ ...r.data, id: r.id })),
  };
}
// Keep the legacy menu/QR read model and the canonical item change in one commit.
async function writeMenuItem(repo, base, input, data) {
  const menuPath = base + "/public/menu";
  const menu = await repo.read(menuPath);
  const items = (menu?.data.items || []).filter((row) => row.id !== input.id);
  if (data) items.push(data);
  items.sort((a, b) => a.orderIndex - b.orderIndex);
  const itemPath = base + "/menuItems/" + input.id;
  const writes = [
    data
      ? change(itemPath, data, input.version || false, true)
      : remove(itemPath, input.version),
    change(
      menuPath,
      {
        items,
        menuTruthSource: "public-menu",
        menuTruthState: items.length ? "seeded" : "knownEmpty",
        updatedAt: stamp(),
      },
      menu?.version || false,
      true,
    ),
  ];
  await repo.commit(writes);
}

export async function editBusiness(repo, slug, input, lead) {
  const base = "restaurants/" + slug;
  if (input.op === "settings") {
    const name = clean(input.name, 90),
      city = clean(input.city, 90);
    if (
      !name ||
      !city ||
      !input.version ||
      !["xk", "al", "rs"].includes(input.countryCode)
    )
      invalid();
    await repo.commit([
      change(
        base,
        {
          name,
          city,
          countryCode: input.countryCode,
          address: clean(input.address),
          bio: clean(input.bio, 500),
          logoUrl: media(input.avatar, slug),
          titleImageUrl: media(input.cover, slug),
        },
        input.version,
        true,
      ),
    ]);
    return {};
  }
  if (!idOk(input.id)) invalid();
  if (["item", "remove-item"].includes(input.op)) {
    if (input.op === "remove-item") {
      if (!input.version) invalid();
      await writeMenuItem(repo, base, input, null);
      return {};
    }
    const name = clean(input.name, 90),
      price = Number(input.price);
    if (
      !name ||
      input.price === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 100000 ||
      !["food", "drink", "offer"].includes(input.type)
    )
      invalid();
    const imageUrl = media(input.imageUrl, slug),
      videoUrl = media(input.videoUrl, slug);
    const data = {
      id: input.id,
      name,
      price,
      type: input.type === "drink" ? "drink" : "food",
      cardStyle:
        input.type === "offer" ? "testfirst_focus" : "testfirst_" + input.type,
      category:
        clean(input.category, 60) ||
        (input.type === "drink" ? "Pije" : "Ushqime"),
      description: clean(input.description, 600),
      ingredients: clean(input.ingredients, 300),
      allergens: clean(input.allergens, 180),
      imageUrl,
      imageUrls: imageUrl ? [imageUrl] : [],
      videoUrl,
      mediaType: videoUrl ? "video" : "image",
      available: true,
      orderIndex: Number(input.orderIndex) || Date.now(),
      updatedAt: stamp(),
    };
    await writeMenuItem(repo, base, input, data);
    return {};
  }
  if (!["story", "post"].includes(input.op)) invalid();
  const isPost = input.op === "post";
  if (isPost && !lead.data.subscribed)
    throw problem(403, "Posto n’MNYRA kërkon abonim.");
  const url = media(input.mediaUrl, slug),
    poster = media(input.poster, slug);
  if (!url) invalid();
  const video = !!creatorVideoMediaUrl(url),
    now = stamp(),
    caption = clean(input.caption, 1000);
  const payload = {
    restaurantId: slug,
    mediaUrl: url,
    mediaType: video ? "video" : "image",
    imageUrl: video ? poster : url,
    videoUrl: video ? url : "",
    caption,
    description: caption,
    status: "active",
    active: true,
    createdAt: now,
    updatedAt: now,
    likesCount: 0,
    commentsCount: 0,
  };
  if (!isPost) {
    await repo.commit([
      change(
        base + "/stories/" + input.id,
        { ...payload, expiresAt: new Date(Date.now() + 86400000) },
        false,
      ),
    ]);
    return {};
  }
  const profile = (await repo.read(base)).data;
  const path = base + "/socialPosts/" + input.id;
  const feed = {
    ...payload,
    rid: slug,
    mnyraV2: true,
    surface: "feed",
    businessName: profile.name,
    city: profile.city,
    countryCode: profile.countryCode,
    logoUrl: profile.logoUrl || "",
    canonicalPath: path,
    thumbUrl: payload.imageUrl,
    postType: "food",
    createdAtClient: now.toISOString(),
  };
  await repo.commit([
    change(
      path,
      {
        ...feed,
        media: [{ url, type: payload.mediaType, thumbUrl: payload.imageUrl }],
      },
      false,
    ),
    change("socialFeed/" + input.id, feed, false),
    change("v2Leads/" + slug, { lastPostedAt: now }, lead.version, true),
  ]);
  return {};
}

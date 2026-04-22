import {
  parsePublicBusinessRoutePathCore
} from "/apps/menyra-social/core/router/public-business-route-utils.js";

const APP_BUILD_TOKEN = "2026-04-16-landing-coldstart-fast-04";
const PUBLIC_BUILD_TOKEN = "2026-04-22-web-first-01";
const BOOTSTRAP_ENDPOINT = "https://us-central1-menyra-c0e68.cloudfunctions.net/socialBootstrapFeed";
const FALLBACK_OG_IMAGE = "/apps/menyra-social/assets/icon-512.png";

function asText(value, fallback = "") {
  const next = String(value ?? "").trim();
  return next || fallback;
}

function asCount(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return Math.max(0, Number(fallback) || 0);
  return Math.max(0, Math.round(numeric));
}

function formatSlugLabel(slug = "") {
  const safeSlug = asText(slug);
  if (!safeSlug) return "MNYRA";
  return safeSlug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeSurface(surface = "") {
  return asText(surface).toLowerCase() === "menu" ? "menu" : "profile";
}

function readRouteHint() {
  const hint = window.__MNYRA_PUBLIC_ROUTE_HINT__;
  if (!hint || typeof hint !== "object") {
    return {
      slug: "",
      surface: "profile",
      isHome: true
    };
  }
  return {
    slug: asText(hint.slug).toLowerCase(),
    surface: normalizeSurface(hint.surface),
    isHome: hint.isHome === true
  };
}

function readPublicRoute() {
  const pathname = asText(window.location.pathname, "/");
  const parsed = parsePublicBusinessRoutePathCore(pathname, { allowLegacyRootSlug: false });
  if (parsed.matched && asText(parsed.restaurantId)) {
    return {
      kind: "business",
      slug: asText(parsed.restaurantId).toLowerCase(),
      surface: normalizeSurface(parsed.topTab),
      canonicalPath: normalizeSurface(parsed.topTab) === "menu"
        ? `/${encodeURIComponent(asText(parsed.restaurantId).toLowerCase())}/menu`
        : `/${encodeURIComponent(asText(parsed.restaurantId).toLowerCase())}`
    };
  }
  const hint = readRouteHint();
  if (hint.slug && !hint.isHome) {
    return {
      kind: "business",
      slug: hint.slug,
      surface: hint.surface,
      canonicalPath: hint.surface === "menu"
        ? `/${encodeURIComponent(hint.slug)}/menu`
        : `/${encodeURIComponent(hint.slug)}`
    };
  }
  return {
    kind: "home",
    slug: "",
    surface: "home",
    canonicalPath: "/"
  };
}

function ensureMetaTagByName(name) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  return tag;
}

function ensureMetaTagByProperty(property) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  return tag;
}

function ensureCanonicalLink() {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  return link;
}

function toAbsoluteUrl(pathOrUrl = "") {
  const raw = asText(pathOrUrl);
  if (!raw) return window.location.origin;
  try {
    return new URL(raw, window.location.origin).toString();
  } catch {
    return `${window.location.origin}/`;
  }
}

function updateSeoMeta({ title = "", description = "", canonicalPath = "/", image = FALLBACK_OG_IMAGE } = {}) {
  const safeTitle = asText(title, "MNYRA | Restaurant-Profile und Speisekarten");
  const safeDescription = asText(
    description,
    "MNYRA zeigt Restaurant-Profile und Speisekarten als schnelle öffentliche Website ohne App-Blocker."
  );
  const safeCanonical = asText(canonicalPath, "/");
  const canonicalUrl = toAbsoluteUrl(safeCanonical);
  const imageUrl = toAbsoluteUrl(asText(image, FALLBACK_OG_IMAGE));

  document.title = safeTitle;
  ensureMetaTagByName("description").setAttribute("content", safeDescription);

  ensureMetaTagByProperty("og:title").setAttribute("content", safeTitle);
  ensureMetaTagByProperty("og:description").setAttribute("content", safeDescription);
  ensureMetaTagByProperty("og:url").setAttribute("content", canonicalUrl);
  ensureMetaTagByProperty("og:image").setAttribute("content", imageUrl);

  ensureMetaTagByName("twitter:title").setAttribute("content", safeTitle);
  ensureMetaTagByName("twitter:description").setAttribute("content", safeDescription);
  ensureMetaTagByName("twitter:image").setAttribute("content", imageUrl);

  ensureCanonicalLink().setAttribute("href", canonicalUrl);
}

function createRefs() {
  return {
    shell: document.getElementById("publicShell"),
    routeLabel: document.getElementById("routeLabel"),
    heroTitle: document.getElementById("heroTitle"),
    heroDescription: document.getElementById("heroDescription"),
    profileLink: document.getElementById("profileLink"),
    menuLink: document.getElementById("menuLink"),
    appLink: document.getElementById("appLink"),
    businessName: document.getElementById("businessName"),
    businessHandle: document.getElementById("businessHandle"),
    businessBio: document.getElementById("businessBio"),
    brandLogo: document.getElementById("brandLogo"),
    postsCount: document.getElementById("postsCount"),
    menuCount: document.getElementById("menuCount"),
    focusCount: document.getElementById("focusCount"),
    menuPanel: document.getElementById("menuPanel"),
    postsPanel: document.getElementById("postsPanel"),
    menuList: document.getElementById("menuList"),
    postsList: document.getElementById("postsList"),
    statusLine: document.getElementById("statusLine"),
    statusHint: document.getElementById("statusHint")
  };
}

function setStatus(refs, text, { isError = false, hint = "" } = {}) {
  if (refs.statusLine) {
    refs.statusLine.textContent = asText(text);
    refs.statusLine.style.color = isError ? "#b91c1c" : "";
  }
  if (refs.statusHint) {
    refs.statusHint.textContent = asText(hint, refs.statusHint.textContent);
  }
}

function setLinkVisibility(node, visible = false) {
  if (!node) return;
  node.hidden = !visible;
}

function applyRouteChrome(route, refs) {
  if (!refs.shell) return;
  refs.shell.dataset.surface = route.kind === "business" ? route.surface : "home";

  if (route.kind !== "business") {
    if (refs.routeLabel) refs.routeLabel.textContent = "MNYRA Public Home";
    if (refs.heroTitle) refs.heroTitle.textContent = "Restaurant-Profil und Speisekarte laden zuerst als Website.";
    if (refs.heroDescription) {
      refs.heroDescription.textContent = "Öffentliche Inhalte starten stabil im HTML, ohne App-Bootstrap-Kaskade im ersten Screen.";
    }
    setLinkVisibility(refs.profileLink, false);
    setLinkVisibility(refs.menuLink, false);
    if (refs.appLink) refs.appLink.href = "/feed";
    updateSeoMeta({
      title: "MNYRA | Restaurant-Profile und Speisekarten",
      description: "MNYRA zeigt Restaurant-Profile und Speisekarten als schnelle öffentliche Website ohne App-Blocker.",
      canonicalPath: "/",
      image: FALLBACK_OG_IMAGE
    });
    return;
  }

  const slugLabel = formatSlugLabel(route.slug);
  if (refs.routeLabel) {
    refs.routeLabel.textContent = route.surface === "menu"
      ? "MNYRA Public Menu"
      : "MNYRA Public Profile";
  }
  if (refs.heroTitle) {
    refs.heroTitle.textContent = route.surface === "menu"
      ? `Speisekarte von ${slugLabel}`
      : `${slugLabel} auf MNYRA`;
  }
  if (refs.heroDescription) {
    refs.heroDescription.textContent = route.surface === "menu"
      ? "Öffentliche Menüansicht lädt als leichte Website und bleibt visuell stabil."
      : "Öffentliches Profil lädt als leichte Website und bleibt visuell stabil.";
  }

  const profilePath = `/${encodeURIComponent(route.slug)}`;
  const menuPath = `${profilePath}/menu`;

  if (refs.profileLink) refs.profileLink.href = profilePath;
  if (refs.menuLink) refs.menuLink.href = menuPath;
  setLinkVisibility(refs.profileLink, route.surface === "menu");
  setLinkVisibility(refs.menuLink, route.surface !== "menu");

  const appUrl = new URL(route.surface === "menu" ? menuPath : profilePath, window.location.origin);
  appUrl.searchParams.set("app", "1");

  const incomingParams = new URLSearchParams(window.location.search || "");
  ["src", "source", "menuAccessSource", "table", "tableNumber", "t"].forEach((key) => {
    const value = asText(incomingParams.get(key));
    if (!value) return;
    const mappedKey = key === "source" ? "src" : key;
    if (!appUrl.searchParams.has(mappedKey)) {
      appUrl.searchParams.set(mappedKey, value);
    }
  });
  if (refs.appLink) {
    refs.appLink.href = `${appUrl.pathname}${appUrl.search}`;
  }

  updateSeoMeta({
    title: route.surface === "menu"
      ? `Speisekarte | ${slugLabel} | MNYRA`
      : `${slugLabel} | MNYRA Restaurant-Profil`,
    description: route.surface === "menu"
      ? `${slugLabel}: öffentliche Speisekarte mit stabiler, schneller Erstansicht.`
      : `${slugLabel}: öffentliches Restaurant-Profil mit schneller Erstansicht.`,
    canonicalPath: route.surface === "menu" ? menuPath : profilePath,
    image: FALLBACK_OG_IMAGE
  });
}

function renderMenuItems(refs, items = []) {
  if (!refs.menuList) return;
  refs.menuList.textContent = "";
  if (!Array.isArray(items) || !items.length) {
    const empty = document.createElement("li");
    empty.className = "placeholder";
    empty.textContent = "Noch keine öffentlichen Menüeinträge gefunden.";
    refs.menuList.appendChild(empty);
    return;
  }
  items.slice(0, 10).forEach((row) => {
    const item = row && typeof row === "object" ? row : {};
    const name = asText(item.name, "Menüeintrag");
    const category = asText(item.category || item.menuSection || item.type);
    const price = asText(item.price);

    const li = document.createElement("li");
    const main = document.createElement("div");
    main.className = "item-main";

    const title = document.createElement("span");
    title.className = "item-name";
    title.textContent = name;

    const sub = document.createElement("span");
    sub.className = "item-sub";
    sub.textContent = category || "Menü";

    main.appendChild(title);
    main.appendChild(sub);
    li.appendChild(main);

    const side = document.createElement("span");
    side.className = "item-side";
    side.textContent = price || "";
    li.appendChild(side);

    refs.menuList.appendChild(li);
  });
}

function renderPosts(refs, items = []) {
  if (!refs.postsList) return;
  refs.postsList.textContent = "";
  if (!Array.isArray(items) || !items.length) {
    const empty = document.createElement("li");
    empty.className = "placeholder";
    empty.textContent = "Noch keine öffentlichen Beiträge gefunden.";
    refs.postsList.appendChild(empty);
    return;
  }
  items.slice(0, 8).forEach((row) => {
    const item = row && typeof row === "object" ? row : {};
    const text = asText(item.caption || item.content, "Beitrag ohne Text");
    const likes = asCount(item.likes, 0);
    const comments = asCount(item.comments, 0);

    const li = document.createElement("li");
    const main = document.createElement("div");
    main.className = "item-main";

    const title = document.createElement("span");
    title.className = "item-name";
    title.textContent = text.length > 88 ? `${text.slice(0, 85)}...` : text;

    const sub = document.createElement("span");
    sub.className = "item-sub";
    sub.textContent = `${likes} Likes · ${comments} Kommentare`;

    main.appendChild(title);
    main.appendChild(sub);
    li.appendChild(main);

    refs.postsList.appendChild(li);
  });
}

function applyPublicPayload(route, refs, payload = null) {
  const data = payload && typeof payload === "object" ? payload : {};
  const publicRoute = data.publicRoute && typeof data.publicRoute === "object" ? data.publicRoute : {};
  const identity = publicRoute.identity && typeof publicRoute.identity === "object" ? publicRoute.identity : {};
  const snapshot = publicRoute.businessSnapshot && typeof publicRoute.businessSnapshot === "object"
    ? publicRoute.businessSnapshot
    : {};
  const restaurants = Array.isArray(data.restaurants) ? data.restaurants : [];
  const restaurantPreview = restaurants[0] && typeof restaurants[0] === "object" ? restaurants[0] : {};

  const businessName = asText(
    identity.name
    || restaurantPreview.name
    || restaurantPreview.restaurantName
    || formatSlugLabel(route.slug)
  );
  const businessHandle = asText(identity.handle || restaurantPreview.handle || route.slug);
  const businessBio = asText(
    identity.bio
    || snapshot.identity?.bio
    || "Öffentliches Profil geladen."
  );
  const logoUrl = asText(identity.avatar || restaurantPreview.logoUrl, "/apps/menyra-social/assets/icon-192.png");

  const postsCount = asCount(publicRoute.posts?.count || snapshot.posts?.count, 0);
  const menuCount = asCount(publicRoute.menu?.count || snapshot.menu?.count, 0);
  const focusCount = asCount(publicRoute.focus?.count || snapshot.focus?.count, 0);

  if (refs.businessName) refs.businessName.textContent = businessName;
  if (refs.businessHandle) refs.businessHandle.textContent = businessHandle.startsWith("@") ? businessHandle : `@${businessHandle}`;
  if (refs.businessBio) refs.businessBio.textContent = businessBio;
  if (refs.brandLogo) {
    refs.brandLogo.src = logoUrl;
    refs.brandLogo.alt = `${businessName} Logo`;
  }
  if (refs.postsCount) refs.postsCount.textContent = String(postsCount);
  if (refs.menuCount) refs.menuCount.textContent = String(menuCount);
  if (refs.focusCount) refs.focusCount.textContent = String(focusCount);

  if (refs.menuPanel) refs.menuPanel.hidden = false;
  if (refs.postsPanel) refs.postsPanel.hidden = false;

  renderMenuItems(refs, snapshot.menu?.items || []);
  renderPosts(refs, snapshot.posts?.items || []);

  const canonicalPath = route.surface === "menu"
    ? route.canonicalPath
    : (asText(publicRoute.canonicalPublicPath) || route.canonicalPath);
  const seoTitle = route.surface === "menu"
    ? `Speisekarte | ${businessName} | MNYRA`
    : `${businessName} | MNYRA Restaurant-Profil`;
  const seoDescription = route.surface === "menu"
    ? `Speisekarte von ${businessName} auf MNYRA. Öffentliche Ansicht mit stabiler Erstansicht.`
    : `${businessName} auf MNYRA. Öffentliches Profil mit stabiler Erstansicht und schneller Ladezeit.`;

  updateSeoMeta({
    title: seoTitle,
    description: seoDescription,
    canonicalPath,
    image: logoUrl || FALLBACK_OG_IMAGE
  });

  if (refs.heroTitle) {
    refs.heroTitle.textContent = route.surface === "menu"
      ? `Speisekarte von ${businessName}`
      : `${businessName} auf MNYRA`;
  }
  if (refs.heroDescription) {
    refs.heroDescription.textContent = route.surface === "menu"
      ? "Website-First aktiv: öffentliche Speisekarte zuerst stabil, App optional danach."
      : "Website-First aktiv: öffentliches Profil zuerst stabil, App optional danach.";
  }
}

function scheduleAppModulePreload(route) {
  if (!route || route.kind !== "business") return;
  const preloadHref = `/apps/menyra-social/social-app.js?v=${APP_BUILD_TOKEN}`;
  const runPreload = () => {
    if (document.querySelector(`link[rel="modulepreload"][href="${preloadHref}"]`)) return;
    const link = document.createElement("link");
    link.rel = "modulepreload";
    link.href = preloadHref;
    document.head.appendChild(link);
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => runPreload(), { timeout: 4500 });
    return;
  }
  window.setTimeout(runPreload, 1800);
}

async function fetchPublicPayload(route) {
  if (!route || route.kind !== "business") return null;
  const url = new URL(BOOTSTRAP_ENDPOINT, window.location.origin);
  url.searchParams.set("r", route.slug);
  url.searchParams.set("top", route.surface === "menu" ? "menu" : "profile");
  url.searchParams.set("pathname", asText(window.location.pathname, "/"));

  const incoming = new URLSearchParams(window.location.search || "");
  ["src", "source", "menuAccessSource", "table", "tableNumber", "t"].forEach((key) => {
    const value = asText(incoming.get(key));
    if (!value) return;
    const mappedKey = key === "source" ? "src" : key;
    if (!url.searchParams.has(mappedKey)) {
      url.searchParams.set(mappedKey, value);
    }
  });

  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = window.setTimeout(() => controller?.abort(), 3800);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      signal: controller?.signal
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const data = payload && typeof payload === "object" ? payload.data : null;
    if (!data || typeof data !== "object") return null;
    const publicRoute = data.publicRoute;
    if (!publicRoute || typeof publicRoute !== "object" || !asText(publicRoute.restaurantId)) {
      return null;
    }
    return data;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

async function main() {
  const refs = createRefs();
  const route = readPublicRoute();
  applyRouteChrome(route, refs);

  if (route.kind !== "business") {
    setStatus(refs, "Public Home aktiv.", {
      hint: "Direkte Business-Routen werden als leichte HTML-first Ansicht geladen."
    });
    return;
  }

  window.__MENYRA_SOCIAL_PUBLIC_LAYER__ = {
    active: true,
    route,
    build: PUBLIC_BUILD_TOKEN
  };

  setStatus(refs, "Business-Daten werden geladen ...", {
    hint: "Kein localStorage-Snapshot-Replay vor dem ersten sichtbaren Zustand."
  });

  const data = await fetchPublicPayload(route);
  if (data) {
    applyPublicPayload(route, refs, data);
    setStatus(refs, "Business-Daten geladen.", {
      hint: "Public-Render stabil. App wird bei Bedarf separat geladen."
    });
    scheduleAppModulePreload(route);
    return;
  }

  setStatus(refs, "Public-Daten aktuell nicht erreichbar.", {
    isError: true,
    hint: "Die stabile HTML-Basis bleibt sichtbar. Vollansicht ist weiter über den App-Link erreichbar."
  });
  scheduleAppModulePreload(route);
}

void main();

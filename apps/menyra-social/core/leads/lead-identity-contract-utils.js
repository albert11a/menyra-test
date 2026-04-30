function asLeadText(value = "") {
  return String(value || "").trim();
}

export function normalizeLeadRouteSlug(value = "") {
  let slug = asLeadText(value).toLowerCase();
  if (!slug) return "";
  try {
    if (typeof slug.normalize === "function") {
      slug = slug.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }
  } catch {}
  return slug
    .replace(/&/g, " and ")
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export function routeBelongsToSameRestaurant(routeDoc = {}, restaurantId = "") {
  const safeRestaurantId = asLeadText(restaurantId);
  if (!safeRestaurantId) return false;
  const data = typeof routeDoc?.data === "function"
    ? routeDoc.data() || {}
    : (routeDoc?.data && typeof routeDoc.data === "object" ? routeDoc.data : routeDoc || {});
  const routeRestaurantId = asLeadText(data.restaurantId || data.canonicalRestaurantId || data.restaurantIdCanonical);
  return !!routeRestaurantId && routeRestaurantId === safeRestaurantId;
}

export function isExistingLeadUpdate(input = {}) {
  const source = input?.lead && typeof input.lead === "object" ? input.lead : input;
  const mode = asLeadText(input?.mode || source?.mode).toLowerCase();
  return !!asLeadText(source?.id || source?.leadId) || mode === "edit" || mode === "update";
}

export function resolveExistingRestaurantForLead(state = {}, lead = {}) {
  const restaurants = Array.isArray(state?.restaurants) ? state.restaurants : [];
  const directIds = [
    lead?.restaurantId,
    lead?.landingRestaurantId,
    lead?.restaurant,
    lead?.restaurantDocId
  ].map(asLeadText).filter(Boolean);
  for (const id of directIds) {
    const match = restaurants.find((row) => asLeadText(row?.id) === id);
    if (match) return match;
  }

  const leadId = asLeadText(lead?.id || lead?.leadId);
  if (leadId) {
    const byLeadId = restaurants.find((row) => asLeadText(row?.leadId) === leadId);
    if (byLeadId) return byLeadId;
  }

  return null;
}

export function resolveStableLeadIdentity({ state = {}, lead = {}, mode = "" } = {}) {
  const existingRestaurant = resolveExistingRestaurantForLead(state, lead);
  const existingUpdate = isExistingLeadUpdate({ lead, mode });
  const existingLeadId = asLeadText(lead?.id || lead?.leadId);
  const pendingLeadId = asLeadText(state?.leadModal?.pendingLeadId || lead?.pendingLeadId);
  const leadId = existingLeadId || pendingLeadId;

  const directRestaurantId = asLeadText(
    lead?.restaurantId
    || lead?.landingRestaurantId
    || lead?.restaurant
    || lead?.restaurantDocId
  );
  const linkedRestaurantId = asLeadText(existingRestaurant?.id);
  const pendingRestaurantId = asLeadText(state?.leadModal?.pendingRestaurantId || lead?.pendingRestaurantId);
  const restaurantId = directRestaurantId || linkedRestaurantId || pendingRestaurantId;

  return {
    isExistingUpdate: existingUpdate,
    isCreate: !existingUpdate,
    existingLeadId,
    pendingLeadId,
    leadId,
    directRestaurantId,
    linkedRestaurantId,
    pendingRestaurantId,
    restaurantId,
    existingRestaurant,
    hasExistingRestaurantId: !!(directRestaurantId || linkedRestaurantId)
  };
}

export function getStableLeadSlug(lead = {}, restaurant = null) {
  return normalizeLeadRouteSlug(
    lead?.publicSlug
    || lead?.landingSlug
    || restaurant?.publicSlug
    || restaurant?.landingSlug
    || ""
  );
}

export function shouldPreserveExistingSlug(existingLeadOrRestaurant = {}, payload = {}) {
  const source = existingLeadOrRestaurant && typeof existingLeadOrRestaurant === "object"
    ? existingLeadOrRestaurant
    : {};
  const lead = source.lead || source;
  const restaurant = source.restaurant || null;
  const slugChangedExplicitly = payload?.slugChangedExplicitly === true;
  return !slugChangedExplicitly && !!getStableLeadSlug(lead, restaurant);
}

export function shouldClaimRouteForLead({
  isCreate = false,
  hasExistingValidRoute = false,
  slugChangedExplicitly = false
} = {}) {
  return !!isCreate || !!slugChangedExplicitly || !hasExistingValidRoute;
}

export async function findNextAvailableSlugOnlyForDifferentRestaurant({
  restaurantId = "",
  businessName = "",
  leadId = "",
  baseSlug = "",
  resolveLeadLandingSlugUnique = null,
  buildLeadLandingSlug = null
} = {}) {
  const safeRestaurantId = asLeadText(restaurantId);
  const safeLeadId = asLeadText(leadId);
  const safeBusinessName = asLeadText(businessName);
  const safeBaseSlug = normalizeLeadRouteSlug(baseSlug || safeBusinessName || safeRestaurantId || safeLeadId || "business");
  if (typeof resolveLeadLandingSlugUnique === "function") {
    return resolveLeadLandingSlugUnique(safeRestaurantId, {
      businessName: safeBusinessName || safeBaseSlug,
      leadId: safeLeadId
    });
  }
  if (typeof buildLeadLandingSlug === "function") {
    return buildLeadLandingSlug(safeRestaurantId, {
      businessName: safeBusinessName || safeBaseSlug,
      leadId: safeLeadId
    });
  }
  return safeBaseSlug || "business";
}

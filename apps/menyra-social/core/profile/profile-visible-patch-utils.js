function hasText(value = "") {
  return String(value || "").trim().length > 0;
}

function pickText(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

function pickCount(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) return value.length;
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric >= 0) {
      return Math.max(0, Math.round(numeric));
    }
  }
  return undefined;
}

function assignText(patch, key, value = "") {
  const text = String(value || "").trim();
  if (!text) return;
  patch[key] = text;
}

export function buildBusinessProfileVisiblePatch(data = {}, current = {}, {
  includeIdentityTruthState = false
} = {}) {
  const source = data && typeof data === "object" ? data : {};
  const fallback = current && typeof current === "object" ? current : {};
  const patch = {};

  assignText(patch, "name", pickText(
    source.name,
    source.restaurantName,
    source.displayName,
    source.businessName
  ));
  assignText(patch, "avatar", pickText(
    source.logoUrl,
    source.logoURL,
    source.logo,
    source.avatarUrl,
    source.avatarURL,
    source.avatar,
    source.photoURL,
    source.photoUrl,
    source.imageUrl,
    source.imageURL,
    source.image,
    source.coverLogoUrl
  ));

  const titleImageUrl = pickText(
    source.titleImageUrl,
    source.coverImageUrl,
    source.coverUrl,
    source.heroUrl
  );
  const coverImageUrl = pickText(
    source.coverImageUrl,
    source.titleImageUrl,
    source.coverUrl,
    source.heroUrl
  );
  const coverUrl = pickText(
    source.coverUrl,
    source.titleImageUrl,
    source.coverImageUrl,
    source.heroUrl
  );
  const heroUrl = pickText(
    source.heroUrl,
    source.titleImageUrl,
    source.coverImageUrl,
    source.coverUrl
  );
  assignText(patch, "titleImageUrl", titleImageUrl);
  assignText(patch, "coverImageUrl", coverImageUrl);
  assignText(patch, "coverUrl", coverUrl);
  assignText(patch, "heroUrl", heroUrl);
  if (Array.isArray(source.coverImages)) {
    patch.coverImages = source.coverImages;
  }

  assignText(patch, "bio", pickText(source.bio, source.description, source.about));
  assignText(patch, "location", pickText(source.city, source.location, source.address));
  assignText(patch, "place", pickText(
    source.place,
    source.locationPlace,
    source.locality,
    source.district
  ));
  assignText(patch, "locationPlace", pickText(
    source.locationPlace,
    source.place,
    source.locality,
    source.district
  ));
  assignText(patch, "address", pickText(source.address));
  assignText(patch, "phone", pickText(source.phone, source.telephone, source.contactPhone));
  assignText(patch, "instagram", pickText(source.instagram, source.insta));
  assignText(patch, "instagramUrl", pickText(source.instagramUrl));
  assignText(patch, "tiktok", pickText(source.tiktok, source.tikTok));
  assignText(patch, "tiktokUrl", pickText(source.tiktokUrl, source.tikTokUrl));

  const followers = pickCount(source.followersCount, source.followers, source.fansCount, source.fans);
  const following = pickCount(source.followingCount, source.following);
  if (followers !== undefined) patch.followers = followers;
  if (following !== undefined) patch.following = following;

  if (includeIdentityTruthState) {
    const hasIdentity = hasText(patch.name || fallback.name)
      || hasText(patch.avatar || fallback.avatar);
    patch.identityTruthState = hasIdentity
      ? "ready"
      : (String(fallback.identityTruthState || "").trim() || "loading");
  }

  return patch;
}

export function buildProfileCoverImagesSignature(profile = {}) {
  if (!Array.isArray(profile?.coverImages)) return "";
  return profile.coverImages
    .map((item) => {
      if (item && typeof item === "object") {
        return String(item.url || item.src || item.imageUrl || item.id || "").trim();
      }
      return String(item || "").trim();
    })
    .filter(Boolean)
    .join("|");
}

export function normalizeEmailValueCore(value) {
  return String(value || "").trim().toLowerCase();
}

export function getRestaurantEmailCandidatesCore(rest = {}) {
  return [
    rest.ownerEmail,
    rest.email,
    rest.contactEmail,
    rest.socialEmail,
    rest.loginEmail,
    rest.accountEmail,
    rest?.owner?.email,
    rest?.contact?.email,
    rest?.account?.email
  ].map((item) => String(item || "").trim()).filter(Boolean);
}

export function getRestaurantUidCandidatesCore(rest = {}) {
  return [
    rest.ownerUid,
    rest.socialUid,
    rest.uid,
    rest.userUid,
    rest.accountUid,
    rest.ownerId
  ].map((item) => String(item || "").trim()).filter(Boolean);
}

export function matchesRestaurantIdentityCore(rest, { uid = "", email = "" } = {}, {
  getRestaurantUidCandidatesFn,
  normalizeEmailValueFn,
  getRestaurantEmailCandidatesFn
} = {}) {
  const getRestaurantUidCandidates = typeof getRestaurantUidCandidatesFn === "function"
    ? getRestaurantUidCandidatesFn
    : getRestaurantUidCandidatesCore;
  const normalizeEmailValue = typeof normalizeEmailValueFn === "function"
    ? normalizeEmailValueFn
    : normalizeEmailValueCore;
  const getRestaurantEmailCandidates = typeof getRestaurantEmailCandidatesFn === "function"
    ? getRestaurantEmailCandidatesFn
    : getRestaurantEmailCandidatesCore;
  if (!rest) return false;
  const uidKey = String(uid || "").trim();
  if (uidKey) {
    const byUid = getRestaurantUidCandidates(rest).some((candidate) => candidate === uidKey);
    if (byUid) return true;
  }
  const emailKey = normalizeEmailValue(email);
  if (emailKey) {
    const byEmail = getRestaurantEmailCandidates(rest).some((candidate) => normalizeEmailValue(candidate) === emailKey);
    if (byEmail) return true;
  }
  return false;
}

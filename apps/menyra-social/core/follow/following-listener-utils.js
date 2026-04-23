export function mapFollowingSnapshotCore({
  snap,
  normalizeFollowHandle
} = {}) {
  const normalizeHandle = typeof normalizeFollowHandle === "function"
    ? normalizeFollowHandle
    : ((value) => String(value || "").trim());
  const handles = [];
  const targetIds = [];
  snap?.forEach((docSnap) => {
    const data = docSnap.data() || {};
    const handle = normalizeHandle(data.handle || data.targetHandle || "");
    if (handle) handles.push(handle);
    const targetId = String(data.targetId || "").trim();
    if (targetId) targetIds.push(targetId);
  });
  return { handles, targetIds };
}

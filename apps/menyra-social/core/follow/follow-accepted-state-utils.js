export function buildFollowAcceptedFollowingStateCore({
  notif = {},
  followingHandles = [],
  followingTargetIds = [],
  normalizeFollowHandle
} = {}) {
  const normalizeHandle = typeof normalizeFollowHandle === "function"
    ? normalizeFollowHandle
    : ((value) => String(value || "").trim());
  const acceptedHandle = normalizeHandle(notif?.userHandle || "");
  const acceptedUid = String(notif?.userUid || "").trim();
  return {
    handles: acceptedHandle
      ? [acceptedHandle, ...(Array.isArray(followingHandles) ? followingHandles : [])]
      : (Array.isArray(followingHandles) ? followingHandles : []),
    targetIds: [
      acceptedUid,
      ...(Array.isArray(followingTargetIds) ? followingTargetIds : [])
    ]
  };
}

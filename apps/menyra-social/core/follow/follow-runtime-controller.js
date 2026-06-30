import { mapFollowingSnapshotCore } from "./following-listener-utils.js";
import {
  createProfileTargetTransaction,
  resolveProfileTargetKeyFromProfile
} from "../profile/profile-target-transaction.js";

export function createFollowRuntimeController(deps = {}) {
  const state = deps.state;
  const db = deps.db || null;
  const safeStorage = deps.safeStorageObj || {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
  const collection = typeof deps.collectionFn === "function" ? deps.collectionFn : null;
  const onSnapshot = typeof deps.onSnapshotFn === "function" ? deps.onSnapshotFn : null;
  const followingKey = typeof deps.followingKeyFn === "function" ? deps.followingKeyFn : (() => "");
  const normalizeFollowHandle = typeof deps.normalizeFollowHandleFn === "function"
    ? deps.normalizeFollowHandleFn
    : ((value) => String(value || "").replace(/^@/, "").trim().toLowerCase());
  const render = typeof deps.renderFn === "function" ? deps.renderFn : (() => {});
  const renderOverlays = typeof deps.renderOverlaysFn === "function" ? deps.renderOverlaysFn : (() => {});
  const getLastRenderMode = typeof deps.getLastRenderModeFn === "function"
    ? deps.getLastRenderModeFn
    : (() => "");
  const profileTransaction = createProfileTargetTransaction({
    state,
    render
  });
  const patchVisibleProfileIfCurrent = profileTransaction.patchVisibleProfileIfCurrent;

  let followingUnsub = null;

  if (!state) {
    return {
      saveFollowing: () => {},
      getFollowDocId: (_targetType = "", targetId = "", handle = "") => `${targetId || handle}`,
      applyFollowingHandles: () => {},
      startFollowingListener: () => {},
      stopFollowingListener: () => {},
      isFollowingProfile: () => false
    };
  }

  function saveFollowing(handles, targetIds = state.followingTargetIds) {
    if (!Array.isArray(handles)) return;
    try {
      const uid = state.user?.uid || "";
      if (!uid) return;
      const payload = {
        handles: handles.slice(0, 500),
        targetIds: (Array.isArray(targetIds) ? targetIds : [])
          .map((id) => String(id || "").trim())
          .filter(Boolean)
          .slice(0, 500)
      };
      safeStorage.setItem(followingKey(uid), JSON.stringify(payload));
    } catch {}
  }

  function getFollowDocId(targetType, targetId, handle) {
    return `${targetType || "handle"}_${targetId || handle}`;
  }

  function applyFollowingHandles(handles, { shouldRender = true, targetIds = state.followingTargetIds } = {}) {
    const nextHandles = Array.from(new Set(
      (Array.isArray(handles) ? handles : [])
        .map((item) => normalizeFollowHandle(item))
        .filter(Boolean)
    ));
    const nextTargetIds = Array.from(new Set(
      (Array.isArray(targetIds) ? targetIds : [])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    ));
    const prevKey = (Array.isArray(state.followingHandles) ? state.followingHandles : []).join("|");
    const prevIdsKey = (Array.isArray(state.followingTargetIds) ? state.followingTargetIds : []).join("|");
    const nextKey = nextHandles.join("|");
    const nextIdsKey = nextTargetIds.join("|");
    state.followingHandles = nextHandles;
    state.followingTargetIds = nextTargetIds;
    state.pendingFollowRequests = (Array.isArray(state.pendingFollowRequests) ? state.pendingFollowRequests : [])
      .map((handle) => normalizeFollowHandle(handle))
      .filter((handle) => handle && !nextHandles.includes(handle));
    if (state.profileModal?.profile) {
      const modalHandle = normalizeFollowHandle(state.profileModal.profile.handle || "");
      if (modalHandle && nextHandles.includes(modalHandle)) {
        state.profileModal.profile.pendingFollowRequest = false;
      }
    }
    if (state.profileView?.profile) {
      const viewHandle = normalizeFollowHandle(state.profileView.profile.handle || "");
      if (viewHandle && nextHandles.includes(viewHandle)) {
        patchVisibleProfileIfCurrent(
          resolveProfileTargetKeyFromProfile(state.profileView.profile, state.profileView),
          { profile: { pendingFollowRequest: false } }
        );
      }
    }
    saveFollowing(nextHandles, nextTargetIds);
    if (!shouldRender || (prevKey === nextKey && prevIdsKey === nextIdsKey)) return;
    if (getLastRenderMode() === "main") {
      render();
      return;
    }
    if (state.profileModal?.open && !state.profileView) {
      renderOverlays();
      return;
    }
    if (state.profileView) {
      render();
    }
  }

  function stopFollowingListener() {
    if (!followingUnsub) return;
    try {
      followingUnsub();
    } catch {}
    followingUnsub = null;
  }

  function startFollowingListener(user = state.user) {
    stopFollowingListener();
    if (!db || !collection || !onSnapshot) return;
    const ownerUid = String(user?.uid || "").trim();
    if (!ownerUid) return;
    const ref = collection(db, "users", ownerUid, "following");
    followingUnsub = onSnapshot(ref, (snap) => {
      const { handles, targetIds } = mapFollowingSnapshotCore({
        snap,
        normalizeFollowHandle: (value) => normalizeFollowHandle(value)
      });
      applyFollowingHandles(handles, { targetIds });
    }, (err) => {
      console.error(`[mnyra][firestore.listen.following] users/${ownerUid}/following`, err);
    });
  }

  function isFollowingProfile(profile = {}) {
    const uid = String(profile?.uid || "").trim();
    if (uid && state.followingTargetIds.includes(uid)) return true;
    const restaurantId = String(profile?.restaurantId || "").trim();
    if (restaurantId && state.followingTargetIds.includes(restaurantId)) return true;
    const followKey = normalizeFollowHandle(profile?.handle || "");
    return !!(followKey && state.followingHandles.includes(followKey));
  }

  return {
    saveFollowing,
    getFollowDocId,
    applyFollowingHandles,
    startFollowingListener,
    stopFollowingListener,
    isFollowingProfile
  };
}

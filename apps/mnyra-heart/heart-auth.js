import {
  auth,
  db
} from "/shared/firebase-config.js";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  ALBERT_CEO_UID,
  canAccessHeartAsCeo,
  normalizeRoleList
} from "/shared/ceo-access.js";

function buildAuthState(user, userProfile) {
  return {
    user,
    userProfile,
    roleSwitchRoles: normalizeRoleList(userProfile?.roles || userProfile?.role || "")
  };
}

export function createHeartAuthController({ store }) {
  const actions = store.actions;
  let unsubscribe = null;

  async function ensurePersistence() {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch {}
  }

  async function loadUserProfile(user) {
    if (!user?.uid) return null;
    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) {
        return {
          uid: user.uid,
          email: user.email || "",
          ...userSnap.data()
        };
      }
    } catch (error) {
      console.error("[mnyra-heart] failed to load user profile", error);
    }
    return {
      uid: user.uid,
      email: user.email || "",
      roles: [],
      role: ""
    };
  }

  async function evaluateAccess(user) {
    if (!user) {
      actions.setAuthGuest();
      return;
    }
    const profile = await loadUserProfile(user);
    const authState = buildAuthState(user, profile);
    const allowed = canAccessHeartAsCeo(authState);
    if (!allowed) {
      actions.setAuthDenied(user, profile, "CEO access required.");
      return;
    }
    actions.setAuthReady(user, profile, user.uid === ALBERT_CEO_UID ? "global-ceo" : "role-ceo");
  }

  async function initialize() {
    await ensurePersistence();
    actions.setAuthChecking();
    unsubscribe = onAuthStateChanged(auth, async (user) => {
      actions.setAuthChecking();
      try {
        await evaluateAccess(user);
      } catch (error) {
        console.error("[mnyra-heart] auth init failed", error);
      actions.setAuthError(error?.message || "Anmeldung konnte nicht geprueft werden.");
      }
    }, (error) => {
      actions.setAuthError(error?.message || "Anmelde-Listener ist fehlgeschlagen.");
    });
  }

  async function login(email, password) {
    actions.setAuthSigningIn();
    await ensurePersistence();
    const credential = await signInWithEmailAndPassword(auth, String(email || "").trim(), String(password || ""));
    await evaluateAccess(credential.user);
  }

  async function logout() {
    await signOut(auth);
    actions.setAuthGuest();
  }

  async function getIdToken(forceRefresh = false) {
    if (!auth.currentUser) return "";
    return auth.currentUser.getIdToken(forceRefresh);
  }

  function destroy() {
    if (typeof unsubscribe === "function") unsubscribe();
  }

  return {
    initialize,
    login,
    logout,
    getIdToken,
    destroy,
    auth,
    db,
    projectId: auth.app?.options?.projectId || ""
  };
}

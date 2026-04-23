export function createAuthProfileResolutionRuntimeController({
  state = null,
  db = null,
  collectionFn = null,
  queryFn = null,
  whereFn = null,
  limitFn = null,
  docFn = null,
  getDocFn = async () => null,
  getDocsFn = async () => null,
  setDocFn = async () => {},
  serverTimestampFn = () => null,
  mergeRestaurants = (existing = []) => existing,
  matchesRestaurantIdentity = () => false,
  normalizeEmailValue = (value = "") => String(value || "").trim().toLowerCase(),
  normalizeRoleList = (value = []) => (Array.isArray(value) ? value : []),
  normalizeLeadLocations = (value = []) => (Array.isArray(value) ? value : []),
  getPrimaryLeadLocation = () => ({}),
  hasLeadLocationCoords = () => false,
  resolveCustomerType = (value = "") => String(value || "").trim(),
  resolveRestaurantStatusFromLead = (leadStatus = "", currentStatus = "") => String(leadStatus || currentStatus || "").trim(),
  ensureRestaurantPublicMeta = async () => {},
  isRestaurantMarkedDeleted = () => false,
  roleSwitchOrder = [],
  render = () => {},
  updateShellDom = () => {},
  updateFeedDom = () => false,
  refreshSearchView = () => false,
  getLastRenderMode = () => ""
} = {}) {
  const collection = typeof collectionFn === "function" ? collectionFn : null;
  const query = typeof queryFn === "function" ? queryFn : null;
  const where = typeof whereFn === "function" ? whereFn : null;
  const limit = typeof limitFn === "function" ? limitFn : null;
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const getDoc = typeof getDocFn === "function" ? getDocFn : (async () => null);
  const getDocs = typeof getDocsFn === "function" ? getDocsFn : (async () => null);
  const setDoc = typeof setDocFn === "function" ? setDocFn : (async () => {});
  const serverTimestamp = typeof serverTimestampFn === "function" ? serverTimestampFn : (() => null);
  const mergeRestaurantRows = typeof mergeRestaurants === "function"
    ? mergeRestaurants
    : ((existing = [], next = []) => existing.concat(next));
  const matchesIdentity = typeof matchesRestaurantIdentity === "function"
    ? matchesRestaurantIdentity
    : (() => false);
  const normalizeEmail = typeof normalizeEmailValue === "function"
    ? normalizeEmailValue
    : ((value = "") => String(value || "").trim().toLowerCase());
  const normalizeRoles = typeof normalizeRoleList === "function"
    ? normalizeRoleList
    : (() => []);
  const normalizeLocations = typeof normalizeLeadLocations === "function"
    ? normalizeLeadLocations
    : ((value = []) => (Array.isArray(value) ? value : []));
  const readPrimaryLeadLocation = typeof getPrimaryLeadLocation === "function"
    ? getPrimaryLeadLocation
    : (() => ({}));
  const hasLeadCoords = typeof hasLeadLocationCoords === "function"
    ? hasLeadLocationCoords
    : (() => false);
  const resolveType = typeof resolveCustomerType === "function"
    ? resolveCustomerType
    : ((value = "") => String(value || "").trim());
  const resolveRestaurantStatus = typeof resolveRestaurantStatusFromLead === "function"
    ? resolveRestaurantStatusFromLead
    : ((leadStatus = "", currentStatus = "") => String(leadStatus || currentStatus || "").trim());
  const ensurePublicMeta = typeof ensureRestaurantPublicMeta === "function"
    ? ensureRestaurantPublicMeta
    : (async () => {});
  const isRestaurantDeleted = typeof isRestaurantMarkedDeleted === "function"
    ? isRestaurantMarkedDeleted
    : (() => false);
  const readLastRenderMode = typeof getLastRenderMode === "function"
    ? getLastRenderMode
    : (() => "");
  const roleOrder = Array.isArray(roleSwitchOrder) ? roleSwitchOrder : [];

  function getRestaurantRows() {
    return Array.isArray(state?.restaurants) ? state.restaurants : [];
  }

  function refreshRoleSwitchUi() {
    if (readLastRenderMode() === "main") {
      updateShellDom();
      if (state?.activeTab === "search" && refreshSearchView()) return;
      if (state?.activeTab === "feed") {
        const updatedFeed = updateFeedDom();
        if (!updatedFeed) render();
        return;
      }
    }
    render();
  }

  async function scanRestaurantsForMatch(matchFn, { max = 25 } = {}) {
    if (!collection || !query || !limit || !getDocs || !db) return null;
    try {
      const snap = await getDocs(query(collection(db, "restaurants"), limit(max)));
      if (snap.empty) return null;
      const rows = snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }));
      if (rows.length && state) {
        state.restaurants = mergeRestaurantRows(getRestaurantRows(), rows);
      }
      return rows.find((row) => !isRestaurantDeleted(row) && matchFn(row)) || null;
    } catch {}
    return null;
  }

  async function queryRestaurantByField(field, value) {
    const needle = String(value || "").trim();
    if (!needle || !collection || !query || !where || !limit || !getDocs || !db) return null;
    try {
      const snap = await getDocs(query(collection(db, "restaurants"), where(field, "==", needle), limit(1)));
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const row = { id: docSnap.id, ...(docSnap.data() || {}) };
        if (isRestaurantDeleted(row)) return null;
        return row;
      }
    } catch {}
    return null;
  }

  async function findRestaurantByEmail(email) {
    const needle = String(email || "").trim();
    if (!needle) return null;
    const lower = needle.toLowerCase();
    const variants = lower && lower !== needle ? [needle, lower] : [needle];
    const fields = ["ownerEmail", "email", "contactEmail", "socialEmail", "loginEmail", "accountEmail"];
    for (const variant of variants) {
      for (const field of fields) {
        const restaurant = await queryRestaurantByField(field, variant);
        if (restaurant) return restaurant;
      }
    }
    const cached = getRestaurantRows().find((restaurant) => matchesIdentity(restaurant, { email: needle })) || null;
    if (cached && !isRestaurantDeleted(cached)) return cached;
    return scanRestaurantsForMatch((restaurant) => matchesIdentity(restaurant, { email: needle }));
  }

  async function findRestaurantByUid(uid) {
    const needle = String(uid || "").trim();
    if (!needle) return null;
    const fields = ["ownerUid", "socialUid", "uid", "userUid", "accountUid"];
    for (const field of fields) {
      const restaurant = await queryRestaurantByField(field, needle);
      if (restaurant) return restaurant;
    }
    const cached = getRestaurantRows().find((restaurant) => matchesIdentity(restaurant, { uid: needle })) || null;
    if (cached && !isRestaurantDeleted(cached)) return cached;
    return scanRestaurantsForMatch((restaurant) => matchesIdentity(restaurant, { uid: needle }));
  }

  async function queryLeadByField(field, value) {
    const needle = String(value || "").trim();
    if (!needle || !collection || !query || !where || !limit || !getDocs || !db) return null;
    try {
      const snap = await getDocs(query(collection(db, "leads"), where(field, "==", needle), limit(1)));
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, ...(docSnap.data() || {}) };
      }
    } catch {}
    return null;
  }

  async function scanLeadsForMatch(matchFn, { max = 25 } = {}) {
    if (!collection || !query || !limit || !getDocs || !db) return null;
    try {
      const snap = await getDocs(query(collection(db, "leads"), limit(max)));
      if (snap.empty) return null;
      const rows = snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }));
      return rows.find((row) => matchFn(row)) || null;
    } catch {}
    return null;
  }

  async function resolveLeadByEmail(email) {
    const needle = String(email || "").trim();
    if (!needle) return null;
    const lower = needle.toLowerCase();
    const variants = lower && lower !== needle ? [needle, lower] : [needle];
    for (const variant of variants) {
      const fields = ["email", "socialEmail", "ownerEmail", "loginEmail"];
      for (const field of fields) {
        const lead = await queryLeadByField(field, variant);
        if (lead) return lead;
      }
    }
    return scanLeadsForMatch((lead) => {
      const values = [lead.email, lead.socialEmail, lead.ownerEmail, lead.loginEmail];
      return values.some((item) => normalizeEmail(item) === normalizeEmail(needle));
    });
  }

  async function resolveLeadByUid(uid) {
    const needle = String(uid || "").trim();
    if (!needle) return null;
    const fields = ["socialUid", "ownerUid", "uid", "userUid"];
    for (const field of fields) {
      const lead = await queryLeadByField(field, needle);
      if (lead) return lead;
    }
    return scanLeadsForMatch((lead) => {
      const values = [lead.socialUid, lead.ownerUid, lead.uid, lead.userUid];
      return values.some((item) => String(item || "").trim() === needle);
    });
  }

  function findRestaurantByLeadId(leadId) {
    const key = String(leadId || "").trim();
    if (!key) return null;
    return getRestaurantRows().find((restaurant) => String(restaurant?.leadId || "").trim() === key) || null;
  }

  async function ensureRestaurantForLead(lead, user) {
    if (!lead || !collection || !makeDocRef || !getDoc || !setDoc || !db) return null;
    let restaurantId = lead.restaurantId || lead.restaurant || "";
    const email = lead.email || lead.socialEmail || user?.email || "";
    const ownerName = lead.contactName || lead.ownerName || lead.businessName || lead.name || "";
    if (restaurantId) {
      try {
        const restSnap = await getDoc(makeDocRef(db, "restaurants", restaurantId));
        if (restSnap.exists()) {
          const restData = restSnap.data() || {};
          const patch = {};
          if (user?.uid && !restData.ownerUid) patch.ownerUid = user.uid;
          if (email && !restData.ownerEmail) patch.ownerEmail = email;
          if (ownerName && !restData.ownerName) patch.ownerName = ownerName;
          if (Object.keys(patch).length) {
            patch.updatedAt = serverTimestamp();
            await setDoc(makeDocRef(db, "restaurants", restaurantId), patch, { merge: true });
          }
          return { id: restSnap.id, ...restData, ...patch };
        }
      } catch {}
    }

    const restRef = makeDocRef(collection(db, "restaurants"));
    restaurantId = restRef.id;
    const status = resolveRestaurantStatus(lead.status || "registered", "");
    const locations = normalizeLocations(lead.locations || [], lead.address || "", {
      lat: lead.lat ?? null,
      lng: lead.lng ?? null
    });
    const primaryLocation = readPrimaryLeadLocation(locations);
    const locationPayload = locations
      .filter((item) => item.address || hasLeadCoords(item))
      .map((item) => {
        const row = { address: item.address || "" };
        if (hasLeadCoords(item)) {
          row.lat = Number(item.lat);
          row.lng = Number(item.lng);
        }
        return row;
      });
    const restPayload = {
      name: lead.businessName || lead.name || ownerName || "Business",
      restaurantName: lead.businessName || lead.name || ownerName || "Business",
      type: resolveType(lead.customerType || lead.type || "cafe"),
      city: lead.city || "",
      address: primaryLocation.address || lead.address || "",
      phone: lead.phone || "",
      instagram: lead.instagram || lead.insta || "",
      insta: lead.instagram || lead.insta || "",
      ownerEmail: email || "",
      ownerName: ownerName || "",
      ownerUid: user?.uid || "",
      logoUrl: lead.logoUrl || lead.logo || lead.imageUrl || "",
      logo: lead.logoUrl || lead.logo || lead.imageUrl || "",
      status,
      leadId: lead.id || "",
      locations: locationPayload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdByRole: "migration"
    };
    if (hasLeadCoords(primaryLocation)) {
      restPayload.lat = Number(primaryLocation.lat);
      restPayload.lng = Number(primaryLocation.lng);
    } else if (Number.isFinite(Number(lead.lat)) && Number.isFinite(Number(lead.lng))) {
      restPayload.lat = Number(lead.lat);
      restPayload.lng = Number(lead.lng);
    }
    await setDoc(restRef, restPayload, { merge: true });
    await ensurePublicMeta(restaurantId, restPayload);
    if (lead.id) {
      await setDoc(makeDocRef(db, "leads", lead.id), {
        restaurantId,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    return { id: restaurantId, ...restPayload };
  }

  function matchesRestaurantOwner(restaurant, user) {
    if (!restaurant || !user) return false;
    if (isRestaurantDeleted(restaurant)) return false;
    return matchesIdentity(restaurant, {
      uid: String(user.uid || ""),
      email: String(user.email || "")
    });
  }

  async function resolveRestaurantForAuthUser(user, { preferCached = true } = {}) {
    if (!user || !makeDocRef || !getDoc || !db) return null;
    const uid = String(user.uid || "");
    const email = String(user.email || "").toLowerCase();
    const hintId = String(state?.userProfile?.restaurantId || "").trim();

    if (preferCached && hintId) {
      const hinted = getRestaurantRows().find((restaurant) => String(restaurant.id) === hintId) || null;
      if (hinted && matchesRestaurantOwner(hinted, user)) return hinted;
      try {
        const hintSnap = await getDoc(makeDocRef(db, "restaurants", hintId));
        if (hintSnap.exists()) {
          const hintedDoc = { id: hintSnap.id, ...(hintSnap.data() || {}) };
          if (state) {
            state.restaurants = mergeRestaurantRows(getRestaurantRows(), [hintedDoc]);
          }
          if (matchesRestaurantOwner(hintedDoc, user)) return hintedDoc;
        }
      } catch {}
    }

    if (preferCached) {
      const cached = getRestaurantRows().find((restaurant) => matchesRestaurantOwner(restaurant, user));
      if (cached) return cached;
    }

    if (uid) {
      const byUid = await findRestaurantByUid(uid);
      if (byUid && !isRestaurantDeleted(byUid)) return byUid;
    }

    if (email) {
      const byEmail = await findRestaurantByEmail(email);
      if (byEmail && !isRestaurantDeleted(byEmail)) return byEmail;
    }

    return null;
  }

  async function findOwnerRestaurantId(user) {
    if (!user || !collection || !query || !where || !limit || !getDocs || !db) return "";
    const uid = user.uid || "";
    const email = user.email || "";
    if (uid) {
      try {
        const snap = await getDocs(query(collection(db, "restaurants"), where("ownerUid", "==", uid), limit(1)));
        if (!snap.empty) return snap.docs[0].id;
      } catch {}
    }
    if (email) {
      try {
        const snap = await getDocs(query(collection(db, "restaurants"), where("ownerEmail", "==", email), limit(1)));
        if (!snap.empty) return snap.docs[0].id;
      } catch {}
    }
    return "";
  }

  async function findOwnerRestaurantFromStaffIndex(user) {
    const uid = user?.uid || "";
    if (!uid || !makeDocRef || !getDoc || !db) return "";
    try {
      const snap = await getDoc(makeDocRef(db, "staffIndex", uid));
      if (!snap.exists()) return "";
      const ids = snap.data()?.restaurantIds || [];
      for (const rid of ids.slice(0, 4)) {
        const staffSnap = await getDoc(makeDocRef(db, "restaurants", rid, "staff", uid));
        if (!staffSnap.exists()) continue;
        const row = staffSnap.data() || {};
        const roles = normalizeRoles(row.roles || row.role || "");
        if (roles.includes("owner") || roles.includes("admin")) return rid;
      }
    } catch {}
    return "";
  }

  async function resolveRoleSwitchTargets(user) {
    if (!state) return;
    if (!user) {
      state.roleSwitchRoles = [];
      state.roleSwitchRestaurantId = "";
      return;
    }

    const roles = new Set();
    const profile = state.userProfile || {};
    const profileRoles = normalizeRoles(profile.roles || profile.role || "");
    let ownerRestaurantId = profile.restaurantId || "";

    if (profileRoles.includes("ceo")) roles.add("ceo");
    if (profileRoles.includes("staff")) roles.add("staff");
    if (profileRoles.includes("owner")) roles.add("owner");
    if (String(profile.role || "").toLowerCase() === "business") roles.add("owner");

    const needsRemoteRoleCheck = !profileRoles.length;
    if (needsRemoteRoleCheck && makeDocRef && getDoc && db) {
      const [ceoSnap, staffSnap] = await Promise.all([
        getDoc(makeDocRef(db, "superadmins", user.uid)).catch(() => null),
        getDoc(makeDocRef(db, "staffAdmins", user.uid)).catch(() => null)
      ]);

      if (ceoSnap?.exists?.()) roles.add("ceo");
      if (staffSnap?.exists?.()) roles.add("staff");
    }

    if (!roles.has("owner") && profile?.restaurantId && makeDocRef && getDoc && db) {
      try {
        const staffSnap = await getDoc(makeDocRef(db, "restaurants", profile.restaurantId, "staff", user.uid));
        if (staffSnap.exists()) {
          const staffRoles = normalizeRoles(staffSnap.data()?.roles || staffSnap.data()?.role || "");
          if (staffRoles.includes("owner") || staffRoles.includes("admin")) roles.add("owner");
        }
      } catch {}
    }

    const shouldResolveOwnerRestaurant = !ownerRestaurantId && (
      roles.has("owner")
      || String(profile.role || "").toLowerCase() === "business"
      || !profileRoles.length
    );
    if (shouldResolveOwnerRestaurant && !ownerRestaurantId) {
      ownerRestaurantId = await findOwnerRestaurantId(user);
    }
    if (shouldResolveOwnerRestaurant && !ownerRestaurantId) {
      ownerRestaurantId = await findOwnerRestaurantFromStaffIndex(user);
    }
    if (ownerRestaurantId) roles.add("owner");

    state.roleSwitchRoles = roleOrder.filter((role) => roles.has(role));
    state.roleSwitchRestaurantId = ownerRestaurantId || profile.restaurantId || "";
    refreshRoleSwitchUi();
  }

  return {
    findRestaurantByUid,
    findRestaurantByEmail,
    resolveLeadByUid,
    resolveLeadByEmail,
    findRestaurantByLeadId,
    ensureRestaurantForLead,
    resolveRestaurantForAuthUser,
    resolveRoleSwitchTargets
  };
}

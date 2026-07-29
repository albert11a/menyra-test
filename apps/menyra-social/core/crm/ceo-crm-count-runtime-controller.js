import {
  normalizeCeoStaffRecordCore,
  overlayCeoStaffProfileCore,
  buildCeoDirectorySyncPatchCore,
  createEmptyCeoCrmCountsCore,
  sanitizeCeoCrmCountsCore,
  hasStoredCeoCrmCountsCore,
  resolveKnownScopeCountLabelCore,
  pickCountValueCore
} from "./ceo-staff-sync-utils.js";

export function createCeoCrmCountRuntimeController(deps = {}) {
  const {
    state,
    db,
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    setDoc,
    increment,
    serverTimestamp,
    documentId,
    uniqueStringList,
    normalizeCeoPath,
    normalizeHandle,
    normalizeCeoCountry,
    buildCeoName,
    parseCoordNumber,
    getCurrentCeoMeta,
    isCeoUser,
    hasGlobalCeoAccess,
    saveUserProfileToStorage,
    render,
    toDateSafe,
    normalizeLeadDoc,
    normalizeLeadStatusKey,
    isCustomerRestaurant,
    escapeHtml,
    dataLoaded,
    applyKnownLeadOwnershipOverrideFn,
    isHiddenLegacyCeoEmailFn
  } = deps;

  const uniqueList = typeof uniqueStringList === "function"
    ? uniqueStringList
    : ((values = []) => Array.from(new Set((values || []).map((entry) => String(entry || "").trim()).filter(Boolean))));
  const normalizePath = typeof normalizeCeoPath === "function"
    ? normalizeCeoPath
    : ((value, fallback = []) => uniqueList([...(Array.isArray(value) ? value : []), ...(fallback || [])]));
  const normalizeHandleSafe = typeof normalizeHandle === "function"
    ? normalizeHandle
    : ((value) => String(value || "").trim().toLowerCase().replace(/\s+/g, "_"));
  const normalizeCountry = typeof normalizeCeoCountry === "function"
    ? normalizeCeoCountry
    : ((value) => String(value || "").trim() || "Kosovo");
  const buildCeoNameSafe = typeof buildCeoName === "function"
    ? buildCeoName
    : (() => "CEO");
  const parseCoordNumberSafe = typeof parseCoordNumber === "function"
    ? parseCoordNumber
    : ((value) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    });
  const getCurrentMeta = typeof getCurrentCeoMeta === "function"
    ? getCurrentCeoMeta
    : (() => ({ uid: "", name: "", rootUid: "", rootName: "", parentUid: "", path: [] }));
  const isCeo = typeof isCeoUser === "function" ? isCeoUser : (() => false);
  const hasGlobalAccess = typeof hasGlobalCeoAccess === "function" ? hasGlobalCeoAccess : (() => false);
  const persistUserProfile = typeof saveUserProfileToStorage === "function" ? saveUserProfileToStorage : (() => {});
  const rerender = typeof render === "function" ? render : (() => {});
  const toDateSafeFn = typeof toDateSafe === "function" ? toDateSafe : (() => null);
  const normalizeLead = typeof normalizeLeadDoc === "function" ? normalizeLeadDoc : ((value) => value || {});
  const normalizeLeadStatus = typeof normalizeLeadStatusKey === "function"
    ? normalizeLeadStatusKey
    : ((value) => String(value || "").trim());
  const isCustomerRestaurantSafe = typeof isCustomerRestaurant === "function"
    ? isCustomerRestaurant
    : (() => false);
  const escapeHtmlSafe = typeof escapeHtml === "function"
    ? escapeHtml
    : ((value) => String(value ?? ""));
  const applyKnownLeadOwnershipOverride = typeof applyKnownLeadOwnershipOverrideFn === "function"
    ? applyKnownLeadOwnershipOverrideFn
    : ((entity = {}) => entity);
  const isHiddenLegacyCeoEmail = typeof isHiddenLegacyCeoEmailFn === "function"
    ? isHiddenLegacyCeoEmailFn
    : (() => false);
  const createEmptyCeoCrmCounts = () => createEmptyCeoCrmCountsCore();
  const sanitizeCeoCrmCounts = (raw = {}) => sanitizeCeoCrmCountsCore(raw);
  const hasStoredCeoCrmCounts = (raw = {}) => hasStoredCeoCrmCountsCore(raw);

  let ceoCrmCountsPromise = null;

  function normalizeCeoStaffRecord(record = {}, userRecord = {}) {
    return normalizeCeoStaffRecordCore(record, userRecord, {
      buildCeoNameFn: buildCeoNameSafe,
      normalizeCeoPathFn: normalizePath,
      normalizeHandleFn: normalizeHandleSafe,
      normalizeCeoCountryFn: normalizeCountry,
      hasStoredCeoCrmCountsFn: hasStoredCeoCrmCounts,
      sanitizeCeoCrmCountsFn: sanitizeCeoCrmCounts,
      parseCoordNumberFn: parseCoordNumberSafe
    });
  }

  function overlayCeoStaffProfile(record = {}, userRecord = {}) {
    return overlayCeoStaffProfileCore(record, userRecord, {
      parseCoordNumberFn: parseCoordNumberSafe
    });
  }

  function buildCeoDirectorySyncPatch(record = {}, userRecord = {}) {
    return buildCeoDirectorySyncPatchCore(record, userRecord, {
      overlayCeoStaffProfileFn: overlayCeoStaffProfile,
      parseCoordNumberFn: parseCoordNumberSafe
    });
  }

  function chunkStringList(values = [], size = 10) {
    const out = [];
    const list = uniqueList(values);
    for (let i = 0; i < list.length; i += size) {
      out.push(list.slice(i, i + size));
    }
    return out;
  }

  async function hydrateStaffRecordsFromUserProfiles(items = [], { syncDirectory = false } = {}) {
    const list = Array.isArray(items) ? items.slice() : [];
    const uids = uniqueList(list.map((item) => String(item?.uid || "").trim()).filter(Boolean));
    if (!uids.length || typeof collection !== "function" || typeof getDocs !== "function" || typeof getDoc !== "function") {
      return list;
    }
    const userMap = new Map();
    const usersRef = collection(db, "users");
    const chunks = chunkStringList(uids, 10);
    await Promise.all(chunks.map(async (chunk) => {
      if (!chunk.length) return;
      try {
        if (typeof query === "function" && typeof where === "function" && typeof documentId === "function") {
          const snap = await getDocs(query(usersRef, where(documentId(), "in", chunk)));
          snap.forEach((docSnap) => {
            userMap.set(docSnap.id, docSnap.data() || {});
          });
          return;
        }
      } catch {}
      await Promise.all(chunk.map(async (uid) => {
        try {
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) userMap.set(uid, snap.data() || {});
        } catch {}
      }));
    }));
    const syncWrites = [];
    const nextItems = list.map((item) => {
      const uid = String(item?.uid || "").trim();
      if (!uid) return item;
      const userRecord = userMap.get(uid);
      if (!userRecord) return item;
      if (syncDirectory && typeof setDoc === "function" && typeof doc === "function" && typeof serverTimestamp === "function") {
        const patch = buildCeoDirectorySyncPatch(item, userRecord);
        if (Object.keys(patch).length) {
          syncWrites.push(setDoc(doc(db, "superadmins", uid), {
            ...patch,
            updatedAt: serverTimestamp()
          }, { merge: true }).catch(() => {}));
        }
      }
      return normalizeCeoStaffRecord(overlayCeoStaffProfile(item, userRecord));
    });
    if (syncWrites.length) {
      void Promise.all(syncWrites);
    }
    return nextItems;
  }

  function canViewCeoRecord(record = {}) {
    const current = getCurrentMeta();
    if (!current.uid) return false;
    if (String(record.uid || "") === current.uid) return true;
    const path = normalizePath(record.ceoPath, [record.ceoRootUid, record.ceoParentUid, record.uid]);
    if (path.includes(current.uid)) return true;
    if (hasGlobalAccess() && !String(record.ceoParentUid || "").trim()) return true;
    return false;
  }

  function getOwnerMeta(row = {}) {
    const source = applyKnownLeadOwnershipOverride(row);
    const creatorUid = String(
      source.createdByUid
      || source.ownerUid
      || source.socialUid
      || source.uid
      || ""
    ).trim();
    const creatorName = String(
      source.createdByName
      || source.createdByHandle
      || source.ownerName
      || ""
    ).trim();
    let ceoPath = normalizePath(source.ceoPath);
    if (!ceoPath.length && creatorUid) {
      ceoPath = normalizePath([], [
        source.ceoRootUid || source.rootCeoUid || "",
        source.ceoParentUid || source.parentCeoUid || "",
        creatorUid
      ]);
    }
    return { creatorUid, creatorName, ceoPath };
  }

  function getVisibleCeoTeamUids() {
    if (!isCeo()) return [];
    const current = getCurrentMeta();
    const staffUids = (Array.isArray(state?.staff?.items) ? state.staff.items : [])
      .filter((item) => canViewCeoRecord(item))
      .map((item) => String(item.uid || "").trim())
      .filter(Boolean);
    return uniqueList([current.uid, ...staffUids]);
  }

  function isOwnedByVisibleCeoTeam(row = {}) {
    if (!isCeo()) return true;
    const current = getCurrentMeta();
    if (!current.uid) return false;
    const meta = getOwnerMeta(row);
    const teamUids = getVisibleCeoTeamUids();
    if (meta.creatorUid && meta.creatorUid === current.uid) return true;
    if (meta.ceoPath.includes(current.uid)) return true;
    if (meta.creatorUid && teamUids.includes(meta.creatorUid)) return true;
    if (meta.ceoPath.some((uid) => teamUids.includes(uid))) return true;
    return false;
  }

  function canCurrentCeoSeeRow(row = {}) {
    if (!isCeo()) return true;
    const current = getCurrentMeta();
    if (!current.uid) return true;
    const meta = getOwnerMeta(row);
    if (isOwnedByVisibleCeoTeam(row)) return true;
    if (hasGlobalAccess() && !meta.ceoPath.length && !meta.creatorUid) return true;
    return false;
  }

  function resolveOwnershipMeta(row = {}) {
    if (!isCeo()) return null;
    const current = getCurrentMeta();
    if (!current.uid) return null;
    const meta = getOwnerMeta(row);
    if (!meta.creatorUid || meta.creatorUid === current.uid) {
      return { own: true, label: "Eigene", creatorName: "" };
    }
    return {
      own: false,
      label: "Staff",
      creatorName: meta.creatorName || meta.creatorUid || "I panjohur"
    };
  }

  function isCurrentCeoOwnRow(row = {}) {
    const meta = resolveOwnershipMeta(row);
    return !meta || !!meta.own;
  }

  function renderCeoScopeTabs({
    idPrefix = "ceoScope",
    active = "own",
    ownLabel = "Meine",
    ownCount = 0,
    staffLabel = "Staff",
    staffCount = 0,
    tabs = null
  } = {}) {
    const tabList = Array.isArray(tabs) && tabs.length
      ? tabs
      : [
        {
          key: "own",
          label: ownLabel,
          count: ownCount
        },
        {
          key: "staff",
          label: staffLabel,
          count: staffCount
        }
      ];
    return `
      <div class="grid gap-2 mb-4 w-full" style="grid-template-columns: repeat(${Math.max(1, tabList.length)}, minmax(0, 1fr));">
        ${tabList.map((tab) => {
          const selected = tab.key === active;
          return `
            <button
              type="button"
              data-${escapeHtmlSafe(idPrefix)}="${escapeHtmlSafe(tab.key)}"
              class="rounded-[1.5rem] px-3 py-2.5 text-left border transition-all ${selected ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200/70" : "bg-white text-slate-600 border-slate-100 shadow-sm"}"
            >
              <p class="text-[8px] font-black uppercase tracking-[0.16em] ${selected ? "text-white/70" : "text-slate-400"}">${escapeHtmlSafe(tab.label)}</p>
              <p class="text-base font-black tracking-tight mt-1">${escapeHtmlSafe(String(tab.count))}</p>
            </button>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderOwnershipPills(row = {}, { hideOwn = false } = {}) {
    const meta = resolveOwnershipMeta(row);
    if (!meta) return "";
    if (meta.own && hideOwn) return "";
    const chips = [
      `<span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">${escapeHtmlSafe(meta.label)}</span>`
    ];
    if (!meta.own && meta.creatorName) {
      chips.push(`<span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest">${escapeHtmlSafe(meta.creatorName)}</span>`);
    }
    return `<div class="flex flex-wrap gap-2 mt-3">${chips.join("")}</div>`;
  }

  function buildCeoCreatorMeta(profile = state?.userProfile, user = state?.user) {
    const current = getCurrentMeta(profile, user);
    const handle = String(profile?.handle || normalizeHandleSafe(current.name || "ceo")).trim();
    return {
      createdByUid: current.uid || "",
      createdByRole: "ceo",
      createdByName: current.name || "",
      createdByHandle: handle,
      ceoRootUid: current.rootUid || current.uid || "",
      ceoRootName: current.rootName || current.name || "",
      ceoParentUid: current.parentUid || "",
      ceoPath: Array.isArray(current.path) ? current.path.slice() : []
    };
  }

  function resolveStoredCeoCreatorMeta(...sources) {
    let createdByUid = "";
    let createdByRole = "";
    let createdByName = "";
    let createdByHandle = "";
    let ceoRootUid = "";
    let ceoRootName = "";
    let ceoParentUid = "";
    let ceoPath = [];
    for (const source of sources) {
      if (!source || typeof source !== "object") continue;
      if (!createdByUid) createdByUid = String(source.createdByUid || "").trim();
      if (!createdByRole) createdByRole = String(source.createdByRole || "").trim();
      if (!createdByName) createdByName = String(source.createdByName || "").trim();
      if (!createdByHandle) createdByHandle = String(source.createdByHandle || "").trim();
      if (!ceoRootUid) ceoRootUid = String(source.ceoRootUid || "").trim();
      if (!ceoRootName) ceoRootName = String(source.ceoRootName || "").trim();
      if (!ceoParentUid) ceoParentUid = String(source.ceoParentUid || "").trim();
      if (!ceoPath.length) {
        ceoPath = normalizePath(source.ceoPath, [ceoRootUid, ceoParentUid, createdByUid]);
      }
    }
    if (!createdByUid && ceoPath.length) createdByUid = ceoPath[ceoPath.length - 1];
    if (!ceoRootUid && ceoPath.length) ceoRootUid = ceoPath[0];
    if (!ceoParentUid && ceoPath.length > 1) ceoParentUid = ceoPath[ceoPath.length - 2];
    ceoPath = normalizePath(ceoPath, [ceoRootUid, ceoParentUid, createdByUid]);
    if (!(createdByUid || createdByName || createdByHandle || ceoRootUid || ceoParentUid || ceoPath.length)) {
      return buildCeoCreatorMeta();
    }
    return {
      createdByUid,
      createdByRole: createdByRole || "ceo",
      createdByName,
      createdByHandle,
      ceoRootUid: ceoRootUid || createdByUid,
      ceoRootName: ceoRootName || createdByName,
      ceoParentUid,
      ceoPath
    };
  }

  function applyLocalCeoCrmCountDelta(uid, delta = {}) {
    const safeUid = String(uid || "").trim();
    if (!safeUid) return;
    const keys = Object.keys(createEmptyCeoCrmCounts());
    if (String(state?.user?.uid || state?.userProfile?.uid || "") === safeUid) {
      const next = sanitizeCeoCrmCounts(state?.userProfile?.crmCounts || {});
      keys.forEach((key) => {
        const amount = Number(delta?.[key]) || 0;
        if (!amount) return;
        next[key] = Math.max(0, next[key] + amount);
      });
      state.userProfile = {
        ...state.userProfile,
        crmCounts: next
      };
      persistUserProfile();
    }
    if (Array.isArray(state?.staff?.items) && state.staff.items.length) {
      state.staff.items = state.staff.items.map((item) => {
        if (String(item?.uid || "") !== safeUid) return item;
        const next = sanitizeCeoCrmCounts(item?.crmCounts || {});
        keys.forEach((key) => {
          const amount = Number(delta?.[key]) || 0;
          if (!amount) return;
          next[key] = Math.max(0, next[key] + amount);
        });
        return {
          ...item,
          crmCounts: next
        };
      });
    }
  }

  function buildLeadCrmContribution(lead = null) {
    if (!lead) return null;
    const normalized = normalizeLead(lead);
    const meta = getOwnerMeta(normalized);
    const path = normalizePath(meta.ceoPath, [normalized.ceoRootUid, normalized.ceoParentUid, meta.creatorUid]);
    const creatorUid = String(meta.creatorUid || path[path.length - 1] || "").trim();
    if (!creatorUid && !path.length) return null;
    const statusKey = normalizeLeadStatus(normalized.status || "");
    if (statusKey === "kunde") return null;
    return {
      creatorUid,
      path: normalizePath(path, [creatorUid]),
      ownLeads: statusKey === "no_interest" ? 0 : 1,
      ownArchivedLeads: statusKey === "no_interest" ? 1 : 0,
      ownCustomers: 0
    };
  }

  function buildCustomerCrmContribution(customer = null) {
    if (!customer || !isCustomerRestaurantSafe(customer)) return null;
    const meta = getOwnerMeta(customer);
    const path = normalizePath(meta.ceoPath, [customer.ceoRootUid, customer.ceoParentUid, meta.creatorUid]);
    const creatorUid = String(meta.creatorUid || path[path.length - 1] || "").trim();
    if (!creatorUid && !path.length) return null;
    return {
      creatorUid,
      path: normalizePath(path, [creatorUid]),
      ownLeads: 0,
      ownArchivedLeads: 0,
      ownCustomers: 1
    };
  }

  function accumulateCeoCrmDelta(deltaMap, contribution, sign = 1) {
    if (!contribution || !sign || !(deltaMap instanceof Map)) return;
    const path = normalizePath(contribution.path, [contribution.creatorUid]);
    const creatorUid = String(contribution.creatorUid || path[path.length - 1] || "").trim();
    const leadDelta = (Number(contribution.ownLeads) || 0) * sign;
    const archivedDelta = (Number(contribution.ownArchivedLeads) || 0) * sign;
    const customerDelta = (Number(contribution.ownCustomers) || 0) * sign;
    const ensure = (uid) => {
      const key = String(uid || "").trim();
      if (!key) return null;
      if (!deltaMap.has(key)) deltaMap.set(key, createEmptyCeoCrmCounts());
      return deltaMap.get(key);
    };
    const creatorCounts = ensure(creatorUid);
    if (creatorCounts) {
      creatorCounts.ownLeads += leadDelta;
      creatorCounts.ownArchivedLeads += archivedDelta;
      creatorCounts.archivedLeads += archivedDelta;
      creatorCounts.ownCustomers += customerDelta;
    }
    path.forEach((uid) => {
      const key = String(uid || "").trim();
      if (!key || key === creatorUid) return;
      const target = ensure(key);
      if (!target) return;
      target.staffLeads += leadDelta;
      target.staffCustomers += customerDelta;
      target.archivedLeads += archivedDelta;
    });
  }

  async function applyCeoCrmCountDeltas(deltaMap) {
    if (!(deltaMap instanceof Map) || !deltaMap.size || typeof increment !== "function" || typeof setDoc !== "function" || typeof doc !== "function") {
      return;
    }
    const writes = [];
    deltaMap.forEach((delta, uid) => {
      const safeUid = String(uid || "").trim();
      if (!safeUid) return;
      const nested = {};
      Object.entries(delta || {}).forEach(([key, value]) => {
        const amount = Number(value) || 0;
        if (!amount) return;
        nested[key] = increment(amount);
      });
      if (!Object.keys(nested).length) return;
      const payload = {
        crmCounts: nested,
        updatedAt: typeof serverTimestamp === "function" ? serverTimestamp() : null
      };
      writes.push(setDoc(doc(db, "users", safeUid), payload, { merge: true }).catch(() => {}));
      writes.push(setDoc(doc(db, "superadmins", safeUid), payload, { merge: true }).catch(() => {}));
      applyLocalCeoCrmCountDelta(safeUid, delta);
    });
    if (writes.length) {
      await Promise.all(writes);
    }
  }

  async function fetchCeoTeamEntriesForCrmCounts(currentMeta = getCurrentMeta()) {
    const currentUid = String(currentMeta?.uid || "").trim();
    if (!currentUid || typeof collection !== "function" || typeof query !== "function" || typeof where !== "function" || typeof getDocs !== "function") {
      return [];
    }
    const staffRef = collection(db, "superadmins");
    const queryRefs = [
      query(staffRef, where("ceoPath", "array-contains", currentUid)),
      query(staffRef, where("ceoParentUid", "==", currentUid))
    ];
    if (hasGlobalAccess()) {
      queryRefs.push(query(staffRef));
    }
    const snaps = await Promise.all(queryRefs.map((ref) => getDocs(ref).catch(() => null)));
    const rowMap = new Map();
    snaps.forEach((snap) => {
      if (!snap?.docs?.length) return;
      snap.docs.forEach((docSnap) => {
        rowMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() || {}) });
      });
    });
    return Array.from(rowMap.values())
      .map((row) => normalizeCeoStaffRecord(row))
      .filter((item) => canViewCeoRecord(item) && String(item.uid || "") !== currentUid)
      .filter((item) => !isHiddenLegacyCeoEmail(item.email || ""))
      .sort((a, b) => {
        const ta = toDateSafeFn(a.createdAt)?.getTime() || 0;
        const tb = toDateSafeFn(b.createdAt)?.getTime() || 0;
        if (tb !== ta) return tb - ta;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }

  async function fetchNestedCeoStaffEntries(rootUids = []) {
    const roots = uniqueList(rootUids);
    if (!roots.length || typeof collection !== "function" || typeof query !== "function" || typeof where !== "function" || typeof getDocs !== "function") {
      return [];
    }
    const staffRef = collection(db, "superadmins");
    const queryRefs = [];
    chunkStringList(roots, 10).forEach((uids) => {
      if (!uids.length) return;
      queryRefs.push(query(staffRef, where("ceoPath", "array-contains-any", uids)));
      queryRefs.push(query(staffRef, where("ceoParentUid", "in", uids)));
    });
    const snaps = await Promise.all(queryRefs.map((ref) => getDocs(ref).catch(() => null)));
    const rowMap = new Map();
    snaps.forEach((snap) => {
      if (!snap?.docs?.length) return;
      snap.docs.forEach((docSnap) => {
        rowMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() || {}) });
      });
    });
    return Array.from(rowMap.values())
      .map((row) => normalizeCeoStaffRecord(row))
      .filter((item) => !isHiddenLegacyCeoEmail(item.email || ""))
      .sort((a, b) => {
        const ta = toDateSafeFn(a.createdAt)?.getTime() || 0;
        const tb = toDateSafeFn(b.createdAt)?.getTime() || 0;
        if (tb !== ta) return tb - ta;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }

  async function ensureCeoCrmCountsLoaded({ force = false } = {}) {
    if (!isCeo()) return;
    const current = getCurrentMeta();
    if (!current.uid) return;
    const currentReady = hasStoredCeoCrmCounts(state?.userProfile?.crmCounts || {});
    const staffReady = (Array.isArray(state?.staff?.items) ? state.staff.items : []).every((item) => hasStoredCeoCrmCounts(item?.crmCounts || {}));
    if (!force && currentReady && staffReady) return;
    if (ceoCrmCountsPromise) {
      await ceoCrmCountsPromise;
      return;
    }
    ceoCrmCountsPromise = (async () => {
      const currentMeta = getCurrentMeta();
      const visibleStaffItems = Array.isArray(state?.staff?.items) ? state.staff.items : [];
      const missingVisibleStaff = visibleStaffItems.filter((item) => !hasStoredCeoCrmCounts(item?.crmCounts || {}));
      const needsCurrentRecount = force || !currentReady;
      let teamStaffEntries = [];
      if (needsCurrentRecount) {
        teamStaffEntries = (dataLoaded?.staff && !state?.staff?.hasMore && visibleStaffItems.length)
          ? visibleStaffItems.slice()
          : await fetchCeoTeamEntriesForCrmCounts(currentMeta);
      } else if (missingVisibleStaff.length) {
        const nestedStaff = await fetchNestedCeoStaffEntries(missingVisibleStaff.map((item) => String(item?.uid || "").trim()));
        const mergedStaff = new Map();
        [...missingVisibleStaff, ...nestedStaff].forEach((item) => {
          const uid = String(item?.uid || "").trim();
          if (!uid) return;
          mergedStaff.set(uid, item);
        });
        teamStaffEntries = Array.from(mergedStaff.values());
      }
      const teamEntries = [
        ...(needsCurrentRecount ? [{
          uid: currentMeta.uid,
          ceoPath: Array.isArray(currentMeta.path) ? currentMeta.path.slice() : [currentMeta.uid]
        }] : []),
        ...(teamStaffEntries.map((item) => ({
          uid: String(item?.uid || "").trim(),
          ceoPath: normalizePath(item?.ceoPath, [item?.ceoRootUid, item?.ceoParentUid, item?.uid])
        })))
      ].filter((entry) => entry.uid);
      const teamUids = uniqueList(teamEntries.map((entry) => entry.uid));
      if (!teamUids.length || typeof collection !== "function" || typeof query !== "function" || typeof where !== "function" || typeof getDocs !== "function") {
        return;
      }

      const ownMap = new Map(teamUids.map((uid) => [uid, createEmptyCeoCrmCounts()]));

      const leadSnaps = await Promise.all(chunkStringList(teamUids, 10).map((uids) => (
        getDocs(query(collection(db, "leads"), where("createdByUid", "in", uids))).catch(() => null)
      )));
      leadSnaps.forEach((snap) => {
        if (!snap?.docs?.length) return;
        snap.docs.forEach((docSnap) => {
          const lead = normalizeLead({ id: docSnap.id, ...(docSnap.data() || {}) });
          const uid = String(lead.createdByUid || "").trim();
          if (!uid || !ownMap.has(uid)) return;
          const counts = ownMap.get(uid);
          const statusKey = normalizeLeadStatus(lead.status || "");
          if (statusKey === "kunde") return;
          if (statusKey === "no_interest") {
            counts.ownArchivedLeads += 1;
          } else {
            counts.ownLeads += 1;
          }
        });
      });

      const customerSnaps = await Promise.all(chunkStringList(teamUids, 10).map((uids) => (
        getDocs(query(collection(db, "restaurants"), where("createdByUid", "in", uids))).catch(() => null)
      )));
      customerSnaps.forEach((snap) => {
        if (!snap?.docs?.length) return;
        snap.docs.forEach((docSnap) => {
          const row = { id: docSnap.id, ...(docSnap.data() || {}) };
          if (!isCustomerRestaurantSafe(row)) return;
          const uid = String(row.createdByUid || "").trim();
          if (!uid || !ownMap.has(uid)) return;
          ownMap.get(uid).ownCustomers += 1;
        });
      });

      const aggregateMap = new Map();
      teamUids.forEach((uid) => {
        const own = sanitizeCeoCrmCounts(ownMap.get(uid) || {});
        aggregateMap.set(uid, {
          ...createEmptyCeoCrmCounts(),
          ...own,
          archivedLeads: own.ownArchivedLeads
        });
      });

      teamEntries.forEach((entry) => {
        const uid = String(entry.uid || "").trim();
        if (!uid) return;
        const own = sanitizeCeoCrmCounts(ownMap.get(uid) || {});
        const path = normalizePath(entry.ceoPath, [uid]);
        path.forEach((ancestorUid) => {
          const safeAncestorUid = String(ancestorUid || "").trim();
          if (!safeAncestorUid || safeAncestorUid === uid || !aggregateMap.has(safeAncestorUid)) return;
          const target = aggregateMap.get(safeAncestorUid);
          target.staffLeads += own.ownLeads;
          target.staffCustomers += own.ownCustomers;
          target.archivedLeads += own.ownArchivedLeads;
        });
      });

      const persistWrites = [];
      aggregateMap.forEach((counts, uid) => {
        const safeUid = String(uid || "").trim();
        if (!safeUid || typeof setDoc !== "function" || typeof doc !== "function") return;
        const payload = {
          crmCounts: sanitizeCeoCrmCounts(counts),
          updatedAt: typeof serverTimestamp === "function" ? serverTimestamp() : null
        };
        persistWrites.push(setDoc(doc(db, "users", safeUid), payload, { merge: true }).catch(() => {}));
        persistWrites.push(setDoc(doc(db, "superadmins", safeUid), payload, { merge: true }).catch(() => {}));
        if (safeUid === String(state?.user?.uid || state?.userProfile?.uid || "")) {
          state.userProfile = {
            ...state.userProfile,
            crmCounts: sanitizeCeoCrmCounts(counts)
          };
          persistUserProfile();
        }
      });
      if (persistWrites.length) {
        await Promise.all(persistWrites);
      }
      if (Array.isArray(state?.staff?.items) && state.staff.items.length) {
        state.staff.items = state.staff.items.map((item) => {
          const counts = aggregateMap.get(String(item?.uid || "").trim());
          return counts ? { ...item, crmCounts: sanitizeCeoCrmCounts(counts) } : item;
        });
      }
      rerender();
    })();
    try {
      await ceoCrmCountsPromise;
    } finally {
      ceoCrmCountsPromise = null;
    }
  }

  async function syncCeoDirectoryProfilePatch(patch = {}) {
    const uid = String(state?.user?.uid || "").trim();
    if (!uid || !isCeo() || typeof setDoc !== "function" || typeof doc !== "function") return;
    const payload = {};
    const textFields = ["name", "displayName", "handle", "city", "locationLabel", "country", "firstName", "lastName", "ceoParentName", "ceoRootName"];
    textFields.forEach((key) => {
      if (!(key in patch)) return;
      const value = String(patch[key] || "").trim();
      if (!value) return;
      payload[key] = value;
    });
    ["lat", "lng", "gpsLat", "gpsLng"].forEach((key) => {
      if (!(key in patch)) return;
      const value = Number(patch[key]);
      if (!Number.isFinite(value)) return;
      payload[key] = value;
    });
    const avatarUrl = String(patch.avatarUrl || patch.avatar || "").trim();
    if (avatarUrl) {
      payload.avatarUrl = avatarUrl;
      payload.avatar = avatarUrl;
    }
    if (!Object.keys(payload).length) return;
    payload.updatedAt = typeof serverTimestamp === "function" ? serverTimestamp() : null;
    try {
      await setDoc(doc(db, "superadmins", uid), payload, { merge: true });
    } catch {}
  }

  return {
    normalizeCeoStaffRecord,
    canViewCeoRecord,
    hydrateStaffRecordsFromUserProfiles,
    canCurrentCeoSeeRow,
    isOwnedByVisibleCeoTeam,
    isCurrentCeoOwnRow,
    createEmptyCeoCrmCounts,
    sanitizeCeoCrmCounts,
    hasStoredCeoCrmCounts,
    resolveKnownScopeCountLabel: resolveKnownScopeCountLabelCore,
    renderCeoScopeTabs,
    renderOwnershipPills,
    buildCeoCreatorMeta,
    resolveStoredCeoCreatorMeta,
    buildLeadCrmContribution,
    buildCustomerCrmContribution,
    accumulateCeoCrmDelta,
    applyCeoCrmCountDeltas,
    ensureCeoCrmCountsLoaded,
    getCeoCrmCountsPromise: () => ceoCrmCountsPromise,
    syncCeoDirectoryProfilePatch,
    pickCountValue: pickCountValueCore
  };
}

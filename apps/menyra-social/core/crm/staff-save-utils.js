export async function saveCeoStaffFromViewCore({
  state,
  isCeoUser,
  syncStaffFormFromDom,
  getStaffFormEmail,
  normalizeCeoCountry,
  buildCeoName,
  render,
  getCurrentCeoMeta,
  createAuthUser,
  uploadCompressedImage,
  normalizeCeoPath,
  uniqueStringList,
  normalizeHandle,
  setDoc,
  doc,
  db,
  serverTimestamp,
  createEmptyCeoCrmCounts,
  resetStaffForm,
  loadCeoStaff,
  saveUserProfileToStorage,
  sanitizeCeoCrmCounts
} = {}) {
  if (!state || !state.user) return;
  const isCeo = typeof isCeoUser === "function" ? isCeoUser : (() => false);
  if (!isCeo()) return;
  const syncForm = typeof syncStaffFormFromDom === "function" ? syncStaffFormFromDom : (() => {});
  const getEmail = typeof getStaffFormEmail === "function"
    ? getStaffFormEmail
    : ((form) => String(form?.email || "").trim());
  const normalizeCountry = typeof normalizeCeoCountry === "function"
    ? normalizeCeoCountry
    : ((value) => String(value || "").trim());
  const buildName = typeof buildCeoName === "function"
    ? buildCeoName
    : ({ firstName, lastName, email }) => String(`${firstName || ""} ${lastName || ""}`.trim() || email || "");
  const rerender = typeof render === "function" ? render : (() => {});
  const currentMeta = typeof getCurrentCeoMeta === "function"
    ? getCurrentCeoMeta
    : (() => ({ uid: "", name: "", rootUid: "", rootName: "", path: [] }));
  const createUser = typeof createAuthUser === "function"
    ? createAuthUser
    : (async () => null);
  const uploadImage = typeof uploadCompressedImage === "function"
    ? uploadCompressedImage
    : (async () => ({ cdnUrl: "" }));
  const normalizePath = typeof normalizeCeoPath === "function"
    ? normalizeCeoPath
    : ((value) => (Array.isArray(value) ? value : []));
  const uniqueList = typeof uniqueStringList === "function"
    ? uniqueStringList
    : ((list) => Array.from(new Set(Array.isArray(list) ? list : [])));
  const normalizeHandleSafe = typeof normalizeHandle === "function"
    ? normalizeHandle
    : ((value) => String(value || "").toLowerCase());
  const setDocSafe = typeof setDoc === "function" ? setDoc : null;
  const docSafe = typeof doc === "function" ? doc : null;
  const getTimestamp = typeof serverTimestamp === "function"
    ? serverTimestamp
    : (() => new Date());
  const createEmptyCounts = typeof createEmptyCeoCrmCounts === "function"
    ? createEmptyCeoCrmCounts
    : (() => ({}));
  const resetForm = typeof resetStaffForm === "function" ? resetStaffForm : (() => {});
  const loadStaff = typeof loadCeoStaff === "function"
    ? loadCeoStaff
    : (async () => {});
  const persistProfile = typeof saveUserProfileToStorage === "function"
    ? saveUserProfileToStorage
    : (() => {});
  const sanitizeCounts = typeof sanitizeCeoCrmCounts === "function"
    ? sanitizeCeoCrmCounts
    : ((value) => (value && typeof value === "object" ? value : {}));

  if (!setDocSafe || !docSafe || !db) return;

  syncForm();
  const form = state.staff.form || {};
  const isEditing = !!state.staff.editorUid;
  const existingEntry = isEditing
    ? (state.staff.items || []).find((item) => String(item.uid || "") === String(state.staff.editorUid || ""))
    : null;
  const firstName = String(form.firstName || "").trim();
  const lastName = String(form.lastName || "").trim();
  const email = getEmail(form, { preferStored: isEditing });
  const password = String(form.password || "");
  const country = normalizeCountry(form.country);
  const locationLabel = String(form.locationLabel || "").trim() || country;
  const coords = form.coords && Number.isFinite(Number(form.coords.lat)) && Number.isFinite(Number(form.coords.lng))
    ? { lat: Number(form.coords.lat), lng: Number(form.coords.lng) }
    : null;
  const name = buildName({ firstName, lastName, email });
  if (!firstName || !lastName || !email || (!isEditing && !password)) {
    state.staff.status = isEditing
      ? "Vorname, Nachname und Email sind erforderlich."
      : "Vorname, Nachname, Email und Passwort sind erforderlich.";
    rerender();
    return;
  }
  if (!coords) {
    state.staff.status = "Standort mit Pin waehlen.";
    rerender();
    return;
  }

  const current = currentMeta();
  state.staff.saving = true;
  state.staff.deleting = false;
  state.staff.status = isEditing ? "CEO wird gespeichert..." : "CEO Staff wird erstellt...";
  rerender();

  try {
    let uid = String(state.staff.editorUid || "").trim();
    if (!isEditing) {
      const authUser = await createUser(email, password);
      uid = String(authUser?.uid || "").trim();
      if (!uid) throw new Error("Account konnte nicht erstellt werden.");
    }
    let avatarUrl = String(form.avatarUrl || "").trim();
    if (form.avatarFile && uid) {
      const { cdnUrl } = await uploadImage(
        form.avatarFile,
        uid,
        { maxSize: 512, quality: 0.82, mimeType: "image/jpeg" }
      );
      avatarUrl = cdnUrl || avatarUrl;
    }
    const ceoParentUid = String(existingEntry?.ceoParentUid || current.uid || "").trim();
    const ceoParentName = String(
      existingEntry?.ceoParentName
      || ((ceoParentUid && ceoParentUid === current.uid) ? current.name : "")
      || ""
    ).trim();
    const ceoRootUid = String(existingEntry?.ceoRootUid || current.rootUid || current.uid || uid).trim() || uid;
    const ceoRootName = String(existingEntry?.ceoRootName || current.rootName || current.name || name).trim() || name;
    const ceoPath = isEditing
      ? normalizePath(existingEntry?.ceoPath, [ceoRootUid, ceoParentUid, uid])
      : uniqueList([...(current.path || []), uid]);
    const handle = normalizeHandleSafe(`${firstName}${lastName}`) || normalizeHandleSafe(name) || "ceo";
    const superadminPayload = {
      uid,
      userId: uid,
      firstName,
      lastName,
      name,
      displayName: name,
      email,
      handle,
      role: "ceo",
      roles: ["ceo"],
      status: "active",
      avatarUrl,
      avatar: avatarUrl,
      country,
      locationLabel,
      city: locationLabel,
      lat: coords.lat,
      lng: coords.lng,
      gpsLat: coords.lat,
      gpsLng: coords.lng,
      ceoParentUid,
      ceoParentName,
      ceoRootUid,
      ceoRootName,
      ceoPath,
      createdByUid: String(existingEntry?.createdByUid || current.uid || "").trim(),
      createdByRole: String(existingEntry?.createdByRole || "ceo").trim() || "ceo",
      createdByName: String(existingEntry?.createdByName || current.name || "").trim(),
      crmCounts: existingEntry?.crmCounts && typeof existingEntry.crmCounts === "object" ? existingEntry.crmCounts : {},
      updatedAt: getTimestamp()
    };
    if (!isEditing) superadminPayload.createdAt = getTimestamp();
    await setDocSafe(docSafe(db, "superadmins", uid), superadminPayload, { merge: true });
    const userPayload = {
      uid,
      displayName: name,
      name,
      firstName,
      lastName,
      email,
      handle,
      avatarUrl,
      avatar: avatarUrl,
      city: locationLabel,
      location: locationLabel,
      address: locationLabel,
      country,
      role: "ceo",
      roles: ["ceo"],
      status: "active",
      ceoParentUid,
      ceoParentName,
      ceoRootUid,
      ceoRootName,
      ceoPath,
      crmCounts: existingEntry?.crmCounts && typeof existingEntry.crmCounts === "object" ? existingEntry.crmCounts : createEmptyCounts(),
      lat: coords.lat,
      lng: coords.lng,
      gpsLat: coords.lat,
      gpsLng: coords.lng,
      updatedAt: getTimestamp()
    };
    if (!isEditing) {
      userPayload.bio = "";
      userPayload.createdAt = getTimestamp();
    }
    await setDocSafe(docSafe(db, "users", uid), userPayload, { merge: true });
    if (String(uid) === String(state.user.uid || "")) {
      state.userProfile = {
        ...state.userProfile,
        uid,
        name,
        displayName: name,
        firstName,
        lastName,
        email,
        handle,
        avatar: avatarUrl || state.userProfile.avatar,
        avatarUrl: avatarUrl || state.userProfile.avatar,
        location: locationLabel,
        address: locationLabel,
        city: locationLabel,
        country,
        role: "ceo",
        roles: ["ceo"],
        crmCounts: sanitizeCounts(state.userProfile?.crmCounts || existingEntry?.crmCounts || {}),
        ceoParentUid,
        ceoParentName,
        ceoRootUid,
        ceoRootName,
        ceoPath,
        lat: coords.lat,
        lng: coords.lng,
        gpsLat: coords.lat,
        gpsLng: coords.lng
      };
      persistProfile();
    }
    resetForm(isEditing ? "CEO gespeichert." : "CEO Staff erstellt.");
    await loadStaff();
  } catch (err) {
    console.error(err);
    state.staff.status = err?.message || (isEditing ? "CEO konnte nicht gespeichert werden." : "CEO Staff konnte nicht erstellt werden.");
    state.staff.saving = false;
    state.staff.deleting = false;
    rerender();
  }
}

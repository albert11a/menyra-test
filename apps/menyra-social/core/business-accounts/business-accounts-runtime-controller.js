import { createCrmAdminBusinessAccountWriteFacade } from "../crm/crm-admin-business-account-write-facade.js";
import {
  loadCrmBusinessAccountsCore,
  normalizeCrmBusinessAccountEntryCore
} from "../crm/crm-business-account-read-loader-core.js";

function asText(value = "") {
  return String(value || "").trim();
}

function normalizeStaffRole(value = "") {
  const key = asText(value).toLowerCase();
  return key === "manager" ? "manager" : "waiter";
}

function buildAccessLabel({ businessAccess = false, waiterAccess = false } = {}) {
  if (businessAccess && waiterAccess) return "Beides";
  if (businessAccess) return "Business";
  if (waiterAccess) return "Waiter";
  return "Kein Zugriff";
}

function createEmptyBusinessAccountForm() {
  return {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "waiter",
    businessAccess: false,
    waiterAccess: true,
    active: true
  };
}

function normalizeBusinessAccountEntry(source = {}, id = "") {
  return normalizeCrmBusinessAccountEntryCore(source, id);
}

function buildStatusBadge(entry = {}) {
  return entry.active
    ? '<span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest">Aktiv</span>'
    : '<span class="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">Deaktiviert</span>';
}

export function createBusinessAccountsRuntimeController({
  state,
  icon,
  escapeHtml,
  db,
  auth,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  serverTimestamp,
  createAuthUser,
  signOut,
  saveUserProfileToStorage,
  render,
  getRestaurantMetaById,
  isBusinessOwnerProfile,
  isPlaceholderUrl,
  getOptimizedImageUrl,
  PLACEHOLDER_IMAGE = ""
} = {}) {
  const iconFn = typeof icon === "function" ? icon : (() => "");
  const esc = typeof escapeHtml === "function" ? escapeHtml : ((value = "") => String(value || ""));
  const rerender = typeof render === "function" ? render : (() => {});
  const getRestaurantMeta = typeof getRestaurantMetaById === "function" ? getRestaurantMetaById : (() => null);
  const createUser = typeof createAuthUser === "function" ? createAuthUser : (async () => null);
  const signOutFn = typeof signOut === "function" ? signOut : (async () => {});
  const optimizeImage = typeof getOptimizedImageUrl === "function" ? getOptimizedImageUrl : ((value = "") => asText(value));
  const isPlaceholder = typeof isPlaceholderUrl === "function" ? isPlaceholderUrl : (() => false);
  const persistProfile = typeof saveUserProfileToStorage === "function" ? saveUserProfileToStorage : (() => {});
  const isBusinessOwner = typeof isBusinessOwnerProfile === "function"
    ? isBusinessOwnerProfile
    : (() => false);

  function ensureState() {
    if (!state.businessAccounts || typeof state.businessAccounts !== "object") {
      state.businessAccounts = {
        items: [],
        view: "list",
        editorUid: "",
        loading: false,
        saving: false,
        deleting: false,
        loaded: false,
        error: "",
        status: "",
        form: createEmptyBusinessAccountForm()
      };
    }
  }

  function isBusinessOwnerUser() {
    return isBusinessOwner(state?.userProfile);
  }

  function getManagedRestaurantId() {
    return isBusinessOwnerUser() ? asText(state?.userProfile?.restaurantId) : "";
  }

  function resetForm(status = "") {
    ensureState();
    state.businessAccounts = {
      ...state.businessAccounts,
      view: "list",
      editorUid: "",
      saving: false,
      deleting: false,
      error: "",
      status: asText(status),
      form: createEmptyBusinessAccountForm()
    };
  }

  function openEditor(mode = "create", entry = null) {
    ensureState();
    const normalizedEntry = entry ? normalizeBusinessAccountEntry(entry, entry.uid || entry.userId || "") : null;
    state.businessAccounts = {
      ...state.businessAccounts,
      view: "form",
      editorUid: normalizedEntry?.uid || "",
      deleting: false,
      error: "",
      status: "",
      form: normalizedEntry ? {
        firstName: normalizedEntry.firstName,
        lastName: normalizedEntry.lastName,
        email: normalizedEntry.email,
        password: "",
        role: normalizedEntry.role,
        businessAccess: normalizedEntry.businessAccess,
        waiterAccess: normalizedEntry.waiterAccess,
        active: normalizedEntry.active
      } : createEmptyBusinessAccountForm()
    };
    rerender();
  }

  function closeEditor(status = "") {
    resetForm(status);
    rerender();
  }

  function syncFormFromDom(documentObj = document) {
    ensureState();
    const docObj = documentObj || document;
    const read = (id) => {
      const node = docObj?.getElementById(id);
      if (!node) return "";
      return "value" in node ? String(node.value || "") : "";
    };
    const checked = (id) => {
      const node = docObj?.getElementById(id);
      return !!node?.checked;
    };
    state.businessAccounts.form = {
      ...state.businessAccounts.form,
      firstName: read("businessAccountFirstName").trim(),
      lastName: read("businessAccountLastName").trim(),
      email: read("businessAccountEmail").trim().toLowerCase(),
      password: read("businessAccountPassword"),
      role: normalizeStaffRole(read("businessAccountRole")),
      businessAccess: checked("businessAccountBusinessAccess"),
      waiterAccess: checked("businessAccountWaiterAccess"),
      active: checked("businessAccountActive")
    };
  }

  async function loadBusinessAccounts({ force = false } = {}) {
    ensureState();
    const restaurantId = getManagedRestaurantId();
    if (!restaurantId) {
      state.businessAccounts.error = "Staff-Bereich nicht verfuegbar.";
      rerender();
      return [];
    }
    if (state.businessAccounts.loading) return state.businessAccounts.items || [];
    if (state.businessAccounts.loaded && !force) return state.businessAccounts.items || [];

    state.businessAccounts.loading = true;
    state.businessAccounts.error = "";
    rerender();
    try {
      const result = await loadCrmBusinessAccountsCore({
        db,
        collectionFn: collection,
        getDocsFn: getDocs,
        restaurantId,
        normalizeBusinessAccountEntryFn: normalizeBusinessAccountEntry
      });
      const items = Array.isArray(result.items) ? result.items : [];
      state.businessAccounts.items = items;
      state.businessAccounts.loaded = true;
      state.businessAccounts.loading = false;
      state.businessAccounts.error = "";
      rerender();
      return items;
    } catch (err) {
      console.error(err);
      state.businessAccounts.loading = false;
      state.businessAccounts.error = err?.message || "Staff konnte nicht geladen werden.";
      rerender();
      return [];
    }
  }

  async function saveBusinessAccountFromView() {
    ensureState();
    const restaurantId = getManagedRestaurantId();
    if (!restaurantId || !state?.user?.uid) return;
    syncFormFromDom();
    const form = state.businessAccounts.form || {};
    const isEditing = !!asText(state.businessAccounts.editorUid);
    const firstName = asText(form.firstName);
    const lastName = asText(form.lastName);
    const email = asText(form.email).toLowerCase();
    const password = String(form.password || "");
    const role = normalizeStaffRole(form.role);
    const businessAccess = form.businessAccess === true;
    const waiterAccess = form.waiterAccess === true;
    const active = form.active !== false;
    const name = asText(`${firstName} ${lastName}`.trim());
    const restaurant = getRestaurantMeta(restaurantId) || {};
    const restaurantName = asText(restaurant.name || restaurant.restaurantName || state.userProfile?.name || "Business");

    if (!firstName || !lastName || !email || (!isEditing && !password)) {
      state.businessAccounts.error = isEditing
        ? "Vorname, Nachname und Email sind erforderlich."
        : "Vorname, Nachname, Email und Passwort sind erforderlich.";
      rerender();
      return;
    }
    if (!email.includes("@")) {
      state.businessAccounts.error = "Bitte eine gueltige Email eingeben.";
      rerender();
      return;
    }
    if (!businessAccess && !waiterAccess) {
      state.businessAccounts.error = "Mindestens ein Zugriff muss aktiv sein.";
      rerender();
      return;
    }

    state.businessAccounts.saving = true;
    state.businessAccounts.deleting = false;
    state.businessAccounts.error = "";
    state.businessAccounts.status = isEditing ? "Account wird gespeichert..." : "Account wird erstellt...";
    rerender();

    const currentAuthUser = auth?.currentUser || null;
    try {
      let uid = asText(state.businessAccounts.editorUid);
      if (!uid) {
        const authUser = await createUser(email, password);
        uid = asText(authUser?.uid);
      }
      if (!uid) throw new Error("Account konnte nicht erstellt werden.");

      const stamp = serverTimestamp();
      const permissions = {
        businessAccess,
        waiterAccess
      };
      const staffPayload = {
        uid,
        userId: uid,
        restaurantId,
        restaurantName,
        firstName,
        lastName,
        name,
        email,
        role,
        permissions,
        businessAccess,
        waiterAccess,
        active,
        status: active ? "active" : "disabled",
        createdByUid: asText(state.user.uid),
        createdByName: asText(state.userProfile?.name || state.user.displayName || ""),
        updatedAt: stamp
      };
      const userPayload = {
        uid,
        displayName: name,
        name,
        firstName,
        lastName,
        email,
        role: "staff",
        roles: ["staff"],
        status: active ? "active" : "disabled",
        staffRole: role,
        permissions,
        businessAccess,
        waiterAccess,
        staffActive: active,
        staffStatus: active ? "active" : "disabled",
        staffRestaurantId: restaurantId,
        waiterRestaurantId: restaurantId,
        restaurantId: businessAccess ? restaurantId : "",
        businessOwnerUid: asText(state.user.uid),
        updatedAt: stamp
      };
      if (!isEditing) {
        staffPayload.createdAt = stamp;
        userPayload.createdAt = stamp;
      }

      await setDoc(doc(db, "restaurants", restaurantId, "staff", uid), staffPayload, { merge: true });
      await setDoc(doc(db, "users", uid), userPayload, { merge: true });

      if (currentAuthUser && auth?.currentUser && asText(auth.currentUser.uid) !== asText(currentAuthUser.uid)) {
        await signOutFn(auth).catch(() => {});
      }
      if (currentAuthUser && (!auth?.currentUser || asText(auth.currentUser.uid) !== asText(currentAuthUser.uid))) {
        // Secondary auth helpers should not replace the owner session, but recover it if they did.
        persistProfile();
      }

      resetForm(isEditing ? "Account gespeichert." : "Account erstellt.");
      await loadBusinessAccounts({ force: true });
    } catch (err) {
      console.error(err);
      state.businessAccounts.saving = false;
      state.businessAccounts.deleting = false;
      state.businessAccounts.error = err?.message || "Account konnte nicht gespeichert werden.";
      state.businessAccounts.status = "";
      rerender();
    }
  }

  async function toggleBusinessAccountActive() {
    ensureState();
    const uid = asText(state.businessAccounts.editorUid);
    const restaurantId = getManagedRestaurantId();
    if (!uid || !restaurantId) return;
    syncFormFromDom();
    state.businessAccounts.form.active = !state.businessAccounts.form.active;
    state.businessAccounts.deleting = true;
    state.businessAccounts.saving = false;
    state.businessAccounts.error = "";
    state.businessAccounts.status = state.businessAccounts.form.active ? "Account wird aktiviert..." : "Account wird deaktiviert...";
    rerender();
    try {
      const active = state.businessAccounts.form.active !== false;
      const permissions = {
        businessAccess: state.businessAccounts.form.businessAccess === true,
        waiterAccess: state.businessAccounts.form.waiterAccess === true
      };
      await setDoc(doc(db, "restaurants", restaurantId, "staff", uid), {
        active,
        status: active ? "active" : "disabled",
        businessAccess: permissions.businessAccess,
        waiterAccess: permissions.waiterAccess,
        permissions,
        updatedAt: serverTimestamp()
      }, { merge: true });
      await setDoc(doc(db, "users", uid), {
        businessAccess: permissions.businessAccess,
        waiterAccess: permissions.waiterAccess,
        permissions,
        staffActive: active,
        staffStatus: active ? "active" : "disabled",
        status: active ? "active" : "disabled",
        restaurantId: permissions.businessAccess ? restaurantId : "",
        updatedAt: serverTimestamp()
      }, { merge: true });
      state.businessAccounts.deleting = false;
      state.businessAccounts.status = active ? "Account aktiviert." : "Account deaktiviert.";
      await loadBusinessAccounts({ force: true });
    } catch (err) {
      console.error(err);
      state.businessAccounts.deleting = false;
      state.businessAccounts.error = err?.message || "Status konnte nicht aktualisiert werden.";
      state.businessAccounts.status = "";
      rerender();
    }
  }

  const businessAccountWriteFacade = createCrmAdminBusinessAccountWriteFacade({
    saveBusinessAccountFromView,
    toggleBusinessAccountActive
  });
  const {
    saveCrmBusinessAccount,
    updateCrmBusinessAccount
  } = businessAccountWriteFacade;

  function renderGuardView() {
    return `
      <div id="businessAccountsView" class="p-6 animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
          <div class="w-20 h-20 rounded-[2rem] bg-slate-100 mx-auto flex items-center justify-center text-slate-300 mb-6">
            ${iconFn("lock", "w-8 h-8")}
          </div>
          <h2 class="text-lg font-black tracking-tight text-slate-900">Staff</h2>
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Nur fuer Business Owner</p>
        </div>
      </div>
    `;
  }

  function renderEditorView() {
    const form = state.businessAccounts.form || createEmptyBusinessAccountForm();
    const isEditing = !!asText(state.businessAccounts.editorUid);
    const saveLabel = state.businessAccounts.saving
      ? (isEditing ? "Speichern..." : "Erstellen...")
      : (isEditing ? "Account speichern" : "Account erstellen");
    const active = form.active !== false;

    return `
      <div id="businessAccountsView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
        <div class="flex items-center justify-between mb-6">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Business</span>
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">${esc(isEditing ? "Staff bearbeiten" : "Neuer Staff")}</h2>
          </div>
          <button type="button" data-business-account-back="true" class="w-12 h-12 rounded-2xl bg-white text-slate-600 border border-slate-100 shadow-sm flex items-center justify-center active:scale-95">
            ${iconFn("arrow-left", "w-4 h-4")}
          </button>
        </div>

        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vorname</label>
              <input id="businessAccountFirstName" type="text" value="${esc(form.firstName || "")}" placeholder="Vorname" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nachname</label>
              <input id="businessAccountLastName" type="text" value="${esc(form.lastName || "")}" placeholder="Nachname" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
            <input id="businessAccountEmail" type="email" value="${esc(form.email || "")}" placeholder="staff@business.com" ${isEditing ? "readonly" : ""} class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold ${isEditing ? "text-slate-500" : ""} border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Passwort</label>
            <input id="businessAccountPassword" type="password" value="" placeholder="${esc(isEditing ? "Passwort bleibt unveraendert" : "Passwort eingeben")}" ${isEditing ? "disabled" : ""} class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold ${isEditing ? "text-slate-400" : ""} border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Rolle</label>
            <div class="relative mt-2">
              <select id="businessAccountRole" class="w-full px-5 py-4 pr-12 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none appearance-none focus:ring-2 focus:ring-indigo-100">
                <option value="manager" ${normalizeStaffRole(form.role) === "manager" ? "selected" : ""}>Manager</option>
                <option value="waiter" ${normalizeStaffRole(form.role) === "waiter" ? "selected" : ""}>Kellner</option>
              </select>
              <div class="absolute inset-y-0 right-5 flex items-center text-slate-400 pointer-events-none">${iconFn("chevron-down", "w-4 h-4")}</div>
            </div>
          </div>

          <div class="rounded-[2rem] bg-slate-50 border border-slate-100 p-5">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zugriff</p>
            <div class="mt-4 space-y-3">
              <label class="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4 border border-slate-100">
                <div>
                  <p class="text-sm font-black text-slate-900">Business Account</p>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Social Business Bereiche</p>
                </div>
                <input id="businessAccountBusinessAccess" type="checkbox" ${form.businessAccess ? "checked" : ""} class="w-5 h-5 accent-indigo-600" />
              </label>
              <label class="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4 border border-slate-100">
                <div>
                  <p class="text-sm font-black text-slate-900">Waiter App</p>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Orders und Benachrichtigungen</p>
                </div>
                <input id="businessAccountWaiterAccess" type="checkbox" ${form.waiterAccess ? "checked" : ""} class="w-5 h-5 accent-indigo-600" />
              </label>
            </div>
          </div>

          <label class="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4">
            <div>
              <p class="text-sm font-black text-slate-900">Status</p>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">${active ? "Aktiv" : "Deaktiviert"}</p>
            </div>
            <input id="businessAccountActive" type="checkbox" ${active ? "checked" : ""} class="w-5 h-5 accent-emerald-600" />
          </label>

          ${state.businessAccounts.error ? `<div class="text-center text-[10px] font-black uppercase tracking-widest text-rose-500">${esc(state.businessAccounts.error)}</div>` : ""}
          ${state.businessAccounts.status ? `<div class="text-center text-[10px] font-black uppercase tracking-widest text-slate-500">${esc(state.businessAccounts.status)}</div>` : ""}

          <button id="businessAccountSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${state.businessAccounts.saving ? "disabled" : ""}>
            ${esc(saveLabel)}
          </button>
          ${isEditing ? `
            <button id="businessAccountToggleStatusBtn" type="button" class="w-full py-4 rounded-[1.8rem] ${active ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"} text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform" ${state.businessAccounts.deleting ? "disabled" : ""}>
              ${esc(state.businessAccounts.deleting ? "Speichern..." : (active ? "Account deaktivieren" : "Account aktivieren"))}
            </button>
          ` : ""}
        </div>
      </div>
    `;
  }

  function renderListView() {
    const items = Array.isArray(state.businessAccounts.items) ? state.businessAccounts.items : [];
    const listHtml = state.businessAccounts.loading
      ? '<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Accounts laden...</div>'
      : (items.length
        ? items.map((entry) => {
          const accessLabel = buildAccessLabel(entry);
          return `
            <button type="button" data-business-account-edit="${esc(entry.uid)}" class="w-full text-left bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm active:scale-[0.99] transition-transform">
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${esc(entry.name || "Staff")}</p>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">${esc(entry.email || "")}</p>
                </div>
                ${buildStatusBadge(entry)}
              </div>
              <div class="flex flex-wrap gap-2 mt-4">
                <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">${esc(entry.role === "manager" ? "Manager" : "Kellner")}</span>
                <span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest">${esc(accessLabel)}</span>
              </div>
              <div class="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Tippen zum Bearbeiten</span>
                <span class="w-9 h-9 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">${iconFn("chevron-right", "w-4 h-4")}</span>
              </div>
            </button>
          `;
        }).join("")
      : '<div class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 py-16">Noch kein Staff vorhanden</div>');

    return `
      <div id="businessAccountsView" class="p-6 animate-in slide-in-from-right-10 duration-500 pb-24">
        <div class="flex items-center justify-between mb-6">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Business</span>
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">Staff</h2>
          </div>
          <button id="businessAccountNewBtn" type="button" class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-200/60 active:scale-95">
            ${iconFn("plus", "w-4 h-4")}
          </button>
        </div>
        ${state.businessAccounts.error ? `<div class="text-center text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4">${esc(state.businessAccounts.error)}</div>` : ""}
        ${state.businessAccounts.status ? `<div class="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">${esc(state.businessAccounts.status)}</div>` : ""}
        <div class="space-y-4">${listHtml}</div>
      </div>
    `;
  }

  function renderBusinessAccountsView() {
    ensureState();
    if (!isBusinessOwnerUser()) return renderGuardView();
    if (state.businessAccounts.view === "form") return renderEditorView();
    return renderListView();
  }

  function bindBusinessAccountsEvents(documentObj = document) {
    ensureState();
    const docObj = documentObj || document;
    if (!docObj || state.activeTab !== "businessAccounts") return;

    const newBtn = docObj.getElementById("businessAccountNewBtn");
    if (newBtn && newBtn.dataset.bound !== "true") {
      newBtn.dataset.bound = "true";
      newBtn.addEventListener("click", () => openEditor("create"));
    }

    docObj.querySelectorAll("[data-business-account-edit]").forEach((btn) => {
      if (btn.dataset.bound === "true") return;
      btn.dataset.bound = "true";
      btn.addEventListener("click", () => {
        const uid = asText(btn.getAttribute("data-business-account-edit"));
        const entry = (state.businessAccounts.items || []).find((item) => asText(item.uid) === uid);
        if (entry) openEditor("edit", entry);
      });
    });

    const backBtn = docObj.querySelector("[data-business-account-back]");
    if (backBtn && backBtn.dataset.bound !== "true") {
      backBtn.dataset.bound = "true";
      backBtn.addEventListener("click", () => closeEditor());
    }

    const saveBtn = docObj.getElementById("businessAccountSaveBtn");
    if (saveBtn && saveBtn.dataset.bound !== "true") {
      saveBtn.dataset.bound = "true";
      saveBtn.addEventListener("click", () => {
        if (state.businessAccounts.saving) return;
        void saveCrmBusinessAccount();
      });
    }

    const toggleBtn = docObj.getElementById("businessAccountToggleStatusBtn");
    if (toggleBtn && toggleBtn.dataset.bound !== "true") {
      toggleBtn.dataset.bound = "true";
      toggleBtn.addEventListener("click", () => {
        if (state.businessAccounts.deleting) return;
        void updateCrmBusinessAccount();
      });
    }
  }

  return {
    ensureState,
    isBusinessOwnerUser,
    getManagedRestaurantId,
    resetForm,
    openEditor,
    closeEditor,
    syncFormFromDom,
    loadBusinessAccounts,
    saveBusinessAccountFromView: saveCrmBusinessAccount,
    toggleBusinessAccountActive: updateCrmBusinessAccount,
    renderBusinessAccountsView,
    bindBusinessAccountsEvents
  };
}

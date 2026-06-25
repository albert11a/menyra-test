export function bindAppSettingsProfileEventsCore({
  documentObj,
  state,
  setStateFn,
  renderFn,
  iconFn,
  saveAccountSettingsFn,
  openLocationPickerFn,
  clearVerifiedMapLocationFn,
  syncNotificationsPushRuntimeFn,
  saveSettingsFn,
  disablePushDeviceRegistrationFn,
  getPushActivationIssueMessageFn,
  saveUserProfileToStorageFn,
  persistPrivateAccountSettingFn,
  uploadAvatarFn,
  openProfileViewFromBusinessFn,
  findPostByIdFn,
  openPostModalFn,
  getProfileViewUnsubFn,
  setProfileViewUnsubFn,
  toggleFollowFn,
  alertFn
} = {}) {
  const doc = documentObj || null;
  if (!doc || !state) return;
  const setState = typeof setStateFn === "function" ? setStateFn : (() => {});
  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const icon = typeof iconFn === "function" ? iconFn : (() => "");
  const saveAccountSettings = typeof saveAccountSettingsFn === "function" ? saveAccountSettingsFn : null;
  const openLocationPicker = typeof openLocationPickerFn === "function" ? openLocationPickerFn : null;
  const syncNotificationsPushRuntime = typeof syncNotificationsPushRuntimeFn === "function"
    ? syncNotificationsPushRuntimeFn
    : null;
  const saveSettings = typeof saveSettingsFn === "function" ? saveSettingsFn : (() => {});
  const disablePushDeviceRegistration = typeof disablePushDeviceRegistrationFn === "function"
    ? disablePushDeviceRegistrationFn
    : null;
  const getPushActivationIssueMessage = typeof getPushActivationIssueMessageFn === "function"
    ? getPushActivationIssueMessageFn
    : (() => "");
  const saveUserProfileToStorage = typeof saveUserProfileToStorageFn === "function"
    ? saveUserProfileToStorageFn
    : (() => {});
  const persistPrivateAccountSetting = typeof persistPrivateAccountSettingFn === "function"
    ? persistPrivateAccountSettingFn
    : null;
  const uploadAvatar = typeof uploadAvatarFn === "function" ? uploadAvatarFn : null;
  const openProfileViewFromBusiness = typeof openProfileViewFromBusinessFn === "function"
    ? openProfileViewFromBusinessFn
    : (() => {});
  const findPostById = typeof findPostByIdFn === "function" ? findPostByIdFn : (() => null);
  const openPostModal = typeof openPostModalFn === "function" ? openPostModalFn : (() => {});
  const getProfileViewUnsub = typeof getProfileViewUnsubFn === "function" ? getProfileViewUnsubFn : (() => null);
  const setProfileViewUnsub = typeof setProfileViewUnsubFn === "function" ? setProfileViewUnsubFn : (() => {});
  const toggleFollow = typeof toggleFollowFn === "function" ? toggleFollowFn : (() => {});
  const alertUser = typeof alertFn === "function" ? alertFn : (() => {});

  doc.querySelectorAll("[data-settings]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setState({ settingsView: btn.dataset.settings });
    });
  });

  doc.querySelectorAll("[data-settings-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setState({ settingsView: "main" });
    });
  });

  const saveAccountBtn = doc.getElementById("saveAccountBtn");
  if (saveAccountBtn) {
    saveAccountBtn.addEventListener("click", async () => {
      if (saveAccountBtn.disabled || !saveAccountSettings) return;
      saveAccountBtn.innerHTML = `${icon("loader-2", "w-4 h-4 animate-spin")} Speichere...`;
      await saveAccountSettings();
      setState({ settingsView: "main" });
    });
  }

  const openLocationPickerBtn = doc.getElementById("openLocationPickerBtn");
  if (openLocationPickerBtn) {
    openLocationPickerBtn.addEventListener("click", () => {
      if (!openLocationPicker) return;
      openLocationPicker({
        addressInputId: "settingsAddress",
        coordsDisplayId: "coordsDisplay",
        context: "settings"
      });
    });
  }

  const settingsAddress = doc.getElementById("settingsAddress");
  if (settingsAddress) {
    settingsAddress.addEventListener("input", () => {
      const badge = doc.getElementById("coordsDisplay");
      if (badge) badge.classList.add("hidden");
    });
  }

  doc.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const key = btn.dataset.toggle;
      if (!key) return;
      const toggledValue = !state.settings[key];

      if (key === "pushNotifs") {
        if (toggledValue) {
          const enabled = syncNotificationsPushRuntime
            ? await syncNotificationsPushRuntime({ user: state.user, interactive: true, enabled: true })
            : false;
          if (!enabled) {
            state.settings = { ...state.settings, pushNotifs: false };
            saveSettings(state.settings);
            render();
            alertUser(`Push konnte nicht aktiviert werden.\n${getPushActivationIssueMessage()}`);
            return;
          }
        } else {
          if (disablePushDeviceRegistration) {
            await disablePushDeviceRegistration();
          }
          if (syncNotificationsPushRuntime) {
            void syncNotificationsPushRuntime({ user: state.user, interactive: false, enabled: false });
          }
        }
      }

      const next = { ...state.settings, [key]: toggledValue };
      state.settings = next;
      if (key === "privateAccount") {
        state.userProfile.privateAccount = !!next[key];
        saveUserProfileToStorage();
        if (persistPrivateAccountSetting) {
          void persistPrivateAccountSetting(next[key]);
        }
      }
      saveSettings(next);
      render();
    });
  });

  const profileAvatarTrigger = doc.getElementById("profileAvatarTrigger");
  const profileAvatarInput = doc.getElementById("profileAvatarInput");
  if (profileAvatarTrigger && profileAvatarInput) {
    profileAvatarTrigger.addEventListener("click", () => profileAvatarInput.click());
    profileAvatarInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (file && uploadAvatar) {
        await uploadAvatar(file);
      }
    });
  }

  const settingsAvatarTrigger = doc.getElementById("settingsAvatarTrigger");
  const settingsAvatarInput = doc.getElementById("settingsAvatarInput");
  if (settingsAvatarTrigger && settingsAvatarInput) {
    settingsAvatarTrigger.addEventListener("click", () => settingsAvatarInput.click());
    settingsAvatarInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (file && uploadAvatar) {
        await uploadAvatar(file);
      }
    });
  }

  doc.querySelectorAll("[data-profile-business]").forEach((btn) => {
    if (btn.closest("#feedView")) return;
    btn.addEventListener("click", () => {
      openProfileViewFromBusiness({
        id: btn.dataset.profileId || "",
        name: btn.dataset.profileBusiness || ""
      }, { showBack: true });
    });
  });

  doc.querySelectorAll("[data-open-post]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const target = e.target;
      if (target instanceof Element) {
        if (target.closest("[data-profile-menu]") || target.closest("[data-profile-menu-button]")) return;
      }
      const postId = btn.dataset.openPost;
      const post = findPostById(postId);
      if (post) openPostModal(post);
    });
  });

  doc.querySelectorAll("[data-public-profile-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.profileView = null;
      const backTab = state.profileBackTab || "feed";
      state.profileBackTab = "feed";
      const unsub = getProfileViewUnsub();
      if (typeof unsub === "function") {
        unsub();
        setProfileViewUnsub(null);
      }
      setState({ activeTab: backTab, drawerOpen: false });
    });
  });

  doc.querySelectorAll("[data-public-profile-follow]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const handle = btn.dataset.publicProfileFollow;
      if (!handle) return;
      toggleFollow(handle, {
        type: btn.dataset.targetType || "",
        id: btn.dataset.targetId || "",
        name: btn.dataset.targetName || "",
        avatar: btn.dataset.targetAvatar || ""
      });
    });
  });

  doc.querySelectorAll("[data-profile-card-info-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = String(btn.dataset.profileCardInfoOpen || "").trim();
      if (!key) return;
      state.profileCardInfoOpen = key;
      render();
    });
  });

  doc.querySelectorAll("[data-profile-card-info-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = String(btn.dataset.profileCardInfoClose || "").trim();
      if (key && String(state.profileCardInfoOpen || "") !== key) return;
      state.profileCardInfoOpen = "";
      render();
    });
  });
}

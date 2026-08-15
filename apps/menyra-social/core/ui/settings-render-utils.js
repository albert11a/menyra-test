export function renderSettingsViewCore({
  state,
  icon,
  escapeHtml,
  logoFitClass,
  isLocalBusinessProfile,
  isCeoUser,
  isBusinessOwnerProfile,
  resolveUserAvatar,
  PLACEHOLDER_IMAGE
} = {}) {
  if (!state) return "";
  const iconFn = typeof icon === "function" ? icon : (() => "");
  const esc = typeof escapeHtml === "function" ? escapeHtml : ((value) => String(value || ""));
  const logoFit = typeof logoFitClass === "function" ? logoFitClass : (() => "object-cover");
  const isLocalBusiness = typeof isLocalBusinessProfile === "function" ? isLocalBusinessProfile : (() => false);
  const isCeo = typeof isCeoUser === "function" ? isCeoUser : (() => false);
  const isBusinessOwner = typeof isBusinessOwnerProfile === "function" ? isBusinessOwnerProfile : (() => false);
  const resolveAvatar = typeof resolveUserAvatar === "function"
    ? resolveUserAvatar
    : ((value) => String(value || ""));
  const placeholder = String(PLACEHOLDER_IMAGE || "");

  const settings = state.settings;
  const profile = state.userProfile;
  const allowGpsSettings = isLocalBusiness(profile) || isCeo();

  if (state.settingsView === "main") {
    // Die Eintraege sehen gleich aus, tun aber zweierlei: die meisten blaettern
    // eine Seite weiter INNERHALB der Einstellungen (data-settings), "Stafi"
    // fuehrt aus ihnen heraus auf einen eigenen Tab (data-nav). Deshalb traegt
    // jeder Eintrag seine Marke selbst, statt dass sie hier fest steht.
    //
    // "Stafi" steht nur beim Inhaber: nur er darf Zugaenge vergeben. Frueher
    // stand der Weg im Drawer; jetzt steht er dort, wo man ohnehin nach
    // Einstellungen sucht.
    const items = [
      { attrs: 'data-settings="account"', label: "Account", icon: "user", desc: "Ndrysho profilin" },
      { attrs: 'data-settings="privacy"', label: "Privatesia", icon: "lock", desc: "Siguria" },
      { attrs: 'data-settings="notifs"', label: "Njoftimet", icon: "bell", desc: "Push & Email" },
      { attrs: 'data-settings="saved"', label: "Ruajtur", icon: "bookmark", desc: "Te preferuarat" }
    ];
    if (isBusinessOwner(profile)) {
      items.push({
        attrs: 'data-nav="businessAccounts"',
        label: "Stafi",
        icon: "users-round",
        desc: "Zugänge verwalten"
      });
    }
    return `
      <div class="p-6 animate-in slide-in-from-left-10 duration-500 app-main-content-safe">
        <h2 class="text-2xl font-black italic uppercase mb-8 px-2">Cilesimet</h2>
        <div class="space-y-3 mb-8">
          ${items.map((item) => `
            <button type="button" ${item.attrs} class="w-full flex items-center justify-between p-5 bg-white rounded-[2.5rem] border border-slate-50 hover:bg-slate-50 transition-all">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">${iconFn(item.icon, "w-4 h-4")}</div>
                <div class="text-left">
                  <span class="font-black text-slate-800 text-sm block">${item.label}</span>
                  <span class="text-[10px] font-bold text-slate-400 uppercase">${item.desc}</span>
                </div>
              </div>
              ${iconFn("chevron-right", "w-4 h-4 text-slate-300")}
            </button>
          `).join("")}
        </div>
        <button id="settingsLogout" class="w-full p-5 bg-rose-50 text-rose-500 rounded-[2.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">${iconFn("log-out", "w-4 h-4")} Abmelden</button>
      </div>
    `;
  }

  if (state.settingsView === "account") {
    const avatarFit = logoFit(isLocalBusiness(profile));
    return `
      <div class="p-6 animate-in slide-in-from-right-10 duration-500">
        <header class="flex items-center gap-4 mb-8">
          <button data-settings-back="true" class="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200">${iconFn("arrow-left", "w-4 h-4")}</button>
          <h2 class="text-xl font-black italic uppercase tracking-tighter">Account</h2>
        </header>
        
        <div class="flex flex-col items-center mb-8">
          <input type="file" id="settingsAvatarInput" class="hidden" accept="image/*" />
          <div id="settingsAvatarTrigger" class="relative group cursor-pointer">
            <img src="${esc(resolveAvatar(profile.avatar))}" class="w-28 h-28 rounded-[3rem] ${avatarFit} border-4 border-white shadow-xl" onerror="this.src='${placeholder}'" />
            <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">${iconFn("camera", "w-4 h-4")}</div>
          </div>
        </div>
        
        <div class="p-6 rounded-[2rem] border border-slate-200/60 space-y-4 bg-white shadow-xl shadow-slate-200/20 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Name</label>
            <input id="settingsName" type="text" value="${esc(profile.name)}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Handle</label>
            <input id="settingsHandle" type="text" value="${esc(profile.handle)}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Bio</label>
            <textarea id="settingsBio" rows="3" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${esc(profile.bio)}</textarea>
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">City</label>
            <input id="settingsCity" type="text" value="${esc(profile.location)}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Vendi / Lagjja</label>
            <input id="settingsPlace" type="text" value="${esc(profile.place || profile.locationPlace || profile.locality || profile.district || "")}" placeholder="p.sh. Golem, Qender, Qyteti i vjeter" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
          </div>
          
          ${allowGpsSettings ? `
            <div class="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 mt-4">
              <label class="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1 mb-2 ml-1">
                ${iconFn("map-pin", "w-3 h-3")} Vendndodhja e sakte (harta)
              </label>
              <input id="settingsAddress" type="text" value="${esc(profile.address || "")}" placeholder="z.B. Rruga Garibaldi, Prishtina" class="w-full px-4 py-3 bg-white rounded-xl text-sm font-bold border border-slate-200 outline-none" />
              
              <div id="coordsDisplay" class="text-[9px] font-bold text-emerald-600 mt-2 hidden flex items-center gap-1">
                ${iconFn("check-circle-2", "w-3 h-3")} Vendndodhja u fiksua ne harte!
              </div>

              <button id="openLocationPickerBtn" type="button" class="w-full mt-3 bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                ${iconFn("map-pin", "w-3.5 h-3.5")} Auf Karte festlegen
              </button>
            </div>
          ` : ""}
          
          <button id="saveAccountBtn" class="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg">
            ${iconFn("save", "w-4 h-4")} Ruaj profilin
          </button>
        </div>
        <div class="mt-4 text-center text-[10px] font-bold text-slate-400" id="settingsStatus"></div>
      </div>

      <!-- LOCATION PICKER MODAL (FEINJUSTIERUNG) -->
      <div id="locationPickerModal" class="fixed inset-0 z-[3000] hidden flex flex-col fullscreen-safe-pad">
        <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity duration-300 opacity-0" id="pickerOverlay"></div>
        <div class="bg-white rounded-[2.5rem] flex-1 flex flex-col overflow-hidden relative shadow-2xl transition-transform duration-300 translate-y-full" id="pickerPanel">
          <div class="p-5 flex justify-between items-center bg-white z-20 shadow-sm">
            <div>
              <h3 class="font-black text-lg leading-none">Rregullo vendndodhjen</h3>
              <p class="text-[10px] font-bold text-slate-400 mt-1">Zhvendos harten nen pin</p>
            </div>
            <button id="closeLocationPickerBtn" type="button" class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">${iconFn("x", "w-5 h-5")}</button>
          </div>
          
          <div class="flex-1 relative bg-slate-200">
            <div id="pickerMap" class="absolute inset-0 z-10"></div>
            <!-- Statischer Pin in der Mitte der Karte -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-30 pointer-events-none drop-shadow-2xl">
              <div class="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl animate-bounce">
                ${iconFn("map-pin", "w-5 h-5 text-white fill-indigo-600")}
              </div>
              <div class="w-1 h-4 bg-slate-800 mx-auto -mt-1 rounded-full shadow-lg"></div>
            </div>
          </div>
          
          <div class="p-5 bg-white z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
            <button id="confirmLocationBtn" type="button" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
              ${iconFn("check", "w-4 h-4")} Hier bestätigen
            </button>
          </div>
        </div>
      </div>
    `;
  }

  if (state.settingsView === "privacy") {
    return `
      <div class="p-6 animate-in slide-in-from-right-10 duration-500">
        <header class="flex items-center gap-4 mb-8">
          <button data-settings-back="true" class="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200">${iconFn("arrow-left", "w-4 h-4")}</button>
          <h2 class="text-xl font-black italic uppercase tracking-tighter">Privatesia</h2>
        </header>
        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 space-y-6">
          <div class="flex justify-between items-center">
            <div>
              <p class="font-black text-slate-800 text-sm">Llogari private</p>
              <p class="text-[10px] font-bold text-slate-400">Vetem ndjekesit i shohin postimet</p>
            </div>
            <button data-toggle="privateAccount" class="w-11 h-6 rounded-full relative transition-colors duration-300 ${settings.privateAccount ? "bg-indigo-600" : "bg-slate-200"}">
              <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${settings.privateAccount ? "right-1" : "left-1"}"></div>
            </button>
          </div>
          <div class="flex justify-between items-center">
            <div>
              <p class="font-black text-slate-800 text-sm">Statusi online</p>
              <p class="text-[10px] font-bold text-slate-400">E dukshme per te tjeret</p>
            </div>
            <button data-toggle="showOnline" class="w-11 h-6 rounded-full relative transition-colors duration-300 ${settings.showOnline ? "bg-indigo-600" : "bg-slate-200"}">
              <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${settings.showOnline ? "right-1" : "left-1"}"></div>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  if (state.settingsView === "notifs") {
    return `
      <div class="p-6 animate-in slide-in-from-right-10 duration-500">
        <header class="flex items-center gap-4 mb-8">
          <button data-settings-back="true" class="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200">${iconFn("arrow-left", "w-4 h-4")}</button>
          <h2 class="text-xl font-black italic uppercase tracking-tighter">Njoftimet</h2>
        </header>
        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 space-y-6">
          <div class="flex justify-between items-center">
            <div>
              <p class="font-black text-slate-800 text-sm">Push Alerts</p>
              <p class="text-[10px] font-bold text-slate-400">Ne kete pajisje</p>
            </div>
            <button data-toggle="pushNotifs" class="w-11 h-6 rounded-full relative transition-colors duration-300 ${settings.pushNotifs ? "bg-indigo-600" : "bg-slate-200"}">
              <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${settings.pushNotifs ? "right-1" : "left-1"}"></div>
            </button>
          </div>
          <div class="flex justify-between items-center">
            <div>
              <p class="font-black text-slate-800 text-sm">Email Updates</p>
              <p class="text-[10px] font-bold text-slate-400">News & Highlights</p>
            </div>
            <button data-toggle="emailNotifs" class="w-11 h-6 rounded-full relative transition-colors duration-300 ${settings.emailNotifs ? "bg-indigo-600" : "bg-slate-200"}">
              <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${settings.emailNotifs ? "right-1" : "left-1"}"></div>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="p-6 animate-in slide-in-from-right-10 duration-500">
      <header class="flex items-center gap-4 mb-8">
        <button data-settings-back="true" class="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200">${iconFn("arrow-left", "w-4 h-4")}</button>
        <h2 class="text-xl font-black italic uppercase tracking-tighter">Te ruajtura</h2>
      </header>
      <div class="grid grid-cols-2 gap-4">
        <div class="aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
          ${iconFn("bookmark", "w-8 h-8")}
          <span class="text-[10px] font-black uppercase mt-2">Bosh</span>
        </div>
      </div>
    </div>
  `;
}

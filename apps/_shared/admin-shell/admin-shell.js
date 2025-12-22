/* =========================================================
   MENYRA Admin Shell - FULLSCREEN MENU PAGE (no drawer)
   SAFE-AREA WHITE: SYNCHRONIZED with slide animation
   - Safe-area/theme-color switches ON exactly when slide IN starts
   - Restores exactly when slide OUT finishes (transitionend)
   ========================================================= */
(function(){
  function $(id){ return document.getElementById(id); }

  let prevThemeColor = null;

  function ensureThemeMeta(){
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta){
      meta = document.createElement("meta");
      meta.setAttribute("name","theme-color");
      meta.setAttribute("content","#ffffff");
      document.head.appendChild(meta);
      prevThemeColor = null;
      return meta;
    }
    return meta;
  }

  function setThemeColor(color){
    const meta = ensureThemeMeta();
    if (prevThemeColor === null){
      prevThemeColor = meta.getAttribute("content") || "";
    }
    meta.setAttribute("content", color);
  }

  function restoreThemeColor(){
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    if (prevThemeColor !== null){
      meta.setAttribute("content", prevThemeColor || "#ffffff");
    }
    prevThemeColor = null;
  }

  function ensureScreen(){
    if ($("menuScreen")) return;
    const screen = document.createElement("div");
    screen.className = "m-menu-screen";
    screen.id = "menuScreen";
    screen.innerHTML = `<div class="m-menu-page" id="menuPage"></div>`;
    document.body.appendChild(screen);
  }

  async function loadMenuPage(menuUrl){
    const host = $("menuPage");
    if (!host) return;
    host.innerHTML = "<div class='m-menu-meta'>Loading…</div>";
    try{
      const res = await fetch(menuUrl, { cache: "no-cache" });
      const html = await res.text();
      host.innerHTML = html;

      host.querySelector("[data-menu-close]")?.addEventListener("click", close);

      host.addEventListener("click", (e) => {
        const a = e.target.closest("a[data-section]");
        if (!a) return;
        e.preventDefault();
        const section = a.getAttribute("data-section");
        if (typeof window.__MENYRA_ADMIN_NAV === "function") {
          window.__MENYRA_ADMIN_NAV(section);
        } else {
          document.querySelector(`[data-section="${section}"]`)?.click();
        }
        close();
      }, { passive: false });

      setActiveFromApp();
    }catch(err){
      console.error(err);
      host.innerHTML = "<div class='m-menu-meta'>Menu konnte nicht geladen werden.</div>";
    }
  }

  function setActiveFromApp(){
    const host = $("menuPage");
    if (!host) return;
    const active = document.querySelector('.m-nav-link.is-active')?.getAttribute("data-section")
      || document.querySelector('.m-view[style*="display: block"]')?.getAttribute("data-view")
      || "dashboard";
    host.querySelectorAll("a[data-section]").forEach(a => {
      a.classList.toggle("is-active", a.getAttribute("data-section") === active);
    });
  }

  function open(menuUrl){
    ensureScreen();
    const screen = $("menuScreen");
    if (!screen) return;

    // show container (still off-screen at -100%)
    screen.classList.add("is-ready");
    loadMenuPage(menuUrl);

    // START animation next frame — and switch safe-area/theme-color exactly in the same frame
    requestAnimationFrame(() => {
      // SYNC ON
      document.documentElement.classList.add("m-menu-open");
      document.body.classList.add("m-menu-open");
      setThemeColor("#ffffff");

      // slide in
      screen.classList.add("is-open");
    });

    window.addEventListener("keydown", onKeydown);

    // Back closes menu
    if (!history.state || history.state.__menyraMenuOpen !== true){
      history.pushState({ __menyraMenuOpen: true }, "");
    }
    window.addEventListener("popstate", onPopState, { once: true });
  }

  function close(){
    const screen = $("menuScreen");
    if (!screen) return;

    // slide out
    screen.classList.remove("is-open");
    window.removeEventListener("keydown", onKeydown);

    // restore exactly when animation finishes
    const done = () => {
      screen.classList.remove("is-ready");

      // SYNC OFF
      document.body.classList.remove("m-menu-open");
      document.documentElement.classList.remove("m-menu-open");
      restoreThemeColor();

      screen.removeEventListener("transitionend", done);
      clearTimeout(fallback);
    };

    // exact end
    screen.addEventListener("transitionend", done, { once: true });

    // fallback (in case transitionend doesn't fire)
    const fallback = setTimeout(done, 320);
  }

  function onKeydown(e){
    if (e.key === "Escape") close();
  }
  function onPopState(){
    close();
  }

  function init(opts){
    const menuUrl = (opts && opts.menuUrl) ? opts.menuUrl : "./menu.html";
    ensureScreen();
    window.MenyraAdminShell._menuUrl = menuUrl;

    const burger = $("burgerToggle");
    if (burger){
      burger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        open(menuUrl);
      }, true);
    }
  }

  window.MenyraAdminShell = {
    init,
    open: () => open(window.MenyraAdminShell._menuUrl || "./menu.html"),
    close
  };
})();

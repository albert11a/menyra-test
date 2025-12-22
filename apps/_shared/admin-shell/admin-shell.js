/* =========================================================
   MENYRA Admin Shell - SLIDING DRAWER (like before)
   FIX: Drawer background matches Admin background.
   - Copies computed background from the main admin page (color + gradient)
   ========================================================= */
(function(){
  function $(id){ return document.getElementById(id); }

  function ensureOverlay(){
    if ($("menuOverlay")) return;
    const overlay = document.createElement("div");
    overlay.className = "m-menu-overlay";
    overlay.id = "menuOverlay";
    overlay.innerHTML = `
      <div class="m-menu-backdrop" id="menuBackdrop"></div>
      <div class="m-menu-panel" id="menuPanel">
        <div class="m-menu-page" id="menuPage"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function pickBgElement(){
    // try common wrappers first, fallback to body/html
    return (
      document.querySelector(".app") ||
      document.querySelector(".page") ||
      document.querySelector(".m-app") ||
      document.body ||
      document.documentElement
    );
  }

  function syncPanelBackground(){
    const panel = $("menuPanel");
    if (!panel) return;

    const el = pickBgElement();
    const cs = window.getComputedStyle(el);

    // copy background properties (supports gradients)
    panel.style.backgroundColor = cs.backgroundColor || "#ffffff";
    panel.style.backgroundImage = cs.backgroundImage || "none";
    panel.style.backgroundRepeat = cs.backgroundRepeat || "no-repeat";
    panel.style.backgroundPosition = cs.backgroundPosition || "center top";
    panel.style.backgroundSize = cs.backgroundSize || "cover";
    panel.style.backgroundAttachment = cs.backgroundAttachment || "scroll";

    // also copy to menu page, so scroll area matches perfectly
    const page = $("menuPage");
    if (page){
      page.style.backgroundColor = panel.style.backgroundColor;
      page.style.backgroundImage = panel.style.backgroundImage;
      page.style.backgroundRepeat = panel.style.backgroundRepeat;
      page.style.backgroundPosition = panel.style.backgroundPosition;
      page.style.backgroundSize = panel.style.backgroundSize;
      page.style.backgroundAttachment = panel.style.backgroundAttachment;
    }
  }

  async function loadMenuPage(menuUrl){
    const host = $("menuPage");
    if (!host) return;
    host.innerHTML = "<div class='m-menu-meta'>Loading…</div>";
    try{
      const res = await fetch(menuUrl, { cache: "no-cache" });
      const html = await res.text();
      host.innerHTML = html;

      const closeBtn = host.querySelector("[data-menu-close]");
      closeBtn && closeBtn.addEventListener("click", () => window.MenyraAdminShell.close());

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
        window.MenyraAdminShell.close();
      }, { passive: false });

      // mark active
      const active = document.querySelector('.m-nav-link.is-active')?.getAttribute("data-section")
        || document.querySelector('.m-view[style*="display: block"]')?.getAttribute("data-view")
        || "dashboard";
      host.querySelectorAll("a[data-section]").forEach(a => {
        a.classList.toggle("is-active", a.getAttribute("data-section") === active);
      });
    }catch(err){
      console.error(err);
      host.innerHTML = "<div class='m-menu-meta'>Menu konnte nicht geladen werden.</div>";
    }
  }

  function open(menuUrl){
    ensureOverlay();
    syncPanelBackground();

    const overlay = $("menuOverlay");
    overlay.classList.add("is-open");
    overlay.style.display = "block";

    loadMenuPage(menuUrl);

    // close on backdrop
    $("menuBackdrop")?.addEventListener("click", close, { once: true });

    // ESC close
    window.addEventListener("keydown", onKeydown);

    // back closes (optional)
    if (!history.state || history.state.__menyraMenuOpen !== true){
      history.pushState({ __menyraMenuOpen: true }, "");
    }
    window.addEventListener("popstate", onPopState, { once: true });
  }

  function close(){
    const overlay = $("menuOverlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    setTimeout(() => { overlay.style.display = "none"; }, 260);
    window.removeEventListener("keydown", onKeydown);
  }

  function onKeydown(e){
    if (e.key === "Escape") close();
  }
  function onPopState(){
    close();
  }

  function init(opts){
    const menuUrl = (opts && opts.menuUrl) ? opts.menuUrl : "./menu.html";
    ensureOverlay();
    window.MenyraAdminShell._menuUrl = menuUrl;

    // keep panel background synced on resize/orientation
    window.addEventListener("resize", () => {
      if ($("menuOverlay")?.classList.contains("is-open")) syncPanelBackground();
    }, { passive: true });

    const burger = $("burgerToggle");
    if (burger){
      burger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
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

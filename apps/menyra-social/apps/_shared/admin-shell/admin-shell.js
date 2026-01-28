/* =========================================================
   MENYRA Admin Shell - SLIDING DRAWER (NO menu pages)
   - Burger opens drawer
   - Drawer background matches admin background (color + gradient)
   - Drawer menu is BUILT from existing sidebar (#sidebarNav)
   - No extra menu.html/menu.js/menu.css needed
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
    // Prefer <html> because admin gradient is on html, body is transparent
    return (
      document.documentElement ||
      document.querySelector(".m-app") ||
      document.querySelector(".app") ||
      document.querySelector(".page") ||
      document.body
    );
  }

  function syncPanelBackground(){
    const panel = $("menuPanel");
    if (!panel) return;

    const el = pickBgElement();
    const cs = window.getComputedStyle(el);

    panel.style.backgroundColor = cs.backgroundColor || "#ffffff";
    panel.style.backgroundImage = cs.backgroundImage || "none";
    panel.style.backgroundRepeat = cs.backgroundRepeat || "no-repeat";
    panel.style.backgroundPosition = cs.backgroundPosition || "center top";
    panel.style.backgroundSize = cs.backgroundSize || "cover";
    panel.style.backgroundAttachment = cs.backgroundAttachment || "scroll";

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

  function buildMenuFromSidebar(){
    const host = $("menuPage");
    if (!host) return;

    // Get existing sidebar links
    const sidebar = document.getElementById("sidebarNav");
    const links = sidebar ? Array.from(sidebar.querySelectorAll("a[data-section]")) : [];

    // Title from topbar logo or page title fallback
    const titleEl = document.querySelector(".m-topbar .m-brand-name") || document.querySelector(".m-topbar-title");
    const title = titleEl ? (titleEl.textContent || "").trim() : (document.title || "MENYRA");

    host.innerHTML = `
      <div class="m-menu-top">
        <div class="m-menu-title">${escapeHtml(title)}</div>
        <button class="m-menu-close" type="button" data-menu-close aria-label="Close">✕</button>
      </div>
      <div class="m-menu-list" id="mMenuList"></div>
      <div class="m-menu-divider"></div>
      <div class="m-menu-meta">Navigation • Burger öffnet dieses Menü.</div>
    `;

    const list = host.querySelector("#mMenuList");
    if (!list) return;

    if (!links.length){
      list.innerHTML = `<div class="m-menu-meta">Keine Navigation gefunden (#sidebarNav).</div>`;
      return;
    }

    const active = (
      document.querySelector('#sidebarNav a.is-active')?.getAttribute("data-section") ||
      document.querySelector('.m-view[style*="display: block"]')?.getAttribute("data-view") ||
      "dashboard"
    );

    links.forEach(a => {
      const sec = a.getAttribute("data-section") || "";
      const icon = (a.querySelector(".m-nav-icon")?.textContent || "").trim();
      const label = (a.querySelector(".m-nav-label")?.textContent || a.textContent || "").trim();

      const item = document.createElement("a");
      item.href = "#";
      item.className = "m-menu-item" + (sec === active ? " is-active" : "");
      item.setAttribute("data-section", sec);
      item.innerHTML = `<span class="ico">${escapeHtml(icon)}</span><span class="txt">${escapeHtml(label)}</span>`;
      list.appendChild(item);
    });

    host.querySelector("[data-menu-close]")?.addEventListener("click", close);

    // Delegate clicks
    host.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-section]");
      if (!a) return;
      e.preventDefault();
      const section = a.getAttribute("data-section");
      if (typeof window.__MENYRA_ADMIN_NAV === "function") {
        window.__MENYRA_ADMIN_NAV(section);
      } else {
        // fallback: click original sidebar link
        document.querySelector(`#sidebarNav a[data-section="${cssEscape(section)}"]`)?.click();
      }
      close();
    }, { passive: false });
  }

  function escapeHtml(s){
    return String(s || "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function cssEscape(s){
    try { return CSS.escape(s); } catch(e){ return String(s || "").replace(/[^a-zA-Z0-9_-]/g,""); }
  }

  function open(){
    ensureOverlay();
    syncPanelBackground();
    buildMenuFromSidebar();

    const overlay = $("menuOverlay");
    overlay.classList.add("is-open");
    overlay.style.display = "block";

    $("menuBackdrop")?.addEventListener("click", close, { once: true });
    window.addEventListener("keydown", onKeydown);

    // Back closes
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

  function init(){
    ensureOverlay();

    // keep panel bg synced on resize/orientation
    window.addEventListener("resize", () => {
      if ($("menuOverlay")?.classList.contains("is-open")) syncPanelBackground();
    }, { passive: true });

    const burger = $("burgerToggle");
    if (burger){
      burger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        open();
      }, true);
    }
  }

  window.MenyraAdminShell = { init, open, close };
})();

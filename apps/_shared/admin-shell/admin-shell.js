/* =========================================================
   MENYRA Admin Shell - Sliding Menu Page
   - opens via burgerToggle
   - loads menu.html into panel (fetch)
   - supports back button (history)
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

  async function loadMenuPage(menuUrl){
    const host = $("menuPage");
    if (!host) return;
    host.innerHTML = "<div class='m-menu-meta'>Loading…</div>";
    try{
      const res = await fetch(menuUrl, { cache: "no-cache" });
      const html = await res.text();
      host.innerHTML = html;

      // wire close button (inside loaded HTML)
      const closeBtn = host.querySelector("[data-menu-close]");
      closeBtn && closeBtn.addEventListener("click", () => window.MenyraAdminShell.close());

      // wire nav items
      host.addEventListener("click", (e) => {
        const a = e.target.closest("a[data-section]");
        if (!a) return;
        e.preventDefault();
        const section = a.getAttribute("data-section");
        if (typeof window.__MENYRA_ADMIN_NAV === "function") {
          window.__MENYRA_ADMIN_NAV(section);
        } else {
          // fallback: click original sidebar link
          const orig = document.querySelector(`[data-section="${section}"]`);
          orig && orig.click();
        }
        window.MenyraAdminShell.close();
      }, { passive: false });

      // mark active
      setActiveFromBody();
    }catch(err){
      console.error(err);
      host.innerHTML = "<div class='m-menu-meta'>Menu konnte nicht geladen werden.</div>";
    }
  }

  function setActiveFromBody(){
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
    ensureOverlay();
    const overlay = $("menuOverlay");
    overlay.classList.add("is-open");
    overlay.style.display = "block";

    loadMenuPage(menuUrl);

    // close on backdrop
    $("menuBackdrop")?.addEventListener("click", close, { once: true });

    // ESC close
    window.addEventListener("keydown", onKeydown);

    // push history state so back closes menu
    if (!history.state || history.state.__menyraMenuOpen !== true){
      history.pushState({ __menyraMenuOpen: true }, "");
    }
    window.addEventListener("popstate", onPopState, { once: true });
  }

  function close(){
    const overlay = $("menuOverlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    // after transition
    setTimeout(() => {
      overlay.style.display = "none";
    }, 260);
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

    const burger = $("burgerToggle");
    if (burger){
      burger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        open(menuUrl);
      }, true);
    }

    // also allow programmatic
    window.MenyraAdminShell._menuUrl = menuUrl;
  }

  window.MenyraAdminShell = {
    init,
    open: () => open(window.MenyraAdminShell._menuUrl || "./menu.html"),
    close
  };
})();

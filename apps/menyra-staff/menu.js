/* =========================================================
   MENYRA Admin Menu Page
   - Slides in on load
   - Returns to "ret" url (passed by burger click)
   - Selecting item returns with ?view=...
   ========================================================= */
(function(){
  const root = document.getElementById("menuRoot");
  const closeBtn = document.getElementById("menuCloseBtn");

  function getRet(){
    const p = new URLSearchParams(window.location.search);
    const ret = p.get("ret");
    // fallback to referrer or dashboard
    if (ret) return ret;
    return document.referrer ? document.referrer : "./dashboard.html";
  }

  function buildReturnUrl(view){
    const ret = getRet();
    try{
      const u = new URL(ret, window.location.href);
      if (view) u.searchParams.set("view", view);
      // keep as same-origin absolute (works in Live Server)
      return u.toString();
    }catch(e){
      // fallback simple
      if (!view) return ret;
      const sep = ret.includes("?") ? "&" : "?";
      return ret + sep + "view=" + encodeURIComponent(view);
    }
  }

  function enter(){
    requestAnimationFrame(() => root?.classList.add("is-open"));
  }

  function leaveAndGo(url){
    if (!root){
      window.location.href = url;
      return;
    }
    root.classList.remove("is-open");
    root.classList.add("is-close");
    const go = () => window.location.href = url;
    root.addEventListener("transitionend", go, { once: true });
    setTimeout(go, 320);
  }

  // close -> return without changing view
  closeBtn?.addEventListener("click", () => {
    leaveAndGo(buildReturnUrl(null));
  });

  // click menu item
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-view]");
    if (!a) return;
    e.preventDefault();
    const view = a.getAttribute("data-view");
    leaveAndGo(buildReturnUrl(view));
  });

  // ESC closes
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") leaveAndGo(buildReturnUrl(null));
  });

  // start
  enter();
})();

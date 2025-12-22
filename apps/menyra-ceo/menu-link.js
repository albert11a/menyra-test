/* =========================================================
   MENYRA Burger -> Menu Page (per admin)
   - Opens ./menu.html as a real page (no drawer)
   - Passes current page as ?ret=... so menu can return
   ========================================================= */
(function(){
  const burger = document.getElementById("burgerToggle");
  if (!burger) return;

  burger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    const curFile = (window.location.pathname.split("/").pop() || "");
    const cur = curFile + window.location.search;

    const url = new URL("./menu.html", window.location.href);
    // keep existing params (e.g. ?r=...)
    url.search = window.location.search || "";
    url.searchParams.set("ret", cur);
    window.location.href = url.toString();
  }, true);
})();

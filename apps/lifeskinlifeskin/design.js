// Opt-in presentation only. Existing controllers retain all state and actions.
(function () {
  const key = "lifeskin:mobile-design";
  const search = new URLSearchParams(location.search);
  const choice = search.get("ls_design");
  let active = location.pathname.replace(/\/$/, "") === "/lifeskinlifeskin" || choice === "mobile";
  try {
    if (choice === "classic") sessionStorage.removeItem(key);
    else if (active) sessionStorage.setItem(key, "mobile");
    else active = sessionStorage.getItem(key) === "mobile";
  } catch { /* Explicit links still work with disabled storage. */ }
  if (choice === "classic" || !active) return;
  document.documentElement.dataset.lsDesign = "mobile";
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/apps/lifeskinlifeskin/flow.css";
  document.head.append(stylesheet);
  const script = document.createElement("script");
  script.src = "/apps/lifeskinlifeskin/flow.js";
  script.defer = true;
  document.head.append(script);
  // A saved/shared report link carries the design to another device too.
  if (/^\/(analiza|terapia)\/[a-f0-9]{8,64}$/.test(location.pathname) && choice !== "mobile") {
    search.set("ls_design", "mobile");
    history.replaceState(history.state, "", location.pathname + "?" + search + location.hash);
  }
})();

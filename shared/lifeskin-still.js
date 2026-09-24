// DER STILLE MODUS - eigene Besuche, die in keiner Zahl landen.
//
// ?test=1 markiert einen Lauf als Test, schreibt ihn aber trotzdem: Er
// steht in Firestore, er geht an Meta, und er muss in Heart erst wieder
// herausgerechnet werden. Wer nur nachsehen will, wie eine Seite aussieht,
// soll gar nichts schreiben.
//
// WIE ES EINGESCHALTET WIRD:
//
//   ?still=1   schaltet ein - und merkt es sich auf diesem Geraet
//              (localStorage). Das ist der Masterlink: Wer einmal darueber
//              kam, bleibt still, egal welche Seite er danach oeffnet.
//   ?still=0   schaltet wieder aus.
//
// WAS ES TUT: Es laeuft als gewoehnliches Skript im Kopf der Seite, also
// VOR jedem Modul. Dort ersetzt es drei Wege nach draussen:
//
//   fetch      Jeder schreibende Aufruf an Firestore (alles ausser GET)
//              wird nicht gesendet und mit einem leeren "ok" beantwortet.
//              Lesen bleibt erlaubt - sonst ginge keine Seite auf.
//   sendBeacon wird verschluckt.
//   fbq        steht schon da, bevor der Pixel ihn laden will, und tut
//              nichts. Der Pixel laedt dann kein Skript von Meta.
//
// Ein Hinweis unten links sagt, dass der Modus an ist - sonst vergisst
// man ihn und wundert sich spaeter ueber fehlende eigene Faelle.
(function () {
  "use strict";
  var SCHLUESSEL = "mnyra:still";
  var an = false;
  try {
    var wunsch = new URLSearchParams(location.search).get("still");
    if (wunsch === "1") localStorage.setItem(SCHLUESSEL, "1");
    else if (wunsch === "0") localStorage.removeItem(SCHLUESSEL);
    an = wunsch === "1" || (wunsch !== "0" && localStorage.getItem(SCHLUESSEL) === "1");
  } catch (_e) {
    // Gesperrter Speicher: dann gilt nur der Link selbst.
    try { an = new URLSearchParams(location.search).get("still") === "1"; } catch (_f) { an = false; }
  }
  window.__mnyraStill = an;
  if (!an) return;

  var echtesFetch = window.fetch ? window.fetch.bind(window) : null;
  // batchGet und runQuery kommen als POST, lesen aber nur (Kundenfotos,
  // Kommentare) - die gehen durch, sonst fehlt im stillen Modus, was jeder
  // Besucher sieht.
  function nurLesen(url) {
    return /:(batchGet|runQuery|runAggregationQuery)(\?|$)/.test(url.split("#")[0]);
  }
  function schreibtStats(url, methode) {
    return /firestore\.googleapis\.com/.test(url) && methode !== "GET" && methode !== "HEAD" && !nurLesen(url);
  }
  // EINE BESTELLUNG IST KEINE STATISTIK.
  //
  // Der stille Modus bleibt auf dem Geraet, bis jemand ihn ausschaltet.
  // Bekommt ein echter Kunde einen Link mit ?still=1 (etwa den Link
  // "Therapieseite ansehen" aus Heart, weitergeschickt), saehe er
  // "Faleminderit" - und seine Bestellung kaeme nie an. Deshalb gehen
  // Bestellungen IMMER durch: die Sitzung mit "order" und der Bericht mit
  // "status". Sie tragen order.still = true, damit Heart eigene
  // Testbestellungen erkennt; verschwinden kann keine.
  function istBestellung(url) {
    return /updateMask\.fieldPaths=order(&|$)/.test(url)
      || (/\/reports\//.test(url) && /updateMask\.fieldPaths=status(&|$)/.test(url));
  }
  function mitStillMarke(optionen) {
    try {
      var body = JSON.parse(optionen.body);
      var order = body && body.fields && body.fields.order && body.fields.order.mapValue;
      if (order) {
        order.fields = order.fields || {};
        order.fields.still = { booleanValue: true };
        var neu = {};
        for (var k in optionen) neu[k] = optionen[k];
        neu.body = JSON.stringify(body);
        return neu;
      }
    } catch (_e) { /* unveraendert senden */ }
    return optionen;
  }

  window.fetch = function (eingabe, optionen) {
    var url = typeof eingabe === "string" ? eingabe : (eingabe && eingabe.url) || String(eingabe);
    var methode = String((optionen && optionen.method) || (eingabe && eingabe.method) || "GET").toUpperCase();
    if (schreibtStats(url, methode) && istBestellung(url) && echtesFetch) {
      return echtesFetch(eingabe, optionen && typeof optionen.body === "string" ? mitStillMarke(optionen) : optionen);
    }
    if (schreibtStats(url, methode)) {
      return Promise.resolve(new Response("{}", {
        status: 200, headers: { "Content-Type": "application/json" }
      }));
    }
    return echtesFetch ? echtesFetch(eingabe, optionen) : Promise.reject(new Error("fetch fehlt"));
  };
  try {
    if (navigator.sendBeacon) navigator.sendBeacon = function () { return true; };
  } catch (_e) { /* schreibgeschuetzt - dann bleibt er */ }
  var stumm = function () {};
  stumm.queue = [];
  stumm.push = stumm;
  stumm.loaded = true;
  stumm.version = "2.0";
  stumm.callMethod = stumm;
  window.fbq = stumm;
  window._fbq = stumm;

  function hinweis() {
    if (!document.body || document.getElementById("mnyra-still")) return;
    var knopf = document.createElement("a");
    knopf.id = "mnyra-still";
    knopf.href = location.pathname + "?still=0";
    knopf.title = "Tippen, um den stillen Modus auf diesem Geraet zu beenden";
    knopf.textContent = "Still · 0 Stats";
    knopf.setAttribute("style", [
      "position:fixed", "left:8px", "bottom:8px", "z-index:2147483647",
      "padding:4px 9px", "border-radius:999px", "background:rgba(20,20,20,.82)",
      "color:#9ff0c4", "font:600 11px/1.3 system-ui,sans-serif",
      "text-decoration:none", "pointer-events:auto", "opacity:.85"
    ].join(";"));
    knopf.addEventListener("click", function (ereignis) {
      if (!confirm("Stillen Modus beenden? Danach zaehlen Besuche wieder in den Stats.")) {
        ereignis.preventDefault();
      }
    });
    document.body.appendChild(knopf);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hinweis);
  else hinweis();
})();

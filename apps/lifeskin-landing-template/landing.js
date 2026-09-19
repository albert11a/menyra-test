/* LifeSkin - die Landingpage als Vorlage (/landingpagetemplate).
 *
 * DIESES SKRIPT TRAEGT KEINEN INHALT. Jeder Satz, jedes Bild und jeder
 * Knopf steht im Aufbau und ist da, sobald die erste Antwort des
 * Servers da ist. Hier kommt ausschliesslich Bewegung dazu - kommt die
 * Datei nie an (altes Telefon, abgebrochene Verbindung, blockiertes
 * Skript), steht die Seite trotzdem ganz und ist bedienbar.
 *
 * Deshalb auch kein Modul und keine Abhaengigkeit: eine Datei, kein
 * Import, nichts, was vorher geladen sein muesste.
 *
 * ALLES HAENGT AN IntersectionObserver statt an einem scroll-Lauscher,
 * der bei jedem Punkt rechnet. Der eine Lauscher, den es doch gibt
 * (Fortschritt und Kopfzeile), rechnet in requestAnimationFrame und
 * damit hoechstens einmal je Bild.
 */
(function () {
  "use strict";

  var WENIGER_BEWEGUNG =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. Hereinkommen ─────────────────────────────────────────────
   *
   * Je STUECK, nicht je Abschnitt: Ueberschrift, einzelne Kachel,
   * einzelne Karte. Ein ganzer Abschnitt, der auf einmal erscheint,
   * wirkt wie ein Nachladen; ein Stueck nach dem anderen wirkt wie
   * Aufmerksamkeit.
   *
   * DIE STAFFELUNG WIRD GEZAEHLT, NICHT GESCHRIEBEN: Geschwister, die
   * im selben Augenblick ins Bild kommen, bekommen der Reihe nach 0,
   * 70, 140 ms. Stuende die Zahl im Aufbau, muesste sie bei jeder
   * dazugenommenen Kachel nachgezogen werden - und genau das wuerde
   * vergessen.
   *
   * Der untere Rand (-8%) laesst das Stueck erst ausloesen, wenn es
   * wirklich im Bild ist und nicht schon halb darunter. Jedes Stueck
   * wird genau einmal ausgeloest; danach wird es nicht mehr beobachtet. */
  var stuecke = document.querySelectorAll("[data-anim]");

  if (!("IntersectionObserver" in window)) {
    // Kein Beobachter: alles sofort zeigen. Lieber ohne Bewegung als
    // unsichtbar.
    for (var i = 0; i < stuecke.length; i++) stuecke[i].classList.add("ein");
  } else {
    var waechter = new IntersectionObserver(function (eintraege) {
      var jetztSichtbar = [];
      eintraege.forEach(function (eintrag) {
        if (!eintrag.isIntersecting) return;
        jetztSichtbar.push(eintrag.target);
        waechter.unobserve(eintrag.target);
      });
      // Nach Lage im Dokument ordnen, damit die Staffelung von oben
      // nach unten laeuft und nicht in der Reihenfolge, in der der
      // Beobachter meldet - die ist nicht zugesichert.
      //
      // Geordnet wird nach der Nummer, die jedes Stueck beim Anmelden
      // bekommen hat (querySelectorAll liefert in Dokumentreihenfolge).
      // Das ist eine Zahl je Stueck statt eines Vergleichs, der bei
      // jedem Bild durch den Baum laeuft.
      jetztSichtbar.sort(function (a, b) {
        return a.__lsNr - b.__lsNr;
      });
      jetztSichtbar.forEach(function (stueck, stelle) {
        var eigen = stueck.getAttribute("data-anim-schritt");
        stueck.style.setProperty(
          "--anim-schritt",
          eigen !== null ? eigen : Math.min(stelle, 5)
        );
        stueck.classList.add("ein");
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    for (var j = 0; j < stuecke.length; j++) {
      stuecke[j].__lsNr = j;
      waechter.observe(stuecke[j]);
    }
  }

  /* ── 2. Die drei Zahlen zaehlen hoch ─────────────────────────────
   *
   * Bewegung an einer Zahl liest das Auge als Messung, nicht als
   * Werbung - und diese drei Zahlen sind das ganze Angebot. Gezaehlt
   * wird einmal, beim ersten Erscheinen.
   *
   * Der Endwert steht im Aufbau und wird nur waehrend des Zaehlens
   * ueberschrieben: Wer das Skript blockiert oder weniger Bewegung
   * eingestellt hat, sieht 28 und nicht 0. */
  var zahlen = document.querySelectorAll("[data-zaehl]");
  if (!WENIGER_BEWEGUNG && "IntersectionObserver" in window) {
    var zaehlWaechter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (eintrag) {
        if (!eintrag.isIntersecting) return;
        zaehlWaechter.unobserve(eintrag.target);
        zaehlen1(eintrag.target);
      });
    }, { threshold: 0.6 });
    for (var k = 0; k < zahlen.length; k++) zaehlWaechter.observe(zahlen[k]);
  }

  function zaehlen1(feld) {
    var ziel = parseInt(feld.getAttribute("data-zaehl"), 10);
    var anhang = feld.getAttribute("data-zaehl-suffix") || "";
    if (!isFinite(ziel)) return;
    var dauer = 1000;
    var beginn = 0;

    function schritt(zeit) {
      if (!beginn) beginn = zeit;
      var teil = Math.min((zeit - beginn) / dauer, 1);
      // Am Ende langsamer: Eine Zahl, die gleichmaessig hochlaeuft,
      // sieht aus wie ein Ladebalken; eine, die ausrollt, wie ein
      // Messwert, der sich einpendelt.
      var weich = 1 - Math.pow(1 - teil, 3);
      feld.textContent = Math.round(ziel * weich) + anhang;
      if (teil < 1) requestAnimationFrame(schritt);
      else feld.textContent = ziel + anhang;
    }
    feld.textContent = "0" + anhang;
    requestAnimationFrame(schritt);
  }

  /* ── 3. Die Linie im Weg zeichnet sich ───────────────────────────
   * Sie laeuft dem Blick voraus statt hinterher. */
  var hapat = document.getElementById("hapat");
  if (hapat && "IntersectionObserver" in window) {
    var linienWaechter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (eintrag) {
        if (!eintrag.isIntersecting) return;
        linienWaechter.unobserve(eintrag.target);
        eintrag.target.setAttribute("data-gezeichnet", "ja");
      });
    }, { threshold: 0.2 });
    linienWaechter.observe(hapat);
  } else if (hapat) {
    hapat.setAttribute("data-gezeichnet", "ja");
  }

  /* ── 4. Fortschritt und Kopfzeile ────────────────────────────────
   *
   * Ein Lauscher fuer beides, und er rechnet in
   * requestAnimationFrame: Ohne die Sperre rechnet er in den Browsern
   * von Instagram und TikTok mehrere Dutzend Mal je Bild, und das
   * Scrollen wird ruckelig auf genau den Geraeten, auf denen diese
   * Seite ankommt. */
  var balken = document.getElementById("fortschritt-balken");
  var kopf = document.querySelector(".kopf");
  var wartet = false;

  function messen() {
    wartet = false;
    var hoehe = document.documentElement.scrollHeight - window.innerHeight;
    var oben = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (balken) {
      var teil = hoehe > 0 ? Math.min(Math.max(oben / hoehe, 0), 1) : 0;
      balken.style.setProperty("--gelesen", (teil * 100).toFixed(2) + "%");
    }
    if (kopf) kopf.setAttribute("data-fest", oben > 24 ? "ja" : "nein");
  }

  function anstossen() {
    if (wartet) return;
    wartet = true;
    requestAnimationFrame(messen);
  }

  window.addEventListener("scroll", anstossen, { passive: true });
  window.addEventListener("resize", anstossen, { passive: true });
  messen();

  /* ── 5. Der feste Knopf unten ────────────────────────────────────
   *
   * Er kommt erst, wenn der erste Blick durchgescrollt ist: Davor
   * steht derselbe Knopf schon im Bild, und zweimal dasselbe
   * nebeneinander sieht nach Panik aus. Am Ende der Seite geht er
   * wieder weg - dort steht der grosse Knopf, und der feste wuerde ihn
   * nur zudecken. */
  var dock = document.getElementById("dock");
  var held = document.getElementById("held");
  var fund = document.getElementById("fund");

  if (dock && "IntersectionObserver" in window) {
    dock.hidden = false;
    var obenDrin = true;
    var untenDrin = false;

    function dockPruefen() {
      dock.setAttribute("data-sichtbar", !obenDrin && !untenDrin ? "ja" : "nein");
    }

    if (held) {
      new IntersectionObserver(function (eintraege) {
        obenDrin = eintraege[0].isIntersecting;
        dockPruefen();
      }, { threshold: 0.28 }).observe(held);
    } else {
      obenDrin = false;
    }

    if (fund) {
      new IntersectionObserver(function (eintraege) {
        untenDrin = eintraege[0].isIntersecting;
        dockPruefen();
      }, { threshold: 0.3 }).observe(fund);
    }

    dockPruefen();
  }

  /* ── 6. Die Punkte unter den Faellen ─────────────────────────────
   *
   * Sie ZAEHLEN SICH SELBST: Eine Karte dazunehmen heisst, den
   * <article>-Block zu kopieren - und nicht, hier eine Zahl
   * nachzuziehen, die sonst beim naechsten Mal vergessen wird.
   *
   * Sie sind eine Anzeige, kein Bedienelement (aria-hidden am
   * Behaelter): Wer wischt, braucht keinen Knopf dafuer, und ein Punkt
   * ist ein zu kleines Ziel fuer einen Daumen. */
  var bahn = document.getElementById("rastet");
  var punkte = document.getElementById("pikat");

  if (bahn && punkte) {
    var karten = bahn.children;
    if (karten.length > 1) {
      for (var p = 0; p < karten.length; p++) {
        punkte.appendChild(document.createElement("i"));
      }
      var punktWartet = false;

      function punkteSetzen() {
        punktWartet = false;
        // Die Karten sind gleich breit, also reicht der Abstand von
        // Karte 1 zu Karte 2 als Schrittweite - inklusive Luft
        // dazwischen, ohne sie getrennt zu kennen.
        var schrittweite = karten[1].offsetLeft - karten[0].offsetLeft;
        if (schrittweite <= 0) return;
        var stelle = Math.round(bahn.scrollLeft / schrittweite);
        stelle = Math.min(Math.max(stelle, 0), karten.length - 1);
        for (var q = 0; q < punkte.children.length; q++) {
          punkte.children[q].setAttribute("data-an", q === stelle ? "ja" : "nein");
        }
      }

      bahn.addEventListener("scroll", function () {
        if (punktWartet) return;
        punktWartet = true;
        requestAnimationFrame(punkteSetzen);
      }, { passive: true });

      window.addEventListener("resize", punkteSetzen, { passive: true });
      punkteSetzen();
    }
  }

  /* ── 7. Die Fragen schliessen sich weich ─────────────────────────
   *
   * <details> oeffnet von selbst weich (grid-template-rows im
   * Stilblatt), schliesst aber hart: Der Browser nimmt [open] im
   * selben Augenblick weg, in dem getippt wird, und der Inhalt ist
   * verschwunden, bevor die Bewegung anfangen kann.
   *
   * Also: beim Schliessen die Bewegung laufen lassen und [open] erst
   * danach wegnehmen. Wird waehrenddessen noch einmal getippt, wird
   * sofort wieder geoeffnet - kein Warten auf eine Bewegung, die
   * niemand mehr sehen will. */
  var fragen = document.querySelectorAll(".pyetje");
  for (var f = 0; f < fragen.length; f++) {
    (function (frage) {
      var schalter = frage.querySelector("summary");
      if (!schalter) return;
      var uhr = null;

      schalter.addEventListener("click", function (ereignis) {
        if (uhr) {
          // Mitten im Schliessen noch einmal getippt: zurueck auf offen.
          clearTimeout(uhr);
          uhr = null;
          frage.removeAttribute("data-schliesst");
          ereignis.preventDefault();
          frage.open = true;
          return;
        }
        if (!frage.open) return;           // Oeffnen macht der Browser.
        ereignis.preventDefault();
        if (WENIGER_BEWEGUNG) { frage.open = false; return; }
        frage.setAttribute("data-schliesst", "ja");
        uhr = setTimeout(function () {
          frage.open = false;
          frage.removeAttribute("data-schliesst");
          uhr = null;
        }, 300);
      });
    })(fragen[f]);
  }
})();

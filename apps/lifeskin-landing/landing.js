/* LifeSkin - die Landingpage, die /lifeskin ausliefert.
 *
 * DIESES SKRIPT TRAEGT KEINEN INHALT. Jeder Satz, jedes Bild und jeder
 * Knopf steht im Aufbau und ist da, sobald die erste Antwort des
 * Servers da ist. Hier kommt ausschliesslich Bewegung dazu - kommt die
 * Datei nie an (altes Telefon, abgebrochene Verbindung, blockiertes
 * Skript), steht die Seite trotzdem ganz und ist bedienbar.
 *
 * Deshalb auch kein Modul und keine Abhaengigkeit: eine Datei, kein
 * Import, nichts, was vorher geladen sein muesste. Insbesondere haengt
 * sie NICHT an lifeskin-app.js - die Landingpage bewegt sich auch
 * dann, wenn die elf Module des Trichters noch unterwegs sind.
 *
 * ABGELEITET AUS apps/lifeskin-landing-template/landing.js. Zwei
 * Unterschiede und sonst keiner:
 *
 *   1. GESCROLLT WIRD EIN KASTEN, NICHT DAS FENSTER. Der Einstieg ist
 *      ein Bildschirm des Trichters, und dort scrollt nie die Seite -
 *      html und body stehen auf overflow: hidden. Gemessen wird
 *      deshalb an #lp. Der Fortschrittsbalken der Vorlage faellt ganz
 *      weg: Der Trichter hat seinen eigenen.
 *   2. DIE DREI KNOEPFE FUEHREN AN DIE KAMERA, nicht auf eine zweite
 *      Seite. Einer davon traegt die Kennung, die lifeskin-app.js
 *      kennt; die anderen beiden reichen ihren Tipp an ihn weiter.
 *
 * ALLES ANDERE HAENGT AN IntersectionObserver statt an einem
 * scroll-Lauscher, der bei jedem Punkt rechnet - und der Beobachter
 * misst gegen das Fenster, also unabhaengig davon, welcher Kasten
 * darunter scrollt.
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

  /* ── 2. Die Zahlen zaehlen hoch - GIBT ES NICHT MEHR ─────────────
   *
   * Hier lief ein Zaehler ueber [data-zaehl] - fuer das Band mit "28
   * ditë" und "1 plan" unter dem ersten Blick. Das Band ist von der
   * Seite weg (siehe index.html, Abschnitt 02), und damit haengt der
   * Zaehler an nichts mehr.
   *
   * Wer wieder eine Zahl dort hinstellt, braucht ihn zurueck: ein
   * IntersectionObserver bei threshold 0.6, der den Endwert aus
   * data-zaehl einmal hochzaehlt und ihn bei abgeschalteter Bewegung
   * einfach stehen laesst. Der Endwert gehoert dabei in den Aufbau und
   * nicht ins Skript - sonst steht dort eine 0, wenn das Skript nicht
   * laedt. */

  /* ── 3. Der Aufdecker ueber der zweiten Aufnahme ─────────────────
   *
   * ER HAENGT AN EINEM EIGENEN BEOBACHTER, nicht mehr am allgemeinen
   * Hereinkommen. Vorher trug jede Fallkarte ein data-anim und damit
   * einen Versatz von 20 Punkten nach unten. Beim Wischen fuhr die
   * neue Karte von unten herein, waehrend die vorige schon oben
   * stand - zwei Karten nebeneinander auf verschiedener Hoehe, und das
   * sah aus wie eine Seite, die beim Wischen wackelt.
   *
   * Jetzt kommt die ganze Bahn EINMAL herein (data-anim steht an
   * #rastet), und die einzelne Karte bekommt hier nur noch ein
   * Merkmal, an dem das Stilblatt den Zuschnitt aufzieht. Ein
   * Zuschnitt verschiebt nichts - deshalb kann er beim Wischen nicht
   * wackeln.
   *
   * Der Schwellenwert ist hoch (0,55): Die zweite Aufnahme soll erst
   * aufgedeckt werden, wenn die Karte wirklich angesehen wird, und
   * nicht schon, waehrend sie am Rand vorbeizieht. */
  var faelle = document.querySelectorAll(".rasti");
  if ("IntersectionObserver" in window) {
    var fallWaechter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (eintrag) {
        if (!eintrag.isIntersecting) return;
        fallWaechter.unobserve(eintrag.target);
        eintrag.target.setAttribute("data-gesehen", "ja");
      });
    }, { threshold: 0.55 });
    for (var r = 0; r < faelle.length; r++) fallWaechter.observe(faelle[r]);
  } else {
    for (var r2 = 0; r2 < faelle.length; r2++) {
      faelle[r2].setAttribute("data-gesehen", "ja");
    }
  }

  /* ── 4. Die Linie im Weg zeichnet sich ───────────────────────────
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

  /* ── 5. Die Kopfzeile ───────────────────────────────────────────
   *
   * Sie bekommt eine Flaeche und eine Haarlinie, sobald etwas unter
   * ihr durchlaeuft - im ersten Blick soll nichts zwischen dem Rand
   * und der Ueberschrift liegen.
   *
   * GEMESSEN WIRD #lp UND NICHT DAS FENSTER. Das Fenster scrollt auf
   * dieser Seite nie: html und body stehen auf overflow: hidden, ein
   * Bildschirm IST die Fensterhoehe. Ein Lauscher am Fenster haette
   * kein einziges Mal ausgeloest, und die Kopfzeile waere ueber der
   * ganzen Seite durchsichtig geblieben.
   *
   * Gerechnet wird in requestAnimationFrame: Ohne die Sperre rechnet
   * der Lauscher in den Browsern von Instagram und TikTok mehrere
   * Dutzend Mal je Bild, und das Scrollen wird ruckelig auf genau den
   * Geraeten, auf denen diese Seite ankommt. */
  var kasten = document.getElementById("lp");
  var kopf = document.querySelector(".kopf");
  var wartet = false;

  function messen() {
    wartet = false;
    if (!kopf || !kasten) return;
    kopf.setAttribute("data-fest", kasten.scrollTop > 24 ? "ja" : "nein");
  }

  function anstossen() {
    if (wartet) return;
    wartet = true;
    requestAnimationFrame(messen);
  }

  if (kasten) {
    kasten.addEventListener("scroll", anstossen, { passive: true });
    // Auf iOS kommen waehrend des Schwungs nach dem Loslassen nicht
    // verlaesslich Scrollereignisse - am Finger selbst schon.
    kasten.addEventListener("touchmove", anstossen, { passive: true });
  }
  window.addEventListener("resize", anstossen, { passive: true });
  messen();

  /* ── 6. Der feste Knopf unten ────────────────────────────────────
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

  /* ── 7. Die Punkte unter den Faellen ─────────────────────────────
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

  /* <details> oeffnet von selbst weich (grid-template-rows im
   * Stilblatt), schliesst aber hart: Der Browser nimmt [open] im
   * selben Augenblick weg, in dem getippt wird, und der Inhalt ist
   * verschwunden, bevor die Bewegung anfangen kann.
   *
   * Also: beim Schliessen die Bewegung laufen lassen und [open] erst
   * danach wegnehmen. Wird waehrenddessen noch einmal getippt, wird
   * sofort wieder geoeffnet - kein Warten auf eine Bewegung, die
   * niemand mehr sehen will. */
  /* ── 8. Die drei Knoepfe fuehren an dieselbe Stelle ──────────────
   *
   * Es gibt drei Knoepfe mit demselben Wort: oben im ersten Blick, ganz
   * unten im letzten Griff und der feste am Rand. Einer davon traegt
   * die Kennung ls-start, die lifeskin-app.js anspricht - eine Kennung
   * darf es nur einmal geben.
   *
   * Die anderen beiden reichen ihren Tipp an ihn weiter. Das ist der
   * kurze Weg: Die Alternative waere, lifeskin-app.js drei Knoepfe
   * anbinden zu lassen - und dieselbe Datei traegt /lifeskintrichter
   * und apps/lifeskin/ mit, wo es weiter genau einen gibt.
   *
   * Gehorcht wird am Dokument und nicht an den Knoepfen selbst: So
   * wirkt es auch fuer einen Knopf, den jemand spaeter dazustellt. */
  document.addEventListener("click", function (ereignis) {
    var knopf = ereignis.target && ereignis.target.closest
      ? ereignis.target.closest("[data-ls-start]")
      : null;
    if (!knopf || knopf.id === "ls-start") return;
    var haupt = document.getElementById("ls-start");
    if (haupt) haupt.click();
  });

  /* ── 9. Die Fragen schliessen sich weich ─────────────────────────── */
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

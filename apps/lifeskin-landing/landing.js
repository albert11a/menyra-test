/* LifeSkin - die Landingpage, die /lifeskin ausliefert.
 *
 * DIESES SKRIPT TRAEGT KEINEN INHALT. Jeder Satz, jedes Bild und jeder
 * Knopf steht im Aufbau und ist da, sobald die erste Antwort des
 * Servers da ist. Hier kommt ausschliesslich Bewegung dazu, dazu die
 * Zaehlung der Abschnitte - kommt die Datei nie an (altes Telefon,
 * abgebrochene Verbindung, blockiertes Skript), steht die Seite
 * trotzdem ganz und ist bedienbar.
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
 *   2. DIE KNOEPFE FUEHREN AUF DEN WAHLBILDSCHIRM, nicht auf eine
 *      zweite Seite. Einer davon traegt die Kennung, die
 *      lifeskin-app.js kennt; die anderen reichen ihren Tipp an ihn
 *      weiter.
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

  /* ── 0. DIE ZAEHLUNG DER ABSCHNITTE ───────────────────────────────
   *
   * KEINE ZWEITE MESSTECHNIK. Gemeldet wird ueber genau den Kanal, den
   * der Trichter ohnehin hat: fbq, angelegt und gestartet von
   * lifeskin-pixel.js. Steht dort keine Kennung oder fehlt die
   * Zustimmung, gibt es kein fbq - dann passiert hier nichts, und zwar
   * still. Kein zweites Analysewerkzeug, kein eigener Endpunkt, keine
   * eigene Kennung.
   *
   * DIE NAMEN SIND DIE DER ABSCHNITTE und nicht die der Trichterstufen.
   * lifeskin-pixel.js meldet, WIE WEIT jemand im Trichter gekommen ist
   * ("lifeskin_method_view" ist der Wahlbildschirm). Hier wird gemeldet,
   * WAS AUF DER LANDINGPAGE GESEHEN wurde - das ist eine andere Frage,
   * und sie hat deshalb eigene Namen mit eigenem Vorsatz (lp).
   *
   * GENAU EINMAL JE BESUCH, dieselbe Sperre wie im Pixel: Wer
   * hochscrollt und wieder herunter, hat den Abschnitt nicht zweimal
   * gesehen.
   *
   * ES GEHT NICHTS HINAUS, WAS EINEN MENSCHEN BESCHREIBT. Gemeldet wird
   * ein Name und sonst nichts - keine Haut, keine Beschwerde, kein
   * Alter. Das ist keine Vorsicht, sondern die Bedingung: Was hier
   * gemessen wird, ist die Seite, nicht der Besucher. */
  var gemeldet = Object.create(null);

  function melde(name) {
    if (!name || gemeldet[name]) return;
    gemeldet[name] = true;
    try {
      if (typeof window.fbq === "function") window.fbq("trackCustom", name);
    } catch {
      /* Messtechnik darf den Weg nie anhalten. */
    }
  }

  melde("lifeskin_lp_view");

  /* Welcher Abschnitt welchen Namen meldet. Ein Abschnitt, den es auf
   * der Seite nicht (mehr) gibt, faellt hier still weg - er wird nur
   * dann beobachtet, wenn er da ist. */
  var ABSCHNITTE = {
    menyrat:    "lifeskin_method_section_view",
    rezultatet: "lifeskin_results_view",
    komuniteti: "lifeskin_instagram_proof_view",
    produktet:  "lifeskin_product_section_view",
    garancia:   "lifeskin_guarantee_view"
  };

  if ("IntersectionObserver" in window) {
    var sichtWaechter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (eintrag) {
        if (!eintrag.isIntersecting) return;
        sichtWaechter.unobserve(eintrag.target);
        melde(ABSCHNITTE[eintrag.target.id]);
      });
    }, { threshold: 0.3 });

    for (var name in ABSCHNITTE) {
      var abschnitt = document.getElementById(name);
      if (abschnitt) sichtWaechter.observe(abschnitt);
    }
  }

  /* Welcher Knopf den Einstieg ausgeloest hat. Das ist die Frage, die
   * spaeter entscheidet, welcher Abschnitt dieser Seite wirklich
   * verkauft - und sie laesst sich nur beantworten, wenn sie beim Tipp
   * festgehalten wird.
   *
   * ES AENDERT NICHTS AM WEG. Jeder dieser Knoepfe fuehrt auf denselben
   * Wahlbildschirm; die Quelle wird notiert und sonst nichts. */
  var QUELLEN = {
    hero:     "lifeskin_hero_cta_click",
    methods:  "lifeskin_method_cta_click",
    products: "lifeskin_product_cta_click",
    final:    "lifeskin_final_cta_click",
    sticky:   "lifeskin_sticky_cta_click"
  };

  function quelleMerken(quelle) {
    if (!quelle) return;
    window.__lifeskinCtaQuelle = quelle;
    try {
      window.sessionStorage.setItem("lifeskin_cta_quelle", quelle);
    } catch {
      /* Privater Modus, gesperrter Speicher: Die Angabe ist eine
         Zugabe und nichts, wofuer jemand stehen bleiben soll. */
    }
    melde(QUELLEN[quelle]);
  }

  /* ── 1. Hereinkommen ─────────────────────────────────────────────
   *
   * Je STUECK, nicht je Abschnitt: Ueberschrift, einzelne Kachel,
   * einzelne Karte. Ein ganzer Abschnitt, der auf einmal erscheint,
   * wirkt wie ein Nachladen; ein Stueck nach dem anderen wirkt wie
   * Aufmerksamkeit.
   *
   * DIE STAFFELUNG WIRD GEZAEHLT, NICHT GESCHRIEBEN: Geschwister, die
   * im selben Augenblick ins Bild kommen, bekommen der Reihe nach 0,
   * 70, 140 ms (im ersten Blick 0, 50, 100 - siehe landing.css).
   * Stuende die Zahl im Aufbau, muesste sie bei jeder dazugenommenen
   * Kachel nachgezogen werden - und genau das wuerde vergessen.
   *
   * HOECHSTENS VIER SCHRITTE. Vorher waren es sechs, und der sechste
   * kam damit 420 ms nach dem ersten herein - der Daumen war da laengst
   * weiter. Ein Abschnitt muss fertig sein, waehrend er im Bild ist.
   *
   * Der untere Rand (-8%) laesst das Stueck erst ausloesen, wenn es
   * wirklich im Bild ist und nicht schon halb darunter. Jedes Stueck
   * wird genau einmal ausgeloest; danach wird es nicht mehr
   * beobachtet. */
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
          eigen !== null ? eigen : Math.min(stelle, 4)
        );
        stueck.classList.add("ein");
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    for (var j = 0; j < stuecke.length; j++) {
      stuecke[j].__lsNr = j;
      waechter.observe(stuecke[j]);
    }
  }

  /* ── 2. HIER STAND DER AUFDECKER ─────────────────────────────────
   *
   * Ein eigener Beobachter setzte an jeder Fallkarte data-gesehen="ja",
   * sobald sie zu 55 % im Bild war; das Stilblatt wischte daraufhin die
   * zweite Aufnahme per clip-path herein und blendete das Schild "PAS"
   * ein.
   *
   * ER IST AUF WUNSCH WEG, und er fehlt nicht: Ein Vergleich lebt
   * davon, dass beide Aufnahmen gleichzeitig dastehen. In der Bahn kam
   * dazu, dass die Bewegung oft ablief, waehrend die Karte noch halb am
   * Rand stand - also ohne dass jemand hinsah. Die Karten tragen kein
   * data-gesehen mehr, und das Stilblatt zieht nichts mehr daran auf. */

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

  /* ── 4. JEDE MENYRA-KARTE FUEHRT IN IHREN EIGENEN WEG ────────────
   *
   * HIER STAND DIE KOPFZEILE, die beim Scrollen eine Flaeche bekam. Sie
   * klebt nicht mehr oben (siehe landing.css): Auf einer Seite, die
   * gelesen und nicht bedient wird, nahm sie zusammen mit der festen
   * Leiste unten rund 150 Punkte Inhalt weg und trug dafuer nichts als
   * das Wortzeichen. Damit gibt es auch nichts mehr zu messen.
   *
   * WAS DIE KARTEN TUN. Vorher fuehrten alle vier auf den
   * Wahlbildschirm - und dort standen dieselben vier noch einmal. Jetzt
   * loest die Karte genau die zwei Griffe aus, die der Besucher sonst
   * von Hand gemacht haette:
   *
   *   1. #ls-start - lifeskin-app.js zaehlt die Stufe "wahl" und
   *      schaltet den Wahlbildschirm auf.
   *   2. die passende Karte darin - #wegWaehlen() schreibt den Typ,
   *      meldet den Weg an den Pixel und geht weiter.
   *
   * BEIDES IM SELBEN ZUG, also in einem einzigen JavaScript-Durchlauf:
   * Der Browser zeichnet dazwischen nicht, der Wahlbildschirm blitzt
   * nicht auf. Am Trichter ist dafuer keine Zeile geaendert - jede
   * Zaehlung, jeder Schreibvorgang und der Zurueck-Pfeil verhalten sich
   * wie bei einem Tipp von Hand. Zurueck fuehrt deshalb auf die Wahl,
   * wo sich der Weg wechseln laesst, und nicht auf die Landingpage.
   *
   * WER TIPPT, BEVOR DIE MODULE DA SIND, bekommt seinen Weg nachgeholt:
   * Das kurze Skript im <head> merkt ihn sich, hier wird gewartet, bis
   * lifeskin-app.js bereit ist. Zwoelf Sekunden lang - danach war es
   * keine langsame Leitung mehr, sondern ein Fehler, und ein Knopf, der
   * ewig wartet, ist schlimmer als einer, der nichts tut. */
  function metodeGehen(weg) {
    var haupt = document.getElementById("ls-start");
    var karte = document.querySelector('#ls-wahl [data-ls-weg="' + weg + '"]');
    if (!haupt || !karte) return false;
    haupt.click();
    karte.click();
    return true;
  }

  var metodaUhr = null;
  var metodaVersuche = 0;

  function metodeNachholen(weg, knopf) {
    if (window.__lifeskinBereit) {
      if (knopf) delete knopf.dataset.wartet;
      metodeGehen(weg);
      return;
    }
    if (metodaUhr) return;
    metodaVersuche = 0;
    metodaUhr = setInterval(function () {
      metodaVersuche += 1;
      if (!window.__lifeskinBereit) {
        if (metodaVersuche < 120) return;
      }
      clearInterval(metodaUhr);
      metodaUhr = null;
      if (knopf) delete knopf.dataset.wartet;
      if (window.__lifeskinBereit) metodeGehen(weg);
    }, 100);
  }

  /* Der Tipp, der vor diesem Skript kam. */
  if (window.__lifeskinFrueherMetoda) {
    (function () {
      var weg = window.__lifeskinFrueherMetoda;
      window.__lifeskinFrueherMetoda = null;
      metodeNachholen(weg, document.querySelector('[data-ls-metoda="' + weg + '"]'));
    })();
  }

  /* ── 5. Der feste Knopf unten ────────────────────────────────────
   *
   * Er kommt erst, wenn der erste Blick durchgescrollt ist: Davor
   * steht derselbe Knopf schon im Bild, und zweimal dasselbe
   * nebeneinander sieht nach Panik aus. Am Ende der Seite geht er
   * wieder weg - dort steht der grosse Knopf, und der feste wuerde ihn
   * nur zudecken. */
  /* ER WEICHT ZWEI STELLEN AUS UND NICHT MEHR DREIEN.
   *
   * Er wich einmal auch dem Raster der vier Menyra aus. Das war
   * folgerichtig gedacht - zwei gleich aussehende Hauptaktionen
   * nebeneinander sind eine zu viel - und in der Benutzung zu viel
   * Ruecksicht: Das Raster ist hoch, man haelt sich lange darin auf,
   * und in der ganzen Zeit lag unten kein Griff mehr. Wer sich dort
   * nicht entscheidet, scrollt weiter und hat nichts.
   *
   * Jetzt sind es zwei Wachen - der Knopf im ersten Blick und der am
   * Schluss -, und dazwischen liegt die Leiste durchgehend. Ueber den
   * vier Karten ist sie keine zweite Aktion: Sie fuehrt an dieselbe
   * Stelle wie jede von ihnen.
   *
   * Auf dem Schreibtisch gibt es sie gar nicht - dort ist immer genug
   * Platz fuer die Knoepfe im Inhalt (siehe die @media-Regel in
   * landing.css).
   *
   * Beim Eintritt in den Trichter verschwindet er von selbst: Er liegt in
   * <section id="ls-einstieg">, und die schaltet lifeskin-app.js weg. */
  var dock = document.getElementById("dock");
  var konkurrenz = document.querySelectorAll("[data-ls-konkurrenz]");

  if (dock && konkurrenz.length && "IntersectionObserver" in window) {
    dock.hidden = false;
    var offen = 0;

    /* BEOBACHTET WIRD DIE HANDLUNG, NICHT DER ABSCHNITT.
     *
     * GEMESSEN, NICHT GESCHAETZT: Zuerst standen hier die vier
     * Abschnitte mit threshold 0,2. Ein Abschnitt, der hoeher ist als
     * das Fenster, erreicht diesen Anteil aber erst weit in seiner
     * Mitte und faellt am Rand wieder darunter - der Knopf flackerte
     * dreimal, waehrend man durch den Produktabschnitt scrollte.
     *
     * Die Knopfreihe selbst ist ein paar Dutzend Punkte hoch. Mit
     * threshold 0 heisst "sichtbar" dann genau das, worum es geht:
     * Es steht eine Hauptaktion im Bild, also braucht es keine zweite. */
    var dockWaechter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (eintrag) {
        if (eintrag.isIntersecting) {
          if (!eintrag.target.__lsOffen) { eintrag.target.__lsOffen = true; offen += 1; }
        } else if (eintrag.target.__lsOffen) {
          eintrag.target.__lsOffen = false;
          offen -= 1;
        }
      });
      dock.setAttribute("data-sichtbar", offen > 0 ? "nein" : "ja");
    }, { threshold: 0 });

    for (var d = 0; d < konkurrenz.length; d++) dockWaechter.observe(konkurrenz[d]);
    dock.setAttribute("data-sichtbar", "nein");
  }

  /* ── 6. Die Punkte unter den Faellen ─────────────────────────────
   *
   * Sie ZAEHLEN SICH SELBST: Eine Karte dazunehmen heisst, den
   * <article>-Block zu kopieren - und nicht, hier eine Zahl
   * nachzuziehen, die sonst beim naechsten Mal vergessen wird.
   *
   * Sie sind eine Anzeige, kein Bedienelement (aria-hidden am
   * Behaelter): Wer wischt, braucht keinen Knopf dafuer, und ein Punkt
   * ist ein zu kleines Ziel fuer einen Daumen. Wer nicht wischen kann,
   * bewegt die Bahn mit den Pfeiltasten - sie traegt dafuer tabindex. */
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

  /* ── 7. Alle Knoepfe fuehren an dieselbe Stelle ──────────────────
   *
   * Es gibt auf dieser Seite mehrere Knoepfe, die den Einstieg
   * ausloesen: im ersten Blick, unter den Menyra, unter den Produkten,
   * im letzten Griff und der feste am Rand. Einer davon traegt die
   * Kennung ls-start, die lifeskin-app.js anspricht - eine Kennung darf
   * es nur einmal geben.
   *
   * Die anderen reichen ihren Tipp an ihn weiter. Das ist der kurze
   * Weg: Die Alternative waere, lifeskin-app.js mehrere Knoepfe
   * anbinden zu lassen - und dieselbe Datei traegt /lifeskintrichter
   * und apps/lifeskin/ mit, wo es weiter genau einen gibt.
   *
   * DIE WEITERLEITUNG DARF DIE QUELLE NICHT UEBERSCHREIBEN. haupt.click()
   * loest denselben Horcher noch einmal aus, diesmal mit dem Knopf im
   * ersten Blick - ohne die Sperre stuende danach bei jedem Tipp
   * "hero", und die ganze Zuordnung waere eine Zeile Unsinn.
   *
   * Gehorcht wird am Dokument und nicht an den Knoepfen selbst: So
   * wirkt es auch fuer einen Knopf, den jemand spaeter dazustellt. */
  var leitetWeiter = false;

  document.addEventListener("click", function (ereignis) {
    var knopf = ereignis.target && ereignis.target.closest
      ? ereignis.target.closest("[data-ls-start], [data-ls-metoda]")
      : null;
    if (!knopf) return;

    if (!leitetWeiter) quelleMerken(knopf.getAttribute("data-ls-quelle"));

    /* Eine Menyra-Karte geht ihren eigenen Weg, ein Knopf geht auf die
       Wahl. Der Unterschied ist ein Merkmal und keine zweite Liste. */
    var weg = knopf.getAttribute("data-ls-metoda");
    if (weg) {
      knopf.dataset.wartet = "ja";
      metodeNachholen(weg, knopf);
      return;
    }

    if (knopf.id === "ls-start") return;

    var haupt = document.getElementById("ls-start");
    if (!haupt) return;
    leitetWeiter = true;
    try {
      haupt.click();
    } finally {
      leitetWeiter = false;
    }
  });

  /* ── 8. Die Fragen schliessen sich weich ─────────────────────────
   *
   * <details> oeffnet von selbst weich (grid-template-rows im
   * Stilblatt), schliesst aber hart: Der Browser nimmt [open] im
   * selben Augenblick weg, in dem getippt wird, und der Inhalt ist
   * verschwunden, bevor die Bewegung anfangen kann.
   *
   * Also: beim Schliessen die Bewegung laufen lassen und [open] erst
   * danach wegnehmen. Wird waehrenddessen noch einmal getippt, wird
   * sofort wieder geoeffnet - kein Warten auf eine Bewegung, die
   * niemand mehr sehen will.
   *
   * NUR DIE FRAGEN. Die Bedingungen der Garantie sind ebenfalls ein
   * <details>, aber ohne Hoehenbewegung im Stilblatt - dort gibt es
   * nichts abzuwarten. */
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

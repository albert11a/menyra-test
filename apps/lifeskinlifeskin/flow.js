(function () {
  if (document.documentElement.dataset.lsDesign !== "mobile") return;
  const labels = {
    menyraTitel: "Si dëshiron ta bësh analizën?",
    menyraUnter: "Zgjidh mënyrën më të lehtë për ty.",
    wahlScanTitel: "Skano fytyrën",
    wahlScanText: "Kamera bën fotot ndërsa kthen kokën.",
    wahlScanPunkt: "Me kamerën",
    wahlFotoTitel: "Dërgo një foto",
    wahlFotoText: "Bëj një foto ose zgjidhe nga telefoni.",
    wahlFotoPunkt: "Për fytyrën ose trupin",
    wahlFotoMarke: "MË E LEHTA",
    wahlTrupTitel: "Shkruaj problemin",
    wahlTrupText: "Trego çfarë të shqetëson. Fotoja nuk është e detyrueshme.",
    wahlTrupPunkt: "Edhe pa foto",
    fotoParaTitel: "Trego zonën me problem",
    fotoParaMakeup: "Pa grim mbi këtë zonë",
    fotoParaLicht: "Në dritë të mirë",
    fotoParaKlar: "Fotoja të jetë e qartë",
    fotoParaFilter: "Pa filtër",
    fotoParaNah: "Bëje foton nga afër",
    fotoParaKnopf: "Vazhdo me foton",
    fotoPruefen: "A shihet qartë lëkura?",
    fotoNehmen: "Përdor këtë foto",
    fotoNochmal: "Bëj një tjetër foto",
    nameTitel: "Si quhesh?",
    alterTitel: "Sa vjeç je?",
    telTitel: "Numri yt i WhatsApp-it",
    telFertig: "Dërgo për analizë",
    anliegenFotoKnopf: "Shto foto, nëse dëshiron",
    systemFotoKnopf: "Hap kamerën e telefonit"
  };
  const plain = {
    "#t-psesyri": "ÇFARË KA LËKURA JOTE",
    "#t-psetitulli": "Problemi yt. Zgjidhja për ty.",
    "#t-porosititulli": "Ku t’i dërgojmë produktet?",
    "#t-korbtitulli": "Produktet janë në shportë.",
    ".korb__nen": "Shiko setin dhe vazhdo me porosinë.",
    ".mjetet__kopf h2": "Këto produkte u zgjodhën për ty.",
    "#merrni > h2": "Produktet dhe si t’i përdorësh",
    "#vendimi > h2": "Fillo kujdesin për lëkurën tënde.",
    "#ditet > h2": "Të ndihmojmë edhe pas porosisë.",
    "#t-metodablock > summary": "Si bëhet analiza?",
    "#an-pritgatewarum": "Këtë numër e përdorim për të të dërguar përgjigjen.",
    "#an-pritgatetitel": "Ku ta dërgojmë përgjigjen?"
  };
  const set = (node, text) => {
    if (node && node.textContent !== text) node.textContent = text;
  };
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  function compose() {
    // Recompose the interface around the SAME native nodes and actions.
    const selection = document.querySelector("#ls-wahl .ls-inhalt");
    if (selection && !selection.dataset.composed) {
      selection.dataset.composed = "true";
      const heading = selection.querySelector("h2");
      const visual = make("div", "journey-expert");
      const photo = make("img", "journey-expert__photo");
      photo.src = "/apps/lifeskin/dr-gashi.jpg";
      photo.alt = "Dr. Violeta Gashi";
      const caption = make("div", "journey-expert__copy");
      caption.append(make("span", "story-eyebrow", "ANALIZË FALAS"), make("strong", "", "Një hap drejt kujdesit të duhur."), make("p", "", "Dr. Gashi shikon rastin tënd."));
      visual.append(photo, caption);
      heading?.before(visual);
      const choice = selection.querySelector('[data-ls-weg="foto"]');
      if (choice) choice.parentElement.prepend(choice);
      for (const button of selection.querySelectorAll("[data-ls-weg]")) {
        button.append(make("span", "choice-arrow", "↗"));
      }
    }
    for (const screen of document.querySelectorAll('.ls-schirm:not(#ls-einstieg):not(.ls-schirm--kamera):not(#ls-wahl)')) {
      const content = screen.querySelector(".ls-inhalt");
      if (!content || content.querySelector(".journey-label")) continue;
      const labels = {
        "ls-fotopara": "FOTOJA JOTE", "ls-vorbereitung": "SKANIMI YT",
        "ls-name": "PAK PËR TY", "ls-anliegen": "PROBLEMI YT", "ls-tel": "HAPI I FUNDIT"
      };
      content.prepend(make("p", "journey-label", labels[screen.id] || "PËR LËKURËN TËNDE"));
      if (["ls-fotopara", "ls-vorbereitung"].includes(screen.id)) {
        const guide = make("div", "capture-guide");
        const frame = make("span", "capture-guide__frame", screen.id === "ls-fotopara" ? "↗" : "◎");
        frame.setAttribute("aria-hidden", "true");
        guide.append(frame, make("div", "capture-guide__copy", "Foto e qartë. Pa filtër."));
        content.querySelector(".journey-label").after(guide);
      }
    }
    const wait = document.querySelector("#an-prit");
    if (wait && !wait.dataset.composed) {
      wait.dataset.composed = "true";
      const lead = wait.querySelector(".wait-lead");
      const stage = make("section", "waiting-story");
      const seal = make("div", "waiting-seal", "✓");
      seal.setAttribute("aria-hidden", "true");
      stage.append(make("p", "story-eyebrow", "HAPI I PARË U KRYE"), seal);
      lead?.before(stage);
      if (lead) stage.append(lead);
      const timing = wait.querySelector(".wait-when");
      if (timing) stage.append(timing);
      stage.append(make("p", "waiting-intro", "Dr. Gashi shikon rastin tënd. Në përgjigje merr:"));
      const benefits = make("ol", "waiting-benefits");
      ["Çfarë ka lëkura jote", "Cilat produkte të përdorësh", "Si t’i përdorësh"].forEach((text, index) => {
        const item = make("li", "");
        item.append(make("span", "", String(index + 1).padStart(2, "0")), make("strong", "", text));
        benefits.append(item);
      });
      stage.append(benefits);
      const file = wait.querySelector(".wait-file");
      if (file) {
        const detail = make("details", "waiting-case");
        detail.append(make("summary", "", "Kërkesa dhe fotot e tua"));
        detail.append(file);
        wait.querySelector(".wait-foot")?.after(detail);
      }
    }
    if (wait && !wait.hidden) set(wait.querySelector("#an-prittitel"), "Kërkesa jote u dërgua.");
    const report = document.querySelector("#t-faqja");
    if (report && !report.dataset.composed) {
      report.dataset.composed = "true";
      report.classList.add("purchase-story");
      const intro = report.querySelector("#terapia");
      const brief = make("div", "result-brief");
      const eyebrow = make("p", "story-eyebrow", "NGA ANALIZA TE KUJDESI");
      intro?.querySelector("#t-titulli")?.before(eyebrow);
      // Actual physician approval and clinical overview remain visible.
      for (const selector of ["#t-titulli", ".hero__karte", "#t-shqetesimi", "#t-thate", "#t-kontroll"]) {
        const node = intro?.querySelector(selector);
        if (node) brief.append(node);
      }
      eyebrow.after(brief);
      const findings = report.querySelector("#pse");
      if (findings) brief.after(findings);
      for (const [selector, number, label] of [["#pse", "01", "KUPTO LËKURËN TËNDE"], ["#t-mjetet", "02", "KUJDESI I ZGJEDHUR"], ["#t-seti", "03", "FILLIMI YT"]]) {
        const node = report.querySelector(selector);
        if (node) {
          const chapter = make("p", "story-chapter");
          chapter.append(make("span", "", number), make("b", "", label));
          node.prepend(chapter);
        }
      }
      const price = report.querySelector("#t-cmimi1");
      if (price) price.before(make("p", "offer-total-label", "Pakoja jote. Një çmim."));
      // Existing detailed product and routine content follows the offer.
      const how = report.querySelector("#merrni");
      if (how) how.prepend(make("p", "story-chapter", "SI TA PËRDORËSH"));
      const order = document.querySelector("#porosia");
      order?.classList.add("order-story");
    }
  }
  function refresh() {
    if (document.documentElement.lang !== "sq") return;
    for (const node of document.querySelectorAll("[data-text]")) {
      const text = labels[node.dataset.text];
      if (text) set(node, text);
    }
    for (const [selector, text] of Object.entries(plain)) {
      for (const node of document.querySelectorAll(selector)) set(node, text);
    }
    const number = document.querySelector("#an-pritnr");
    if (number) number.setAttribute("aria-label", "Numri yt i WhatsApp-it");
    const wait = document.querySelector("#an-prit");
    if (wait && !wait.querySelector(".mobile-wait-doctor")) {
      const card = document.createElement("div");
      card.className = "mobile-wait-doctor";
      const image = document.createElement("img");
      image.src = "/apps/lifeskin/dr-gashi.jpg";
      image.alt = "Dr. Violeta Gashi";
      image.width = image.height = 52;
      const text = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = "Dr. Violeta Gashi";
      const note = document.createElement("span");
      note.textContent = "Shqyrton rastin tënd dhe zgjedh kujdesin.";
      text.append(name, note);
      card.append(image, text);
      wait.querySelector(".wait-lead")?.after(card);
    }
    compose();
    if (document.documentElement.dataset.internalPreview === "true") {
      set(document.querySelector("#t-setinen"), "Shembull i paketës — pa kontroll mjekësor");
    }
    // Keep the exact native offer, product list, price and buy button together.
    // Reordering DOM preserves button listeners and screen-reader reading order.
    const findings = document.querySelector("#pse");
    const products = document.querySelector("#t-mjetet");
    if (findings && products && findings.parentElement !== products.parentElement) {
      products.before(findings);
    }
    const ready = document.querySelector("#t-faqja:not([hidden])");
    if (ready && !document.querySelector("#mobile-sales-note")) {
      const note = document.createElement("p");
      note.id = "mobile-sales-note";
      note.textContent = "Produktet e zgjedhura për lëkurën tënde. Udhëzimi i përdorimit vjen bashkë me to.";
      document.querySelector("#t-seti #hero-knopf")?.before(note);
    }
  }
  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    queueMicrotask(() => { pending = false; refresh(); });
  });
  function start() {
    refresh();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();

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
    "#t-psetitulli": "Çfarë pamë. Çfarë të ndihmon.",
    "#t-porosititulli": "Ku t’i dërgojmë produktet?",
    "#t-korbtitulli": "Produktet janë në shportë.",
    ".korb__nen": "Shiko setin dhe vazhdo me porosinë.",
    ".mjetet__kopf h2": "Produktet për ty",
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

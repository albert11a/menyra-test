import { listActiveStories } from "../../_shared/firebase/stories.js";

function qs(id){
  return document.getElementById(id);
}

function getParam(name){
  const url = new URL(window.location.href);
  return (url.searchParams.get(name) || "").trim();
}

function safeDate(ts){
  try {
    if (ts && typeof ts.toDate === "function") return ts.toDate();
  } catch {}
  return null;
}

let currentStories = [];
let currentIndex = 0;
let videos = new Map(); // videoId -> video element

async function main(){
  const rid = getParam("r");
  const reelsContainer = qs("reelsContainer");
  const loadingState = qs("loadingState");
  const emptyState = qs("emptyState");

  if (!rid){
    loadingState.style.display = "none";
    emptyState.style.display = "flex";
    return;
  }

  try {
    currentStories = await listActiveStories(rid, 20);
  } catch (err){
    console.error(err);
    loadingState.style.display = "none";
    emptyState.style.display = "flex";
    return;
  }

  loadingState.style.display = "none";

  if (!currentStories.length){
    emptyState.style.display = "flex";
    return;
  }

  // Stories rendern
  renderStories(currentStories, reelsContainer);

  // Zeige Tap-Hinweis
  const tapHint = qs("tapHint");
  tapHint.style.display = "flex";

  // Intersection Observer für Autoplay
  setupAutoplay();

  // Keyboard navigation
  setupKeyboardNav();
}

function renderStories(stories, container){
  container.innerHTML = "";

  stories.forEach((story, index) => {
    const reel = document.createElement("div");
    reel.className = "reel";
    reel.dataset.index = index;

    // iframe für Bunny.net Videos
    const iframe = document.createElement("iframe");
    iframe.className = "reel-video";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "");
    iframe.frameBorder = "0";
    iframe.dataset.storyIndex = index;

    // Video source - Bunny.net embed URL
    const embedUrl = (story.embedUrl || "").trim() || (story.libraryId && story.videoId
      ? `https://iframe.mediadelivery.net/embed/${encodeURIComponent(String(story.libraryId))}/${encodeURIComponent(String(story.videoId))}`
      : "");

    if (embedUrl) {
      // Starte ohne autoplay
      iframe.src = `${embedUrl}?autoplay=false&loop=true&muted=true&preload=true&controls=false`;
    }

    videos.set(index, iframe);
    reel.appendChild(iframe);

    // Click handler für autoplay
    reel.addEventListener('click', () => {
      const iframe = videos.get(index);
      if (iframe && !iframe.dataset.autoplayEnabled) {
        iframe.dataset.autoplayEnabled = 'true';
        // Reload iframe mit autoplay
        const currentSrc = iframe.src;
        iframe.src = currentSrc.replace('autoplay=false', 'autoplay=true');
      }
    });

    // Vignette overlay
    const vignette = document.createElement("div");
    vignette.className = "vignette";
    reel.appendChild(vignette);

    // Topbar
    const topbar = document.createElement("div");
    topbar.className = "topbar";

    const topbarLeft = document.createElement("div");
    topbarLeft.className = "topbarLeft";

    const backBtn = document.createElement("button");
    backBtn.className = "btnIcon";
    backBtn.innerHTML = "←";
    backBtn.addEventListener("click", () => {
      if (window.history.length > 1) window.history.back();
      else window.location.href = `../karte/index.html?r=${encodeURIComponent(getParam("r"))}`;
    });
    topbarLeft.appendChild(backBtn);

    const brandPill = document.createElement("div");
    brandPill.className = "brandPill";

    const brandLogo = document.createElement("div");
    brandLogo.className = "brandLogo";
    brandLogo.innerHTML = "🍽️";
    brandPill.appendChild(brandLogo);

    const brandName = document.createElement("div");
    brandName.className = "brandName";
    brandName.textContent = getParam("r") || "MENYRA";
    brandPill.appendChild(brandName);

    topbarLeft.appendChild(brandPill);
    topbar.appendChild(topbarLeft);

    reel.appendChild(topbar);

    // Content overlay
    const content = document.createElement("div");
    content.className = "content";

    if (story.title) {
      const title = document.createElement("div");
      title.className = "contentTitle";
      title.textContent = story.title;
      content.appendChild(title);
    }

    if (story.description) {
      const desc = document.createElement("div");
      desc.className = "contentDesc";
      desc.textContent = story.description;
      content.appendChild(desc);
    }

    // Menu item link button
    if (story.menuItemId) {
      const linkBtn = document.createElement("a");
      linkBtn.className = "contentBtn";
      linkBtn.href = `../detajet/index.html?r=${encodeURIComponent(getParam("r"))}&item=${encodeURIComponent(story.menuItemId)}`;
      linkBtn.innerHTML = `
        <span>👀</span>
        <span>Produkt ansehen</span>
      `;
      content.appendChild(linkBtn);
    }

    reel.appendChild(content);

    // Right rail
    const rail = document.createElement("div");
    rail.className = "rail";

    // Progress indicator
    const progress = document.createElement("div");
    progress.className = "railBtn";
    progress.innerHTML = `
      <div class="railIcon">${index + 1}/${stories.length}</div>
    `;
    rail.appendChild(progress);

    reel.appendChild(rail);

    container.appendChild(reel);
  });
}

function setupAutoplay(){
  let hasUserInteracted = false;

  // Erstes User-Interaktion abfangen
  const handleFirstInteraction = () => {
    hasUserInteracted = true;
    const tapHint = qs("tapHint");
    tapHint.style.display = "none";
    document.removeEventListener('touchstart', handleFirstInteraction);
    document.removeEventListener('click', handleFirstInteraction);
  };

  document.addEventListener('touchstart', handleFirstInteraction, { once: true });
  document.addEventListener('click', handleFirstInteraction, { once: true });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const reel = entry.target;
      const index = parseInt(reel.dataset.index);
      const iframe = videos.get(index);

      if (!iframe) return;

      if (entry.isIntersecting && hasUserInteracted) {
        // iframe ist sichtbar und User hat interagiert - autoplay aktivieren
        if (!iframe.dataset.autoplayEnabled) {
          iframe.dataset.autoplayEnabled = 'true';
          const currentSrc = iframe.src;
          iframe.src = currentSrc.replace('autoplay=false', 'autoplay=true');
        }
      } else if (!entry.isIntersecting) {
        // iframe ist nicht mehr sichtbar - autoplay deaktivieren
        if (iframe.dataset.autoplayEnabled) {
          iframe.dataset.autoplayEnabled = '';
          const currentSrc = iframe.src;
          iframe.src = currentSrc.replace('autoplay=true', 'autoplay=false');
        }
      }
    });
  }, {
    threshold: 0.7, // 70% der iframe müssen sichtbar sein
    rootMargin: "-10% 0px -10% 0px"
  });

  // Alle reels beobachten
  document.querySelectorAll(".reel").forEach(reel => {
    observer.observe(reel);
  });
}

function setupKeyboardNav(){
  document.addEventListener("keydown", (e) => {
    const reels = document.querySelectorAll(".reel");
    if (!reels.length) return;

    switch(e.key){
      case "ArrowDown":
      case " ":
        e.preventDefault();
        scrollToNext();
        break;
      case "ArrowUp":
        e.preventDefault();
        scrollToPrev();
        break;
    }
  });
}

function scrollToNext(){
  const current = document.querySelector(".reel");
  const next = current?.nextElementSibling;
  if (next) {
    next.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function scrollToPrev(){
  const current = document.querySelector(".reel");
  const prev = current?.previousElementSibling;
  if (prev) {
    prev.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Start the app
main().catch(console.error);

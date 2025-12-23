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

    // Video element mit HLS support
    const video = document.createElement("video");
    video.className = "reel-video";
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.loop = true;
    video.controls = false;

    // Video source - versuche HLS Stream URL für Bunny.net
    const embedUrl = (story.embedUrl || "").trim() || (story.libraryId && story.videoId
      ? `https://iframe.mediadelivery.net/embed/${encodeURIComponent(String(story.libraryId))}/${encodeURIComponent(String(story.videoId))}`
      : "");

    if (embedUrl && story.libraryId && story.videoId) {
      // Bunny.net HLS Stream URL (Region 'de' als Standard)
      const hlsUrl = `https://vz-de.b-cdn.net/${story.libraryId}/${story.videoId}/playlist.m3u8`;
      video.src = hlsUrl;
    }

    videos.set(index, video);
    reel.appendChild(video);

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
    document.removeEventListener('touchstart', handleFirstInteraction);
    document.removeEventListener('click', handleFirstInteraction);

    // Alle Videos starten
    videos.forEach((video, index) => {
      if (video && video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
        video.play().catch(err => console.warn("Autoplay failed:", err));
      }
    });
  };

  document.addEventListener('touchstart', handleFirstInteraction, { once: true });
  document.addEventListener('click', handleFirstInteraction, { once: true });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const reel = entry.target;
      const index = parseInt(reel.dataset.index);
      const video = videos.get(index);

      if (!video) return;

      if (entry.isIntersecting && hasUserInteracted) {
        // Video ist sichtbar und User hat interagiert - abspielen
        video.play().catch(err => {
          console.warn("Autoplay failed:", err);
        });
      } else if (!entry.isIntersecting) {
        // Video ist nicht mehr sichtbar - pausieren
        video.pause();
      }
    });
  }, {
    threshold: 0.7, // 70% des Videos müssen sichtbar sein
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

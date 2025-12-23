import { listActiveStories } from "../../_shared/firebase/stories.js";
import { getPublicMeta } from "../../_shared/firebase/public.js";

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
let restaurantMeta = null;

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
    // Lade Restaurant-Meta für Logo
    restaurantMeta = await getPublicMeta(rid);
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
  renderStories(currentStories, reelsContainer, restaurantMeta);

  // Zeige Tap-Hinweis
  const tapHint = qs("tapHint");
  tapHint.style.display = "flex";

  // Intersection Observer für Autoplay
  setupAutoplay();

  // Keyboard navigation
  setupKeyboardNav();
}

function renderStories(stories, container, meta){
  container.innerHTML = "";

  stories.forEach((story, index) => {
    const reel = document.createElement("div");
    reel.className = "reel";
    reel.dataset.index = index;

    // Video element - entweder <video> für Storage oder <iframe> für Stream
    let videoElement;
    const videoUrl = (story.videoUrl || "").trim(); // Direkter Storage-Link
    const embedUrl = (story.embedUrl || "").trim() || (story.libraryId && story.videoId
      ? `https://iframe.mediadelivery.net/embed/${encodeURIComponent(String(story.libraryId))}/${encodeURIComponent(String(story.videoId))}`
      : "");

    if (videoUrl) {
      // Verwende <video> für direkte Links - mit HLS-Unterstützung
      const video = document.createElement("video");
      video.className = "reel-video";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.controls = false; // Keine Controls!
      video.setAttribute("webkit-playsinline", "");

      // HLS-Unterstützung für .m3u8 URLs
      if (videoUrl.includes('.m3u8') && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: false, // Für bessere Performance
          maxBufferLength: 10, // Kurzer Buffer für Stories
          maxMaxBufferLength: 20
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }

      videoElement = video;
    } else if (embedUrl) {
      // Fallback zu iframe für Stream
      const iframe = document.createElement("iframe");
      iframe.className = "reel-video";
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.setAttribute("allowfullscreen", "");
      iframe.frameBorder = "0";
      iframe.src = `${embedUrl}?autoplay=false&loop=true&muted=true&preload=true&controls=0`;
      videoElement = iframe;
    }

    if (videoElement) {
      videos.set(index, videoElement);
      reel.appendChild(videoElement);
    }

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
    if (meta && meta.logo) {
      brandLogo.style.backgroundImage = `url(${meta.logo})`;
      brandLogo.style.backgroundSize = "cover";
      brandLogo.style.backgroundPosition = "center";
    } else {
      brandLogo.style.backgroundImage = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      brandLogo.style.display = "flex";
      brandLogo.style.alignItems = "center";
      brandLogo.style.justifyContent = "center";
      brandLogo.style.fontSize = "16px";
      brandLogo.textContent = "M";
    }
    brandPill.appendChild(brandLogo);

    const brandName = document.createElement("div");
    brandName.className = "brandName";
    brandName.textContent = (meta && meta.name) ? meta.name : (getParam("r") || "MENYRA");
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
      const videoElement = videos.get(index);

      if (!videoElement) return;

      if (entry.isIntersecting && hasUserInteracted) {
        // Video ist sichtbar und User hat interagiert - autoplay aktivieren
        if (videoElement.tagName === 'VIDEO') {
          // Für <video> Elemente können wir play() direkt aufrufen
          if (videoElement.paused) {
            videoElement.play().catch(() => {}); // Ignore errors
          }
        } else {
          // Für iframes - src ändern (fallback)
          if (!videoElement.dataset.autoplayEnabled) {
            videoElement.dataset.autoplayEnabled = 'true';
            const currentSrc = videoElement.src;
            videoElement.src = currentSrc.replace('autoplay=false', 'autoplay=true');
          }
        }
      } else if (!entry.isIntersecting) {
        // Video ist nicht mehr sichtbar - pausieren
        if (videoElement.tagName === 'VIDEO') {
          videoElement.pause();
        } else {
          // Für iframes - autoplay deaktivieren
          if (videoElement.dataset.autoplayEnabled) {
            videoElement.dataset.autoplayEnabled = '';
            const currentSrc = videoElement.src;
            videoElement.src = currentSrc.replace('autoplay=true', 'autoplay=false');
          }
        }
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

// Click handler für Video play/pause
document.addEventListener('click', (e) => {
  const reel = e.target.closest('.reel');
  if (!reel) return;

  const index = parseInt(reel.dataset.index);
  const videoElement = videos.get(index);
  if (!videoElement) return;

  if (videoElement.tagName === 'VIDEO') {
    if (videoElement.paused) {
      videoElement.play().catch(() => {});
    } else {
      videoElement.pause();
    }
  }
  // Für iframes - kein direkter play/pause möglich
});

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
    // Firestore Timestamp
    if (ts && typeof ts.toDate === "function") return ts.toDate();
  } catch {}
  return null;
}

function formatTime(d){
  if (!d) return "";
  return new Intl.DateTimeFormat("de-AT", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
}

async function main(){
  const rid = getParam("r");
  const backBtn = qs("storyBackBtn");
  backBtn?.addEventListener("click", () => {
    // If opened from owner, history works. Otherwise go to Karte.
    if (window.history.length > 1) window.history.back();
    else window.location.href = `../karte/index.html?r=${encodeURIComponent(rid)}`;
  });

  if (!rid){
    qs("storyTitle").textContent = "Story";
    qs("storyEmpty").style.display = "block";
    return;
  }

  qs("storyTitle").textContent = `Story · ${rid}`;

  let stories = [];
  try {
    stories = await listActiveStories(rid, 10);
  } catch (err){
    console.error(err);
    qs("storyEmpty").style.display = "block";
    return;
  }

  if (!stories.length){
    qs("storyEmpty").style.display = "block";
    return;
  }

  const feed = qs("storyFeed");
  feed.innerHTML = "";

  stories.forEach((s, idx) => {
    const slide = document.createElement("div");
    slide.className = "story-slide";

    const iframe = document.createElement("iframe");
    iframe.className = "story-iframe";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "");

    // We store embedUrl in Firestore at creation time.
    // Fallback: build standard Bunny embed URL.
    const embedUrl = (s.embedUrl || "").trim() || (s.libraryId && s.videoId
      ? `https://iframe.mediadelivery.net/embed/${encodeURIComponent(String(s.libraryId))}/${encodeURIComponent(String(s.videoId))}`
      : "");

    iframe.src = embedUrl ? `${embedUrl}?autoplay=true&loop=true&muted=false&preload=true` : "about:blank";
    iframe.loading = idx < 2 ? "eager" : "lazy";

    const overlay = document.createElement("div");
    overlay.className = "story-overlay";

    const left = document.createElement("div");
    left.className = "story-badge";
    left.textContent = s.status === "processing" ? "Wird verarbeitet…" : "Story";

    const right = document.createElement("div");
    right.className = "story-badge";
    const exp = safeDate(s.expiresAt);
    right.textContent = exp ? `läuft ab: ${formatTime(exp)}` : "";

    overlay.appendChild(left);
    overlay.appendChild(right);

    slide.appendChild(iframe);
    slide.appendChild(overlay);
    feed.appendChild(slide);
  });
}

main();

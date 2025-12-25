import { db, auth } from "@shared/firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
  attachAuthHeader,
  buildUrl,
  formatRelative,
  qs,
  toDateSafe
} from "../_shared/social-core.js";

const postTitle = document.getElementById("postTitle");
const postMeta = document.getElementById("postMeta");
const postMedia = document.getElementById("postMedia");
const postCaption = document.getElementById("postCaption");
const mainLink = document.getElementById("mainLink");
const likeBtn = document.getElementById("likeBtn");
const reportBtn = document.getElementById("reportBtn");
const postStatus = document.getElementById("postStatus");

attachAuthHeader({ linkId: "authLink", userId: "authUser" });

let currentUser = null;
let currentPost = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

function normalizeUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  return `https://${value.replace(/^\/+/, "")}`;
}

function setStatus(text) {
  postStatus.textContent = text || "";
}

async function resolveBusinessName(rid) {
  if (!rid) return "Business";
  try {
    const snap = await getDoc(doc(db, "restaurants", rid));
    if (snap.exists()) {
      const data = snap.data();
      return data?.name || data?.restaurantName || "Business";
    }
  } catch (err) {
    console.warn(err);
  }
  return "Business";
}

async function loadPost() {
  const id = qs("id");
  if (!id) {
    postTitle.textContent = "Missing post id";
    setStatus("No post id provided.");
    return;
  }

  try {
    const snap = await getDoc(doc(db, "socialFeed", id));
    if (!snap.exists()) {
      postTitle.textContent = "Post not found";
      setStatus("This post does not exist.");
      return;
    }

    const data = { id: snap.id, ...snap.data() };
    currentPost = data;

    const title = data.businessName || data.restaurantName || (await resolveBusinessName(data.rid || data.restaurantId));
    const createdAt = formatRelative(toDateSafe(data.createdAt));

    postTitle.textContent = title;
    postMeta.textContent = `${data.city || "-"} ? ${createdAt}`;
    postCaption.textContent = data.caption || data.captionShort || "";

    const thumbUrl = normalizeUrl(data.thumbUrl || data.media?.[0]?.thumbUrl);
    const mediaUrl = normalizeUrl(data.mediaUrl || data.media?.[0]?.url);

    if (thumbUrl && data.mediaType !== "video") {
      postMedia.innerHTML = `<img src="${thumbUrl}" alt="${title}" />`;
    } else if (mediaUrl && data.mediaType === "video") {
      postMedia.innerHTML = `<video controls src="${mediaUrl}"></video>`;
    } else if (mediaUrl) {
      postMedia.innerHTML = `<img src="${mediaUrl}" alt="${title}" />`;
    } else {
      postMedia.innerHTML = "<div class='meta'>No media</div>";
    }

    const rid = data.rid || data.restaurantId;
    if (rid) {
      mainLink.href = buildUrl("apps/menyra-main/index.html", { r: rid });
    } else {
      mainLink.href = "#";
      mainLink.onclick = (e) => e.preventDefault();
    }
  } catch (err) {
    console.error(err);
    setStatus("Failed to load post.");
  }
}

likeBtn.addEventListener("click", async () => {
  if (!currentPost) return;
  if (!currentUser) {
    window.location.href = buildUrl("apps/menyra-social/login/index.html", { next: window.location.href });
    return;
  }
  try {
    await setDoc(
      doc(db, "socialFeed", currentPost.id, "likes", currentUser.uid),
      { createdAt: serverTimestamp() },
      { merge: true }
    );
    setStatus("Liked.");
  } catch (err) {
    console.error(err);
    setStatus("Failed to like post.");
  }
});

reportBtn.addEventListener("click", async () => {
  if (!currentPost) return;
  if (!currentUser) {
    window.location.href = buildUrl("apps/menyra-social/login/index.html", { next: window.location.href });
    return;
  }
  try {
    const reason = prompt("Report reason", "spam");
    if (!reason) return;
    const reportId = `${currentPost.id}_${currentUser.uid}`;
    await setDoc(
      doc(db, "reports", reportId),
      {
        targetType: "post",
        targetId: currentPost.id,
        reason,
        createdByUid: currentUser.uid,
        createdAt: serverTimestamp(),
        status: "open"
      },
      { merge: true }
    );
    setStatus("Report sent.");
  } catch (err) {
    console.error(err);
    setStatus("Failed to report.");
  }
});

loadPost();

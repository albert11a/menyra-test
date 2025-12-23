// =========================================================
// MENYRA System 1 — Stories (Firestore)
// - Stores references to Bunny Stream videos
// - Guest reads active stories only (expiresAt > now)
// =========================================================

import { db } from "../../../../shared/firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const HOURS = 60 * 60 * 1000;

export function storiesColRef(restaurantId) {
  return collection(db, "restaurants", restaurantId, "stories");
}

export async function listActiveStories(restaurantId, max = 10) {
  const now = Timestamp.now();
  const q = query(
    storiesColRef(restaurantId),
    where("expiresAt", ">", now),
    orderBy("expiresAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function countActiveStories(restaurantId, max = 11) {
  const now = Timestamp.now();
  const q = query(
    storiesColRef(restaurantId),
    where("expiresAt", ">", now),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.size;
}

export async function listExpiredStories(restaurantId, max = 25) {
  const now = Timestamp.now();
  const q = query(
    storiesColRef(restaurantId),
    where("expiresAt", "<", now),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addStoryDoc(restaurantId, {
  libraryId,
  videoId,
  createdByUid,
  ttlHours = 24,
  status = "processing",
  embedUrl,
  title,
  description,
  menuItemId
}) {
  const expiresAt = Timestamp.fromMillis(Date.now() + (ttlHours * HOURS));
  const payload = {
    libraryId: String(libraryId || ""),
    videoId: String(videoId || ""),
    createdByUid: String(createdByUid || ""),
    status: String(status || "processing"),
    createdAt: serverTimestamp(),
    expiresAt,
    embedUrl: String(embedUrl || "")
  };

  // Optionale Felder hinzufügen
  if (title) payload.title = String(title);
  if (description) payload.description = String(description);
  if (menuItemId) payload.menuItemId = String(menuItemId);

  return addDoc(storiesColRef(restaurantId), payload);
}

export async function deleteStoryDoc(restaurantId, storyId) {
  await deleteDoc(doc(db, "restaurants", restaurantId, "stories", storyId));
}

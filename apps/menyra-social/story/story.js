import { db } from "/shared/firebase-config.js?v=2026-03-10-startup-1";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import { createStoryViewerRuntimeController } from "../core/stories/story-viewer-runtime-controller.js";

const storyViewerRuntimeController = createStoryViewerRuntimeController({
  db,
  collectionFn: collection,
  docFn: doc,
  getDocFn: getDoc,
  queryFn: query,
  orderByFn: orderBy,
  limitFn: limit,
  getDocsFn: getDocs,
  windowObj: typeof window === "undefined" ? null : window,
  documentObj: typeof document === "undefined" ? null : document,
  feedFallbackUrl: "/feed"
});

void storyViewerRuntimeController.start().catch((err) => {
  console.error(err);
});

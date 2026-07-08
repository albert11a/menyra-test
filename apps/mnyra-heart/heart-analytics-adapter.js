// Heart Analytics Adapter: laedt Business-Liste + analyticsDaily-Aggregate
// direkt aus Firestore (CEO-Session; Rules erlauben CEO-Reads auf Analytics).

import {
  db
} from "/shared/firebase-config.js";
import {
  collection,
  documentId,
  getDocs,
  limit,
  orderBy,
  query,
  where
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import {
  loadAnalyticsDailyRange
} from "../menyra-social/core/analytics/analytics-daily-loader.js";
import {
  resolveAnalyticsRange,
  buildAnalyticsDashboardModel
} from "../menyra-social/core/analytics/analytics-dashboard-core.js";

const BUSINESS_LIST_LIMIT = 300;

function normalizeBusinessRow(docSnap) {
  const data = docSnap.data() || {};
  const name = String(data.name || data.restaurantName || data.businessName || "").trim() || docSnap.id;
  if (String(data.status || "").trim().toLowerCase() === "deleted" || data.deleted === true) return null;
  return {
    id: docSnap.id,
    name,
    city: String(data.city || "").trim(),
    status: String(data.status || "").trim(),
    logoUrl: String(data.logoUrl || data.logo || "").trim()
  };
}

export function createHeartAnalyticsAdapter() {
  async function loadBusinesses() {
    let snap = null;
    try {
      snap = await getDocs(query(collection(db, "restaurants"), orderBy("name"), limit(BUSINESS_LIST_LIMIT)));
    } catch {
      // Fallback ohne orderBy (fehlende name-Felder / Indizes).
      snap = await getDocs(query(collection(db, "restaurants"), limit(BUSINESS_LIST_LIMIT)));
    }
    return snap.docs
      .map((docSnap) => normalizeBusinessRow(docSnap))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  }

  async function loadDashboardModel({ restaurantId = "", rangeKey = "7d", customFrom = "", customTo = "" } = {}) {
    const safeRestaurantId = String(restaurantId || "").trim();
    if (!safeRestaurantId) throw new Error("Bitte zuerst ein Business auswählen.");
    const range = resolveAnalyticsRange({ rangeKey, customFrom, customTo });
    if (!range) throw new Error("Ungültiger Zeitraum: Bitte Von/Bis prüfen.");
    const loaderDeps = {
      db,
      collectionFn: collection,
      queryFn: query,
      whereFn: where,
      documentIdFn: documentId,
      getDocsFn: getDocs,
      restaurantId: safeRestaurantId
    };
    const [currentDays, previousDays] = await Promise.all([
      loadAnalyticsDailyRange({ ...loaderDeps, fromDay: range.fromDay, toDay: range.toDay }),
      loadAnalyticsDailyRange({ ...loaderDeps, fromDay: range.prevFromDay, toDay: range.prevToDay })
    ]);
    return buildAnalyticsDashboardModel({ range, currentDays, previousDays });
  }

  return Object.freeze({
    loadBusinesses,
    loadDashboardModel
  });
}

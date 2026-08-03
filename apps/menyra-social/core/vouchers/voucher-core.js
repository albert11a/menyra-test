// Mnyra Ofertat (Voucher/Gutschein) - pure Kernlogik.
//
// Dieses Modul kennt weder Browser noch Firebase. Es beschreibt nur die
// Wahrheit einer Oferta:
//  - Gueltigkeitsfenster des Angebots selbst (startAt/endAt)
//  - Aktivierungsfenster des Kunden (activationMinutes ab Klick)
//  - Countdown-Beschriftungen (Tage -> Stunden -> Minuten)
//  - Kennzahlen fuer die Business-Uebersicht (Aktivierungen/Reichweite)
//
// Damit teilen Kundentab, Business-Editor, Analytics und Tests dieselben Regeln.

export const VOUCHER_PUBLIC_DOC_ID = "vouchers";
export const VOUCHER_STATS_COLLECTION = "voucherStats";
export const VOUCHER_ACTIVATIONS_COLLECTION = "voucherActivations";

export const VOUCHER_DEFAULT_ACTIVATION_MINUTES = 60;
export const VOUCHER_MIN_ACTIVATION_MINUTES = 5;
export const VOUCHER_MAX_ACTIVATION_MINUTES = 1440;
export const VOUCHER_DEFAULT_RUNTIME_DAYS = 7;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function cleanVoucherText(value = "") {
  return String(value ?? "").trim();
}

export function createVoucherId() {
  const random = globalThis?.crypto?.randomUUID?.();
  if (random) return `ofr_${String(random).replace(/-/g, "").slice(0, 16)}`;
  return `ofr_${Date.now().toString(36)}${String(Math.random()).slice(2, 8)}`;
}

// Firestore liefert je nach Pfad Timestamp, Date, ISO-String oder Millis.
// Alles landet hier als Millisekunden oder 0 (= unbekannt).
export function toVoucherMillis(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      try {
        const date = value.toDate();
        const ms = date instanceof Date ? date.getTime() : NaN;
        return Number.isNaN(ms) ? 0 : ms;
      } catch {
        return 0;
      }
    }
    if (Number.isFinite(Number(value.seconds))) return Math.round(Number(value.seconds) * 1000);
    if (Number.isFinite(Number(value._seconds))) return Math.round(Number(value._seconds) * 1000);
    return 0;
  }
  const parsed = new Date(String(value));
  const ms = parsed.getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

export function toVoucherIso(value) {
  const ms = toVoucherMillis(value);
  if (!ms) return "";
  return new Date(ms).toISOString();
}

// "2026-08-14T18:30" (datetime-local) <-> ISO. Der Editor arbeitet mit
// lokaler Zeit, gespeichert wird immer UTC-ISO.
export function toVoucherInputValue(value) {
  const ms = toVoucherMillis(value);
  if (!ms) return "";
  const date = new Date(ms);
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromVoucherInputValue(value = "") {
  const raw = cleanVoucherText(value);
  if (!raw) return 0;
  const parsed = new Date(raw);
  const ms = parsed.getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

export function clampActivationMinutes(value, fallback = VOUCHER_DEFAULT_ACTIVATION_MINUTES) {
  const parsed = Math.round(Number(value));
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(VOUCHER_MAX_ACTIVATION_MINUTES, Math.max(VOUCHER_MIN_ACTIVATION_MINUTES, parsed));
}

export function normalizeVoucherItem(raw = {}, fallbackId = "") {
  const item = raw && typeof raw === "object" ? raw : {};
  const id = cleanVoucherText(item.id || item._id || fallbackId) || createVoucherId();
  const startMs = toVoucherMillis(item.startAt ?? item.startsAt ?? item.validFrom);
  const endMs = toVoucherMillis(item.endAt ?? item.endsAt ?? item.validUntil ?? item.expiresAt);
  return {
    id,
    title: cleanVoucherText(item.title || item.name || ""),
    text: cleanVoucherText(item.text || item.description || item.desc || ""),
    terms: cleanVoucherText(item.terms || item.conditions || ""),
    badgeLabel: cleanVoucherText(item.badgeLabel || item.discountLabel || item.badge || ""),
    imageUrl: cleanVoucherText(item.imageUrl || item.image || item.photoUrl || ""),
    cropX: clampVoucherCrop(item.cropX, 50),
    cropY: clampVoucherCrop(item.cropY, 50),
    active: item.active !== false,
    startAt: startMs ? new Date(startMs).toISOString() : "",
    endAt: endMs ? new Date(endMs).toISOString() : "",
    activationMinutes: clampActivationMinutes(item.activationMinutes ?? item.validMinutes),
    createdAt: toVoucherIso(item.createdAt),
    updatedAt: toVoucherIso(item.updatedAt)
  };
}

export function clampVoucherCrop(value, fallback = 50) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

// Status einer Oferta unabhaengig vom Kunden:
// "scheduled" = startet erst spaeter, "live" = laeuft, "expired" = vorbei,
// "inactive" = vom Business ausgeschaltet.
export function resolveVoucherWindow(item = {}, nowMs = Date.now()) {
  const source = item && typeof item === "object" ? item : {};
  const startMs = toVoucherMillis(source.startAt ?? source.startsAt ?? source.validFrom);
  const endMs = toVoucherMillis(source.endAt ?? source.endsAt ?? source.validUntil ?? source.expiresAt);
  const now = Number.isFinite(Number(nowMs)) ? Number(nowMs) : Date.now();
  if (source.active === false) {
    return { status: "inactive", startMs, endMs, remainingMs: 0 };
  }
  if (startMs && now < startMs) {
    return { status: "scheduled", startMs, endMs, remainingMs: Math.max(0, startMs - now) };
  }
  if (endMs && now >= endMs) {
    return { status: "expired", startMs, endMs, remainingMs: 0 };
  }
  return {
    status: "live",
    startMs,
    endMs,
    // Ohne Enddatum laeuft die Oferta unbefristet -> kein Countdown.
    remainingMs: endMs ? Math.max(0, endMs - now) : 0
  };
}

export function isVoucherVisibleForCustomers(item = {}, nowMs = Date.now()) {
  return resolveVoucherWindow(item, nowMs).status === "live";
}

// Restlaufzeit als Badge: erst Tage, dann Stunden, dann Minuten.
export function formatVoucherRemaining(remainingMs = 0, { unlimitedLabel = "Pa afat" } = {}) {
  const ms = Number(remainingMs);
  if (!Number.isFinite(ms) || ms <= 0) return unlimitedLabel;
  if (ms >= DAY_MS) {
    const days = Math.floor(ms / DAY_MS);
    return days === 1 ? "Edhe 1 dite" : `Edhe ${days} dite`;
  }
  if (ms >= HOUR_MS) {
    const hours = Math.floor(ms / HOUR_MS);
    return hours === 1 ? "Edhe 1 ore" : `Edhe ${hours} ore`;
  }
  const minutes = Math.max(1, Math.ceil(ms / MINUTE_MS));
  return minutes === 1 ? "Edhe 1 minute" : `Edhe ${minutes} minuta`;
}

// Zeile in der Business-Liste. Anders als beim Kundentab koennen hier auch
// geplante, abgelaufene und ausgeschaltete Ofertat stehen - "Pa afat" waere
// fuer die falsch, weil deren Restlaufzeit definitionsgemaess 0 ist.
export function formatVoucherWindowLabel(window = {}, nowMs = Date.now()) {
  const status = String(window?.status || "").trim().toLowerCase();
  const endMs = Number(window?.endMs) || 0;
  const startMs = Number(window?.startMs) || 0;
  const now = Number.isFinite(Number(nowMs)) ? Number(nowMs) : Date.now();
  if (status === "expired") return "Ka skaduar";
  if (status === "scheduled") {
    const untilStart = Math.max(0, startMs - now);
    return untilStart ? `Fillon ${formatVoucherRemaining(untilStart).replace(/^Edhe /, "per ")}` : "Fillon se shpejti";
  }
  if (status === "inactive") return "E ndalur";
  void endMs;
  return formatVoucherRemaining(window?.remainingMs || 0);
}

// Dringlichkeit steuert nur die Badge-Farbe.
export function resolveVoucherUrgency(remainingMs = 0) {
  const ms = Number(remainingMs);
  if (!Number.isFinite(ms) || ms <= 0) return "none";
  if (ms < HOUR_MS) return "critical";
  if (ms < DAY_MS) return "soon";
  return "calm";
}

// Countdown der laufenden Aktivierung: "59:12" bzw. "1:02:33".
export function formatActivationCountdown(remainingMs = 0) {
  const ms = Math.max(0, Number(remainingMs) || 0);
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (num) => String(num).padStart(2, "0");
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

// Menschlicher Text fuer den Bestaetigungs-Dialog ("vlen vetem 1 ore").
export function formatActivationDuration(minutes = VOUCHER_DEFAULT_ACTIVATION_MINUTES) {
  const safeMinutes = clampActivationMinutes(minutes);
  if (safeMinutes < 60) return safeMinutes === 1 ? "1 minute" : `${safeMinutes} minuta`;
  const hours = Math.floor(safeMinutes / 60);
  const rest = safeMinutes % 60;
  const hourLabel = hours === 1 ? "1 ore" : `${hours} ore`;
  if (!rest) return hourLabel;
  return `${hourLabel} e ${rest} minuta`;
}

export function buildVoucherActivationKey(restaurantId = "", voucherId = "") {
  return `${cleanVoucherText(restaurantId)}::${cleanVoucherText(voucherId)}`;
}

export function buildVoucherActivationDocId(voucherId = "", uid = "") {
  return `${cleanVoucherText(voucherId)}__${cleanVoucherText(uid)}`;
}

// Kurzer, gut vorlesbarer Code fuer das Personal. Bewusst ohne 0/O/1/I.
export function buildVoucherActivationCode(seed = "") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const source = `${cleanVoucherText(seed)}${Date.now().toString(36)}${String(Math.random()).slice(2, 8)}`;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[(hash >>> (index * 5)) % alphabet.length];
    hash = (hash * 1103515245 + 12345) >>> 0;
  }
  return code;
}

export function normalizeVoucherActivation(raw = {}) {
  const record = raw && typeof raw === "object" ? raw : {};
  const activatedMs = toVoucherMillis(record.activatedAt);
  const expiresMs = toVoucherMillis(record.expiresAt);
  return {
    restaurantId: cleanVoucherText(record.restaurantId),
    voucherId: cleanVoucherText(record.voucherId),
    uid: cleanVoucherText(record.uid),
    code: cleanVoucherText(record.code),
    activatedAtMs: activatedMs,
    expiresAtMs: expiresMs
  };
}

// Zustand einer Aktivierung aus Kundensicht.
export function resolveActivationState(activation = null, nowMs = Date.now()) {
  if (!activation) return { state: "none", remainingMs: 0, code: "", expiresAtMs: 0 };
  const normalized = normalizeVoucherActivation(activation);
  const now = Number.isFinite(Number(nowMs)) ? Number(nowMs) : Date.now();
  if (!normalized.expiresAtMs) return { state: "none", remainingMs: 0, code: "", expiresAtMs: 0 };
  if (now >= normalized.expiresAtMs) {
    return { state: "expired", remainingMs: 0, code: normalized.code, expiresAtMs: normalized.expiresAtMs };
  }
  return {
    state: "active",
    remainingMs: normalized.expiresAtMs - now,
    code: normalized.code,
    expiresAtMs: normalized.expiresAtMs
  };
}

export function buildActivationRecord({
  restaurantId = "",
  voucherId = "",
  uid = "",
  activationMinutes = VOUCHER_DEFAULT_ACTIVATION_MINUTES,
  nowMs = Date.now(),
  code = ""
} = {}) {
  const now = Number.isFinite(Number(nowMs)) ? Number(nowMs) : Date.now();
  const minutes = clampActivationMinutes(activationMinutes);
  return {
    restaurantId: cleanVoucherText(restaurantId),
    voucherId: cleanVoucherText(voucherId),
    uid: cleanVoucherText(uid),
    code: cleanVoucherText(code) || buildVoucherActivationCode(`${restaurantId}${voucherId}${uid}`),
    activatedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + (minutes * MINUTE_MS)).toISOString()
  };
}

export function normalizeVoucherStats(raw = {}) {
  const record = raw && typeof raw === "object" ? raw : {};
  const reach = Math.max(0, Math.round(Number(record.reachCount) || 0));
  const activations = Math.max(0, Math.round(Number(record.activationCount) || 0));
  return { reachCount: reach, activationCount: activations };
}

// Business-Uebersicht: Summen + Zeile je Oferta.
export function buildVoucherAnalyticsModel({ items = [], statsById = {}, nowMs = Date.now() } = {}) {
  const safeItems = (Array.isArray(items) ? items : [])
    .map((item) => normalizeVoucherItem(item))
    .filter((item) => item.id);
  const stats = statsById && typeof statsById === "object" ? statsById : {};
  const rows = safeItems.map((item) => {
    const entry = normalizeVoucherStats(stats[item.id]);
    const window = resolveVoucherWindow(item, nowMs);
    const conversion = entry.reachCount > 0
      ? Math.round((entry.activationCount / entry.reachCount) * 1000) / 10
      : 0;
    return {
      id: item.id,
      title: item.title,
      status: window.status,
      remainingMs: window.remainingMs,
      reachCount: entry.reachCount,
      activationCount: entry.activationCount,
      conversionPercent: conversion
    };
  });
  const totals = rows.reduce((acc, row) => ({
    reachCount: acc.reachCount + row.reachCount,
    activationCount: acc.activationCount + row.activationCount
  }), { reachCount: 0, activationCount: 0 });
  return {
    rows,
    totals: {
      ...totals,
      voucherCount: rows.length,
      liveCount: rows.filter((row) => row.status === "live").length,
      conversionPercent: totals.reachCount > 0
        ? Math.round((totals.activationCount / totals.reachCount) * 1000) / 10
        : 0
    }
  };
}

// Persistenzform fuer restaurants/{id}/public/vouchers.
export function toVoucherStoragePayload(item = {}, { nowMs = Date.now() } = {}) {
  const normalized = normalizeVoucherItem(item);
  const now = new Date(Number.isFinite(Number(nowMs)) ? Number(nowMs) : Date.now()).toISOString();
  return {
    id: normalized.id,
    title: normalized.title,
    text: normalized.text,
    terms: normalized.terms,
    badgeLabel: normalized.badgeLabel,
    imageUrl: normalized.imageUrl,
    cropX: normalized.cropX,
    cropY: normalized.cropY,
    active: normalized.active,
    startAt: normalized.startAt,
    endAt: normalized.endAt,
    activationMinutes: normalized.activationMinutes,
    createdAt: normalized.createdAt || now,
    updatedAt: now
  };
}

// Fehlermeldungen des Editors (leer = speicherbar).
export function validateVoucherDraft(draft = {}) {
  const title = cleanVoucherText(draft.title);
  if (!title) return "Ju lutem shkruani titullin e ofertes.";
  const endMs = toVoucherMillis(draft.endAt);
  if (!endMs) return "Ju lutem zgjidhni deri kur vlen oferta.";
  const startMs = toVoucherMillis(draft.startAt);
  if (startMs && endMs <= startMs) return "Data e mbarimit duhet te jete pas fillimit.";
  return "";
}

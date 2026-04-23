export function normalizeTableNumberCore(value, {
  min = 1,
  max = 200
} = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  const next = Math.trunc(parsed);
  if (next < min || next > max) return 0;
  return next;
}

export function normalizeTableQrCountCore(value, {
  min = 0,
  max = 200
} = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  const next = Math.trunc(parsed);
  if (next < min) return min;
  if (next > max) return max;
  return next;
}

export function buildTableNumberListCore(count, options = {}) {
  const safeCount = normalizeTableQrCountCore(count, options);
  return Array.from({ length: safeCount }, (_, index) => index + 1);
}

export function normalizeTableQrMetaCore(data = {}, options = {}) {
  return {
    enabled: data.tableQrEnabled !== false,
    count: normalizeTableQrCountCore(
      data.tableQrCount
      ?? data.tableCount
      ?? data.tableQrTables
      ?? data.tablesCount
      ?? 0,
      options
    )
  };
}

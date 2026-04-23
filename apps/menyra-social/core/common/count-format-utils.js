export function formatCountCore(value) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  const num = Number(value);
  if (Number.isFinite(num)) return String(num);
  const str = String(value ?? "").trim();
  return str || "0";
}

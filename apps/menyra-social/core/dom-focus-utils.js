export function focusInputByIdCore({
  documentObj,
  inputId,
  preventScroll = true
} = {}) {
  const doc = documentObj && typeof documentObj.getElementById === "function" ? documentObj : null;
  const id = String(inputId || "").trim();
  if (!doc || !id) return false;
  const input = doc.getElementById(id);
  if (!input || typeof input.focus !== "function") return false;
  input.focus({ preventScroll });
  const len = String(input.value || "").length;
  try {
    input.setSelectionRange(len, len);
  } catch {}
  return true;
}

// Keep grid previews separate from the full-size post detail image. Only emit
// width descriptors when the media resolver actually returned that variant.
export function buildProfilePostImage({ rawImage, isGrid, isWide, priorityIndex = -1, resolveImage }) {
  const src = resolveImage(rawImage, isGrid && !isWide ? "small" : "medium");
  const candidates = new Map();
  for (const [size, width] of [["small", 480], ["medium", 768], ["large", 1280]]) {
    const url = resolveImage(rawImage, size);
    try {
      if (Number(new URL(url).searchParams.get("w")) === width) candidates.set(url, width);
    } catch {}
  }
  return {
    src,
    srcset: candidates.size > 1
      ? [...candidates].map(([url, width]) => `${url} ${width}w`).join(", ")
      : "",
    sizes: isGrid && !isWide
      ? "(max-width: 640px) 44vw, (max-width: 1200px) 28vw, 400px"
      : "(max-width: 640px) 90vw, (max-width: 1200px) 60vw, 800px",
    loading: priorityIndex >= 0 && priorityIndex < (isGrid ? 2 : 1) ? "eager" : "lazy",
    fetchPriority: priorityIndex === 0 ? "high" : "auto"
  };
}

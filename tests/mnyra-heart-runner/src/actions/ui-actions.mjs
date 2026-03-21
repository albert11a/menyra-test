export async function runUiLayoutCheck(page, heart, {
  persona,
  viewLabel = "Ansicht",
  moduleKey = "ui",
  action = "ui layout",
  area = "ui"
} = {}) {
  try {
    const result = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const viewportWidth = Math.max(
        Number(window.innerWidth || 0),
        Number(doc?.clientWidth || 0),
        Number(body?.clientWidth || 0)
      );
      const scrollWidth = Math.max(
        Number(doc?.scrollWidth || 0),
        Number(body?.scrollWidth || 0)
      );
      const overflowPx = Math.max(0, scrollWidth - viewportWidth);
      const offenders = [];
      const nodes = Array.from(document.querySelectorAll("body *"));
      for (const node of nodes) {
        if (!(node instanceof HTMLElement)) continue;
        const style = window.getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const rect = node.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        if (rect.right <= viewportWidth + 6 && rect.left >= -6) continue;
        const descriptor = [
          node.tagName.toLowerCase(),
          node.id ? `#${node.id}` : "",
          typeof node.className === "string"
            ? node.className.split(/\s+/).filter(Boolean).slice(0, 2).map((item) => `.${item}`).join("")
            : ""
        ].join("");
        offenders.push({
          selector: descriptor || node.tagName.toLowerCase(),
          left: Math.round(rect.left),
          right: Math.round(rect.right)
        });
        if (offenders.length >= 5) break;
      }
      return {
        viewportWidth,
        scrollWidth,
        overflowPx,
        offenders
      };
    });

    if (Number(result?.overflowPx || 0) > 6 || (Array.isArray(result?.offenders) && result.offenders.length)) {
      const offenderLabel = Array.isArray(result?.offenders)
        ? result.offenders.map((item) => `${item.selector} (${item.left}/${item.right})`).join(", ")
        : "";
      throw new Error(`${viewLabel} ragt mobil aus dem Viewport. Overflow ${result?.overflowPx || 0}px. ${offenderLabel}`.trim());
    }

    heart.passModule(moduleKey, `${viewLabel} bleibt innerhalb der mobilen Breite.`, {
      action,
      persona: persona?.key,
      area
    });
  } catch (error) {
    heart.failModule(moduleKey, error, {
      action,
      title: `${viewLabel} hat ein responsives Layoutproblem`,
      persona: persona?.key,
      area
    });
  }
}

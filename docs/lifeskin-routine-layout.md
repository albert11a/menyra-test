Status: CURRENT

Scope (11.10.2026, owner): improve personal-routine cards, spacing and Lucide icons based on the mobile screenshot; commit/push to main. Uniform image frames and text spacing. Owner correction: retain horizontal swipe, show two full cards at once, snap to card edges and add a Lucide swipe hint when more than two products are selected. Scope is routine-builder CSS/markup only; preserve product photos, selection, pricing, Acne Duo mapping, checkout and tracking.

Validation: 16 scoped personal-routine and Pixel-lock tests passed. npm run build passed; tracked bundle files unchanged, so no generated bundles needed committing. Existing circular/large chunk warnings remain. Browser/mobile verification of the changed layout has not been run.

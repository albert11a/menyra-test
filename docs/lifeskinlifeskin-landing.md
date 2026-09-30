# LifeSkin landing template — /lifeskinlifeskin

Scope: a separate, mobile-first Albanian landing page for cold Instagram/Facebook visitors. Existing /lifeskin, customer reports, checkout, Meta Pixel and CAPI remain untouched. Route the primary CTA to the existing photo entry at /lifeskintrichter?ls_weg=foto. This uses the existing direct-entry handler and its camera/gallery fallback. No new tracking, backend writes, fabricated reviews, patient outcomes or success percentages.

Design: system typography, white/sage palette, large existing brand photos, short sections, one primary action, a small doctor identity block and clear product prices before starting. Product photography is editorial imagery, never patient proof. Prices read the existing shared price helper; HTML has the current fallback prices. Preserve incoming attribution parameters on the same-origin funnel link, including silent preview mode. Native links and FAQ work without JavaScript.

Research:
- Nielsen Norman Group: concise, scannable, objective copy reduces cognitive load. https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/
- Baymard: price transparency and removing unnecessary checkout friction matter. https://baymard.com/blog/reduce-cart-abandonment

These support usability choices, not a promised conversion uplift. Evaluate qualified analysis completions and completed purchases; more starts alone are insufficient. This template does not introduce a new analytics implementation because the repository requires explicit permission for Pixel changes.

Release: a separate review branch and Vercel preview. Repository rules prohibit an automatic main merge or production deployment.

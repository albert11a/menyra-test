# Direct Content Creator customer links

Scope: add explicit `/local-name` aliases for existing Creator page IDs, using
Vercel rewrites to the existing renderer. No redirects, runtime slug queries,
changes to orders/tracking, or changes to the general social profile routes.

Nine customer IDs were verified against the signed-in Heart customer list on
2026-11-03. The public route registry and all six restaurant slug fields were
checked read-only before assignment. `/shpija-e-vjeter` and `/mama-mantia`
already have public route records, so their Creator aliases use `-content`.

| Customer | Direct Creator route |
| --- | --- |
| Shpija e vjetër | `/shpija-e-vjeter-content` |
| Gjinolli Bar & Grill | `/gjinolli-bar-grill` |
| Kosova man wear | `/kosova-man-wear` |
| Piano Parfum | `/piano-parfum` |
| Gingershotks | `/gingershotks` |
| Mama Mantia | `/mama-mantia-content` |
| Fishop Prishtina | `/fishop-prishtina` |
| Boutique 77 | `/boutique-77` |
| Butiku Beni | `/butiku-beni` |

Heart link generation and Open Graph URLs use the verified route map. The
browser hydrates the original page ID from the existing server payload; visits,
orders, downloads, and cart IDs keep their existing identity. Existing
`/content-creator/{id}` URLs continue to serve directly.

For a future customer, verify that its name is unoccupied in publicRoutes,
restaurant document IDs, and the restaurant slug fields before adding both the
map entry in `shared/creator-direct-routes.js` and an exact rewrite in
`vercel.json` before the social catchall. Build rejects missing, shadowed,
reserved, or explicitly redirected assignments. Unregistered future customers
retain their working original links until an alias is deployed. This deliberate
static assignment avoids an extra database lookup on every cold page open.

Validation: all 221 tests from `node --test tests/*creator*.test.mjs` passed,
as did `npm run build` and `git diff --check`; generated
static output is ignored, and the tracked social bundle does not change.
Mobile browser and live cold timing checks remain pending deployment. Unit
tests verify one page read, HTTP 200 without Location, zero hydration fetches,
original tracking identity, and silent preview behavior using synthetic data.

No production deployment or main merge was performed. The repository's branch
and deployment instructions require a separate final release action.

Manual release checks: open a named route and its legacy URL in a fresh mobile
session; confirm one document navigation with no 3xx, identical photos/cart,
same page ID for events, silent preview suppression, and unchanged social
profiles at `/shpija-e-vjeter` and `/mama-mantia`. Measure navigation and first
paint across multiple cold runs on the same network before claiming equal
latency. New customers require an explicit alias registration and release.

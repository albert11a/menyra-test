// Explicit, verified slug -> existing page ID assignments. Keep old assignments
// stable when a business is renamed. Each entry also needs an exact Vercel rewrite.
export const CREATOR_DIRECT_ROUTES = Object.freeze({
  "shpija-e-vjeter-content": "eaecf4ff0c464c969d1c2505b82a0e35",
  "gjinolli-bar-grill": "c1698d697bdd47d1b0a10b68d84da8c2",
  "kosova-man-wear": "3343487d22a6488493d25e066b69a128",
  "piano-parfum": "766557c4bfe44d82b5c0b16bb85c96e6",
  "gingershotks": "5fb0df341abf40b9bb265b9fafcf0bc0",
  "mama-mantia-content": "9acbfe65d90d4ff98e89708ecd50f2ca",
  "fishop-prishtina": "066ccd992f684c3b81413d133081a569",
  "boutique-77": "2f1cbd75727746748cdd8dd8f627547c",
  "butiku-beni": "b63131a03c5449deaf748c29256a276a"
});

export function creatorDirectPath(id, routes = CREATOR_DIRECT_ROUTES) {
  const slug = Object.keys(routes).find(key => routes[key] === id);
  return slug ? `/${slug}` : '';
}

# MNYRA V2

Heart creates restaurant leads with stable public links, contact stages, a business PIN and a feed-posting entitlement. The restaurant surface uses the existing restaurant, menu, story and feed collections. A story and its reel share one document. There is no ordering flow in V2. The existing location-aware social feed becomes the public homepage. Creator and legacy restaurant links retain their own routing.

Private lead metadata, access credentials and rate limits stay outside public restaurant documents. Writes that establish a route, publish into the feed, or change a reaction are atomic. Public entry and editing/media code are loaded separately.

# MENYRA Platform - Current Overview (2025-12-24)

This repo hosts System 1 (Restaurants) and System 2 (Social). It summarizes apps,
roles, data flow, and the current working features.

## Apps and Roles
- CEO Platform (`apps/menyra-ceo/`): full access to all customers and dashboards.
- Staff Platform (`apps/menyra-staff/`): scoped to assigned customers.
- Owner Admin (`apps/menyra-owner/`): per customer via `?r=<id>`.
- Main Page (`apps/menyra-main/`): public landing page per business.
- Guest (`apps/menyra-restaurants/guest/`): menu, details, ordering, stories.
- Social (`apps/menyra-social/`): feed, discover, post detail, profile, login/register.
- Waiter (`apps/menyra-restaurants/waiter/`): live orders for a restaurant.
- Kitchen (`apps/menyra-restaurants/kitchen/`): food-only items + status updates.

## Auth and Access
- Boot overlay: body starts with `m-boot m-app-hidden`; UI shows after auth + access.
- CEO: `superadmins/{uid}` must exist.
- Staff: `staffAdmins/{uid}` or `superadmins/{uid}`.
- Owner: `restaurants/{rid}/staff/{uid}` role `owner|admin|manager`.
- Waiter/Kitchen: same staff role checks (basic; rules hardening still needed).

## System 1 (Restaurants) - Current Capabilities
- Guest ordering via QR: reads `public/meta`, `public/menu`, `public/offers`.
- Orders are written to `restaurants/{rid}/orders`.
- Stories via Bunny Stream, TTL cleanup from Owner.
- Admin dashboard: active customers, revenue, demos, leads, next billing,
  active stories, live stats, system logs.
- Caching: localStorage TTL (~2 min), refresh (~50s). Live only where needed.
- Waiter/Kitchen: real-time orders + status updates
  (`new/accepted/cooking/ready/done/cancelled`).

## System 2 (Social) - Current Capabilities
- Social feed with tabs + "All" tab (reads `socialFeed` index).
- Discover by city/type; links to Main Page.
- Post detail page (image/video).
- User login/register + profile (MVP).
- Owner/Staff/CEO can post for a restaurant:
  - upload image to Bunny Storage
  - write to `restaurants/{rid}/socialPosts`
  - mirror into `socialFeed` index
- City selection is manual in Owner (datalist from existing restaurant cities).

## Data Model (Core)
- Restaurants: `restaurants/{rid}` (type, status, city, geo, plan, assignedStaffId, etc)
- Public profile: `restaurants/{rid}/publicProfile/profile`
- Social source: `restaurants/{rid}/socialPosts/{postId}`
- Social index: `socialFeed/{postId}`
- Orders: `restaurants/{rid}/orders/{orderId}` (items include type + category)
- Stories: `restaurants/{rid}/stories/{storyId}` (Bunny Stream videoId)
- System logs: `systemLogs/{logId}`

Note: the main collection is still named `restaurants`, but `type` supports
non-restaurant businesses (services, ecommerce, etc).

## Bunny Edge (Uploads + Stories)
- Script: `bunny-edge/menyra-edge.js`
- Base URL: `shared/bunny-edge.js` (`BUNNY_EDGE_BASE`)
- Endpoints:
  - `POST /story/start`
  - `POST /story/delete`
  - `POST /image/upload` (multipart/form-data: `file`, `restaurantId`)
- CORS is controlled by `ALLOWED_ORIGINS`.

## Local Start
1) Run a static server in the repo root.
2) Open `/index.html`.

## Known TODO
- Production rules hardening for Owner/Waiter/Kitchen.
- Social moderation tools for CEO/Staff (not implemented yet).
- E-commerce phase (themes/products/orders) not implemented yet.
- Guest edge-case hardening.

## Recent Changes
- Owner and Main moved to `apps/menyra-owner` and `apps/menyra-main`.
- Social feed improvements (All tab + URL normalization).
- Waiter/Kitchen baseline implemented.
- Bunny Edge upload endpoints for images + stories.

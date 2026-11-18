import { v2Store, change, remove, problem, stamp } from "../server/v2-store.js";
import {
  createLead,
  editBusiness,
  stages,
  slugOk,
  idOk,
  snapshot,
} from "../server/v2-business.js";
import {
  allowed,
  mediaTicket,
  pinFor,
  safeEqual,
  session,
  throttle,
  visitorKey,
} from "../server/v2-access.js";
import { isCreatorResetAdmin } from "../server/creator-reset.js";
import { randomBytes } from "node:crypto";

export async function serveV2(
  req,
  res,
  { store = v2Store, authorize = isCreatorResetAdmin } = {},
) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  const reply = (status, data) => {
    res.statusCode = status;
    res.end(JSON.stringify(data));
  };
  try {
    if (
      req.method !== "POST" ||
      !req.headers["content-type"]?.startsWith("application/json") ||
      req.headers["sec-fetch-site"] === "cross-site"
    )
      return reply(403, {});
    const input =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    if (JSON.stringify(input).length > 12000) return reply(413, {});
    const { op, slug } = input,
      admin = String(op).startsWith("admin-");
    if (admin && !(await authorize(req)))
      return reply(403, { error: "CEO-Anmeldung erforderlich." });
    const repo = await store();
    if (op === "admin-create") return reply(201, await createLead(repo, input));
    if (op === "admin-list") {
      if (input.after && !slugOk(input.after)) return reply(400, {});
      if (input.stage && !stages.includes(input.stage)) return reply(400, {});
      const rows = await repo.query("v2Leads", {
        where: input.stage ? ["stage", input.stage] : null,
        order: "__name__",
        limit: 41,
        start: input.after,
      });
      const leads = await Promise.all(
        rows
          .slice(0, 40)
          .map(async (r) => ({
            slug: r.id,
            name: (await repo.read("restaurants/" + r.id))?.data.name || r.id,
            stage: r.data.stage,
            subscribed: r.data.subscribed,
          })),
      );
      return reply(200, {
        leads,
        next: rows.length > 40 ? leads.at(-1).slug : null,
      });
    }
    if (!slugOk(slug)) return reply(400, {});
    const leadPath = "v2Leads/" + slug,
      lead = await repo.read(leadPath);
    if (!lead) return reply(404, { error: "Biznesi nuk u gjet." });
    if (op === "admin-pin")
      return reply(200, { pin: pinFor(slug, lead.data.salt) });
    if (op === "admin-stage" || op === "admin-subscription") {
      if (
        op === "admin-stage"
          ? !stages.includes(input.stage)
          : typeof input.subscribed !== "boolean"
      )
        return reply(400, {});
      await repo.commit([
        change(
          leadPath,
          op === "admin-stage"
            ? { stage: input.stage }
            : { subscribed: input.subscribed },
          lead.version,
          true,
        ),
      ]);
      return reply(200, {});
    }
    const ip =
      req.headers["x-vercel-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      "unknown";
    const cookie = (token, age) =>
      res.setHeader(
        "Set-Cookie",
        "__Host-mnyra-v2=" +
          token +
          "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" +
          age,
      );
    if (op === "login") {
      await Promise.all([
        throttle(repo, "pin-ip/" + ip, 10),
        throttle(repo, "pin-slug/" + slug, 35),
      ]);
      if (!safeEqual(input.pin, pinFor(slug, lead.data.salt)))
        throw problem(403, "PIN-i është gabim.");
      cookie(session(slug, lead.data.salt), 604800);
      return reply(200, { subscribed: lead.data.subscribed });
    }
    if (op === "logout") {
      cookie("", 0);
      return reply(200, {});
    }
    const owner = allowed(req, slug, lead.data.salt);
    if (op === "session")
      return reply(200, { owner, subscribed: owner && lead.data.subscribed });
    if (op === "refresh") return reply(200, await snapshot(repo, slug));
    if (["like", "comment", "comments"].includes(op)) {
      const collection =
        input.kind === "story"
          ? "stories"
          : input.kind === "item"
            ? "menuItems"
            : null;
      if (!collection || !idOk(input.id)) return reply(400, {});
      const prefix = "restaurants/" + slug + "/";
      const path =
        prefix +
        (input.kind === "item" ? "menuSocial" : collection) +
        "/" +
        input.id;
      const item = await repo.read(prefix + collection + "/" + input.id);
      if (!item || item.data.hidden || item.data.active === false)
        return reply(404, {});
      if (op === "comments")
        return reply(200, {
          comments: (
            await repo.query("comments", {
              parent: path,
              order: "createdAt",
              limit: 60,
            })
          ).map((r) => r.data.text),
        });
      const totals = input.kind === "item" ? await repo.read(path) : item;
      await throttle(repo, "social/" + ip, 100);
      if (op === "comment") {
        const text = String(input.text || "")
          .trim()
          .slice(0, 500);
        if (!text || !idOk(input.requestId)) return reply(400, {});
        await repo.commit([
          change(
            path + "/comments/" + input.requestId,
            {
              text,
              author: "Vizitor",
              parentId: null,
              likesCount: 0,
              createdAt: stamp(),
            },
            false,
          ),
          change(
            path,
            { commentsCount: (totals?.data.commentsCount || 0) + 1 },
            totals?.version || false,
            true,
          ),
        ]);
      } else {
        let visitor = (req.headers.cookie || "").match(
          /(?:^|; )__Host-v2-guest=([0-9a-f]{48})(?:;|$)/,
        )?.[1];
        if (!visitor) {
          visitor = randomBytes(24).toString("hex");
          res.setHeader(
            "Set-Cookie",
            "__Host-v2-guest=" +
              visitor +
              "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000",
          );
        }
        const likePath = path + "/likes/" + visitorKey(visitor),
          like = await repo.read(likePath);
        const liked = input.liked === true;
        if (liked !== !!like)
          await repo.commit([
            liked
              ? change(likePath, { createdAt: stamp() }, false)
              : remove(likePath, like.version),
            change(
              path,
              {
                likesCount: Math.max(
                  0,
                  (totals?.data.likesCount || 0) + (liked ? 1 : -1),
                ),
              },
              totals?.version || false,
              true,
            ),
          ]);
        return reply(200, {
          liked,
          count: Math.max(
            0,
            (totals?.data.likesCount || 0) +
              (liked === !!like ? 0 : liked ? 1 : -1),
          ),
        });
      }
      return reply(200, {});
    }
    if (!owner) throw problem(401, "Kyçu me PIN-in e biznesit.");
    if (op === "ticket") {
      if (!["image_upload", "story_upload"].includes(input.action))
        return reply(400, {});
      return reply(200, await mediaTicket(slug, input.action));
    }
    return reply(200, await editBusiness(repo, slug, input, lead));
  } catch (e) {
    return reply(e.status || 503, {
      error: e.status ? e.message : "Provo përsëri pas pak.",
    });
  }
}
export default (req, res) => serveV2(req, res);

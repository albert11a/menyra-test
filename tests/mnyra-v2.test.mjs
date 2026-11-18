import test from "node:test";
import assert from "node:assert/strict";
import { serveV2 } from "../api/mnyra-v2.js";
import { snapshot } from "../server/v2-business.js";
import { renderPage } from "../apps/mnyra-v2/view.js";
import { memoryStore } from "./support/v2-memory-store.mjs";
test("Heart lead to menu, reel, guest reaction and entitled feed publication", async () => {
  process.env.MNYRA_FIREBASE_ADMIN_KEY = JSON.stringify({
    private_key: "test only",
    client_email: "test@example.invalid",
  });
  const repo = memoryStore(),
    slug = "riga-demo";
  let cookie = "";
  async function api(op, input = {}, admin = false, remember = true) {
    let value;
    const headers = {};
    const res = {
      setHeader: (k, v) => (headers[k] = v),
      end: (s) => {
        value = JSON.parse(s);
      },
    };
    await serveV2(
      {
        method: "POST",
        body: { op, slug, ...input },
        headers: { "content-type": "application/json", cookie },
      },
      res,
      { store: async () => repo, authorize: async () => admin },
    );
    if (remember && headers["Set-Cookie"])
      cookie = headers["Set-Cookie"].split(";")[0];
    return { status: res.statusCode, ...value };
  }
  assert.equal(
    (await api("admin-create", { name: "Riga Demo", city: "Prishtinë" }))
      .status,
    403,
  );
  const lead = await api(
    "admin-create",
    { name: "Riga Demo", city: "Prishtinë" },
    true,
  );
  assert.equal(lead.status, 201);
  assert.match(lead.pin, /^[0-9]{5}$/);
  const repeated = await api("admin-create", { name: "Riga Demo", city: "Prishtinë" }, true);
  assert.equal(repeated.status, 200);
  assert.equal(repeated.existing, true);
  assert.equal(repeated.pin, lead.pin);
  assert.equal(
    (
      await api(
        "admin-create",
        { slug: "feed", name: "Feed", city: "Prishtinë" },
        true,
      )
    ).status,
    400,
  );
  assert.equal((await api("login", { pin: "00000" })).status, 403);
  assert.equal((await api("item", { id: "d".repeat(32) })).status, 401);
  assert.equal((await api("login", { pin: lead.pin })).status, 200);
  const ownerCookie = cookie;
  const id = "a".repeat(32),
    mediaUrl =
      "https://menyra-media.alberthoti-vsa.workers.dev/media/social/riga-demo/photo.jpg";
  assert.equal(
    (await api("item", { id, name: "Petulla", price: "2.75", type: "food" }))
      .status,
    200,
  );
  const page = await snapshot(repo, slug);
  assert.equal(page.items[0].price, 2.75);
  assert.equal(
    (
      await api("item", {
        id,
        name: "Speca",
        price: 3,
        type: "food",
        version: "old",
      })
    ).status,
    409,
  );
  assert.equal(
    (await api("story", { id, mediaUrl, caption: "Sot" })).status,
    200,
  );
  assert.equal((await api("post", { id, mediaUrl })).status, 403);
  assert.equal(
    (await api("admin-subscription", { subscribed: true }, true)).status,
    200,
  );
  assert.equal((await api("post", { id, mediaUrl })).status, 200);
  assert.equal(
    (await repo.read("socialFeed/" + id)).data.canonicalPath,
    "restaurants/" + slug + "/socialPosts/" + id,
  );
  assert.equal(
    (await api("admin-subscription", { subscribed: false }, true)).status,
    200,
  );
  assert.equal(
    (await api("post", { id: "b".repeat(32), mediaUrl })).status,
    403,
  );
  const markup = renderPage(await snapshot(repo, slug));
  assert.match(markup, /Petulla/);
  assert.match(markup, /Sot/);
  assert.doesNotMatch(markup, /data-action="order"/);
  cookie = "";
  assert.equal((await api("like", { id, kind: "item", liked: true })).count, 1);
  assert.equal((await api("like", { id, kind: "item", liked: true })).count, 1);
  assert.equal(
    (await api("like", { id, kind: "item", liked: false })).count,
    0,
  );
  assert.equal(
    (
      await api("comment", {
        id,
        kind: "story",
        text: "Mirë!",
        requestId: "b".repeat(32),
      })
    ).status,
    200,
  );
  assert.deepEqual((await api("comments", { id, kind: "story" })).comments, [
    "Mirë!",
  ]);
  cookie = ownerCookie;
  assert.equal(
    (await api("admin-stage", { stage: "Kunde" }, true)).status,
    200,
  );
  assert.equal(
    (await api("admin-list", { stage: "Kunde" }, true)).leads.length,
    1,
  );
  assert.equal((await api("logout")).status, 200);
  assert.equal((await api("session")).owner, false);
});
test("HTML and initial client state contain the same escaped restaurant", async () => {
  const { restaurantDocument } = await import("../server/v2-document.js");
  const { createLead } = await import("../server/v2-business.js");
  const repo = memoryStore();
  await createLead(repo, {
    slug: "mobile-demo",
    city: "Prishtinë",
    name: "Riga </script> & Grill",
  });
  const html = await restaurantDocument("mobile-demo", async () => repo);
  const state = JSON.parse(
    /id="restaurant" type="application\/json">([\s\S]*?)<\/script>/.exec(
      html,
    )[1],
  );
  assert.equal(state.name, "Riga </script> & Grill");
  assert.equal(state.slug, "mobile-demo");
  assert.ok(html.includes("Riga &lt;/script&gt; &amp; Grill"));
  assert.equal(state.salt, undefined);
});

test("Numa retains a reserved Creator page and repeated submissions return one V2 lead", async () => {
  const { createLead } = await import("../server/v2-business.js");
  const { change } = await import("../server/v2-store.js");
  const repo = memoryStore();
  const input = { name: "Numa", city: "Prishtina", countryCode: "xk", slug: "Numa" };
  await repo.commit([change("contentCreatorPages/numa", { kind: "existing-shop" }, false)]);
  const [first, second] = await Promise.all([createLead(repo, input), createLead(repo, input)]);
  assert.equal(first.slug, "numa-prishtina");
  assert.equal(second.pin, first.pin);
  assert.equal((await repo.query("v2Leads")).length, 1);
  assert.equal((await repo.read("contentCreatorPages/numa")).data.kind, "existing-shop");
  await assert.rejects(createLead(repo, { ...input, name: "Another business" }), /Profillink ist bereits belegt/);
});

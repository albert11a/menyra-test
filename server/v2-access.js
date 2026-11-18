import {
  createHmac,
  randomBytes,
  timingSafeEqual,
  createHash,
  createSign,
} from "node:crypto";
import { schluessel } from "../api/lifeskin-meldung.js";
import { MEDIA_TICKET_ENDPOINT } from "../shared/bunny-edge.js";
import { change, problem } from "./v2-store.js";
const secret = () => schluessel().private_key;
const mac = (text) =>
  createHmac("sha256", secret()).update(text).digest("base64url");
export const pinFor = (slug, salt) =>
  String(
    10000 +
      Number(
        BigInt(
          "0x" +
            createHmac("sha256", secret())
              .update("pin/" + slug + "/" + salt)
              .digest("hex"),
        ) % 90000n,
      ),
  );
export const newSalt = () => randomBytes(18).toString("hex");
export const visitorKey = (raw) =>
  createHash("sha256").update(raw).digest("hex");
export function safeEqual(a, b) {
  const x = Buffer.from(String(a)),
    y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}
export function session(slug, salt, now = Date.now()) {
  const head = slug + "." + (now + 7 * 86400000);
  return head + "." + mac("session/" + head + "/" + salt);
}
export function allowed(req, slug, salt, now = Date.now()) {
  const token =
    (req.headers.cookie || "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("__Host-mnyra-v2="))
      ?.split("=")[1] || "";
  const [id, expires, sig] = token.split(".");
  return (
    id === slug &&
    Number(expires) > now &&
    safeEqual(sig, mac("session/" + id + "." + expires + "/" + salt))
  );
}
export async function throttle(repo, scope, max, window = 900000) {
  const time = Date.now(),
    path = "v2Limits/" + visitorKey(scope + "/" + Math.floor(time / window));
  for (let i = 0; i < 5; i++) {
    const row = await repo.read(path);
    if ((row?.data.n || 0) >= max)
      throw problem(429, "Shumë tentativa. Provo më vonë.");
    try {
      await repo.commit([
        change(
          path,
          { n: (row?.data.n || 0) + 1, expireAt: new Date(time + 2 * window) },
          row?.version || false,
        ),
      ]);
      return;
    } catch (e) {
      if (e.status !== 409) throw e;
    }
  }
  throw problem(429, "Provo përsëri pas pak.");
}
// Exchange a dedicated restaurant identity on the server. Only the scoped upload ticket reaches the client.
export async function mediaTicket(slug, action) {
  const key = schluessel(),
    iat = Math.floor(Date.now() / 1000);
  const enc = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
  const head =
    enc({ alg: "RS256", typ: "JWT" }) +
    "." +
    enc({
      iss: key.client_email,
      sub: key.client_email,
      aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
      iat,
      exp: iat + 300,
      uid: "v2-" + slug,
    });
  const token =
    head +
    "." +
    createSign("RSA-SHA256").update(head).sign(key.private_key, "base64url");
  const r = await fetch(
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, returnSecureToken: true }),
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!r.ok) throw problem(503, "Ngarkimi nuk mund të fillojë.");
  const { idToken } = await r.json();
  const result = await fetch(MEDIA_TICKET_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: "Bearer " + idToken,
      "content-type": "application/json",
    },
    body: JSON.stringify({ restaurantId: slug, action }),
    signal: AbortSignal.timeout(10000),
  });
  const out = await result.json();
  if (!result.ok || !out.ticket)
    throw problem(503, "Ngarkimi nuk mund të fillojë.");
  return { ticket: out.ticket };
}

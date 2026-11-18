import { BUNNY_EDGE_BASE } from "../../shared/bunny-edge.js";
import {
  compressImage,
  compressImageThumb,
} from "../menyra-social/_shared/image-compressor.js";
import {
  creatorMediaUrl,
  creatorVideoMediaUrl,
} from "../../shared/creator-media.js";
export async function uploadFile(file, slug, call, status) {
  const video = file.type.startsWith("video/");
  async function send(blob, kind, thumb) {
    const { ticket } = await call("ticket", {
      action: kind === "image" ? "image_upload" : "story_upload",
    });
    const form = new FormData();
    form.append("restaurantId", slug);
    form.append(
      "file",
      blob,
      blob.name ||
        (kind === "image"
          ? "photo.jpg"
          : blob.type.includes("webm")
            ? "clip.webm"
            : "clip.mp4"),
    );
    if (thumb) form.append("thumb", thumb, "thumb.webp");
    status.textContent = "Duke ngarkuar…";
    const res = await fetch(BUNNY_EDGE_BASE + "/" + kind + "/upload", {
      method: "POST",
      headers: { authorization: "Bearer " + ticket },
      body: form,
      signal: AbortSignal.timeout(240000),
    });
    const out = await res.json();
    const url = (kind === "image" ? creatorMediaUrl : creatorVideoMediaUrl)(
      out.cdnUrl || out.url,
    );
    if (!res.ok || !url) throw Error("Ngarkimi dështoi. Provo përsëri.");
    return url;
  }
  async function photo(f) {
    const [main, thumb] = await Promise.all([
      compressImage(f, 1600, 0.84, "image/jpeg"),
      compressImageThumb(f),
    ]);
    return send(main, "image", thumb);
  }
  if (!video) {
    if (!file.type.startsWith("image/") || file.size > 30 * 1024 * 1024)
      throw Error("Zgjidh një foto deri në 30 MB.");
    return { url: await photo(file), video: false };
  }
  const { prepareCreatorVideo } =
    await import("../mnyra-heart/heart-creator-video.js");
  const prepared = await prepareCreatorVideo(file, { free: true, loop: false });
  const [url, poster] = await Promise.all([
    send(prepared.preview, "story"),
    photo(new File([prepared.poster], "poster.jpg", { type: "image/jpeg" })),
  ]);
  return { url, poster, video: true };
}

// =========================================================
// MENYRA — Bunny public configuration (SAFE in browser)
// - DO NOT put API keys/passwords here.
// =========================================================

// Your custom CDN hostname for images (Storage Zone → Pull Zone)
export const BUNNY_IMAGES_CDN_HOST = "Menyra.b-cdn.net";

// Bunny Stream
export const BUNNY_STREAM_LIBRARY_ID = 568747;
export const BUNNY_STREAM_CDN_HOST = "vz-e3ced87e-921.b-cdn.net";

// Build playback URLs for a Bunny Stream video.
// Note: mp4 files exist only if MP4 fallback is enabled and the encode finished.
export function streamUrls(videoId) {
  const base = `https://${BUNNY_STREAM_CDN_HOST}/${videoId}`;
  return {
    hls: `${base}/playlist.m3u8`,
    mp4_720: `${base}/play_720p.mp4`,
    mp4_1080: `${base}/play_1080p.mp4`,
    thumb: `${base}/thumbnail.jpg`,
    player: `https://video.bunnycdn.com/play/${BUNNY_STREAM_LIBRARY_ID}/${videoId}`,
  };
}

import { crc32, deflateSync } from 'node:zlib';
import sharp from 'sharp';
import decodeHeic from 'heic-decode';
import { STUDIO_EXPORTS, STUDIO_FORMATS } from '../shared/photo-studio.js';

const PIXELS = 52_000_000;
const OPTIONS = { limitInputPixels: PIXELS, failOn: 'warning' };

async function heicInput(bytes, info) {
  const { data, width, height } = await decodeHeic({ buffer: bytes });
  const raw = sharp(data, { raw: { width, height, channels: 4 }, ...OPTIONS });
  if (!info.icc) return raw;
  // The WASM decoder returns RGB pixels separately from the camera profile.
  const png = await raw.png().toBuffer();
  const profile = Buffer.concat([Buffer.from('ICC\0\0'), deflateSync(info.icc)]);
  const chunk = Buffer.alloc(profile.length + 12);
  chunk.writeUInt32BE(profile.length);
  chunk.write('iCCP', 4);
  profile.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(chunk.subarray(4, -4)), chunk.length - 4);
  return sharp(Buffer.concat([png.subarray(0, 33), chunk, png.subarray(33)]), OPTIONS);
}

export async function studioImage(bytes, { edited = false } = {}) {
  try {
    const image = sharp(bytes, OPTIONS);
    const info = await image.metadata();
    if (!Object.hasOwn(STUDIO_FORMATS, info.format) || !info.width || !info.height || info.width * info.height > PIXELS ||
        (info.format === 'heif' ? info.compression !== 'hevc' : (info.pages || 1) > 1)) throw Error('Image format or dimensions not supported');
    let render = edge => image.clone().autoOrient().resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true })
      .keepIccProfile().webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
    let large;
    try { large = await render(1440); }
    catch (error) {
      if (info.format !== 'heif') throw error;
      const decoded = await heicInput(bytes, info);
      render = edge => decoded.clone().resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true })
        .keepIccProfile().webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
      large = await render(1440);
    }
    const thumb = await render(420);
    const previews = { large: large.data, thumb: thumb.data };
    if (edited) {
      for (const [size, variant] of Object.entries({ large, thumb })) {
        const { width, height } = variant.info;
        const font = Math.max(1, Math.min(width / 12, height / 4));
        const svg = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="mark" width="${font * 10}" height="${font * 5}" patternUnits="userSpaceOnUse" patternTransform="rotate(-23)"><text x="${font}" y="${font * 3}" fill="white" fill-opacity=".42" stroke="black" stroke-opacity=".26" stroke-width=".6" font-family="sans-serif" font-weight="bold" font-size="${font}">MNYRA PREVIEW</text></pattern></defs><rect width="100%" height="100%" fill="url(#mark)"/></svg>`);
        previews['marked-' + size] = await sharp(variant.data).composite([{ input: svg }]).keepIccProfile().webp({ quality: 86 }).toBuffer();
      }
    }
    return {
      mime: STUDIO_FORMATS[info.format][0], extension: STUDIO_FORMATS[info.format][1],
      width: large.info.width, height: large.info.height, bytes: bytes.length, previews
    };
  } catch (error) {
    throw Object.assign(Error('Formati ose madhësia e fotos nuk mbështetet.'), { invalidImage: true, cause: error });
  }
}

export async function studioSocialExport(bytes, format) {
  const [width, height] = STUDIO_EXPORTS[format];
  const image = sharp(bytes, OPTIONS);
  const info = await image.metadata();
  const resize = source => source.resize({ width, height, fit: 'contain', position: 'centre', background: '#111213' })
    .flatten({ background: '#111213' }).keepIccProfile().jpeg({ quality: 94, chromaSubsampling: '4:4:4' }).toBuffer();
  try { return await resize(image.autoOrient()); }
  catch (error) {
    if (info.format !== 'heif') throw error;
    return resize(await heicInput(bytes, info));
  }
}

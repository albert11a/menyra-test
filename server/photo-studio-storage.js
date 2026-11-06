import { createHash } from 'node:crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import ZipStream from 'zip-stream';
import { STUDIO_MAX_BYTES } from '../shared/photo-studio.js';

const hashKey = key => createHash('sha256').update(key).digest('hex');
let instance;
export function studioStorage(env = process.env) {
  if (instance && env === process.env) return instance;
  const { PHOTO_STUDIO_R2_ACCOUNT: accountId, PHOTO_STUDIO_R2_BUCKET: bucket,
    PHOTO_STUDIO_R2_ACCESS_KEY: accessKeyId, PHOTO_STUDIO_R2_SECRET_KEY: secretAccessKey } = env;
  if (!/^[a-f0-9]{32}$/.test(accountId || '') || !bucket || !accessKeyId || !secretAccessKey) {
    throw Error('Photo Studio private bucket missing');
  }
  const client = new S3Client({
    region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
    requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED'
  });
  const object = key => ({ Bucket: bucket, Key: key });
  const send = command => client.send(command, { abortSignal: AbortSignal.timeout(45000) });
  const storage = {
    upload(key, size) {
      return getSignedUrl(client, new PutObjectCommand({
        ...object(key), ContentLength: size, IfNoneMatch: '*'
      }), { expiresIn: 600, signableHeaders: new Set(['content-length', 'if-none-match']) });
    },
    async readUpload(key) {
      const response = await send(new GetObjectCommand({ ...object(key), Range: `bytes=0-${STUDIO_MAX_BYTES}` }));
      if (response.ContentLength < 1 || response.ContentLength > STUDIO_MAX_BYTES || Number(response.ContentRange?.split('/').at(-1) || response.ContentLength) !== response.ContentLength) {
        response.Body.destroy();
        throw Object.assign(Error('Invalid upload size'), { invalidImage: true });
      }
      return Buffer.from(await response.Body.transformToByteArray());
    },
    async put(key, body, mime, filename = '') {
      await send(new PutObjectCommand({
        ...object(key), Body: body, ContentType: mime, CacheControl: 'private, no-store',
        ...(filename ? { ContentDisposition: `attachment; filename="${filename}"` } : {})
      }));
    },
    async copy(source, destination) {
      await send(new CopyObjectCommand({ ...object(destination), CopySource: bucket + '/' + source.split('/').map(encodeURIComponent).join('/') }));
    },
    sign(key, name = '', short = false) {
      return getSignedUrl(client, new GetObjectCommand({
        ...object(key), ResponseCacheControl: 'private, no-store',
        ...(name ? { ResponseContentDisposition: `attachment; filename="photo"; filename*=UTF-8''${encodeURIComponent(name).replace(/['()*]/g, c => '%' + c.charCodeAt(0).toString(16))}` } : {})
      }), { expiresIn: name || short ? 90 : 900 });
    },
    async export(orderId, source, format, render) {
      const key = `exports/${orderId}/${hashKey(source)}/${format}.jpg`;
      try { await send(new HeadObjectCommand(object(key))); }
      catch (error) {
        if (error.$metadata?.httpStatusCode !== 404) throw error;
        await storage.put(key, await render(await storage.readUpload(source), format), 'image/jpeg', 'MNYRA-Edit.jpg');
      }
      return key;
    },
    async archive(orderId, variant, files) {
      const hash = createHash('sha256').update(JSON.stringify(files)).digest('hex');
      const key = `archives/${orderId}/${variant}-${hash}.zip`;
      try {
        await send(new HeadObjectCommand(object(key)));
      } catch (error) {
        if (error.$metadata?.httpStatusCode !== 404) throw error;
        const zip = new ZipStream({ store: true });
        const upload = new Upload({
          client, params: { ...object(key), Body: zip, ContentType: 'application/zip', ContentDisposition: 'attachment; filename="MNYRA-Photo-Studio.zip"', CacheControl: 'private, no-store' },
          queueSize: 2, partSize: 8 * 1024 * 1024
        });
        const pack = async () => {
          for (const file of files) {
            const { Body } = await send(new GetObjectCommand(object(file.key)));
            await new Promise((resolve, reject) => {
              Body.once('error', reject);
              zip.entry(Body, { name: file.name }, error => error ? reject(error) : resolve());
            });
          }
          zip.finish();
        };
        const completion = upload.done();
        try {
          await Promise.all([pack(), completion]);
        } catch (error) {
          zip.destroy();
          await upload.abort().catch(() => {});
          throw error;
        }
      }
      return key;
    }
  };
  if (env === process.env) instance = storage;
  return storage;
}

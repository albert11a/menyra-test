import { expect, test } from '@playwright/test';
import sharp from 'sharp';
import { photoStudioAction } from '../../server/photo-studio.js';
import { studioImage } from '../../server/photo-studio-images.js';
import { STUDIO_PAGE_A as pageId, studioFixture } from '../helpers/photo-studio-fixture.mjs';

test('customer and Heart complete a private Photo Studio order', async ({ page, context, isMobile }) => {
  const fixture = studioFixture();
  const original = await sharp({ create: { width: 320, height: 240, channels: 3, background: '#a56a3a' } }).jpeg().toBuffer();
  const edited = await sharp({ create: { width: 320, height: 240, channels: 3, background: '#8b3a24' } }).jpeg().toBuffer();
  let failedUpload = false, adminChanges = 0;
  await context.route('**/api/photo-studio', async route => {
    const input = route.request().postDataJSON();
    const admin = route.request().headers().authorization === 'Bearer test-admin';
    try {
      const json = await photoStudioAction(input, { ...fixture, image: studioImage, admin });
      if (admin && ['admin-accept-result', 'admin-state'].includes(input.op)) adminChanges++;
      await route.fulfill({ json });
    } catch (error) {
      await route.fulfill({ status: error.status || 500, json: { error: error.message } });
    }
  });
  await context.route('**/fixture/**', async route => {
    const url = new URL(route.request().url()), key = url.searchParams.get('key')!;
    if (url.pathname.endsWith('/upload')) {
      if (!failedUpload) { failedUpload = true; await route.abort('connectionreset'); return; }
      fixture.objects.set(key, route.request().postDataBuffer());
      await route.fulfill({ status: 200 }); return;
    }
    await route.fulfill({ contentType: key.endsWith('.webp') ? 'image/webp' : 'image/jpeg', body: fixture.objects.get(key),
      headers: key.endsWith('.webp') ? {} : { 'content-disposition': 'attachment; filename="Studio.jpg"' } });
  });
  const studioPath = '/apps/content-creator/photo-studio.html?page=' + pageId;
  await page.goto(studioPath);
  await page.locator('input[type=file]').setInputFiles({ name: 'Original.jpg', mimeType: 'image/jpeg', buffer: original });
  await page.getByLabel('Emri', { exact: true }).fill('Studio Customer');
  await page.getByLabel('Telefoni').fill('+383 44 123 456');
  await page.getByRole('checkbox').check();
  await expect(page.locator('[data-total]')).toContainText('0,25');
  await page.getByRole('button', { name: 'Dërgo porosinë' }).click();
  await expect(page.getByRole('alert')).toContainText('Kontrollo fotot');
  await page.getByRole('button', { name: 'Dërgo porosinë' }).click();
  await expect(page.getByRole('heading', { name: 'Porosia u pranua!' })).toBeVisible();
  await expect(page.locator('[data-status]')).toContainText('Në pritje');
  await expect(page.locator('[data-save]')).toBeHidden();
  await expect(page.locator('.studio-comparison img')).toHaveCount(1);

  const adminPage = await context.newPage();
  await adminPage.route('**/studio-admin-fixture', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Heart test fixture</title>' }));
  await adminPage.goto('/studio-admin-fixture');
  const order = [...fixture.docs.values()].find(row => row.path.startsWith('photoStudioOrders/'))!.data;
  await adminPage.evaluate(async initial => {
    const { openHeartStudio } = await import('/apps/mnyra-heart/heart-photo-studio.js');
    const request = async (op, data) => {
      const response = await fetch('/api/photo-studio', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-admin' }, body: JSON.stringify({ op, ...data }) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      return result;
    };
    const store = { subscribe(listener) { window.applyStudioUpdate = next => listener({ auth: { status: 'authenticated', access: { allowed: true } }, contentCreator: { studioOrders: [next] } }); return () => {}; } };
    openHeartStudio({ store, initial, request });
  }, order);
  const applyAdminChanges = async (count: number) => {
    await expect.poll(() => adminChanges).toBe(count);
    const next = fixture.docs.get('photoStudioOrders/' + order.id)!.data;
    await adminPage.evaluate(row => window.applyStudioUpdate(row), next);
  };
  await adminPage.locator('input[type=file]').setInputFiles({ name: 'Edit.jpg', mimeType: 'image/jpeg', buffer: edited });
  await adminPage.getByRole('button', { name: 'Ergebnis speichern' }).click();
  await applyAdminChanges(1);
  await expect(adminPage.locator('.studio-comparison img')).toHaveCount(2);
  await adminPage.getByRole('button', { name: 'Ergebnis für Kunden freigeben' }).click();
  await adminPage.getByRole('button', { name: 'Bestätigen', exact: true }).click();
  await applyAdminChanges(2);

  await page.bringToFront();
  await expect(page.locator('[data-status]')).toContainText('Në pritje të pagesës', { timeout: 12000 });
  await expect(page.locator('.studio-comparison')).toHaveAttribute('data-mode', isMobile ? 'slider' : 'side');
  await expect(page.locator('.studio-comparison img').last()).toHaveAttribute('src', /marked-large/);
  await page.getByRole('button', { name: 'Para', exact: true }).click();
  await expect(page.locator('.studio-comparison')).toHaveAttribute('data-mode', 'before');
  await expect(page.locator('[data-save]')).toBeHidden();

  await adminPage.getByRole('button', { name: 'Zahlung erfassen' }).click();
  await adminPage.getByLabel('Beleg oder Referenz der Sammelabrechnung').fill('Testbeleg 10');
  await adminPage.getByRole('checkbox').check();
  await adminPage.getByRole('button', { name: 'Bestätigen', exact: true }).click();
  await applyAdminChanges(3);
  await adminPage.getByRole('button', { name: 'Downloads freigeben' }).click();
  await adminPage.getByRole('button', { name: 'Bestätigen', exact: true }).click();
  await applyAdminChanges(4);

  await page.bringToFront();
  await expect(page.locator('[data-status]')).toContainText('Gati për shkarkim', { timeout: 12000 });
  await expect(page.locator('.studio-comparison img').last()).not.toHaveAttribute('src', /marked-large/);
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-save]').click()]);
  expect(download.suggestedFilename()).toBe('Studio.jpg');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Porosia jote' })).toBeVisible();
});

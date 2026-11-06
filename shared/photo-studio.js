export const STUDIO_ORDERS = 'photoStudioOrders';
export const STUDIO_PRICE = 25;
export const STUDIO_MAX_FILES = 20;
export const STUDIO_MAX_BYTES = 30 * 1024 * 1024;
export const STUDIO_ACCEPT = '.jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif';
export const STUDIO_STYLES = ['Natural Pro', 'Food Photography', 'Product Studio', 'Cinematic'];
export const STUDIO_FORMATS = { jpeg: ['image/jpeg', 'jpg'], png: ['image/png', 'png'], webp: ['image/webp', 'webp'], heif: ['image/heic', 'heic'] };
export const STUDIO_STATES = {
  pending: 'Në pritje', processing: 'Në përpunim', ready: 'Në përpunim', preview: 'Gati për shikim',
  unpaid: 'Në pritje të pagesës', downloadable: 'Gati për shkarkim',
  completed: 'Përfunduar', cancelled: 'Anuluar', expired: 'Afati ka përfunduar'
};
export const STUDIO_PAYMENT = { unpaid: 'Ende pa barazuar', paid: 'Barazimi është konfirmuar' };

export function studioState(order) {
  if (['cancelled', 'completed'].includes(order.processingStatus)) return order.processingStatus;
  if (order.downloadsReleased && order.paymentStatus === 'paid') return 'downloadable';
  if (order.previewReleased) return order.paymentStatus === 'paid' ? 'preview' : 'unpaid';
  return order.processingStatus;
}

export function studioStats(rows) {
  const stats = { photos: 0, edited: 0, pending: 0, processing: 0, ready: 0, unpaid: 0, completed: 0, open: 0, value: 0, paid: 0 };
  for (const order of rows) {
    if (order.processingStatus === 'cancelled') continue;
    stats.photos += order.photoCount;
    stats.edited += order.photoRecords.filter(photo => photo.result).length;
    stats.value += order.totalCents;
    if (order.paymentStatus === 'paid') stats.paid += order.totalCents;
    if (order.processingStatus === 'completed') stats.completed++;
    else {
      stats.open++;
      if (order.processingStatus === 'ready' || order.previewReleased) stats.ready++;
      else if (order.processingStatus === 'processing') stats.processing++;
      else stats.pending++;
      if (order.previewReleased && order.paymentStatus === 'unpaid') stats.unpaid++;
    }
  }
  return stats;
}

export const STUDIO_EXPORTS = { feed: [1080, 1350], square: [1080, 1080], story: [1080, 1920] };

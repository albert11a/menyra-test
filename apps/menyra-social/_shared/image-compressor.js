
// =========================================================
// Image Compression Utility
// =========================================================

/**
 * Compresses an image file before upload.
 * @param {File} file The image file to compress.
 * @param {number} maxSize The maximum size (width or height) of the image.
 * @param {number} quality The image quality (0.0 to 1.0).
 * @param {string} mimeType The desired MIME type (e.g., "image/jpeg").
 * @returns {Promise<File>} A promise that resolves with the compressed file.
 */
export async function compressImage(file, maxSize, quality, mimeType = "image/jpeg") {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { width, height } = bitmap;
    
    const scale = Math.min(1, maxSize / Math.max(width, height));
    const newWidth = Math.round(width * scale);
    const newHeight = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
    bitmap.close();

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, mimeType, quality);
    });

    if (!blob) {
      throw new Error("Canvas toBlob returned null");
    }

    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";

    return new File([blob], newFileName, {
      type: mimeType,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Image compression failed:", error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Utility for client-side image compression and optimization.
 * Reduces 5MB-15MB phone camera/scanner photos down to ~200KB-400KB
 * while preserving high legibility for passport details and documents.
 */

export const compressImageFile = async (file, options = {}) => {
  if (!file) return file;

  // Only compress images, keep PDFs and other documents as-is
  const isImage = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name || '');
  if (!isImage) {
    return file;
  }

  const maxDimension = options.maxDimension || 2000;
  const quality = options.quality || 0.82;

  try {
    return await new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          try {
            let { width, height } = img;

            // Scale down to maxDimension if larger
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              resolve(file);
              return;
            }

            // Fill white background for transparent PNGs
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob || blob.size >= file.size) {
                  // If compression didn't reduce size, return original
                  resolve(file);
                  return;
                }

                // Preserve original base name with .jpg
                const baseName = file.name.replace(/\.[^/.]+$/, '');
                const compressedFile = new File([blob], `${baseName}.jpg`, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });

                resolve(compressedFile);
              },
              'image/jpeg',
              quality
            );
          } catch (canvasErr) {
            console.warn('[ImageCompressor] Canvas error, using original file:', canvasErr);
            resolve(file);
          }
        };

        img.onerror = () => {
          console.warn('[ImageCompressor] Image load failed, using original file');
          resolve(file);
        };

        img.src = event.target.result;
      };

      reader.onerror = () => {
        console.warn('[ImageCompressor] FileReader error, using original file');
        resolve(file);
      };

      reader.readAsDataURL(file);
    });
  } catch (err) {
    console.warn('[ImageCompressor] Compression exception, using original file:', err);
    return file;
  }
};

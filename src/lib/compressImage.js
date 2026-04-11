/**
 * Compress and resize an image file using the browser Canvas API.
 * Returns a new File object (JPEG) that is smaller and web-optimized.
 *
 * @param {File} file - Original image file
 * @param {object} opts
 * @param {number} opts.maxWidth  - Max pixel width (default 1200)
 * @param {number} opts.maxHeight - Max pixel height (default 1200)
 * @param {number} opts.quality   - JPEG quality 0–1 (default 0.82)
 * @returns {Promise<File>}
 */
export function compressImage(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img

      // Scale down if larger than max dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Compression failed')); return }
          const compressed = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
            type: 'image/jpeg',
          })
          resolve(compressed)
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

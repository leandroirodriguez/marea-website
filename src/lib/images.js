/* Article cover helpers. The Unsplash-by-category fallback that used to live
   here is gone — covers without an upload render components/ArticleArt. */

/**
 * Fix malformed Supabase Storage URLs that are missing /public/ in the path.
 * e.g. .../storage/v1/object/public-assets/... → .../storage/v1/object/public/public-assets/...
 */
export function fixStorageUrl(url) {
  if (!url) return url
  return url.replace(
    /\/storage\/v1\/object\/public-assets\//,
    '/storage/v1/object/public/public-assets/'
  )
}

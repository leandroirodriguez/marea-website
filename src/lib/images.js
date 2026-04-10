const CATEGORY_PHOTOS = {
  Sleep: [
    '1531353826977-0941b4779a1c',
    '1515894203077-9cd36032142f',
    '1520206183501-b80df61043c2',
    '1455026733626-d2d31efe4976',
  ],
  Mood: [
    '1506784983877-45594efa4cbe',
    '1529693662653-9d480530a697',
    '1545205597-3d9d02c29597',
    '1559757175-5700dde675bc',
  ],
  'Brain fog': [
    '1573497019940-1c28c88b4f3e',
    '1498837167922-ddd27525d352',
    '1552196563-55cd4e45efb3',
    '1540206395-68808572332f',
  ],
  'Hot flashes': [
    '1560750588-73207b1ef5b8',
    '1518611012118-696072aa579a',
    '1507652313519-d4e9174996dd',
    '1556741533-411cf82e4e2d',
  ],
  HRT: [
    '1532938911079-1b06ac7ceec7',
    '1519824145371-296894a0daa9',
    '1571019613454-1cb2f99b2d8b',
    '1506126279646-a697353d3166',
  ],
  Lifestyle: [
    '1524250502761-1ac6f2e30d43',
    '1517457373958-b7bdd4587205',
    '1504674900247-0877df9cc836',
    '1490645935967-10de6ba17061',
  ],
  Intimacy: [
    '1515377905703-c4788e51af15',
    '1609234656388-0ff363383899',
    '1511632765486-a01980e01a18',
    '1517841905240-472988babdf9',
  ],
}

const FALLBACK = CATEGORY_PHOTOS.Lifestyle

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

export function categoryImage(category, seed = 0, w = 800, h = 500) {
  const photos = CATEGORY_PHOTOS[category] || FALLBACK
  const index = typeof seed === 'string'
    ? Math.abs(hashCode(seed)) % photos.length
    : seed % photos.length
  return `https://images.unsplash.com/photo-${photos[index]}?w=${w}&h=${h}&fit=crop&q=80`
}

export function articleImage(slug, category, w = 800, h = 500) {
  return categoryImage(category, slug, w, h)
}

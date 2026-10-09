# Marea website

Marketing site, article library, and admin tools for Marea, the perimenopause
app built by Beaches OB/GYN. Live at the Vercel project in `.vercel/`.

## Stack

- Vite + React 19, React Router, Tailwind 4
- Supabase (auth, `content` and `blog` tables, storage for article covers)
- Vercel serverless functions in `api/` (article generation, patient lab reports)

## Running it

```
npm install
npm run dev
```

Needs a `.env` with the Supabase URL and anon key, plus the server-side keys
the `api/` functions read. Ask before copying one from another machine.

## Where things are

- `src/pages/LandingPage.jsx` — the home page. The four product demos at the
  top of the file are scripted recreations of app screens; the page body is
  at the bottom.
- `src/components/TideBand.jsx` — the hero. A port of the app's wave orb,
  cycling through the four Index bands.
- `src/components/ArticleArt.jsx` — typographic cover for articles without an
  uploaded photo.
- `src/lib/appStore.jsx` — the single `APP_LIVE` switch and App Store URL.
- `src/index.css` — color tokens and fonts (Newsreader + Archivo), shared with
  the app's style guide.

## Conventions

- No stock photography. Use the doctors' own photos, the app itself, or type.
- No testimonials without a real person's written permission.
- Trial is 7 days; pricing is $8.99/month or $49.99/year. Keep the site in
  step with the App Store listing.

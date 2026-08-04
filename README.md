# Cliff Heroes — Landing Page

Marketing site for **Cliff Heroes**, a real-time PvP climbing game for mobile by Ascender Studios.

Static HTML/CSS/JS — no framework, no build step.

## Structure

```
index.html          the whole page
css/styles.css      design system + all styles
js/main.js          interactions (videos, overlay, wishlist form, analytics events)
js/news-data.js     article records for the news overlay
api/subscribe.js    Vercel serverless function -> Brevo (wishlist signups)
assets/             media (logo, videos, textures)
vercel.json         /news/<slug> rewrite + asset cache headers
```

## Local development

Any static file server works, e.g.:

```bash
python -c "import os,http.server;http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler,ServerClass=http.server.ThreadingHTTPServer,port=5178)"
```

Notes:
- The wishlist form POSTs to `/api/subscribe`, which only exists on Vercel
  (locally it shows the error state). Full-stack local testing: `vercel dev`.
- Hard-refreshing `/news/<slug>` deep links needs the Vercel rewrite; locally
  open articles by clicking a news card.

## Deployment

Deployed on Vercel (framework preset: **Other**, no build command, output = repo root).

Required environment variables (Settings → Environment Variables):

| Variable | Purpose |
|---|---|
| `BREVO_API_KEY` | Brevo API v3 key — wishlist contact storage |
| `BREVO_LIST_ID` | Numeric ID of the "Cliff Heroes Wishlist" contact list |

Analytics: GA4 (`G-…` id in `index.html`) + Vercel Web Analytics (enable in the project's Analytics tab).

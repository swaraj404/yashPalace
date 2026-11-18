# Yash Palace — Wedding & Celebration Venue (React + Vite + Tailwind)

Website and owner dashboard for **Yash Palace, Yeola (Maharashtra)**.
The hero features a **scroll-scrubbed venue video** (GSAP ScrollTrigger): as you scroll, the drone
footage plays forward and the palace grows toward you.

## What is included

- **Public website** with the scroll-driven hero, gallery, contact details and a live
  **available dates** calendar. Clients only ever see whether a date is free.
- **Owner dashboard**: sign in, record who booked, from and to dates, final amount and money
  received, close dates, and follow up website enquiries.
- **Cloudflare Worker and D1 database** (`worker/`, `migrations/`). Bookings are whole days, and
  the database refuses overlapping dates.

## Run it on your computer

Needs Node.js 22.13 or newer.

```bash
npm install
npm run owner:setup   # choose the owner username and password
npm run dev
```

- Website: http://localhost:5173
- Dashboard: http://admin.localhost:5173

`npm test` runs the Worker tests. `npm run preview` builds the site and serves the production
files on http://localhost:8787 and http://admin.localhost:8787.

## Put it online for free

You need a free [Cloudflare account](https://dash.cloudflare.com/sign-up).

```bash
npx wrangler login
npx wrangler d1 create yash-palace
```

Copy the `database_id` it prints into `wrangler.jsonc`, replacing the zeros. Then:

```bash
npm run deploy
npm run owner:setup -- --remote
```

The deploy prints your address, such as `https://yash-palace.<your-name>.workers.dev`.

- Website: that address
- Dashboard: that address followed by `/admin`

### Connect yashpalace.com

1. In Cloudflare, add `yashpalace.com` as a site on the Free plan.
2. At your domain registrar, change the nameservers to the two Cloudflare gives you.
3. When the domain shows as active, and has no existing DNS records for `yashpalace.com` or
   `admin`, run:

```bash
npm run deploy:domain
```

The website is then at `https://yashpalace.com` and the dashboard at
`https://admin.yashpalace.com`. Keep using `npm run deploy:domain` for later updates.

## Looking after the data

- `npm run backup` downloads the live database to `yash-palace-backup.sql`. Keep copies somewhere
  safe. D1 can also restore the last 7 days on the free plan.
- Forgotten password: run `npm run owner:setup -- --remote`. The owner can also change it under
  Settings in the dashboard.
- Free-plan limits are listed in Cloudflare's dashboard under Workers and D1. Photos, scripts and
  styles do not count against the Worker's daily request limit.

## Editing the website

Phone, address, map, navigation, gallery and other text live in
[`src/data/content.js`](src/data/content.js). To show an email address, fill in `venue.email`.

The current photos in `public/images/venue/` come from the venue video. To replace one, keep its
filename, or add a new file and update `galleryItems`. About 1600px wide is a good size.

To replace the hero video, keep a short keyframe interval so scrolling stays smooth:

```bash
ffmpeg -i input.mp4 -an -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -crf 27 -g 3 -keyint_min 3 -sc_threshold 0 -movflags +faststart public/assets/venue-tour.mp4
```

## Notes
- Respects `prefers-reduced-motion` (disables smooth scroll + heavy animation).
- Accessible nav, keyboard-closable lightbox (Esc), semantic landmarks.
- `window.lenis` is exposed as a debug/integration handle.

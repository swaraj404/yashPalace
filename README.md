# Yash Palace — Wedding & Celebration Venue (React + Vite + Tailwind)

A fully responsive, component-driven marketing site for **Yash Palace, Yeola (Maharashtra)**.
The hero/story section features a **scroll-scrubbed venue video** (GSAP ScrollTrigger): as you
scroll, the drone footage plays forward and the palace grows toward you — inspired by the motion
feel of sites like pkgroupcompanies.com, but using Yash Palace's own colours (olive-lime green,
marigold gold, ivory & white).

## Tech stack

| Concern | Tool |
|---------|------|
| Framework / build | **React 18** + **Vite** |
| Styling | **Tailwind CSS** (design tokens in `tailwind.config.js`) |
| Scroll animation | **GSAP** + **ScrollTrigger** (`@gsap/react` `useGSAP`) |
| Smooth scrolling | **Lenis** |
| Icons | **lucide-react** |
| Fonts | Playfair Display (display) + Poppins (UI) via Google Fonts |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173  (hot reload)
```

Production:

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

> The site must be served over **HTTP** (Vite does this). The scroll-scrub video needs proper
> byte-range requests, so opening files via `file://` will not seek correctly.

## Deploy

Static output — push to **Netlify / Vercel / Cloudflare Pages / GitHub Pages**.
Build command `npm run build`, publish directory `dist`.

## Project structure — one folder/file per concern

```
public/
  assets/venue-tour.mp4        # scroll-scrub video
  images/                      # poster + gallery frames (extracted from the video)

src/
  data/content.js              # ← ALL editable copy & lists (single source of truth)
  lib/gsap.js                  # registers GSAP plugins
  styles/index.css             # Tailwind layers + base styles

  components/
    ui/                        # reusable primitives
      Button.jsx  Eyebrow.jsx  SectionTitle.jsx  Crest.jsx
      Reveal.jsx               # IntersectionObserver fade-in (supports stagger)
      Field.jsx                # floating-label form field
      Lightbox.jsx
    layout/
      SmoothScroll.jsx         # Lenis + ScrollTrigger wiring (+ global anchor scroll)
      Preloader.jsx  CursorGlow.jsx  Navbar.jsx  Footer.jsx
    sections/                  # ← one file per page section
      Hero.jsx        Marquee.jsx     StoryVideo.jsx   About.jsx
      Stats.jsx       WhyUs.jsx       Gallery.jsx      Occasions.jsx
      Testimonials.jsx Contact.jsx    MapSection.jsx

  App.jsx                      # composes the sections
  main.jsx                     # entry
```

## What to customise

**Almost everything lives in [`src/data/content.js`](src/data/content.js)** — phone, email,
address, map link, socials, feature cards, testimonials, occasions, stats, nav links and gallery
captions. Edit there; no need to touch the components.

| What | Where | Current placeholder |
|------|-------|---------------------|
| Phone / email / address | `content.js` → `venue` | `+91 00000 00000`, `hello@yashpalace.in` |
| Social links | `content.js` → `venue.socials` | `#` |
| Google Map pin | `content.js` → `venue.mapEmbed` | search-based; replace with the exact "Embed a map" URL from Google Maps |
| Brand colours | `tailwind.config.js` → `theme.extend.colors` | venue palette |

### Booking form
The form (`src/components/sections/Contact.jsx`) is **front-end only** — it validates and shows a
thank-you message but doesn't send anything yet. To receive enquiries, post to a no-backend
service like [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com): add their
endpoint in the `onSubmit` handler (or set the form `action`/`method`).

### Photos
The gallery currently uses frames extracted from the venue video. Drop your real photographs
(mandap décor, hall interiors, food, evening shots) into `public/images/` and update the
`galleryItems` list in `content.js`. Recommended: optimised JPG/WebP, ~1600px wide.

<details>
<summary>Re-extract poster/gallery frames from a new video</summary>

```bash
V=public/assets/venue-tour.mp4
ffmpeg -y -i "$V" -vf "select=eq(n\,0)" -vframes 1 public/images/poster.jpg
ffmpeg -y -ss 4 -i "$V" -vframes 1 public/images/frame-02.jpg
# ...adjust -ss timestamps as needed
```
Then update `venue.video` / image paths in `content.js` if filenames change.
</details>

## Notes
- Respects `prefers-reduced-motion` (disables smooth scroll + heavy animation).
- Accessible nav, keyboard-closable lightbox (Esc), semantic landmarks.
- `window.lenis` is exposed as a debug/integration handle.

# Tithi — MVP & Full Product Roadmap

## Research summary (Feb 2026)

**Target product:** an online photo gallery platform for professionals: galleries for events,
weddings, portrait shoots — with AI search (face recognition in Honcho), online store,
camera-to-cloud upload, photo editor, live slideshow, wireless printing, custom domain,
WhatsApp integration.

### Product studied
- **Honcho.app** (Honcho Technologies Pte Ltd, Singapore): pricing $0 (free trial: 3 albums,
  50 photos/album, 20 face searches/album), Indie $20/mo (annual $16), Pro $30/mo
  (annual $24), Studio $50/mo (annual $40, save 20%). Features: AI face search, online store
  (commission 15%/5%/3%/2% for trial/indie/pro/studio tiers), camera-to-cloud, photo editor,
  live slideshow, wireless printing, custom domain, portfolios.

### Indian companies in the space (studied for inspiration + revenue model)

| Company (URL) | What they do | Revenue model |
|---|---|---|
| **FTPix** (ftpix.in) | AI photo gallery + Studio CRM + WhatsApp for wedding/event photographers ("India's #1 AI photo gallery platform"). Loved by 3,500+ photographers. | Subscriptions in INR (Free ₹0 / Basic ₹649 / Studio ₹1499+ / Enterprise ₹2699+), unlimited events+photos, AI Face Search, portfolio websites, CRM, WhatsApp. **Earns via subscriptions only.** |
| **Picsora** (picsora.in) | AI Gallery (guests take selfie → see their photos) + Studio CRM (leads→bookings→payments). 500+ photographers. | Subscriptions yearly (AI Gallery Mini ₹4,499/yr, CRM ₹7,999/yr, higher = unlimited storage). Free trial no CC. **Earns via subscriptions + WhatsApp gateway/desktop app; white label upsell.** |
| *(Others found: picsty.com, facesnap.in, showmyphoto.com, pixalmania.in, fotobee.in, theeventgallery.in — mostly free trial + subscription for AI galleries.)* | | |

**Revenue summary:** The Indian market trend: **subscription-based plans (₹/month or
yearly) are THE business model for AI photo galleries in India.** Horizontal extras:
WhatsApp integration/messaging, CRM tooling, interactive web proposals, portfolio
websites, custom domains, desktop upload apps, unlimited events/storage, commission on
online store sales (like Honcho), and upsells (storage upgrades).

**How they earn money (answer for the user):**
1. **Monthly/annual subscriptions (₹)** — the primary model for both FTPix and Picsora.
2. **Store commissions** — like Honcho: on sales via the online store (FTPix keeps 2–15%,
   Picsora's extras).
3. **Upsells** — storage, enterprise/studio tiers, white-label, desktop apps, unlimited events.
4. **WhatsApp messaging** — integration/gateway access (not directly for many).

## Product plan (built phase by phase)

### Phase 1 — MVP (DONE)
- Landing page: what it is, features, pricing (₹), sign up/login
- Signup/login (client-side auth via localStorage)
- Dashboard: galleries, create gallery, preview link, QR (served later)
- Public gallery page: AI-label search, photo grid, WhatsApp share, copy link
- Store demo page: products, buy buttons, commission math (₹)
- Dashboard: "Connect your camera & manual post" — pick a gallery, paste URL, "Add photo → live in gallery"
- Gallery page: live camera messaging — new photos appear as they come in

### Phase 2 — Real AI Search
- Photo tags auto-generated; AI search via free API (captioning/lazy embedding)
- Upload generates captions; guests search "group", "cake", "everyone laughing"

### Phase 3 — Camera to Cloud (MVP + building)
- MVP (now): create gallery + manual post — paste a photo URL in the dashboard "Connect your camera & manual post" card, and it appears in the gallery live.
- Building: camera app (phone/desktop) + auto upload — photos appear in the gallery live while you keep shooting.

### Phase 4 — WhatsApp Integration
- Guests get WhatsApp link with QR/link; auto messages for RSVP/reminders (demo templates).

### Phase 5 — Wireless Printing
- Google Cloud Print replacement: print from browser, vendor integration demo.

### Phase 6 — Live Slideshow & Photo Editor
- Browser-based slideshow engine; client-side photo editor (adjustments/crop).

### Phase 7 — Monetization extras (India pricing)
- ✅ Annual INR pricing live: Free ₹0 / Starter ₹2,999 / Pro ₹5,999 / Studio ₹11,999 (per year)
- ✅ Store commission tiers (Free 15% · Starter 5% · Pro 3% · Studio 2%)
- ✅ Costing & margin analysis in `COSTING.md` (≈78–82% gross margin)
- TODO: payment gateway (Razorpay), Hindi toggle, +91 formatting

## Status

- Research: DONE
- Phase 1 MVP: DONE
- GitHub push: DONE → https://github.com/Ravikesh0406/tithi-galleries
- Vercel production deploy: DONE → https://tithi-galleries.vercel.app (verified: pages + API + demo gallery all 200)
- Phase 2 AI Search: TODO
- Phase 3 Camera to Cloud (Web App MVP): DONE — phone camera capture/upload to cloud, manual URL/file upload, live gallery refresh. DSLR/WiFi tether app: TODO
- Phase 4 WhatsApp Integration: TODO (basic share link done)
- Phase 5 Wireless Printing: TODO
- Phase 6 Slideshow + Editor: TODO
- Phase 7 Monetization/pricing/India-first: PARTIAL — annual ₹ pricing done, store commissions done; payments/Hindi TODO
- Example gallery: DONE — seeded demo (`demo-wedding-2026`, 12 photos), linked from landing hero + demo band + footer
- Online store: DONE — API-backed products/orders, buy flow, "add product" form for photographers, sales vs commission stats
- Portfolio page: DONE — `portfolio.html` (API-backed studio profile, stats, featured galleries, enquiry form)

## Latest build (Web App)

- Converted static MVP into a Node/Express web app (`npm run dev`, port 8123).
- API: galleries CRUD + photos (file upload via multer / URL), **products CRUD, orders, portfolio GET/PUT**.
- Auto-seed on first boot: demo wedding gallery (12 Unsplash photos), 4 demo store products, demo portfolio profile.
- Dashboard: create gallery, **Open Camera & Upload** (`capture="environment"` for mobile camera), device file upload, manual URL post. Demo gallery hidden from dashboard.
- Gallery: auto-refreshes every 4s so newly uploaded photos appear live; QR/share/WhatsApp link; accepts `?g=` or `?id=`.
- Store page: live product grid from API, demo checkout → order tracking, add-product form, sales/commission/earnings stats.
- Portfolio page: studio cover, stats, about, featured galleries from API, contact/enquiry form.
- Landing: nav links to Store + Portfolio, hero CTA → example gallery, new "Live example" demo band with photo strip.
- Mobile-friendly responsive UI for Android/iPhone browsers.
- `COSTING.md`: infra pricing (Vercel + Cloudflare R2), per-plan unit economics, break-even math.

## Deploy

- **GitHub:** https://github.com/Ravikesh0406/tithi-galleries (push `main`)
- **Vercel:** https://tithi-galleries.vercel.app — `vercel deploy --prod`
- `vercel.json` routes static files from disk, `/api/*` + fallbacks to `api/index.js`, which exports the Express app directly (a plain `(req, res)` listener — do **not** use `serverless-http` here, it expects AWS events and hangs on Vercel).
- `server.js` exports the app and only calls `listen()` when run directly (`npm run dev` locally).
- Serverless filesystem is read-only: data.json is an in-memory-first store with best-effort file cache; uploads fall back to `os.tmpdir()`. **Persistence across lambda instances + real file uploads need Cloudflare R2 + a hosted DB before launch** (per COSTING.md).

## Repo layout

- `index.html`, `signup.html`, `login.html`, `dashboard.html`, `gallery.html`, `store.html`,
  `pricing.html`, `blog.html`, `support.html`, `affiliate.html`
- `js/app.js`, `css/style.css`, `uploads/`

## MVP details

- Images: free from `https://picsum.photos` (Unsplash-based, free license).
- Data: localStorage (MVP), moved to backend as features land.
- AI Search: client-side keyword search in MVP (real AI upgrade in Phase 2).
- Device focus: India-first; (Hindi toggle, +91 formatting) in Phase 7.

## Phase 1 — MVP (what was built, per page)

| Page | Done | Notes |
|---|---|---|
| `index.html` | ✅ | Landing: hero, features, how-it-works, pricing (₹), signup/login links |
| `signup.html` / `login.html` | ✅ | Validation + redirect to dashboard; user saved in localStorage |
| `dashboard.html` | ✅ | List galleries, create gallery (name, event date, description), gallery list, logout |
| `gallery.html?g=<id>` | ✅ | Public gallery with keyword/AI-label search, QR via free QR API, WhatsApp share link, copy link |
| `store.html` | ✅ | Live store from API: product grid, demo checkout → orders, add-product form, sales vs commission stats |
| `portfolio.html` | ✅ | API-backed portfolio: cover, stats, about, featured galleries, enquiry form |
| `js/app.js` | ✅ | Auth, galleries CRUD, search (serverless), smoke-tested |
| `css/style.css` | ✅ | Responsive theme |

---

*Next steps:* Phase 2 kicks off — real AI search on uploaded photos.

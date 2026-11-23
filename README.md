# Tithi Galleries (Web App MVP)

India-first photo gallery web app for wedding/event photographers. Create galleries, capture/upload photos from camera, and share a live gallery link with guests. Built mobile-friendly for Android and iPhone browsers.

## Run locally

```powershell
cd C:\Users\PC\Documents\tithi
npm install
npm run dev
```

Open **http://localhost:8123**.

- `npm run dev` — starts Node server with auto-reload (`node --watch`)
- `npm start` — starts production-style server

## Full workflow (MVP)

1. **Sign up / Log in** — simple demo auth (localStorage).
2. **Create gallery** — Dashboard → create event gallery (name/date/description).
3. **Camera to Cloud (web)** — Dashboard → select gallery → **Open Camera & Upload**. On phone, this opens the device camera; captured photo uploads to server and appears in gallery live.
4. **Manual post** — upload from device files or paste an image URL.
5. **Share gallery** — open `gallery.html?g=<id>`, share link/QR/WhatsApp. Gallery auto-refreshes every 4s so new uploads appear live.

## Tech

- **Frontend:** HTML/CSS/vanilla JS, mobile-responsive
- **Backend:** Node.js + Express
- **Uploads:** Multer, stored in `uploads/`
- **Data:** `data.json` (simple MVP store)
- **Free images:** Unsplash URLs for demo content

## Key files

- `server.js` — Express API + static serving + uploads
- `js/app.js` — frontend app logic (auth, dashboard, camera upload, gallery live refresh)
- `index.html` — landing page
- `dashboard.html` — create gallery, camera upload, manual upload
- `gallery.html` — public live gallery + QR/share
- `store.html` — store demo

## Notes

- This is a web-app MVP designed to be wrapped into Android/iOS apps later (PWA/Capacitor).
- "Camera to Cloud" currently uses phone/browser camera capture + upload. DSLR WiFi/tether SDK integration is a next phase.

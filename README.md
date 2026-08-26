# Namaz Times

A minimal, installable prayer times app. Live countdown to the next azan and jamat, works offline, and remembers everything you set.

**Live app:** https://ibrahimahtsham.github.io/namaz-times/

## Features

- **Live countdown** — big timer counting down to the next azan, and to "leave by" once a prayer window is active.
- **Jamat & leave-by times** — set a per-prayer azan-to-jamat gap and your travel time to the mosque; the app tells you exactly when to leave.
- **Location** — search any city, or use your device's location (with automatic reverse geocoding).
- **11 calculation methods** — Umm al-Qura, ISNA, MWL, Karachi, Egyptian, Gulf, Kuwait, Qatar, Singapore, Turkey (Diyanet), Moonsighting Committee.
- **Alerts** — a synthesized audio tone (no audio files) plus an optional browser notification when azan time hits.
- **Installable & offline** — add to your home screen or install as a desktop app; a service worker caches the app shell and last-fetched prayer times so it still works with no connection.
- **Dark / light theme**, all preferences (location, method, offsets, travel time, theme, notification setting) saved to `localStorage`.

## How it's built

Everything is one dependency-free `index.html` — plain HTML/CSS/JS, no build step, no framework.

- Prayer times come from the [Al Adhan API](https://aladhan.com/prayer-times-api).
- City search uses the [Open-Meteo geocoding API](https://open-meteo.com/en/docs/geocoding-api); "use my location" uses the browser Geolocation API plus [BigDataCloud](https://www.bigdatacloud.com/) reverse geocoding.
- Offline support and installability come from `manifest.json` + `sw.js` (a small hand-written service worker: cache-first for static assets, network-first with cache fallback for navigation).
- `gen-icons.js` generates the app icons from scratch — it builds valid PNG files byte-by-byte (chunk framing, a hand-rolled CRC32, zlib deflate for the pixel data) with no image library involved. Run `node gen-icons.js` to regenerate them.

## Running locally

Just serve the folder over HTTP (service workers need a real origin, not `file://`):

```bash
npx serve .
```

Then open the printed local URL.

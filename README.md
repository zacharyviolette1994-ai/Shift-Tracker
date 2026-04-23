# Shift Tracker

A minimalist hypertrophy training + nutrition tracker. Push / Pull / Legs / Upper / Lower split with double-progression logic, weekly volume analysis by muscle group, and offline-capable food logging with barcode scanning.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Pushing to `main` triggers the `Deploy to GitHub Pages` workflow. Enable Pages in the repo settings (Source: GitHub Actions) once.

## Tech

- Vite + React 18
- Tailwind CSS
- lucide-react icons
- `localStorage` for persistence (via a `window.storage` shim)
- Open Food Facts API + html5-qrcode (loaded on demand) for barcode scanning

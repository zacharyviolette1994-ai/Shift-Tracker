// Regenerate PNG app icons from favicon.svg.
// Run: npm i -D sharp && node scripts/gen-icons.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const svg = readFileSync('public/favicon.svg');

// Opaque black-background icon for PWA / Apple Touch
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#0a0a0a"/>
  <text x="90" y="128" text-anchor="middle" font-family="Impact, 'Bebas Neue', sans-serif" font-size="130" font-weight="bold" fill="#f5b400">S</text>
</svg>`;

const tasks = [
  { size: 180, out: 'public/apple-touch-icon.png' },
  { size: 192, out: 'public/icon-192.png' },
  { size: 512, out: 'public/icon-512.png' },
];

for (const { size, out } of tasks) {
  await sharp(Buffer.from(iconSvg)).resize(size, size).png().toFile(out);
  console.log(out);
}

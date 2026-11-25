// Generates PWA / home-screen icons from one SVG mark.
// Run: node scripts/generate-icons.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

// `pad` = fraction of the canvas left empty around the glyph (maskable needs more)
const mark = ({ rounded = true, pad = 0.2 } = {}) => {
  const s = 512;
  const g = s * (1 - pad * 2); // glyph box size
  const o = s * pad; // glyph offset
  const k = g / 24; // lucide-style 24px grid -> glyph box
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4f46e5"/>
      <stop offset="1" stop-color="#9333ea"/>
    </linearGradient>
  </defs>
  <rect width="${s}" height="${s}" rx="${rounded ? 112 : 0}" fill="url(#g)"/>
  <g transform="translate(${o} ${o}) scale(${k})" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
  </g>
</svg>`;
};

mkdirSync("public/icons", { recursive: true });

const out = [
  ["public/icons/icon-192.png", 192, mark()],
  ["public/icons/icon-512.png", 512, mark()],
  ["public/icons/maskable-512.png", 512, mark({ rounded: false, pad: 0.28 })],
  ["src/app/apple-icon.png", 180, mark({ rounded: false, pad: 0.24 })],
];

for (const [file, size, svg] of out) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(file);
  console.log("wrote", file);
}
writeFileSync("src/app/icon.svg", mark());
console.log("wrote src/app/icon.svg");

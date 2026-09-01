import type { CatalogCar } from '../data/storeCatalog';

/**
 * توليد صورة إعلانية لكل سيارة عبر Pollinations (بدون مفتاح API).
 * تُبنى من الماركة + الموديل + اللون لتطابق الإعلان المطلوب.
 */
export function aiAdImageUrl(car: CatalogCar, vertical = true): string {
  const brand = (car.brand || 'Chinese').trim();
  const model = (car.model || 'SUV').trim();
  const color = (car.color || 'silver').trim();
  const year = car.year || 2025;

  const prompt = [
    `professional vertical car advertisement poster`,
    `modern ${color} ${brand} ${model} ${year} Chinese SUV`,
    `three-quarter front studio shot`,
    `dark purple blue neon studio lighting`,
    `glossy paint dramatic reflections`,
    `high contrast commercial photography`,
    `clean background no people`,
    `photorealistic automotive advertising`,
  ].join(', ');

  const w = vertical ? 768 : 1024;
  const h = vertical ? 1152 : 768;

  // Pollinations — توليد مجاني من النص
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&nologo=true&seed=${hashSeed(car.id)}&model=flux`;
}

function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 100000;
}

/** صورة احتياطية إن فشل التوليد */
export function fallbackStudioUrl(seed: string): string {
  const list = [
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=85',
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) % list.length;
  return list[h];
}

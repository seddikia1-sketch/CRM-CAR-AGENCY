import type { CatalogCar } from '../data/storeCatalog';
import { formatCurrency } from './formatters';

export function adHeadline(car: CatalogCar): string {
  const name = `${car.brand} ${car.model}`.trim();
  const options = [
    `اشترِ ${name} الآن`,
    `${name} — سيارتك بانتظارك`,
    `لا تفوّت ${name}`,
    `عرض خاص: ${name}`,
    `احجز ${name} اليوم`,
  ];
  let h = 0;
  const s = car.id + car.model;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * (i + 1)) % options.length;
  return options[h];
}

export function adBullets(car: CatalogCar): string[] {
  const bullets: string[] = [];

  if (car.condition === 'new' || !car.mileage) bullets.push('جديدة أو حديثة الاستيراد');
  else bullets.push(`${car.mileage.toLocaleString('ar-DZ')} كم فقط`);

  bullets.push(`موديل ${car.year}${car.color ? ` · ${car.color}` : ''}`);

  if (car.price) bullets.push(`السعر: ${formatCurrency(car.price)}`);
  else if (car.status === 'in_transit') bullets.push('مشحونة — احجز قبل الوصول');
  else if (car.status === 'customs') bullets.push('تحت الجمرك');
  else bullets.push('السعر عند الاتصال');

  return bullets.slice(0, 3);
}

export function adCtaLabel(car: CatalogCar): string {
  if (car.status === 'in_transit' || car.status === 'customs') return 'احجز استشارتك';
  return 'اشتري الآن';
}

/** صور سيارات عالية الجودة (Unsplash) — بديل عن الرسم الباهت */
const STOCK_CARS = [
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1583121274602-3e2820c275fa?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687e?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=85',
];

export function stockCarImage(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) >>> 0;
  return STOCK_CARS[h % STOCK_CARS.length];
}

export function adBackground(id: string): string {
  const AD_BG = [
    'linear-gradient(160deg, #0f0a1a 0%, #2e1065 45%, #0a0a0f 100%)',
    'linear-gradient(160deg, #0c1929 0%, #0e4d6e 45%, #0a0a0f 100%)',
    'linear-gradient(160deg, #1a0a0a 0%, #7f1d1d 40%, #0a0a0f 100%)',
    'linear-gradient(160deg, #0a1a14 0%, #065f46 45%, #0a0a0f 100%)',
    'linear-gradient(160deg, #1a1025 0%, #5b21b6 42%, #0a0a0f 100%)',
  ];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AD_BG[h % AD_BG.length];
}

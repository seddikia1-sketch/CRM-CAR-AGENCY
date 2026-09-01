import type { CatalogCar } from '../data/storeCatalog';
import { formatCurrency } from './formatters';

const HEADLINES = [
  (c: CatalogCar) => `الأداء والأناقة — اشترِ ${c.brand} ${c.model} اليوم`,
  (c: CatalogCar) => `${c.brand} ${c.model}: سيارتك بانتظارك`,
  (c: CatalogCar) => `وفر الوقت واحجز ${c.model} الآن`,
  (c: CatalogCar) => `عرض خاص على ${c.brand} ${c.model}`,
  (c: CatalogCar) => `من الصين إلى بابك — ${c.model} ${c.year}`,
];

export function adHeadline(car: CatalogCar): string {
  let h = 0;
  const s = car.id + car.model;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * (i + 1)) % HEADLINES.length;
  return HEADLINES[h](car);
}

/** 3 نقاط قوة فقط — مواصفات أساسية */
export function adBullets(car: CatalogCar): string[] {
  const bullets: string[] = [];

  if (car.condition === 'new') bullets.push('جديدة / صفر كيلومتر');
  else bullets.push(car.mileage ? `${car.mileage.toLocaleString('ar-DZ')} كم` : 'أقل من 3 سنوات');

  if (car.year) bullets.push(`موديل ${car.year}${car.color ? ` · ${car.color}` : ''}`);

  if (car.price) bullets.push(`السعر: ${formatCurrency(car.price)}`);
  else if (car.status === 'in_transit') bullets.push('مشحونة — احجز قبل الوصول');
  else if (car.status === 'customs') bullets.push('تحت الجمرك — قريبة منك');
  else bullets.push('السعر حسب الاتفاق');

  // ميزات إضافية إن نقصت النقاط
  for (const f of car.features || []) {
    if (bullets.length >= 3) break;
    if (!bullets.some((b) => b.includes(f.slice(0, 8)))) bullets.push(f);
  }

  while (bullets.length < 3) {
    const fillers = ['متابعة الشحن والجمرك', 'معاينة قبل الاتفاق', 'تواصل فوري عبر واتساب'];
    bullets.push(fillers[bullets.length % fillers.length]);
  }

  return bullets.slice(0, 3);
}

export function adCtaLabel(car: CatalogCar): string {
  if (car.status === 'in_transit' || car.status === 'customs') return 'احجز استشارتك';
  return 'اضغط للتفاصيل';
}

export const AD_BG = [
  'linear-gradient(145deg, #1e1b4b 0%, #4c1d95 40%, #0f172a 100%)',
  'linear-gradient(145deg, #0c4a6e 0%, #0369a1 42%, #0f172a 100%)',
  'linear-gradient(145deg, #14532d 0%, #166534 40%, #0f172a 100%)',
  'linear-gradient(145deg, #7c2d12 0%, #9a3412 40%, #0f172a 100%)',
  'linear-gradient(145deg, #312e81 0%, #6d28d9 45%, #0f172a 100%)',
  'linear-gradient(145deg, #134e4a 0%, #0f766e 40%, #0f172a 100%)',
];

export function adBackground(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AD_BG[h % AD_BG.length];
}

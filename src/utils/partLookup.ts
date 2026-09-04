/**
 * التعرف على قطع الغيار من VIN + اسم القطعة + كتالوج الزيت/الفلاتر
 * ملاحظة: التعرف من الصورة يكون مرجعاً يدوياً — المطابقة الآلية تعتمد على النص والسيارة
 */

import { OIL_FILTER_CATALOG, type OilFilterSpec } from '../data/oilFilterCatalog';
import { FILTER_PRICE_LIST, extractOemNumbers, type FilterPriceItem } from '../data/filterPriceList';
import type { Vehicle, SparePart } from '../types';
import { PurchaseItemKind } from '../types';

export type PartKindHint =
  | 'oil_filter'
  | 'air_filter'
  | 'fuel_filter'
  | 'cabin_filter'
  | 'oil'
  | 'brake'
  | 'spark'
  | 'other';

export interface PartSuggestion {
  id: string;
  name: string;
  reference: string;
  brand: string;
  model: string;
  kind: typeof PurchaseItemKind[keyof typeof PurchaseItemKind];
  unitCost: number;
  expectedSellPrice?: number;
  notes: string;
  source: 'catalog' | 'price_list' | 'inventory' | 'manual';
  confidence: number; // 0-100
  matchReason: string;
}

const KEYWORD_MAP: { keys: string[]; hint: PartKindHint }[] = [
  { keys: ['فلتر زيت', 'زيت فلتر', 'oil filter', 'filtre huile', 'oilfilter'], hint: 'oil_filter' },
  { keys: ['فلتر هواء', 'هواء', 'air filter', 'filtre air'], hint: 'air_filter' },
  { keys: ['فلتر بنزين', 'وقود', 'fuel filter', 'filtre carburant'], hint: 'fuel_filter' },
  { keys: ['فلتر مقصورة', 'تكييف', 'cabin', 'pollen', 'habitacle'], hint: 'cabin_filter' },
  { keys: ['زيت محرك', 'زيت', 'engine oil', '5w', '0w', 'huile'], hint: 'oil' },
  { keys: ['فرامل', 'pastille', 'brake', 'plaquette'], hint: 'brake' },
  { keys: ['بوجي', 'شمعات', 'spark', 'bougie'], hint: 'spark' },
];

export function detectPartKind(query: string): PartKindHint {
  const q = query.toLowerCase().trim();
  for (const row of KEYWORD_MAP) {
    if (row.keys.some((k) => q.includes(k.toLowerCase()))) return row.hint;
  }
  return 'other';
}

function kindToPurchaseKind(hint: PartKindHint): typeof PurchaseItemKind[keyof typeof PurchaseItemKind] {
  if (hint === 'oil') return PurchaseItemKind.OIL;
  if (hint === 'oil_filter' || hint === 'air_filter' || hint === 'fuel_filter' || hint === 'cabin_filter') {
    return PurchaseItemKind.FILTER;
  }
  return PurchaseItemKind.SPARE_PART;
}

function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreBrandModel(spec: OilFilterSpec, brand: string, model: string): number {
  const b = norm(brand);
  const m = norm(model);
  const sb = norm(spec.brand);
  const sm = norm(spec.model);
  let score = 0;
  if (b && (sb.includes(b) || b.includes(sb))) score += 40;
  if (m && (sm.includes(m) || m.includes(sm.split('/')[0].trim()))) score += 45;
  // كلمات جزئية للموديل
  if (m) {
    const tokens = m.split(/[\s/-]+/).filter((t) => t.length > 1);
    const hit = tokens.filter((t) => sm.includes(t)).length;
    score += Math.min(hit * 8, 24);
  }
  return Math.min(score, 100);
}

function fieldForHint(spec: OilFilterSpec, hint: PartKindHint): string {
  switch (hint) {
    case 'oil_filter':
      return [spec.oilFilter, spec.oilFilterAlt].filter(Boolean).join(' · ');
    case 'air_filter':
      return [spec.airFilter, spec.airFilterAlt].filter(Boolean).join(' · ');
    case 'fuel_filter':
      return [spec.fuelFilter, spec.fuelFilterAlt].filter(Boolean).join(' · ');
    case 'cabin_filter':
      return [spec.cabinFilter, spec.cabinFilterAlt].filter(Boolean).join(' · ');
    case 'oil':
      return `${spec.oilViscosity} ${spec.oilSpec} · ${spec.oilCapacityL}L`;
    default:
      return '';
  }
}

function labelForHint(hint: PartKindHint): string {
  switch (hint) {
    case 'oil_filter':
      return 'فلتر زيت';
    case 'air_filter':
      return 'فلتر هواء';
    case 'fuel_filter':
      return 'فلتر بنزين';
    case 'cabin_filter':
      return 'فلتر مقصورة';
    case 'oil':
      return 'زيت محرك';
    case 'brake':
      return 'قطع فرامل';
    case 'spark':
      return 'شمعات احتراق';
    default:
      return 'قطعة غيار';
  }
}

export function findVehicleByVin(vehicles: Vehicle[], vin: string): Vehicle | undefined {
  const v = (vin || '').trim().toUpperCase();
  if (!v) return undefined;
  return vehicles.find((x) => (x.vin || '').trim().toUpperCase() === v)
    || vehicles.find((x) => (x.vin || '').trim().toUpperCase().includes(v))
    || vehicles.find((x) => v.includes((x.vin || '').trim().toUpperCase()) && (x.vin || '').length > 6);
}

export function findCatalogForVehicle(brand: string, model: string, year?: number): OilFilterSpec[] {
  const scored = OIL_FILTER_CATALOG.map((spec) => ({
    spec,
    score: scoreBrandModel(spec, brand, model),
  }))
    .filter((x) => x.score >= 40)
    .sort((a, b) => b.score - a.score);

  if (year) {
    // تفضيل سنوات متداخلة إن أمكن
    scored.sort((a, b) => {
      const ya = yearInRange(year, a.spec.years) ? 1 : 0;
      const yb = yearInRange(year, b.spec.years) ? 1 : 0;
      if (ya !== yb) return yb - ya;
      return b.score - a.score;
    });
  }
  return scored.slice(0, 6).map((x) => x.spec);
}

function yearInRange(year: number, range: string): boolean {
  const m = range.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (!m) return true;
  const a = Number(m[1]);
  const b = Number(m[2]);
  return year >= a && year <= b;
}

function matchPriceList(query: string, brand: string, model: string, hint: PartKindHint): PartSuggestion[] {
  const q = norm(query);
  const typeMap: Record<PartKindHint, FilterPriceItem['type'] | null> = {
    oil_filter: 'oil',
    air_filter: 'air',
    fuel_filter: 'fuel',
    cabin_filter: 'cabin',
    oil: null,
    brake: null,
    spark: null,
    other: null,
  };
  const wantType = typeMap[hint];

  return FILTER_PRICE_LIST.filter((item) => {
    if (wantType && item.type !== wantType) return false;
    const blob = norm(`${item.name} ${item.oemNumber} ${item.compatible} ${item.altBrand}`);
    const brandHit = brand && blob.includes(norm(brand));
    const modelHit = model && blob.includes(norm(model));
    const queryHit = q && (blob.includes(q) || q.split(' ').some((t) => t.length > 2 && blob.includes(t)));
    return brandHit || modelHit || queryHit || (wantType && (brandHit || modelHit));
  })
    .slice(0, 8)
    .map((item, idx) => {
      const cost = item.priceAltDzd || item.priceOemDzd || 0;
      const sell = item.priceOemDzd || item.priceAltDzd || undefined;
      let confidence = 55;
      if (brand && norm(item.compatible).includes(norm(brand))) confidence += 15;
      if (model && norm(item.compatible).includes(norm(model))) confidence += 15;
      if (q && norm(item.name).includes(q)) confidence += 10;
      return {
        id: `price-${item.id}-${idx}`,
        name: item.name,
        reference: item.oemNumber,
        brand: item.brandLabel,
        model: item.compatible,
        kind: kindToPurchaseKind(hint),
        unitCost: cost,
        expectedSellPrice: sell,
        notes: item.notes || `بديل: ${item.altBrand}`,
        source: 'price_list' as const,
        confidence: Math.min(confidence, 98),
        matchReason: 'من جدول أسعار الفلاتر',
      };
    });
}

function matchInventory(parts: SparePart[], query: string): PartSuggestion[] {
  const q = norm(query);
  if (!q) return [];
  return parts
    .filter((p) => {
      const blob = norm(`${p.name} ${p.partNumber} ${p.brand}`);
      return blob.includes(q) || q.split(' ').some((t) => t.length > 2 && blob.includes(t));
    })
    .slice(0, 5)
    .map((p) => ({
      id: `inv-${p.id}`,
      name: p.name,
      reference: p.partNumber,
      brand: p.brand,
      model: '',
      kind: p.category === 'oils' ? PurchaseItemKind.OIL : p.category === 'filters' ? PurchaseItemKind.FILTER : PurchaseItemKind.SPARE_PART,
      unitCost: p.costPrice || 0,
      expectedSellPrice: p.sellingPrice,
      notes: `متوفر في المخزون: ${p.quantity}`,
      source: 'inventory' as const,
      confidence: 70,
      matchReason: 'موجود في مخزون المكتب',
    }));
}

export function lookupParts(options: {
  query: string;
  brand?: string;
  model?: string;
  year?: number;
  vin?: string;
  inventoryParts?: SparePart[];
}): PartSuggestion[] {
  const query = options.query.trim();
  const brand = options.brand || '';
  const model = options.model || '';
  const hint = detectPartKind(query);
  const results: PartSuggestion[] = [];

  // 1) كتالوج الزيت/الفلاتر حسب السيارة
  if (brand || model) {
    const specs = findCatalogForVehicle(brand, model, options.year);
    for (const spec of specs) {
      const field = fieldForHint(spec, hint);
      if (hint === 'other' || !field) {
        // عرض حزمة صيانة أساسية
        const pack = [
          { h: 'oil_filter' as PartKindHint, f: fieldForHint(spec, 'oil_filter') },
          { h: 'air_filter' as PartKindHint, f: fieldForHint(spec, 'air_filter') },
          { h: 'cabin_filter' as PartKindHint, f: fieldForHint(spec, 'cabin_filter') },
          { h: 'oil' as PartKindHint, f: fieldForHint(spec, 'oil') },
        ];
        for (const p of pack) {
          if (!p.f) continue;
          const oems = extractOemNumbers(p.f);
          results.push({
            id: `cat-${spec.id}-${p.h}`,
            name: `${labelForHint(p.h)} — ${spec.brand} ${spec.model}`,
            reference: oems[0] || p.f.slice(0, 40),
            brand: spec.brand,
            model: `${spec.model} ${spec.years}`,
            kind: kindToPurchaseKind(p.h),
            unitCost: 0,
            notes: p.f + (spec.notes ? ` · ${spec.notes}` : ''),
            source: 'catalog',
            confidence: scoreBrandModel(spec, brand, model),
            matchReason: `كتالوج ${spec.brand} ${spec.model}`,
          });
        }
      } else {
        const oems = extractOemNumbers(field);
        results.push({
          id: `cat-${spec.id}-${hint}`,
          name: `${labelForHint(hint)} — ${spec.brand} ${spec.model}`,
          reference: oems[0] || field.slice(0, 48),
          brand: spec.brand,
          model: `${spec.model} ${spec.years}`,
          kind: kindToPurchaseKind(hint),
          unitCost: 0,
          notes: field + (spec.notes ? ` · ${spec.notes}` : ''),
          source: 'catalog',
          confidence: Math.min(scoreBrandModel(spec, brand, model) + (query ? 10 : 0), 99),
          matchReason: `مطابقة كتالوج لـ ${labelForHint(hint)}`,
        });
      }
    }
  }

  // 2) جدول الأسعار
  results.push(...matchPriceList(query || labelForHint(hint), brand, model, hint));

  // 3) المخزون الحالي
  if (options.inventoryParts?.length) {
    results.push(...matchInventory(options.inventoryParts, query || brand));
  }

  // 4) إن لم نجد شيئاً — اقتراح يدوي من النص
  if (results.length === 0 && (query || brand)) {
    results.push({
      id: 'manual-1',
      name: query || labelForHint(hint),
      reference: '',
      brand: brand || '',
      model: model || '',
      kind: kindToPurchaseKind(hint),
      unitCost: 0,
      notes: options.vin ? `VIN: ${options.vin}` : '',
      source: 'manual',
      confidence: 30,
      matchReason: 'إدخال يدوي — راجع الرقم مع المورد',
    });
  }

  // إزالة تكرار بالاسم+المرجع
  const seen = new Set<string>();
  const unique = results.filter((r) => {
    const k = `${norm(r.name)}|${norm(r.reference)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return unique.sort((a, b) => b.confidence - a.confidence).slice(0, 12);
}

export function buildSupplierWhatsAppMessage(opts: {
  supplierName?: string;
  vin?: string;
  vehicleLabel?: string;
  items: { name: string; reference: string; quantity: number; notes?: string }[];
  photoNote?: string;
}): string {
  const lines = [
    `السلام عليكم${opts.supplierName ? ` ${opts.supplierName}` : ''}،`,
    'نحتاج طلب القطع التالية:',
    opts.vehicleLabel ? `السيارة: ${opts.vehicleLabel}` : '',
    opts.vin ? `VIN: ${opts.vin}` : '',
    '',
    ...opts.items.map(
      (it, i) =>
        `${i + 1}) ${it.name}${it.reference ? ` | رقم: ${it.reference}` : ''} | كمية: ${it.quantity}${it.notes ? ` | ${it.notes}` : ''}`
    ),
    opts.photoNote ? `\nملاحظة: ${opts.photoNote}` : '',
    '',
    'يرجى تأكيد التوفر والسعر ومدة الشحن.',
  ];
  return lines.filter((l) => l !== undefined).join('\n');
}

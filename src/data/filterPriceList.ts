/**
 * جدول أسعار مقترح لأشهر فلاتر الزيت (دينار جزائري)
 * أسعار استرشادية للبيع بالتجزئة — عدّلها حسب تكلفتك وهامش الربح
 */

export interface FilterPriceItem {
  id: string;
  name: string;
  oemNumber: string;
  brandLabel: string;
  type: 'oil' | 'air' | 'fuel' | 'cabin';
  compatible: string;
  priceOemDzd: number;
  priceAltDzd: number;
  altBrand: string;
  notes?: string;
}

export const FILTER_PRICE_LIST: FilterPriceItem[] = [
  {
    id: 'toyota-04152-yzza1',
    name: 'فلتر زيت تويوتا',
    oemNumber: '04152-YZZA1',
    brandLabel: 'Toyota Genuine',
    type: 'oil',
    compatible: 'Corolla · Camry · RAV4 · Vios · Yaris',
    priceOemDzd: 1800,
    priceAltDzd: 1200,
    altBrand: 'Mann W 610/6 · Bosch',
    notes: 'الأكثر طلباً لتويوتا',
  },
  {
    id: 'toyota-04152-yzza5',
    name: 'فلتر زيت تويوتا ديزل',
    oemNumber: '04152-YZZA5',
    brandLabel: 'Toyota Genuine',
    type: 'oil',
    compatible: 'Hilux · Land Cruiser Prado',
    priceOemDzd: 2200,
    priceAltDzd: 1500,
    altBrand: 'Mann W 940/25',
  },
  {
    id: 'hyundai-26300-35505',
    name: 'فلتر زيت هيونداي / كيا',
    oemNumber: '26300-35505',
    brandLabel: 'Hyundai / Kia Genuine',
    type: 'oil',
    compatible: 'Accent · Tucson · Elantra · Sportage · Cerato',
    priceOemDzd: 1600,
    priceAltDzd: 1100,
    altBrand: 'Mann W 610/6 · Bosch',
    notes: 'مشترك بين عدة موديلات هيونداي وكيا',
  },
  {
    id: 'hyundai-26300-35503',
    name: 'فلتر زيت هيونداي أكسنت (جيل أقدم)',
    oemNumber: '26300-35503',
    brandLabel: 'Hyundai Genuine',
    type: 'oil',
    compatible: 'Accent / Verna 2010-2017 تقريباً',
    priceOemDzd: 1400,
    priceAltDzd: 950,
    altBrand: 'Mann · Bosch',
  },
  {
    id: 'mann-w67-1',
    name: 'فلتر زيت Mann W 67/1',
    oemNumber: 'W 67/1',
    brandLabel: 'Mann-Filter',
    type: 'oil',
    compatible: 'Jetour X70/X70 Plus · Nissan · Mazda · بعض الصيني',
    priceOemDzd: 0,
    priceAltDzd: 1300,
    altBrand: 'Bosch F026407024 · WIX',
    notes: 'بديل قوي لسيارات صينية ويابانية',
  },
  {
    id: 'mann-hu7008z',
    name: 'فلتر زيت Mann HU 7008 z (خرطوشة)',
    oemNumber: 'HU 7008 z',
    brandLabel: 'Mann-Filter',
    type: 'oil',
    compatible: 'Chery Tiggo · VW Golf/Passat · Audi A3 · Peugeot',
    priceOemDzd: 0,
    priceAltDzd: 1600,
    altBrand: 'Mahle · Bosch',
    notes: 'خرطوشة — ليس لولبياً',
  },
  {
    id: 'mann-w712-95',
    name: 'فلتر زيت Mann W 712/95',
    oemNumber: 'W 712/95',
    brandLabel: 'Mann-Filter',
    type: 'oil',
    compatible: 'Chery Tiggo 7/8 · Opel · بعض الأوروبية',
    priceOemDzd: 0,
    priceAltDzd: 1250,
    altBrand: 'Bosch',
  },
  {
    id: 'jetour-100106001aa',
    name: 'فلتر زيت جيتور OEM',
    oemNumber: '100106001AA',
    brandLabel: 'Jetour OEM',
    type: 'oil',
    compatible: 'Jetour X70 Plus 1.5T',
    priceOemDzd: 1500,
    priceAltDzd: 1300,
    altBrand: 'Mann W 67/1 · Bosch',
  },
  {
    id: 'honda-15400-plm',
    name: 'فلتر زيت هوندا',
    oemNumber: '15400-PLM-A02',
    brandLabel: 'Honda Genuine',
    type: 'oil',
    compatible: 'Civic · CR-V · Accord',
    priceOemDzd: 1900,
    priceAltDzd: 1300,
    altBrand: 'Mann HU 7008 z',
  },
  {
    id: 'nissan-15208-65f0c',
    name: 'فلتر زيت نيسان',
    oemNumber: '15208-65F0C',
    brandLabel: 'Nissan Genuine',
    type: 'oil',
    compatible: 'Qashqai · X-Trail',
    priceOemDzd: 1700,
    priceAltDzd: 1200,
    altBrand: 'Mann W 67/1',
  },
  {
    id: 'renault-7701047346',
    name: 'فلتر زيت رينو / داسيا',
    oemNumber: '77 01 047 346',
    brandLabel: 'Renault Genuine',
    type: 'oil',
    compatible: 'Clio · Megane · Captur · Symbol',
    priceOemDzd: 1500,
    priceAltDzd: 1100,
    altBrand: 'Mann W 79',
  },
  {
    id: 'mann-w79',
    name: 'فلتر زيت Mann W 79',
    oemNumber: 'W 79',
    brandLabel: 'Mann-Filter',
    type: 'oil',
    compatible: 'Renault · Dacia · بعض الفرنسية',
    priceOemDzd: 0,
    priceAltDzd: 1100,
    altBrand: 'Purflux · Bosch',
  },
  {
    id: 'bmw-mann-hu816x',
    name: 'فلتر زيت BMW (خرطوشة)',
    oemNumber: '11 42 8 664 517',
    brandLabel: 'BMW Genuine',
    type: 'oil',
    compatible: 'BMW 3/5 Series · X3 (B48/B58)',
    priceOemDzd: 3500,
    priceAltDzd: 2200,
    altBrand: 'Mann HU 816 x',
  },
  {
    id: 'mb-mann-hu718',
    name: 'فلتر زيت مرسيدس (خرطوشة)',
    oemNumber: 'HU 718/5 x',
    brandLabel: 'Mann / MB',
    type: 'oil',
    compatible: 'Mercedes C-Class · E-Class',
    priceOemDzd: 3200,
    priceAltDzd: 2100,
    altBrand: 'Mahle OX 370D',
  },
  {
    id: 'peugeot-1109y6',
    name: 'فلتر زيت بيجو / ستروين',
    oemNumber: '1109.Y6',
    brandLabel: 'Peugeot / Citroën',
    type: 'oil',
    compatible: '208 · 308 · 3008 · C3 · C4',
    priceOemDzd: 1600,
    priceAltDzd: 1200,
    altBrand: 'Mann HU 7008 z',
  },
  {
    id: 'geely-oem-oil',
    name: 'فلتر زيت جيلي OEM',
    oemNumber: 'OEM Geely',
    brandLabel: 'Geely OEM',
    type: 'oil',
    compatible: 'Coolray · Emgrand · Boyue · Starry · Azkarra',
    priceOemDzd: 1400,
    priceAltDzd: 1200,
    altBrand: 'Mann · Bosch',
  },
  {
    id: 'chery-oem-oil',
    name: 'فلتر زيت شيري / تيجو',
    oemNumber: 'OEM Chery / HU 7008',
    brandLabel: 'Chery / Mann',
    type: 'oil',
    compatible: 'Tiggo 4/7/8 · Arrizo',
    priceOemDzd: 1400,
    priceAltDzd: 1250,
    altBrand: 'Mann HU 7008 z · W 712/95',
  },
  {
    id: 'mann-c27018',
    name: 'فلتر هواء Mann C 27 018',
    oemNumber: 'C 27 018',
    brandLabel: 'Mann-Filter',
    type: 'air',
    compatible: 'Jetour X70 / X70 Plus',
    priceOemDzd: 0,
    priceAltDzd: 1800,
    altBrand: 'Bosch F026400493',
  },
  {
    id: 'toyota-air-corolla',
    name: 'فلتر هواء تويوتا كورولا',
    oemNumber: '17801-21050',
    brandLabel: 'Toyota Genuine',
    type: 'air',
    compatible: 'Corolla',
    priceOemDzd: 2200,
    priceAltDzd: 1500,
    altBrand: 'Mann C 25 114',
  },
  {
    id: 'hyundai-air-tucson',
    name: 'فلتر هواء هيونداي توسان',
    oemNumber: '28113-D3500',
    brandLabel: 'Hyundai Genuine',
    type: 'air',
    compatible: 'Tucson',
    priceOemDzd: 2000,
    priceAltDzd: 1400,
    altBrand: 'Mann · Bosch',
  },
  {
    id: 'mann-cu26010',
    name: 'فلتر مقصورة Mann CU 26 010',
    oemNumber: 'CU 26 010',
    brandLabel: 'Mann-Filter',
    type: 'cabin',
    compatible: 'Jetour · بعض الصيني والأوروبي',
    priceOemDzd: 0,
    priceAltDzd: 1600,
    altBrand: 'Bosch 1987432396',
  },
  {
    id: 'mann-cuk26009',
    name: 'فلتر مقصورة كربوني Mann CUK 26 009',
    oemNumber: 'CUK 26 009',
    brandLabel: 'Mann-Filter',
    type: 'cabin',
    compatible: 'Chery Tiggo 8',
    priceOemDzd: 0,
    priceAltDzd: 1900,
    altBrand: 'OEM Chery',
    notes: 'كربوني — أفضل للروائح',
  },
  {
    id: 'toyota-cabin',
    name: 'فلتر مقصورة تويوتا',
    oemNumber: '87139-YZZ08',
    brandLabel: 'Toyota Genuine',
    type: 'cabin',
    compatible: 'Corolla وغيرها',
    priceOemDzd: 2100,
    priceAltDzd: 1500,
    altBrand: 'Mann CUK 22 023',
  },
];

export const FILTER_TYPE_LABELS: Record<FilterPriceItem['type'], string> = {
  oil: 'فلتر زيت',
  air: 'فلتر هواء',
  fuel: 'فلتر بنزين',
  cabin: 'فلتر مقصورة',
};

export function extractOemNumbers(filterText: string): string[] {
  if (!filterText) return [];
  const results: string[] = [];
  const oemLabel = filterText.match(/OEM\s*[:：]?\s*([A-Z0-9][\w./\s-]{2,30}?)(?:\s*[·|/]|$)/i);
  if (oemLabel) results.push(oemLabel[1].trim());
  const codes = filterText.match(
    /\b(?:\d{5}-[A-Z0-9]{3,8}|\d{5}-\d{5}|[A-Z]{0,2}\d{2,3}\s?\d{2,3}\s?\d{2,4}[A-Za-z]?|HU\s?\d{3,5}\s?[xz]?|W\s?\d{2,4}(?:\/\d+)?[a-z]?|CUK?\s?\d{2}\s?\d{3}|C\s?\d{2}\s?\d{3}|11\s?\d{2}\s?\d\s?\d{3}\s?\d{3})\b/gi
  );
  if (codes) {
    for (const c of codes) {
      const t = c.replace(/\s+/g, ' ').trim();
      if (!results.some((r) => r.replace(/\s/g, '') === t.replace(/\s/g, ''))) results.push(t);
    }
  }
  return results.slice(0, 4);
}

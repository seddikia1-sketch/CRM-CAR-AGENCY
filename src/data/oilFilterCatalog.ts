/**
 * كتالوج زيوت وفلاتر للسيارات الصينية الشائعة في الجزائر
 * الأرقام المرجعية شائعة في السوق (OEM + بدائل) — يُفضّل التحقق عند التركيب
 */

export interface OilFilterSpec {
  id: string;
  brand: string;
  model: string;
  years: string; // مثال: 2020-2026
  engine?: string;
  // الزيت
  oilViscosity: string; // 5W-30
  oilSpec: string; // API SP / ACEA C3
  oilType: string; // Fully Synthetic
  oilCapacityL: string;
  oilIntervalKm: number;
  oilIntervalMonths: number;
  // الفلاتر
  oilFilter: string;
  oilFilterAlt?: string;
  airFilter: string;
  airFilterAlt?: string;
  fuelFilter: string;
  fuelFilterAlt?: string;
  cabinFilter: string;
  cabinFilterAlt?: string;
  notes?: string;
}

export const OIL_FILTER_CATALOG: OilFilterSpec[] = [
  // ── Jetour ──
  {
    id: 'jetour-x70-plus-15t',
    brand: 'Jetour',
    model: 'X70 Plus',
    years: '2021-2026',
    engine: '1.5T (SQRE4T15)',
    oilViscosity: '5W-30',
    oilSpec: 'API SP / SN Plus · ACEA C3',
    oilType: 'Fully Synthetic',
    oilCapacityL: '4.0 – 4.5',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'OEM: 100106001AA · بديل شائع: Mann W 67/1 / Bosch F026407024',
    oilFilterAlt: 'WIX WL7415 / Fram PH4967 (تحقق من المقاس)',
    airFilter: 'OEM حسب الموديل · بديل: Mann C 27 018 / Bosch F026400493',
    fuelFilter: 'مضمن في مضخة البنزين أو خارجي حسب السنة — تحقق من الكتالوج',
    cabinFilter: 'OEM · بديل: Mann CU 26 010 / Bosch 1987432396',
    notes: 'جيتور 70 بلس / X70 Plus 7 مقاعد — الأكثر طلباً في المكتب',
  },
  {
    id: 'jetour-x70-15t',
    brand: 'Jetour',
    model: 'X70',
    years: '2018-2025',
    engine: '1.5T',
    oilViscosity: '5W-30',
    oilSpec: 'API SP · ACEA A5/B5 أو C3',
    oilType: 'Fully Synthetic',
    oilCapacityL: '4.0 – 4.5',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'Mann W 67/1 · Bosch F026407024',
    airFilter: 'Mann C 27 018',
    fuelFilter: 'حسب التجهيز — غالباً مع المضخة',
    cabinFilter: 'Mann CU 26 010',
  },
  {
    id: 'jetour-dashing-15t',
    brand: 'Jetour',
    model: 'Dashing',
    years: '2022-2026',
    engine: '1.5T',
    oilViscosity: '0W-20 أو 5W-30',
    oilSpec: 'API SP · ACEA C5 / C3 حسب المحرك',
    oilType: 'Fully Synthetic',
    oilCapacityL: '4.0',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'OEM Jetour · بديل Mann / Bosch مطابق للمقاس',
    airFilter: 'OEM · Mann مناسب للصين',
    fuelFilter: 'حسب الكتالوج',
    cabinFilter: 'فلتر مقصورة كربوني مفضّل للغبار',
    notes: 'تحقق من غطاء الزيت: قد يوصى 0W-20 في بعض الدفعات',
  },

  // ── Chery / Tiggo ──
  {
    id: 'chery-tiggo8-15t',
    brand: 'Chery',
    model: 'Tiggo 8',
    years: '2018-2026',
    engine: '1.5T / 1.6T',
    oilViscosity: '5W-30',
    oilSpec: 'API SP · ACEA C3',
    oilType: 'Fully Synthetic',
    oilCapacityL: '4.0 – 4.5',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'OEM Chery · Mann HU 7008 z / W 712/95',
    oilFilterAlt: 'Bosch F026407178',
    airFilter: 'Mann C 25 017 · Bosch F026400220',
    fuelFilter: 'Mann WK 820/1 أو مدمج',
    cabinFilter: 'Mann CUK 26 009 · مع كربون نشط',
    notes: 'تيجو 8 رمادي وغيره — شائع في الجزائر',
  },
  {
    id: 'chery-tiggo8-pro',
    brand: 'Chery',
    model: 'Tiggo 8 Pro',
    years: '2021-2026',
    engine: '1.6T / 2.0T',
    oilViscosity: '5W-30',
    oilSpec: 'API SP · ACEA C3 / A5/B5',
    oilType: 'Fully Synthetic',
    oilCapacityL: '4.5 – 5.0',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'OEM · Mann / Bosch مطابق 1.6T أو 2.0T',
    airFilter: 'Mann · Bosch',
    fuelFilter: 'حسب المحرك',
    cabinFilter: 'CUK مع كربون',
  },
  {
    id: 'chery-tiggo7-pro',
    brand: 'Chery',
    model: 'Tiggo 7 Pro',
    years: '2020-2026',
    engine: '1.5T / 1.6T',
    oilViscosity: '5W-30',
    oilSpec: 'API SP · ACEA C3',
    oilType: 'Fully Synthetic',
    oilCapacityL: '4.0 – 4.5',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'Mann W 712/95 · Bosch',
    airFilter: 'Mann C 25 017',
    fuelFilter: 'حسب التجهيز',
    cabinFilter: 'Mann CUK 26 009',
  },
  {
    id: 'chery-tiggo4-pro',
    brand: 'Chery',
    model: 'Tiggo 4 Pro',
    years: '2021-2026',
    engine: '1.5T',
    oilViscosity: '5W-30',
    oilSpec: 'API SP · SN',
    oilType: 'Fully Synthetic',
    oilCapacityL: '3.8 – 4.2',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'OEM Chery · Mann صغير الحجم',
    airFilter: 'OEM · Mann',
    fuelFilter: 'مدمج أو خارجي',
    cabinFilter: 'فلتر مقصورة قياسي',
  },
  {
    id: 'chery-arrizo6',
    brand: 'Chery',
    model: 'Arrizo 6',
    years: '2019-2025',
    engine: '1.5T',
    oilViscosity: '5W-30',
    oilSpec: 'API SP',
    oilType: 'Fully Synthetic',
    oilCapacityL: '4.0',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'OEM · Mann',
    airFilter: 'OEM',
    fuelFilter: 'حسب السنة',
    cabinFilter: 'OEM',
  },

  // ── Haval ──
  {
    id: 'haval-jolion',
    brand: 'Haval',
    model: 'Jolion',
    years: '2021-2026',
    engine: '1.5T',
    oilViscosity: '0W-20 أو 5W-30',
    oilSpec: 'API SP · ACEA C5 / C3',
    oilType: 'Fully Synthetic',
    oilCapacityL: '4.0 – 4.5',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'OEM Great Wall/Haval · Mann / Bosch',
    airFilter: 'OEM · Mann',
    fuelFilter: 'حسب الكتالوج',
    cabinFilter: 'فلتر مقصورة كربوني',
    notes: 'تحقق من ملصق غطاء الزيت في المحرك',
  },
  {
    id: 'haval-h6',
    brand: 'Haval',
    model: 'H6',
    years: '2018-2026',
    engine: '1.5T / 2.0T',
    oilViscosity: '5W-30',
    oilSpec: 'API SP · ACEA C3',
    oilType: 'Fully Synthetic',
    oilCapacityL: '4.5 – 5.5',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'OEM Haval · Mann',
    airFilter: 'OEM · Mann',
    fuelFilter: 'OEM',
    cabinFilter: 'CUK',
  },

  // ── Geely ──
  {
    id: 'geely-coolray',
    brand: 'Geely',
    model: 'Coolray',
    years: '2019-2026',
    engine: '1.5T',
    oilViscosity: '0W-20 أو 5W-30',
    oilSpec: 'API SP · ACEA C5',
    oilType: 'Fully Synthetic',
    oilCapacityL: '3.5 – 4.0',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'OEM Geely · Mann',
    airFilter: 'OEM',
    fuelFilter: 'مدمج غالباً',
    cabinFilter: 'OEM · كربوني مفضّل',
  },
  {
    id: 'geely-azkarra',
    brand: 'Geely',
    model: 'Azkarra',
    years: '2020-2025',
    engine: '1.5T',
    oilViscosity: '5W-30',
    oilSpec: 'API SP',
    oilType: 'Fully Synthetic',
    oilCapacityL: '4.0',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'OEM Geely',
    airFilter: 'OEM',
    fuelFilter: 'حسب التجهيز',
    cabinFilter: 'OEM',
  },

  // ── Changan ──
  {
    id: 'changan-cs35-plus',
    brand: 'Changan',
    model: 'CS35 Plus',
    years: '2019-2026',
    engine: '1.4T / 1.6',
    oilViscosity: '5W-30',
    oilSpec: 'API SP · SN',
    oilType: 'Fully Synthetic',
    oilCapacityL: '3.5 – 4.0',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'OEM Changan · Mann',
    airFilter: 'OEM',
    fuelFilter: 'OEM',
    cabinFilter: 'OEM',
  },
  {
    id: 'changan-cs75-plus',
    brand: 'Changan',
    model: 'CS75 Plus',
    years: '2019-2026',
    engine: '1.5T / 2.0T',
    oilViscosity: '5W-30',
    oilSpec: 'API SP · ACEA C3',
    oilType: 'Fully Synthetic',
    oilCapacityL: '4.5 – 5.0',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    oilFilter: 'OEM · Mann / Bosch',
    airFilter: 'OEM · Mann',
    fuelFilter: 'OEM',
    cabinFilter: 'كربوني مفضّل',
  },
];

export function getCatalogBrands(): string[] {
  return Array.from(new Set(OIL_FILTER_CATALOG.map((x) => x.brand))).sort();
}

export function getModelsForBrand(brand: string): string[] {
  return Array.from(
    new Set(
      OIL_FILTER_CATALOG.filter((x) => x.brand.toLowerCase() === brand.toLowerCase()).map((x) => x.model)
    )
  ).sort();
}

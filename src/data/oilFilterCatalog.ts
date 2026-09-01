/**
 * كتالوج زيوت وفلاتر — صيني + ياباني + ألماني + فرنسي + كوري
 * الأرقام مرجعية شائعة في السوق — يُفضّل التحقق عند التركيب
 */

export interface OilFilterSpec {
  id: string;
  brand: string;
  model: string;
  years: string;
  engine?: string;
  region?: 'chinese' | 'japanese' | 'german' | 'french' | 'korean' | 'other';
  oilViscosity: string;
  oilSpec: string;
  oilType: string;
  oilCapacityL: string;
  oilIntervalKm: number;
  oilIntervalMonths: number;
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

function s(
  partial: Omit<OilFilterSpec, 'oilType' | 'oilIntervalKm' | 'oilIntervalMonths'> &
    Partial<Pick<OilFilterSpec, 'oilType' | 'oilIntervalKm' | 'oilIntervalMonths'>>
): OilFilterSpec {
  return {
    oilType: 'Fully Synthetic',
    oilIntervalKm: 10000,
    oilIntervalMonths: 12,
    ...partial,
  };
}

export const OIL_FILTER_CATALOG: OilFilterSpec[] = [
  // ═══════════ صيني ═══════════
  s({
    id: 'jetour-x70-plus-15t', brand: 'Jetour', model: 'X70 Plus', years: '2021-2026', engine: '1.5T (SQRE4T15)', region: 'chinese',
    oilViscosity: '5W-30', oilSpec: 'API SP / SN Plus · ACEA C3', oilCapacityL: '4.0 – 4.5',
    oilFilter: 'OEM: 100106001AA · Mann W 67/1 / Bosch F026407024', oilFilterAlt: 'WIX WL7415 / Fram PH4967',
    airFilter: 'Mann C 27 018 / Bosch F026400493', fuelFilter: 'مدمج أو خارجي حسب السنة', cabinFilter: 'Mann CU 26 010 / Bosch 1987432396',
    notes: 'جيتور 70 بلس — الأكثر طلباً في المكتب',
  }),
  s({
    id: 'jetour-x70-15t', brand: 'Jetour', model: 'X70', years: '2018-2025', engine: '1.5T', region: 'chinese',
    oilViscosity: '5W-30', oilSpec: 'API SP · ACEA A5/B5 أو C3', oilCapacityL: '4.0 – 4.5',
    oilFilter: 'Mann W 67/1 · Bosch F026407024', airFilter: 'Mann C 27 018', fuelFilter: 'حسب التجهيز', cabinFilter: 'Mann CU 26 010',
  }),
  s({
    id: 'jetour-dashing-15t', brand: 'Jetour', model: 'Dashing', years: '2022-2026', engine: '1.5T', region: 'chinese',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'API SP · ACEA C5 / C3', oilCapacityL: '4.0',
    oilFilter: 'OEM Jetour · Mann / Bosch', airFilter: 'OEM · Mann', fuelFilter: 'حسب الكتالوج', cabinFilter: 'فلتر مقصورة كربوني',
    notes: 'تحقق من غطاء الزيت: قد يوصى 0W-20',
  }),
  s({
    id: 'chery-tiggo8-15t', brand: 'Chery', model: 'Tiggo 8', years: '2018-2026', engine: '1.5T / 1.6T', region: 'chinese',
    oilViscosity: '5W-30', oilSpec: 'API SP · ACEA C3', oilCapacityL: '4.0 – 4.5',
    oilFilter: 'Mann HU 7008 z / W 712/95', oilFilterAlt: 'Bosch F026407178',
    airFilter: 'Mann C 25 017 · Bosch F026400220', fuelFilter: 'Mann WK 820/1 أو مدمج', cabinFilter: 'Mann CUK 26 009',
    notes: 'تيجو 8 — شائع في الجزائر',
  }),
  s({
    id: 'chery-tiggo8-pro', brand: 'Chery', model: 'Tiggo 8 Pro', years: '2021-2026', engine: '1.6T / 2.0T', region: 'chinese',
    oilViscosity: '5W-30', oilSpec: 'API SP · ACEA C3', oilCapacityL: '4.5 – 5.0',
    oilFilter: 'OEM · Mann / Bosch', airFilter: 'Mann · Bosch', fuelFilter: 'حسب المحرك', cabinFilter: 'CUK مع كربون',
  }),
  s({
    id: 'chery-tiggo7-pro', brand: 'Chery', model: 'Tiggo 7 Pro', years: '2020-2026', engine: '1.5T / 1.6T', region: 'chinese',
    oilViscosity: '5W-30', oilSpec: 'API SP · ACEA C3', oilCapacityL: '4.0 – 4.5',
    oilFilter: 'Mann W 712/95 · Bosch', airFilter: 'Mann C 25 017', fuelFilter: 'حسب التجهيز', cabinFilter: 'Mann CUK 26 009',
  }),
  s({
    id: 'chery-tiggo4-pro', brand: 'Chery', model: 'Tiggo 4 Pro', years: '2021-2026', engine: '1.5T', region: 'chinese',
    oilViscosity: '5W-30', oilSpec: 'API SP · SN', oilCapacityL: '3.8 – 4.2',
    oilFilter: 'OEM Chery · Mann', airFilter: 'OEM · Mann', fuelFilter: 'مدمج أو خارجي', cabinFilter: 'فلتر مقصورة قياسي',
  }),
  s({
    id: 'chery-arrizo6', brand: 'Chery', model: 'Arrizo 6', years: '2019-2025', engine: '1.5T', region: 'chinese',
    oilViscosity: '5W-30', oilSpec: 'API SP', oilCapacityL: '4.0',
    oilFilter: 'OEM · Mann', airFilter: 'OEM', fuelFilter: 'حسب السنة', cabinFilter: 'OEM',
  }),
  s({
    id: 'haval-jolion', brand: 'Haval', model: 'Jolion', years: '2021-2026', engine: '1.5T', region: 'chinese',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'API SP · ACEA C5 / C3', oilCapacityL: '4.0 – 4.5',
    oilFilter: 'OEM Haval · Mann / Bosch', airFilter: 'OEM · Mann', fuelFilter: 'حسب الكتالوج', cabinFilter: 'فلتر مقصورة كربوني',
  }),
  s({
    id: 'haval-h6', brand: 'Haval', model: 'H6', years: '2018-2026', engine: '1.5T / 2.0T', region: 'chinese',
    oilViscosity: '5W-30', oilSpec: 'API SP · ACEA C3', oilCapacityL: '4.5 – 5.5',
    oilFilter: 'OEM Haval · Mann', airFilter: 'OEM · Mann', fuelFilter: 'OEM', cabinFilter: 'CUK',
  }),
  s({
    id: 'geely-coolray', brand: 'Geely', model: 'Coolray', years: '2019-2026', engine: '1.5T', region: 'chinese',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'API SP · ACEA C5', oilCapacityL: '3.5 – 4.0',
    oilFilter: 'OEM Geely · Mann', airFilter: 'OEM', fuelFilter: 'مدمج غالباً', cabinFilter: 'OEM · كربوني',
  }),
  s({
    id: 'geely-azkarra', brand: 'Geely', model: 'Azkarra', years: '2020-2025', engine: '1.5T', region: 'chinese',
    oilViscosity: '5W-30', oilSpec: 'API SP', oilCapacityL: '4.0',
    oilFilter: 'OEM Geely', airFilter: 'OEM', fuelFilter: 'حسب التجهيز', cabinFilter: 'OEM',
  }),
  s({
    id: 'changan-cs35-plus', brand: 'Changan', model: 'CS35 Plus', years: '2019-2026', engine: '1.4T / 1.6', region: 'chinese',
    oilViscosity: '5W-30', oilSpec: 'API SP · SN', oilCapacityL: '3.5 – 4.0',
    oilFilter: 'OEM Changan · Mann', airFilter: 'OEM', fuelFilter: 'OEM', cabinFilter: 'OEM',
  }),
  s({
    id: 'changan-cs75-plus', brand: 'Changan', model: 'CS75 Plus', years: '2019-2026', engine: '1.5T / 2.0T', region: 'chinese',
    oilViscosity: '5W-30', oilSpec: 'API SP · ACEA C3', oilCapacityL: '4.5 – 5.0',
    oilFilter: 'OEM · Mann / Bosch', airFilter: 'OEM · Mann', fuelFilter: 'OEM', cabinFilter: 'كربوني مفضّل',
  }),

  // ═══════════ ياباني ═══════════
  s({
    id: 'toyota-corolla-15-20', brand: 'Toyota', model: 'Corolla', years: '2014-2026', engine: '1.6 / 1.8 / 2.0 Hybrid', region: 'japanese',
    oilViscosity: '0W-20', oilSpec: 'API SP · ILSAC GF-6A', oilCapacityL: '4.2 – 4.5', oilIntervalKm: 10000, oilIntervalMonths: 12,
    oilFilter: 'Toyota 04152-YZZA1 · Mann W 610/6', oilFilterAlt: 'Bosch F026407094',
    airFilter: 'Toyota 17801-21050 · Mann C 25 114', fuelFilter: 'مدمج في الخزان غالباً', cabinFilter: 'Toyota 87139-YZZ08 · Mann CUK 22 023',
  }),
  s({
    id: 'toyota-camry-25', brand: 'Toyota', model: 'Camry', years: '2018-2026', engine: '2.5 / Hybrid', region: 'japanese',
    oilViscosity: '0W-20', oilSpec: 'API SP · ILSAC GF-6A', oilCapacityL: '4.5 – 4.8',
    oilFilter: 'Toyota 04152-YZZA1 · Mann W 610/6', airFilter: 'Toyota 17801-0V020', fuelFilter: 'مدمج', cabinFilter: 'Toyota 87139-07010',
  }),
  s({
    id: 'toyota-rav4-25', brand: 'Toyota', model: 'RAV4', years: '2019-2026', engine: '2.0 / 2.5 Hybrid', region: 'japanese',
    oilViscosity: '0W-20', oilSpec: 'API SP · ILSAC GF-6A', oilCapacityL: '4.5 – 4.8',
    oilFilter: 'Toyota 04152-YZZA1', airFilter: 'Toyota 17801-0V010', fuelFilter: 'مدمج', cabinFilter: 'Toyota 87139-0R030',
  }),
  s({
    id: 'toyota-hilux-28d', brand: 'Toyota', model: 'Hilux', years: '2016-2026', engine: '2.4D / 2.8D', region: 'japanese',
    oilViscosity: '5W-30', oilSpec: 'API CK-4 / CJ-4 · ACEA E7', oilCapacityL: '6.5 – 7.5', oilIntervalKm: 10000,
    oilFilter: 'Toyota 04152-YZZA5 · Mann W 940/25', airFilter: 'Toyota 17801-0L040', fuelFilter: 'Toyota 23390-0L110', cabinFilter: 'Toyota 87139-0K031',
  }),
  s({
    id: 'toyota-landcruiser-prado', brand: 'Toyota', model: 'Land Cruiser Prado', years: '2010-2026', engine: '2.8D / 4.0', region: 'japanese',
    oilViscosity: '5W-30', oilSpec: 'API CK-4 · ACEA E7', oilCapacityL: '7.0 – 8.0',
    oilFilter: 'Toyota 04152-YZZA5', airFilter: 'OEM Toyota', fuelFilter: 'OEM Toyota', cabinFilter: 'OEM Toyota',
  }),
  s({
    id: 'toyota-yaris', brand: 'Toyota', model: 'Yaris', years: '2014-2026', engine: '1.0 / 1.5 Hybrid', region: 'japanese',
    oilViscosity: '0W-20', oilSpec: 'API SP · ILSAC GF-6A', oilCapacityL: '3.3 – 3.7',
    oilFilter: 'Toyota 04152-YZZA1', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'honda-civic-15t', brand: 'Honda', model: 'Civic', years: '2016-2026', engine: '1.5T / 2.0', region: 'japanese',
    oilViscosity: '0W-20', oilSpec: 'API SP · ILSAC GF-6A', oilCapacityL: '3.5 – 3.7',
    oilFilter: 'Honda 15400-PLM-A02 · Mann HU 7008 z', airFilter: 'Honda 17220-5AA-A00', fuelFilter: 'مدمج', cabinFilter: 'Honda 80292-TBA-A01',
  }),
  s({
    id: 'honda-crv', brand: 'Honda', model: 'CR-V', years: '2017-2026', engine: '1.5T / 2.0 Hybrid', region: 'japanese',
    oilViscosity: '0W-20', oilSpec: 'API SP · ILSAC GF-6A', oilCapacityL: '3.5 – 3.8',
    oilFilter: 'Honda 15400-PLM-A02', airFilter: 'OEM Honda', fuelFilter: 'مدمج', cabinFilter: 'OEM Honda',
  }),
  s({
    id: 'honda-accord', brand: 'Honda', model: 'Accord', years: '2018-2026', engine: '1.5T / 2.0 Hybrid', region: 'japanese',
    oilViscosity: '0W-20', oilSpec: 'API SP', oilCapacityL: '3.7 – 4.0',
    oilFilter: 'Honda 15400-PLM-A02', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'nissan-qashqai', brand: 'Nissan', model: 'Qashqai', years: '2014-2026', engine: '1.2 DIG-T / 1.3 / 1.5 dCi', region: 'japanese',
    oilViscosity: '5W-30', oilSpec: 'API SP · ACEA C3 / A5', oilCapacityL: '4.0 – 4.6',
    oilFilter: 'Nissan 15208-65F0C · Mann W 67/1', airFilter: 'Nissan 16546-6EA0A', fuelFilter: 'حسب المحرك', cabinFilter: 'Nissan 27277-4EA0A',
  }),
  s({
    id: 'nissan-xtrail', brand: 'Nissan', model: 'X-Trail', years: '2014-2026', engine: '1.6 DIG-T / 2.0 / 1.5 e-Power', region: 'japanese',
    oilViscosity: '5W-30', oilSpec: 'API SP · ACEA C3', oilCapacityL: '4.5 – 5.0',
    oilFilter: 'Nissan 15208-65F0C', airFilter: 'OEM', fuelFilter: 'OEM', cabinFilter: 'OEM',
  }),
  s({
    id: 'nissan-sunny-almera', brand: 'Nissan', model: 'Sunny / Almera', years: '2012-2026', engine: '1.5 / 1.6', region: 'japanese',
    oilViscosity: '5W-30', oilSpec: 'API SP · SN', oilCapacityL: '3.5 – 4.0',
    oilFilter: 'Nissan 15208-65F0E', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'nissan-patrol', brand: 'Nissan', model: 'Patrol', years: '2010-2026', engine: '4.0 / 5.6', region: 'japanese',
    oilViscosity: '5W-30', oilSpec: 'API SP · SN', oilCapacityL: '6.0 – 7.0',
    oilFilter: 'OEM Nissan', airFilter: 'OEM', fuelFilter: 'OEM', cabinFilter: 'OEM',
  }),
  s({
    id: 'mazda-cx5', brand: 'Mazda', model: 'CX-5', years: '2017-2026', engine: '2.0 / 2.5 Skyactiv', region: 'japanese',
    oilViscosity: '0W-20', oilSpec: 'API SP · ILSAC GF-6A', oilCapacityL: '4.2 – 4.5',
    oilFilter: 'Mazda PE01-14-302 · Mann W 67/1', airFilter: 'OEM Mazda', fuelFilter: 'مدمج', cabinFilter: 'OEM Mazda',
  }),
  s({
    id: 'mazda-3', brand: 'Mazda', model: 'Mazda3', years: '2019-2026', engine: '2.0 / 2.5', region: 'japanese',
    oilViscosity: '0W-20', oilSpec: 'API SP', oilCapacityL: '4.2',
    oilFilter: 'Mazda PE01-14-302', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'subaru-forester', brand: 'Subaru', model: 'Forester', years: '2019-2026', engine: '2.0 / 2.5', region: 'japanese',
    oilViscosity: '0W-20', oilSpec: 'API SP', oilCapacityL: '4.2 – 4.5',
    oilFilter: 'Subaru 15208AA15A · WIX 57055', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'mitsubishi-l200', brand: 'Mitsubishi', model: 'L200 / Triton', years: '2015-2026', engine: '2.4D', region: 'japanese',
    oilViscosity: '5W-30', oilSpec: 'API CK-4 · ACEA E7', oilCapacityL: '6.0 – 7.0',
    oilFilter: 'OEM Mitsubishi · Mann', airFilter: 'OEM', fuelFilter: 'OEM', cabinFilter: 'OEM',
  }),
  s({
    id: 'mitsubishi-outlander', brand: 'Mitsubishi', model: 'Outlander', years: '2015-2026', engine: '2.0 / 2.4 / PHEV', region: 'japanese',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'API SP', oilCapacityL: '4.0 – 4.5',
    oilFilter: 'OEM Mitsubishi', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'suzuki-swift', brand: 'Suzuki', model: 'Swift', years: '2017-2026', engine: '1.2 / 1.0 Boosterjet', region: 'japanese',
    oilViscosity: '0W-20', oilSpec: 'API SP · ILSAC GF-6A', oilCapacityL: '3.1 – 3.4',
    oilFilter: 'Suzuki 16510-61A01', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'suzuki-vitara', brand: 'Suzuki', model: 'Vitara', years: '2015-2026', engine: '1.4 Boosterjet / 1.6', region: 'japanese',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'API SP', oilCapacityL: '3.5 – 4.0',
    oilFilter: 'OEM Suzuki', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),

  // ═══════════ ألماني ═══════════
  s({
    id: 'vw-golf-15tsi', brand: 'Volkswagen', model: 'Golf', years: '2013-2026', engine: '1.4 TSI / 1.5 TSI / 2.0 TDI', region: 'german',
    oilViscosity: '5W-30', oilSpec: 'VW 504 00 / 507 00 · ACEA C3', oilCapacityL: '4.0 – 4.5', oilIntervalKm: 15000, oilIntervalMonths: 12,
    oilFilter: 'Mann HU 7008 z · Mahle OX 388D', airFilter: 'Mann C 35 154', fuelFilter: 'Mann WK 820/16 (ديزل)', cabinFilter: 'Mann CUK 26 010',
  }),
  s({
    id: 'vw-passat', brand: 'Volkswagen', model: 'Passat', years: '2015-2026', engine: '1.4 / 1.5 TSI / 2.0 TDI', region: 'german',
    oilViscosity: '5W-30', oilSpec: 'VW 504 00 / 507 00', oilCapacityL: '4.5 – 5.0', oilIntervalKm: 15000,
    oilFilter: 'Mann HU 7008 z', airFilter: 'Mann C 35 154', fuelFilter: 'حسب المحرك', cabinFilter: 'Mann CUK 29 005',
  }),
  s({
    id: 'vw-tiguan', brand: 'Volkswagen', model: 'Tiguan', years: '2016-2026', engine: '1.4 / 1.5 TSI / 2.0 TDI', region: 'german',
    oilViscosity: '5W-30', oilSpec: 'VW 504 00 / 507 00', oilCapacityL: '4.5 – 5.5', oilIntervalKm: 15000,
    oilFilter: 'Mann HU 7008 z', airFilter: 'OEM VW', fuelFilter: 'OEM', cabinFilter: 'OEM VW',
  }),
  s({
    id: 'vw-polo', brand: 'Volkswagen', model: 'Polo', years: '2018-2026', engine: '1.0 TSI', region: 'german',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'VW 508 00 / 504 00', oilCapacityL: '3.5 – 4.0',
    oilFilter: 'Mann HU 6013 z', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'bmw-3series', brand: 'BMW', model: '3 Series (G20)', years: '2019-2026', engine: 'B48 2.0T / B58', region: 'german',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'BMW LL-17 FE+ / LL-01', oilCapacityL: '5.0 – 5.5', oilIntervalKm: 15000, oilIntervalMonths: 24,
    oilFilter: 'BMW 11 42 8 664 517 · Mann HU 816 x', airFilter: 'BMW 13 71 8 645 328', fuelFilter: 'مدمج', cabinFilter: 'BMW 64 31 9 405 788',
  }),
  s({
    id: 'bmw-5series', brand: 'BMW', model: '5 Series (G30)', years: '2017-2026', engine: 'B48 / B58 / B57', region: 'german',
    oilViscosity: '0W-30 أو 5W-30', oilSpec: 'BMW LL-01 / LL-17 FE+', oilCapacityL: '5.5 – 6.5', oilIntervalKm: 15000,
    oilFilter: 'Mann HU 816 x', airFilter: 'OEM BMW', fuelFilter: 'OEM', cabinFilter: 'OEM BMW',
  }),
  s({
    id: 'bmw-x3', brand: 'BMW', model: 'X3', years: '2018-2026', engine: 'B48 / B58', region: 'german',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'BMW LL-17 FE+ / LL-01', oilCapacityL: '5.0 – 5.5', oilIntervalKm: 15000,
    oilFilter: 'Mann HU 816 x', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'mercedes-c-class', brand: 'Mercedes-Benz', model: 'C-Class (W205/W206)', years: '2014-2026', engine: 'M264 / M254', region: 'german',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'MB 229.51 / 229.52 / 229.71', oilCapacityL: '5.5 – 6.5', oilIntervalKm: 15000, oilIntervalMonths: 12,
    oilFilter: 'Mann HU 718/5 x · Mahle OX 370D', airFilter: 'Mann C 30 175', fuelFilter: 'Mann WK 820/1', cabinFilter: 'Mann CUK 29 005',
  }),
  s({
    id: 'mercedes-e-class', brand: 'Mercedes-Benz', model: 'E-Class (W213)', years: '2016-2026', engine: 'M264 / OM654', region: 'german',
    oilViscosity: '5W-30', oilSpec: 'MB 229.51 / 229.52', oilCapacityL: '6.0 – 7.0', oilIntervalKm: 15000,
    oilFilter: 'Mann HU 718/5 x', airFilter: 'OEM MB', fuelFilter: 'OEM', cabinFilter: 'OEM MB',
  }),
  s({
    id: 'mercedes-gla', brand: 'Mercedes-Benz', model: 'GLA', years: '2020-2026', engine: 'M282 / M260', region: 'german',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'MB 229.71 / 229.51', oilCapacityL: '5.0 – 5.5',
    oilFilter: 'OEM Mercedes · Mann', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'audi-a3', brand: 'Audi', model: 'A3', years: '2013-2026', engine: '1.4 / 1.5 TFSI / 2.0 TDI', region: 'german',
    oilViscosity: '5W-30', oilSpec: 'VW 504 00 / 507 00', oilCapacityL: '4.0 – 4.5', oilIntervalKm: 15000,
    oilFilter: 'Mann HU 7008 z', airFilter: 'Mann C 35 154', fuelFilter: 'حسب المحرك', cabinFilter: 'Mann CUK 26 010',
  }),
  s({
    id: 'audi-a4', brand: 'Audi', model: 'A4', years: '2016-2026', engine: '2.0 TFSI / 2.0 TDI', region: 'german',
    oilViscosity: '5W-30', oilSpec: 'VW 504 00 / 507 00', oilCapacityL: '4.5 – 5.5', oilIntervalKm: 15000,
    oilFilter: 'Mann HU 7008 z', airFilter: 'OEM Audi', fuelFilter: 'OEM', cabinFilter: 'OEM Audi',
  }),
  s({
    id: 'audi-q5', brand: 'Audi', model: 'Q5', years: '2017-2026', engine: '2.0 TFSI / 2.0 TDI', region: 'german',
    oilViscosity: '5W-30', oilSpec: 'VW 504 00 / 507 00', oilCapacityL: '5.0 – 5.5', oilIntervalKm: 15000,
    oilFilter: 'Mann HU 7008 z', airFilter: 'OEM', fuelFilter: 'OEM', cabinFilter: 'OEM',
  }),
  s({
    id: 'opel-astra', brand: 'Opel', model: 'Astra', years: '2015-2026', engine: '1.2 / 1.4 Turbo / 1.6 CDTI', region: 'german',
    oilViscosity: '5W-30', oilSpec: 'API SP · ACEA C3 / A5', oilCapacityL: '4.0 – 4.5',
    oilFilter: 'Mann W 712/95 · Bosch', airFilter: 'OEM Opel', fuelFilter: 'حسب المحرك', cabinFilter: 'OEM',
  }),
  s({
    id: 'opel-corsa', brand: 'Opel', model: 'Corsa', years: '2019-2026', engine: '1.2 Turbo', region: 'german',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'API SP · ACEA C5', oilCapacityL: '3.5 – 4.0',
    oilFilter: 'OEM Opel · Mann', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),

  // ═══════════ فرنسي ═══════════
  s({
    id: 'renault-clio', brand: 'Renault', model: 'Clio', years: '2012-2026', engine: '0.9 TCe / 1.0 TCe / 1.5 dCi', region: 'french',
    oilViscosity: '5W-30', oilSpec: 'RN0720 / ACEA C3 · API SP', oilCapacityL: '3.5 – 4.5', oilIntervalKm: 15000, oilIntervalMonths: 12,
    oilFilter: 'Renault 77 01 047 346 · Mann W 79', airFilter: 'Renault 82 00 432 931', fuelFilter: 'Renault 82 00 434 966 (ديزل)', cabinFilter: 'Renault 27 27 730 02R',
  }),
  s({
    id: 'renault-megane', brand: 'Renault', model: 'Megane', years: '2016-2026', engine: '1.2 TCe / 1.3 TCe / 1.5 dCi', region: 'french',
    oilViscosity: '5W-30', oilSpec: 'RN0720 · ACEA C3', oilCapacityL: '4.0 – 4.8', oilIntervalKm: 15000,
    oilFilter: 'Mann W 79 / HU 7008', airFilter: 'OEM Renault', fuelFilter: 'حسب المحرك', cabinFilter: 'OEM Renault',
  }),
  s({
    id: 'renault-symbol-duster', brand: 'Renault', model: 'Symbol / Duster', years: '2013-2026', engine: '1.6 / 1.5 dCi', region: 'french',
    oilViscosity: '5W-30 أو 10W-40', oilSpec: 'API SP · ACEA A3/B4', oilCapacityL: '3.5 – 4.5',
    oilFilter: 'Renault · Mann W 712/75', airFilter: 'OEM', fuelFilter: 'ديزل: OEM Renault', cabinFilter: 'OEM',
    notes: 'داستر ورموز شائعة في الجزائر',
  }),
  s({
    id: 'renault-captur', brand: 'Renault', model: 'Captur', years: '2013-2026', engine: '0.9 / 1.0 TCe / 1.5 dCi', region: 'french',
    oilViscosity: '5W-30', oilSpec: 'RN0720 · ACEA C3', oilCapacityL: '3.5 – 4.5',
    oilFilter: 'Mann W 79', airFilter: 'OEM', fuelFilter: 'حسب المحرك', cabinFilter: 'OEM',
  }),
  s({
    id: 'peugeot-208', brand: 'Peugeot', model: '208', years: '2012-2026', engine: '1.2 PureTech / 1.5 BlueHDi', region: 'french',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'PSA B71 2312 / 2290 · ACEA C2/C3', oilCapacityL: '3.5 – 4.0', oilIntervalKm: 15000,
    oilFilter: 'Peugeot 1109.Y6 · Mann HU 7008 z', airFilter: 'OEM Peugeot', fuelFilter: 'BlueHDi: OEM', cabinFilter: 'OEM Peugeot',
  }),
  s({
    id: 'peugeot-308', brand: 'Peugeot', model: '308', years: '2013-2026', engine: '1.2 PureTech / 1.5 / 1.6 BlueHDi', region: 'french',
    oilViscosity: '0W-30 أو 5W-30', oilSpec: 'PSA B71 2312 · ACEA C2', oilCapacityL: '3.5 – 4.2', oilIntervalKm: 15000,
    oilFilter: 'Mann HU 7008 z', airFilter: 'OEM', fuelFilter: 'حسب المحرك', cabinFilter: 'OEM',
  }),
  s({
    id: 'peugeot-3008', brand: 'Peugeot', model: '3008', years: '2016-2026', engine: '1.2 / 1.6 PureTech / 1.5 BlueHDi', region: 'french',
    oilViscosity: '0W-30 أو 5W-30', oilSpec: 'PSA B71 2312', oilCapacityL: '4.0 – 4.5', oilIntervalKm: 15000,
    oilFilter: 'Mann HU 7008 z', airFilter: 'OEM Peugeot', fuelFilter: 'OEM', cabinFilter: 'OEM',
  }),
  s({
    id: 'peugeot-partner-rifter', brand: 'Peugeot', model: 'Partner / Rifter', years: '2018-2026', engine: '1.5 BlueHDi / 1.2', region: 'french',
    oilViscosity: '5W-30', oilSpec: 'PSA B71 2290 / 2312', oilCapacityL: '3.5 – 4.5',
    oilFilter: 'OEM Peugeot · Mann', airFilter: 'OEM', fuelFilter: 'OEM', cabinFilter: 'OEM',
  }),
  s({
    id: 'citroen-c3', brand: 'Citroën', model: 'C3', years: '2016-2026', engine: '1.2 PureTech / 1.5 BlueHDi', region: 'french',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'PSA B71 2312 · ACEA C2', oilCapacityL: '3.5 – 4.0', oilIntervalKm: 15000,
    oilFilter: 'Mann HU 7008 z', airFilter: 'OEM Citroën', fuelFilter: 'حسب المحرك', cabinFilter: 'OEM',
  }),
  s({
    id: 'citroen-c4', brand: 'Citroën', model: 'C4 / C4 Cactus', years: '2014-2026', engine: '1.2 PureTech / 1.5 BlueHDi', region: 'french',
    oilViscosity: '5W-30', oilSpec: 'PSA B71 2312', oilCapacityL: '3.5 – 4.2',
    oilFilter: 'Mann HU 7008 z', airFilter: 'OEM', fuelFilter: 'OEM', cabinFilter: 'OEM',
  }),
  s({
    id: 'citroen-berlingo', brand: 'Citroën', model: 'Berlingo', years: '2018-2026', engine: '1.5 BlueHDi', region: 'french',
    oilViscosity: '5W-30', oilSpec: 'PSA B71 2290', oilCapacityL: '3.5 – 4.5',
    oilFilter: 'OEM Citroën · Mann', airFilter: 'OEM', fuelFilter: 'OEM', cabinFilter: 'OEM',
  }),
  s({
    id: 'dacia-sandero', brand: 'Dacia', model: 'Sandero', years: '2012-2026', engine: '1.0 SCe / TCe / 1.5 dCi', region: 'french',
    oilViscosity: '5W-30 أو 10W-40', oilSpec: 'API SP · ACEA A3/B4', oilCapacityL: '3.5 – 4.5',
    oilFilter: 'OEM Dacia/Renault · Mann W 712/75', airFilter: 'OEM', fuelFilter: 'ديزل: OEM', cabinFilter: 'OEM',
    notes: 'سانديرو شائعة جداً في الجزائر',
  }),
  s({
    id: 'dacia-logan', brand: 'Dacia', model: 'Logan', years: '2012-2026', engine: '1.0 / 1.5 dCi', region: 'french',
    oilViscosity: '5W-30 أو 10W-40', oilSpec: 'API SP · ACEA A3/B4', oilCapacityL: '3.5 – 4.5',
    oilFilter: 'Mann W 712/75', airFilter: 'OEM', fuelFilter: 'OEM', cabinFilter: 'OEM',
  }),
  s({
    id: 'dacia-duster', brand: 'Dacia', model: 'Duster', years: '2010-2026', engine: '1.6 / 1.5 dCi / 1.3 TCe', region: 'french',
    oilViscosity: '5W-30', oilSpec: 'API SP · ACEA A3/B4 أو C3', oilCapacityL: '4.0 – 4.8',
    oilFilter: 'OEM Renault/Dacia · Mann', airFilter: 'OEM', fuelFilter: 'OEM', cabinFilter: 'OEM',
  }),

  // ═══════════ كوري ═══════════
  s({
    id: 'hyundai-tucson', brand: 'Hyundai', model: 'Tucson', years: '2015-2026', engine: '1.6 T-GDI / 2.0 / 2.0 CRDi', region: 'korean',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'API SP · ILSAC GF-6A · ACEA C2/C3', oilCapacityL: '4.0 – 5.0', oilIntervalKm: 10000,
    oilFilter: 'Hyundai 26300-35505 · Mann W 610/6', airFilter: 'Hyundai 28113-D3500', fuelFilter: 'حسب المحرك', cabinFilter: 'Hyundai 97133-D3000',
  }),
  s({
    id: 'hyundai-elantra', brand: 'Hyundai', model: 'Elantra / Avante', years: '2016-2026', engine: '1.6 / 2.0', region: 'korean',
    oilViscosity: '0W-20', oilSpec: 'API SP · ILSAC GF-6A', oilCapacityL: '3.8 – 4.2',
    oilFilter: 'Hyundai 26300-35505', airFilter: 'OEM Hyundai', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'hyundai-i10', brand: 'Hyundai', model: 'i10', years: '2014-2026', engine: '1.0 / 1.2', region: 'korean',
    oilViscosity: '5W-30', oilSpec: 'API SP · SN', oilCapacityL: '3.0 – 3.5',
    oilFilter: 'Hyundai 26300-02751', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'hyundai-i20', brand: 'Hyundai', model: 'i20', years: '2014-2026', engine: '1.2 / 1.0 T-GDI', region: 'korean',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'API SP', oilCapacityL: '3.3 – 3.8',
    oilFilter: 'OEM Hyundai · Mann', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'hyundai-santa-fe', brand: 'Hyundai', model: 'Santa Fe', years: '2018-2026', engine: '2.0 / 2.5 / 2.2 CRDi', region: 'korean',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'API SP · ACEA C3', oilCapacityL: '5.0 – 6.0',
    oilFilter: 'OEM Hyundai', airFilter: 'OEM', fuelFilter: 'OEM', cabinFilter: 'OEM',
  }),
  s({
    id: 'hyundai-creta', brand: 'Hyundai', model: 'Creta / ix25', years: '2015-2026', engine: '1.5 / 1.6', region: 'korean',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'API SP', oilCapacityL: '3.6 – 4.0',
    oilFilter: 'OEM Hyundai · Mann', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'kia-sportage', brand: 'Kia', model: 'Sportage', years: '2016-2026', engine: '1.6 T-GDI / 2.0 / 2.0 CRDi', region: 'korean',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'API SP · ILSAC GF-6A · ACEA C2', oilCapacityL: '4.0 – 5.0', oilIntervalKm: 10000,
    oilFilter: 'Kia 26300-35505 · Mann W 610/6', airFilter: 'OEM Kia', fuelFilter: 'حسب المحرك', cabinFilter: 'OEM Kia',
  }),
  s({
    id: 'kia-cerato', brand: 'Kia', model: 'Cerato / Forte', years: '2018-2026', engine: '1.6 / 2.0', region: 'korean',
    oilViscosity: '0W-20', oilSpec: 'API SP · ILSAC GF-6A', oilCapacityL: '3.8 – 4.2',
    oilFilter: 'Kia 26300-35505', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'kia-picanto', brand: 'Kia', model: 'Picanto', years: '2017-2026', engine: '1.0 / 1.2', region: 'korean',
    oilViscosity: '5W-30', oilSpec: 'API SP · SN', oilCapacityL: '3.0 – 3.5',
    oilFilter: 'OEM Kia', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'kia-rio', brand: 'Kia', model: 'Rio', years: '2017-2026', engine: '1.2 / 1.4', region: 'korean',
    oilViscosity: '0W-20 أو 5W-30', oilSpec: 'API SP', oilCapacityL: '3.3 – 3.8',
    oilFilter: 'OEM Kia · Mann', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
  s({
    id: 'kia-sorento', brand: 'Kia', model: 'Sorento', years: '2015-2026', engine: '2.2 CRDi / 2.5', region: 'korean',
    oilViscosity: '5W-30', oilSpec: 'API SP · ACEA C3', oilCapacityL: '5.5 – 6.5',
    oilFilter: 'OEM Kia', airFilter: 'OEM', fuelFilter: 'OEM', cabinFilter: 'OEM',
  }),
  s({
    id: 'kia-seltos', brand: 'Kia', model: 'Seltos', years: '2019-2026', engine: '1.5 / 1.6', region: 'korean',
    oilViscosity: '0W-20', oilSpec: 'API SP · ILSAC GF-6A', oilCapacityL: '3.6 – 4.0',
    oilFilter: 'OEM Kia · Mann', airFilter: 'OEM', fuelFilter: 'مدمج', cabinFilter: 'OEM',
  }),
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

export function getCatalogRegions(): { key: NonNullable<OilFilterSpec['region']>; label: string }[] {
  return [
    { key: 'chinese', label: 'صيني' },
    { key: 'japanese', label: 'ياباني' },
    { key: 'german', label: 'ألماني' },
    { key: 'french', label: 'فرنسي' },
    { key: 'korean', label: 'كوري' },
  ];
}

/** كتالوج افتراضي للعرض في المتجر الإلكتروني */

export interface CatalogCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  oldPrice?: number;
  mileage: number;
  color: string;
  condition: 'new' | 'under_3_years';
  status: 'available' | 'in_transit' | 'customs' | 'reserved';
  features: string[];
  badge?: string;
  shippingDate?: string;
  description: string;
  images?: string[];
  videoUrl?: string;
}

export interface StoreOffer {
  id: string;
  title: string;
  subtitle: string;
  discountLabel: string;
  carLabel: string;
  priceFrom: number;
  validUntil: string;
  active: boolean;
  highlight: string;
}

// صور تجريبية عامة (Unsplash) — تُستبدل بصورك من المخزون
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const DEFAULT_CATALOG: CatalogCar[] = [
  {
    id: 'cat-1',
    brand: 'Chery',
    model: 'Tiggo 8 Pro',
    year: 2025,
    price: 4850000,
    oldPrice: 5100000,
    mileage: 0,
    color: 'أبيض لؤلؤي',
    condition: 'new',
    status: 'available',
    features: ['7 مقاعد', 'بانورامك', 'ADAS', 'شاشة 12.3'],
    badge: 'عرض خاص',
    description: 'دفع رباعي عائلي، جاهز للتسليم من المخزون.',
    images: [img('photo-1492144534655-ae79c964c9d7'), img('photo-1503376780353-7e6692767b70')],
  },
  {
    id: 'cat-2',
    brand: 'Geely',
    model: 'Coolray',
    year: 2025,
    price: 3200000,
    mileage: 0,
    color: 'رمادي معدني',
    condition: 'new',
    status: 'available',
    features: ['توربو', 'سقف بانورامي', 'كاميرا 360'],
    badge: 'الأكثر طلباً',
    description: 'SUV مدمج رياضي مناسب للمدينة والطريق.',
    images: [img('photo-1549317661-bd32c8ce0db2')],
  },
  {
    id: 'cat-3',
    brand: 'BYD',
    model: 'Song Plus DM-i',
    year: 2025,
    price: 5200000,
    mileage: 0,
    color: 'أسود',
    condition: 'new',
    status: 'available',
    features: ['هجين', 'مدى طويل', 'شحن سريع'],
    badge: 'هجين',
    description: 'تقنية هجينة اقتصادية في استهلاك الوقود.',
    images: [img('photo-1552519507-da3b142c6e3d')],
  },
  {
    id: 'cat-4',
    brand: 'Haval',
    model: 'Jolion',
    year: 2024,
    price: 2950000,
    mileage: 12000,
    color: 'أزرق',
    condition: 'under_3_years',
    status: 'available',
    features: ['أقل من 3 سنوات', 'ضمان', 'صيانة دورية'],
    description: 'مستعملة بحالة ممتازة، استيراد حديث.',
    images: [img('photo-1606664515524-ed2f786a0bd6')],
  },
  {
    id: 'cat-5',
    brand: 'Changan',
    model: 'CS55 Plus',
    year: 2025,
    price: 3600000,
    mileage: 0,
    color: 'فضي',
    condition: 'new',
    status: 'in_transit',
    features: ['مشحونة', 'وصول قريب', 'حجز مسبق'],
    badge: 'في الطريق',
    shippingDate: '2026-09-20',
    description: 'تم الشحن من الصين — احجز الآن قبل الوصول.',
    images: [img('photo-1583121274602-3e282ef6259'), img('photo-1494976388531-d1058494cdd8')],
  },
  {
    id: 'cat-6',
    brand: 'MG',
    model: 'HS',
    year: 2025,
    price: 4100000,
    mileage: 0,
    color: 'أحمر',
    condition: 'new',
    status: 'in_transit',
    features: ['مشحونة', 'فاخرة', 'محرك 1.5T'],
    badge: 'مشحونة',
    shippingDate: '2026-09-28',
    description: 'دفعة جديدة على الطريق نحو ميناء الجزائر.',
    images: [img('photo-1511919884226-fd3cad34687')],
  },
  {
    id: 'cat-7',
    brand: 'JAC',
    model: 'JS6',
    year: 2025,
    price: 3450000,
    mileage: 0,
    color: 'أبيض',
    condition: 'new',
    status: 'customs',
    features: ['تحت الجمرك', 'إجراءات جارية'],
    badge: 'جمرك',
    description: 'وصلت الميناء وتحت إجراءات التخليص الجمركي.',
    images: [img('photo-1533473359331-0135ef1b58bf')],
  },
  {
    id: 'cat-8',
    brand: 'Great Wall',
    model: 'Poer',
    year: 2025,
    price: 4500000,
    mileage: 0,
    color: 'أسود',
    condition: 'new',
    status: 'available',
    features: ['بيك أب', 'دفع رباعي', 'حمولة عالية'],
    description: 'بيك أب للعمل والاستخدام الشاق.',
    images: [img('photo-1568605117036-5fe5e7bab0b7')],
  },
];

export const DEFAULT_OFFERS: StoreOffer[] = [
  {
    id: 'off-1',
    title: 'عرض الدخول المدرسي',
    subtitle: 'خصم على سيارات العائلة',
    discountLabel: 'وفر حتى 250.000 دج',
    carLabel: 'Chery Tiggo 8 Pro',
    priceFrom: 4850000,
    validUntil: '2026-09-30',
    active: true,
    highlight: 'تسليم فوري + هدايا',
  },
  {
    id: 'off-2',
    title: 'احجز قبل الوصول',
    subtitle: 'سيارات مشحونة بأسعار تشجيعية',
    discountLabel: 'عربون مخفّض',
    carLabel: 'Changan CS55 Plus / MG HS',
    priceFrom: 3600000,
    validUntil: '2026-10-15',
    active: true,
    highlight: 'أولوية الاستلام عند الوصول',
  },
  {
    id: 'off-3',
    title: 'عرض الهجين',
    subtitle: 'توفير في الوقود مع BYD',
    discountLabel: 'استشارة مجانية',
    carLabel: 'BYD Song Plus DM-i',
    priceFrom: 5200000,
    validUntil: '2026-10-01',
    active: true,
    highlight: 'تمويل ميسر حسب الاتفاق',
  },
];

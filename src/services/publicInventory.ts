import { storage, STORAGE_KEYS } from './storage';
import type { Vehicle } from '../types';
import type { CatalogCar } from '../data/storeCatalog';
import { DEFAULT_CATALOG } from '../data/storeCatalog';

/** تحويل سيارة المخزون إلى بطاقة عرض عامة */
export function vehicleToCatalog(v: Vehicle): CatalogCar {
  return {
    id: v.id,
    brand: v.brand,
    model: v.model,
    year: v.year,
    price: v.sellingPrice || 0,
    mileage: v.mileage || 0,
    color: v.color || '',
    condition: v.condition === 'new' ? 'new' : 'under_3_years',
    status:
      v.status === 'in_transit'
        ? 'in_transit'
        : v.status === 'customs'
        ? 'customs'
        : v.status === 'reserved'
        ? 'reserved'
        : 'available',
    features: [
      v.condition === 'new' ? 'جديدة' : 'أقل من 3 سنوات',
      v.color || '',
      v.vin ? `VIN …${v.vin.slice(-6)}` : '',
      v.containerNumber ? `حاوية ${v.containerNumber}` : '',
      v.status === 'in_transit' ? 'مشحونة' : '',
      v.status === 'available' ? 'تسليم فوري' : '',
    ].filter(Boolean),
    shippingDate: v.shippingDate,
    description:
      v.notes ||
      `${v.brand} ${v.model} ${v.year} — متوفرة لدى المكتب. تواصل للحجز والمعاينة.`,
    badge:
      v.status === 'in_transit'
        ? 'في الطريق'
        : v.status === 'customs'
        ? 'جمرك'
        : v.status === 'reserved'
        ? 'محجوزة'
        : 'متوفرة الآن',
    images: Array.isArray(v.images) ? v.images : [],
    videoUrl: v.videoUrl || '',
  };
}

/**
 * سيارات للعرض العام (هبوط + متجر):
 * من المخزون إن وُجدت غير مباعة، وإلا الكتالوج التجريبي.
 */
export function getPublicCars(): CatalogCar[] {
  const inventory = storage.get<Vehicle[]>(STORAGE_KEYS.INVENTORY) || [];
  const publicOnes = inventory.filter((v) => v.status !== 'sold');
  if (publicOnes.length > 0) {
    return publicOnes.map(vehicleToCatalog);
  }
  return DEFAULT_CATALOG;
}

/** حفظ طلب حجز/شراء من الزائر في نظام الحجوزات */
export function savePublicLead(input: {
  clientName: string;
  clientPhone: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleId?: string;
  notes?: string;
}): { ok: boolean; id?: string; error?: string } {
  const name = input.clientName.trim();
  const phone = input.clientPhone.trim();
  if (name.length < 2) return { ok: false, error: 'أدخل الاسم الكامل' };
  if (phone.replace(/\D/g, '').length < 9) return { ok: false, error: 'أدخل رقم هاتف صحيح' };

  const now = new Date().toISOString();
  const today = now.split('T')[0];
  const time = new Date().toTimeString().slice(0, 5);
  const id = crypto.randomUUID();

  const booking = {
    id,
    clientName: name,
    clientPhone: phone,
    type: 'consultation' as const,
    status: 'pending' as const,
    date: today,
    time,
    vehicleBrand: input.vehicleBrand || '',
    vehicleModel: input.vehicleModel || '',
    vehicleId: input.vehicleId || '',
    notes:
      input.notes ||
      `طلب من الموقع — اشتري الآن / احجز${
        input.vehicleBrand ? ` · ${input.vehicleBrand} ${input.vehicleModel || ''}` : ''
      }`,
    createdAt: now,
    updatedAt: now,
  };

  const list = storage.get<typeof booking[]>(STORAGE_KEYS.BOOKINGS) || [];
  storage.set(STORAGE_KEYS.BOOKINGS, [booking, ...list]);
  return { ok: true, id };
}

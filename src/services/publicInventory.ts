import { storage, STORAGE_KEYS } from './storage';
import type { Vehicle } from '../types';
import type { CatalogCar } from '../data/storeCatalog';
import { DEFAULT_CATALOG } from '../data/storeCatalog';
import { isPublicInventoryStatus } from '../utils/vehicleFinance';

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
 * من المخزون غير المباعة فقط. إن وُجد مخزون كله مباع → قائمة فارغة (لا كتالوج تجريبي مضلل).
 */
export function getPublicCars(): CatalogCar[] {
  const inventory = storage.get<Vehicle[]>(STORAGE_KEYS.INVENTORY) || [];
  const publicOnes = inventory.filter(
    (v) => v.status !== 'sold' && isPublicInventoryStatus(v.status)
  );
  if (publicOnes.length > 0) {
    return publicOnes.map(vehicleToCatalog);
  }
  if (inventory.length > 0) {
    return [];
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
  const id = crypto.randomUUID();

  const bookings = storage.get<any[]>(STORAGE_KEYS.BOOKINGS) || [];
  const booking = {
    id,
    clientName: name,
    clientPhone: phone,
    clientEmail: '',
    type: 'consultation',
    status: 'pending',
    date: today,
    time: '10:00',
    vehicleBrand: input.vehicleBrand || '',
    vehicleModel: input.vehicleModel || '',
    vehicleId: input.vehicleId || '',
    notes: input.notes || 'طلب من المتجر / صفحة الهبوط',
    createdAt: now,
    updatedAt: now,
  };
  storage.set(STORAGE_KEYS.BOOKINGS, [booking, ...bookings]);
  return { ok: true, id };
}

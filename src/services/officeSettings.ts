import { storage, STORAGE_KEYS } from './storage';

export interface OfficeSettings {
  officeName: string;
  phone: string;
  whatsapp: string;
  city: string;
  note: string;
}

export const DEFAULT_OFFICE: OfficeSettings = {
  officeName: 'مكتب استيراد السيارات الصينية',
  phone: '0562832628',
  whatsapp: '0673678501',
  city: 'الجزائر',
  note: 'الأسعار قابلة للتغيير حسب العرض والطلب والجمركة.',
};

export function getOfficeSettings(): OfficeSettings {
  const saved = storage.get<Partial<OfficeSettings>>(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_OFFICE, ...(saved || {}) };
}

export function saveOfficeSettings(data: Partial<OfficeSettings>): OfficeSettings {
  const next = { ...getOfficeSettings(), ...data };
  storage.set(STORAGE_KEYS.SETTINGS, next);
  return next;
}

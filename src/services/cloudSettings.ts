/** إعدادات الاتصال بـ Supabase — تُحفظ في المتصفح فقط */

export interface CloudSettings {
  enabled: boolean;
  /** مزامنة تلقائية: تنزيل عند الفتح + رفع بعد كل تعديل */
  autoSync: boolean;
  url: string;
  anonKey: string;
  lastPushAt: string | null;
  lastPullAt: string | null;
}

const KEY = 'crm_cloud_settings';

export const DEFAULT_CLOUD_SETTINGS: CloudSettings = {
  enabled: false,
  autoSync: true,
  url: '',
  anonKey: '',
  lastPushAt: null,
  lastPullAt: null,
};

export function getCloudSettings(): CloudSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_CLOUD_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<CloudSettings>;
    return { ...DEFAULT_CLOUD_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_CLOUD_SETTINGS };
  }
}

export function saveCloudSettings(settings: CloudSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function isCloudConfigured(settings?: CloudSettings): boolean {
  const s = settings || getCloudSettings();
  return !!(s.enabled && s.url.trim() && s.anonKey.trim());
}

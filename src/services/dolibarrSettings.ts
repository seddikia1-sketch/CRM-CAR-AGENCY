/** إعدادات ربط Dolibarr — تُحفظ محلياً */
export interface DolibarrSettings {
  enabled: boolean;
  baseUrl: string;
  apiKey: string;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
}

const KEY = 'crm_dolibarr_settings';

export const DEFAULT_DOLIBARR: DolibarrSettings = {
  enabled: false,
  baseUrl: '',
  apiKey: '',
  lastTestAt: null,
  lastTestOk: null,
};

export function getDolibarrSettings(): DolibarrSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_DOLIBARR };
    return { ...DEFAULT_DOLIBARR, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_DOLIBARR };
  }
}

export function saveDolibarrSettings(s: DolibarrSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function isDolibarrConfigured(s?: DolibarrSettings): boolean {
  const x = s || getDolibarrSettings();
  return !!(x.enabled && x.baseUrl.trim() && x.apiKey.trim());
}

/** اختبار اتصال REST API */
export async function testDolibarrConnection(): Promise<{ ok: boolean; message: string }> {
  const s = getDolibarrSettings();
  if (!isDolibarrConfigured(s)) {
    return { ok: false, message: 'أدخل رابط Dolibarr ومفتاح API وفعّل الربط' };
  }
  const base = s.baseUrl.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/index.php/status`, {
      headers: { DOLAPIKEY: s.apiKey.trim() },
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, message: `خطأ ${res.status}: ${text.slice(0, 120)}` };
    }
    saveDolibarrSettings({ ...s, lastTestAt: new Date().toISOString(), lastTestOk: true });
    return { ok: true, message: 'الاتصال بـ Dolibarr ناجح ✓' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    saveDolibarrSettings({ ...s, lastTestAt: new Date().toISOString(), lastTestOk: false });
    return { ok: false, message: msg + ' — تحقق من الرابط أو CORS على الخادم' };
  }
}

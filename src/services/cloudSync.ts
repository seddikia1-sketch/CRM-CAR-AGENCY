/**
 * مزامنة بيانات CRM مع Supabase (جدول crm_store)
 * كل مفتاح localStorage يُحفظ كصف: key + value(jsonb)
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { storage, STORAGE_KEYS } from './storage';
import { getCloudSettings, saveCloudSettings, isCloudConfigured } from './cloudSettings';

const TABLE = 'crm_store';

function getClient(): SupabaseClient | null {
  const s = getCloudSettings();
  if (!isCloudConfigured(s)) return null;
  return createClient(s.url.trim(), s.anonKey.trim(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type SyncResult = {
  ok: boolean;
  message: string;
  keys?: number;
};

/** رفع كل بيانات المكتب إلى السحابة */
export async function pushToCloud(): Promise<SyncResult> {
  const client = getClient();
  if (!client) {
    return { ok: false, message: 'فعّل السحابة وأدخل رابط ومفتاح Supabase أولاً' };
  }

  try {
    const rows: { key: string; value: unknown; updated_at: string }[] = [];
    const now = new Date().toISOString();

    Object.values(STORAGE_KEYS).forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw == null) return;
      try {
        rows.push({ key, value: JSON.parse(raw), updated_at: now });
      } catch {
        rows.push({ key, value: raw, updated_at: now });
      }
    });

    // إعدادات المكتب والـ AI والسحابة (بدون مفاتيح حساسة اختيارياً — نرفع المكتب فقط)
    const office = localStorage.getItem('crm_office_settings');
    if (office) {
      try {
        rows.push({ key: 'crm_office_settings', value: JSON.parse(office), updated_at: now });
      } catch { /* ignore */ }
    }

    if (rows.length === 0) {
      return { ok: false, message: 'لا توجد بيانات محلية للرفع' };
    }

    const { error } = await client.from(TABLE).upsert(rows, { onConflict: 'key' });
    if (error) {
      return { ok: false, message: error.message || 'فشل الرفع' };
    }

    const settings = getCloudSettings();
    saveCloudSettings({ ...settings, lastPushAt: now });
    return { ok: true, message: `تم رفع ${rows.length} مجموعة بيانات إلى السحابة`, keys: rows.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg };
  }
}

/** تنزيل البيانات من السحابة إلى هذا الجهاز */
export async function pullFromCloud(): Promise<SyncResult> {
  const client = getClient();
  if (!client) {
    return { ok: false, message: 'فعّل السحابة وأدخل رابط ومفتاح Supabase أولاً' };
  }

  try {
    const { data, error } = await client.from(TABLE).select('key, value');
    if (error) {
      return { ok: false, message: error.message || 'فشل التنزيل' };
    }
    if (!data || data.length === 0) {
      return { ok: false, message: 'السحابة فارغة — ارفع البيانات من جهاز فيه بيانات أولاً' };
    }

    let applied = 0;
    for (const row of data) {
      if (!row.key) continue;
      try {
        localStorage.setItem(row.key, JSON.stringify(row.value));
        applied += 1;
      } catch {
        /* quota */
      }
    }

    const settings = getCloudSettings();
    saveCloudSettings({ ...settings, lastPullAt: new Date().toISOString() });
    return {
      ok: true,
      message: `تم تنزيل ${applied} مجموعة. سيتم تحديث الصفحة.`,
      keys: applied,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg };
  }
}

/** اختبار الاتصال */
export async function testCloudConnection(): Promise<SyncResult> {
  const client = getClient();
  if (!client) {
    return { ok: false, message: 'أدخل الرابط والمفتاح وفعّل السحابة' };
  }
  try {
    const { error } = await client.from(TABLE).select('key').limit(1);
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: 'الاتصال ناجح ✓' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg };
  }
}

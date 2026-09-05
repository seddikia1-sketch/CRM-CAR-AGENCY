import React, { useState } from 'react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import {
  Download, Upload, Trash2, Store, Copy, Check, ExternalLink, FileSpreadsheet, Sparkles,
} from 'lucide-react';
import { storage, STORAGE_KEYS } from '../services/storage';
import { getOfficeSettings, saveOfficeSettings, type OfficeSettings } from '../services/officeSettings';
import { getAiSettings, saveAiSettings, type AiSettings, DEFAULT_AI_SETTINGS, isAiConfigured } from '../services/aiSettings';
import { downloadCsv, csvTimestamp } from '../utils/exportCsv';
import { vehicleTotalCost, vehicleProfit } from '../utils/vehicleFinance';
import { FUNNEL_STAGES, INVENTORY_STATUSES, PART_CATEGORIES } from '../utils/constants';
import type { Client, Vehicle, SparePart } from '../types';

const STORE_URL = `${window.location.origin}${window.location.pathname}#/store`;
const LAST_BACKUP_KEY = 'crm_last_backup_at';

/** إعدادات جاهزة لمزودي AI الشائعين — محدّثة سبتمبر 2026 */
const AI_PRESETS = [
  {
    id: 'groq',
    name: 'Groq (موصى به)',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant',
    visionModel: 'llama-3.1-8b-instant',
    note: 'سريع ومجاني تقريباً — يعمل حالياً بدون مشاكل',
    keyUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'groq-strong',
    name: 'Groq قوي',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'openai/gpt-oss-20b',
    visionModel: 'openai/gpt-oss-20b',
    note: 'أقوى من 8B وما زال رخيص',
    keyUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    visionModel: 'deepseek-chat',
    note: 'قوي ورخيص جداً',
    keyUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    visionModel: 'gpt-4o-mini',
    note: 'الأكثر دقة (مدفوع)',
    keyUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'google/gemini-2.0-flash-001',
    visionModel: 'google/gemini-2.0-flash-001',
    note: 'يدعم عشرات النماذج',
    keyUrl: 'https://openrouter.ai/keys',
  },
] as const;

function stageLabel(key: string) {
  return FUNNEL_STAGES.find((s) => s.key === key)?.label || key;
}
function statusLabel(key: string) {
  return INVENTORY_STATUSES.find((s) => s.key === key)?.label || key;
}
function catLabel(key: string) {
  return PART_CATEGORIES.find((c) => c.key === key)?.label || key;
}

export const Settings: React.FC = () => {
  const [office, setOffice] = useState<OfficeSettings>(getOfficeSettings());
  const [ai, setAi] = useState<AiSettings>(getAiSettings());
  const [saved, setSaved] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);
  const [aiError, setAiError] = useState('');
  const [copied, setCopied] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(() => localStorage.getItem(LAST_BACKUP_KEY));

  const markBackup = () => {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_BACKUP_KEY, now);
    setLastBackup(now);
  };

  const handleExport = () => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    markBackup();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storage.importData(content)) {
        markBackup();
        alert('تم استيراد البيانات بنجاح! سيتم إعادة تحميل الصفحة.');
        window.location.reload();
      } else {
        alert('خطأ في استيراد البيانات. الملف غير صالح.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    if (window.confirm('تحذير: سيتم حذف جميع بيانات الـ CRM. هل تريد المتابعة؟')) {
      if (window.confirm('هل أنت متأكد تماماً؟ صدّر نسخة احتياطية أولاً إن أمكن.')) {
        storage.clearAll();
        localStorage.removeItem(LAST_BACKUP_KEY);
        window.location.reload();
      }
    }
  };

  const exportClientsCsv = () => {
    const clients = storage.get<Client[]>(STORAGE_KEYS.CLIENTS) || [];
    downloadCsv(
      `عملاء_${csvTimestamp()}.csv`,
      ['الاسم', 'الهاتف', 'البريد', 'المرحلة', 'المصدر', 'الاهتمام', 'الماركة', 'الموديل', 'آخر تواصل', 'ملاحظات'],
      clients.map((c) => [
        c.name,
        c.phone,
        c.email || '',
        stageLabel(c.funnelStage),
        c.source || '',
        c.vehicleInterest || '',
        c.brand || '',
        c.model || '',
        c.lastContactAt ? new Date(c.lastContactAt).toLocaleDateString('ar-DZ') : '',
        c.notes || '',
      ])
    );
  };

  const exportInventoryCsv = () => {
    const vehicles = storage.get<Vehicle[]>(STORAGE_KEYS.INVENTORY) || [];
    downloadCsv(
      `مخزون_سيارات_${csvTimestamp()}.csv`,
      [
        'الماركة', 'الموديل', 'السنة', 'اللون', 'VIN', 'الحالة', 'سعر الاستيراد',
        'شحن', 'جمرك', 'إصلاح', 'أخرى', 'التكلفة الإجمالية', 'سعر البيع', 'الربح',
        'العميل', 'تاريخ البيع',
      ],
      vehicles.map((v) => [
        v.brand,
        v.model,
        v.year,
        v.color || '',
        v.vin || '',
        statusLabel(v.status),
        v.importPrice || 0,
        v.shippingCost || 0,
        v.customsCost || 0,
        v.repairCost || 0,
        v.otherCosts || 0,
        vehicleTotalCost(v),
        v.sellingPrice || 0,
        v.status === 'sold' ? vehicleProfit(v) : '',
        v.soldToClientName || '',
        v.soldAt ? new Date(v.soldAt).toLocaleDateString('ar-DZ') : '',
      ])
    );
  };

  const exportPartsCsv = () => {
    const parts = storage.get<SparePart[]>(STORAGE_KEYS.SPARE_PARTS) || [];
    downloadCsv(
      `قطع_غيار_${csvTimestamp()}.csv`,
      ['الاسم', 'رقم القطعة', 'الماركة', 'التصنيف', 'الكمية', 'الحد الأدنى', 'تكلفة', 'سعر البيع', 'ملاحظات'],
      parts.map((p) => [
        p.name,
        p.partNumber || '',
        p.brand || '',
        catLabel(p.category),
        p.quantity,
        p.minStock,
        p.costPrice || 0,
        p.sellingPrice || 0,
        p.notes || '',
      ])
    );
  };

  const exportLowStockCsv = () => {
    const parts = (storage.get<SparePart[]>(STORAGE_KEYS.SPARE_PARTS) || []).filter(
      (p) => p.quantity <= p.minStock
    );
    downloadCsv(
      `نقص_قطع_${csvTimestamp()}.csv`,
      ['الاسم', 'رقم القطعة', 'الماركة', 'متوفر', 'الحد الأدنى', 'اقترح الطلب', 'تكلفة الوحدة'],
      parts.map((p) => {
        const need = Math.max((p.minStock || 2) * 3 - (p.quantity || 0), 1);
        return [
          p.name,
          p.partNumber || '',
          p.brand || '',
          p.quantity,
          p.minStock,
          need,
          p.costPrice || 0,
        ];
      })
    );
  };

  const saveOffice = () => {
    saveOfficeSettings(office);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const applyPreset = (preset: typeof AI_PRESETS[number]) => {
    setAi((prev) => ({
      ...prev,
      baseUrl: preset.baseUrl,
      model: preset.model,
      visionModel: preset.visionModel,
    }));
    setAiError('');
    setAiSaved(false);
  };

  const saveAi = () => {
    setAiError('');
    const key = ai.apiKey.trim();
    if (!key) {
      setAiError('أدخل مفتاح API أولاً');
      return;
    }

    const toSave: AiSettings = {
      ...ai,
      apiKey: key,
      enabled: true,
      baseUrl: ai.baseUrl.trim() || DEFAULT_AI_SETTINGS.baseUrl,
      model: ai.model.trim() || DEFAULT_AI_SETTINGS.model,
      visionModel: ai.visionModel.trim() || DEFAULT_AI_SETTINGS.visionModel,
    };

    try {
      saveAiSettings(toSave);
      setAi(toSave);

      const check = getAiSettings();
      if (isAiConfigured(check)) {
        setAiSaved(true);
        setAiError('');
        setTimeout(() => setAiSaved(false), 3000);
      } else {
        setAiError('تم الحفظ لكن التحقق فشل. جرب مسح بيانات الموقع ثم أعد المحاولة.');
      }
    } catch (err) {
      console.error(err);
      setAiError('فشل الحفظ في المتصفح. جرب متصفح آخر أو أوقف وضع التصفح الخاص.');
    }
  };

  const copyStoreLink = async () => {
    try {
      await navigator.clipboard.writeText(STORE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt('انسخ رابط المتجر:', STORE_URL);
    }
  };

  const lastBackupLabel = lastBackup
    ? new Date(lastBackup).toLocaleString('ar-DZ')
    : 'لم يتم بعد';

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex' }}>
      <div className="page-header">
        <h1 className="page-title">الإعدادات</h1>
        <p className="page-description">بيانات المكتب، خدمة AI للقطع، المتجر، والنسخ الاحتياطي.</p>
      </div>

      <div className="glass-card" style={{ padding: 'var(--spacing-lg)', border: '1px solid rgba(124,108,240,0.25)' }}>
        <h3 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} color="#a89bff" /> خدمة الذكاء الاصطناعي — قطع الغيار
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 14, lineHeight: 1.6 }}>
          تتيح التعرف على القطعة لأي سيارة (مخزون، مباعة، أو ماركة خارجية) وتجهيز طلب للمورد الصيني.
          المفتاح يُحفظ في <strong>هذا المتصفح فقط</strong>.
        </p>

        {/* أزرار اختيار المزود */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
            اختر المزود بسرعة:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {AI_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: ai.model === p.model ? '2px solid #7c6cf0' : '1px solid var(--border-color)',
                  background: ai.model === p.model ? 'rgba(124,108,240,0.15)' : 'rgba(255,255,255,0.04)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
            {AI_PRESETS.find((p) => p.model === ai.model)?.note || 'اختر مزوداً ثم أدخل مفتاحه'}
            {' · '}
            <a
              href={AI_PRESETS.find((p) => p.model === ai.model)?.keyUrl || 'https://console.groq.com/keys'}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#a89bff' }}
            >
              احصل على المفتاح من هنا
            </a>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={ai.enabled}
            onChange={(e) => setAi({ ...ai, enabled: e.target.checked })}
          />
          <span style={{ fontWeight: 700 }}>تفعيل خدمة AI</span>
        </label>

        <div className="flex-col gap-md" style={{ display: 'flex', maxWidth: 560 }}>
          <Input
            label="مفتاح API"
            type="password"
            value={ai.apiKey}
            onChange={(e) => setAi({ ...ai, apiKey: e.target.value })}
            placeholder="الصق المفتاح هنا"
            dir="ltr"
            style={{ direction: 'ltr', textAlign: 'left' } as React.CSSProperties}
          />
          <Input
            label="عنوان الواجهة (Base URL)"
            value={ai.baseUrl}
            onChange={(e) => setAi({ ...ai, baseUrl: e.target.value })}
            placeholder="https://api.groq.com/openai/v1"
            dir="ltr"
            style={{ direction: 'ltr', textAlign: 'left' } as React.CSSProperties}
          />
          <Input
            label="نموذج النص"
            value={ai.model}
            onChange={(e) => setAi({ ...ai, model: e.target.value })}
            placeholder="llama-3.1-8b-instant"
            dir="ltr"
            style={{ direction: 'ltr', textAlign: 'left' } as React.CSSProperties}
          />
          <Input
            label="نموذج الرؤية (للصور)"
            value={ai.visionModel}
            onChange={(e) => setAi({ ...ai, visionModel: e.target.value })}
            placeholder="llama-3.1-8b-instant"
            dir="ltr"
            style={{ direction: 'ltr', textAlign: 'left' } as React.CSSProperties}
          />

          {aiError && (
            <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.35)', fontSize: '0.85rem', color: '#fca5a5' }}>
              {aiError}
            </div>
          )}

          <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={saveAi}>
              {aiSaved ? '✓ تم الحفظ والتفعيل بنجاح' : 'حفظ إعدادات AI'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setAi({ ...DEFAULT_AI_SETTINGS });
                saveAiSettings(DEFAULT_AI_SETTINGS);
                setAiSaved(false);
                setAiError('');
              }}
            >
              إعادة الافتراضي
            </Button>
          </div>

          {aiSaved && (
            <p style={{ color: '#4ade80', fontSize: '0.9rem', marginTop: 4 }}>
              ✅ المفتاح محفوظ ومفعّل. ارجع لـ «طلب قطعة ذكي» وجرب التعرف بالـ AI.
            </p>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ marginBottom: '12px' }}>بيانات المكتب (تظهر في المتجر)</h3>
        <div className="flex-col gap-md" style={{ display: 'flex', maxWidth: 520 }}>
          <Input label="اسم المكتب" value={office.officeName} onChange={(e) => setOffice({ ...office, officeName: e.target.value })} />
          <div className="flex gap-md">
            <Input label="هاتف" value={office.phone} onChange={(e) => setOffice({ ...office, phone: e.target.value })} dir="ltr" style={{ direction: 'ltr', textAlign: 'left' } as React.CSSProperties} />
            <Input label="واتساب" value={office.whatsapp} onChange={(e) => setOffice({ ...office, whatsapp: e.target.value })} dir="ltr" style={{ direction: 'ltr', textAlign: 'left' } as React.CSSProperties} />
          </div>
          <Input label="المدينة" value={office.city} onChange={(e) => setOffice({ ...office, city: e.target.value })} />
          <Input label="ملاحظة أسفل المتجر" value={office.note} onChange={(e) => setOffice({ ...office, note: e.target.value })} />
          <Button variant="primary" onClick={saveOffice}>
            {saved ? '✓ تم الحفظ' : 'حفظ بيانات المكتب'}
          </Button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ marginBottom: '8px' }}>المتجر الإلكتروني</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 12 }}>
          شارك هذا الرابط مع الزبائن لعرض السيارات والعروض.
        </p>
        <div
          dir="ltr"
          style={{
            direction: 'ltr',
            textAlign: 'left',
            padding: '10px 12px',
            borderRadius: 10,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem',
            marginBottom: 12,
            wordBreak: 'break-all',
          }}
        >
          {STORE_URL}
        </div>
        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          <Button variant="secondary" leftIcon={copied ? <Check size={18} /> : <Copy size={18} />} onClick={copyStoreLink}>
            {copied ? 'تم النسخ' : 'نسخ رابط المتجر'}
          </Button>
          <a href={STORE_URL} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <Button variant="primary" leftIcon={<ExternalLink size={18} />}>
              فتح المتجر
            </Button>
          </a>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ marginBottom: 8 }}>تصدير CSV (Excel)</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 14 }}>
          ملفات تفتح مباشرة في Excel أو Google Sheets.
        </p>
        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          <Button variant="secondary" leftIcon={<FileSpreadsheet size={18} />} onClick={exportClientsCsv}>تصدير العملاء</Button>
          <Button variant="secondary" leftIcon={<FileSpreadsheet size={18} />} onClick={exportInventoryCsv}>تصدير المخزون</Button>
          <Button variant="secondary" leftIcon={<FileSpreadsheet size={18} />} onClick={exportPartsCsv}>تصدير قطع الغيار</Button>
          <Button variant="secondary" leftIcon={<FileSpreadsheet size={18} />} onClick={exportLowStockCsv}>تصدير النقص فقط</Button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>نسخ احتياطي كامل (JSON)</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: '0.875rem' }}>
          البيانات محفوظة في هذا المتصفح فقط. صدّر نسخة قبل تغيير الجهاز.
        </p>
        <p style={{ fontSize: '0.85rem', marginBottom: 14 }}>
          آخر نسخة احتياطية: <strong>{lastBackupLabel}</strong>
        </p>
        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          <Button variant="secondary" leftIcon={<Download size={18} />} onClick={handleExport}>تصدير نسخة احتياطية</Button>
          <div style={{ position: 'relative' }}>
            <Button variant="secondary" leftIcon={<Upload size={18} />} onClick={() => document.getElementById('import-file')?.click()}>
              استيراد نسخة احتياطية
            </Button>
            <input type="file" id="import-file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          </div>
          <Button variant="danger" leftIcon={<Trash2 size={18} />} onClick={handleClear}>حذف جميع البيانات</Button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--spacing-lg)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Store size={16} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
        نصيحة: مفتاح AI لا يُصدَّر ضمن النسخة الاحتياطية JSON لأسباب أمنية — احفظه في مكان آمن.
      </div>
    </div>
  );
};

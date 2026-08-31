import React, { useState } from 'react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Download, Upload, Trash2, Store, Copy, Check, ExternalLink } from 'lucide-react';
import { storage } from '../services/storage';
import { getOfficeSettings, saveOfficeSettings, type OfficeSettings } from '../services/officeSettings';

const STORE_URL = `${window.location.origin}${window.location.pathname}#/store`;

export const Settings: React.FC = () => {
  const [office, setOffice] = useState<OfficeSettings>(getOfficeSettings());
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

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
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storage.importData(content)) {
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
      if (window.confirm('هل أنت متأكد تماماً؟')) {
        storage.clearAll();
        window.location.reload();
      }
    }
  };

  const saveOffice = () => {
    saveOfficeSettings(office);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex' }}>
      <div className="page-header">
        <h1 className="page-title">الإعدادات</h1>
        <p className="page-description">بيانات المكتب، رابط المتجر، والنسخ الاحتياطي.</p>
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
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>إدارة البيانات</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', fontSize: '0.875rem' }}>
          البيانات محفوظة في هذا المتصفح فقط. صدّر نسخة قبل تغيير الجهاز (هاتف ↔ آيباد).
        </p>
        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          <Button variant="secondary" leftIcon={<Download size={18} />} onClick={handleExport}>
            تصدير نسخة احتياطية
          </Button>
          <div style={{ position: 'relative' }}>
            <Button variant="secondary" leftIcon={<Upload size={18} />} onClick={() => document.getElementById('import-file')?.click()}>
              استيراد نسخة احتياطية
            </Button>
            <input type="file" id="import-file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          </div>
          <Button variant="danger" leftIcon={<Trash2 size={18} />} onClick={handleClear}>
            حذف جميع البيانات
          </Button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 'var(--spacing-lg)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <Store size={16} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
        نصيحة: أضف السيارات من «المخزون» بحالة «متاحة» أو «في الطريق» لتظهر في المتجر على نفس الجهاز.
      </div>
    </div>
  );
};

import React from 'react';
import { Button } from '../components/UI/Button';
import { Download, Upload, Trash2 } from 'lucide-react';
import { storage } from '../services/storage';

export const Settings: React.FC = () => {
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
    if (window.confirm('تحذير: سيتم حذف جميع بيانات الـ CRM (العملاء، النشاطات، إلخ). لا يمكن التراجع عن هذا الإجراء. هل تريد المتابعة؟')) {
      if (window.confirm('هل أنت متأكد تماماً؟')) {
        storage.clearAll();
        window.location.reload();
      }
    }
  };

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex' }}>
      <div className="page-header">
        <h1 className="page-title">الإعدادات</h1>
        <p className="page-description">ضبط التفضيلات وإدارة بيانات نظام الـ CRM.</p>
      </div>

      <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>إدارة البيانات</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', fontSize: '0.875rem' }}>
          بما أن البيانات تُحفظ في المتصفح، يُفضل عمل نسخ احتياطية بشكل دوري.
        </p>

        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          <Button variant="secondary" leftIcon={<Download size={18} />} onClick={handleExport}>
            تصدير نسخة احتياطية
          </Button>

          <div style={{ position: 'relative' }}>
            <Button variant="secondary" leftIcon={<Upload size={18} />} onClick={() => document.getElementById('import-file')?.click()}>
              استيراد نسخة احتياطية
            </Button>
            <input 
              type="file" 
              id="import-file" 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={handleImport}
            />
          </div>

          <Button variant="danger" leftIcon={<Trash2 size={18} />} onClick={handleClear}>
            حذف جميع البيانات
          </Button>
        </div>
      </div>
    </div>
  );
};

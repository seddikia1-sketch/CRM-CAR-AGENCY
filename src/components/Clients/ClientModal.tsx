import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { FunnelStage, LeadSource, VehicleCondition } from '../../types';
import type { ClientFormData } from '../../types';
import { FUNNEL_STAGES, LEAD_SOURCES, VEHICLE_CONDITIONS, CHINESE_BRANDS } from '../../utils/constants';
import { phoneMask } from '../../utils/formatters';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClientFormData) => void | Promise<void>;
  initialData?: Partial<ClientFormData>;
  title?: string;
}

const defaultData: ClientFormData = {
  name: '',
  phone: '',
  email: '',
  vehicleInterest: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  mileage: 0,
  condition: VehicleCondition.NEW,
  shippingDate: '',
  containerNumber: '',
  customsStatus: '',
  importPrice: 0,
  estimatedValue: 0,
  funnelStage: FunnelStage.FIRST_CONTACT,
  source: LeadSource.WHATSAPP,
  notes: '',
};

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = 'عميل جديد',
}) => {
  const [formData, setFormData] = useState<ClientFormData>(defaultData);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData ? { ...defaultData, ...initialData } : defaultData);
      setFormError(null);
      setSaving(false);
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, [name]: phoneMask(value) }));
    } else if (['estimatedValue', 'importPrice', 'year', 'mileage'].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('يرجى إدخال اسم العميل');
      return;
    }
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 9) {
      setFormError('يرجى إدخال رقم هاتف صحيح (مثال: 0555123456)');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch {
      setFormError('حدث خطأ أثناء الحفظ. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="720px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>إلغاء</Button>
          <Button variant="primary" onClick={() => handleSubmit()} disabled={saving}>
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex-col gap-md" style={{ display: 'flex' }}>
        {formError && (
          <div style={{
            background: 'rgba(225, 112, 85, 0.12)',
            border: '1px solid var(--accent-danger)',
            color: 'var(--accent-danger)',
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: '0.875rem',
          }}>
            {formError}
          </div>
        )}

        <div className="flex gap-md">
          <Input
            label="الاسم الكامل *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="مثال: أحمد بن علي"
          />
          <Input
            label="واتساب / الهاتف *"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            dir="ltr"
            style={{ direction: 'ltr', textAlign: 'left', unicodeBidi: 'isolate' } as React.CSSProperties}
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="0555 12 34 56"
          />
        </div>

        <div className="flex gap-md">
          <Input
            label="البريد الإلكتروني"
            name="email"
            type="email"
            dir="ltr"
            style={{ direction: 'ltr', textAlign: 'left' } as React.CSSProperties}
            value={formData.email}
            onChange={handleChange}
            placeholder="ahmed@email.com"
          />
          <Input
            label="السيارة المطلوبة (ملخص)"
            name="vehicleInterest"
            value={formData.vehicleInterest}
            onChange={handleChange}
            placeholder="مثال: Chery Tiggo 8 Pro 2024"
          />
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
          <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>بيانات السيارة الصينية</p>

          <div className="flex gap-md">
            <div className="input-wrapper" style={{ flex: 1 }}>
              <label className="input-label">الماركة</label>
              <select name="brand" className="input-field" value={formData.brand} onChange={handleChange}>
                <option value="">اختر الماركة</option>
                {CHINESE_BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <Input label="الموديل" name="model" value={formData.model} onChange={handleChange} placeholder="Tiggo 8 Pro" />
          </div>

          <div className="flex gap-md" style={{ marginTop: '12px' }}>
            <Input label="سنة الصنع" name="year" type="number" value={formData.year || ''} onChange={handleChange} placeholder="2024" />
            <Input label="الكيلومترات" name="mileage" type="number" value={formData.mileage || ''} onChange={handleChange} placeholder="0" />
            <div className="input-wrapper" style={{ flex: 1 }}>
              <label className="input-label">الحالة</label>
              <select name="condition" className="input-field" value={formData.condition} onChange={handleChange}>
                {VEHICLE_CONDITIONS.map((c) => (
                  <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
          <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>بيانات الاستيراد والشحن</p>

          <div className="flex gap-md">
            <Input label="تاريخ الشحن المتوقع" name="shippingDate" type="date" value={formData.shippingDate} onChange={handleChange} />
            <Input label="رقم الحاوية" name="containerNumber" value={formData.containerNumber} onChange={handleChange} placeholder="MSCU1234567" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' } as React.CSSProperties} />
          </div>

          <div className="flex gap-md" style={{ marginTop: '12px' }}>
            <Input label="حالة الجمرك" name="customsStatus" value={formData.customsStatus} onChange={handleChange} placeholder="في الطريق / تحت التخليص / تم الإفراج" />
            <Input label="سعر الاستيراد (دج)" name="importPrice" type="number" value={formData.importPrice || ''} onChange={handleChange} placeholder="0" />
            <Input label="سعر البيع المتوقع (دج)" name="estimatedValue" type="number" value={formData.estimatedValue || ''} onChange={handleChange} placeholder="0" />
          </div>
        </div>

        <div className="flex gap-md" style={{ marginTop: '8px' }}>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <label className="input-label">مرحلة البيع</label>
            <select name="funnelStage" className="input-field" value={formData.funnelStage} onChange={handleChange}>
              {FUNNEL_STAGES.map((stage) => (
                <option key={stage.key} value={stage.key}>{stage.emoji} {stage.label}</option>
              ))}
            </select>
          </div>

          <div className="input-wrapper" style={{ flex: 1 }}>
            <label className="input-label">مصدر العميل</label>
            <select name="source" className="input-field" value={formData.source} onChange={handleChange}>
              {LEAD_SOURCES.map((source) => (
                <option key={source.key} value={source.key}>{source.emoji} {source.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-wrapper">
          <label className="input-label">ملاحظات</label>
          <textarea
            name="notes"
            className="input-field"
            style={{ minHeight: '90px', resize: 'vertical' }}
            value={formData.notes}
            onChange={handleChange}
            placeholder="تفاصيل إضافية عن العميل أو السيارة أو التفاوض..."
          />
        </div>
      </form>
    </Modal>
  );
};

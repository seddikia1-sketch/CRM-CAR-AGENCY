import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { VehicleCondition, InventoryStatus } from '../../types';
import type { VehicleFormData } from '../../types';
import { VEHICLE_CONDITIONS, INVENTORY_STATUSES, CHINESE_BRANDS } from '../../utils/constants';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VehicleFormData) => void;
  initialData?: Partial<VehicleFormData>;
  title?: string;
}

const defaultData: VehicleFormData = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  mileage: 0,
  condition: VehicleCondition.NEW,
  color: '',
  vin: '',
  containerNumber: '',
  shippingDate: '',
  arrivalDate: '',
  customsStatus: '',
  importPrice: 0,
  sellingPrice: 0,
  status: InventoryStatus.AVAILABLE,
  notes: '',
};

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = 'إضافة سيارة للمخزون',
}) => {
  const [formData, setFormData] = useState<VehicleFormData>(defaultData);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData ? { ...defaultData, ...initialData } : defaultData);
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['year', 'mileage', 'importPrice', 'sellingPrice'].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="720px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button variant="primary" onClick={handleSubmit}>حفظ</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex-col gap-md" style={{ display: 'flex' }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>بيانات السيارة</p>
        </div>

        <div className="flex gap-md">
          <div className="input-wrapper" style={{ flex: 1 }}>
            <label className="input-label">الماركة *</label>
            <select name="brand" className="input-field" value={formData.brand} onChange={handleChange} required>
              <option value="">اختر الماركة</option>
              {CHINESE_BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <Input label="الموديل *" name="model" value={formData.model} onChange={handleChange} required placeholder="Tiggo 8 Pro" />
        </div>

        <div className="flex gap-md">
          <Input label="سنة الصنع" name="year" type="number" value={formData.year || ''} onChange={handleChange} />
          <Input label="الكيلومترات" name="mileage" type="number" value={formData.mileage || ''} onChange={handleChange} />
          <div className="input-wrapper" style={{ flex: 1 }}>
            <label className="input-label">الحالة</label>
            <select name="condition" className="input-field" value={formData.condition} onChange={handleChange}>
              {VEHICLE_CONDITIONS.map((c) => (
                <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-md">
          <Input label="اللون" name="color" value={formData.color} onChange={handleChange} placeholder="أبيض / أسود..." />
          <Input label="رقم الهيكل (VIN)" name="vin" value={formData.vin} onChange={handleChange} placeholder="LSGXXXXXXXXXXXX" />
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
          <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>الشحن والجمرك</p>
          <div className="flex gap-md">
            <Input label="رقم الحاوية" name="containerNumber" value={formData.containerNumber} onChange={handleChange} />
            <Input label="تاريخ الشحن" name="shippingDate" type="date" value={formData.shippingDate} onChange={handleChange} />
            <Input label="تاريخ الوصول" name="arrivalDate" type="date" value={formData.arrivalDate} onChange={handleChange} />
          </div>
          <div className="flex gap-md" style={{ marginTop: '12px' }}>
            <Input label="حالة الجمرك" name="customsStatus" value={formData.customsStatus} onChange={handleChange} placeholder="تم الإفراج / تحت التخليص" />
            <div className="input-wrapper" style={{ flex: 1 }}>
              <label className="input-label">حالة المخزون</label>
              <select name="status" className="input-field" value={formData.status} onChange={handleChange}>
                {INVENTORY_STATUSES.map((s) => (
                  <option key={s.key} value={s.key}>{s.emoji} {s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
          <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>الأسعار</p>
          <div className="flex gap-md">
            <Input label="سعر الاستيراد (دج)" name="importPrice" type="number" value={formData.importPrice || ''} onChange={handleChange} />
            <Input label="سعر البيع (دج)" name="sellingPrice" type="number" value={formData.sellingPrice || ''} onChange={handleChange} />
          </div>
        </div>

        <div className="input-wrapper">
          <label className="input-label">ملاحظات</label>
          <textarea
            name="notes"
            className="input-field"
            style={{ minHeight: '80px', resize: 'vertical' }}
            value={formData.notes}
            onChange={handleChange}
            placeholder="ملاحظات إضافية عن السيارة..."
          />
        </div>
      </form>
    </Modal>
  );
};

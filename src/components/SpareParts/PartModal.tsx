import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { PartCategory } from '../../types';
import type { SparePartFormData } from '../../types';
import { PART_CATEGORIES, CHINESE_BRANDS } from '../../utils/constants';

interface PartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SparePartFormData) => void;
  initialData?: Partial<SparePartFormData>;
  title?: string;
}

const defaultData: SparePartFormData = {
  name: '',
  partNumber: '',
  brand: '',
  category: PartCategory.OTHER,
  quantity: 0,
  costPrice: 0,
  sellingPrice: 0,
  minStock: 2,
  notes: '',
};

export const PartModal: React.FC<PartModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = 'إضافة قطعة غيار',
}) => {
  const [formData, setFormData] = useState<SparePartFormData>(defaultData);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData ? { ...defaultData, ...initialData } : defaultData);
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['quantity', 'costPrice', 'sellingPrice', 'minStock'].includes(name)) {
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
      maxWidth="600px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button variant="primary" onClick={handleSubmit}>حفظ</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex-col gap-md" style={{ display: 'flex' }}>
        <div className="flex gap-md">
          <Input label="اسم القطعة *" name="name" value={formData.name} onChange={handleChange} required placeholder="فلتر زيت / بطانية فرامل..." />
          <Input label="رقم القطعة" name="partNumber" value={formData.partNumber} onChange={handleChange} placeholder="OEM / Aftermarket" />
        </div>

        <div className="flex gap-md">
          <div className="input-wrapper" style={{ flex: 1 }}>
            <label className="input-label">الماركة المتوافقة</label>
            <select name="brand" className="input-field" value={formData.brand} onChange={handleChange}>
              <option value="">عام / كل الماركات</option>
              {CHINESE_BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <label className="input-label">التصنيف</label>
            <select name="category" className="input-field" value={formData.category} onChange={handleChange}>
              {PART_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-md">
          <Input label="الكمية المتوفرة" name="quantity" type="number" value={formData.quantity || ''} onChange={handleChange} />
          <Input label="حد التنبيه (أقل كمية)" name="minStock" type="number" value={formData.minStock || ''} onChange={handleChange} />
        </div>

        <div className="flex gap-md">
          <Input label="سعر التكلفة (دج)" name="costPrice" type="number" value={formData.costPrice || ''} onChange={handleChange} />
          <Input label="سعر البيع (دج)" name="sellingPrice" type="number" value={formData.sellingPrice || ''} onChange={handleChange} />
        </div>

        <div className="input-wrapper">
          <label className="input-label">ملاحظات</label>
          <textarea
            name="notes"
            className="input-field"
            style={{ minHeight: '70px', resize: 'vertical' }}
            value={formData.notes}
            onChange={handleChange}
            placeholder="ملاحظات إضافية..."
          />
        </div>
      </form>
    </Modal>
  );
};

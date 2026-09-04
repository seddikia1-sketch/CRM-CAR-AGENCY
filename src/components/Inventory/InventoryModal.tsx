import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { VehicleCondition, InventoryStatus } from '../../types';
import type { VehicleFormData } from '../../types';
import { VEHICLE_CONDITIONS, INVENTORY_STATUSES, CHINESE_BRANDS } from '../../utils/constants';
import { readFilesAsDataUrls } from '../../utils/media';
import { ImagePlus, Trash2 } from 'lucide-react';

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
  shippingCost: 0,
  customsCost: 0,
  repairCost: 0,
  otherCosts: 0,
  sellingPrice: 0,
  status: InventoryStatus.AVAILABLE,
  notes: '',
  images: [],
  videoUrl: '',
};

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = 'إضافة سيارة للمخزون',
}) => {
  const [formData, setFormData] = useState<VehicleFormData>(defaultData);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...defaultData,
        ...initialData,
        shippingCost: initialData?.shippingCost || 0,
        customsCost: initialData?.customsCost || 0,
        repairCost: initialData?.repairCost || 0,
        otherCosts: initialData?.otherCosts || 0,
        images: initialData?.images || [],
        videoUrl: initialData?.videoUrl || '',
      });
      setImageUrlInput('');
      setUploadError(null);
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['year', 'mileage', 'importPrice', 'sellingPrice', 'shippingCost', 'customsCost', 'repairCost', 'otherCosts'].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setFormData((prev) => ({ ...prev, images: [...(prev.images || []), url] }));
    setImageUrlInput('');
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadError(null);
    try {
      const urls = await readFilesAsDataUrls(files);
      setFormData((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'فشل رفع الصور');
    }
    e.target.value = '';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.brand || !formData.model) return;
    onSave({
      ...formData,
      images: formData.images || [],
      videoUrl: formData.videoUrl || '',
    });
    onClose();
  };

  const totalCost =
    (formData.importPrice || 0) +
    (formData.shippingCost || 0) +
    (formData.customsCost || 0) +
    (formData.repairCost || 0) +
    (formData.otherCosts || 0);
  const estProfit = (formData.sellingPrice || 0) - totalCost;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="720px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button variant="primary" onClick={() => handleSubmit()}>حفظ</Button>
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
          <Input label="رقم الهيكل (VIN)" name="vin" value={formData.vin} onChange={handleChange} placeholder="LSGXXXXXXXXXXXX" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' } as React.CSSProperties} />
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
          <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>الصور والفيديو</p>
          <div className="flex gap-md" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <Input label="رابط صورة" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} placeholder="https://..." dir="ltr" style={{ direction: 'ltr', textAlign: 'left' } as React.CSSProperties} />
            <Button type="button" variant="ghost" onClick={addImageUrl}>إضافة رابط</Button>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <ImagePlus size={16} /> رفع صور
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
          </div>
          {uploadError && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{uploadError}</p>}
          {formData.images?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {formData.images.map((src, index) => (
                <div key={index} style={{ position: 'relative', width: 72, height: 72 }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', top: -6, left: -6, border: 'none', borderRadius: 999, background: '#ef4444', color: '#fff', width: 22, height: 22, cursor: 'pointer' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <Input label="رابط فيديو (يوتيوب أو ملف mp4)" name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="https://youtube.com/..." dir="ltr" style={{ direction: 'ltr', textAlign: 'left' } as React.CSSProperties} />
          </div>
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
          <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>التكلفة والبيع</p>
          <div className="flex gap-md">
            <Input label="سعر الاستيراد (دج)" name="importPrice" type="number" value={formData.importPrice || ''} onChange={handleChange} />
            <Input label="سعر البيع (دج)" name="sellingPrice" type="number" value={formData.sellingPrice || ''} onChange={handleChange} />
          </div>
          <p style={{ fontWeight: 600, margin: '12px 0 8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>مصاريف إضافية (تدخل في حساب الربح)</p>
          <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
            <Input label="شحن (دج)" name="shippingCost" type="number" value={formData.shippingCost || ''} onChange={handleChange} />
            <Input label="جمركة (دج)" name="customsCost" type="number" value={formData.customsCost || ''} onChange={handleChange} />
            <Input label="إصلاح/تجهيز (دج)" name="repairCost" type="number" value={formData.repairCost || ''} onChange={handleChange} />
            <Input label="مصاريف أخرى (دج)" name="otherCosts" type="number" value={formData.otherCosts || ''} onChange={handleChange} />
          </div>
          <div style={{
            marginTop: 12, padding: '10px 12px', borderRadius: 10,
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
            fontSize: '0.9rem',
          }}>
            <div>إجمالي التكلفة: <strong>{totalCost.toLocaleString('ar-DZ')} دج</strong></div>
            <div style={{ marginTop: 4 }}>
              ربح تقديري:{' '}
              <strong style={{ color: estProfit >= 0 ? '#22c55e' : '#ef4444' }}>
                {estProfit.toLocaleString('ar-DZ')} دج
              </strong>
            </div>
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

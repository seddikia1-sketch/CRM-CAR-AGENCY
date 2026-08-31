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
        images: initialData?.images || [],
        videoUrl: initialData?.videoUrl || '',
      });
      setImageUrlInput('');
      setUploadError(null);
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

        {/* الوسائط */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
          <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>الصور والفيديو (للمتجر)</p>

          <div className="flex gap-md" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <Input
                label="رابط صورة"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://..."
                dir="ltr"
                style={{ direction: 'ltr', textAlign: 'left' } as React.CSSProperties}
              />
            </div>
            <Button type="button" variant="secondary" onClick={addImageUrl}>إضافة الرابط</Button>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)',
              fontWeight: 600, fontSize: '0.875rem',
            }}>
              <ImagePlus size={16} /> رفع من الجهاز
              <input type="file" accept="image/*" multiple hidden onChange={handleFileUpload} />
            </label>
          </div>

          {uploadError && (
            <p style={{ color: 'var(--accent-danger)', fontSize: '0.85rem', marginTop: 8 }}>{uploadError}</p>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            يُفضّل صور بحجم أقل من 2.5 ميجا. يمكن إضافة عدة صور.
          </p>

          {(formData.images?.length || 0) > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {formData.images.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    style={{
                      position: 'absolute', top: -6, left: -6, background: '#ef4444', color: '#fff',
                      borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <Input
              label="رابط فيديو (يوتيوب أو ملف mp4)"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=... أو رابط mp4"
              dir="ltr"
              style={{ direction: 'ltr', textAlign: 'left' } as React.CSSProperties}
            />
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

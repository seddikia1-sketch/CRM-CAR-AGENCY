import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ImagePlus, PackagePlus, MessageCircle, Car } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import type { Vehicle, SparePart } from '../../types';
import type { SupplierProfile } from '../../types';
import {
  lookupParts,
  findVehicleByVin,
  buildSupplierWhatsAppMessage,
  type PartSuggestion,
} from '../../utils/partLookup';
import { formatCurrency } from '../../utils/formatters';
import { getWhatsAppLink } from '../../utils/formatters';

const LOW_STOCK_PO_KEY = 'crm_po_from_low_stock';

interface SmartPartRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  parts: SparePart[];
  supplier?: SupplierProfile | null;
}

export const SmartPartRequestModal: React.FC<SmartPartRequestModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  parts,
  supplier,
}) => {
  const navigate = useNavigate();
  const [vin, setVin] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [partQuery, setPartQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [manualBrand, setManualBrand] = useState('');
  const [manualModel, setManualModel] = useState('');
  const [manualYear, setManualYear] = useState<number | undefined>();

  useEffect(() => {
    if (!isOpen) return;
    setVin('');
    setVehicleId('');
    setPartQuery('');
    setQuantity(1);
    setPhotoPreview(null);
    setPhotoName('');
    setSelected({});
    setManualBrand('');
    setManualModel('');
    setManualYear(undefined);
  }, [isOpen]);

  const vehicleFromSelect = vehicles.find((v) => v.id === vehicleId);
  const vehicleFromVin = useMemo(() => findVehicleByVin(vehicles, vin), [vehicles, vin]);
  const activeVehicle = vehicleFromSelect || vehicleFromVin;

  useEffect(() => {
    if (vehicleFromVin && !vehicleId) {
      setVehicleId(vehicleFromVin.id);
    }
  }, [vehicleFromVin, vehicleId]);

  useEffect(() => {
    if (activeVehicle) {
      setManualBrand(activeVehicle.brand || '');
      setManualModel(activeVehicle.model || '');
      setManualYear(activeVehicle.year || undefined);
      if (activeVehicle.vin && !vin) setVin(activeVehicle.vin);
    }
  }, [activeVehicle?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const brand = activeVehicle?.brand || manualBrand;
  const model = activeVehicle?.model || manualModel;
  const year = activeVehicle?.year || manualYear;

  const suggestions = useMemo(() => {
    if (!partQuery.trim() && !brand && !model) return [];
    return lookupParts({
      query: partQuery,
      brand,
      model,
      year,
      vin: vin || activeVehicle?.vin,
      inventoryParts: parts,
    });
  }, [partQuery, brand, model, year, vin, activeVehicle?.vin, parts]);

  const selectedItems = suggestions.filter((s) => selected[s.id]);

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectTop = () => {
    const next: Record<string, boolean> = {};
    suggestions.slice(0, 3).forEach((s) => {
      next[s.id] = true;
    });
    setSelected(next);
  };

  const onPhoto = (file: File | null) => {
    if (!file) {
      setPhotoPreview(null);
      setPhotoName('');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار صورة');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      alert('الصورة كبيرة — اختر صورة أقل من 2.5 ميجا');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(String(reader.result || ''));
      setPhotoName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const vehicleLabel = activeVehicle
    ? `${activeVehicle.brand} ${activeVehicle.model} ${activeVehicle.year || ''}`
    : [brand, model, year].filter(Boolean).join(' ');

  const createPurchaseOrder = () => {
    const items = (selectedItems.length ? selectedItems : suggestions.slice(0, 1)).map((s) => ({
      kind: s.kind,
      name: s.name,
      reference: s.reference || '',
      brand: s.brand || brand || '',
      model: s.model || model || '',
      year,
      quantity: Math.max(1, quantity),
      unitCost: s.unitCost || 0,
      expectedSellPrice: s.expectedSellPrice,
      notes: [
        s.notes,
        vin || activeVehicle?.vin ? `VIN: ${vin || activeVehicle?.vin}` : '',
        photoName ? `مرجع صورة: ${photoName}` : '',
      ]
        .filter(Boolean)
        .join(' · '),
    }));

    if (items.length === 0) {
      alert('أدخل اسم القطعة أو اختر اقتراحاً');
      return;
    }

    sessionStorage.setItem(LOW_STOCK_PO_KEY, JSON.stringify(items));
    if (photoPreview) {
      try {
        sessionStorage.setItem('crm_po_part_photo', photoPreview.slice(0, 200000));
      } catch {
        /* ignore quota */
      }
    }
    onClose();
    navigate('/purchases?fromLowStock=1');
  };

  const openWhatsAppSupplier = () => {
    const items = (selectedItems.length ? selectedItems : suggestions.slice(0, 3)).map((s) => ({
      name: s.name,
      reference: s.reference,
      quantity: Math.max(1, quantity),
      notes: s.notes?.slice(0, 80),
    }));
    if (items.length === 0) {
      alert('لا توجد قطع لإرسالها');
      return;
    }
    const msg = buildSupplierWhatsAppMessage({
      supplierName: supplier?.contactName || supplier?.name,
      vin: vin || activeVehicle?.vin,
      vehicleLabel,
      items,
      photoNote: photoName ? `لدينا صورة مرجعية للقطعة (${photoName})` : undefined,
    });
    const phone = supplier?.whatsapp || supplier?.phone || '';
    if (!phone) {
      alert('أضف رقم واتساب المورد من صفحة المشتريات ← المورد');
      return;
    }
    window.open(getWhatsAppLink(phone, msg), '_blank');
  };

  const vehiclesWithVin = vehicles.filter((v) => v.vin && v.vin.trim());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="طلب قطعة ذكي — VIN + اسم القطعة"
      maxWidth="720px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إغلاق</Button>
          <Button variant="ghost" leftIcon={<MessageCircle size={16} />} onClick={openWhatsAppSupplier}>
            واتساب المورد
          </Button>
          <Button variant="primary" leftIcon={<PackagePlus size={16} />} onClick={createPurchaseOrder}>
            تجهيز أمر شراء
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          أدخل <strong>VIN</strong> أو اختر السيارة، ثم اسم القطعة (مثال: فلتر زيت).
          النظام يطابق الكتالوج وجدول الأسعار والمخزون ويجهّز طلباً للمورد.
          الصورة اختيارية كمرجع بصري (التعرف الآلي يعتمد على النص والسيارة).
        </p>

        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <Input
              label="رقم الهيكل VIN"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder="LSG... أو رقم الهيكل"
            />
          </div>
          <div className="input-wrapper" style={{ flex: '1 1 220px' }}>
            <label className="input-label">من مخزون السيارات</label>
            <select
              className="input-field"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              <option value="">— اختر سيارة —</option>
              {vehiclesWithVin.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} {v.year} — {v.vin}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeVehicle ? (
          <div className="glass-card" style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <Car size={18} color="var(--accent-primary)" />
            <div style={{ fontSize: '0.9rem' }}>
              <strong>{activeVehicle.brand} {activeVehicle.model} {activeVehicle.year}</strong>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                VIN: {activeVehicle.vin || '—'} · اللون: {activeVehicle.color || '—'}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
            <Input label="الماركة (إن لم تُسجَّل السيارة)" value={manualBrand} onChange={(e) => setManualBrand(e.target.value)} placeholder="Jetour / Chery / Toyota" />
            <Input label="الموديل" value={manualModel} onChange={(e) => setManualModel(e.target.value)} placeholder="X70 Plus" />
            <Input label="السنة" type="number" value={manualYear || ''} onChange={(e) => setManualYear(Number(e.target.value) || undefined)} />
          </div>
        )}

        <div className="flex gap-md" style={{ flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: '1 1 240px' }}>
            <Input
              label="اسم القطعة أو وصفها"
              value={partQuery}
              onChange={(e) => setPartQuery(e.target.value)}
              placeholder="فلتر زيت · فلتر هواء · زيت 5W-30 · فرامل..."
              leftIcon={<Search size={16} />}
            />
          </div>
          <div style={{ width: 110 }}>
            <Input
              label="الكمية"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
        </div>

        <div>
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <ImagePlus size={16} /> صورة القطعة (اختياري — مرجع)
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => onPhoto(e.target.files?.[0] || null)}
            style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
          />
          {photoPreview && (
            <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
              <img
                src={photoPreview}
                alt="مرجع القطعة"
                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border-color)' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{photoName}</span>
              <Button variant="ghost" onClick={() => onPhoto(null)}>إزالة</Button>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
            <strong style={{ fontSize: '0.95rem' }}>اقتراحات النظام ({suggestions.length})</strong>
            {suggestions.length > 0 && (
              <Button variant="ghost" onClick={selectTop}>تحديد أفضل 3</Button>
            )}
          </div>

          {suggestions.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              اكتب اسم القطعة و/أو اختر السيارة لعرض المطابقات من الكتالوج.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {suggestions.map((s: PartSuggestion) => (
                <label
                  key={s.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: selected[s.id] ? '1px solid rgba(124,108,240,0.45)' : '1px solid var(--border-color)',
                    background: selected[s.id] ? 'rgba(124,108,240,0.1)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!selected[s.id]}
                    onChange={() => toggle(s.id)}
                    style={{ marginTop: 4 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{s.name}</strong>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: s.confidence >= 70 ? '#2dd4bf' : s.confidence >= 45 ? '#fbbf24' : 'var(--text-secondary)',
                      }}>
                        تطابق {s.confidence}%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {s.reference ? `رقم: ${s.reference} · ` : ''}
                      {s.brand} {s.model ? `· ${s.model}` : ''}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {s.matchReason}
                      {s.unitCost > 0 ? ` · تكلفة تقريبية ${formatCurrency(s.unitCost)}` : ''}
                      {s.source === 'inventory' ? ' · في المخزون' : ''}
                    </div>
                    {s.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                        {s.notes.slice(0, 160)}{s.notes.length > 160 ? '…' : ''}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

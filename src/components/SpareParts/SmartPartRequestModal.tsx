import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ImagePlus, PackagePlus, MessageCircle, Car, Sparkles, Loader2 } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import type { Vehicle, SparePart, SupplierProfile } from '../../types';
import {
  lookupParts,
  findVehicleByVin,
  buildSupplierWhatsAppMessage,
  type PartSuggestion,
} from '../../utils/partLookup';
import { formatCurrency, getWhatsAppLink } from '../../utils/formatters';
import { identifyPartsWithAi } from '../../services/partAi';
import { getAiSettings, isAiConfigured } from '../../services/aiSettings';

const LOW_STOCK_PO_KEY = 'crm_po_from_low_stock';

interface SmartPartRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  parts: SparePart[];
  supplier?: SupplierProfile | null;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    available: 'متاحة',
    reserved: 'محجوزة',
    sold: 'مباعة',
    in_transit: 'شحن',
    customs: 'جمرك',
  };
  return map[status] || status;
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
  const [aiSuggestions, setAiSuggestions] = useState<PartSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiReady, setAiReady] = useState(false);

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
    setAiSuggestions([]);
    setAiError('');
    setAiReady(isAiConfigured(getAiSettings()));
  }, [isOpen]);

  const vehicleFromSelect = vehicles.find((v) => v.id === vehicleId);
  const vehicleFromVin = useMemo(() => findVehicleByVin(vehicles, vin), [vehicles, vin]);
  const activeVehicle = vehicleFromSelect || vehicleFromVin;

  useEffect(() => {
    if (vehicleFromVin && !vehicleId) setVehicleId(vehicleFromVin.id);
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

  const catalogSuggestions = useMemo(() => {
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

  const suggestions = useMemo(() => {
    const merged = [...aiSuggestions, ...catalogSuggestions];
    const seen = new Set<string>();
    return merged.filter((s) => {
      const k = `${s.name}|${s.reference}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [aiSuggestions, catalogSuggestions]);

  const selectedItems = suggestions.filter((s) => selected[s.id]);

  const toggle = (id: string) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectTop = () => {
    const next: Record<string, boolean> = {};
    suggestions.slice(0, 3).forEach((s) => { next[s.id] = true; });
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
      alert('الصورة كبيرة — أقل من 2.5 ميجا');
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

  const vehicleContext = activeVehicle
    ? `مسجّلة في النظام — الحالة: ${statusLabel(activeVehicle.status)}${activeVehicle.status === 'sold' ? ' (سيارة بيعت سابقاً)' : ''}`
    : 'سيارة غير مسجّلة / عميل خارجي — توريد قطع من الصين';

  const runAi = async () => {
    if (!partQuery.trim() && !photoPreview) {
      alert('أدخل وصف القطعة أو أرفق صورة');
      return;
    }
    if (!aiReady) {
      alert('فعّل خدمة AI من الإعدادات وأدخل مفتاح API');
      return;
    }
    setAiLoading(true);
    setAiError('');
    const result = await identifyPartsWithAi({
      vin: vin || activeVehicle?.vin,
      brand,
      model,
      year,
      color: activeVehicle?.color,
      partQuery: partQuery || 'تعرّف على القطعة من الصورة',
      imageDataUrl: photoPreview,
      vehicleContext,
    });
    setAiLoading(false);
    if (result.error) setAiError(result.error);
    if (result.suggestions.length) {
      setAiSuggestions(result.suggestions);
      const next: Record<string, boolean> = {};
      result.suggestions.slice(0, 3).forEach((s) => { next[s.id] = true; });
      setSelected((prev) => ({ ...prev, ...next }));
    } else if (!result.error) {
      setAiError('لم تُرجع الخدمة اقتراحات');
    }
  };

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
        s.source === 'ai' ? 'مصدر: AI' : '',
      ]
        .filter(Boolean)
        .join(' · '),
    }));

    if (items.length === 0) {
      alert('أدخل اسم القطعة أو شغّل AI أو اختر اقتراحاً');
      return;
    }

    sessionStorage.setItem(LOW_STOCK_PO_KEY, JSON.stringify(items));
    if (photoPreview) {
      try {
        sessionStorage.setItem('crm_po_part_photo', photoPreview.slice(0, 200000));
      } catch { /* ignore */ }
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
      alert('أضف رقم واتساب المورد من المشتريات ← المورد');
      return;
    }
    window.open(getWhatsAppLink(phone, msg), '_blank');
  };

  // كل السيارات بما فيها المباعة — لطلب قطع لعميل اشترى سابقاً
  const allVehicles = useMemo(
    () => [...vehicles].sort((a, b) => (a.status === 'sold' ? 1 : 0) - (b.status === 'sold' ? 1 : 0)),
    [vehicles]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="طلب قطعة ذكي — AI + VIN + كتالوج"
      maxWidth="740px"
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
          يعمل مع <strong>أي سيارة</strong>: في المخزون، مباعة سابقاً، أو ماركة خارجية.
          أدخل VIN أو الماركة/الموديل + وصف القطعة، ثم اضغط <strong>تعرّف بالـ AI</strong>.
          {!aiReady && (
            <>
              {' '}— <Link to="/settings">فعّل مفتاح AI من الإعدادات</Link>
            </>
          )}
        </p>

        <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <Input
              label="رقم الهيكل VIN"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder="LSG... أو أي VIN"
            />
          </div>
          <div className="input-wrapper" style={{ flex: '1 1 240px' }}>
            <label className="input-label">سيارة من النظام (متاحة / مباعة / شحن)</label>
            <select
              className="input-field"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              <option value="">— يدوي أو VIN فقط —</option>
              {allVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} {v.year} [{statusLabel(v.status)}] {v.vin ? `— ${v.vin}` : ''}
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
                VIN: {activeVehicle.vin || '—'} · {statusLabel(activeVehicle.status)}
                {activeVehicle.soldToClientName ? ` · العميل: ${activeVehicle.soldToClientName}` : ''}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
            <Input label="الماركة" value={manualBrand} onChange={(e) => setManualBrand(e.target.value)} placeholder="Jetour / Toyota / أي ماركة" />
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
              placeholder="فلتر زيت · طقم فرامل أمامي · حساس ABS..."
              leftIcon={<Search size={16} />}
            />
          </div>
          <div style={{ width: 100 }}>
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
            <ImagePlus size={16} /> صورة القطعة (للـ AI إن كان النموذج يدعم الرؤية)
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
              <img src={photoPreview} alt="مرجع" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border-color)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{photoName}</span>
              <Button variant="ghost" onClick={() => onPhoto(null)}>إزالة</Button>
            </div>
          )}
        </div>

        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            leftIcon={aiLoading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
            onClick={runAi}
            disabled={aiLoading}
          >
            {aiLoading ? 'جاري التعرف…' : 'تعرّف بالـ AI'}
          </Button>
          {!aiReady && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
              الكتالوج يعمل دائماً · AI يحتاج مفتاحاً من الإعدادات
            </span>
          )}
        </div>

        {aiError && (
          <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', fontSize: '0.85rem' }}>
            {aiError}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
            <strong style={{ fontSize: '0.95rem' }}>الاقتراحات ({suggestions.length})</strong>
            {suggestions.length > 0 && (
              <Button variant="ghost" onClick={selectTop}>تحديد أفضل 3</Button>
            )}
          </div>

          {suggestions.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              اكتب الوصف أو شغّل AI لعرض النتائج.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {suggestions.map((s) => (
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
                  <input type="checkbox" checked={!!selected[s.id]} onChange={() => toggle(s.id)} style={{ marginTop: 4 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.9rem' }}>
                        {s.source === 'ai' ? '✨ ' : ''}{s.name}
                      </strong>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: s.confidence >= 70 ? '#2dd4bf' : s.confidence >= 45 ? '#fbbf24' : 'var(--text-secondary)',
                      }}>
                        {s.confidence}%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {s.reference ? `رقم: ${s.reference} · ` : ''}
                      {s.brand} {s.model ? `· ${s.model}` : ''}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {s.matchReason}
                      {s.unitCost > 0 ? ` · ${formatCurrency(s.unitCost)}` : ''}
                      {s.source === 'inventory' ? ' · في المخزون' : ''}
                    </div>
                    {s.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                        {s.notes.slice(0, 180)}{s.notes.length > 180 ? '…' : ''}
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

import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import type { CartItem } from '../../services/storeCart';
import { clearCart } from '../../services/storeCart';
import { savePublicLead } from '../../services/publicInventory';
import { phoneMask, formatCurrency, getWhatsAppLink } from '../../utils/formatters';
import { getOfficeSettings } from '../../services/officeSettings';

const WILAYAS = [
  'الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'سطيف', 'باتنة', 'بجاية', 'تلمسان',
  'البليدة', 'تيزي وزو', 'سكيكدة', 'الجلفة', 'سيدي بلعباس', 'الشلف', 'مستغانم',
  'المدية', 'تيارت', 'بشار', 'ورقلة', 'أخرى',
];

interface Props {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onDone: () => void;
}

export const StoreCheckout: React.FC<Props> = ({ open, items, onClose, onDone }) => {
  const office = getOfficeSettings();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const total = items.reduce((s, i) => s + (i.price || 0), 0);
  const carsLabel = items.map((i) => `${i.brand} ${i.model}`).join(' + ');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const first = items[0];
    const result = savePublicLead({
      clientName: name,
      clientPhone: phone,
      vehicleBrand: first?.brand,
      vehicleModel: first?.model,
      vehicleId: first?.id,
      notes: `طلب متجر · الولاية: ${wilaya || '-'} · السيارات: ${carsLabel} · الدفع: عند الاتفاق / معاينة`,
    });
    if (!result.ok) {
      setError(result.error || 'تعذر إرسال الطلب');
      return;
    }
    // طلبات إضافية إن وُجدت أكثر من سيارة
    items.slice(1).forEach((item) => {
      savePublicLead({
        clientName: name,
        clientPhone: phone,
        vehicleBrand: item.brand,
        vehicleModel: item.model,
        vehicleId: item.id,
        notes: `طلب متجر (إضافي) · الولاية: ${wilaya || '-'} · ${item.brand} ${item.model}`,
      });
    });
    clearCart();
    setDone(true);
    onDone();
  };

  const wa = () => {
    const msg = `السلام عليكم،\nطلب من المتجر:\nالاسم: ${name}\nالهاتف: ${phone}\nالولاية: ${wilaya}\nالسيارات: ${carsLabel}`;
    window.open(getWhatsAppLink(office.whatsapp, msg), '_blank');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(440px, 100%)',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#12121a',
          borderRadius: '16px 16px 0 0',
          padding: 18,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontWeight: 900 }}>إتمام الطلب</h3>
          <button type="button" onClick={onClose}><X size={20} color="#aaa" /></button>
        </div>

        {!done ? (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, fontSize: '0.88rem' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>ملخص الطلب</div>
              {items.map((i) => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{i.brand} {i.model}</span>
                  <span style={{ color: '#4ade80' }}>{i.price ? formatCurrency(i.price) : '—'}</span>
                </div>
              ))}
              {total > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8, paddingTop: 8, fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
                  <span>الإجمالي التقديري</span>
                  <span style={{ color: '#4ade80' }}>{formatCurrency(total)}</span>
                </div>
              )}
              <p style={{ marginTop: 8, color: '#888', fontSize: '0.8rem' }}>
                السعر نهائي بعد التأكيد مع المكتب · المعاينة قبل الاتفاق
              </p>
            </div>

            {error && <div style={{ color: '#e17055', fontSize: '0.88rem' }}>{error}</div>}

            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل *" style={inputStyle} autoComplete="name" />
            <input required value={phone} onChange={(e) => setPhone(phoneMask(e.target.value))} placeholder="رقم الهاتف *" dir="ltr" inputMode="numeric" style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }} autoComplete="tel" />
            <select value={wilaya} onChange={(e) => setWilaya(e.target.value)} style={inputStyle}>
              <option value="">الولاية</option>
              {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>

            <div style={{ fontSize: '0.85rem', color: '#888' }}>
              طريقة التواصل: اتصال / واتساب من المكتب (بدون إنشاء حساب)
            </div>

            <button type="submit" style={{
              background: 'linear-gradient(90deg,#22c55e,#16a34a)', color: '#fff',
              border: 'none', borderRadius: 12, padding: '14px', fontWeight: 900, cursor: 'pointer',
            }}>
              تأكيد الطلب كزائر
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 10 }} />
            <h3 style={{ fontWeight: 900 }}>تم استلام طلبك</h3>
            <p style={{ color: '#888', margin: '10px 0 16px' }}>سنتصل بك قريباً لتأكيد التفاصيل.</p>
            <button type="button" onClick={wa} style={{
              width: '100%', background: '#25D366', color: '#fff', border: 'none',
              borderRadius: 12, padding: '12px', fontWeight: 800, cursor: 'pointer', marginBottom: 8,
            }}>
              إرسال عبر واتساب
            </button>
            <button type="button" onClick={onClose} style={{
              width: '100%', background: 'transparent', color: '#aaa',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px', cursor: 'pointer',
            }}>
              إغلاق
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#0a0a0f',
  color: '#e8e8f0',
  fontSize: 16,
};

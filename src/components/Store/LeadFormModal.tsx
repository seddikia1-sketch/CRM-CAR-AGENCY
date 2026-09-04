import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { phoneMask, getWhatsAppLink } from '../../utils/formatters';
import { getOfficeSettings } from '../../services/officeSettings';
import { savePublicLead } from '../../services/publicInventory';
import type { CatalogCar } from '../../data/storeCatalog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  car?: CatalogCar | null;
  title?: string;
}

export const LeadFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  car,
  title = 'احجز / اشتري الآن',
}) => {
  const office = getOfficeSettings();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setPhone('');
      setNote(car ? `مهتم بـ ${car.brand} ${car.model} ${car.year}` : '');
      setError(null);
      setDone(false);
    }
  }, [isOpen, car]);

  if (!isOpen) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = savePublicLead({
      clientName: name,
      clientPhone: phone,
      vehicleBrand: car?.brand,
      vehicleModel: car?.model,
      vehicleId: car?.id,
      notes: note,
    });
    if (!result.ok) {
      setError(result.error || 'تعذر الحفظ');
      return;
    }
    setDone(true);
  };

  const waConfirm = () => {
    const msg = `السلام عليكم،\nاسمي: ${name}\nهاتفي: ${phone}\n${
      car ? `أريد حجز / شراء: ${car.brand} ${car.model} ${car.year}` : 'أريد الاستفسار عن السيارات'
    }\n${note ? `ملاحظة: ${note}` : ''}`;
    window.open(getWhatsAppLink(office.whatsapp, msg), '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{ width: 'min(420px, 100%)', padding: 20, position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            color: 'var(--text-secondary)',
          }}
        >
          <X size={20} />
        </button>

        {!done ? (
          <>
            <h3 style={{ fontWeight: 900, marginBottom: 6, paddingLeft: 28 }}>{title}</h3>
            {car && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 14 }}>
                {car.brand} {car.model} · {car.year}
                {car.price ? ` · ${car.price.toLocaleString('ar-DZ')} دج` : ''}
              </p>
            )}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
              حقلان فقط: الاسم والهاتف — وسنتصل بك لتأكيد الحجز.
            </p>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {error && (
                <div style={{
                  background: 'rgba(225,112,85,0.12)',
                  border: '1px solid var(--accent-danger)',
                  color: 'var(--accent-danger)',
                  padding: '8px 10px',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>الاسم الكامل *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="مثال: محمد بن علي"
                  style={{
                    width: '100%',
                    marginTop: 4,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>رقم الهاتف / واتساب *</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(phoneMask(e.target.value))}
                  required
                  inputMode="numeric"
                  dir="ltr"
                  placeholder="0555 12 34 56"
                  style={{
                    width: '100%',
                    marginTop: 4,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    direction: 'ltr',
                    textAlign: 'left',
                  }}
                />
              </div>

              <details style={{ marginTop: 4 }}>
                <summary style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  ملاحظة إضافية (اختياري)
                </summary>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="لون مفضل، موعد معاينة..."
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    resize: 'vertical',
                  }}
                />
              </details>

              <button
                type="submit"
                style={{
                  marginTop: 4,
                  background: 'linear-gradient(90deg, #6c5ce7, #00cec9)',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: 12,
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                تأكيد الطلب — اتصلوا بي
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 8px' }}>
            <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 12 }} />
            <h3 style={{ fontWeight: 900, marginBottom: 8 }}>تم استلام طلبك</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              سنقوم بالاتصال بك قريباً لتأكيد الحجز.
              يمكنك أيضاً مراسلتنا الآن عبر واتساب.
            </p>
            <button
              type="button"
              onClick={waConfirm}
              style={{
                width: '100%',
                background: '#25D366',
                color: '#fff',
                padding: '12px',
                borderRadius: 12,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                marginBottom: 10,
              }}
            >
              إرسال تأكيد عبر واتساب
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                background: 'transparent',
                color: 'var(--text-secondary)',
                padding: '10px',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              إغلاق
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

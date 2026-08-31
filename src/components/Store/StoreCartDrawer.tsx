import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import type { CartItem } from '../../services/storeCart';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export const StoreCartDrawer: React.FC<Props> = ({ open, items, onClose, onRemove, onCheckout }) => {
  if (!open) return null;
  const total = items.reduce((s, i) => s + (i.price || 0), 0);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: 'min(380px, 100%)',
          background: '#12121a',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '8px 0 40px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
            <ShoppingBag size={18} /> اهتماماتك ({items.length})
          </div>
          <button type="button" onClick={onClose} style={{ color: '#aaa' }}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>لم تختر أي سيارة بعد.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} style={{
                display: 'flex', gap: 10, padding: 10, marginBottom: 8,
                background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ width: 64, height: 48, borderRadius: 8, overflow: 'hidden', background: '#1a1a2e', flexShrink: 0 }}>
                  {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.brand} {item.model}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.year}</div>
                  <div style={{ fontWeight: 800, color: '#4ade80', fontSize: '0.9rem' }}>
                    {item.price ? formatCurrency(item.price) : 'حسب الاتفاق'}
                  </div>
                </div>
                <button type="button" onClick={() => onRemove(item.id)} style={{ color: '#e17055' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {items.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontWeight: 700 }}>
              <span>تقديري</span>
              <span style={{ color: '#4ade80' }}>{total ? formatCurrency(total) : '—'}</span>
            </div>
          )}
          <button
            type="button"
            disabled={items.length === 0}
            onClick={onCheckout}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              fontWeight: 900,
              cursor: items.length ? 'pointer' : 'not-allowed',
              background: items.length ? 'linear-gradient(90deg,#22c55e,#16a34a)' : '#333',
              color: '#fff',
              opacity: items.length ? 1 : 0.5,
            }}
          >
            إتمام الطلب / الحجز
          </button>
        </div>
      </div>
    </div>
  );
};

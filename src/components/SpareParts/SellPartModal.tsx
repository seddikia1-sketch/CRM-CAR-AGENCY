import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import type { SparePart } from '../../types';
import type { Client } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface SellPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: SparePart | null;
  clients: Client[];
  onConfirm: (quantity: number, unitPrice: number, clientId?: string, clientName?: string, notes?: string) => void;
}

export const SellPartModal: React.FC<SellPartModalProps> = ({
  isOpen,
  onClose,
  part,
  clients,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (part) {
      setQuantity(1);
      setUnitPrice(part.sellingPrice || 0);
      setClientId('');
      setNotes('');
    }
  }, [part]);

  if (!part) return null;

  const total = quantity * unitPrice;
  const profit = total - (part.costPrice || 0) * quantity;
  const selectedClient = clients.find((c) => c.id === clientId);

  const handleConfirm = () => {
    if (quantity < 1 || quantity > part.quantity) return;
    onConfirm(quantity, unitPrice, selectedClient?.id, selectedClient?.name, notes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="بيع قطعة غيار"
      maxWidth="480px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={quantity < 1 || quantity > part.quantity}
          >
            تأكيد البيع
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="glass-card" style={{ padding: '12px' }}>
          <strong>{part.name}</strong>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            المتوفر: {part.quantity} • التكلفة: {formatCurrency(part.costPrice)}
          </div>
        </div>

        <div className="flex gap-md">
          <Input
            label="الكمية"
            type="number"
            value={quantity || ''}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          />
          <Input
            label="سعر الوحدة (دج)"
            type="number"
            value={unitPrice || ''}
            onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
          />
        </div>

        <div className="input-wrapper">
          <label className="input-label">ربط بعميل (اختياري)</label>
          <select className="input-field" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">-- بدون عميل --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
            ))}
          </select>
        </div>

        <Input
          label="ملاحظات"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="مثال: صيانة دورية"
        />

        <div style={{
          padding: '12px',
          borderRadius: '8px',
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid #22c55e',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>الإجمالي:</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span>الربح:</span>
            <strong style={{ color: '#22c55e' }}>{formatCurrency(profit)}</strong>
          </div>
        </div>
      </div>
    </Modal>
  );
};

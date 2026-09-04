import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import type { Vehicle } from '../../types';
import type { Client } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { vehicleTotalCost } from '../../utils/vehicleFinance';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  clients: Client[];
  onConfirm: (clientId: string, clientName: string, finalPrice: number) => void;
}

export const SellModal: React.FC<SellModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  clients,
  onConfirm,
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [finalPrice, setFinalPrice] = useState(0);

  React.useEffect(() => {
    if (vehicle) {
      setFinalPrice(vehicle.sellingPrice || 0);
      setSelectedClientId('');
    }
  }, [vehicle]);

  if (!vehicle) return null;

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const totalCost = vehicleTotalCost(vehicle);
  const profit = finalPrice - totalCost;

  const handleConfirm = () => {
    if (!selectedClient) return;
    onConfirm(selectedClient.id, selectedClient.name, finalPrice);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ربط السيارة بعميل وتسجيل البيع"
      maxWidth="520px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!selectedClientId}>
            تأكيد البيع · ربح {formatCurrency(profit)}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '12px' }}>
          <strong>{vehicle.brand} {vehicle.model} {vehicle.year}</strong>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.7 }}>
            <div>سعر الاستيراد: {formatCurrency(vehicle.importPrice || 0)}</div>
            {(vehicle.shippingCost || 0) > 0 && <div>شحن: {formatCurrency(vehicle.shippingCost)}</div>}
            {(vehicle.customsCost || 0) > 0 && <div>جمركة: {formatCurrency(vehicle.customsCost)}</div>}
            {(vehicle.repairCost || 0) > 0 && <div>إصلاح/تجهيز: {formatCurrency(vehicle.repairCost)}</div>}
            {(vehicle.otherCosts || 0) > 0 && <div>أخرى: {formatCurrency(vehicle.otherCosts)}</div>}
            <div style={{ fontWeight: 700, marginTop: 4 }}>إجمالي التكلفة: {formatCurrency(totalCost)}</div>
          </div>
        </div>

        <div className="input-wrapper">
          <label className="input-label">اختر العميل *</label>
          <select
            className="input-field"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="">-- اختر عميلاً --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.phone}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="سعر البيع النهائي (دج)"
          type="number"
          value={finalPrice || ''}
          onChange={(e) => setFinalPrice(Number(e.target.value) || 0)}
        />

        <div style={{
          padding: '12px',
          borderRadius: '8px',
          background: profit >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${profit >= 0 ? '#22c55e' : '#ef4444'}`,
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            ربح الصفقة = سعر البيع − (استيراد + شحن + جمركة + إصلاح + أخرى)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: profit >= 0 ? '#22c55e' : '#ef4444' }}>
            {formatCurrency(profit)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            بعد البيع تُخفى السيارة من المتجر وصفحة الهبوط تلقائياً
          </div>
        </div>
      </div>
    </Modal>
  );
};

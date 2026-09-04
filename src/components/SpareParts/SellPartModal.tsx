import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import type { SparePart } from '../../types';
import type { Client } from '../../types';
import type { Vehicle } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { printPartSaleInvoice } from '../../utils/printInvoice';
import { nextPartInvoiceNumber } from '../../utils/invoiceNumbers';

interface SellPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: SparePart | null;
  clients: Client[];
  vehicles: Vehicle[];
  onConfirm: (
    quantity: number,
    unitPrice: number,
    clientId?: string,
    clientName?: string,
    notes?: string,
    vehicleId?: string,
    vehicleVin?: string,
    vehicleLabel?: string,
    invoiceNumber?: string
  ) => void;
}

export const SellPartModal: React.FC<SellPartModalProps> = ({
  isOpen,
  onClose,
  part,
  clients,
  vehicles,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [clientId, setClientId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [manualVin, setManualVin] = useState('');
  const [notes, setNotes] = useState('');
  const [printAfter, setPrintAfter] = useState(true);

  useEffect(() => {
    if (part) {
      setQuantity(1);
      setUnitPrice(part.sellingPrice || 0);
      setClientId('');
      setVehicleId('');
      setManualVin('');
      setNotes('');
      setPrintAfter(true);
    }
  }, [part]);

  if (!part) return null;

  const total = quantity * unitPrice;
  const profit = total - (part.costPrice || 0) * quantity;
  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  const handleConfirm = () => {
    if (quantity < 1 || quantity > part.quantity) return;

    const vin = selectedVehicle?.vin || manualVin || undefined;
    const label = selectedVehicle
      ? `${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year}`
      : manualVin
      ? `VIN: ${manualVin}`
      : undefined;

    const invNo = nextPartInvoiceNumber();

    onConfirm(
      quantity,
      unitPrice,
      selectedClient?.id,
      selectedClient?.name,
      notes,
      selectedVehicle?.id,
      vin,
      label,
      invNo
    );

    if (printAfter) {
      printPartSaleInvoice({
        part: {
          name: part.name,
          partNumber: part.partNumber,
          brand: part.brand,
        },
        quantity,
        unitPrice,
        clientName: selectedClient?.name,
        clientPhone: selectedClient?.phone,
        vehicleLabel: label,
        vehicleVin: vin,
        notes,
        soldAt: new Date().toISOString(),
        invoiceNumber: invNo,
      });
    }

    onClose();
  };

  const vehiclesWithVin = vehicles.filter((v) => v.vin && v.vin.trim());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="بيع قطعة غيار (خدمة ما بعد البيع)"
      maxWidth="520px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={quantity < 1 || quantity > part.quantity}
          >
            تأكيد البيع · {formatCurrency(total)}
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

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
          <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            ربط بسيارة (VIN)
          </p>

          <div className="input-wrapper">
            <label className="input-label">اختر من المخزون</label>
            <select
              className="input-field"
              value={vehicleId}
              onChange={(e) => {
                setVehicleId(e.target.value);
                if (e.target.value) setManualVin('');
              }}
            >
              <option value="">-- بدون سيارة من المخزون --</option>
              {vehiclesWithVin.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} {v.year} — VIN: {v.vin}
                </option>
              ))}
            </select>
          </div>

          {!vehicleId && (
            <div style={{ marginTop: '10px' }}>
              <Input
                label="أو أدخل رقم الهيكل (VIN) يدوياً"
                value={manualVin}
                onChange={(e) => setManualVin(e.target.value)}
                placeholder="LSGXXXXXXXXXXXX"
              />
            </div>
          )}
        </div>

        <Input
          label="ملاحظات"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="مثال: صيانة دورية / تغيير فلاتر"
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={printAfter}
            onChange={(e) => setPrintAfter(e.target.checked)}
          />
          طباعة فاتورة البيع بعد التأكيد
        </label>

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

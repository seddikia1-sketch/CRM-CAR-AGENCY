import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import type { Vehicle } from '../../types';
import type { Client } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { vehicleTotalCost } from '../../utils/vehicleFinance';
import { printVehicleSaleInvoice, printSalesContract } from '../../utils/printInvoice';
import { nextInvoiceNumber } from '../../utils/invoiceNumbers';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  clients: Client[];
  onConfirm: (clientId: string, clientName: string, finalPrice: number, invoiceNumber?: string) => void;
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
  const [deposit, setDeposit] = useState(0);
  const [printAfter, setPrintAfter] = useState(true);
  const [printContract, setPrintContract] = useState(true);

  React.useEffect(() => {
    if (vehicle) {
      setFinalPrice(vehicle.sellingPrice || 0);
      setDeposit(0);
      setSelectedClientId('');
      setPrintAfter(true);
      setPrintContract(true);
    }
  }, [vehicle]);

  if (!vehicle) return null;

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const totalCost = vehicleTotalCost(vehicle);
  const profit = finalPrice - totalCost;
  const remaining = Math.max((finalPrice || 0) - (deposit || 0), 0);

  const handleConfirm = () => {
    if (!selectedClient) return;
    const invNo = nextInvoiceNumber('INV');
    onConfirm(selectedClient.id, selectedClient.name, finalPrice, invNo);
    const soldAt = new Date().toISOString();
    if (printAfter) {
      printVehicleSaleInvoice({
        vehicle: { ...vehicle, sellingPrice: finalPrice },
        clientName: selectedClient.name,
        clientPhone: selectedClient.phone,
        finalPrice,
        deposit,
        soldAt,
        invoiceNumber: invNo,
      });
    }
    if (printContract) {
      printSalesContract({
        vehicle: { ...vehicle, sellingPrice: finalPrice },
        clientName: selectedClient.name,
        clientPhone: selectedClient.phone,
        clientIdNumber: selectedClient.nationalId || '',
        clientAddress: selectedClient.address || '',
        finalPrice,
        deposit,
        soldAt,
        contractNumber: invNo.replace('INV', 'CT'),
      });
    }
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
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            <div>إجمالي التكلفة: {formatCurrency(totalCost)}</div>
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
        <Input
          label="العربون المدفوع (دج)"
          type="number"
          value={deposit || ''}
          onChange={(e) => setDeposit(Number(e.target.value) || 0)}
        />
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          المتبقي: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(remaining)}</strong>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
          <input type="checkbox" checked={printAfter} onChange={(e) => setPrintAfter(e.target.checked)} />
          طباعة فاتورة البيع بعد التأكيد
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem' }}>
          <input type="checkbox" checked={printContract} onChange={(e) => setPrintContract(e.target.checked)} />
          طباعة عقد البيع بعد التأكيد
        </label>

        <div style={{
          padding: '12px',
          borderRadius: '8px',
          background: profit >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${profit >= 0 ? '#22c55e' : '#ef4444'}`,
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ربح الصفقة</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: profit >= 0 ? '#22c55e' : '#ef4444' }}>
            {formatCurrency(profit)}
          </div>
        </div>
      </div>
    </Modal>
  );
};

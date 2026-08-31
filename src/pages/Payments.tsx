import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Modal } from '../components/UI/Modal';
import { usePayments, type PaymentFormData, type PaymentType } from '../hooks/usePayments';
import { useClients } from '../hooks/useClients';
import { formatCurrency, formatDate } from '../utils/formatters';
import '../components/Clients/ClientTable.css';

const PAYMENT_TYPES: { key: PaymentType; label: string }[] = [
  { key: 'deposit', label: 'عربون' },
  { key: 'installment', label: 'دفعة جزئية' },
  { key: 'final', label: 'المبلغ النهائي' },
  { key: 'refund', label: 'استرجاع' },
  { key: 'other', label: 'أخرى' },
];

const METHODS = [
  { key: 'cash', label: 'نقداً' },
  { key: 'transfer', label: 'تحويل بنكي' },
  { key: 'check', label: 'شيك' },
  { key: 'other', label: 'أخرى' },
] as const;

export const Payments: React.FC = () => {
  const { payments, addPayment, deletePayment, totalReceived, totalDeposits } = usePayments();
  const { clients } = useClients();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<PaymentFormData>({
    clientName: '',
    clientPhone: '',
    vehicleLabel: '',
    type: 'deposit',
    amount: 0,
    method: 'cash',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSave = () => {
    if (!form.clientName.trim() || !form.amount) return;
    addPayment(form);
    setIsOpen(false);
    setForm({
      clientName: '',
      clientPhone: '',
      vehicleLabel: '',
      type: 'deposit',
      amount: 0,
      method: 'cash',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const fillClient = (id: string) => {
    const c = clients.find((x) => x.id === id);
    if (!c) return;
    setForm((p) => ({
      ...p,
      clientId: c.id,
      clientName: c.name,
      clientPhone: c.phone,
      vehicleLabel: [c.brand, c.model].filter(Boolean).join(' ') || c.vehicleInterest || p.vehicleLabel,
    }));
  };

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex', height: '100%' }}>
      <div className="page-header flex justify-between items-center" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">الدفعات والعربون</h1>
          <p className="page-description">تسجيل العربون والدفعات الجزئية والمبالغ النهائية من الزبائن.</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsOpen(true)}>
          تسجيل دفعة
        </Button>
      </div>

      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '16px 20px', flex: '1 1 180px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>إجمالي المقبوضات</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#22c55e' }}>{formatCurrency(totalReceived)}</div>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px', flex: '1 1 180px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>إجمالي العربونات</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{formatCurrency(totalDeposits)}</div>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px', flex: '1 1 180px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>عدد العمليات</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{payments.length}</div>
        </div>
      </div>

      <div className="glass-card" style={{ flex: 1, padding: 'var(--spacing-md)' }}>
        <div className="table-container">
          {payments.length === 0 ? (
            <div className="empty-state"><p>لا توجد دفعات مسجلة بعد.</p></div>
          ) : (
            <table className="client-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>العميل</th>
                  <th>النوع</th>
                  <th>المبلغ</th>
                  <th>الطريقة</th>
                  <th>السيارة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.date)}</td>
                    <td>
                      <div className="client-name-cell">
                        <p className="client-name">{p.clientName}</p>
                        <p className="client-phone">{p.clientPhone || ''}</p>
                      </div>
                    </td>
                    <td>{PAYMENT_TYPES.find((t) => t.key === p.type)?.label || p.type}</td>
                    <td style={{ fontWeight: 700, color: p.type === 'refund' ? '#ef4444' : '#22c55e' }}>
                      {formatCurrency(p.amount)}
                    </td>
                    <td>{METHODS.find((m) => m.key === p.method)?.label || p.method}</td>
                    <td>{p.vehicleLabel || '-'}</td>
                    <td>
                      <button className="icon-btn" onClick={() => {
                        if (window.confirm('حذف هذه الدفعة؟')) deletePayment(p.id);
                      }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="تسجيل دفعة"
        maxWidth="480px"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>إلغاء</Button>
            <Button variant="primary" onClick={handleSave}>حفظ</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {clients.length > 0 && (
            <div className="input-wrapper">
              <label className="input-label">من قائمة العملاء</label>
              <select className="input-field" onChange={(e) => e.target.value && fillClient(e.target.value)} defaultValue="">
                <option value="">-- اختر --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-md">
            <Input label="اسم الزبون *" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
            <Input label="الهاتف" value={form.clientPhone || ''} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
          </div>
          <div className="flex gap-md">
            <div className="input-wrapper" style={{ flex: 1 }}>
              <label className="input-label">نوع الدفعة</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PaymentType })}>
                {PAYMENT_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <Input label="المبلغ (دج) *" type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })} />
          </div>
          <div className="flex gap-md">
            <div className="input-wrapper" style={{ flex: 1 }}>
              <label className="input-label">طريقة الدفع</label>
              <select className="input-field" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as any })}>
                {METHODS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </div>
            <Input label="التاريخ" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <Input label="السيارة (اختياري)" value={form.vehicleLabel || ''} onChange={(e) => setForm({ ...form, vehicleLabel: e.target.value })} />
          <Input label="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
};

import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  ShoppingCart,
  Truck,
  PackageCheck,
  Trash2,
  Edit3,
  Building2,
  Printer,
  Download,
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Modal } from '../components/UI/Modal';
import { usePurchases } from '../hooks/usePurchases';
import type {
  PurchaseOrder,
  PurchaseOrderFormData,
  PurchaseLineItem,
  PurchaseItemKind,
  PurchaseStatus,
} from '../types';
import {
  PurchaseItemKind as Kind,
  PurchaseStatus as Status,
  PURCHASE_STATUS_LABELS,
  PURCHASE_KIND_LABELS,
} from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { printPurchaseOrder } from '../utils/printPurchaseOrder';
import { downloadCsv, csvTimestamp } from '../utils/exportCsv';

type LineForm = Omit<PurchaseLineItem, 'id' | 'linkedInventoryId' | 'linkedPartId'>;

const emptyLine = (): LineForm => ({
  kind: Kind.FILTER,
  name: '',
  reference: '',
  brand: '',
  model: '',
  year: undefined,
  color: '',
  quantity: 1,
  unitCost: 0,
  expectedSellPrice: undefined,
  notes: '',
});

const LOW_STOCK_PO_KEY = 'crm_po_from_low_stock';

export const Purchases: React.FC = () => {
  const {
    orders,
    supplier,
    stats,
    addOrder,
    updateOrder,
    deleteOrder,
    setStatus,
    receiveOrder,
    updateSupplier,
  } = usePurchases();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | PurchaseStatus>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [toast, setToast] = useState('');

  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedArrival, setExpectedArrival] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatusLocal] = useState<PurchaseStatus>(Status.DRAFT);
  const [lines, setLines] = useState<LineForm[]>([emptyLine()]);
  const [supForm, setSupForm] = useState(supplier);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('fromLowStock') !== '1') return;
    try {
      const raw = sessionStorage.getItem(LOW_STOCK_PO_KEY);
      if (!raw) {
        setSearchParams({}, { replace: true });
        return;
      }
      const parsed = JSON.parse(raw) as LineForm[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setSearchParams({}, { replace: true });
        return;
      }
      const mapped: LineForm[] = parsed.map((l) => ({
        kind: (l.kind as PurchaseItemKind) || Kind.SPARE_PART,
        name: l.name || '',
        reference: l.reference || '',
        brand: l.brand || '',
        model: l.model || '',
        year: l.year,
        color: l.color,
        quantity: Number(l.quantity) || 1,
        unitCost: Number(l.unitCost) || 0,
        expectedSellPrice: l.expectedSellPrice,
        notes: l.notes || '',
      }));
      setEditing(null);
      setOrderDate(new Date().toISOString().slice(0, 10));
      setExpectedArrival('');
      setContainerNumber('');
      setShippingNotes('');
      setNotes(`أمر شراء مقترح من القطع الناقصة (${mapped.length} صنف)`);
      setStatusLocal(Status.ORDERED);
      setLines(mapped);
      setModalOpen(true);
      setToast(`تم تعبئة ${mapped.length} صنف من القطع الناقصة — راجع ثم احفظ`);
      setTimeout(() => setToast(''), 3500);
      sessionStorage.removeItem(LOW_STOCK_PO_KEY);
      setSearchParams({}, { replace: true });
    } catch {
      sessionStorage.removeItem(LOW_STOCK_PO_KEY);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter) list = list.filter((o) => o.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.containerNumber?.toLowerCase().includes(q) ||
          o.items.some(
            (i) =>
              i.name.toLowerCase().includes(q) ||
              i.reference.toLowerCase().includes(q) ||
              i.brand.toLowerCase().includes(q)
          )
      );
    }
    return list;
  }, [orders, query, statusFilter]);

  const openNew = () => {
    setEditing(null);
    setOrderDate(new Date().toISOString().slice(0, 10));
    setExpectedArrival('');
    setContainerNumber('');
    setShippingNotes('');
    setNotes('');
    setStatusLocal(Status.ORDERED);
    setLines([emptyLine()]);
    setModalOpen(true);
  };

  const openEdit = (o: PurchaseOrder) => {
    if (o.status === Status.RECEIVED) {
      setToast('لا يمكن تعديل طلب مستلم');
      setTimeout(() => setToast(''), 2500);
      return;
    }
    setEditing(o);
    setOrderDate(o.orderDate);
    setExpectedArrival(o.expectedArrival || '');
    setContainerNumber(o.containerNumber || '');
    setShippingNotes(o.shippingNotes || '');
    setNotes(o.notes || '');
    setStatusLocal(o.status);
    setLines(
      o.items.map((i) => ({
        kind: i.kind,
        name: i.name,
        reference: i.reference,
        brand: i.brand,
        model: i.model,
        year: i.year,
        color: i.color,
        quantity: i.quantity,
        unitCost: i.unitCost,
        expectedSellPrice: i.expectedSellPrice,
        notes: i.notes,
      }))
    );
    setModalOpen(true);
  };

  const updateLine = (idx: number, patch: Partial<LineForm>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const removeLine = (idx: number) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const handleSave = () => {
    const valid = lines.filter((l) => l.name.trim() && l.quantity > 0);
    if (valid.length === 0) {
      setToast('أضف صنفاً واحداً على الأقل');
      setTimeout(() => setToast(''), 2500);
      return;
    }
    const data: PurchaseOrderFormData = {
      orderDate,
      expectedArrival,
      containerNumber,
      shippingNotes,
      notes,
      status,
      items: valid,
    };
    if (editing) {
      updateOrder(editing.id, data);
      setToast('تم تحديث أمر الشراء');
    } else {
      addOrder(data);
      setToast('تم إنشاء أمر الشراء');
    }
    setModalOpen(false);
    setTimeout(() => setToast(''), 2500);
  };

  const handleReceive = (o: PurchaseOrder) => {
    if (!window.confirm(`استلام الطلب ${o.orderNumber}؟\nسيتم إضافة السيارات للمخزون والقطع/الفلاتر لمخزون القطع.`)) {
      return;
    }
    const res = receiveOrder(o.id);
    setToast(res.message);
    setTimeout(() => setToast(''), 3500);
  };

  const totalForm = lines.reduce((s, l) => s + (l.quantity || 0) * (l.unitCost || 0), 0);

  const statusColor = (s: PurchaseStatus) => {
    switch (s) {
      case Status.RECEIVED:
        return '#22c55e';
      case Status.IN_TRANSIT:
        return '#3b82f6';
      case Status.ORDERED:
        return '#f59e0b';
      case Status.CANCELLED:
        return '#ef4444';
      default:
        return 'var(--text-secondary)';
    }
  };

  const exportOrdersCsv = () => {
    const list = filtered.length ? filtered : orders;
    downloadCsv(
      `اوامر_شراء_${csvTimestamp()}.csv`,
      [
        'رقم الطلب', 'التاريخ', 'الحالة', 'الحاوية', 'الوصول المتوقع',
        'عدد الأصناف', 'الإجمالي', 'المورد', 'ملاحظات الشحن', 'ملاحظات',
      ],
      list.map((o) => [
        o.orderNumber,
        o.orderDate ? new Date(o.orderDate).toLocaleDateString('ar-DZ') : '',
        PURCHASE_STATUS_LABELS[o.status] || o.status,
        o.containerNumber || '',
        o.expectedArrival ? new Date(o.expectedArrival).toLocaleDateString('ar-DZ') : '',
        o.items.length,
        o.totalCost,
        o.supplierName || '',
        o.shippingNotes || '',
        o.notes || '',
      ])
    );
  };

  const exportLinesCsv = () => {
    const list = filtered.length ? filtered : orders;
    const rows: (string | number)[][] = [];
    list.forEach((o) => {
      o.items.forEach((i) => {
        rows.push([
          o.orderNumber,
          o.orderDate ? new Date(o.orderDate).toLocaleDateString('ar-DZ') : '',
          PURCHASE_STATUS_LABELS[o.status] || o.status,
          PURCHASE_KIND_LABELS[i.kind] || i.kind,
          i.name,
          i.reference || '',
          i.brand || '',
          i.model || '',
          i.quantity,
          i.unitCost,
          i.quantity * i.unitCost,
          i.expectedSellPrice || '',
          o.containerNumber || '',
        ]);
      });
    });
    downloadCsv(
      `تفاصيل_اوامر_شراء_${csvTimestamp()}.csv`,
      [
        'رقم الطلب', 'تاريخ الطلب', 'الحالة', 'النوع', 'الصنف', 'مرجع/VIN',
        'الماركة', 'الموديل', 'الكمية', 'تكلفة الوحدة', 'الإجمالي', 'سعر بيع متوقع', 'الحاوية',
      ],
      rows
    );
  };

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex', height: '100%' }}>
      <div className="page-header flex justify-between items-center" style={{ marginBottom: 0, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">المشتريات</h1>
          <p className="page-description">
            أوامر شراء من مورد الصين — سيارات · فلاتر · زيوت · قطع غيار. عند الاستلام يُحدَّث المخزون تلقائياً.
          </p>
        </div>
        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
          <Button variant="ghost" leftIcon={<Download size={18} />} onClick={exportOrdersCsv} disabled={orders.length === 0}>
            تصدير الطلبات
          </Button>
          <Button variant="ghost" leftIcon={<Download size={18} />} onClick={exportLinesCsv} disabled={orders.length === 0}>
            تصدير التفاصيل
          </Button>
          <Button variant="ghost" leftIcon={<Building2 size={18} />} onClick={() => { setSupForm(supplier); setSupplierOpen(true); }}>
            المورد
          </Button>
          <Button variant="primary" leftIcon={<Plus size={18} />} onClick={openNew}>
            أمر شراء جديد
          </Button>
        </div>
      </div>

      {toast && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', fontWeight: 600 }}>
          {toast}
        </div>
      )}

      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>إجمالي الطلبات</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.totalOrders}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>مفتوحة / شحن</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>{stats.openCount}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>مستلمة</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#22c55e' }}>{stats.receivedCount}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 160px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>مصروف مستلم</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{formatCurrency(stats.totalSpent)}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 160px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>قيد الانتظار</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{formatCurrency(stats.pendingCost)}</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 220px' }}>
            <Input placeholder="بحث برقم الطلب أو الحاوية أو الصنف..." value={query} onChange={(e) => setQuery(e.target.value)} leftIcon={<Search size={16} />} />
          </div>
          <select className="input-field" style={{ maxWidth: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as '' | PurchaseStatus)}>
            <option value="">كل الحالات</option>
            {Object.entries(PURCHASE_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            المورد: <strong>{supplier.name}</strong> ({supplier.country})
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ flex: 1, overflow: 'auto' }}>
        <div className="table-container">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <ShoppingCart size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
              <p>لا توجد أوامر شراء بعد. أنشئ أول طلب من مورد الصين.</p>
            </div>
          ) : (
            <table className="client-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                  <th>الأصناف</th>
                  <th>الحاوية</th>
                  <th>الإجمالي</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td><strong>{o.orderNumber}</strong></td>
                    <td>{formatDate(o.orderDate)}</td>
                    <td><span style={{ color: statusColor(o.status), fontWeight: 700 }}>{PURCHASE_STATUS_LABELS[o.status]}</span></td>
                    <td style={{ fontSize: '0.85rem', maxWidth: 260 }}>
                      {o.items.slice(0, 3).map((i) => (
                        <div key={i.id}>{PURCHASE_KIND_LABELS[i.kind]}: {i.name} ×{i.quantity}</div>
                      ))}
                      {o.items.length > 3 && <div>+{o.items.length - 3} أخرى</div>}
                    </td>
                    <td>{o.containerNumber || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(o.totalCost)}</td>
                    <td>
                      <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                        <button className="icon-btn" title="طباعة أمر الشراء" onClick={() => printPurchaseOrder(o, supplier)}>
                          <Printer size={16} />
                        </button>
                        {o.status !== Status.RECEIVED && o.status !== Status.CANCELLED && (
                          <>
                            <button className="icon-btn" title="تعديل" onClick={() => openEdit(o)}><Edit3 size={16} /></button>
                            {o.status === Status.ORDERED && (
                              <Button variant="ghost" onClick={() => setStatus(o.id, Status.IN_TRANSIT)} leftIcon={<Truck size={14} />}>شحن</Button>
                            )}
                            <Button variant="primary" onClick={() => handleReceive(o)} leftIcon={<PackageCheck size={14} />}>استلام</Button>
                          </>
                        )}
                        {o.status !== Status.RECEIVED && (
                          <button className="icon-btn" title="حذف" onClick={() => { if (window.confirm('حذف أمر الشراء؟')) deleteOrder(o.id); }}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `تعديل ${editing.orderNumber}` : 'أمر شراء جديد — مورد الصين'} maxWidth="820px"
        footer={<><Button variant="ghost" onClick={() => setModalOpen(false)}>إلغاء</Button><Button variant="primary" onClick={handleSave}>حفظ · {formatCurrency(totalForm)}</Button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
            <Input label="تاريخ الطلب" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            <Input label="الوصول المتوقع" type="date" value={expectedArrival} onChange={(e) => setExpectedArrival(e.target.value)} />
            <Input label="رقم الحاوية / الشحنة" value={containerNumber} onChange={(e) => setContainerNumber(e.target.value)} placeholder="CONT-..." />
            <div className="input-wrapper" style={{ flex: 1, minWidth: 140 }}>
              <label className="input-label">الحالة</label>
              <select className="input-field" value={status} onChange={(e) => setStatusLocal(e.target.value as PurchaseStatus)}>
                <option value={Status.DRAFT}>مسودة</option>
                <option value={Status.ORDERED}>تم الطلب</option>
                <option value={Status.IN_TRANSIT}>في الشحن</option>
              </select>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
              <strong>الأصناف</strong>
              <Button variant="ghost" leftIcon={<Plus size={16} />} onClick={() => setLines((p) => [...p, emptyLine()])}>إضافة سطر</Button>
            </div>
            {lines.map((line, idx) => (
              <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 12, marginBottom: 10, background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex gap-md" style={{ flexWrap: 'wrap', alignItems: 'end' }}>
                  <div className="input-wrapper" style={{ minWidth: 120 }}>
                    <label className="input-label">النوع</label>
                    <select className="input-field" value={line.kind} onChange={(e) => updateLine(idx, { kind: e.target.value as PurchaseItemKind })}>
                      {Object.entries(PURCHASE_KIND_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                    </select>
                  </div>
                  <Input label="الاسم / الوصف *" value={line.name} onChange={(e) => updateLine(idx, { name: e.target.value })} placeholder={line.kind === Kind.VEHICLE ? 'جيتور X70 بلس' : 'فلتر زيت تويوتا'} />
                  <Input label={line.kind === Kind.VEHICLE ? 'VIN' : 'رقم OEM / القطعة'} value={line.reference} onChange={(e) => updateLine(idx, { reference: e.target.value })} />
                </div>
                <div className="flex gap-md" style={{ flexWrap: 'wrap', marginTop: 8 }}>
                  <Input label="الماركة" value={line.brand} onChange={(e) => updateLine(idx, { brand: e.target.value })} />
                  <Input label="الموديل" value={line.model} onChange={(e) => updateLine(idx, { model: e.target.value })} />
                  {line.kind === Kind.VEHICLE && (
                    <>
                      <Input label="السنة" type="number" value={line.year || ''} onChange={(e) => updateLine(idx, { year: Number(e.target.value) || undefined })} />
                      <Input label="اللون" value={line.color || ''} onChange={(e) => updateLine(idx, { color: e.target.value })} />
                    </>
                  )}
                  <Input label="الكمية" type="number" value={line.quantity} onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) || 1 })} />
                  <Input label="تكلفة الوحدة (دج)" type="number" value={line.unitCost || ''} onChange={(e) => updateLine(idx, { unitCost: Number(e.target.value) || 0 })} />
                  <Input label="سعر بيع متوقع" type="number" value={line.expectedSellPrice || ''} onChange={(e) => updateLine(idx, { expectedSellPrice: Number(e.target.value) || undefined })} />
                  <Button variant="ghost" onClick={() => removeLine(idx)} leftIcon={<Trash2 size={14} />}>حذف</Button>
                </div>
              </div>
            ))}
          </div>
          <Input label="ملاحظات الشحن" value={shippingNotes} onChange={(e) => setShippingNotes(e.target.value)} />
          <Input label="ملاحظات عامة" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </Modal>

      <Modal isOpen={supplierOpen} onClose={() => setSupplierOpen(false)} title="بيانات المورد" maxWidth="480px"
        footer={<><Button variant="ghost" onClick={() => setSupplierOpen(false)}>إلغاء</Button><Button variant="primary" onClick={() => { updateSupplier(supForm); setSupplierOpen(false); setToast('تم حفظ بيانات المورد'); setTimeout(() => setToast(''), 2500); }}>حفظ</Button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="اسم المورد" value={supForm.name} onChange={(e) => setSupForm({ ...supForm, name: e.target.value })} />
          <Input label="البلد" value={supForm.country} onChange={(e) => setSupForm({ ...supForm, country: e.target.value })} />
          <Input label="اسم المسؤول" value={supForm.contactName} onChange={(e) => setSupForm({ ...supForm, contactName: e.target.value })} />
          <Input label="الهاتف" value={supForm.phone} onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })} />
          <Input label="واتساب" value={supForm.whatsapp} onChange={(e) => setSupForm({ ...supForm, whatsapp: e.target.value })} />
          <Input label="البريد" value={supForm.email} onChange={(e) => setSupForm({ ...supForm, email: e.target.value })} />
          <div className="input-wrapper">
            <label className="input-label">ملاحظات</label>
            <textarea className="input-field" style={{ minHeight: 60 }} value={supForm.notes} onChange={(e) => setSupForm({ ...supForm, notes: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

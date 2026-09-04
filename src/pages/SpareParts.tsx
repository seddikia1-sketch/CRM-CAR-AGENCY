import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter as FilterIcon,
  ShoppingCart,
  AlertTriangle,
  PackagePlus,
  Printer,
  Download,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { PartModal } from '../components/SpareParts/PartModal';
import { SellPartModal } from '../components/SpareParts/SellPartModal';
import { SmartPartRequestModal } from '../components/SpareParts/SmartPartRequestModal';
import { useSpareParts } from '../hooks/useSpareParts';
import { useClients } from '../hooks/useClients';
import { useInventory } from '../hooks/useInventory';
import { usePurchases } from '../hooks/usePurchases';
import type { SparePart, SparePartFormData, PartCategory, PartSale } from '../types';
import { PurchaseItemKind } from '../types';
import { PART_CATEGORIES } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';
import { printPartSaleInvoice } from '../utils/printInvoice';
import { downloadCsv, csvTimestamp } from '../utils/exportCsv';
import '../components/Clients/ClientTable.css';

const LOW_STOCK_PO_KEY = 'crm_po_from_low_stock';

function categoryToPurchaseKind(cat: string): string {
  if (cat === 'filters') return PurchaseItemKind.FILTER;
  if (cat === 'oils') return PurchaseItemKind.OIL;
  return PurchaseItemKind.SPARE_PART;
}

export const SpareParts: React.FC = () => {
  const navigate = useNavigate();
  const { parts, sales, addPart, updatePart, deletePart, sellPart, searchParts, lowStockParts, stats } = useSpareParts();
  const { clients } = useClients();
  const { vehicles } = useInventory();
  const { supplier } = usePurchases();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PartCategory | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | undefined>(undefined);
  const [sellPartData, setSellPartData] = useState<SparePart | null>(null);
  const [smartOpen, setSmartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stock' | 'sales'>('stock');

  const handleOpenModal = (part?: SparePart) => {
    setEditingPart(part);
    setIsModalOpen(true);
  };

  const handleSave = (data: SparePartFormData) => {
    if (editingPart) updatePart(editingPart.id, data);
    else addPart(data);
    setIsModalOpen(false);
    setEditingPart(undefined);
  };

  const handleSellConfirm = (
    qty: number,
    price: number,
    clientId?: string,
    clientName?: string,
    notes?: string,
    vehicleId?: string,
    vehicleVin?: string,
    vehicleLabel?: string,
    invoiceNumber?: string
  ) => {
    if (sellPartData) {
      sellPart(sellPartData.id, qty, price, clientId, clientName, notes, vehicleId, vehicleVin, vehicleLabel, invoiceNumber);
    }
  };

  const reprintSale = (s: PartSale) => {
    const part = parts.find((p) => p.id === s.partId);
    const year = s.soldAt ? new Date(s.soldAt).getFullYear() : new Date().getFullYear();
    const fallback = `PART-${year}-R${s.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
    printPartSaleInvoice({
      part: {
        name: s.partName,
        partNumber: part?.partNumber || '',
        brand: part?.brand || '',
      },
      quantity: s.quantity,
      unitPrice: s.unitPrice,
      clientName: s.clientName,
      vehicleLabel: s.vehicleLabel,
      vehicleVin: s.vehicleVin,
      notes: s.notes,
      soldAt: s.soldAt,
      invoiceNumber: s.invoiceNumber || fallback,
    });
  };

  const exportSalesCsv = () => {
    downloadCsv(
      `مبيعات_قطع_${csvTimestamp()}.csv`,
      [
        'رقم الفاتورة', 'القطعة', 'الكمية', 'سعر الوحدة', 'الإجمالي',
        'التكلفة', 'الربح', 'العميل', 'السيارة', 'VIN', 'ملاحظات', 'التاريخ',
      ],
      sales.map((s) => [
        s.invoiceNumber || '',
        s.partName,
        s.quantity,
        s.unitPrice,
        s.totalPrice,
        s.costTotal,
        s.profit,
        s.clientName || '',
        s.vehicleLabel || '',
        s.vehicleVin || '',
        s.notes || '',
        s.soldAt ? new Date(s.soldAt).toLocaleDateString('ar-DZ') : '',
      ])
    );
  };

  const createPoFromLowStock = () => {
    if (lowStockParts.length === 0) return;
    const lines = lowStockParts.map((p) => {
      const need = Math.max((p.minStock || 2) * 3 - (p.quantity || 0), 1);
      return {
        kind: categoryToPurchaseKind(p.category),
        name: p.name,
        reference: p.partNumber || '',
        brand: p.brand || '',
        model: '',
        quantity: need,
        unitCost: p.costPrice || 0,
        expectedSellPrice: p.sellingPrice || undefined,
        notes: `نقص مخزون — متوفر ${p.quantity} / حد أدنى ${p.minStock}`,
      };
    });
    sessionStorage.setItem(LOW_STOCK_PO_KEY, JSON.stringify(lines));
    navigate('/purchases?fromLowStock=1');
  };

  const filtered = React.useMemo(() => {
    return searchParts(searchQuery, categoryFilter || undefined);
  }, [searchParts, searchQuery, categoryFilter, parts]);

  const getCategoryLabel = (key: string) => {
    return PART_CATEGORIES.find((c) => c.key === key)?.label || key;
  };

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex', height: '100%' }}>
      <div className="page-header flex justify-between items-center" style={{ marginBottom: 0, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">قطع الغيار وخدمات ما بعد البيع</h1>
          <p className="page-description">
            مخزون · بيع · طلب ذكي بالـ VIN والكتالوج · تجهيز أمر شراء للمورد.
          </p>
        </div>
        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
          <Button variant="primary" leftIcon={<Sparkles size={18} />} onClick={() => setSmartOpen(true)}>
            طلب قطعة ذكي
          </Button>
          {lowStockParts.length > 0 && (
            <Button variant="ghost" leftIcon={<PackagePlus size={18} />} onClick={createPoFromLowStock}>
              أمر شراء من النقص ({lowStockParts.length})
            </Button>
          )}
          <Button variant="ghost" leftIcon={<Plus size={18} />} onClick={() => handleOpenModal()}>
            إضافة قطعة
          </Button>
        </div>
      </div>

      <div className="glass-card" style={{
        padding: '12px 16px',
        border: '1px solid rgba(124,108,240,0.3)',
        background: 'rgba(124,108,240,0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
      }}>
        <Sparkles size={18} color="#a89bff" />
        <span style={{ flex: 1, fontSize: '0.9rem' }}>
          <strong>طلب قطعة ذكي:</strong> أدخل VIN السيارة + اسم القطعة (أو صورة كمرجع) → النظام يعرض أرقام OEM من الكتالوج ويجهّز أمر شراء / رسالة واتساب للمورد.
        </span>
        <Button variant="primary" leftIcon={<Sparkles size={16} />} onClick={() => setSmartOpen(true)}>
          ابدأ الطلب
        </Button>
      </div>

      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 130px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>أنواع القطع</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.totalParts}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 130px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>إجمالي الكمية</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.totalQuantity}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 130px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>تنبيه نقص</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: stats.lowStock > 0 ? '#ef4444' : '#22c55e' }}>
            {stats.lowStock}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 130px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>إيرادات القطع</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {formatCurrency(stats.totalSalesRevenue)}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 130px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>أرباح القطع</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e' }}>
            {formatCurrency(stats.totalSalesProfit)}
          </div>
        </div>
      </div>

      {lowStockParts.length > 0 && (
        <div className="glass-card" style={{ padding: '12px 16px', border: '1px solid #f0932b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <AlertTriangle size={20} color="#f0932b" />
            <span style={{ fontSize: '0.9rem', flex: 1 }}>
              تنبيه نقص: {lowStockParts.length} قطعة — اقترح طلب من الصين (3× الحد الأدنى)
            </span>
            <Button variant="primary" leftIcon={<PackagePlus size={16} />} onClick={createPoFromLowStock}>
              إنشاء أمر شراء
            </Button>
            <Link to="/purchases" style={{ fontWeight: 700, fontSize: '0.85rem' }}>المشتريات →</Link>
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lowStockParts.slice(0, 8).map((p) => {
              const need = Math.max((p.minStock || 2) * 3 - (p.quantity || 0), 1);
              return (
                <div key={p.id} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span>
                    <strong>{p.name}</strong>
                    {p.partNumber ? ` · ${p.partNumber}` : ''}
                    {p.brand ? ` · ${p.brand}` : ''}
                  </span>
                  <span style={{ color: '#f0932b', whiteSpace: 'nowrap' }}>
                    متوفر {p.quantity} → اطلب {need}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-sm" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant={activeTab === 'stock' ? 'primary' : 'ghost'} onClick={() => setActiveTab('stock')}>
          المخزون
        </Button>
        <Button variant={activeTab === 'sales' ? 'primary' : 'ghost'} onClick={() => setActiveTab('sales')}>
          سجل المبيعات ({sales.length})
        </Button>
        {activeTab === 'sales' && sales.length > 0 && (
          <Button variant="ghost" leftIcon={<Download size={16} />} onClick={exportSalesCsv}>
            تصدير CSV
          </Button>
        )}
      </div>

      {activeTab === 'stock' && (
        <div className="glass-card flex-col" style={{ flex: 1, display: 'flex' }}>
          <div className="flex gap-md justify-between items-center" style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: '260px' }}>
              <Input
                placeholder="بحث بالاسم أو الرقم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>
            <div className="flex items-center gap-sm">
              <FilterIcon size={16} color="var(--text-secondary)" />
              <select
                className="input-field"
                style={{ width: '160px' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as PartCategory | '')}
              >
                <option value="">كل التصنيفات</option>
                {PART_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-container">
            {filtered.length === 0 ? (
              <div className="empty-state"><p>لا توجد قطع غيار. أضف قطعة جديدة أو استخدم الطلب الذكي.</p></div>
            ) : (
              <table className="client-table">
                <thead>
                  <tr>
                    <th>القطعة</th>
                    <th>التصنيف</th>
                    <th>الماركة</th>
                    <th>الكمية</th>
                    <th>سعر البيع</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="client-name-cell">
                          <p className="client-name">{p.name}</p>
                          <p className="client-phone">{p.partNumber || '-'}</p>
                        </div>
                      </td>
                      <td>{getCategoryLabel(p.category)}</td>
                      <td>{p.brand || 'عام'}</td>
                      <td>
                        <span style={{ color: p.quantity <= p.minStock ? '#ef4444' : 'inherit', fontWeight: 600 }}>
                          {p.quantity}
                        </span>
                        {p.quantity <= p.minStock && <span style={{ marginRight: 4 }}>⚠️</span>}
                      </td>
                      <td>{formatCurrency(p.sellingPrice)}</td>
                      <td>
                        <div className="flex gap-sm">
                          <button
                            className="icon-btn"
                            title="بيع"
                            disabled={p.quantity < 1}
                            onClick={() => setSellPartData(p)}
                            style={{ opacity: p.quantity < 1 ? 0.4 : 1 }}
                          >
                            <ShoppingCart size={16} />
                          </button>
                          <button className="icon-btn" title="تعديل" onClick={() => handleOpenModal(p)}>
                            ✏️
                          </button>
                          <button
                            className="icon-btn"
                            title="حذف"
                            onClick={() => {
                              if (window.confirm('حذف هذه القطعة؟')) deletePart(p.id);
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="glass-card" style={{ padding: 'var(--spacing-md)', flex: 1 }}>
          {sales.length === 0 ? (
            <div className="empty-state"><p>لا توجد مبيعات قطع غيار بعد.</p></div>
          ) : (
            <div className="table-container">
              <table className="client-table">
                <thead>
                  <tr>
                    <th>الفاتورة</th>
                    <th>القطعة</th>
                    <th>الكمية</th>
                    <th>الإجمالي</th>
                    <th>الربح</th>
                    <th>العميل</th>
                    <th>السيارة (VIN)</th>
                    <th>التاريخ</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.invoiceNumber || '—'}</td>
                      <td>{s.partName}</td>
                      <td>{s.quantity}</td>
                      <td>{formatCurrency(s.totalPrice)}</td>
                      <td style={{ color: '#22c55e', fontWeight: 600 }}>{formatCurrency(s.profit)}</td>
                      <td>{s.clientName || '-'}</td>
                      <td>
                        {s.vehicleLabel || s.vehicleVin ? (
                          <span title={s.vehicleVin}>
                            {s.vehicleLabel || s.vehicleVin}
                          </span>
                        ) : '-'}
                      </td>
                      <td>{formatDate(s.soldAt)}</td>
                      <td>
                        <button
                          className="icon-btn"
                          title="طباعة الفاتورة"
                          onClick={() => reprintSale(s)}
                        >
                          <Printer size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <PartModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPart(undefined); }}
        onSave={handleSave}
        initialData={editingPart}
        title={editingPart ? 'تعديل قطعة غيار' : 'إضافة قطعة غيار'}
      />

      <SellPartModal
        isOpen={!!sellPartData}
        onClose={() => setSellPartData(null)}
        part={sellPartData}
        clients={clients}
        vehicles={vehicles}
        onConfirm={handleSellConfirm}
      />

      <SmartPartRequestModal
        isOpen={smartOpen}
        onClose={() => setSmartOpen(false)}
        vehicles={vehicles}
        parts={parts}
        supplier={supplier}
      />
    </div>
  );
};

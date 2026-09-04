import React, { useState } from 'react';
import { Plus, Search, Filter as FilterIcon, Download } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { InventoryTable } from '../components/Inventory/InventoryTable';
import { InventoryModal } from '../components/Inventory/InventoryModal';
import { SellModal } from '../components/Inventory/SellModal';
import { useInventory } from '../hooks/useInventory';
import { useClients } from '../hooks/useClients';
import { InventoryStatus } from '../types';
import type { Vehicle, VehicleFormData } from '../types';
import { INVENTORY_STATUSES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import { vehicleTotalCost, vehicleProfit } from '../utils/vehicleFinance';
import { downloadCsv, csvTimestamp } from '../utils/exportCsv';

export const Inventory: React.FC = () => {
  const {
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    sellVehicle,
    searchVehicles,
    stats,
  } = useInventory();
  const { clients } = useClients();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);
  const [sellVehicleData, setSellVehicleData] = useState<Vehicle | null>(null);

  const handleOpenModal = (vehicle?: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(undefined);
  };

  const handleSave = (data: VehicleFormData) => {
    if (editingVehicle) {
      if (editingVehicle.status === 'sold' && data.status !== 'sold') {
        const ok = window.confirm(
          'هذه السيارة مسجّلة كمباعة.\nإعادتها للمتاح ستظهرها في المتجر مجدداً.\nهل أنت متأكد؟'
        );
        if (!ok) return;
      }
      updateVehicle(editingVehicle.id, data);
    } else {
      addVehicle(data);
    }
    handleCloseModal();
  };

  const handleSellConfirm = (clientId: string, clientName: string, finalPrice: number) => {
    if (sellVehicleData) {
      sellVehicle(sellVehicleData.id, clientId, clientName, finalPrice);
      setSellVehicleData(null);
    }
  };

  const filtered = React.useMemo(() => {
    return searchVehicles(searchQuery, statusFilter || undefined);
  }, [searchVehicles, searchQuery, statusFilter, vehicles]);

  const exportCsv = () => {
    const list = filtered.length ? filtered : vehicles;
    downloadCsv(
      `مخزون_سيارات_${csvTimestamp()}.csv`,
      [
        'الماركة', 'الموديل', 'السنة', 'اللون', 'VIN', 'الحالة', 'سعر الاستيراد',
        'شحن', 'جمرك', 'إصلاح', 'أخرى', 'التكلفة الإجمالية', 'سعر البيع', 'الربح',
        'العميل', 'تاريخ البيع',
      ],
      list.map((v) => [
        v.brand,
        v.model,
        v.year,
        v.color || '',
        v.vin || '',
        INVENTORY_STATUSES.find((s) => s.key === v.status)?.label || v.status,
        v.importPrice || 0,
        v.shippingCost || 0,
        v.customsCost || 0,
        v.repairCost || 0,
        v.otherCosts || 0,
        vehicleTotalCost(v),
        v.sellingPrice || 0,
        v.status === 'sold' ? vehicleProfit(v) : '',
        v.soldToClientName || '',
        v.soldAt ? new Date(v.soldAt).toLocaleDateString('ar-DZ') : '',
      ])
    );
  };

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex', height: '100%' }}>
      <div className="page-header flex justify-between items-center" style={{ marginBottom: 0, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">المخزون</h1>
          <p className="page-description">
            السيارات + المصاريف (شحن/جمرك/إصلاح) + ربح الصفقة. المباعة تُخفى من المتجر تلقائياً.
          </p>
        </div>
        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
          <Button variant="ghost" leftIcon={<Download size={18} />} onClick={exportCsv}>
            تصدير CSV
          </Button>
          <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => handleOpenModal()}>
            إضافة سيارة
          </Button>
        </div>
      </div>

      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '12px 20px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>متاحة</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{stats.available}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 20px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>في الشحن / جمرك</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{stats.inTransit + stats.customs}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 20px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>محجوزة</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.reserved}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 20px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>مباعة</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6c9fff' }}>{stats.sold}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 20px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>إجمالي الأرباح</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#22c55e' }}>{formatCurrency(stats.totalProfit)}</div>
        </div>
      </div>

      <div className="glass-card flex-col" style={{ flex: 1, display: 'flex' }}>
        <div className="flex gap-md justify-between items-center" style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <div style={{ width: 'min(280px, 100%)' }}>
            <Input
              placeholder="بحث بالماركة أو الموديل أو العميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div className="flex items-center gap-sm">
            <FilterIcon size={16} color="var(--text-secondary)" />
            <select
              className="input-field"
              style={{ width: '180px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InventoryStatus | '')}
            >
              <option value="">كل الحالات</option>
              {INVENTORY_STATUSES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <InventoryTable
          vehicles={filtered}
          onEdit={handleOpenModal}
          onDelete={(id) => {
            if (window.confirm('هل أنت متأكد من حذف هذه السيارة من المخزون؟')) {
              deleteVehicle(id);
            }
          }}
          onSell={(v) => setSellVehicleData(v)}
        />
      </div>

      <InventoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingVehicle}
        title={editingVehicle ? 'تعديل سيارة' : 'إضافة سيارة للمخزون'}
      />

      <SellModal
        isOpen={!!sellVehicleData}
        onClose={() => setSellVehicleData(null)}
        vehicle={sellVehicleData}
        clients={clients}
        onConfirm={handleSellConfirm}
      />
    </div>
  );
};

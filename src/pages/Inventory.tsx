import React, { useState } from 'react';
import { Plus, Search, Filter as FilterIcon } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { InventoryTable } from '../components/Inventory/InventoryTable';
import { InventoryModal } from '../components/Inventory/InventoryModal';
import { useInventory } from '../hooks/useInventory';
import type { Vehicle, VehicleFormData, InventoryStatus } from '../types';
import { INVENTORY_STATUSES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

export const Inventory: React.FC = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, searchVehicles, stats } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);

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
      updateVehicle(editingVehicle.id, data);
    } else {
      addVehicle(data);
    }
    handleCloseModal();
  };

  const filtered = React.useMemo(() => {
    return searchVehicles(searchQuery, statusFilter || undefined);
  }, [searchVehicles, searchQuery, statusFilter, vehicles]);

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex', height: '100%' }}>
      <div className="page-header flex justify-between items-center" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">المخزون</h1>
          <p className="page-description">إدارة مخزون السيارات الصينية (جديدة وأقل من 3 سنوات).</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => handleOpenModal()}>
          إضافة سيارة
        </Button>
      </div>

      {/* إحصائيات سريعة */}
      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '12px 20px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>إجمالي السيارات</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 20px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>متاحة</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{stats.available}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 20px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>في الطريق / جمرك</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a855f7' }}>{stats.inTransit + stats.customs}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 20px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>قيمة المخزون</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{formatCurrency(stats.totalValue)}</div>
        </div>
      </div>

      <div className="glass-card flex-col" style={{ flex: 1, display: 'flex' }}>
        <div className="flex gap-md justify-between items-center" style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ width: '280px' }}>
            <Input
              placeholder="بحث بالماركة أو الموديل أو VIN..."
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
        />
      </div>

      <InventoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingVehicle}
        title={editingVehicle ? 'تعديل سيارة' : 'إضافة سيارة للمخزون'}
      />
    </div>
  );
};

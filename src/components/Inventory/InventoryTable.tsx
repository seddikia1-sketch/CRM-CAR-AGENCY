import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import type { Vehicle } from '../../types';
import { INVENTORY_STATUSES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../UI/Badge';
import '../Clients/ClientTable.css';

interface InventoryTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  vehicles,
  onEdit,
  onDelete,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  React.useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  if (vehicles.length === 0) {
    return (
      <div className="empty-state">
        <p>لا توجد سيارات في المخزون حالياً.</p>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    return INVENTORY_STATUSES.find((s) => s.key === status) || { label: status, emoji: '', color: '#999' };
  };

  return (
    <div className="table-container">
      <table className="client-table">
        <thead>
          <tr>
            <th>السيارة</th>
            <th>الحالة</th>
            <th>الكيلومترات</th>
            <th>الحاوية</th>
            <th>سعر البيع</th>
            <th>حالة المخزون</th>
            <th>تاريخ الإضافة</th>
            <th className="action-column">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => {
            const statusInfo = getStatusInfo(v.status);
            return (
              <tr key={v.id}>
                <td>
                  <div className="client-name-cell">
                    <p className="client-name">{v.brand} {v.model}</p>
                    <p className="client-phone">{v.year} • {v.color || '-'}</p>
                  </div>
                </td>
                <td>
                  {v.condition === 'new' ? '🆕 جديدة' : '📅 أقل من 3 سنوات'}
                </td>
                <td>{v.mileage ? v.mileage.toLocaleString() + ' كم' : '-'}</td>
                <td>{v.containerNumber || '-'}</td>
                <td>{v.sellingPrice ? formatCurrency(v.sellingPrice) : '-'}</td>
                <td>
                  <Badge color={statusInfo.color} icon={statusInfo.emoji}>
                    {statusInfo.label}
                  </Badge>
                </td>
                <td>{formatDate(v.createdAt)}</td>
                <td className="action-column relative">
                  <div className="action-buttons">
                    <button className="icon-btn" onClick={(e) => toggleMenu(v.id, e)}>
                      <MoreHorizontal size={18} />
                    </button>
                    {activeMenu === v.id && (
                      <div className="action-menu glass-card" onClick={(e) => e.stopPropagation()}>
                        <button className="menu-item" onClick={() => { onEdit(v); setActiveMenu(null); }}>
                          <Edit size={16} /> تعديل
                        </button>
                        <button className="menu-item danger" onClick={() => { onDelete(v.id); setActiveMenu(null); }}>
                          <Trash2 size={16} /> حذف
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, UserCheck, Printer } from 'lucide-react';
import type { Vehicle } from '../../types';
import { INVENTORY_STATUSES } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { vehicleProfit, vehicleTotalCost } from '../../utils/vehicleFinance';
import { printVehicleSaleInvoice } from '../../utils/printInvoice';
import { Badge } from '../UI/Badge';
import '../Clients/ClientTable.css';

interface InventoryTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onSell: (vehicle: Vehicle) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  vehicles,
  onEdit,
  onDelete,
  onSell,
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

  const reprintInvoice = (v: Vehicle) => {
    if (!v.soldToClientName) return;
    const year = v.soldAt ? new Date(v.soldAt).getFullYear() : new Date().getFullYear();
    const fallback = `INV-${year}-R${v.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
    printVehicleSaleInvoice({
      vehicle: v,
      clientName: v.soldToClientName,
      finalPrice: v.sellingPrice || 0,
      soldAt: v.soldAt,
      invoiceNumber: v.invoiceNumber || fallback,
    });
    setActiveMenu(null);
  };

  return (
    <div className="table-container">
      <table className="client-table">
        <thead>
          <tr>
            <th>السيارة</th>
            <th>الحالة</th>
            <th>الكيلومترات</th>
            <th>سعر البيع</th>
            <th>الربح</th>
            <th>العميل</th>
            <th>حالة المخزون</th>
            <th className="action-column">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => {
            const statusInfo = getStatusInfo(v.status);
            const profit = vehicleProfit(v);
            const cost = vehicleTotalCost(v);
            return (
              <tr key={v.id}>
                <td>
                  <div className="client-name-cell">
                    <p className="client-name">{v.brand} {v.model}</p>
                    <p className="client-phone">
                      {v.year} • {v.color || '-'}
                      {v.invoiceNumber ? ` · ${v.invoiceNumber}` : ''}
                    </p>
                  </div>
                </td>
                <td>
                  {v.condition === 'new' ? '🆕 جديدة' : '📅 أقل من 3 سنوات'}
                </td>
                <td>{v.mileage ? v.mileage.toLocaleString() + ' كم' : '-'}</td>
                <td>{v.sellingPrice ? formatCurrency(v.sellingPrice) : '-'}</td>
                <td style={{ color: profit >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }} title={`تكلفة: ${cost}`}>
                  {v.status === 'sold' ? formatCurrency(profit) : (
                    <span style={{ opacity: 0.75, fontSize: '0.85rem' }} title="ربح تقديري">
                      ~{formatCurrency(profit)}
                    </span>
                  )}
                </td>
                <td>
                  {v.soldToClientName ? (
                    <span title={v.soldAt ? formatDate(v.soldAt) : ''}>
                      👤 {v.soldToClientName}
                    </span>
                  ) : '-'}
                </td>
                <td>
                  <Badge color={statusInfo.color} icon={statusInfo.emoji}>
                    {statusInfo.label}
                  </Badge>
                </td>
                <td className="action-column relative">
                  <div className="action-buttons">
                    <button className="icon-btn" onClick={(e) => toggleMenu(v.id, e)}>
                      <MoreHorizontal size={18} />
                    </button>
                    {activeMenu === v.id && (
                      <div className="action-menu glass-card" onClick={(e) => e.stopPropagation()}>
                        {v.status !== 'sold' && (
                          <button className="menu-item" onClick={() => { onSell(v); setActiveMenu(null); }}>
                            <UserCheck size={16} /> ربط بعميل وبيع
                          </button>
                        )}
                        {v.status === 'sold' && v.soldToClientName && (
                          <button className="menu-item" onClick={() => reprintInvoice(v)}>
                            <Printer size={16} /> طباعة الفاتورة
                          </button>
                        )}
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

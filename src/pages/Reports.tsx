import React from 'react';
import { useInventory } from '../hooks/useInventory';
import { formatCurrency } from '../utils/formatters';

export const Reports: React.FC = () => {
  const { getMonthlyProfits, stats, vehicles } = useInventory();
  const monthly = getMonthlyProfits();

  const soldVehicles = vehicles.filter((v) => v.status === 'sold');

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex' }}>
      <div className="page-header">
        <h1 className="page-title">تقارير الأرباح</h1>
        <p className="page-description">ملخص المبيعات والأرباح الشهرية لمكتب السيارات الصينية.</p>
      </div>

      {/* ملخص عام */}
      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '20px', flex: '1 1 200px' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>إجمالي السيارات المباعة</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.sold}</div>
        </div>
        <div className="glass-card" style={{ padding: '20px', flex: '1 1 200px' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>إجمالي الإيرادات</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {formatCurrency(soldVehicles.reduce((s, v) => s + (v.sellingPrice || 0), 0))}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px', flex: '1 1 200px' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>إجمالي الأرباح</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>
            {formatCurrency(stats.totalProfit)}
          </div>
        </div>
      </div>

      {/* جدول الأرباح الشهرية */}
      <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>الأرباح حسب الشهر</h3>

        {monthly.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>لا توجد مبيعات مسجلة بعد. قم بربط سيارة بعميل من صفحة المخزون.</p>
        ) : (
          <div className="table-container">
            <table className="client-table">
              <thead>
                <tr>
                  <th>الشهر</th>
                  <th>عدد المبيعات</th>
                  <th>الإيرادات</th>
                  <th>التكلفة</th>
                  <th>الربح</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m) => (
                  <tr key={m.month}>
                    <td style={{ fontWeight: 600 }}>{m.label}</td>
                    <td>{m.salesCount}</td>
                    <td>{formatCurrency(m.totalRevenue)}</td>
                    <td>{formatCurrency(m.totalCost)}</td>
                    <td style={{ fontWeight: 700, color: m.profit >= 0 ? '#22c55e' : '#ef4444' }}>
                      {formatCurrency(m.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* آخر المبيعات */}
      {soldVehicles.length > 0 && (
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)' }}>آخر المبيعات</h3>
          <div className="table-container">
            <table className="client-table">
              <thead>
                <tr>
                  <th>السيارة</th>
                  <th>العميل</th>
                  <th>تاريخ البيع</th>
                  <th>سعر البيع</th>
                  <th>الربح</th>
                </tr>
              </thead>
              <tbody>
                {soldVehicles
                  .sort((a, b) => (b.soldAt || '').localeCompare(a.soldAt || ''))
                  .slice(0, 10)
                  .map((v) => {
                    const profit = (v.sellingPrice || 0) - (v.importPrice || 0);
                    return (
                      <tr key={v.id}>
                        <td>{v.brand} {v.model} {v.year}</td>
                        <td>{v.soldToClientName || '-'}</td>
                        <td>{v.soldAt ? new Date(v.soldAt).toLocaleDateString('ar-DZ') : '-'}</td>
                        <td>{formatCurrency(v.sellingPrice || 0)}</td>
                        <td style={{ color: profit >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                          {formatCurrency(profit)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

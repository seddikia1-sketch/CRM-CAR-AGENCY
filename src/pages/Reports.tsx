import React, { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useSpareParts } from '../hooks/useSpareParts';
import { formatCurrency } from '../utils/formatters';

export const Reports: React.FC = () => {
  const { getMonthlyProfits, stats: invStats, vehicles } = useInventory();
  const { getMonthlyPartsProfits, stats: partsStats, sales: partSales } = useSpareParts();

  const [activeTab, setActiveTab] = useState<'cars' | 'parts'>('cars');

  const monthlyCars = getMonthlyProfits();
  const monthlyParts = getMonthlyPartsProfits();
  const soldVehicles = vehicles.filter((v) => v.status === 'sold');

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex' }}>
      <div className="page-header">
        <h1 className="page-title">تقارير الأرباح</h1>
        <p className="page-description">ملخص المبيعات والأرباح الشهرية (سيارات + قطع غيار).</p>
      </div>

      {/* تبويبات */}
      <div className="flex gap-sm">
        <button
          className={`input-field`}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            background: activeTab === 'cars' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'cars' ? 'white' : 'var(--text-primary)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
          }}
          onClick={() => setActiveTab('cars')}
        >
          🚗 أرباح السيارات
        </button>
        <button
          className={`input-field`}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            background: activeTab === 'parts' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'parts' ? 'white' : 'var(--text-primary)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
          }}
          onClick={() => setActiveTab('parts')}
        >
          🔧 أرباح قطع الغيار
        </button>
      </div>

      {/* ===== أرباح السيارات ===== */}
      {activeTab === 'cars' && (
        <>
          <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 200px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>سيارات مباعة</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{invStats.sold}</div>
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
                {formatCurrency(invStats.totalProfit)}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>الأرباح الشهرية — السيارات</h3>
            {monthlyCars.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>لا توجد مبيعات سيارات مسجلة بعد.</p>
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
                    {monthlyCars.map((m) => (
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

          {soldVehicles.length > 0 && (
            <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-md)' }}>آخر مبيعات السيارات</h3>
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
        </>
      )}

      {/* ===== أرباح قطع الغيار ===== */}
      {activeTab === 'parts' && (
        <>
          <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 200px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>عمليات البيع</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{partsStats.salesCount}</div>
            </div>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 200px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>إيرادات القطع</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {formatCurrency(partsStats.totalSalesRevenue)}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 200px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>أرباح القطع</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#22c55e' }}>
                {formatCurrency(partsStats.totalSalesProfit)}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>الأرباح الشهرية — قطع الغيار</h3>
            {monthlyParts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>لا توجد مبيعات قطع غيار مسجلة بعد.</p>
            ) : (
              <div className="table-container">
                <table className="client-table">
                  <thead>
                    <tr>
                      <th>الشهر</th>
                      <th>عدد العمليات</th>
                      <th>الإيرادات</th>
                      <th>التكلفة</th>
                      <th>الربح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyParts.map((m) => (
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

          {partSales.length > 0 && (
            <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-md)' }}>آخر مبيعات قطع الغيار</h3>
              <div className="table-container">
                <table className="client-table">
                  <thead>
                    <tr>
                      <th>القطعة</th>
                      <th>الكمية</th>
                      <th>العميل</th>
                      <th>السيارة (VIN)</th>
                      <th>التاريخ</th>
                      <th>الربح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partSales.slice(0, 15).map((s) => (
                      <tr key={s.id}>
                        <td>{s.partName}</td>
                        <td>{s.quantity}</td>
                        <td>{s.clientName || '-'}</td>
                        <td>{s.vehicleLabel || s.vehicleVin || '-'}</td>
                        <td>{new Date(s.soldAt).toLocaleDateString('ar-DZ')}</td>
                        <td style={{ color: '#22c55e', fontWeight: 600 }}>{formatCurrency(s.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

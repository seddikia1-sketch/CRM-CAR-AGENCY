import React, { useMemo, useState } from 'react';
import { Download, BarChart3 } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useSpareParts } from '../hooks/useSpareParts';
import { useMaintenance } from '../hooks/useMaintenance';
import { formatCurrency } from '../utils/formatters';
import { vehicleProfit, vehicleTotalCost } from '../utils/vehicleFinance';
import { downloadCsv, csvTimestamp } from '../utils/exportCsv';
import { Button } from '../components/UI/Button';

export const Reports: React.FC = () => {
  const { getMonthlyProfits, stats: invStats, vehicles } = useInventory();
  const { getMonthlyPartsProfits, stats: partsStats, sales: partSales } = useSpareParts();
  const { stats: maintStats } = useMaintenance();

  const [activeTab, setActiveTab] = useState<'summary' | 'cars' | 'parts'>('summary');
  const currentYear = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState<string>(String(currentYear));

  const monthlyCarsAll = getMonthlyProfits();
  const monthlyPartsAll = getMonthlyPartsProfits();
  const soldVehicles = vehicles.filter((v) => v.status === 'sold');

  const years = useMemo(() => {
    const set = new Set<number>([currentYear]);
    monthlyCarsAll.forEach((m) => set.add(Number(m.month.slice(0, 4))));
    monthlyPartsAll.forEach((m) => set.add(Number(m.month.slice(0, 4))));
    soldVehicles.forEach((v) => {
      if (v.soldAt) set.add(new Date(v.soldAt).getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [monthlyCarsAll, monthlyPartsAll, soldVehicles, currentYear]);

  const monthlyCars = useMemo(
    () => (yearFilter ? monthlyCarsAll.filter((m) => m.month.startsWith(yearFilter)) : monthlyCarsAll),
    [monthlyCarsAll, yearFilter]
  );
  const monthlyParts = useMemo(
    () => (yearFilter ? monthlyPartsAll.filter((m) => m.month.startsWith(yearFilter)) : monthlyPartsAll),
    [monthlyPartsAll, yearFilter]
  );

  const soldInYear = useMemo(() => {
    if (!yearFilter) return soldVehicles;
    return soldVehicles.filter((v) => v.soldAt && new Date(v.soldAt).getFullYear() === Number(yearFilter));
  }, [soldVehicles, yearFilter]);

  const carRevenue = soldInYear.reduce((s, v) => s + (v.sellingPrice || 0), 0);
  const carCost = soldInYear.reduce((s, v) => s + vehicleTotalCost(v), 0);
  const carProfit = soldInYear.reduce((s, v) => s + vehicleProfit(v), 0);

  const partsRevenueYear = useMemo(() => {
    return partSales
      .filter((s) => !yearFilter || new Date(s.soldAt).getFullYear() === Number(yearFilter))
      .reduce((sum, s) => sum + s.totalPrice, 0);
  }, [partSales, yearFilter]);
  const partsProfitYear = useMemo(() => {
    return partSales
      .filter((s) => !yearFilter || new Date(s.soldAt).getFullYear() === Number(yearFilter))
      .reduce((sum, s) => sum + s.profit, 0);
  }, [partSales, yearFilter]);

  const totalProfit = carProfit + partsProfitYear;
  const totalRevenue = carRevenue + partsRevenueYear + (maintStats.totalServiceRevenue || 0);

  const exportCarsMonthly = () => {
    downloadCsv(
      `ارباح_سيارات_${yearFilter || 'الكل'}_${csvTimestamp()}.csv`,
      ['الشهر', 'عدد المبيعات', 'الإيرادات', 'التكلفة', 'الربح'],
      monthlyCars.map((m) => [m.label, m.salesCount, m.totalRevenue, m.totalCost, m.profit])
    );
  };

  const exportPartsMonthly = () => {
    downloadCsv(
      `ارباح_قطع_${yearFilter || 'الكل'}_${csvTimestamp()}.csv`,
      ['الشهر', 'عدد العمليات', 'الإيرادات', 'التكلفة', 'الربح'],
      monthlyParts.map((m) => [m.label, m.salesCount, m.totalRevenue, m.totalCost, m.profit])
    );
  };

  const exportSoldCars = () => {
    downloadCsv(
      `مبيعات_سيارات_${yearFilter || 'الكل'}_${csvTimestamp()}.csv`,
      ['الماركة', 'الموديل', 'السنة', 'VIN', 'العميل', 'تاريخ البيع', 'سعر البيع', 'التكلفة الإجمالية', 'الربح'],
      soldInYear
        .sort((a, b) => (b.soldAt || '').localeCompare(a.soldAt || ''))
        .map((v) => [
          v.brand,
          v.model,
          v.year,
          v.vin || '',
          v.soldToClientName || '',
          v.soldAt ? new Date(v.soldAt).toLocaleDateString('ar-DZ') : '',
          v.sellingPrice || 0,
          vehicleTotalCost(v),
          vehicleProfit(v),
        ])
    );
  };

  const exportPartsSales = () => {
    const list = yearFilter
      ? partSales.filter((s) => new Date(s.soldAt).getFullYear() === Number(yearFilter))
      : partSales;
    downloadCsv(
      `مبيعات_قطع_${yearFilter || 'الكل'}_${csvTimestamp()}.csv`,
      ['القطعة', 'الكمية', 'سعر الوحدة', 'الإجمالي', 'التكلفة', 'الربح', 'العميل', 'السيارة', 'التاريخ'],
      list.map((s) => [
        s.partName,
        s.quantity,
        s.unitPrice,
        s.totalPrice,
        s.costTotal,
        s.profit,
        s.clientName || '',
        s.vehicleLabel || s.vehicleVin || '',
        new Date(s.soldAt).toLocaleDateString('ar-DZ'),
      ])
    );
  };

  const tabBtn = (key: typeof activeTab, label: string) => (
    <button
      type="button"
      className="input-field"
      style={{
        padding: '8px 16px',
        cursor: 'pointer',
        background: activeTab === key ? 'var(--accent-primary)' : 'var(--bg-secondary)',
        color: activeTab === key ? 'white' : 'var(--text-primary)',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
      }}
      onClick={() => setActiveTab(key)}
    >
      {label}
    </button>
  );

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex' }}>
      <div className="page-header flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={26} /> تقارير الأرباح
          </h1>
          <p className="page-description">
            ملخص مالي: سيارات (تكلفة كاملة) + قطع غيار + صيانة. تصدير CSV لـ Excel.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>السنة</label>
          <select
            className="input-field"
            style={{ width: 120 }}
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="">كل السنوات</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
        {tabBtn('summary', '📊 ملخص إجمالي')}
        {tabBtn('cars', '🚗 أرباح السيارات')}
        {tabBtn('parts', '🔧 أرباح قطع الغيار')}
      </div>

      {/* ===== ملخص إجمالي ===== */}
      {activeTab === 'summary' && (
        <>
          <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 180px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>إجمالي الإيرادات</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {formatCurrency(totalRevenue)}
              </div>
              <small style={{ color: 'var(--text-secondary)' }}>
                سيارات + قطع + صيانة
              </small>
            </div>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 180px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ربح السيارات</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: carProfit >= 0 ? '#22c55e' : '#ef4444' }}>
                {formatCurrency(carProfit)}
              </div>
              <small style={{ color: 'var(--text-secondary)' }}>{soldInYear.length} سيارة مباعة</small>
            </div>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 180px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ربح القطع</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#22c55e' }}>
                {formatCurrency(partsProfitYear)}
              </div>
              <small style={{ color: 'var(--text-secondary)' }}>إيراد: {formatCurrency(partsRevenueYear)}</small>
            </div>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 180px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>إيرادات الصيانة</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                {formatCurrency(maintStats.totalServiceRevenue || 0)}
              </div>
              <small style={{ color: 'var(--text-secondary)' }}>{maintStats.totalRecords} عملية</small>
            </div>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 180px', border: '1px solid rgba(34,197,94,0.35)' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>صافي الربح (سيارات+قطع)</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: totalProfit >= 0 ? '#22c55e' : '#ef4444' }}>
                {formatCurrency(totalProfit)}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 12 }}>تفاصيل سريعة — {yearFilter || 'كل السنوات'}</h3>
            <div className="table-container">
              <table className="client-table">
                <thead>
                  <tr>
                    <th>البند</th>
                    <th>العدد</th>
                    <th>الإيرادات</th>
                    <th>التكلفة</th>
                    <th>الربح / الإيراد</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>سيارات مباعة</td>
                    <td>{soldInYear.length}</td>
                    <td>{formatCurrency(carRevenue)}</td>
                    <td>{formatCurrency(carCost)}</td>
                    <td style={{ fontWeight: 700, color: carProfit >= 0 ? '#22c55e' : '#ef4444' }}>
                      {formatCurrency(carProfit)}
                    </td>
                  </tr>
                  <tr>
                    <td>مبيعات قطع الغيار</td>
                    <td>
                      {partSales.filter(
                        (s) => !yearFilter || new Date(s.soldAt).getFullYear() === Number(yearFilter)
                      ).length}
                    </td>
                    <td>{formatCurrency(partsRevenueYear)}</td>
                    <td>—</td>
                    <td style={{ fontWeight: 700, color: '#22c55e' }}>{formatCurrency(partsProfitYear)}</td>
                  </tr>
                  <tr>
                    <td>خدمات الصيانة</td>
                    <td>{maintStats.totalRecords}</td>
                    <td>{formatCurrency(maintStats.totalServiceRevenue || 0)}</td>
                    <td>—</td>
                    <td>{formatCurrency(maintStats.totalServiceRevenue || 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              تكلفة السيارة = سعر الاستيراد + شحن + جمرك + إصلاح + مصاريف أخرى (من بطاقة المخزون).
            </p>
          </div>
        </>
      )}

      {/* ===== أرباح السيارات ===== */}
      {activeTab === 'cars' && (
        <>
          <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 160px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>سيارات مباعة</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{soldInYear.length}</div>
              <small style={{ color: 'var(--text-secondary)' }}>إجمالي السجل: {invStats.sold}</small>
            </div>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 160px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>الإيرادات</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {formatCurrency(carRevenue)}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 160px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>التكلفة الإجمالية</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(carCost)}</div>
            </div>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 160px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>صافي الربح</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: carProfit >= 0 ? '#22c55e' : '#ef4444' }}>
                {formatCurrency(carProfit)}
              </div>
            </div>
          </div>

          <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
            <Button variant="ghost" leftIcon={<Download size={16} />} onClick={exportCarsMonthly}>
              تصدير الأرباح الشهرية
            </Button>
            <Button variant="ghost" leftIcon={<Download size={16} />} onClick={exportSoldCars}>
              تصدير قائمة المبيعات
            </Button>
          </div>

          <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>الأرباح الشهرية — السيارات</h3>
            {monthlyCars.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>لا توجد مبيعات في الفترة المحددة.</p>
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

          {soldInYear.length > 0 && (
            <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-md)' }}>مبيعات السيارات (تكلفة كاملة)</h3>
              <div className="table-container">
                <table className="client-table">
                  <thead>
                    <tr>
                      <th>السيارة</th>
                      <th>العميل</th>
                      <th>تاريخ البيع</th>
                      <th>سعر البيع</th>
                      <th>التكلفة</th>
                      <th>الربح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldInYear
                      .sort((a, b) => (b.soldAt || '').localeCompare(a.soldAt || ''))
                      .slice(0, 20)
                      .map((v) => {
                        const profit = vehicleProfit(v);
                        const cost = vehicleTotalCost(v);
                        return (
                          <tr key={v.id}>
                            <td>{v.brand} {v.model} {v.year}</td>
                            <td>{v.soldToClientName || '-'}</td>
                            <td>{v.soldAt ? new Date(v.soldAt).toLocaleDateString('ar-DZ') : '-'}</td>
                            <td>{formatCurrency(v.sellingPrice || 0)}</td>
                            <td>{formatCurrency(cost)}</td>
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
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 160px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>عمليات البيع</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{partsStats.salesCount}</div>
            </div>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 160px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>إيرادات القطع</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {formatCurrency(partsStats.totalSalesRevenue)}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '20px', flex: '1 1 160px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>أرباح القطع</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>
                {formatCurrency(partsStats.totalSalesProfit)}
              </div>
            </div>
          </div>

          <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
            <Button variant="ghost" leftIcon={<Download size={16} />} onClick={exportPartsMonthly}>
              تصدير الأرباح الشهرية
            </Button>
            <Button variant="ghost" leftIcon={<Download size={16} />} onClick={exportPartsSales}>
              تصدير سجل المبيعات
            </Button>
          </div>

          <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>الأرباح الشهرية — قطع الغيار</h3>
            {monthlyParts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>لا توجد مبيعات في الفترة المحددة.</p>
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

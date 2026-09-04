import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import { useInventory } from '../hooks/useInventory';
import { useBookings } from '../hooks/useBookings';
import { usePayments } from '../hooks/usePayments';
import { useSpareParts } from '../hooks/useSpareParts';
import { usePurchases } from '../hooks/usePurchases';
import { useMaintenance } from '../hooks/useMaintenance';
import {
  formatCurrency,
  formatPhone,
  getWhatsAppLink,
  daysSince,
} from '../utils/formatters';
import { RecentActivity } from '../components/Dashboard/RecentActivity';
import { FUNNEL_STAGES, DEFAULT_FOLLOW_UP_DAYS } from '../utils/constants';
import { InventoryStatus } from '../types';
import { vehicleProfit } from '../utils/vehicleFinance';
import {
  Users, Package, Calendar, Wallet, MessageCircle, AlertCircle, Store,
  Truck, ShoppingCart, Wrench, Sun, Droplets, TrendingUp, HardDrive,
} from 'lucide-react';

function followUpMessage(name: string, interest?: string) {
  const car = interest?.trim();
  if (car) {
    return `السلام عليكم ${name}،\nنتواصل بخصوص اهتمامكم بـ ${car}.\nهل ما زلتم مهتمين؟ يمكن ترتيب معاينة في تندوف.\nالمعرض: https://seddikia1-sketch.github.io/CRM-CAR-AGENCY/#/store`;
  }
  return `السلام عليكم ${name}،\nنتواصل بخصوص اهتمامكم بسياراتنا.\nالمعرض:\nhttps://seddikia1-sketch.github.io/CRM-CAR-AGENCY/#/store`;
}

export const Dashboard: React.FC = () => {
  const { getStats, clients, updateLastContact } = useClients();
  const { stats: inv, vehicles } = useInventory();
  const { stats: bookStats, todayBookings, upcomingBookings } = useBookings();
  const { totalReceived, totalDeposits } = usePayments();
  const { lowStockParts, stats: partStats } = useSpareParts();
  const { stats: purchaseStats, orders } = usePurchases();
  const { getDueServices } = useMaintenance();
  const stats = getStats();
  const dueServices = getDueServices().slice(0, 6);

  const maxClientsInStage = Math.max(...Object.values(stats.clientsByStage), 1);
  const followUps = stats.followUpNeeded.slice(0, 8);
  const todayStr = new Date().toISOString().slice(0, 10);
  const newClientsToday = useMemo(
    () => clients.filter((c) => (c.createdAt || '').slice(0, 10) === todayStr).length,
    [clients, todayStr]
  );
  const pipelineCars = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          v.status === InventoryStatus.IN_TRANSIT ||
          v.status === InventoryStatus.CUSTOMS ||
          v.status === InventoryStatus.RESERVED
      ),
    [vehicles]
  );
  const openPurchases = useMemo(
    () => orders.filter((o) => o.status !== 'received' && o.status !== 'cancelled').slice(0, 5),
    [orders]
  );
  const attentionCount =
    followUps.length + todayBookings.length + lowStockParts.length + pipelineCars.length + dueServices.length;

  const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  const soldThisMonth = useMemo(
    () =>
      vehicles.filter(
        (v) => v.status === 'sold' && v.soldAt && v.soldAt.slice(0, 7) === monthKey
      ),
    [vehicles, monthKey]
  );
  const monthCarProfit = soldThisMonth.reduce((s, v) => s + vehicleProfit(v), 0);
  const totalCarProfit = inv.totalProfit || 0;
  const totalPartsProfit = partStats.totalSalesProfit || 0;

  const backupWarning = useMemo(() => {
    const raw = localStorage.getItem('crm_last_backup_at');
    if (!raw) return { show: true, days: null as number | null, label: 'لم يتم عمل نسخة احتياطية بعد' };
    const t = new Date(raw).getTime();
    if (Number.isNaN(t)) return { show: true, days: null, label: 'لم يتم عمل نسخة احتياطية بعد' };
    const days = Math.floor((Date.now() - t) / 86400000);
    if (days >= 7) return { show: true, days, label: `آخر نسخة منذ ${days} يوماً` };
    return { show: false, days, label: '' };
  }, []);

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex' }}>
      <div className="page-header flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sun size={26} color="#f59e0b" /> لوحة اليوم
          </h1>
          <p className="page-description">
            متابعات · مواعيد · شحنات · نقص قطع · صيانة. حد المتابعة: {DEFAULT_FOLLOW_UP_DAYS} أيام.
          </p>
        </div>
        <a href={`${window.location.pathname}#/store`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <button type="button" style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent-primary)', color: '#fff',
            padding: '10px 14px', borderRadius: 10, fontWeight: 600, border: 'none', cursor: 'pointer',
          }}>
            <Store size={18} /> فتح المتجر
          </button>
        </a>
      </div>

      {attentionCount > 0 && (
        <div className="glass-card" style={{
          padding: '12px 16px', border: '1px solid rgba(245,158,11,0.45)',
          display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
        }}>
          <AlertCircle size={18} color="#f59e0b" />
          <strong>يتطلب انتباهك:</strong>
          <span>{followUps.length} متابعة</span><span>·</span>
          <span>{todayBookings.length} موعد اليوم</span><span>·</span>
          <span>{pipelineCars.length} شحن/حجز</span><span>·</span>
          <span>{lowStockParts.length} قطعة ناقصة</span><span>·</span>
          <span>{dueServices.length} صيانة</span>
        </div>
      )}

      {backupWarning.show && (
        <div className="glass-card" style={{
          padding: '12px 16px', border: '1px solid rgba(59,130,246,0.4)',
          display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
          background: 'rgba(59,130,246,0.08)',
        }}>
          <HardDrive size={18} color="#3b82f6" />
          <span style={{ flex: 1 }}>
            <strong>نسخ احتياطي:</strong> {backupWarning.label}. البيانات على هذا المتصفح فقط.
          </span>
          <Link to="/settings" style={{ fontWeight: 700, fontSize: '0.85rem' }}>الإعدادات → تصدير</Link>
        </div>
      )}

      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        {[
          { label: 'عملاء نشطون', value: stats.activeClients, sub: `جدد اليوم: ${newClientsToday}` },
          { label: 'متاحة للبيع', value: inv.available, sub: `شحن+جمرك: ${inv.inTransit + inv.customs}`, color: '#22c55e' },
          { label: 'مواعيد اليوم', value: bookStats.today, sub: `قادمة: ${bookStats.upcoming}`, color: 'var(--accent-primary)' },
          { label: 'متابعات', value: stats.followUpNeeded.length, sub: `بعد ${DEFAULT_FOLLOW_UP_DAYS} أيام`, color: stats.followUpNeeded.length ? '#f59e0b' : '#22c55e' },
        ].map((k) => (
          <div key={k.label} className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 140px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{k.label}</div>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 6, color: (k as {color?: string}).color }}>{k.value}</p>
            <small style={{ color: 'var(--text-secondary)' }}>{k.sub}</small>
          </div>
        ))}
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 140px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>مقبوضات</div>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 6, color: '#22c55e' }}>{formatCurrency(totalReceived)}</p>
          <small style={{ color: 'var(--text-secondary)' }}>عربونات: {formatCurrency(totalDeposits)}</small>
        </div>
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 140px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>قيمة التفاوض</div>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 6, color: 'var(--accent-primary)' }}>{formatCurrency(stats.totalNegotiationValue)}</p>
          <small style={{ color: 'var(--text-secondary)' }}>قطع ناقصة: {partStats.lowStock}</small>
        </div>
      </div>

      <div className="glass-card" style={{
        padding: '14px 16px',
        display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center',
        border: '1px solid rgba(34,197,94,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={20} color="#22c55e" />
          <strong>ملخص مالي</strong>
        </div>
        <div style={{ fontSize: '0.9rem' }}>
          ربح هذا الشهر (سيارات): <strong style={{ color: monthCarProfit >= 0 ? '#22c55e' : '#ef4444' }}>{formatCurrency(monthCarProfit)}</strong>
          <span style={{ color: 'var(--text-secondary)' }}> · {soldThisMonth.length} صفقة</span>
        </div>
        <div style={{ fontSize: '0.9rem' }}>
          إجمالي ربح السيارات: <strong style={{ color: '#22c55e' }}>{formatCurrency(totalCarProfit)}</strong>
        </div>
        <div style={{ fontSize: '0.9rem' }}>
          إجمالي ربح القطع: <strong style={{ color: '#22c55e' }}>{formatCurrency(totalPartsProfit)}</strong>
        </div>
        <Link to="/reports" style={{ marginRight: 'auto', fontSize: '0.85rem', fontWeight: 700 }}>التقارير التفصيلية →</Link>
      </div>

      <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
        {[
          { to: '/clients', label: 'عميل جديد' },
          { to: '/inventory', label: 'إضافة سيارة' },
          { to: '/purchases', label: 'أمر شراء' },
          { to: '/bookings', label: 'حجز موعد' },
          { to: '/maintenance', label: 'صيانة' },
          { to: '/spare-parts', label: 'قطع الغيار' },
          { to: '/messages', label: 'واتساب' },
        ].map((x) => (
          <Link key={x.to} to={x.to} style={{ textDecoration: 'none' }}>
            <span style={{
              display: 'inline-block', padding: '8px 12px', borderRadius: 999,
              border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem',
            }}>{x.label}</span>
          </Link>
        ))}
      </div>

      <div className="flex gap-md" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ flex: '1 1 300px', padding: 'var(--spacing-md)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <MessageCircle size={18} color="#25D366" /> متابعة واتساب
            </h3>
            <Link to="/clients" style={{ fontSize: '0.8rem' }}>العملاء</Link>
          </div>
          {followUps.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>لا متابعات متأخرة.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {followUps.map((c) => {
                const interest = [c.brand, c.model].filter(Boolean).join(' ') || c.vehicleInterest || '';
                return (
                  <div key={c.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 10, background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                      <div dir="ltr" style={{ direction: 'ltr', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {formatPhone(c.phone)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {interest || 'بدون موديل'} · منذ {daysSince(c.lastContactAt)} يوم
                      </div>
                    </div>
                    <a
                      href={getWhatsAppLink(c.phone, followUpMessage(c.name, interest))}
                      target="_blank" rel="noreferrer"
                      onClick={() => updateLastContact(c.id)}
                      style={{
                        background: '#25D366', color: '#fff', padding: '8px 12px', borderRadius: 10,
                        fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none', whiteSpace: 'nowrap',
                      }}
                    >
                      واتساب
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ flex: '1 1 260px', padding: 'var(--spacing-md)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={18} /> مواعيد
            </h3>
            <Link to="/bookings" style={{ fontSize: '0.8rem' }}>الحجوزات</Link>
          </div>
          {todayBookings.length === 0 && upcomingBookings.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>لا مواعيد قريبة.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...todayBookings, ...upcomingBookings.filter((b) => !todayBookings.find((t) => t.id === b.id))]
                .slice(0, 6)
                .map((b) => (
                  <div key={b.id} style={{ fontSize: '0.85rem', padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong>{b.time} — {b.clientName}</strong>
                      {b.clientPhone && (
                        <a href={getWhatsAppLink(b.clientPhone, `السلام عليكم ${b.clientName}،\nتذكير بموعدكم الساعة ${b.time}.`)} target="_blank" rel="noreferrer" style={{ color: '#25D366' }}>
                          <MessageCircle size={16} />
                        </a>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>{b.date} · {b.type}</div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ flex: '1 1 260px', padding: 'var(--spacing-md)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={18} /> شحنات
            </h3>
            <Link to="/inventory" style={{ fontSize: '0.8rem' }}>المخزون</Link>
          </div>
          {pipelineCars.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>لا سيارات في الشحن/الجمرك/محجوزة.</p>
          ) : (
            pipelineCars.slice(0, 6).map((v) => (
              <div key={v.id} style={{ fontSize: '0.85rem', marginBottom: 6 }}>
                <strong>{v.brand} {v.model}</strong> {v.color ? `· ${v.color}` : ''}
                <div style={{ color: 'var(--text-secondary)' }}>
                  {v.status === 'in_transit' && 'في الشحن'}
                  {v.status === 'customs' && 'جمركة'}
                  {v.status === 'reserved' && 'محجوزة'}
                </div>
              </div>
            ))
          )}
          <div style={{ marginTop: 12, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
            <div className="flex justify-between" style={{ marginBottom: 6 }}>
              <strong style={{ fontSize: '0.9rem' }}><ShoppingCart size={14} /> مشتريات مفتوحة</strong>
              <Link to="/purchases" style={{ fontSize: '0.8rem' }}>الكل</Link>
            </div>
            {openPurchases.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>لا أوامر مفتوحة ({purchaseStats.openCount})</p>
            ) : (
              openPurchases.map((o) => (
                <div key={o.id} style={{ fontSize: '0.8rem', marginBottom: 4 }}>
                  <strong>{o.orderNumber}</strong> — {o.items.length} أصناف · {formatCurrency(o.totalCost)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-md" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ flex: '2 1 280px', padding: 'var(--spacing-lg)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>مراحل المبيعات</h3>
          {FUNNEL_STAGES.map((stage) => {
            const count = stats.clientsByStage[stage.key] || 0;
            const percentage = Math.max((count / maxClientsInStage) * 100, 2);
            return (
              <div key={stage.key} className="flex items-center gap-md" style={{ marginBottom: 8 }}>
                <div style={{ width: 130, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stage.emoji} {stage.label}</div>
                <div style={{ flex: 1, height: 22, backgroundColor: 'var(--bg-tertiary)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: stage.color }} />
                </div>
                <div style={{ width: 36, textAlign: 'right', fontWeight: 600 }}>{count}</div>
              </div>
            );
          })}
        </div>

        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wrench size={18} color="#f0932b" /> اطلب من الصين
              </h3>
              <Link to="/purchases" style={{ fontSize: '0.8rem' }}>مشتريات</Link>
            </div>
            {lowStockParts.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>لا نقص حالياً.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {lowStockParts.slice(0, 6).map((p) => {
                  const need = Math.max((p.minStock || 2) * 3 - (p.quantity || 0), 1);
                  return (
                    <div key={p.id} style={{ fontSize: '0.85rem' }}>
                      <strong>{p.name}</strong>
                      <div style={{ color: '#ef4444' }}>متوفر {p.quantity} → اطلب {need}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Droplets size={18} color="#3b82f6" /> تذكير صيانة
              </h3>
              <Link to="/maintenance" style={{ fontSize: '0.8rem' }}>الصيانة</Link>
            </div>
            {dueServices.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>لا صيانة مستحقة.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dueServices.map((item) => {
                  const p = item.profile;
                  const label = `${p.brand} ${p.model}`;
                  const msg = `السلام عليكم ${p.clientName || ''}،\nتذكير بصيانة ${label}. المتبقي تقريباً ${item.kmRemaining} كم.`;
                  return (
                    <div key={p.id} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <strong>{label}</strong>
                        <div style={{ color: item.isOverdue ? '#ef4444' : '#f59e0b' }}>
                          {item.isOverdue ? 'متأخرة' : 'قريبة'} · {item.kmRemaining} كم
                        </div>
                      </div>
                      {p.clientPhone && (
                        <a href={getWhatsAppLink(p.clientPhone, msg)} target="_blank" rel="noreferrer" style={{ color: '#25D366' }}>
                          <MessageCircle size={18} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <RecentActivity activities={stats.recentActivities} />
        </div>
      </div>
    </div>
  );
};

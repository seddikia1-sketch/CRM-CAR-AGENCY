import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import { useInventory } from '../hooks/useInventory';
import { useBookings } from '../hooks/useBookings';
import { usePayments } from '../hooks/usePayments';
import { useSpareParts } from '../hooks/useSpareParts';
import { usePurchases } from '../hooks/usePurchases';
import {
  formatCurrency,
  formatPhone,
  getWhatsAppLink,
  formatRelativeTime,
  daysSince,
} from '../utils/formatters';
import { RecentActivity } from '../components/Dashboard/RecentActivity';
import { FUNNEL_STAGES, DEFAULT_FOLLOW_UP_DAYS } from '../utils/constants';
import { InventoryStatus } from '../types';
import {
  Users,
  Package,
  Calendar,
  Wallet,
  MessageCircle,
  AlertCircle,
  Store,
  Truck,
  ShoppingCart,
  Wrench,
  Sun,
} from 'lucide-react';

function followUpMessage(name: string, interest?: string) {
  const car = interest?.trim();
  if (car) {
    return `السلام عليكم ${name}،\nنتواصل معكم بخصوص اهتمامكم بـ ${car}.\nهل ما زلتم مهتمين؟ يمكننا ترتيب معاينة في تندوف.\nمعرضنا: https://seddikia1-sketch.github.io/CRM-CAR-AGENCY/#/store`;
  }
  return `السلام عليكم ${name}،\nنتواصل معكم بخصوص اهتمامكم بسياراتنا.\nيمكنكم تصفح المعرض هنا:\nhttps://seddikia1-sketch.github.io/CRM-CAR-AGENCY/#/store\nأو أخبرونا بالموديل المطلوب.`;
}

export const Dashboard: React.FC = () => {
  const { getStats, clients, updateLastContact } = useClients();
  const { stats: inv, vehicles } = useInventory();
  const { stats: bookStats, todayBookings, upcomingBookings } = useBookings();
  const { totalReceived, totalDeposits } = usePayments();
  const { lowStockParts, stats: partStats } = useSpareParts();
  const { stats: purchaseStats, orders } = usePurchases();
  const stats = getStats();

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
    followUps.length + todayBookings.length + lowStockParts.length + pipelineCars.length;

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex' }}>
      <div
        className="page-header flex justify-between items-center"
        style={{ marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sun size={26} color="#f59e0b" /> لوحة اليوم
          </h1>
          <p className="page-description">
            ما يحتاج إجراء الآن — متابعات، مواعيد، شحنات، ونقص قطع. حد المتابعة: {DEFAULT_FOLLOW_UP_DAYS}{' '}
            أيام.
          </p>
        </div>
        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
          <a
            href={`${window.location.pathname}#/store`}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--accent-primary)',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: 10,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Store size={18} /> فتح المتجر
            </button>
          </a>
        </div>
      </div>

      {attentionCount > 0 && (
        <div
          className="glass-card"
          style={{
            padding: '12px 16px',
            border: '1px solid rgba(245,158,11,0.45)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <AlertCircle size={18} color="#f59e0b" />
          <strong>يتطلب انتباهك:</strong>
          <span>{followUps.length} متابعة</span>
          <span>·</span>
          <span>{todayBookings.length} موعد اليوم</span>
          <span>·</span>
          <span>{pipelineCars.length} سيارة شحن/حجز</span>
          <span>·</span>
          <span>{lowStockParts.length} قطعة ناقصة</span>
        </div>
      )}

      {/* KPIs */}
      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 140px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
            }}
          >
            <Users size={16} /> عملاء نشطون
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 6 }}>{stats.activeClients}</p>
          <small style={{ color: 'var(--text-secondary)' }}>
            جدد اليوم: {newClientsToday} · الكل: {stats.totalClients}
          </small>
        </div>
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 140px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
            }}
          >
            <Package size={16} /> متاحة للبيع
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 6, color: '#22c55e' }}>
            {inv.available}
          </p>
          <small style={{ color: 'var(--text-secondary)' }}>
            شحن+جمركة: {inv.inTransit + inv.customs} · محجوزة: {inv.reserved}
          </small>
        </div>
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 140px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
            }}
          >
            <Calendar size={16} /> مواعيد اليوم
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 6, color: 'var(--accent-primary)' }}>
            {bookStats.today}
          </p>
          <small style={{ color: 'var(--text-secondary)' }}>قادمة: {bookStats.upcoming}</small>
        </div>
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 140px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
            }}
          >
            <AlertCircle size={16} /> متابعات متأخرة
          </div>
          <p
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              marginTop: 6,
              color: stats.followUpNeeded.length ? '#f59e0b' : '#22c55e',
            }}
          >
            {stats.followUpNeeded.length}
          </p>
          <small style={{ color: 'var(--text-secondary)' }}>بعد {DEFAULT_FOLLOW_UP_DAYS} أيام بلا تواصل</small>
        </div>
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 140px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
            }}
          >
            <Wallet size={16} /> مقبوضات
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 6, color: '#22c55e' }}>
            {formatCurrency(totalReceived)}
          </p>
          <small style={{ color: 'var(--text-secondary)' }}>عربونات: {formatCurrency(totalDeposits)}</small>
        </div>
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 140px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>قيمة التفاوض</div>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 6, color: 'var(--accent-primary)' }}>
            {formatCurrency(stats.totalNegotiationValue)}
          </p>
          <small style={{ color: 'var(--text-secondary)' }}>
            تحويل: {stats.conversionRate.toFixed(1)}% · قطع ناقصة: {partStats.lowStock}
          </small>
        </div>
      </div>

      {/* اختصارات */}
      <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
        {[
          { to: '/clients', label: 'عميل جديد' },
          { to: '/inventory', label: 'إضافة سيارة' },
          { to: '/purchases', label: 'أمر شراء' },
          { to: '/bookings', label: 'حجز موعد' },
          { to: '/payments', label: 'تسجيل دفعة' },
          { to: '/spare-parts', label: 'قطع الغيار' },
          { to: '/messages', label: 'رسالة واتساب' },
        ].map((x) => (
          <Link key={x.to} to={x.to} style={{ textDecoration: 'none' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: 999,
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            >
              {x.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="flex gap-md" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* متابعة واتساب */}
        <div className="glass-card" style={{ flex: '1 1 300px', padding: 'var(--spacing-md)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <MessageCircle size={18} color="#25D366" /> يحتاجون متابعة واتساب
            </h3>
            <Link to="/clients" style={{ fontSize: '0.8rem' }}>
              كل العملاء
            </Link>
          </div>
          {followUps.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              لا يوجد عملاء متأخرون عن المتابعة. أحسنت!
            </p>
          ) : (
            <div className="flex-col gap-sm" style={{ display: 'flex' }}>
              {followUps.map((c) => {
                const interest =
                  [c.brand, c.model].filter(Boolean).join(' ') || c.vehicleInterest || '';
                const days = daysSince(c.lastContactAt);
                return (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: 'rgba(245,158,11,0.08)',
                      border: '1px solid rgba(245,158,11,0.2)',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                      <div
                        dir="ltr"
                        style={{
                          direction: 'ltr',
                          textAlign: 'left',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {formatPhone(c.phone)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {interest || 'بدون موديل'} · منذ {days} يوم
                      </div>
                    </div>
                    <a
                      href={getWhatsAppLink(c.phone, followUpMessage(c.name, interest))}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => updateLastContact(c.id)}
                      title="فتح واتساب وتسجيل التواصل"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#25D366',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: 10,
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <MessageCircle size={16} /> واتساب
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* مواعيد */}
        <div className="glass-card" style={{ flex: '1 1 260px', padding: 'var(--spacing-md)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={18} /> مواعيد اليوم / القادمة
            </h3>
            <Link to="/bookings" style={{ fontSize: '0.8rem' }}>
              الحجوزات
            </Link>
          </div>
          {todayBookings.length === 0 && upcomingBookings.slice(0, 3).length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              لا مواعيد قريبة. <Link to="/bookings">أضف حجزاً</Link>
            </p>
          ) : (
            <div className="flex-col gap-sm" style={{ display: 'flex' }}>
              {[...todayBookings, ...upcomingBookings.filter((b) => !todayBookings.find((t) => t.id === b.id))]
                .slice(0, 6)
                .map((b) => (
                  <div
                    key={b.id}
                    style={{
                      fontSize: '0.85rem',
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div className="flex justify-between" style={{ gap: 8 }}>
                      <strong>
                        {b.time} — {b.clientName}
                      </strong>
                      {b.clientPhone && (
                        <a
                          href={getWhatsAppLink(
                            b.clientPhone,
                            `السلام عليكم ${b.clientName}،\nتذكير بموعدكم اليوم الساعة ${b.time}.`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#25D366' }}
                          title="واتساب"
                        >
                          <MessageCircle size={16} />
                        </a>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {b.date} · {b.type}
                      {b.vehicleBrand ? ` · ${b.vehicleBrand} ${b.vehicleModel || ''}` : ''}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* شحنات ومشتريات */}
        <div className="glass-card" style={{ flex: '1 1 260px', padding: 'var(--spacing-md)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={18} /> شحنات وحجوزات سيارات
            </h3>
            <Link to="/inventory" style={{ fontSize: '0.8rem' }}>
              المخزون
            </Link>
          </div>
          {pipelineCars.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              لا سيارات في الشحن أو الجمركة أو محجوزة حالياً.
            </p>
          ) : (
            <div className="flex-col gap-sm" style={{ display: 'flex' }}>
              {pipelineCars.slice(0, 6).map((v) => (
                <div key={v.id} style={{ fontSize: '0.85rem' }}>
                  <strong>
                    {v.brand} {v.model}
                  </strong>{' '}
                  {v.color ? `· ${v.color}` : ''}
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {v.status === 'in_transit' && 'في الشحن'}
                    {v.status === 'customs' && 'جمركة'}
                    {v.status === 'reserved' && 'محجوزة'}
                    {v.containerNumber ? ` · حاوية ${v.containerNumber}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 14, borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem' }}>
                <ShoppingCart size={16} /> مشتريات مفتوحة
              </h4>
              <Link to="/purchases" style={{ fontSize: '0.8rem' }}>
                الكل
              </Link>
            </div>
            {openPurchases.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                لا أوامر شراء مفتوحة ({purchaseStats.openCount})
              </p>
            ) : (
              openPurchases.map((o) => (
                <div key={o.id} style={{ fontSize: '0.8rem', marginBottom: 6 }}>
                  <strong>{o.orderNumber}</strong> — {o.items.length} أصناف ·{' '}
                  {formatCurrency(o.totalCost)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-md" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div className="glass-card flex-col" style={{ flex: '2 1 280px', padding: 'var(--spacing-lg)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>مراحل المبيعات</h3>
          <div className="flex-col gap-sm">
            {FUNNEL_STAGES.map((stage) => {
              const count = stats.clientsByStage[stage.key] || 0;
              const percentage = Math.max((count / maxClientsInStage) * 100, 2);
              return (
                <div key={stage.key} className="flex items-center gap-md">
                  <div style={{ width: '130px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {stage.emoji} {stage.label}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: '22px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: stage.color,
                        transition: 'width 1s ease-out',
                      }}
                    />
                  </div>
                  <div style={{ width: '36px', textAlign: 'right', fontWeight: 600 }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wrench size={18} color="#f0932b" /> نقص قطع الغيار
              </h3>
              <Link to="/spare-parts" style={{ fontSize: '0.8rem' }}>
                المخزون
              </Link>
            </div>
            {lowStockParts.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>لا يوجد نقص حالياً.</p>
            ) : (
              <div className="flex-col gap-sm" style={{ display: 'flex' }}>
                {lowStockParts.slice(0, 6).map((p) => (
                  <div key={p.id} style={{ fontSize: '0.85rem' }}>
                    <strong>{p.name}</strong>
                    <div style={{ color: '#ef4444' }}>
                      الكمية: {p.quantity} (الحد {p.minStock})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <RecentActivity activities={stats.recentActivities} />
        </div>
      </div>
    </div>
  );
};

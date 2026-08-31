import React from 'react';
import { Link } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import { useInventory } from '../hooks/useInventory';
import { useBookings } from '../hooks/useBookings';
import { usePayments } from '../hooks/usePayments';
import { formatCurrency, formatPhone, getWhatsAppLink } from '../utils/formatters';
import { RecentActivity } from '../components/Dashboard/RecentActivity';
import { FUNNEL_STAGES } from '../utils/constants';
import { Users, Package, Calendar, Wallet, MessageCircle, AlertCircle, Store } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { getStats, clients, updateLastContact } = useClients();
  const { stats: inv } = useInventory();
  const { stats: bookStats, todayBookings, upcomingBookings } = useBookings();
  const { totalReceived, totalDeposits } = usePayments();
  const stats = getStats();

  const maxClientsInStage = Math.max(...Object.values(stats.clientsByStage), 1);
  const followUps = stats.followUpNeeded.slice(0, 5);

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex' }}>
      <div className="page-header flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">لوحة التحكم</h1>
          <p className="page-description">ملخص المبيعات، المخزون، المواعيد، والمتابعات.</p>
        </div>
        <a href={`${window.location.pathname}#/store`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <button
            type="button"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--accent-primary)', color: '#fff',
              padding: '10px 14px', borderRadius: 10, fontWeight: 600,
            }}
          >
            <Store size={18} /> فتح المتجر
          </button>
        </a>
      </div>

      {/* KPIs */}
      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 150px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <Users size={16} /> عملاء نشطون
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 6 }}>{stats.activeClients}</p>
          <small style={{ color: 'var(--text-secondary)' }}>من أصل {stats.totalClients}</small>
        </div>
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 150px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <Package size={16} /> سيارات متاحة
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 6, color: '#22c55e' }}>{inv.available}</p>
          <small style={{ color: 'var(--text-secondary)' }}>مشحونة: {inv.inTransit + inv.customs}</small>
        </div>
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 150px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <Calendar size={16} /> مواعيد اليوم
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 6, color: 'var(--accent-primary)' }}>{bookStats.today}</p>
          <small style={{ color: 'var(--text-secondary)' }}>قادمة: {bookStats.upcoming}</small>
        </div>
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 150px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <Wallet size={16} /> مقبوضات
          </div>
          <p style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: 6, color: '#22c55e' }}>{formatCurrency(totalReceived)}</p>
          <small style={{ color: 'var(--text-secondary)' }}>عربونات: {formatCurrency(totalDeposits)}</small>
        </div>
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '1 1 150px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>قيمة التفاوض</div>
          <p style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: 6, color: 'var(--accent-primary)' }}>
            {formatCurrency(stats.totalNegotiationValue)}
          </p>
          <small style={{ color: 'var(--text-secondary)' }}>تحويل: {stats.conversionRate.toFixed(1)}%</small>
        </div>
      </div>

      {/* اختصارات */}
      <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
        {[
          { to: '/clients', label: 'عميل جديد' },
          { to: '/inventory', label: 'إضافة سيارة' },
          { to: '/bookings', label: 'حجز موعد' },
          { to: '/payments', label: 'تسجيل دفعة' },
          { to: '/messages', label: 'رسالة واتساب' },
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
                  <div style={{ flex: 1, height: '22px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: stage.color, transition: 'width 1s ease-out' }} />
                  </div>
                  <div style={{ width: '36px', textAlign: 'right', fontWeight: 600 }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
            <h3 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={18} color="#f0932b" /> يحتاجون متابعة
            </h3>
            {followUps.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>لا يوجد عملاء متأخرون عن المتابعة.</p>
            ) : (
              <div className="flex-col gap-sm" style={{ display: 'flex' }}>
                {followUps.map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                      <div dir="ltr" style={{ direction: 'ltr', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {formatPhone(c.phone)}
                      </div>
                    </div>
                    <a
                      href={getWhatsAppLink(c.phone, `السلام عليكم ${c.name}،\nنتواصل معكم بخصوص اهتمامكم بسياراتنا.`)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => updateLastContact(c.id)}
                      title="واتساب"
                      style={{ color: '#25D366' }}
                    >
                      <MessageCircle size={20} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
            <h3 style={{ marginBottom: 10 }}>مواعيد اليوم / القادمة</h3>
            {(todayBookings.length === 0 && upcomingBookings.slice(0, 3).length === 0) ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>لا مواعيد قريبة. <Link to="/bookings">أضف حجزاً</Link></p>
            ) : (
              <div className="flex-col gap-sm" style={{ display: 'flex' }}>
                {[...todayBookings, ...upcomingBookings.filter((b) => !todayBookings.find((t) => t.id === b.id))].slice(0, 5).map((b) => (
                  <div key={b.id} style={{ fontSize: '0.85rem' }}>
                    <strong>{b.time}</strong> — {b.clientName}
                    <div style={{ color: 'var(--text-secondary)' }}>{b.date} · {b.type}</div>
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

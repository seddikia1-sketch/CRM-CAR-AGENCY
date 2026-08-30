import React from 'react';
import { useClients } from '../hooks/useClients';
import { formatCurrency } from '../utils/formatters';
import { RecentActivity } from '../components/Dashboard/RecentActivity';
import { FUNNEL_STAGES } from '../utils/constants';

export const Dashboard: React.FC = () => {
  const { getStats } = useClients();
  const stats = getStats();

  const maxClientsInStage = Math.max(...Object.values(stats.clientsByStage), 1);

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex' }}>
      <div className="page-header" style={{ marginBottom: 'var(--spacing-md)' }}>
        <h1 className="page-title">لوحة التحكم</h1>
        <p className="page-description">نظرة عامة على مراحل البيع وأداء المبيعات.</p>
      </div>
      
      {/* KPIs */}
      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card flex-col gap-sm" style={{ padding: 'var(--spacing-lg)', flex: '1 1 200px' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>إجمالي قيد التفاوض</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {formatCurrency(stats.totalNegotiationValue)}
          </p>
        </div>
        <div className="glass-card flex-col gap-sm" style={{ padding: 'var(--spacing-lg)', flex: '1 1 200px' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>العملاء النشطون</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {stats.activeClients}
          </p>
        </div>
        <div className="glass-card flex-col gap-sm" style={{ padding: 'var(--spacing-lg)', flex: '1 1 200px' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>نسبة التحويل</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-success)' }}>
            {stats.conversionRate.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="flex gap-md" style={{ alignItems: 'flex-start' }}>
        {/* Visual Funnel */}
        <div className="glass-card flex-col" style={{ flex: 2, padding: 'var(--spacing-lg)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>مراحل المبيعات</h3>
          <div className="flex-col gap-sm">
            {FUNNEL_STAGES.map((stage) => {
              const count = stats.clientsByStage[stage.key] || 0;
              const percentage = Math.max((count / maxClientsInStage) * 100, 2);

              return (
                <div key={stage.key} className="flex items-center gap-md">
                  <div style={{ width: '150px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {stage.emoji} {stage.label}
                  </div>
                  <div style={{ flex: 1, height: '24px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${percentage}%`, 
                        backgroundColor: stage.color,
                        transition: 'width 1s ease-out'
                      }} 
                    />
                  </div>
                  <div style={{ width: '40px', textAlign: 'right', fontWeight: 600 }}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ flex: 1 }}>
          <RecentActivity activities={stats.recentActivities} />
        </div>
      </div>
    </div>
  );
};

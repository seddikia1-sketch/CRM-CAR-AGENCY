import React from 'react';
import { FunnelStage } from '../../types';
import type { ActivityLog } from '../../types';
import { STAGE_MAP } from '../../utils/constants';
import { formatRelativeTime } from '../../utils/formatters';

interface RecentActivityProps {
  activities: ActivityLog[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActionText = (activity: ActivityLog) => {
    switch (activity.action) {
      case 'created':
        return 'تم إضافته إلى النظام';
      case 'moved':
        return `تم نقله إلى ${STAGE_MAP[activity.toStage as FunnelStage]?.label || ''}`;
      case 'updated':
        return 'تم تحديث بياناته';
      case 'deleted':
        return 'تم حذفه من النظام';
      default:
        return 'حدث نشاط';
    }
  };

  const getActionColor = (activity: ActivityLog) => {
    if (activity.action === 'moved' && activity.toStage) {
      return STAGE_MAP[activity.toStage as FunnelStage]?.color || 'var(--accent-primary)';
    }
    if (activity.action === 'deleted') return 'var(--accent-danger)';
    if (activity.action === 'created') return 'var(--accent-success)';
    return 'var(--text-secondary)';
  };

  if (activities.length === 0) {
    return (
      <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>النشاطات الأخيرة</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>لا توجد نشاطات مسجلة.</p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 'var(--spacing-lg)' }}>
      <h3 style={{ marginBottom: 'var(--spacing-md)' }}>النشاطات الأخيرة</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {activities.map((activity) => (
          <div key={activity.id} style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: getActionColor(activity),
              marginTop: '6px'
            }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activity.clientName}</span>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{getActionText(activity)}</span>
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {formatRelativeTime(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

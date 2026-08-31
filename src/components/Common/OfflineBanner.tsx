import React, { useEffect, useState } from 'react';

export const OfflineBanner: React.FC = () => {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        background: '#b45309',
        color: '#fff',
        textAlign: 'center',
        padding: '8px 12px',
        paddingTop: 'max(8px, env(safe-area-inset-top))',
        fontSize: '0.85rem',
        fontWeight: 600,
      }}
    >
      لا يوجد اتصال بالإنترنت — يمكنك متابعة العمل؛ البيانات محفوظة على هذا الجهاز
    </div>
  );
};

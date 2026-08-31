import React, { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent);
}

export const InstallPrompt: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<any>(null);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem('crm_hide_install') === '1') return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // على iOS لا يوجد beforeinstallprompt — نعرض تلميحاً بعد ثوانٍ
    const t = window.setTimeout(() => {
      if (isIOS() && !isStandalone()) setVisible(true);
    }, 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      clearTimeout(t);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    setIosHelp(false);
    localStorage.setItem('crm_hide_install', '1');
  };

  const install = async () => {
    if (deferred) {
      deferred.prompt();
      const result = await deferred.userChoice;
      if (result?.outcome === 'accepted') setVisible(false);
      setDeferred(null);
      return;
    }
    if (isIOS()) setIosHelp(true);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        left: '12px',
        right: '12px',
        zIndex: 1000,
        maxWidth: '420px',
        margin: '0 auto',
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>ثبّت AutoCRM كتطبيق</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {iosHelp
                ? 'على الآيفون/الآيباد: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية».'
                : isIOS()
                ? 'أضفه للشاشة الرئيسية ليفتح بملء الشاشة مثل التطبيقات.'
                : isAndroid()
                ? 'ثبّته على هاتفك للوصول السريع والعمل بملء الشاشة.'
                : 'ثبّت التطبيق للوصول الأسرع من الشاشة الرئيسية.'}
            </div>
          </div>
          <button type="button" onClick={dismiss} aria-label="إغلاق" style={{ padding: '4px', color: 'var(--text-secondary)' }}>
            <X size={18} />
          </button>
        </div>

        {iosHelp && (
          <div
            style={{
              fontSize: '0.8rem',
              background: 'rgba(108,92,231,0.12)',
              borderRadius: '10px',
              padding: '10px',
              lineHeight: 1.6,
            }}
          >
            1) اضغط <Share size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> المشاركة<br />
            2) اختر «إضافة إلى الشاشة الرئيسية»<br />
            3) اضغط «إضافة»
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={install}
            style={{
              flex: 1,
              background: 'var(--accent-primary)',
              color: '#fff',
              borderRadius: '10px',
              padding: '10px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Download size={16} />
            {iosHelp ? 'حسناً' : isIOS() ? 'كيف أثبّت؟' : 'تثبيت'}
          </button>
          <button
            type="button"
            onClick={dismiss}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
            }}
          >
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
};

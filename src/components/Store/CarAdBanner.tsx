import React, { useState } from 'react';
import type { CatalogCar } from '../../data/storeCatalog';
import { formatCurrency } from '../../utils/formatters';
import { aiAdImageUrl, fallbackStudioUrl } from '../../utils/aiCarImage';

interface Props {
  car: CatalogCar;
  onClick?: () => void;
  compact?: boolean;
}

/**
 * ملصق إعلاني عمودي:
 * صورة مولَّدة تلقائياً حسب ماركة/موديل السيارة + نصوص الإعلان
 */
export const CarAdBanner: React.FC<Props> = ({ car, onClick, compact }) => {
  const aiUrl = aiAdImageUrl(car, true);
  const stockFallback = fallbackStudioUrl(car.id);
  // أولوية: صورة المخزون إن وُجدت → توليد AI → احتياطي
  const initial = car.images?.[0] || aiUrl;
  const [src, setSrc] = useState(initial);
  const [failedAi, setFailedAi] = useState(false);

  const onImgError = () => {
    if (!failedAi && src === aiUrl) {
      setFailedAi(true);
      setSrc(stockFallback);
    } else if (car.images?.[0] && src === car.images[0]) {
      setSrc(aiUrl);
    } else {
      setSrc(stockFallback);
    }
  };

  const bullets = [
    car.condition === 'new' || !car.mileage
      ? 'جودة مضمونة · ضمان شامل'
      : `${Number(car.mileage).toLocaleString('ar-DZ')} كم · حالة ممتازة`,
    car.price
      ? `سعر: ${formatCurrency(car.price)}`
      : 'أسعار تنافسية · استيراد موثوق',
    car.status === 'in_transit' || car.status === 'customs'
      ? 'في الطريق · توصيل إلى الجزائر'
      : 'توصيل سريع إلى الجزائر',
  ];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: 0,
        border: 'none',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'center',
        position: 'relative',
        aspectRatio: compact ? '3 / 4.6' : '9 / 15',
        minHeight: compact ? 400 : 500,
        background: 'radial-gradient(ellipse at 50% 25%, #2e1065 0%, #0a0a12 50%, #000 100%)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
      }}
    >
      {/* نيون */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse at 15% 85%, rgba(59,130,246,0.4) 0%, transparent 42%),
          radial-gradient(ellipse at 90% 15%, rgba(168,85,247,0.45) 0%, transparent 40%)
        `,
      }} />

      {/* شارة */}
      <div style={{
        position: 'absolute', top: 12, left: 10, zIndex: 5,
        background: 'linear-gradient(180deg, #fde047, #eab308)',
        color: '#1a1a00', fontWeight: 900,
        fontSize: compact ? '0.68rem' : '0.75rem',
        padding: '8px 10px', borderRadius: 10, lineHeight: 1.2,
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(234,179,8,0.5)',
      }}>
        <div>★</div>
        <div>عرض</div>
        <div>حصري</div>
        <div style={{ fontSize: '0.6rem', marginTop: 2 }}>لفترة محدودة</div>
      </div>

      {/* عناوين */}
      <div style={{ position: 'relative', zIndex: 3, padding: compact ? '14px 14px 0' : '18px 16px 0' }}>
        <div style={{
          fontSize: compact ? '1.7rem' : '2.05rem',
          fontWeight: 900, color: '#fff', lineHeight: 1.1,
          textShadow: '0 0 28px rgba(168,85,247,0.7), 0 2px 8px #000',
        }}>
          اشترِ الآن
        </div>
        <div style={{
          fontSize: compact ? '1.05rem' : '1.22rem',
          fontWeight: 900, color: '#fff', marginTop: 2,
          textShadow: '0 2px 10px #000',
        }}>
          سيارتك بانتظارك
        </div>
        <div style={{
          marginTop: 6, fontSize: '0.78rem', color: '#67e8f9', fontWeight: 700,
        }}>
          {car.brand} {car.model} · {car.year}
          {car.color ? ` · ${car.color}` : ''}
        </div>
      </div>

      {/* صورة مولَّدة */}
      <div style={{
        position: 'relative', zIndex: 2,
        margin: '8px 10px 0',
        height: compact ? '40%' : '42%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: '12%', right: '12%', height: 24,
          background: 'radial-gradient(ellipse, rgba(34,211,238,0.5) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }} />
        <img
          src={src}
          alt={`${car.brand} ${car.model}`}
          onError={onImgError}
          loading="lazy"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: 10,
            filter: 'drop-shadow(0 14px 30px rgba(0,0,0,0.7))',
          }}
        />
      </div>

      {/* نقاط + زر */}
      <div style={{
        position: 'relative', zIndex: 3,
        padding: compact ? '6px 14px 14px' : '8px 16px 16px',
        display: 'flex', flexDirection: 'column', gap: 7,
      }}>
        {bullets.map((b) => (
          <div key={b} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
            gap: 8, flexDirection: 'row-reverse',
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%', background: '#22c55e',
              color: '#fff', fontWeight: 900, fontSize: '0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 0 10px rgba(34,197,94,0.55)',
            }}>✓</span>
            <span style={{ fontSize: compact ? '0.8rem' : '0.88rem', fontWeight: 700, color: '#f1f5f9' }}>
              {b}
            </span>
          </div>
        ))}

        <div style={{
          alignSelf: 'flex-start', width: 42, height: 42, borderRadius: '50%',
          border: '2px solid #eab308', background: 'rgba(0,0,0,0.45)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.52rem', fontWeight: 900, color: '#fde047', lineHeight: 1.1,
        }}>
          <span>الجزائر</span>
          <span>ALG</span>
        </div>

        <div style={{
          background: 'linear-gradient(90deg, #f97316, #ef4444, #f97316)',
          color: '#fff', fontWeight: 900,
          fontSize: compact ? '1rem' : '1.12rem',
          padding: compact ? '13px' : '15px',
          borderRadius: 999,
          boxShadow: '0 0 0 3px rgba(249,115,22,0.35), 0 10px 30px rgba(239,68,68,0.45)',
          border: '2px solid rgba(255,255,255,0.3)',
        }}>
          ‹ احجز سيارتك الآن
        </div>

        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          لا تفوت الفرصة · الكمية محدودة
        </div>
      </div>
    </button>
  );
};

import React, { useState } from 'react';
import type { CatalogCar } from '../../data/storeCatalog';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  car: CatalogCar;
  onClick?: () => void;
  compact?: boolean;
}

/** صور استوديو داكنة قريبة من الملصق الإعلاني */
const STUDIO_CARS = [
  'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=90',
  'https://images.unsplash.com/photo-1583121274602-3e2820c275fa?auto=format&fit=crop&w=1000&q=90',
];

function pickStudio(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return STUDIO_CARS[h % STUDIO_CARS.length];
}

/**
 * ملصق إعلاني بنفس روح الصورة المرجعية:
 * خلفية داكنة نيون · اشتر الآن · شارة عرض حصري · سيارة · 3 نقاط · زر برتقالي
 */
export const CarAdBanner: React.FC<Props> = ({ car, onClick, compact }) => {
  const seed = car.id + car.brand + car.model;
  const fallback = pickStudio(seed);
  const [src, setSrc] = useState(car.images?.[0] || fallback);

  const bullets = [
    car.condition === 'new' || !car.mileage
      ? 'جودة مضمونة · ضمان شامل'
      : `${car.mileage.toLocaleString('ar-DZ')} كم · حالة ممتازة`,
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
        aspectRatio: compact ? '3 / 4.5' : '9 / 15',
        minHeight: compact ? 380 : 480,
        background: 'radial-gradient(ellipse at 50% 30%, #1e1b4b 0%, #0a0a12 55%, #000 100%)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
      }}
    >
      {/* توهج نيون خلفي */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse at 20% 80%, rgba(59,130,246,0.35) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(168,85,247,0.4) 0%, transparent 40%),
          radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.15) 0%, transparent 40%)
        `,
      }} />

      {/* شارة عرض حصري — مثل الملصق */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 10,
        zIndex: 5,
        background: 'linear-gradient(180deg, #fde047, #eab308)',
        color: '#1a1a00',
        fontWeight: 900,
        fontSize: compact ? '0.68rem' : '0.75rem',
        padding: '8px 10px',
        borderRadius: 10,
        lineHeight: 1.25,
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(234,179,8,0.5)',
        border: '1px solid rgba(255,255,255,0.35)',
      }}>
        <div style={{ fontSize: '0.9rem' }}>★</div>
        <div>عرض</div>
        <div>حصري</div>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, marginTop: 2 }}>لفترة محدودة</div>
      </div>

      {/* العناوين العلوية */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        padding: compact ? '14px 16px 0' : '18px 18px 0',
      }}>
        <div style={{
          fontSize: compact ? '1.65rem' : '2rem',
          fontWeight: 900,
          color: '#fff',
          lineHeight: 1.15,
          textShadow: '0 0 30px rgba(168,85,247,0.6), 0 2px 8px rgba(0,0,0,0.8)',
          letterSpacing: '-0.02em',
        }}>
          اشترِ الآن
        </div>
        <div style={{
          fontSize: compact ? '1.05rem' : '1.25rem',
          fontWeight: 900,
          color: '#fff',
          marginTop: 2,
          textShadow: '0 2px 10px rgba(0,0,0,0.7)',
        }}>
          سيارتك بانتظارك
        </div>
        <div style={{
          marginTop: 6,
          fontSize: compact ? '0.72rem' : '0.8rem',
          color: '#67e8f9',
          fontWeight: 700,
        }}>
          {car.brand} {car.model} · {car.year}
          {car.color ? ` · ${car.color}` : ''}
        </div>
      </div>

      {/* صورة السيارة */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        margin: compact ? '8px 8px 0' : '10px 12px 0',
        height: compact ? '38%' : '40%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute',
          bottom: 4,
          left: '10%',
          right: '10%',
          height: 20,
          background: 'radial-gradient(ellipse, rgba(34,211,238,0.45) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }} />
        <img
          src={src}
          alt={`${car.brand} ${car.model}`}
          onError={() => setSrc(fallback)}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.65))',
            borderRadius: 8,
          }}
        />
      </div>

      {/* النقاط + الزر */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        padding: compact ? '6px 14px 14px' : '8px 18px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'right' }}>
          {bullets.map((b) => (
            <div key={b} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 8,
              flexDirection: 'row-reverse',
            }}>
              <span style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#22c55e',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 10px rgba(34,197,94,0.5)',
              }}>✓</span>
              <span style={{
                fontSize: compact ? '0.8rem' : '0.88rem',
                fontWeight: 700,
                color: '#f1f5f9',
              }}>{b}</span>
            </div>
          ))}
        </div>

        {/* شارة الجزائر صغيرة */}
        <div style={{
          alignSelf: 'flex-start',
          marginTop: 2,
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '2px solid #eab308',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.55rem',
          fontWeight: 900,
          color: '#fde047',
          lineHeight: 1.1,
        }}>
          <span>الجزائر</span>
          <span style={{ fontSize: '0.5rem', opacity: 0.9 }}>ALG</span>
        </div>

        {/* الزر البرتقالي الكبير */}
        <div style={{
          marginTop: 4,
          background: 'linear-gradient(90deg, #f97316 0%, #ef4444 50%, #f97316 100%)',
          color: '#fff',
          fontWeight: 900,
          fontSize: compact ? '1rem' : '1.15rem',
          padding: compact ? '13px 12px' : '15px 14px',
          borderRadius: 999,
          boxShadow: '0 0 0 3px rgba(249,115,22,0.35), 0 10px 32px rgba(239,68,68,0.45)',
          border: '2px solid rgba(255,255,255,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: '1.2rem' }}>‹</span>
          احجز سيارتك الآن
        </div>

        <div style={{
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.55)',
          fontWeight: 600,
        }}>
          لا تفوت الفرصة · الكمية محدودة
        </div>
      </div>
    </button>
  );
};

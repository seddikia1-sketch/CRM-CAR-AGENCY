import React from 'react';
import type { CatalogCar } from '../../data/storeCatalog';
import { adHeadline, adBullets, adCtaLabel, adBackground } from '../../utils/adCopy';
import { Car, Check } from 'lucide-react';

interface Props {
  car: CatalogCar;
  onClick?: () => void;
  compact?: boolean;
}

/**
 * صورة إعلانية ثابتة النمط (Static Banner):
 * صورة السيارة + عنوان + 3 نقاط قوة + زر CTA بصري
 */
export const CarAdBanner: React.FC<Props> = ({ car, onClick, compact }) => {
  const headline = adHeadline(car);
  const bullets = adBullets(car);
  const cta = adCtaLabel(car);
  const bg = adBackground(car.id);
  const photo = car.images?.[0];
  const h = compact ? 200 : 260;

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
        textAlign: 'right',
        position: 'relative',
        minHeight: h,
        background: bg,
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
      }}
    >
      {/* طبقة الصورة — زاوية شبه 3/4 عبر object-position */}
      {photo && (
        <img
          src={photo}
          alt={`${car.brand} ${car.model}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '30% center',
            opacity: 0.55,
          }}
        />
      )}

      {/* تدرج لقراءة النص */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(100deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.25) 100%)',
        }}
      />

      {!photo && (
        <div style={{
          position: 'absolute', left: '8%', top: '50%', transform: 'translateY(-50%)',
          opacity: 0.2,
        }}>
          <Car size={compact ? 72 : 100} color="#fff" />
        </div>
      )}

      {/* المحتوى الإعلاني */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: compact ? '14px 14px 16px' : '18px 16px 18px',
        minHeight: h,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#fff',
      }}>
        <div>
          {car.badge && (
            <span style={{
              display: 'inline-block',
              background: 'rgba(251,191,36,0.95)',
              color: '#0f172a',
              fontSize: '0.7rem',
              fontWeight: 900,
              padding: '3px 10px',
              borderRadius: 999,
              marginBottom: 8,
            }}>
              {car.badge}
            </span>
          )}

          <div style={{
            fontSize: compact ? '0.95rem' : '1.15rem',
            fontWeight: 900,
            lineHeight: 1.35,
            maxWidth: '92%',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}>
            {headline}
          </div>

          <div style={{
            marginTop: 6,
            fontSize: '0.8rem',
            opacity: 0.9,
            fontWeight: 600,
          }}>
            {car.brand} {car.model} · {car.year}
          </div>
        </div>

        <div>
          <ul style={{
            listStyle: 'none',
            margin: '10px 0 12px',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}>
            {bullets.map((b) => (
              <li key={b} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: compact ? '0.78rem' : '0.85rem',
                fontWeight: 600,
              }}>
                <Check size={14} color="#4ade80" style={{ flexShrink: 0 }} />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {/* زر CTA بصري داخل الصورة */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(90deg, #22c55e, #16a34a)',
            color: '#fff',
            fontWeight: 900,
            fontSize: compact ? '0.8rem' : '0.9rem',
            padding: compact ? '8px 14px' : '10px 18px',
            borderRadius: 999,
            boxShadow: '0 4px 16px rgba(34,197,94,0.4)',
            border: '2px solid rgba(255,255,255,0.25)',
          }}>
            {cta} ←
          </div>
        </div>
      </div>
    </button>
  );
};

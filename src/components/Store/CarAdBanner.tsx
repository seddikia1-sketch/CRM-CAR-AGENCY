import React, { useState } from 'react';
import type { CatalogCar } from '../../data/storeCatalog';
import { adHeadline, adBullets, adCtaLabel, adBackground, stockCarImage } from '../../utils/adCopy';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  car: CatalogCar;
  onClick?: () => void;
  compact?: boolean;
}

/**
 * بانر إعلاني عمودي قوي:
 * صورة سيارة حقيقية (من المخزون أو Stock) + نصوص هجومية + CTA
 */
export const CarAdBanner: React.FC<Props> = ({ car, onClick, compact }) => {
  const headline = adHeadline(car);
  const bullets = adBullets(car);
  const cta = adCtaLabel(car);
  const bg = adBackground(car.id);
  const fallback = stockCarImage(car.id + car.brand + car.model);
  const [imgSrc, setImgSrc] = useState(car.images?.[0] || fallback);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: 0,
        border: 'none',
        borderRadius: 18,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'right',
        position: 'relative',
        aspectRatio: compact ? '3 / 4.2' : '9 / 14',
        minHeight: compact ? 340 : 420,
        maxHeight: compact ? 400 : 560,
        background: bg,
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      }}
    >
      {/* صورة السيارة — حقيقية وليست رسم باهت */}
      <img
        src={imgSrc}
        alt={`${car.brand} ${car.model}`}
        onError={() => setImgSrc(fallback)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '62%',
          objectFit: 'cover',
          objectPosition: 'center 40%',
        }}
      />

      {/* توهج علوي */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '35%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)',
        zIndex: 1,
      }} />

      {/* تدرج سفلي قوي للنص */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '58%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(8,8,16,0.75) 28%, rgba(8,8,16,0.97) 55%, #080810 100%)',
        zIndex: 1,
      }} />

      {/* شارة */}
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 3,
        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        color: '#0f172a',
        fontSize: '0.72rem',
        fontWeight: 900,
        padding: '5px 12px',
        borderRadius: 8,
        boxShadow: '0 4px 14px rgba(251,191,36,0.45)',
      }}>
        {car.badge || 'عرض حصري'}
      </div>

      {/* المحتوى الإعلاني */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
        padding: compact ? '12px 14px 14px' : '16px 16px 18px',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        <div style={{
          fontSize: compact ? '1.05rem' : '1.22rem',
          fontWeight: 900,
          lineHeight: 1.3,
          textShadow: '0 2px 16px rgba(0,0,0,0.8)',
        }}>
          {headline}
        </div>

        <div style={{
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.85)',
        }}>
          {car.brand} {car.model} · {car.year}
          {car.color ? ` · ${car.color}` : ''}
        </div>

        <ul style={{
          listStyle: 'none',
          margin: '4px 0 2px',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {bullets.map((b) => (
            <li key={b} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: compact ? '0.8rem' : '0.88rem',
              fontWeight: 700,
            }}>
              <span style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#22c55e',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>✓</span>
              {b}
            </li>
          ))}
        </ul>

        {car.price > 0 && (
          <div style={{
            fontSize: compact ? '1.25rem' : '1.45rem',
            fontWeight: 900,
            color: '#4ade80',
            textShadow: '0 0 24px rgba(74,222,128,0.35)',
            marginTop: 2,
          }}>
            {formatCurrency(car.price)}
          </div>
        )}

        <div style={{
          marginTop: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
          color: '#fff',
          fontWeight: 900,
          fontSize: compact ? '0.9rem' : '1rem',
          padding: compact ? '12px 14px' : '14px 16px',
          borderRadius: 14,
          boxShadow: '0 8px 28px rgba(239,68,68,0.5)',
          border: '2px solid rgba(255,255,255,0.25)',
        }}>
          ⚡ {cta}
        </div>
      </div>
    </button>
  );
};

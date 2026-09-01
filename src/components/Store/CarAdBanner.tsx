import React from 'react';
import type { CatalogCar } from '../../data/storeCatalog';
import { adHeadline, adBullets, adCtaLabel, adBackground } from '../../utils/adCopy';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  car: CatalogCar;
  onClick?: () => void;
  compact?: boolean;
}

/**
 * إعلان عمودي طويل (نسبة ~9:16) — مولّد تلقائياً بدون رفع صور.
 * ألوان قوية، عنوان هجومي، 3 نقاط، زر CTA.
 */
export const CarAdBanner: React.FC<Props> = ({ car, onClick, compact }) => {
  const headline = adHeadline(car);
  const bullets = adBullets(car);
  const cta = adCtaLabel(car);
  const bg = adBackground(car.id);
  const photo = car.images?.[0];

  // شكل السيارة المبسّط بالـ CSS (لا يحتاج صورة مرفوعة)
  const accent = carAccent(car.id);

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
        // عمودي طويل ≈ 9:16
        aspectRatio: compact ? '3 / 4' : '9 / 16',
        maxHeight: compact ? 380 : 520,
        background: bg,
        boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
      }}
    >
      {/* طبقات بصرية مولّدة */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse at 70% 20%, ${accent}55 0%, transparent 50%),
          radial-gradient(ellipse at 20% 80%, rgba(34,197,94,0.25) 0%, transparent 45%),
          ${bg}
        `,
      }} />

      {/* شبكة خفيفة */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.07,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* صورة اختيارية إن وُجدت — وإلا رسم سيارة CSS */}
      {photo ? (
        <img
          src={photo}
          alt=""
          style={{
            position: 'absolute',
            left: '-5%',
            top: '12%',
            width: '70%',
            height: '45%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.85,
            borderRadius: 12,
            transform: 'perspective(400px) rotateY(8deg)',
            maskImage: 'linear-gradient(to left, transparent, black 30%)',
            WebkitMaskImage: 'linear-gradient(to left, transparent, black 30%)',
          }}
        />
      ) : (
        <GeneratedCarArt brand={car.brand} accent={accent} />
      )}

      {/* تدرج نص */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.2) 35%, rgba(0,0,0,0.92) 72%)',
      }} />

      {/* شارة علوية */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 2,
        background: 'rgba(251,191,36,0.95)', color: '#0f172a',
        fontSize: '0.68rem', fontWeight: 900, padding: '4px 10px', borderRadius: 999,
        letterSpacing: '0.02em',
      }}>
        {car.badge || 'عرض حصري'}
      </div>

      {/* المحتوى */}
      <div style={{
        position: 'relative', zIndex: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: compact ? '14px 14px 16px' : '18px 16px 20px',
        color: '#fff',
      }}>
        <div style={{
          fontSize: compact ? '0.72rem' : '0.78rem',
          fontWeight: 800,
          color: accent,
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {car.brand}
        </div>

        <div style={{
          fontSize: compact ? '1.05rem' : '1.25rem',
          fontWeight: 900,
          lineHeight: 1.3,
          textShadow: '0 2px 12px rgba(0,0,0,0.6)',
          marginBottom: 6,
        }}>
          {headline}
        </div>

        <div style={{
          fontSize: compact ? '0.85rem' : '0.95rem',
          fontWeight: 700,
          opacity: 0.95,
          marginBottom: 10,
        }}>
          {car.model} · {car.year}
          {car.color ? ` · ${car.color}` : ''}
        </div>

        <ul style={{
          listStyle: 'none', margin: '0 0 12px', padding: 0,
          display: 'flex', flexDirection: 'column', gap: 5,
        }}>
          {bullets.map((b) => (
            <li key={b} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: compact ? '0.78rem' : '0.88rem',
              fontWeight: 700,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#4ade80', flexShrink: 0,
                boxShadow: '0 0 8px #4ade80',
              }} />
              {b}
            </li>
          ))}
        </ul>

        {car.price > 0 && (
          <div style={{
            fontSize: compact ? '1.15rem' : '1.35rem',
            fontWeight: 900,
            color: '#4ade80',
            marginBottom: 12,
            textShadow: '0 0 20px rgba(74,222,128,0.4)',
          }}>
            {formatCurrency(car.price)}
          </div>
        )}

        {/* CTA هجومي */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(90deg, #ef4444, #f97316)',
          color: '#fff',
          fontWeight: 900,
          fontSize: compact ? '0.85rem' : '0.95rem',
          padding: compact ? '11px 14px' : '13px 16px',
          borderRadius: 12,
          boxShadow: '0 6px 24px rgba(239,68,68,0.45)',
          border: '2px solid rgba(255,255,255,0.3)',
          letterSpacing: '0.02em',
        }}>
          {cta} ⚡
        </div>
      </div>
    </button>
  );
};

function carAccent(id: string): string {
  const colors = ['#a78bfa', '#22d3ee', '#f472b6', '#fbbf24', '#4ade80', '#fb923c'];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 3)) % colors.length;
  return colors[h];
}

/** رسم سيارة زخرفي CSS — بديل عن رفع صورة */
function GeneratedCarArt({ brand, accent }: { brand: string; accent: string }) {
  return (
    <div style={{
      position: 'absolute',
      left: '5%',
      top: '8%',
      width: '90%',
      height: '42%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <svg viewBox="0 0 320 160" width="100%" height="100%" style={{ maxHeight: 200, opacity: 0.95 }}>
        <defs>
          <linearGradient id={`g-${brand}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        {/* جسم السيارة مبسّط زاوية 3/4 */}
        <ellipse cx="160" cy="130" rx="120" ry="12" fill="rgba(0,0,0,0.35)" />
        <path
          d="M40 110 Q50 70 95 65 L130 45 Q150 38 175 42 L240 55 Q280 62 290 85 L295 110 Z"
          fill={`url(#g-${brand})`}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
        />
        <path d="M100 65 L125 48 L165 50 L155 65 Z" fill="rgba(15,23,42,0.55)" />
        <path d="M168 52 L210 58 L205 70 L160 65 Z" fill="rgba(15,23,42,0.45)" />
        <circle cx="95" cy="112" r="22" fill="#0f172a" stroke={accent} strokeWidth="3" />
        <circle cx="95" cy="112" r="10" fill="#334155" />
        <circle cx="245" cy="112" r="22" fill="#0f172a" stroke={accent} strokeWidth="3" />
        <circle cx="245" cy="112" r="10" fill="#334155" />
        <rect x="268" y="78" width="18" height="8" rx="2" fill="#fef08a" opacity="0.9" />
        <text x="160" y="28" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="14" fontWeight="bold" fontFamily="system-ui">
          {brand.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

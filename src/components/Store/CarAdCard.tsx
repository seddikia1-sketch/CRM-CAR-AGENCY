import React from 'react';
import { Play, MessageCircle } from 'lucide-react';
import type { CatalogCar } from '../../data/storeCatalog';
import { formatCurrency } from '../../utils/formatters';
import { pickSlogan, pickGradient } from '../../utils/adSlogans';

const statusLabel: Record<string, string> = {
  available: 'متوفرة الآن',
  in_transit: 'في الطريق إليك',
  customs: 'تحت الجمرك',
  reserved: 'محجوزة',
};

interface CarAdCardProps {
  car: CatalogCar;
  onOpen: () => void;
  onWhatsApp: (e: React.MouseEvent) => void;
}

export const CarAdCard: React.FC<CarAdCardProps> = ({ car, onOpen, onWhatsApp }) => {
  const seed = `${car.id}-${car.brand}-${car.model}`;
  const slogan = pickSlogan(seed);
  const gradient = pickGradient(seed);
  const cover = car.images?.[0];
  const hasVideo = !!car.videoUrl;

  return (
    <article
      className="glass-card"
      onClick={onOpen}
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* لوحة إعلانية */}
      <div
        style={{
          position: 'relative',
          minHeight: 200,
          background: gradient,
          overflow: 'hidden',
        }}
      >
        {cover && (
          <img
            src={cover}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.45,
            }}
            loading="lazy"
          />
        )}

        {/* طبقة تدرج لقراءة النص */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, padding: '14px 14px 12px', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
          {/* شارة الحالة */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <span
              style={{
                background: car.status === 'available' ? '#16a34a' : car.status === 'reserved' ? '#d97706' : '#2563eb',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: 999,
                letterSpacing: '0.02em',
              }}
            >
              {car.badge || statusLabel[car.status] || 'عرض'}
            </span>
            {hasVideo && (
              <span style={{
                background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.7rem',
                padding: '4px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Play size={12} /> فيديو
              </span>
            )}
          </div>

          {/* الشعار الدعائي */}
          <div
            style={{
              marginTop: 18,
              fontSize: '1.15rem',
              fontWeight: 900,
              lineHeight: 1.35,
              color: '#fff',
              textShadow: '0 2px 12px rgba(0,0,0,0.45)',
            }}
          >
            « {slogan} »
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff' }}>
              {car.brand} {car.model}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
              {car.year} · {car.color || '—'}
              {car.mileage ? ` · ${car.mileage.toLocaleString()} كم` : ' · جديدة'}
            </div>
          </div>
        </div>
      </div>

      {/* المواصفات والسعر */}
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {car.features.slice(0, 4).map((f) => (
            <span
              key={f}
              style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: 999,
                background: 'rgba(108,92,231,0.15)',
                border: '1px solid rgba(108,92,231,0.35)',
                color: 'var(--text-primary)',
              }}
            >
              {f}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>السعر</div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--accent-success)' }}>
              {car.price ? formatCurrency(car.price) : 'حسب الاتفاق'}
            </div>
            {car.oldPrice && car.oldPrice > car.price && (
              <div style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {formatCurrency(car.oldPrice)}
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#fbbf24',
              background: 'rgba(251,191,36,0.12)',
              padding: '6px 10px',
              borderRadius: 8,
              maxWidth: 110,
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            اطلبها اليوم
          </div>
        </div>

        <a
          href="#"
          onClick={onWhatsApp}
          style={{
            marginTop: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'linear-gradient(90deg, #6c5ce7, #00cec9)',
            color: '#fff',
            padding: '11px',
            borderRadius: 10,
            fontWeight: 800,
            fontSize: '0.9rem',
          }}
        >
          <MessageCircle size={16} /> احصل عليها الآن
        </a>
      </div>
    </article>
  );
};

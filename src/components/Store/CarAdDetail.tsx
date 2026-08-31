import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, MessageCircle } from 'lucide-react';
import type { CatalogCar } from '../../data/storeCatalog';
import { formatCurrency } from '../../utils/formatters';
import { pickSlogan, pickGradient } from '../../utils/adSlogans';
import { toEmbedVideoUrl, isDirectVideo } from '../../utils/media';

interface Props {
  car: CatalogCar;
  whatsappUrl: string;
  onClose: () => void;
}

export const CarAdDetail: React.FC<Props> = ({ car, whatsappUrl, onClose }) => {
  const [slide, setSlide] = useState(0);
  const images = car.images?.filter(Boolean) || [];
  const seed = `${car.id}-${car.brand}-${car.model}`;
  const slogan = pickSlogan(seed);
  const gradient = pickGradient(seed);
  const embed = car.videoUrl ? toEmbedVideoUrl(car.videoUrl) : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{ width: 'min(640px, 100%)', maxHeight: '92vh', overflowY: 'auto', padding: 0, position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute', top: 10, left: 10, zIndex: 3,
            background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: '50%',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        {/* بانر إعلاني علوي */}
        <div style={{ background: gradient, position: 'relative', padding: '28px 18px 22px' }}>
          {images[0] && (
            <img
              src={images[0]}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
            />
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff',
              fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: 999, marginBottom: 10,
            }}>
              إعلان خاص
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', lineHeight: 1.4 }}>
              « {slogan} »
            </div>
            <div style={{ marginTop: 12, fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
              {car.brand} {car.model}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
              موديل {car.year} · {car.color || '—'}
              {car.mileage ? ` · ${car.mileage.toLocaleString()} كم` : ' · جديدة صفراء'}
            </div>
          </div>
        </div>

        {images.length > 0 && (
          <div style={{ position: 'relative', background: '#000' }}>
            <img
              src={images[slide % images.length]}
              alt=""
              style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => setSlide((s) => (s - 1 + images.length) % images.length)}
                  style={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: '50%', width: 36, height: 36 }}>
                  <ChevronRight size={20} />
                </button>
                <button type="button" onClick={() => setSlide((s) => (s + 1) % images.length)}
                  style={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: '50%', width: 36, height: 36 }}>
                  <ChevronLeft size={20} />
                </button>
              </>
            )}
          </div>
        )}

        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 6, padding: '8px 12px', overflowX: 'auto' }}>
            {images.map((src, i) => (
              <button key={i} type="button" onClick={() => setSlide(i)} style={{
                border: i === slide % images.length ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                borderRadius: 6, padding: 0, width: 56, height: 44, overflow: 'hidden', flexShrink: 0,
              }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}

        {embed && (
          <div style={{ padding: '0 12px 12px' }}>
            <div style={{ fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Play size={16} /> شاهد الفيديو
            </div>
            {isDirectVideo(embed) ? (
              <video src={embed} controls playsInline style={{ width: '100%', borderRadius: 10, maxHeight: 280 }} />
            ) : (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 10, overflow: 'hidden' }}>
                <iframe
                  src={embed}
                  title="video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                />
              </div>
            )}
          </div>
        )}

        <div style={{ padding: 16 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>المواصفات</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {car.features.map((f) => (
              <span key={f} style={{
                fontSize: '0.8rem', padding: '5px 10px', borderRadius: 999,
                background: 'rgba(108,92,231,0.15)', border: '1px solid rgba(108,92,231,0.3)',
              }}>{f}</span>
            ))}
          </div>

          {car.description && (
            <p style={{ lineHeight: 1.6, marginBottom: 12 }}>{car.description}</p>
          )}

          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 14,
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>سعر العرض</div>
            <div style={{ fontWeight: 900, fontSize: '1.45rem', color: 'var(--accent-success)' }}>
              {car.price ? formatCurrency(car.price) : 'حسب الاتفاق'}
            </div>
            {car.oldPrice && car.oldPrice > car.price && (
              <div style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                بدلاً من {formatCurrency(car.oldPrice)}
              </div>
            )}
          </div>

          <div style={{
            textAlign: 'center', fontWeight: 800, color: '#fbbf24', marginBottom: 12, fontSize: '1rem',
          }}>
            {slogan} — تواصل معنا الآن
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(90deg, #25D366, #128C7E)', color: '#fff',
              padding: '14px', borderRadius: 12, fontWeight: 900, fontSize: '1rem',
            }}
          >
            <MessageCircle size={20} /> احصل عليها الآن عبر واتساب
          </a>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Ship, Tag, MessageCircle, Search, Phone, MapPin, Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_CATALOG, DEFAULT_OFFERS, type CatalogCar } from '../data/storeCatalog';
import { formatCurrency, getWhatsAppLink, formatPhone } from '../utils/formatters';
import { storage, STORAGE_KEYS } from '../services/storage';
import { getOfficeSettings } from '../services/officeSettings';
import { toEmbedVideoUrl, isDirectVideo } from '../utils/media';
import type { Vehicle } from '../types';

function vehicleToCatalog(v: Vehicle): CatalogCar {
  return {
    id: v.id,
    brand: v.brand,
    model: v.model,
    year: v.year,
    price: v.sellingPrice || 0,
    mileage: v.mileage || 0,
    color: v.color || '',
    condition: v.condition === 'new' ? 'new' : 'under_3_years',
    status:
      v.status === 'in_transit'
        ? 'in_transit'
        : v.status === 'customs'
        ? 'customs'
        : v.status === 'reserved'
        ? 'reserved'
        : 'available',
    features: [
      v.condition === 'new' ? 'جديدة' : 'أقل من 3 سنوات',
      v.vin ? `VIN: ${v.vin.slice(-6)}` : '',
      v.containerNumber ? `حاوية: ${v.containerNumber}` : '',
    ].filter(Boolean),
    shippingDate: v.shippingDate,
    description: v.notes || `${v.brand} ${v.model} — من مخزون المكتب`,
    badge:
      v.status === 'in_transit'
        ? 'مشحونة'
        : v.status === 'customs'
        ? 'جمرك'
        : v.status === 'reserved'
        ? 'محجوزة'
        : undefined,
    images: Array.isArray(v.images) ? v.images : [],
    videoUrl: v.videoUrl || '',
  };
}

function useStoreCars(): CatalogCar[] {
  return useMemo(() => {
    const inventory = storage.get<Vehicle[]>(STORAGE_KEYS.INVENTORY) || [];
    const publicOnes = inventory.filter((v) => v.status !== 'sold');
    if (publicOnes.length > 0) return publicOnes.map(vehicleToCatalog);
    return DEFAULT_CATALOG;
  }, []);
}

const statusLabel: Record<string, string> = {
  available: 'متوفرة',
  in_transit: 'مشحونة / في الطريق',
  customs: 'تحت الجمرك',
  reserved: 'محجوزة',
};

export const Store: React.FC = () => {
  const office = getOfficeSettings();
  const cars = useStoreCars();
  const [tab, setTab] = useState<'all' | 'available' | 'shipped' | 'offers'>('all');
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const [selected, setSelected] = useState<CatalogCar | null>(null);
  const [slide, setSlide] = useState(0);

  const brands = useMemo(() => Array.from(new Set(cars.map((c) => c.brand))).sort(), [cars]);
  const available = cars.filter((c) => c.status === 'available' || c.status === 'reserved');
  const shipped = cars.filter((c) => c.status === 'in_transit' || c.status === 'customs');

  const filtered = useMemo(() => {
    let list = tab === 'available' ? available : tab === 'shipped' ? shipped : cars;
    if (brand) list = list.filter((c) => c.brand === brand);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (c) =>
          c.brand.toLowerCase().includes(s) ||
          c.model.toLowerCase().includes(s) ||
          c.color.toLowerCase().includes(s)
      );
    }
    return list;
  }, [tab, cars, available, shipped, brand, q]);

  const waForCar = (c: CatalogCar) => {
    const msg = `السلام عليكم،\nأريد الاستفسار عن السيارة:\n${c.brand} ${c.model} ${c.year}\nالسعر المعروض: ${c.price.toLocaleString('ar-DZ')} دج\nهل ما زالت متوفرة؟`;
    return getWhatsAppLink(office.whatsapp, msg);
  };

  const openCar = (c: CatalogCar) => {
    setSelected(c);
    setSlide(0);
  };

  const images = selected?.images?.filter(Boolean) || [];
  const embed = selected?.videoUrl ? toEmbedVideoUrl(selected.videoUrl) : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)', padding: '12px 16px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Car size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>متجر السيارات</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{office.officeName}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <a href={`tel:${office.phone}`} style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'transparent',
              color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 10, fontWeight: 600,
              fontSize: '0.85rem', border: '1px solid var(--border-color)',
            }}>
              <Phone size={16} /> اتصال
            </a>
            <a href={getWhatsAppLink(office.whatsapp, 'السلام عليكم، أريد الاستفسار عن السيارات المتوفرة.')} target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff',
                padding: '8px 12px', borderRadius: 10, fontWeight: 600, fontSize: '0.85rem',
              }}>
              <MessageCircle size={16} /> واتساب
            </a>
            <Link to="/login" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>دخول المكتب</Link>
          </div>
        </div>
      </header>

      <section style={{
        background: 'linear-gradient(135deg, rgba(108,92,231,0.35), rgba(0,206,201,0.15))',
        padding: '28px 16px 22px', borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', marginBottom: 8 }}>سيارات صينية — متوفرة ومشحونة</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 1.6 }}>
            تصفّح بالصور والفيديو، السيارات في الطريق، وأحدث العروض.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap', fontSize: '0.9rem' }}>
            <span>✅ {available.length} متوفرة</span>
            <span>🚢 {shipped.length} مشحونة / جمرك</span>
            <span>🏷️ {DEFAULT_OFFERS.filter((o) => o.active).length} عروض</span>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {([
            ['all', 'الكل', cars.length],
            ['available', 'متوفرة', available.length],
            ['shipped', 'مشحونة', shipped.length],
            ['offers', 'عروض الإعلانات', DEFAULT_OFFERS.length],
          ] as const).map(([key, label, count]) => (
            <button key={key} type="button" onClick={() => setTab(key)} style={{
              padding: '8px 14px', borderRadius: 999,
              border: tab === key ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              background: tab === key ? 'rgba(108,92,231,0.18)' : 'transparent',
              fontWeight: tab === key ? 700 : 500, fontSize: '0.85rem',
            }}>
              {label} ({count})
            </button>
          ))}
        </div>

        {tab !== 'offers' && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالماركة أو الموديل..." style={{
                width: '100%', padding: '10px 36px 10px 12px', borderRadius: 12,
                border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              }} />
            </div>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} style={{
              padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)', minWidth: 140,
            }}>
              <option value="">كل الماركات</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        )}

        {tab === 'offers' && (
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {DEFAULT_OFFERS.filter((o) => o.active).map((o) => (
              <div key={o.id} className="glass-card" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 12, left: 12, background: 'var(--accent-primary)', color: '#fff',
                  fontSize: '0.75rem', padding: '4px 10px', borderRadius: 999, fontWeight: 700,
                }}>
                  <Tag size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {o.discountLabel}
                </div>
                <div style={{ marginTop: 28, fontWeight: 800, fontSize: '1.15rem' }}>{o.title}</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{o.subtitle}</div>
                <div style={{ marginTop: 12, fontWeight: 600 }}>{o.carLabel}</div>
                <div style={{ marginTop: 6, fontSize: '1.25rem', color: 'var(--accent-success)', fontWeight: 700 }}>
                  من {formatCurrency(o.priceFrom)}
                </div>
                <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--accent-warning)' }}>{o.highlight}</div>
                <a href={getWhatsAppLink(office.whatsapp, `السلام عليكم، مهتم بعرض: ${o.title} — ${o.carLabel}`)} target="_blank" rel="noreferrer"
                  style={{ display: 'block', textAlign: 'center', marginTop: 14, background: '#25D366', color: '#fff', padding: '10px', borderRadius: 10, fontWeight: 700 }}>
                  اطلب العرض عبر واتساب
                </a>
              </div>
            ))}
          </div>
        )}

        {tab !== 'offers' && (
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {filtered.length === 0 && (
              <div className="glass-card" style={{ padding: 24, gridColumn: '1 / -1', textAlign: 'center' }}>
                لا توجد سيارات مطابقة. تواصل معنا عبر واتساب.
              </div>
            )}
            {filtered.map((c) => {
              const cover = c.images?.[0];
              const hasVideo = !!c.videoUrl;
              return (
                <article
                  key={c.id}
                  className="glass-card"
                  style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                  onClick={() => openCar(c)}
                >
                  <div style={{
                    height: 160, position: 'relative',
                    background: cover
                      ? undefined
                      : c.status === 'in_transit' || c.status === 'customs'
                      ? 'linear-gradient(135deg, #1e3a5f, #0f172a)'
                      : 'linear-gradient(135deg, #2a1f5c, #12121a)',
                  }}>
                    {cover ? (
                      <img src={cover} alt={`${c.brand} ${c.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {c.status === 'in_transit' || c.status === 'customs'
                          ? <Ship size={48} color="rgba(255,255,255,0.35)" />
                          : <Car size={48} color="rgba(255,255,255,0.35)" />}
                      </div>
                    )}
                    {c.badge && (
                      <span style={{
                        position: 'absolute', top: 10, right: 10,
                        background: c.status === 'available' ? '#22c55e' : c.status === 'reserved' ? '#f0932b' : '#3b82f6',
                        color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '4px 8px', borderRadius: 8,
                      }}>{c.badge}</span>
                    )}
                    {hasVideo && (
                      <span style={{
                        position: 'absolute', bottom: 10, left: 10,
                        background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.72rem',
                        padding: '4px 8px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <Play size={12} /> فيديو
                      </span>
                    )}
                    {(c.images?.length || 0) > 1 && (
                      <span style={{
                        position: 'absolute', bottom: 10, right: 10,
                        background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.72rem',
                        padding: '4px 8px', borderRadius: 8,
                      }}>
                        {c.images!.length} صور
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{c.brand} {c.model}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {c.year} · {c.color || '—'} · {c.mileage ? `${c.mileage.toLocaleString()} كم` : 'جديدة'}
                    </div>
                    <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--accent-info)' }}>
                      {statusLabel[c.status] || c.status}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--accent-success)', marginTop: 8 }}>
                      {c.price ? formatCurrency(c.price) : 'حسب الاتفاق'}
                    </div>
                    <a
                      href={waForCar(c)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: 'var(--accent-primary)', color: '#fff', padding: '10px', borderRadius: 10, fontWeight: 700,
                      }}
                    >
                      <MessageCircle size={16} /> استفسر / احجز
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <footer style={{
          marginTop: 36, padding: '20px 0', borderTop: '1px solid var(--border-color)',
          color: 'var(--text-secondary)', fontSize: '0.85rem',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{office.officeName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={14} /> هاتف: <span dir="ltr" style={{ direction: 'ltr' }}>{formatPhone(office.phone)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <MessageCircle size={14} /> واتساب: <span dir="ltr" style={{ direction: 'ltr' }}>{formatPhone(office.whatsapp)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <MapPin size={14} /> {office.city}
              </div>
            </div>
            <div>
              {office.note}
              <br />للمتابعة الإدارية: <Link to="/login">دخول النظام</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* نافذة تفاصيل + معرض */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-card"
            style={{
              width: 'min(640px, 100%)', maxHeight: '92vh', overflowY: 'auto',
              padding: 0, position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute', top: 10, left: 10, zIndex: 2,
                background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '50%',
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ position: 'relative', background: '#000', minHeight: 200 }}>
              {images.length > 0 ? (
                <>
                  <img
                    src={images[slide % images.length]}
                    alt=""
                    style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block', margin: '0 auto' }}
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
                </>
              ) : (
                <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Car size={48} color="rgba(255,255,255,0.3)" />
                </div>
              )}
            </div>

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
                  <Play size={16} /> فيديو السيارة
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selected.brand} {selected.model}</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                {selected.year} · {selected.color || '—'} · {selected.mileage ? `${selected.mileage.toLocaleString()} كم` : 'جديدة'}
              </p>
              <p style={{ marginTop: 8, lineHeight: 1.6 }}>{selected.description}</p>
              <div style={{ marginTop: 10, fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent-success)' }}>
                {selected.price ? formatCurrency(selected.price) : 'حسب الاتفاق'}
              </div>
              <a href={waForCar(selected)} target="_blank" rel="noreferrer" style={{
                marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#25D366', color: '#fff', padding: '12px', borderRadius: 10, fontWeight: 700,
              }}>
                <MessageCircle size={18} /> تواصل عبر واتساب
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

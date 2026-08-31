import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Tag, MessageCircle, Search, Phone, MapPin } from 'lucide-react';
import { DEFAULT_CATALOG, DEFAULT_OFFERS, type CatalogCar } from '../data/storeCatalog';
import { formatCurrency, getWhatsAppLink, formatPhone } from '../utils/formatters';
import { storage, STORAGE_KEYS } from '../services/storage';
import { getOfficeSettings } from '../services/officeSettings';
import { CarAdCard } from '../components/Store/CarAdCard';
import { CarAdDetail } from '../components/Store/CarAdDetail';
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
      v.color || '',
      v.vin ? `VIN …${v.vin.slice(-6)}` : '',
      v.containerNumber ? `حاوية ${v.containerNumber}` : '',
      v.status === 'in_transit' ? 'مشحونة' : '',
      v.status === 'available' ? 'تسليم فوري' : '',
    ].filter(Boolean),
    shippingDate: v.shippingDate,
    description: v.notes || `${v.brand} ${v.model} ${v.year} — متوفرة لدى المكتب. تواصل للحجز والمعاينة.`,
    badge:
      v.status === 'in_transit'
        ? 'في الطريق'
        : v.status === 'customs'
        ? 'جمرك'
        : v.status === 'reserved'
        ? 'محجوزة'
        : 'متوفرة الآن',
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

export const Store: React.FC = () => {
  const office = getOfficeSettings();
  const cars = useStoreCars();
  const [tab, setTab] = useState<'all' | 'available' | 'shipped' | 'offers'>('all');
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const [selected, setSelected] = useState<CatalogCar | null>(null);

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
    const msg = `السلام عليكم،\nمهتم بالإعلان عن:\n${c.brand} ${c.model} ${c.year}\nالسعر: ${c.price ? c.price.toLocaleString('ar-DZ') + ' دج' : 'حسب الاتفاق'}\nهل ما زالت متوفرة؟`;
    return getWhatsAppLink(office.whatsapp, msg);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)', padding: '12px 16px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
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
          </Link>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/home" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>الرئيسية</Link>
            <a href={`tel:${office.phone}`} style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'transparent',
              color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 10, fontWeight: 600,
              fontSize: '0.85rem', border: '1px solid var(--border-color)',
            }}>
              <Phone size={16} /> اتصال
            </a>
            <a href={getWhatsAppLink(office.whatsapp, 'السلام عليكم، أريد الاستفسار عن عروض السيارات.')} target="_blank" rel="noreferrer"
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
        background: 'linear-gradient(135deg, rgba(108,92,231,0.4), rgba(0,206,201,0.2))',
        padding: '28px 16px 22px', borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(251,191,36,0.2)', color: '#fbbf24',
            fontSize: '0.8rem', fontWeight: 800, padding: '4px 12px', borderRadius: 999, marginBottom: 10,
          }}>
            عروض إعلانية حصرية
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', marginBottom: 8 }}>
            سيارتك في انتظارك — اختر و احجز الآن
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 1.6 }}>
            إعلانات جاهزة بالمواصفات والسعر. تصفّح، شاهد الصور والفيديو، وتواصل فوراً عبر واتساب.
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
            ['all', 'كل الإعلانات', cars.length],
            ['available', 'متوفرة الآن', available.length],
            ['shipped', 'مشحونة', shipped.length],
            ['offers', 'عروض خاصة', DEFAULT_OFFERS.length],
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
                  style={{ display: 'block', textAlign: 'center', marginTop: 14, background: 'linear-gradient(90deg,#25D366,#128C7E)', color: '#fff', padding: '12px', borderRadius: 10, fontWeight: 800 }}>
                  احصل على العرض الآن
                </a>
              </div>
            ))}
          </div>
        )}

        {tab !== 'offers' && (
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))' }}>
            {filtered.length === 0 && (
              <div className="glass-card" style={{ padding: 24, gridColumn: '1 / -1', textAlign: 'center' }}>
                لا توجد إعلانات مطابقة. تواصل معنا عبر واتساب.
              </div>
            )}
            {filtered.map((c) => (
              <CarAdCard
                key={c.id}
                car={c}
                onOpen={() => setSelected(c)}
                onWhatsApp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(waForCar(c), '_blank');
                }}
              />
            ))}
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
              <br />
              <Link to="/home">الصفحة الرئيسية</Link>
              {' · '}
              <Link to="/login">دخول النظام</Link>
            </div>
          </div>
        </footer>
      </div>

      {selected && (
        <CarAdDetail
          car={selected}
          whatsappUrl={waForCar(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

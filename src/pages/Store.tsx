import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car, Tag, MessageCircle, Search, Phone, MapPin, ShoppingBag,
  Shield, Truck, BadgeCheck, Star, Package,
} from 'lucide-react';
import { DEFAULT_OFFERS, type CatalogCar } from '../data/storeCatalog';
import { formatCurrency, getWhatsAppLink, formatPhone } from '../utils/formatters';
import { getOfficeSettings } from '../services/officeSettings';
import { getPublicCars } from '../services/publicInventory';
import { getCart, addToCart, removeFromCart, type CartItem } from '../services/storeCart';
import { CarAdCard } from '../components/Store/CarAdCard';
import { CarAdDetail } from '../components/Store/CarAdDetail';
import { LeadFormModal } from '../components/Store/LeadFormModal';
import { StoreCartDrawer } from '../components/Store/StoreCartDrawer';
import { StoreCheckout } from '../components/Store/StoreCheckout';

export const Store: React.FC = () => {
  const office = getOfficeSettings();
  const cars = useMemo(() => getPublicCars(), []);
  const [tab, setTab] = useState<'all' | 'available' | 'shipped' | 'offers'>('all');
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const [selected, setSelected] = useState<CatalogCar | null>(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadCar, setLeadCar] = useState<CatalogCar | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const brands = useMemo(() => Array.from(new Set(cars.map((c) => c.brand))).sort(), [cars]);
  const available = cars.filter((c) => c.status === 'available' || c.status === 'reserved');
  const shipped = cars.filter((c) => c.status === 'in_transit' || c.status === 'customs');
  const best = available.slice(0, 4);

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

  const waOffice = getWhatsAppLink(
    office.whatsapp,
    `السلام عليكم،\nأريد الاستفسار عن السيارات في المتجر.`
  );

  const waForCar = (c: CatalogCar) => {
    const msg = `السلام عليكم،\nمهتم بـ: ${c.brand} ${c.model} ${c.year}\nالسعر: ${c.price ? c.price.toLocaleString('ar-DZ') + ' دج' : 'حسب الاتفاق'}`;
    return getWhatsAppLink(office.whatsapp, msg);
  };

  const handleAddCart = (c: CatalogCar) => {
    setCart(addToCart(c));
    setCartOpen(true);
  };

  const openLead = (c: CatalogCar | null) => {
    setLeadCar(c);
    setLeadOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e8f0', paddingBottom: 72 }}>
      {/* شريط إعلان */}
      <div style={{
        background: 'linear-gradient(90deg,#6c5ce7,#00cec9)',
        color: '#fff',
        textAlign: 'center',
        padding: '8px 12px',
        fontSize: '0.82rem',
        fontWeight: 700,
      }}>
        🚗 عرض خاص: احجز الآن ونتصل بك خلال ساعات · معاينة قبل الاتفاق
      </div>

      {/* الهيدر */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
            <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'inherit' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg,#6c5ce7,#00cec9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Car size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>متجر السيارات</div>
                <div style={{ fontSize: '0.7rem', color: '#888' }}>{office.officeName}</div>
              </div>
            </Link>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                style={{
                  position: 'relative',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: '8px 10px',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <ShoppingBag size={18} />
                {cart.length > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, left: -4,
                    background: '#22c55e', color: '#fff', fontSize: '0.65rem',
                    fontWeight: 900, borderRadius: 999, minWidth: 18, height: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{cart.length}</span>
                )}
              </button>
              <a href={waOffice} target="_blank" rel="noreferrer" style={{
                background: '#25D366', color: '#fff', padding: '8px 10px',
                borderRadius: 10, display: 'flex', alignItems: 'center',
              }}>
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* بحث */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن ماركة أو موديل..."
              style={{
                width: '100%', padding: '11px 38px 11px 12px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)', background: '#12121a',
                color: '#e8e8f0', fontSize: 16,
              }}
            />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        padding: '24px 16px',
        background: 'radial-gradient(ellipse at 30% 0%, rgba(108,92,231,0.35), transparent 55%), #0a0a0f',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(1.35rem, 4vw, 1.85rem)', fontWeight: 900, marginBottom: 8 }}>
            سيارات صينية — متوفرة ومشحونة
          </h1>
          <p style={{ color: '#8888a0', maxWidth: 480, lineHeight: 1.6, marginBottom: 14 }}>
            اختر، أضف لاهتماماتك، وأتمم الطلب كزائر — نتصل بك لتأكيد الحجز.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setTab('available')} style={ctaSecondary}>
              المتوفر الآن ({available.length})
            </button>
            <button type="button" onClick={() => setTab('shipped')} style={ctaSecondary}>
              مشحونة ({shipped.length})
            </button>
            <button type="button" onClick={() => { setLeadCar(null); setLeadOpen(true); }} style={{
              ...ctaSecondary,
              background: 'linear-gradient(90deg,#22c55e,#16a34a)',
              border: 'none',
              color: '#fff',
              fontWeight: 900,
            }}>
              اطلب استشارة
            </button>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px' }}>
        {/* فئات */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }}>
          {([
            ['all', 'الكل', cars.length, <Package size={18} key="a" />],
            ['available', 'متوفرة', available.length, <BadgeCheck size={18} key="b" />],
            ['shipped', 'مشحونة', shipped.length, <Truck size={18} key="c" />],
            ['offers', 'عروض', DEFAULT_OFFERS.length, <Tag size={18} key="d" />],
          ] as const).map(([key, label, count, icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              style={{
                padding: '12px 6px',
                borderRadius: 12,
                border: tab === key ? '2px solid #6c5ce7' : '1px solid rgba(255,255,255,0.08)',
                background: tab === key ? 'rgba(108,92,231,0.15)' : 'rgba(255,255,255,0.03)',
                color: '#e8e8f0',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4, color: '#a78bfa' }}>{icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{label}</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>{count}</div>
            </button>
          ))}
        </div>

        {/* ماركات */}
        {tab !== 'offers' && brands.length > 0 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
            <button type="button" onClick={() => setBrand('')} style={chip(brand === '')}>الكل</button>
            {brands.map((b) => (
              <button key={b} type="button" onClick={() => setBrand(b)} style={chip(brand === b)}>{b}</button>
            ))}
          </div>
        )}

        {/* Trust badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 8,
          marginBottom: 18,
        }}>
          {[{
            icon: <Shield size={16} color="#4ade80" />,
            t: 'معاينة قبل الاتفاق',
          }, {
            icon: <Phone size={16} color="#4ade80" />,
            t: 'نتصل بك للتأكيد',
          }, {
            icon: <Truck size={16} color="#4ade80" />,
            t: 'متابعة الشحن والجمرك',
          }, {
            icon: <BadgeCheck size={16} color="#4ade80" />,
            t: 'طلب كزائر بدون حساب',
          }].map((x) => (
            <div key={x.t} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 10, padding: '8px 10px', fontSize: '0.78rem', fontWeight: 600,
            }}>
              {x.icon} {x.t}
            </div>
          ))}
        </div>

        {/* الأكثر توفراً */}
        {tab === 'all' && !q && !brand && best.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontWeight: 900, fontSize: '1.05rem', marginBottom: 10 }}>الأكثر توفراً الآن</h2>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {best.map((c) => (
                <StoreProductCard
                  key={c.id}
                  car={c}
                  onOpen={() => setSelected(c)}
                  onBuy={() => openLead(c)}
                  onCart={() => handleAddCart(c)}
                />
              ))}
            </div>
          </div>
        )}

        {/* عروض */}
        {tab === 'offers' && (
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {DEFAULT_OFFERS.filter((o) => o.active).map((o) => (
              <div key={o.id} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: 18, position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: 12, left: 12, background: '#6c5ce7', color: '#fff',
                  fontSize: '0.72rem', padding: '4px 10px', borderRadius: 999, fontWeight: 800,
                }}>
                  {o.discountLabel}
                </div>
                <div style={{ marginTop: 28, fontWeight: 900, fontSize: '1.1rem' }}>{o.title}</div>
                <div style={{ color: '#888', marginTop: 4 }}>{o.subtitle}</div>
                <div style={{ marginTop: 10, fontWeight: 700 }}>{o.carLabel}</div>
                <div style={{ marginTop: 6, fontSize: '1.2rem', color: '#4ade80', fontWeight: 900 }}>
                  من {formatCurrency(o.priceFrom)}
                </div>
                <button type="button" onClick={() => openLead(null)} style={{
                  width: '100%', marginTop: 14, background: 'linear-gradient(90deg,#22c55e,#16a34a)',
                  color: '#fff', padding: '12px', borderRadius: 10, fontWeight: 900, border: 'none', cursor: 'pointer',
                }}>
                  احجز العرض الآن
                </button>
              </div>
            ))}
          </div>
        )}

        {/* قائمة المنتجات */}
        {tab !== 'offers' && (
          <>
            <h2 style={{ fontWeight: 900, fontSize: '1.05rem', marginBottom: 10 }}>
              {tab === 'available' ? 'متوفرة الآن' : tab === 'shipped' ? 'مشحونة / جمرك' : 'كل السيارات'}
              <span style={{ color: '#888', fontWeight: 600 }}> ({filtered.length})</span>
            </h2>
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))' }}>
              {filtered.length === 0 && (
                <div style={{
                  gridColumn: '1 / -1', textAlign: 'center', padding: 28,
                  background: 'rgba(255,255,255,0.03)', borderRadius: 14,
                }}>
                  لا توجد نتائج. جرّب بحثاً آخر أو تواصل عبر واتساب.
                </div>
              )}
              {filtered.map((c) => (
                <StoreProductCard
                  key={c.id}
                  car={c}
                  onOpen={() => setSelected(c)}
                  onBuy={() => openLead(c)}
                  onCart={() => handleAddCart(c)}
                />
              ))}
            </div>
          </>
        )}

        {/* تقييمات */}
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontWeight: 900, fontSize: '1.05rem', marginBottom: 12, textAlign: 'center' }}>آراء الزبائن</h2>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {[
              { n: 'كريم — سطيف', t: 'طلبت من المتجر واتصلوا بي بسرعة. واضحين في حالة الشحن.' },
              { n: 'سارة — الجزائر', t: 'استمارة الطلب بسيطة بدون حساب. تجربة مريحة من الهاتف.' },
              { n: 'يونس — وهران', t: 'وجدت السيارة المناسبة من المخزون وأتممت الحجز كزائر.' },
            ].map((r) => (
              <div key={r.n} style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} color="#fbbf24" fill="#fbbf24" />)}
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.55, color: '#c8c8d8' }}>« {r.t} »</p>
                <div style={{ marginTop: 8, fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa' }}>{r.n}</div>
              </div>
            ))}
          </div>
        </section>

        {/* فوتر */}
        <footer style={{
          marginTop: 36, padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.08)',
          color: '#888', fontSize: '0.85rem',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#e8e8f0', marginBottom: 6 }}>{office.officeName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={14} /> <span dir="ltr" style={{ direction: 'ltr' }}>{formatPhone(office.phone)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <MessageCircle size={14} /> <span dir="ltr" style={{ direction: 'ltr' }}>{formatPhone(office.whatsapp)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <MapPin size={14} /> {office.city}
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', lineHeight: 1.8 }}>
              <div>المعاينة قبل الاتفاق · متابعة الشحن</div>
              <div>الطلب كزائر — بدون إنشاء حساب</div>
              <div style={{ marginTop: 6 }}>
                <Link to="/home" style={{ color: '#888' }}>الرئيسية</Link>
                {' · '}
                <Link to="/login" style={{ color: '#888' }}>المكتب</Link>
              </div>
            </div>
          </div>
          <p style={{ marginTop: 14, fontSize: '0.75rem' }}>{office.note}</p>
        </footer>
      </div>

      {/* واتساب عائم */}
      <a
        href={waOffice}
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          bottom: 18,
          left: 18,
          zIndex: 50,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#25D366',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 24px rgba(37,211,102,0.45)',
        }}
        title="واتساب"
      >
        <MessageCircle size={26} />
      </a>

      {selected && (
        <CarAdDetail
          car={selected}
          whatsappUrl={waForCar(selected)}
          onClose={() => setSelected(null)}
        />
      )}

      <LeadFormModal
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
        car={leadCar}
        title={leadCar ? 'شراء / حجز الآن' : 'اطلب استشارة'}
      />

      <StoreCartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onRemove={(id) => setCart(removeFromCart(id))}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <StoreCheckout
        open={checkoutOpen}
        items={cart.length ? cart : getCart()}
        onClose={() => setCheckoutOpen(false)}
        onDone={() => setCart([])}
      />
    </div>
  );
};

function StoreProductCard({
  car,
  onOpen,
  onBuy,
  onCart,
}: {
  car: CatalogCar;
  onOpen: () => void;
  onBuy: () => void;
  onCart: () => void;
}) {
  return (
    <div>
      <CarAdCard
        car={car}
        onOpen={onOpen}
        onWhatsApp={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onBuy();
        }}
      />
      <div style={{ display: 'flex', gap: 8, padding: '0 12px 12px', marginTop: -4 }}>
        <button type="button" onClick={onBuy} style={{
          flex: 1.2, background: 'linear-gradient(90deg,#22c55e,#16a34a)', color: '#fff',
          padding: '10px', borderRadius: 10, fontWeight: 900, border: 'none', cursor: 'pointer', fontSize: '0.85rem',
        }}>
          شراء الآن
        </button>
        <button type="button" onClick={onCart} style={{
          flex: 1, background: 'rgba(255,255,255,0.06)', color: '#e8e8f0',
          padding: '10px', borderRadius: 10, fontWeight: 700,
          border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontSize: '0.85rem',
        }}>
          + اهتمام
        </button>
      </div>
    </div>
  );
}

const ctaSecondary: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.05)',
  color: '#e8e8f0',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

function chip(active: boolean): React.CSSProperties {
  return {
    padding: '7px 14px',
    borderRadius: 999,
    border: active ? '2px solid #6c5ce7' : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(108,92,231,0.2)' : 'transparent',
    color: '#e8e8f0',
    fontWeight: active ? 800 : 500,
    fontSize: '0.8rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
}

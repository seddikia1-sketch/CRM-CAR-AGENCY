import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car, Tag, MessageCircle, Search, Phone, MapPin, ShoppingBag,
  Shield, Truck, BadgeCheck, Package,
} from 'lucide-react';
import { DEFAULT_OFFERS, type CatalogCar } from '../data/storeCatalog';
import { formatCurrency, getWhatsAppLink, formatPhone } from '../utils/formatters';
import { getOfficeSettings } from '../services/officeSettings';
import { getPublicCars } from '../services/publicInventory';
import { getCart, addToCart, removeFromCart, type CartItem } from '../services/storeCart';
import { CarAdBanner } from '../components/Store/CarAdBanner';
import { CarAdDetail } from '../components/Store/CarAdDetail';
import { LeadFormModal } from '../components/Store/LeadFormModal';
import { StoreCartDrawer } from '../components/Store/StoreCartDrawer';
import { StoreCheckout } from '../components/Store/StoreCheckout';
import './storePublic.css';

export const Store: React.FC = () => {
  const office = getOfficeSettings();
  const cars = useMemo(() => getPublicCars(), []);
  const [tab, setTab] = useState<'all' | 'available' | 'shipped' | 'offers'>('all');
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [yearFilter, setYearFilter] = useState('');
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

  const filtered = useMemo(() => {
    let list = tab === 'available' ? available : tab === 'shipped' ? shipped : cars;
    if (brand) list = list.filter((c) => c.brand === brand);
    const y = Number(yearFilter);
    if (y) list = list.filter((c) => c.year === y);
    const min = Number(priceMin);
    const max = Number(priceMax);
    if (min > 0) list = list.filter((c) => (c.price || 0) >= min);
    if (max > 0) list = list.filter((c) => (c.price || 0) <= max);
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
  }, [tab, cars, available, shipped, brand, q, priceMin, priceMax, yearFilter]);

  const years = useMemo(
    () => Array.from(new Set(cars.map((c) => c.year).filter(Boolean))).sort((a, b) => b - a),
    [cars]
  );

  const waOffice = getWhatsAppLink(office.whatsapp, `السلام عليكم،\nأريد الاستفسار عن السيارات في المتجر.`);

  const waForCar = (c: CatalogCar) => {
    const msg = `السلام عليكم،\nمهتم بـ: ${c.brand} ${c.model} ${c.year}\nالسعر: ${c.price ? c.price.toLocaleString('ar-DZ') + ' دج' : 'حسب الاتفاق'}\nهل ما زالت متوفرة؟`;
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
    <div className="pub-page">
      <div className="pub-promo-bar">
        🚗 إعلانات مباشرة من المخزون · احجز واستشر عبر واتساب
      </div>

      <header className="pub-topbar">
        <div className="pub-topbar-inner" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <Link to="/home" className="pub-brand">
              <div className="pub-brand-icon">
                <Car size={18} color="#fff" />
              </div>
              <div>
                <div className="pub-brand-title">متجر السيارات</div>
                <div className="pub-brand-sub">{office.officeName}</div>
              </div>
            </Link>
            <div className="pub-topbar-actions">
              <button type="button" className="pub-icon-btn" onClick={() => setCartOpen(true)} aria-label="السلة">
                <ShoppingBag size={18} />
                {cart.length > 0 && <span className="pub-badge-count">{cart.length}</span>}
              </button>
              <a href={waOffice} target="_blank" rel="noreferrer" className="pub-wa-btn" aria-label="واتساب">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
          <div className="pub-search">
            <Search size={16} className="pub-search-icon" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن ماركة أو موديل..."
            />
          </div>
        </div>
      </header>

      <section className="pub-hero">
        <div className="pub-hero-inner">
          <div className="pub-hero-badge">كتالوج حي من المخزون</div>
          <h1>سيارات صينية جاهزة للمعاينة</h1>
          <p>
            كل سيارة بإعلان واضح: المواصفات، السعر، والحالة.
            تواصل واتساب أو احجز استشارة في ثوانٍ.
          </p>
          <div className="pub-hero-actions">
            <button type="button" className="pub-btn-primary" onClick={() => setTab('available')}>
              المتوفرة الآن ({available.length})
            </button>
            <button type="button" className="pub-btn-ghost" onClick={() => setTab('shipped')}>
              مشحونة ({shipped.length})
            </button>
            <button type="button" className="pub-btn-ghost" onClick={() => openLead(null)}>
              اطلب استشارة
            </button>
          </div>
        </div>
      </section>

      <div className="pub-container">
        <div className="pub-tabs">
          {([
            ['all', 'الكل', cars.length, <Package size={18} key="a" />],
            ['available', 'متوفرة', available.length, <BadgeCheck size={18} key="b" />],
            ['shipped', 'مشحونة', shipped.length, <Truck size={18} key="c" />],
            ['offers', 'عروض', DEFAULT_OFFERS.length, <Tag size={18} key="d" />],
          ] as const).map(([key, label, count, icon]) => (
            <button
              key={key}
              type="button"
              className={`pub-tab ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
            >
              <div className="pub-tab-icon">{icon}</div>
              <div className="pub-tab-label">{label}</div>
              <div className="pub-tab-count">{count}</div>
            </button>
          ))}
        </div>

        {tab !== 'offers' && brands.length > 0 && (
          <div className="pub-chips">
            <button type="button" className={`pub-chip ${brand === '' ? 'active' : ''}`} onClick={() => setBrand('')}>
              كل الماركات
            </button>
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                className={`pub-chip ${brand === b ? 'active' : ''}`}
                onClick={() => setBrand(b)}
              >
                {b}
              </button>
            ))}
          </div>
        )}

        {tab !== 'offers' && (
          <div className="pub-filters">
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
              <option value="">كل السنوات</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <input
              type="number"
              placeholder="السعر من"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              style={{ width: 110 }}
            />
            <input
              type="number"
              placeholder="السعر إلى"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              style={{ width: 110 }}
            />
          </div>
        )}

        <div className="pub-trust-grid">
          {[{
            icon: <Shield size={16} color="#4ade80" />, t: 'معاينة قبل الاتفاق',
          }, {
            icon: <Phone size={16} color="#4ade80" />, t: 'واتساب لكل سيارة',
          }, {
            icon: <Truck size={16} color="#4ade80" />, t: 'متابعة الشحن',
          }, {
            icon: <BadgeCheck size={16} color="#4ade80" />, t: 'طلب كزائر',
          }].map((x) => (
            <div key={x.t} className="pub-trust-card">
              {x.icon} {x.t}
            </div>
          ))}
        </div>

        {tab === 'offers' && (
          <div className="pub-grid">
            {DEFAULT_OFFERS.filter((o) => o.active).map((o) => (
              <div key={o.id} className="pub-offer-card">
                <div className="pub-offer-badge">{o.discountLabel}</div>
                <div style={{ marginTop: 32, fontWeight: 900, fontSize: '1.15rem', color: '#fff' }}>{o.title}</div>
                <div style={{ color: '#9494a8', marginTop: 6 }}>{o.subtitle}</div>
                <div style={{ marginTop: 12, fontWeight: 700 }}>{o.carLabel}</div>
                <div style={{ marginTop: 8, fontSize: '1.25rem', color: '#4ade80', fontWeight: 900 }}>
                  من {formatCurrency(o.priceFrom)}
                </div>
                <button
                  type="button"
                  onClick={() => openLead(null)}
                  className="pub-btn-primary"
                  style={{ width: '100%', marginTop: 16 }}
                >
                  احجز العرض
                </button>
              </div>
            ))}
          </div>
        )}

        {tab !== 'offers' && (
          <>
            <h2 className="pub-section-title">
              {tab === 'available' ? 'متوفرة' : tab === 'shipped' ? 'مشحونة' : 'كل الإعلانات'}
              <span> ({filtered.length})</span>
            </h2>
            <div className="pub-grid">
              {filtered.length === 0 && (
                <div className="pub-empty">
                  لا نتائج مطابقة. جرّب تغيير الفلتر أو تواصل واتساب.
                </div>
              )}
              {filtered.map((c) => (
                <div key={c.id} className="pub-product">
                  <CarAdBanner car={c} onClick={() => setSelected(c)} />
                  <div className="pub-product-actions">
                    <button type="button" className="buy" onClick={() => openLead(c)}>شراء الآن</button>
                    <a href={waForCar(c)} target="_blank" rel="noreferrer" className="wa">
                      <MessageCircle size={14} /> واتساب
                    </a>
                    <button type="button" className="cart" onClick={() => handleAddCart(c)}>+ سلة</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <footer className="pub-footer">
          <div className="pub-footer-grid">
            <div>
              <strong>{office.officeName}</strong>
              <div className="pub-contact-line">
                <Phone size={14} />
                <span dir="ltr" style={{ direction: 'ltr' }}>{formatPhone(office.phone)}</span>
              </div>
              <div className="pub-contact-line">
                <MessageCircle size={14} />
                <span dir="ltr" style={{ direction: 'ltr' }}>{formatPhone(office.whatsapp)}</span>
              </div>
              <div className="pub-contact-line">
                <MapPin size={14} /> {office.city}
              </div>
            </div>
            <div style={{ fontSize: '0.82rem', lineHeight: 1.9 }}>
              <div>المعاينة قبل الاتفاق · متابعة الشحن · خدمة بعد البيع</div>
              <Link to="/home">الرئيسية</Link>
              {' · '}
              <Link to="/login">المكتب</Link>
            </div>
          </div>
        </footer>
      </div>

      <a href={waOffice} target="_blank" rel="noreferrer" className="pub-fab-wa" aria-label="واتساب">
        <MessageCircle size={26} />
      </a>

      {selected && (
        <CarAdDetail car={selected} whatsappUrl={waForCar(selected)} onClose={() => setSelected(null)} />
      )}

      <LeadFormModal
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
        car={leadCar}
        title={leadCar ? 'شراء / حجز' : 'استشارة'}
      />

      <StoreCartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onRemove={(id) => setCart(removeFromCart(id))}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
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

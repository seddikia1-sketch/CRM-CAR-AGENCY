import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car, MessageCircle, Phone, Store, Shield, Ship, Wrench,
  Users, ArrowLeft, CheckCircle2, Sparkles,
} from 'lucide-react';
import { getOfficeSettings } from '../services/officeSettings';
import { formatPhone, getWhatsAppLink, formatCurrency } from '../utils/formatters';
import { getPublicCars } from '../services/publicInventory';
import { CarAdCard } from '../components/Store/CarAdCard';
import { LeadFormModal } from '../components/Store/LeadFormModal';
import type { CatalogCar } from '../data/storeCatalog';

const FEATURES = [
  {
    icon: <Store size={24} />,
    title: 'متجر إلكتروني',
    desc: 'تصفّح السيارات المتوفرة والمشحونة مع إعلانات جاهزة وصور وفيديو.',
  },
  {
    icon: <Ship size={24} />,
    title: 'تتبع الشحن والجمرك',
    desc: 'نعرض حالة كل سيارة: متاحة، في الطريق، أو تحت التخليص.',
  },
  {
    icon: <Wrench size={24} />,
    title: 'بعد البيع',
    desc: 'قطع غيار، صيانة دورية، ومتابعة الزبائن عبر واتساب.',
  },
  {
    icon: <Shield size={24} />,
    title: 'ثقة وشفافية',
    desc: 'أسعار واضحة، مواصفات مفصّلة، وتواصل مباشر مع المكتب.',
  },
];

const STEPS = [
  { n: '1', t: 'تصفّح السيارات', d: 'من هذه الصفحة أو المتجر — المخزون يُحدَّث تلقائياً.' },
  { n: '2', t: 'اضغط اشتري الآن / احجز', d: 'أدخل اسمك ورقم هاتفك وسنتصل بك للتأكيد.' },
  { n: '3', t: 'أكد واستلم', d: 'نتفق على العربون والتسليم أو موعد الوصول.' },
];

export const Landing: React.FC = () => {
  const office = getOfficeSettings();
  const cars = useMemo(() => getPublicCars(), []);
  const preview = cars.slice(0, 6);
  const [leadOpen, setLeadOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CatalogCar | null>(null);

  const wa = getWhatsAppLink(
    office.whatsapp,
    `السلام عليكم،\nوصلت عبر صفحة ${office.officeName}.\nأريد الاستفسار عن السيارات المتوفرة.`
  );

  const openLead = (car?: CatalogCar | null) => {
    setSelectedCar(car || null);
    setLeadOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(10,10,15,0.9)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 16px',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6c5ce7, #00cec9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Car size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>{office.officeName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{office.city} · سيارات صينية</div>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/store"
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              المتجر
            </Link>
            <button
              type="button"
              onClick={() => openLead(null)}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                background: 'linear-gradient(90deg,#6c5ce7,#00cec9)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              اشتري الآن
            </button>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                background: '#25D366',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <MessageCircle size={16} /> واتساب
            </a>
            <Link
              to="/login"
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: '1px solid var(--border-color)',
              }}
            >
              دخول المكتب
            </Link>
          </nav>
        </div>
      </header>

      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '48px 16px 40px',
          background:
            'radial-gradient(ellipse at 20% 20%, rgba(108,92,231,0.35), transparent 50%), radial-gradient(ellipse at 80% 0%, rgba(0,206,201,0.2), transparent 45%), var(--bg-primary)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(251,191,36,0.15)',
              color: '#fbbf24',
              fontSize: '0.8rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: 999,
              marginBottom: 16,
            }}
          >
            <Sparkles size={14} /> {cars.length} سيارة معروضة من المخزون
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
              fontWeight: 900,
              lineHeight: 1.25,
              maxWidth: 640,
              marginBottom: 14,
            }}
          >
            سيارتك الصينية…{' '}
            <span style={{ background: 'linear-gradient(90deg,#a78bfa,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              من الصين إلى بابك
            </span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 520, lineHeight: 1.7, marginBottom: 24 }}>
            كل سيارة تُضاف للمخزون تظهر هنا وفي المتجر. احجز الآن واترك رقمك لنتصل بك.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => openLead(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(90deg, #6c5ce7, #00cec9)',
                color: '#fff',
                padding: '14px 22px',
                borderRadius: 12,
                fontWeight: 900,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              اشتري الآن / سجّل طلبك
            </button>
            <Link
              to="/store"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: 'var(--text-primary)',
                padding: '14px 22px',
                borderRadius: 12,
                fontWeight: 700,
                border: '1px solid var(--border-color)',
              }}
            >
              <Store size={18} /> كل الإعلانات
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* سيارات من المخزون */}
      <section style={{ padding: '28px 16px 36px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>سيارات متاحة الآن</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              تُحدَّث تلقائياً من مخزون المكتب (غير المباعة)
            </p>
          </div>
          <Link to="/store" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
            عرض الكل في المتجر ←
          </Link>
        </div>

        {preview.length === 0 ? (
          <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
            لا توجد سيارات في المخزون حالياً. تواصل معنا عبر واتساب.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))' }}>
            {preview.map((c) => (
              <div key={c.id} style={{ position: 'relative' }}>
                <CarAdCard
                  car={c}
                  onOpen={() => openLead(c)}
                  onWhatsApp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openLead(c);
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: -6, padding: '0 14px 14px' }}>
                  <button
                    type="button"
                    onClick={() => openLead(c)}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(90deg,#6c5ce7,#00cec9)',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: 10,
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    اشتري الآن
                  </button>
                  <button
                    type="button"
                    onClick={() => openLead(c)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      padding: '10px',
                      borderRadius: 10,
                      fontWeight: 700,
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                    }}
                  >
                    احجز
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            type="button"
            onClick={() => openLead(null)}
            style={{
              background: '#fbbf24',
              color: '#0f172a',
              padding: '12px 24px',
              borderRadius: 12,
              fontWeight: 900,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            سجّل اهتمامك — سنتصل بك
          </button>
        </div>
      </section>

      <section style={{ padding: '36px 16px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>لماذا تتعامل معنا؟</h2>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card" style={{ padding: 18 }}>
              <div style={{ color: 'var(--accent-primary)', marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{f.title}</div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: '32px 16px',
          background: 'rgba(108,92,231,0.08)',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 18 }}>كيف تشتري معنا؟</h2>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {STEPS.map((s) => (
              <div key={s.n} className="glass-card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <div style={{ fontWeight: 800 }}>{s.t}</div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.55 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '36px 16px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          <div className="glass-card" style={{ padding: 22, background: 'linear-gradient(145deg, rgba(108,92,231,0.25), rgba(18,18,26,0.9))' }}>
            <Store size={28} color="#a78bfa" style={{ marginBottom: 10 }} />
            <h3 style={{ fontWeight: 900, marginBottom: 8 }}>المتجر الإلكتروني</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>
              كل سيارات المخزون غير المباعة + عروض وإعلانات.
            </p>
            <Link to="/store" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fff', background: 'var(--accent-primary)', padding: '10px 16px', borderRadius: 10, fontWeight: 700 }}>
              فتح المتجر <ArrowLeft size={16} />
            </Link>
          </div>

          <div className="glass-card" style={{ padding: 22, background: 'linear-gradient(145deg, rgba(0,206,201,0.18), rgba(18,18,26,0.9))' }}>
            <Users size={28} color="#2dd4bf" style={{ marginBottom: 10 }} />
            <h3 style={{ fontWeight: 900, marginBottom: 8 }}>مكتب الإدارة (CRM)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>
              للموظفين: المخزون، العملاء، الحجوزات الواردة من الموقع.
            </p>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0f172a', background: '#2dd4bf', padding: '10px 16px', borderRadius: 10, fontWeight: 800 }}>
              دخول المكتب <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 16px 40px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontWeight: 900, marginBottom: 8 }}>تواصل معنا مباشرة</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 18 }}>{office.officeName} — {office.city}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`tel:${office.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, border: '1px solid var(--border-color)', fontWeight: 700 }}>
              <Phone size={18} />
              <span dir="ltr" style={{ direction: 'ltr' }}>{formatPhone(office.phone)}</span>
            </a>
            <a href={wa} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, background: '#25D366', color: '#fff', fontWeight: 800 }}>
              <MessageCircle size={18} />
              <span dir="ltr" style={{ direction: 'ltr' }}>{formatPhone(office.whatsapp)}</span>
            </a>
            <button type="button" onClick={() => openLead(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, background: 'var(--accent-primary)', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
              اشتري الآن
            </button>
          </div>
          <p style={{ marginTop: 20, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{office.note}</p>
        </div>
      </section>

      <LeadFormModal
        isOpen={leadOpen}
        onClose={() => setLeadOpen(false)}
        car={selectedCar}
        title={selectedCar ? 'اشتري الآن — تأكيد الحجز' : 'سجّل طلبك — سنتصل بك'}
      />
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Car, MessageCircle, Phone, Store, Shield, Ship, Wrench,
  Users, ArrowLeft, CheckCircle2, Sparkles,
} from 'lucide-react';
import { getOfficeSettings } from '../services/officeSettings';
import { formatPhone, getWhatsAppLink } from '../utils/formatters';

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
  { n: '1', t: 'تصفّح المتجر', d: 'اختر السيارة المناسبة من العروض المتاحة أو المشحونة.' },
  { n: '2', t: 'تواصل معنا', d: 'واتساب أو اتصال — نرد عليك بسرعة ونؤكد التوفر.' },
  { n: '3', t: 'احجز واستلم', d: 'عربون، إجراءات، ثم التسليم أو المتابعة حتى الوصول.' },
];

export const Landing: React.FC = () => {
  const office = getOfficeSettings();
  const wa = getWhatsAppLink(
    office.whatsapp,
    `السلام عليكم،\nوصلت عبر صفحة ${office.officeName}.\nأريد الاستفسار عن السيارات المتوفرة.`
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* شريط علوي */}
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
                background: 'var(--accent-primary)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              دخول المكتب
            </Link>
          </nav>
        </div>
      </header>

      {/* البطل */}
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
            <Sparkles size={14} /> استيراد · بيع · خدمة ما بعد البيع
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
            متجر إلكتروني لإعلانات السيارات المتوفرة والمشحونة، مع تواصل مباشر عبر واتساب وإدارة احترافية من المكتب.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/store"
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
              }}
            >
              <Store size={20} /> تصفّح المتجر الآن
              <ArrowLeft size={18} />
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
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
              <MessageCircle size={18} /> اسأل عبر واتساب
            </a>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 20,
              marginTop: 28,
              flexWrap: 'wrap',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} color="#22c55e" /> سيارات أقل من 3 سنوات
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} color="#22c55e" /> عروض إعلانية جاهزة
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} color="#22c55e" /> رد سريع على واتساب
            </span>
          </div>
        </div>
      </section>

      {/* مزايا */}
      <section style={{ padding: '36px 16px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>لماذا تتعامل معنا؟</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 480 }}>
          نقدّم تجربة واضحة من التصفح حتى الاستلام، مع أدوات مكتب متكاملة.
        </p>
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

      {/* خطوات */}
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
          <div style={{ marginTop: 22, textAlign: 'center' }}>
            <Link
              to="/store"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--accent-primary)',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: 12,
                fontWeight: 800,
              }}
            >
              ابدأ من المتجر <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* روابط سريعة */}
      <section style={{ padding: '36px 16px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          <div
            className="glass-card"
            style={{
              padding: 22,
              background: 'linear-gradient(145deg, rgba(108,92,231,0.25), rgba(18,18,26,0.9))',
            }}
          >
            <Store size={28} color="#a78bfa" style={{ marginBottom: 10 }} />
            <h3 style={{ fontWeight: 900, marginBottom: 8 }}>المتجر الإلكتروني</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>
              إعلانات السيارات، الأسعار، الصور، والفيديو. للزبائن بدون تسجيل دخول.
            </p>
            <Link
              to="/store"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#fff',
                background: 'var(--accent-primary)',
                padding: '10px 16px',
                borderRadius: 10,
                fontWeight: 700,
              }}
            >
              فتح المتجر <ArrowLeft size={16} />
            </Link>
          </div>

          <div
            className="glass-card"
            style={{
              padding: 22,
              background: 'linear-gradient(145deg, rgba(0,206,201,0.18), rgba(18,18,26,0.9))',
            }}
          >
            <Users size={28} color="#2dd4bf" style={{ marginBottom: 10 }} />
            <h3 style={{ fontWeight: 900, marginBottom: 8 }}>مكتب الإدارة (CRM)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>
              للموظفين فقط: العملاء، المخزون، الحجوزات، الدفعات، والتقارير.
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: '#0f172a',
                background: '#2dd4bf',
                padding: '10px 16px',
                borderRadius: 10,
                fontWeight: 800,
              }}
            >
              دخول المكتب <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* تواصل */}
      <section
        style={{
          padding: '32px 16px 40px',
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontWeight: 900, marginBottom: 8 }}>تواصل معنا مباشرة</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 18 }}>{office.officeName} — {office.city}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={`tel:${office.phone}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 12,
                border: '1px solid var(--border-color)',
                fontWeight: 700,
              }}
            >
              <Phone size={18} />
              <span dir="ltr" style={{ direction: 'ltr' }}>{formatPhone(office.phone)}</span>
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 12,
                background: '#25D366',
                color: '#fff',
                fontWeight: 800,
              }}
            >
              <MessageCircle size={18} />
              <span dir="ltr" style={{ direction: 'ltr' }}>{formatPhone(office.whatsapp)}</span>
            </a>
          </div>
          <p style={{ marginTop: 20, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{office.note}</p>
        </div>
      </section>
    </div>
  );
};

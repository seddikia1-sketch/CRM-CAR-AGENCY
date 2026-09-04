import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car, MessageCircle, Phone, CheckCircle2, Shield, Truck,
  Clock, Star, MapPin, BadgeCheck,
} from 'lucide-react';
import { getOfficeSettings } from '../services/officeSettings';
import { formatPhone, getWhatsAppLink, phoneMask } from '../utils/formatters';
import { getPublicCars, savePublicLead } from '../services/publicInventory';
import { adHeadline } from '../utils/adCopy';
import { CarAdBanner } from '../components/Store/CarAdBanner';
import './storePublic.css';

const WILAYAS = [
  'الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'سطيف', 'باتنة', 'بجاية', 'تلمسان',
  'البليدة', 'تيزي وزو', 'سكيكدة', 'الجلفة', 'سيدي بلعباس', 'الشلف', 'مستغانم',
  'المدية', 'تيارت', 'بشار', 'ورقلة', 'تندوف', 'أخرى',
];

export const Landing: React.FC = () => {
  const office = getOfficeSettings();
  const cars = useMemo(() => getPublicCars(), []);
  const featured = cars[0] || null;
  const moreCars = cars.slice(0, 6);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [carId, setCarId] = useState(featured?.id || '');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const selectedCar = cars.find((c) => c.id === carId) || featured;
  const matchHeadline = selectedCar ? adHeadline(selectedCar) : 'امتلك سيارة أحلامك اليوم';

  const wa = getWhatsAppLink(
    office.whatsapp,
    `السلام عليكم،\nأريد طلب سيارة من ${office.officeName}.`
  );

  const scrollToForm = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pickCar = (id: string) => {
    setCarId(id);
    scrollToForm();
  };

  const submitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = savePublicLead({
      clientName: name,
      clientPhone: phone,
      vehicleBrand: selectedCar?.brand,
      vehicleModel: selectedCar?.model,
      vehicleId: selectedCar?.id,
      notes: `طلب هبوط · الولاية: ${wilaya || '-'} · ${selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : ''}`,
    });
    if (!result.ok) {
      setError(result.error || 'تعذر إرسال الطلب');
      return;
    }
    setDone(true);
  };

  const sendWa = () => {
    const msg = `السلام عليكم،\nاسمي: ${name}\nالهاتف: ${phone}\nالولاية: ${wilaya || '-'}\n${
      selectedCar ? `السيارة: ${selectedCar.brand} ${selectedCar.model} ${selectedCar.year}` : 'استشارة'
    }`;
    window.open(getWhatsAppLink(office.whatsapp, msg), '_blank');
  };

  return (
    <div className="pub-page">
      <div className="pub-promo-bar">
        🚗 سيارات صينية · معاينة قبل الاتفاق · تواصل واتساب مباشر
      </div>

      <header className="pub-topbar">
        <div className="pub-topbar-inner">
          <div className="pub-brand">
            <div className="pub-brand-icon">
              <Car size={20} color="#fff" />
            </div>
            <div>
              <div className="pub-brand-title">{office.officeName}</div>
              <div className="pub-brand-sub">{office.city} · استيراد وبيع</div>
            </div>
          </div>
          <div className="pub-topbar-actions">
            <a href={wa} target="_blank" rel="noreferrer" className="pub-wa-btn" aria-label="واتساب">
              <MessageCircle size={18} />
            </a>
            <button type="button" className="pub-cta-sm" onClick={scrollToForm}>
              اطلب الآن
            </button>
          </div>
        </div>
      </header>

      <section className="pub-hero">
        <div className="pub-container-narrow" style={{ paddingTop: 8, paddingBottom: 8 }}>
          <div className="pub-hero-badge">عرض من المخزون · إعلان مباشر</div>
          <h1>{matchHeadline}</h1>

          {featured && (
            <div style={{ marginBottom: 18 }}>
              <CarAdBanner car={featured} onClick={() => pickCar(featured.id)} />
            </div>
          )}

          <p>
            نفس العرض في الإعلان — اطلب معاينة أو استفساراً بالاسم والهاتف والولاية،
            ونتصل بك في أقرب وقت.
          </p>

          <div className="pub-hero-actions">
            <button type="button" className="pub-btn-primary" onClick={scrollToForm} style={{ width: '100%' }}>
              احجز استشارتك — نتصل بك
            </button>
          </div>

          <div className="pub-trust-row" style={{ justifyContent: 'center' }}>
            <span className="pub-trust-item">
              <CheckCircle2 size={15} color="#4ade80" /> معاينة قبل الاتفاق
            </span>
            <span className="pub-trust-item">
              <CheckCircle2 size={15} color="#4ade80" /> متابعة الشحن
            </span>
            <span className="pub-trust-item">
              <CheckCircle2 size={15} color="#4ade80" /> خدمة بعد البيع
            </span>
          </div>
        </div>
      </section>

      {moreCars.length > 1 && (
        <section className="pub-container-narrow">
          <h2 className="pub-section-title">إعلانات من المخزون</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {moreCars.filter((c) => c.id !== featured?.id).map((c) => (
              <CarAdBanner key={c.id} car={c} compact onClick={() => pickCar(c.id)} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <Link to="/store" style={{ color: '#a78bfa', fontWeight: 800, fontSize: '0.95rem' }}>
              تصفّح كل المعرض في المتجر ←
            </Link>
          </div>
        </section>
      )}

      <section className="pub-container-narrow">
        <h2 className="pub-section-title" style={{ textAlign: 'center' }}>
          لماذا تطلب من هنا؟
        </h2>
        <p style={{ color: '#9494a8', lineHeight: 1.7, textAlign: 'center', marginBottom: 16, fontSize: '0.92rem' }}>
          أسعار واضحة، حالة الشحن معروفة، وطلب واحد يكفي لنتواصل معك.
        </p>
        <div className="pub-feature-list">
          {[{
            icon: <Clock size={20} color="#2dd4bf" />, t: 'توفير وقتك', d: 'طلب واحد ونحن نتصل.',
          }, {
            icon: <Truck size={20} color="#2dd4bf" />, t: 'وضوح الشحن', d: 'متاحة · مشحونة · جمرك.',
          }, {
            icon: <Shield size={20} color="#2dd4bf" />, t: 'بعد البيع', d: 'قطع غيار وصيانة.',
          }, {
            icon: <BadgeCheck size={20} color="#2dd4bf" />, t: 'سيارات حديثة', d: 'جديدة أو أقل من 3 سنوات.',
          }].map((x) => (
            <div key={x.t} className="pub-feature-item">
              {x.icon}
              <div>
                <strong>{x.t}</strong>
                <span>{x.d}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        padding: '28px 16px',
        background: 'rgba(124, 108, 240, 0.07)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div className="pub-container-narrow" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <h2 className="pub-section-title" style={{ textAlign: 'center' }}>ثقة الزبائن</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { n: 'كريم — سطيف', t: 'تواصل سريع وتوضيح حالة الشحن قبل أي دفع.' },
              { n: 'سارة — الجزائر', t: 'النموذج بسيط واتصلوا بي في نفس اليوم.' },
              { n: 'يونس — وهران', t: 'الإعلان مطابق لما وجدته في الصفحة.' },
            ].map((r) => (
              <div key={r.n} className="pub-review">
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={13} color="#fbbf24" fill="#fbbf24" />
                  ))}
                </div>
                <p>« {r.t} »</p>
                <div className="name">{r.n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="order-form" className="pub-form-section">
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, textAlign: 'center', marginBottom: 6, color: '#fff' }}>
            اطلب معاينة / استفسار
          </h2>
          <p style={{ textAlign: 'center', color: '#9494a8', fontSize: '0.9rem', marginBottom: 18 }}>
            الاسم · الهاتف · المدينة — ونتصل بك
          </p>

          {selectedCar && (
            <div style={{ marginBottom: 16 }}>
              <CarAdBanner car={selectedCar} compact onClick={scrollToForm} />
            </div>
          )}

          {!done ? (
            <form onSubmit={submitOrder} className="pub-form">
              {error && <div className="pub-error">{error}</div>}

              {cars.length > 0 && (
                <select value={carId} onChange={(e) => setCarId(e.target.value)} className="pub-field">
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.brand} {c.model} {c.year}
                      {c.price ? ` — ${c.price.toLocaleString('ar-DZ')} دج` : ''}
                    </option>
                  ))}
                </select>
              )}

              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الكامل *"
                className="pub-field"
                autoComplete="name"
              />
              <input
                required
                value={phone}
                onChange={(e) => setPhone(phoneMask(e.target.value))}
                placeholder="رقم الهاتف *"
                dir="ltr"
                inputMode="numeric"
                className="pub-field"
                style={{ direction: 'ltr', textAlign: 'left' }}
                autoComplete="tel"
              />
              <select value={wilaya} onChange={(e) => setWilaya(e.target.value)} className="pub-field">
                <option value="">المدينة / الولاية</option>
                {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>

              <button type="submit" className="pub-btn-primary" style={{ width: '100%', padding: 16, fontSize: '1.05rem' }}>
                أكّد الطلب — اتصلوا بي
              </button>

              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: 13, borderRadius: 14, border: '1px solid rgba(37,211,102,0.45)',
                  color: '#25D366', fontWeight: 800, textDecoration: 'none',
                }}
              >
                <MessageCircle size={18} /> واتساب مباشر
              </a>
            </form>
          ) : (
            <div className="pub-success-box">
              <CheckCircle2 size={52} color="#22c55e" style={{ marginBottom: 12 }} />
              <h3 style={{ fontWeight: 900, color: '#fff', fontSize: '1.2rem' }}>تم استلام طلبك</h3>
              <p style={{ color: '#9494a8', margin: '10px 0 18px' }}>سنتصل بك قريباً.</p>
              <button type="button" onClick={sendWa} className="pub-btn-primary" style={{ width: '100%', marginBottom: 10, background: '#25D366' }}>
                أرسل عبر واتساب
              </button>
              <button type="button" onClick={() => setDone(false)} className="pub-btn-ghost" style={{ width: '100%' }}>
                طلب جديد
              </button>
            </div>
          )}

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.88rem', color: '#8b8b9e' }}>
            <div className="pub-contact-line" style={{ justifyContent: 'center' }}>
              <Phone size={14} />
              <span dir="ltr" style={{ direction: 'ltr' }}>{formatPhone(office.phone)}</span>
            </div>
            <div className="pub-contact-line" style={{ justifyContent: 'center', marginTop: 6 }}>
              <MapPin size={14} /> {office.city}
            </div>
          </div>

          <div style={{ marginTop: 18, textAlign: 'center', fontSize: '0.78rem', color: '#555', display: 'flex', justifyContent: 'center', gap: 16 }}>
            <Link to="/store" style={{ color: '#6b6b80' }}>المتجر</Link>
            <Link to="/login" style={{ color: '#6b6b80' }}>المكتب</Link>
          </div>
        </div>
      </section>

      <a href={wa} target="_blank" rel="noreferrer" className="pub-fab-wa" aria-label="واتساب">
        <MessageCircle size={26} />
      </a>
    </div>
  );
};

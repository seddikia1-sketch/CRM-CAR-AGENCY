import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car, MessageCircle, Phone, CheckCircle2, Shield, Truck,
  Clock, Star, MapPin, BadgeCheck,
} from 'lucide-react';
import { getOfficeSettings } from '../services/officeSettings';
import { formatPhone, getWhatsAppLink, formatCurrency, phoneMask } from '../utils/formatters';
import { getPublicCars, savePublicLead } from '../services/publicInventory';
import { adHeadline } from '../utils/adCopy';
import { CarAdBanner } from '../components/Store/CarAdBanner';

const WILAYAS = [
  'الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'سطيف', 'باتنة', 'بجاية', 'تلمسان',
  'البليدة', 'تيزي وزو', 'سكيكدة', 'الجلفة', 'سيدي بلعباس', 'الشلف', 'مستغانم',
  'المدية', 'تيارت', 'بشار', 'ورقلة', 'أخرى',
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
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e8f0' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '10px 14px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg,#6c5ce7,#00cec9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Car size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{office.officeName}</span>
        </div>
        <button type="button" onClick={scrollToForm} style={{
          background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10,
          padding: '8px 14px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer',
        }}>
          اطلب الآن
        </button>
      </div>

      {/* Above the fold + Message Match مع بانر السيارة */}
      <section style={{ padding: '20px 16px 28px', maxWidth: 560, margin: '0 auto' }}>
        <div style={{
          display: 'inline-block', background: 'rgba(251,191,36,0.2)', color: '#fbbf24',
          fontSize: '0.75rem', fontWeight: 800, padding: '5px 12px', borderRadius: 999, marginBottom: 12,
        }}>
          عرض من المخزون · إعلان مباشر
        </div>

        <h1 style={{
          fontSize: 'clamp(1.4rem, 5vw, 1.9rem)', fontWeight: 900, lineHeight: 1.35,
          marginBottom: 14, color: '#fff',
        }}>
          {matchHeadline}
        </h1>

        {featured && (
          <div style={{ marginBottom: 16 }}>
            <CarAdBanner car={featured} onClick={() => pickCar(featured.id)} />
          </div>
        )}

        <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, marginBottom: 14, fontSize: '0.95rem' }}>
          نفس العرض في الإعلان — اطلب معاينة أو استفساراً بالاسم والهاتف والولاية.
        </p>

        <button type="button" onClick={scrollToForm} style={{
          width: '100%', background: 'linear-gradient(90deg,#22c55e,#16a34a)', color: '#fff',
          border: 'none', borderRadius: 14, padding: '16px', fontWeight: 900, fontSize: '1.05rem',
          cursor: 'pointer', boxShadow: '0 8px 28px rgba(34,197,94,0.35)',
        }}>
          احجز استشارتك — نتصل بك
        </button>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap',
          fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={14} color="#4ade80" /> معاينة قبل الاتفاق
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={14} color="#4ade80" /> متابعة الشحن
          </span>
        </div>
      </section>

      {/* بانرات باقي المخزون */}
      {moreCars.length > 1 && (
        <section style={{ padding: '8px 16px 28px', maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 12 }}>إعلانات من المخزون</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {moreCars.filter((c) => c.id !== featured?.id).map((c) => (
              <CarAdBanner key={c.id} car={c} compact onClick={() => pickCar(c.id)} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <Link to="/store" style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.9rem' }}>
              تصفّح كل المعرض في المتجر ←
            </Link>
          </div>
        </section>
      )}

      <section style={{ padding: '24px 16px', maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: 10, textAlign: 'center' }}>
          تعبت من البحث دون نتيجة؟
        </h2>
        <p style={{ color: '#8888a0', lineHeight: 1.7, textAlign: 'center', marginBottom: 12 }}>
          أسعار غير واضحة ووعود شحن بلا متابعة؟ اطلب من الإعلان ونتولى التأكيد معك.
        </p>
        <div style={{ display: 'grid', gap: 8 }}>
          {[{
            icon: <Clock size={18} color="#2dd4bf" />, t: 'توفير وقتك', d: 'طلب واحد ونحن نتصل.',
          }, {
            icon: <Truck size={18} color="#2dd4bf" />, t: 'وضوح الشحن', d: 'متاحة / مشحونة / جمرك.',
          }, {
            icon: <Shield size={18} color="#2dd4bf" />, t: 'بعد البيع', d: 'قطع غيار وصيانة.',
          }, {
            icon: <BadgeCheck size={18} color="#2dd4bf" />, t: 'سيارات حديثة', d: 'جديدة أو أقل من 3 سنوات.',
          }].map((x) => (
            <div key={x.t} style={{
              display: 'flex', gap: 10, alignItems: 'center',
              background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {x.icon}
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{x.t}</div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>{x.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        padding: '24px 16px', background: 'rgba(108,92,231,0.08)',
        borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 12, textAlign: 'center' }}>ثقة الزبائن</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              { n: 'كريم — سطيف', t: 'تواصل سريع وتوضيح حالة الشحن قبل أي دفع.' },
              { n: 'سارة — الجزائر', t: 'النموذج بسيط واتصلوا بي في نفس اليوم.' },
              { n: 'يونس — وهران', t: 'الإعلان مطابق لما وجدته في الصفحة.' },
            ].map((r) => (
              <div key={r.n} style={{
                background: 'rgba(10,10,15,0.5)', borderRadius: 12, padding: 12,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} color="#fbbf24" fill="#fbbf24" />)}
                </div>
                <p style={{ fontSize: '0.88rem', color: '#c8c8d8' }}>« {r.t} »</p>
                <div style={{ marginTop: 6, fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa' }}>{r.n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* نموذج أعلى التحويل */}
      <section id="order-form" style={{ padding: '28px 16px 40px', background: 'rgba(0,0,0,0.35)' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, textAlign: 'center', marginBottom: 6 }}>
            اطلب معاينة / استفسار
          </h2>
          <p style={{ textAlign: 'center', color: '#8888a0', fontSize: '0.88rem', marginBottom: 14 }}>
            الاسم · الهاتف · المدينة — ونتصل بك
          </p>

          {selectedCar && (
            <div style={{ marginBottom: 14 }}>
              <CarAdBanner car={selectedCar} compact onClick={scrollToForm} />
            </div>
          )}

          {!done ? (
            <form onSubmit={submitOrder} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {error && (
                <div style={{
                  background: 'rgba(225,112,85,0.15)', border: '1px solid #e17055',
                  color: '#e17055', padding: 10, borderRadius: 10, fontSize: '0.88rem',
                }}>{error}</div>
              )}

              {cars.length > 0 && (
                <select value={carId} onChange={(e) => setCarId(e.target.value)} style={fieldStyle}>
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.brand} {c.model} {c.year}
                      {c.price ? ` — ${c.price.toLocaleString('ar-DZ')} دج` : ''}
                    </option>
                  ))}
                </select>
              )}

              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل *" style={fieldStyle} autoComplete="name" />
              <input required value={phone} onChange={(e) => setPhone(phoneMask(e.target.value))} placeholder="رقم الهاتف *" dir="ltr" inputMode="numeric" style={{ ...fieldStyle, direction: 'ltr', textAlign: 'left' }} autoComplete="tel" />
              <select value={wilaya} onChange={(e) => setWilaya(e.target.value)} style={fieldStyle}>
                <option value="">المدينة / الولاية</option>
                {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>

              <button type="submit" style={{
                background: 'linear-gradient(90deg,#22c55e,#16a34a)', color: '#fff', border: 'none',
                borderRadius: 14, padding: 16, fontWeight: 900, fontSize: '1.05rem', cursor: 'pointer',
              }}>
                أكّد الطلب — اتصلوا بي
              </button>

              <a href={wa} target="_blank" rel="noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: 12, borderRadius: 12, border: '1px solid rgba(37,211,102,0.5)',
                color: '#25D366', fontWeight: 700,
              }}>
                <MessageCircle size={18} /> واتساب مباشر
              </a>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 10 }} />
              <h3 style={{ fontWeight: 900 }}>تم استلام طلبك</h3>
              <p style={{ color: '#888', margin: '10px 0 14px' }}>سنتصل بك قريباً.</p>
              <button type="button" onClick={sendWa} style={{
                width: '100%', background: '#25D366', color: '#fff', border: 'none',
                borderRadius: 12, padding: 14, fontWeight: 800, cursor: 'pointer', marginBottom: 8,
              }}>
                أرسل عبر واتساب
              </button>
              <button type="button" onClick={() => setDone(false)} style={{
                width: '100%', background: 'transparent', color: '#888',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, cursor: 'pointer',
              }}>
                طلب جديد
              </button>
            </div>
          )}

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center' }}>
              <Phone size={14} />
              <span dir="ltr" style={{ direction: 'ltr' }}>{formatPhone(office.phone)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center', marginTop: 4 }}>
              <MapPin size={14} /> {office.city}
            </div>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center', fontSize: '0.75rem', color: '#555', display: 'flex', justifyContent: 'center', gap: 12 }}>
            <Link to="/store" style={{ color: '#555' }}>المتجر</Link>
            <Link to="/login" style={{ color: '#555' }}>المكتب</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#12121a',
  color: '#e8e8f0',
  fontSize: 16,
};

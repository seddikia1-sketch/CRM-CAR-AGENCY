import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car, MessageCircle, Phone, CheckCircle2, Shield, Truck,
  Clock, Star, MapPin, BadgeCheck,
} from 'lucide-react';
import { getOfficeSettings } from '../services/officeSettings';
import { formatPhone, getWhatsAppLink, formatCurrency, phoneMask } from '../utils/formatters';
import { getPublicCars, savePublicLead } from '../services/publicInventory';
import type { CatalogCar } from '../data/storeCatalog';
import { pickSlogan, pickGradient } from '../utils/adSlogans';

const WILAYAS = [
  'الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'سطيف', 'باتنة', 'بجاية', 'تلمسان',
  'البليدة', 'تيزي وزو', 'سكيكدة', 'الجلفة', 'سيدي بلعباس', 'الشلف', 'مستغانم',
  'المدية', 'تيارت', 'بشار', 'ورقلة', 'أخرى',
];

export const Landing: React.FC = () => {
  const office = getOfficeSettings();
  const cars = useMemo(() => getPublicCars(), []);
  const featured = cars[0] || null;
  const moreCars = cars.slice(0, 4);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [carId, setCarId] = useState(featured?.id || '');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const selectedCar = cars.find((c) => c.id === carId) || featured;

  const wa = getWhatsAppLink(
    office.whatsapp,
    `السلام عليكم،\nأريد طلب سيارة من ${office.officeName}.`
  );

  const scrollToForm = () => {
    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      notes: `طلب من صفحة الهبوط · الولاية: ${wilaya || 'غير محددة'}${selectedCar ? ` · ${selectedCar.brand} ${selectedCar.model}` : ''}`,
    });
    if (!result.ok) {
      setError(result.error || 'تعذر إرسال الطلب');
      return;
    }
    setDone(true);
  };

  const sendWa = () => {
    const msg = `السلام عليكم،\nاسمي: ${name}\nالهاتف: ${phone}\nالولاية: ${wilaya || '-'}\n${
      selectedCar ? `السيارة: ${selectedCar.brand} ${selectedCar.model} ${selectedCar.year}` : 'أريد استشارة لاختيار سيارة'
    }`;
    window.open(getWhatsAppLink(office.whatsapp, msg), '_blank');
  };

  const seed = featured ? `${featured.id}` : 'default';
  const slogan = featured ? pickSlogan(seed) : 'سيارتك في انتظارك';
  const gradient = pickGradient(seed);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e8f0' }}>
      {/* شريط بسيط جداً — بدون مشتتات */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(10,10,15,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
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
        <button
          type="button"
          onClick={scrollToForm}
          style={{
            background: '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '8px 14px',
            fontWeight: 900,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          اطلب الآن
        </button>
      </div>

      {/* ========== 1) Above the Fold ========== */}
      <section
        style={{
          padding: '28px 16px 32px',
          background: gradient,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {featured?.images?.[0] && (
          <img
            src={featured.images[0]}
            alt=""
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', opacity: 0.28,
            }}
          />
        )}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(251,191,36,0.2)',
            color: '#fbbf24',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '5px 12px',
            borderRadius: 999,
            marginBottom: 14,
          }}>
            عرض محدود · سيارات صينية مستوردة
          </div>

          <h1 style={{
            fontSize: 'clamp(1.65rem, 6vw, 2.35rem)',
            fontWeight: 900,
            lineHeight: 1.3,
            marginBottom: 12,
            color: '#fff',
          }}>
            امتلك سيارة أحلامك اليوم
            <br />
            <span style={{ color: '#a5f3fc' }}>بدون تعقيد… وبمتابعة حتى بابك</span>
          </h1>

          <p style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.88)',
            marginBottom: 18,
            maxWidth: 420,
            marginInline: 'auto',
          }}>
            نوفر لك سيارات صينية جديدة وأقل من 3 سنوات — متوفرة أو في الطريق —
            مع حجز بسيط ورقم هاتف فقط، ونتصل بك لتأكيد الطلب.
          </p>

          {featured && (
            <div style={{
              background: 'rgba(0,0,0,0.35)',
              borderRadius: 14,
              padding: '12px 14px',
              marginBottom: 16,
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700 }}>« {slogan} »</div>
              <div style={{ fontWeight: 900, fontSize: '1.15rem', marginTop: 4 }}>
                {featured.brand} {featured.model} {featured.year}
              </div>
              <div style={{ color: '#4ade80', fontWeight: 900, fontSize: '1.25rem', marginTop: 4 }}>
                {featured.price ? formatCurrency(featured.price) : 'حسب الاتفاق'}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={scrollToForm}
            style={{
              width: '100%',
              maxWidth: 360,
              background: 'linear-gradient(90deg, #22c55e, #16a34a)',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '16px 20px',
              fontWeight: 900,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(34,197,94,0.35)',
            }}
          >
            اطلب الآن — سنتصل بك خلال ساعات
          </button>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 14,
            marginTop: 14,
            flexWrap: 'wrap',
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.8)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={14} color="#4ade80" /> معاينة قبل الاتفاق
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={14} color="#4ade80" /> متابعة الشحن والجمرك
            </span>
          </div>
        </div>
      </section>

      {/* ========== 2) المشكلة والحل ========== */}
      <section style={{ padding: '32px 16px', maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 10, textAlign: 'center' }}>
          تعبت من البحث دون نتيجة واضحة؟
        </h2>
        <p style={{ color: '#8888a0', lineHeight: 1.7, textAlign: 'center', marginBottom: 16 }}>
          كثير من الزبائن يضيعون وقتاً بين أسعار غير ثابتة، سيارات غير مؤكدة،
          ووعود شحن بلا متابعة. نحن نختصر الطريق.
        </p>
        <div style={{
          background: 'rgba(108,92,231,0.12)',
          border: '1px solid rgba(108,92,231,0.3)',
          borderRadius: 14,
          padding: 16,
        }}>
          <div style={{ fontWeight: 800, marginBottom: 8, color: '#a78bfa' }}>الحل معنا:</div>
          <ul style={{ margin: 0, paddingRight: 18, lineHeight: 1.85, color: '#c8c8d8', fontSize: '0.95rem' }}>
            <li>سيارات من المخزون أو في الطريق — بحالة واضحة</li>
            <li>طلب واحد: اسمك ورقم هاتفك</li>
            <li>نتصل بك لتأكيد التوفر والسعر والخطوات التالية</li>
          </ul>
        </div>
      </section>

      {/* ========== 3) فوائد ========== */}
      <section style={{ padding: '8px 16px 28px', maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 14, textAlign: 'center' }}>
          ماذا تربح عند الطلب معنا؟
        </h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {[{
            icon: <Clock size={20} color="#2dd4bf" />,
            t: 'توفير وقتك',
            d: 'بدل التنقل العشوائي — اطلب ونحن نتواصل معك.',
          }, {
            icon: <Truck size={20} color="#2dd4bf" />,
            t: 'وضوح الشحن والجمرك',
            d: 'تعرف إن كانت السيارة متاحة، مشحونة، أو تحت التخليص.',
          }, {
            icon: <Shield size={20} color="#2dd4bf" />,
            t: 'متابعة بعد البيع',
            d: 'قطع غيار وصيانة دورية عبر نفس المكتب.',
          }, {
            icon: <BadgeCheck size={20} color="#2dd4bf" />,
            t: 'سيارات أقل من 3 سنوات',
            d: 'جديدة أو حديثة الاستيراد حسب المتوفر.',
          }].map((x) => (
            <div key={x.t} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: 14,
            }}>
              <div style={{ marginTop: 2 }}>{x.icon}</div>
              <div>
                <div style={{ fontWeight: 800 }}>{x.t}</div>
                <div style={{ fontSize: '0.88rem', color: '#8888a0', marginTop: 2, lineHeight: 1.5 }}>{x.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* سيارات من المخزون — مختصرة */}
      {moreCars.length > 0 && (
        <section style={{ padding: '8px 16px 28px', maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 900, marginBottom: 12, textAlign: 'center' }}>
            من المخزون الآن
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {moreCars.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCarId(c.id);
                  scrollToForm();
                }}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  textAlign: 'right',
                  background: 'rgba(255,255,255,0.04)',
                  border: carId === c.id ? '2px solid #6c5ce7' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: 10,
                  color: 'inherit',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <div style={{
                  width: 72, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                  background: '#1a1a2e',
                }}>
                  {c.images?.[0] ? (
                    <img src={c.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Car size={22} color="#555" />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{c.brand} {c.model}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8888a0' }}>{c.year} · {c.badge || c.status}</div>
                  <div style={{ fontWeight: 800, color: '#4ade80', fontSize: '0.9rem' }}>
                    {c.price ? formatCurrency(c.price) : 'حسب الاتفاق'}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a78bfa' }}>اختر</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ========== 4) إثبات اجتماعي ========== */}
      <section style={{
        padding: '28px 16px',
        background: 'rgba(108,92,231,0.08)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 14, textAlign: 'center' }}>
            ثقة الزبائن
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { n: 'كريم من سطيف', t: 'تم التواصل بسرعة وتم توضيح حالة الشحن قبل الدفع. تعامل واضح.' },
              { n: 'سارة من الجزائر', t: 'حجزت من النموذج ورجعوا لي على الهاتف في نفس اليوم.' },
              { n: 'يونس من وهران', t: 'وجدت السيارة المناسبة من المخزون دون لف ودوران.' },
            ].map((r) => (
              <div key={r.n} style={{
                background: 'rgba(10,10,15,0.6)',
                borderRadius: 12,
                padding: 14,
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} color="#fbbf24" fill="#fbbf24" />)}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#c8c8d8' }}>« {r.t} »</p>
                <div style={{ marginTop: 8, fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa' }}>— {r.n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 5) العرض وإزالة المخاطر ========== */}
      <section style={{ padding: '28px 16px', maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 12, textAlign: 'center' }}>
          عرضك اليوم
        </h2>
        <div style={{
          background: 'linear-gradient(145deg, rgba(34,197,94,0.15), rgba(108,92,231,0.12))',
          border: '1px solid rgba(34,197,94,0.35)',
          borderRadius: 16,
          padding: 18,
        }}>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: 10 }}>عند الطلب الآن:</div>
          <ul style={{ margin: 0, paddingRight: 18, lineHeight: 1.9, fontSize: '0.95rem' }}>
            <li>تأكيد التوفر عبر اتصال من المكتب</li>
            <li>شرح السعر والمواصفات قبل أي التزام</li>
            <li>إمكانية المعاينة حسب الاتفاق</li>
            <li>متابعة الشحن للسيارات القادمة من الصين</li>
          </ul>
          <div style={{
            marginTop: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontSize: '0.88rem',
            color: '#c8c8d8',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={16} color="#4ade80" /> لا ندفع قبل التفاهم على التفاصيل
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={16} color="#4ade80" /> نتصل بك — أو راسلنا واتساب فوراً
            </span>
          </div>
        </div>
      </section>

      {/* ========== 6) نموذج الطلب ========== */}
      <section
        id="order-form"
        style={{
          padding: '28px 16px 40px',
          background: 'rgba(0,0,0,0.35)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, textAlign: 'center', marginBottom: 6 }}>
            اطلب الآن
          </h2>
          <p style={{ textAlign: 'center', color: '#8888a0', fontSize: '0.9rem', marginBottom: 18 }}>
            3 خانات فقط — ونتصل بك لتأكيد الحجز
          </p>

          {!done ? (
            <form onSubmit={submitOrder} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {error && (
                <div style={{
                  background: 'rgba(225,112,85,0.15)',
                  border: '1px solid #e17055',
                  color: '#e17055',
                  padding: '10px',
                  borderRadius: 10,
                  fontSize: '0.88rem',
                }}>
                  {error}
                </div>
              )}

              {cars.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#8888a0' }}>السيارة المطلوبة</label>
                  <select
                    value={carId}
                    onChange={(e) => setCarId(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      padding: '12px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: '#12121a',
                      color: '#e8e8f0',
                      fontSize: 16,
                    }}
                  >
                    {cars.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.brand} {c.model} {c.year}
                        {c.price ? ` — ${c.price.toLocaleString('ar-DZ')} دج` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.8rem', color: '#8888a0' }}>الاسم الكامل *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="اسمك"
                  autoComplete="name"
                  style={fieldStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#8888a0' }}>رقم الهاتف *</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(phoneMask(e.target.value))}
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="0555 12 34 56"
                  style={{ ...fieldStyle, direction: 'ltr', textAlign: 'left' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#8888a0' }}>الولاية</label>
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  style={{ ...fieldStyle, fontSize: 16 }}
                >
                  <option value="">اختر الولاية</option>
                  {WILAYAS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: 6,
                  width: '100%',
                  background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '16px',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
                }}
              >
                أكّد الطلب — اتصلوا بي
              </button>

              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  borderRadius: 12,
                  border: '1px solid rgba(37,211,102,0.5)',
                  color: '#25D366',
                  fontWeight: 700,
                }}
              >
                <MessageCircle size={18} /> أو راسلنا واتساب مباشرة
              </a>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <CheckCircle2 size={52} color="#22c55e" style={{ marginBottom: 12 }} />
              <h3 style={{ fontWeight: 900, marginBottom: 8 }}>تم استلام طلبك بنجاح</h3>
              <p style={{ color: '#8888a0', lineHeight: 1.65, marginBottom: 16 }}>
                سيتصل بك فريق المكتب قريباً لتأكيد التفاصيل.
              </p>
              <button
                type="button"
                onClick={sendWa}
                style={{
                  width: '100%',
                  background: '#25D366',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginBottom: 10,
                }}
              >
                أرسل نسخة عبر واتساب
              </button>
              <button
                type="button"
                onClick={() => setDone(false)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#8888a0',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  padding: '12px',
                  cursor: 'pointer',
                }}
              >
                طلب جديد
              </button>
            </div>
          )}

          <div style={{
            marginTop: 22,
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#8888a0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <Phone size={14} />
              <span dir="ltr" style={{ direction: 'ltr' }}>{formatPhone(office.phone)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <MapPin size={14} /> {office.city}
            </div>
          </div>

          {/* روابط ثانوية صغيرة في الأسفل فقط */}
          <div style={{
            marginTop: 20,
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#666',
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
          }}>
            <Link to="/store" style={{ color: '#666' }}>المتجر</Link>
            <Link to="/login" style={{ color: '#666' }}>المكتب</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 4,
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#12121a',
  color: '#e8e8f0',
  fontSize: 16, // يمنع زووم iOS
};

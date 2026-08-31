import React, { useState } from 'react';
import { MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { useClients } from '../hooks/useClients';
import { MESSAGE_TEMPLATES, fillTemplate } from '../utils/messageTemplates';
import { getWhatsAppLink } from '../utils/formatters';

export const Messages: React.FC = () => {
  const { clients } = useClients();
  const [selectedId, setSelectedId] = useState(MESSAGE_TEMPLATES[0].id);
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [car, setCar] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [copied, setCopied] = useState(false);

  const template = MESSAGE_TEMPLATES.find((t) => t.id === selectedId) || MESSAGE_TEMPLATES[0];

  const filled = fillTemplate(template.text, {
    name: name || 'الأخ/الأخت',
    car: car || 'السيارة',
    amount: amount || '...',
    date: date || '...',
    time: time || '...',
  });

  const onPickClient = (id: string) => {
    setClientId(id);
    const c = clients.find((x) => x.id === id);
    if (c) {
      setName(c.name);
      setPhone(c.phone);
      setCar([c.brand, c.model].filter(Boolean).join(' ') || c.vehicleInterest || '');
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(filled);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex' }}>
      <div className="page-header">
        <h1 className="page-title">رسائل واتساب جاهزة</h1>
        <p className="page-description">قوالب مهذبة للترحيب، المتابعة، المواعيد، الدفع، والتسليم.</p>
      </div>

      <div className="flex gap-lg" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* قائمة القوالب */}
        <div className="glass-card" style={{ padding: '12px', flex: '1 1 240px', maxHeight: '420px', overflowY: 'auto' }}>
          {MESSAGE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'right',
                padding: '10px 12px',
                marginBottom: '6px',
                borderRadius: '8px',
                border: selectedId === t.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: selectedId === t.id ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: selectedId === t.id ? 600 : 400,
              }}
            >
              {t.title}
            </button>
          ))}
        </div>

        {/* تعبئة وإرسال */}
        <div className="glass-card" style={{ padding: 'var(--spacing-lg)', flex: '2 1 320px' }}>
          <h3 style={{ marginBottom: '12px' }}>{template.title}</h3>

          {clients.length > 0 && (
            <div className="input-wrapper" style={{ marginBottom: '12px' }}>
              <label className="input-label">اختر زبوناً (اختياري)</label>
              <select className="input-field" value={clientId} onChange={(e) => onPickClient(e.target.value)}>
                <option value="">-- يدوي --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-md" style={{ marginBottom: '10px' }}>
            <Input label="الاسم" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="الهاتف (للواتساب)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex gap-md" style={{ marginBottom: '10px' }}>
            <Input label="السيارة" value={car} onChange={(e) => setCar(e.target.value)} />
            <Input label="المبلغ" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="flex gap-md" style={{ marginBottom: '14px' }}>
            <Input label="التاريخ" value={date} onChange={(e) => setDate(e.target.value)} placeholder="15/09/2026" />
            <Input label="الوقت" value={time} onChange={(e) => setTime(e.target.value)} placeholder="10:00" />
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: '10px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              minHeight: '140px',
              marginBottom: '14px',
            }}
          >
            {filled}
          </div>

          <div className="flex gap-md">
            <Button variant="ghost" leftIcon={copied ? <Check size={16} /> : <Copy size={16} />} onClick={copyText}>
              {copied ? 'تم النسخ' : 'نسخ النص'}
            </Button>
            {phone.trim() ? (
              <a
                href={getWhatsAppLink(phone, filled)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button variant="primary" leftIcon={<MessageCircle size={16} />}>
                  فتح واتساب وإرسال
                </Button>
              </a>
            ) : (
              <Button variant="primary" disabled leftIcon={<MessageCircle size={16} />}>
                أدخل رقم الهاتف أولاً
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

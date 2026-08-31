import React, { useState } from 'react';
import { Plus, Search, Calendar } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Modal } from '../components/UI/Modal';
import { useBookings } from '../hooks/useBookings';
import { useClients } from '../hooks/useClients';
import { useInventory } from '../hooks/useInventory';
import type { Booking, BookingFormData, BookingType, BookingStatus } from '../types';
import { BOOKING_TYPES, BOOKING_STATUSES, CHINESE_BRANDS } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import '../components/Clients/ClientTable.css';

export const Bookings: React.FC = () => {
  const { bookings, addBooking, updateBooking, deleteBooking, setStatus, todayBookings, upcomingBookings, stats } = useBookings();
  const { clients } = useClients();
  const { vehicles } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | undefined>();
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming'>('upcoming');

  const [form, setForm] = useState<BookingFormData>({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    type: 'showroom_visit',
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    vehicleBrand: '',
    vehicleModel: '',
    notes: '',
  });

  const openNew = () => {
    setEditing(undefined);
    setForm({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      type: 'showroom_visit',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      vehicleBrand: '',
      vehicleModel: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEdit = (b: Booking) => {
    setEditing(b);
    setForm({ ...b });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.clientName.trim() || !form.clientPhone.trim() || !form.date) return;
    if (editing) updateBooking(editing.id, form);
    else addBooking(form);
    setIsModalOpen(false);
  };

  const fillFromClient = (clientId: string) => {
    const c = clients.find((x) => x.id === clientId);
    if (!c) return;
    setForm((prev) => ({
      ...prev,
      clientId: c.id,
      clientName: c.name,
      clientPhone: c.phone,
      clientEmail: c.email || '',
      vehicleBrand: c.brand || prev.vehicleBrand,
      vehicleModel: c.model || prev.vehicleModel,
    }));
  };

  const list =
    activeTab === 'today'
      ? todayBookings
      : activeTab === 'upcoming'
      ? upcomingBookings
      : bookings;

  const filtered = list.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.clientName.toLowerCase().includes(q) ||
      b.clientPhone.includes(q) ||
      (b.vehicleBrand || '').toLowerCase().includes(q) ||
      (b.vehicleModel || '').toLowerCase().includes(q)
    );
  });

  const getTypeLabel = (key: string) => BOOKING_TYPES.find((t) => t.key === key)?.label || key;
  const getTypeEmoji = (key: string) => BOOKING_TYPES.find((t) => t.key === key)?.emoji || '';
  const getStatusInfo = (key: string) => BOOKING_STATUSES.find((s) => s.key === key) || { label: key, emoji: '', color: '#999' };

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex', height: '100%' }}>
      <div className="page-header flex justify-between items-center" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">الحجوزات والمواعيد</h1>
          <p className="page-description">زيارات المعرض، تجارب القيادة، الصيانة، والغسيل.</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={openNew}>
          حجز جديد
        </Button>
      </div>

      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 120px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>اليوم</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.today}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 120px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>قادمة</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{stats.upcoming}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 120px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>قيد الانتظار</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f0932b' }}>{stats.pending}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 120px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>مؤكدة</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#22c55e' }}>{stats.confirmed}</div>
        </div>
      </div>

      <div className="flex gap-sm">
        <Button variant={activeTab === 'upcoming' ? 'primary' : 'ghost'} onClick={() => setActiveTab('upcoming')}>القادمة</Button>
        <Button variant={activeTab === 'today' ? 'primary' : 'ghost'} onClick={() => setActiveTab('today')}>اليوم</Button>
        <Button variant={activeTab === 'all' ? 'primary' : 'ghost'} onClick={() => setActiveTab('all')}>الكل</Button>
      </div>

      <div className="glass-card flex-col" style={{ flex: 1, display: 'flex' }}>
        <div className="flex gap-md justify-between items-center" style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ width: '240px' }}>
            <Input placeholder="بحث بالاسم أو الهاتف..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftIcon={<Search size={16} />} />
          </div>
          <select className="input-field" style={{ width: '160px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}>
            <option value="">كل الحالات</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="table-container">
          {filtered.length === 0 ? (
            <div className="empty-state"><p>لا توجد حجوزات. أضف حجزاً جديداً.</p></div>
          ) : (
            <table className="client-table">
              <thead>
                <tr>
                  <th>التاريخ / الوقت</th>
                  <th>العميل</th>
                  <th>النوع</th>
                  <th>السيارة</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const st = getStatusInfo(b.status);
                  return (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{formatDate(b.date)}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{b.time}</div>
                      </td>
                      <td>
                        <div className="client-name-cell">
                          <p className="client-name">{b.clientName}</p>
                          <p className="client-phone">{b.clientPhone}</p>
                        </div>
                      </td>
                      <td>{getTypeEmoji(b.type)} {getTypeLabel(b.type)}</td>
                      <td>{[b.vehicleBrand, b.vehicleModel].filter(Boolean).join(' ') || '-'}</td>
                      <td>
                        <span style={{ color: st.color, fontWeight: 600 }}>{st.emoji} {st.label}</span>
                      </td>
                      <td>
                        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                          {b.status === 'pending' && (
                            <button className="icon-btn" title="تأكيد" onClick={() => setStatus(b.id, 'confirmed')}>✅</button>
                          )}
                          {(b.status === 'pending' || b.status === 'confirmed') && (
                            <button className="icon-btn" title="إكمال" onClick={() => setStatus(b.id, 'completed')}>✔️</button>
                          )}
                          <button className="icon-btn" title="تعديل" onClick={() => openEdit(b)}>✏️</button>
                          <button className="icon-btn" title="حذف" onClick={() => {
                            if (window.confirm('حذف هذا الحجز؟')) deleteBooking(b.id);
                          }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'تعديل حجز' : 'حجز جديد'}
        maxWidth="560px"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button variant="primary" onClick={handleSave}>حفظ</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {clients.length > 0 && (
            <div className="input-wrapper">
              <label className="input-label">اختيار من العملاء (اختياري)</label>
              <select className="input-field" onChange={(e) => e.target.value && fillFromClient(e.target.value)} defaultValue="">
                <option value="">-- عميل جديد أو يدوي --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-md">
            <Input label="اسم العميل *" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required />
            <Input label="الهاتف *" value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} required />
          </div>

          <div className="flex gap-md">
            <div className="input-wrapper" style={{ flex: 1 }}>
              <label className="input-label">نوع الموعد</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as BookingType })}>
                {BOOKING_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>{t.emoji} {t.label}</option>
                ))}
              </select>
            </div>
            <div className="input-wrapper" style={{ flex: 1 }}>
              <label className="input-label">الحالة</label>
              <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as BookingStatus })}>
                {BOOKING_STATUSES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-md">
            <Input label="التاريخ *" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="الوقت" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>

          <div className="flex gap-md">
            <div className="input-wrapper" style={{ flex: 1 }}>
              <label className="input-label">الماركة</label>
              <select className="input-field" value={form.vehicleBrand || ''} onChange={(e) => setForm({ ...form, vehicleBrand: e.target.value })}>
                <option value="">--</option>
                {CHINESE_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <Input label="الموديل" value={form.vehicleModel || ''} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} />
          </div>

          {vehicles.length > 0 && (
            <div className="input-wrapper">
              <label className="input-label">ربط بسيارة من المخزون (اختياري)</label>
              <select
                className="input-field"
                value={form.vehicleId || ''}
                onChange={(e) => {
                  const v = vehicles.find((x) => x.id === e.target.value);
                  setForm((prev) => ({
                    ...prev,
                    vehicleId: e.target.value || undefined,
                    vehicleBrand: v?.brand || prev.vehicleBrand,
                    vehicleModel: v?.model || prev.vehicleModel,
                  }));
                }}
              >
                <option value="">-- بدون --</option>
                {vehicles.filter((v) => v.status === 'available' || v.status === 'reserved').map((v) => (
                  <option key={v.id} value={v.id}>{v.brand} {v.model} {v.year}</option>
                ))}
              </select>
            </div>
          )}

          <div className="input-wrapper">
            <label className="input-label">ملاحظات</label>
            <textarea className="input-field" style={{ minHeight: '60px' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

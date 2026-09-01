import React, { useState, useEffect } from 'react';
import { Plus, Search, Wrench, Droplets } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { useMaintenance } from '../hooks/useMaintenance';
import { useInventory } from '../hooks/useInventory';
import type {
  VehicleServiceProfile,
  VehicleServiceProfileFormData,
  MaintenanceRecordFormData,
  ServiceType,
} from '../types';
import { SERVICE_TYPES, COMMON_OIL_TYPES, CHINESE_BRANDS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Modal } from '../components/UI/Modal';
import { bestOilFilterMatch, specToMaintenanceFields } from '../services/oilFilterLookup';
import '../components/Clients/ClientTable.css';

export const Maintenance: React.FC = () => {
  const {
    profiles,
    records,
    addProfile,
    updateProfile,
    deleteProfile,
    addRecord,
    searchProfiles,
    getDueServices,
    stats,
  } = useMaintenance();
  const { vehicles } = useInventory();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'due' | 'history'>('list');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<VehicleServiceProfile | undefined>();
  const [catalogHint, setCatalogHint] = useState('');

  const [form, setForm] = useState<VehicleServiceProfileFormData>({
    vin: '', brand: '', model: '', year: new Date().getFullYear(),
    clientName: '', clientPhone: '',
    oilType: '5W-30 Fully Synthetic', oilCapacity: '4.5',
    oilChangeIntervalKm: 10000, oilChangeIntervalMonths: 12,
    oilFilterType: '', airFilterType: '', fuelFilterType: '', cabinFilterType: '',
    lastOilChangeDate: '', lastOilChangeKm: 0, currentMileage: 0, notes: '',
  });

  const [serviceForm, setServiceForm] = useState<MaintenanceRecordFormData>({
    profileId: '', serviceTypes: ['oil_change', 'oil_filter'],
    serviceDate: new Date().toISOString().split('T')[0],
    mileage: 0, cost: 0, notes: '',
    oilTypeUsed: '', oilFilterUsed: '', airFilterUsed: '', fuelFilterUsed: '', cabinFilterUsed: '',
  });

  const filtered = searchProfiles(searchQuery);
  const dueList = getDueServices();

  /** تعبئة حقول الزيت/الفلاتر من الكتالوج */
  const applyFromCatalog = (brand: string, model: string, year?: number) => {
    if (!brand || !model) {
      setCatalogHint('أدخل الماركة والموديل أولاً');
      return false;
    }
    const spec = bestOilFilterMatch({ brand, model, year });
    if (!spec) {
      setCatalogHint('لا توجد مواصفة في الدليل لهذه السيارة — املأ يدوياً أو أضف من دليل الزيت');
      return false;
    }
    const fields = specToMaintenanceFields(spec);
    setForm((prev) => ({
      ...prev,
      brand: fields.brand || prev.brand,
      model: fields.model || prev.model,
      oilType: fields.oilType,
      oilCapacity: fields.oilCapacity,
      oilChangeIntervalKm: fields.oilChangeIntervalKm,
      oilChangeIntervalMonths: fields.oilChangeIntervalMonths,
      oilFilterType: fields.oilFilterType,
      airFilterType: fields.airFilterType,
      fuelFilterType: fields.fuelFilterType,
      cabinFilterType: fields.cabinFilterType,
      notes: [prev.notes, fields.notes].filter(Boolean).join(' · '),
    }));
    setCatalogHint(`تم التعبئة من الدليل: ${spec.brand} ${spec.model} (${spec.oilViscosity})`);
    return true;
  };

  // قادم من صفحة دليل الزيت والفلاتر
  useEffect(() => {
    if (searchParams.get('prefill') !== '1') return;
    try {
      const raw = sessionStorage.getItem('crm_oil_prefills');
      if (!raw) return;
      const fields = JSON.parse(raw) as ReturnType<typeof specToMaintenanceFields>;
      setEditingProfile(undefined);
      setForm((prev) => ({
        ...prev,
        vin: prev.vin || '',
        brand: fields.brand || prev.brand,
        model: fields.model || prev.model,
        year: prev.year || new Date().getFullYear(),
        oilType: fields.oilType || prev.oilType,
        oilCapacity: fields.oilCapacity || prev.oilCapacity,
        oilChangeIntervalKm: fields.oilChangeIntervalKm || prev.oilChangeIntervalKm,
        oilChangeIntervalMonths: fields.oilChangeIntervalMonths || prev.oilChangeIntervalMonths,
        oilFilterType: fields.oilFilterType || prev.oilFilterType,
        airFilterType: fields.airFilterType || prev.airFilterType,
        fuelFilterType: fields.fuelFilterType || prev.fuelFilterType,
        cabinFilterType: fields.cabinFilterType || prev.cabinFilterType,
        notes: fields.notes || prev.notes,
      }));
      setCatalogHint('تم استيراد المواصفات من دليل الزيت والفلاتر');
      setIsProfileModalOpen(true);
      sessionStorage.removeItem('crm_oil_prefills');
      setSearchParams({}, { replace: true });
    } catch {
      /* ignore */
    }
  }, [searchParams, setSearchParams]);

  const openNewProfile = () => {
    setEditingProfile(undefined);
    setCatalogHint('');
    setForm({
      vin: '', brand: '', model: '', year: new Date().getFullYear(),
      clientName: '', clientPhone: '',
      oilType: '5W-30 Fully Synthetic', oilCapacity: '4.5',
      oilChangeIntervalKm: 10000, oilChangeIntervalMonths: 12,
      oilFilterType: '', airFilterType: '', fuelFilterType: '', cabinFilterType: '',
      lastOilChangeDate: '', lastOilChangeKm: 0, currentMileage: 0, notes: '',
    });
    setIsProfileModalOpen(true);
  };

  const openEditProfile = (p: VehicleServiceProfile) => {
    setEditingProfile(p);
    setCatalogHint('');
    setForm({ ...p });
    setIsProfileModalOpen(true);
  };

  const openServiceModal = (profileId: string) => {
    const p = profiles.find((x) => x.id === profileId);
    setServiceForm({
      profileId,
      serviceTypes: ['oil_change', 'oil_filter'],
      serviceDate: new Date().toISOString().split('T')[0],
      mileage: p?.currentMileage || 0,
      cost: 0,
      notes: '',
      oilTypeUsed: p?.oilType || '',
      oilFilterUsed: p?.oilFilterType || '',
      airFilterUsed: p?.airFilterType || '',
      fuelFilterUsed: p?.fuelFilterType || '',
      cabinFilterUsed: p?.cabinFilterType || '',
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveProfile = () => {
    if (!form.vin || !form.brand || !form.model) return;
    if (editingProfile) updateProfile(editingProfile.id, form);
    else addProfile(form);
    setIsProfileModalOpen(false);
  };

  const handleSaveService = () => {
    if (!serviceForm.profileId || serviceForm.serviceTypes.length === 0) return;
    addRecord(serviceForm);
    setIsServiceModalOpen(false);
  };

  const toggleServiceType = (key: ServiceType) => {
    setServiceForm((prev) => {
      const exists = prev.serviceTypes.includes(key);
      return {
        ...prev,
        serviceTypes: exists
          ? prev.serviceTypes.filter((t) => t !== key)
          : [...prev.serviceTypes, key],
      };
    });
  };

  const fillFromVehicle = (vehicleId: string) => {
    const v = vehicles.find((x) => x.id === vehicleId);
    if (!v) return;
    setForm((prev) => ({
      ...prev,
      vehicleId: v.id,
      vin: v.vin || '',
      brand: v.brand,
      model: v.model,
      year: v.year,
      currentMileage: v.mileage || 0,
      clientName: v.soldToClientName || prev.clientName,
      clientId: v.soldToClientId || prev.clientId,
    }));
    // تعبئة الزيت والفلاتر تلقائياً من الدليل
    setTimeout(() => applyFromCatalog(v.brand, v.model, v.year), 0);
  };

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex', height: '100%' }}>
      <div className="page-header flex justify-between items-center" style={{ marginBottom: 0, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">الصيانة الدورية</h1>
          <p className="page-description">متابعة تغيير الزيت والفلاتر وجداول الصيانة لكل سيارة.</p>
        </div>
        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
          <Link to="/oil-filters" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" leftIcon={<Droplets size={18} />}>دليل الزيت والفلاتر</Button>
          </Link>
          <Button variant="primary" leftIcon={<Plus size={18} />} onClick={openNewProfile}>
            إضافة سيارة للصيانة
          </Button>
        </div>
      </div>

      <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>سيارات مسجلة</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.totalProfiles}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>تحتاج صيانة</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: stats.dueCount > 0 ? '#ef4444' : '#22c55e' }}>
            {stats.dueCount}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>عمليات صيانة</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.totalRecords}</div>
        </div>
        <div className="glass-card" style={{ padding: '12px 18px', flex: '1 1 140px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>إيرادات الصيانة</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {formatCurrency(stats.totalServiceRevenue)}
          </div>
        </div>
      </div>

      <div className="flex gap-sm">
        <Button variant={activeTab === 'list' ? 'primary' : 'ghost'} onClick={() => setActiveTab('list')}>السيارات</Button>
        <Button variant={activeTab === 'due' ? 'primary' : 'ghost'} onClick={() => setActiveTab('due')}>
          تحتاج صيانة ({dueList.length})
        </Button>
        <Button variant={activeTab === 'history' ? 'primary' : 'ghost'} onClick={() => setActiveTab('history')}>سجل الصيانة</Button>
      </div>

      {activeTab === 'list' && (
        <div className="glass-card flex-col" style={{ flex: 1, display: 'flex' }}>
          <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: '280px' }}>
              <Input placeholder="بحث بـ VIN أو الماركة أو العميل..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftIcon={<Search size={16} />} />
            </div>
          </div>
          <div className="table-container">
            {filtered.length === 0 ? (
              <div className="empty-state"><p>لا توجد سيارات مسجلة للصيانة. أضف سيارة الآن.</p></div>
            ) : (
              <table className="client-table">
                <thead>
                  <tr>
                    <th>السيارة / VIN</th>
                    <th>العميل</th>
                    <th>نوع الزيت</th>
                    <th>آخر تغيير زيت</th>
                    <th>الكيلومترات</th>
                    <th>الفترة</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="client-name-cell">
                          <p className="client-name">{p.brand} {p.model} {p.year}</p>
                          <p className="client-phone">{p.vin || '-'}</p>
                        </div>
                      </td>
                      <td>{p.clientName || '-'}{p.clientPhone ? ` • ${p.clientPhone}` : ''}</td>
                      <td>{p.oilType || '-'}</td>
                      <td>
                        {p.lastOilChangeDate ? formatDate(p.lastOilChangeDate) : '-'}
                        {p.lastOilChangeKm ? ` • ${p.lastOilChangeKm.toLocaleString()} كم` : ''}
                      </td>
                      <td>{p.currentMileage ? p.currentMileage.toLocaleString() + ' كم' : '-'}</td>
                      <td>{p.oilChangeIntervalKm ? `كل ${p.oilChangeIntervalKm.toLocaleString()} كم` : '-'}</td>
                      <td>
                        <div className="flex gap-sm">
                          <button className="icon-btn" title="تسجيل صيانة" onClick={() => openServiceModal(p.id)}>
                            <Wrench size={16} />
                          </button>
                          <button className="icon-btn" title="تعديل" onClick={() => openEditProfile(p)}>✏️</button>
                          <button className="icon-btn" title="حذف" onClick={() => {
                            if (window.confirm('حذف ملف الصيانة؟')) deleteProfile(p.id);
                          }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'due' && (
        <div className="glass-card" style={{ padding: 'var(--spacing-md)', flex: 1 }}>
          {dueList.length === 0 ? (
            <div className="empty-state"><p>لا توجد سيارات تحتاج صيانة حالياً 👍</p></div>
          ) : (
            <div className="table-container">
              <table className="client-table">
                <thead>
                  <tr>
                    <th>السيارة</th>
                    <th>العميل</th>
                    <th>المتبقي (كم)</th>
                    <th>المتبقي (أيام)</th>
                    <th>الحالة</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {dueList.map((item) => (
                    <tr key={item.profile.id}>
                      <td>{item.profile.brand} {item.profile.model} — {item.profile.vin}</td>
                      <td>{item.profile.clientName || '-'}</td>
                      <td style={{ color: item.kmRemaining <= 0 ? '#ef4444' : '#f0932b', fontWeight: 600 }}>
                        {item.kmRemaining} كم
                      </td>
                      <td>
                        {item.daysRemaining !== null ? `${item.daysRemaining} يوم` : '-'}
                      </td>
                      <td>
                        {item.isOverdue ? (
                          <span style={{ color: '#ef4444' }}>⚠️ متأخرة</span>
                        ) : (
                          <span style={{ color: '#f0932b' }}>قريبة</span>
                        )}
                      </td>
                      <td>
                        <Button variant="primary" onClick={() => openServiceModal(item.profile.id)}>
                          تسجيل صيانة
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="glass-card" style={{ padding: 'var(--spacing-md)', flex: 1 }}>
          {records.length === 0 ? (
            <div className="empty-state"><p>لا يوجد سجل صيانة بعد.</p></div>
          ) : (
            <div className="table-container">
              <table className="client-table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>السيارة</th>
                    <th>العميل</th>
                    <th>الخدمات</th>
                    <th>الكيلومترات</th>
                    <th>التكلفة</th>
                    <th>الزيت المستخدم</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td>{formatDate(r.serviceDate)}</td>
                      <td>{r.vehicleLabel}<br/><small>{r.vin}</small></td>
                      <td>{r.clientName || '-'}</td>
                      <td>
                        {r.serviceTypes.map((t) => {
                          const info = SERVICE_TYPES.find((s) => s.key === t);
                          return info ? `${info.emoji} ${info.label}` : t;
                        }).join('، ')}
                      </td>
                      <td>{r.mileage.toLocaleString()} كم</td>
                      <td>{formatCurrency(r.cost)}</td>
                      <td>{r.oilTypeUsed || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={editingProfile ? 'تعديل ملف الصيانة' : 'إضافة سيارة للصيانة'}
        maxWidth="700px"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsProfileModalOpen(false)}>إلغاء</Button>
            <Button variant="primary" onClick={handleSaveProfile}>حفظ</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!editingProfile && vehicles.length > 0 && (
            <div className="input-wrapper">
              <label className="input-label">تعبئة من المخزون (اختياري)</label>
              <select className="input-field" onChange={(e) => e.target.value && fillFromVehicle(e.target.value)} defaultValue="">
                <option value="">-- اختر سيارة --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} {v.year} {v.vin ? `— ${v.vin}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-md">
            <Input label="رقم الهيكل (VIN) *" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} required />
            <div className="input-wrapper" style={{ flex: 1 }}>
              <label className="input-label">الماركة *</label>
              <select
                className="input-field"
                value={form.brand}
                onChange={(e) => {
                  const brand = e.target.value;
                  setForm({ ...form, brand });
                }}
              >
                <option value="">اختر</option>
                {CHINESE_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-md">
            <Input
              label="الموديل *"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="مثال: X70 Plus أو Tiggo 8"
            />
            <Input label="السنة" type="number" value={form.year || ''} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
            <Input label="الكيلومترات الحالية" type="number" value={form.currentMileage || ''} onChange={(e) => setForm({ ...form, currentMileage: Number(e.target.value) })} />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
            }}
          >
            <Button
              variant="primary"
              leftIcon={<Droplets size={16} />}
              onClick={() => applyFromCatalog(form.brand, form.model, form.year)}
            >
              تعبئة الزيت والفلاتر من الدليل
            </Button>
            {catalogHint && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{catalogHint}</span>
            )}
          </div>

          <div className="flex gap-md">
            <Input label="اسم العميل" value={form.clientName || ''} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
            <Input label="هاتف العميل" value={form.clientPhone || ''} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>مواصفات الزيت</p>
            <div className="flex gap-md">
              <div className="input-wrapper" style={{ flex: 1 }}>
                <label className="input-label">نوع الزيت / اللزوجة والمعيار</label>
                <input
                  className="input-field"
                  list="oil-types-list"
                  value={form.oilType}
                  onChange={(e) => setForm({ ...form, oilType: e.target.value })}
                  placeholder="5W-30 Fully Synthetic (API SP)"
                />
                <datalist id="oil-types-list">
                  {COMMON_OIL_TYPES.map((o) => (
                    <option key={o} value={o} />
                  ))}
                </datalist>
              </div>
              <Input label="السعة (لتر)" value={form.oilCapacity} onChange={(e) => setForm({ ...form, oilCapacity: e.target.value })} placeholder="4.5" />
            </div>
            <div className="flex gap-md" style={{ marginTop: '10px' }}>
              <Input label="فترة التغيير (كم)" type="number" value={form.oilChangeIntervalKm || ''} onChange={(e) => setForm({ ...form, oilChangeIntervalKm: Number(e.target.value) })} />
              <Input label="فترة التغيير (أشهر)" type="number" value={form.oilChangeIntervalMonths || ''} onChange={(e) => setForm({ ...form, oilChangeIntervalMonths: Number(e.target.value) })} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>أنواع الفلاتر</p>
            <div className="flex gap-md">
              <Input label="فلتر الزيت" value={form.oilFilterType} onChange={(e) => setForm({ ...form, oilFilterType: e.target.value })} placeholder="رقم / نوع الفلتر" />
              <Input label="فلتر الهواء" value={form.airFilterType} onChange={(e) => setForm({ ...form, airFilterType: e.target.value })} />
            </div>
            <div className="flex gap-md" style={{ marginTop: '10px' }}>
              <Input label="فلتر الوقود" value={form.fuelFilterType} onChange={(e) => setForm({ ...form, fuelFilterType: e.target.value })} />
              <Input label="فلتر المقصورة" value={form.cabinFilterType} onChange={(e) => setForm({ ...form, cabinFilterType: e.target.value })} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>آخر تغيير زيت</p>
            <div className="flex gap-md">
              <Input label="التاريخ" type="date" value={form.lastOilChangeDate} onChange={(e) => setForm({ ...form, lastOilChangeDate: e.target.value })} />
              <Input label="عند كيلومتر" type="number" value={form.lastOilChangeKm || ''} onChange={(e) => setForm({ ...form, lastOilChangeKm: Number(e.target.value) })} />
            </div>
          </div>

          <div className="input-wrapper">
            <label className="input-label">ملاحظات</label>
            <textarea className="input-field" style={{ minHeight: '60px' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title="تسجيل عملية صيانة"
        maxWidth="600px"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsServiceModalOpen(false)}>إلغاء</Button>
            <Button variant="primary" onClick={handleSaveService}>حفظ الصيانة</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>نوع الخدمة (يمكن اختيار أكثر من واحد)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SERVICE_TYPES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => toggleServiceType(s.key as ServiceType)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: serviceForm.serviceTypes.includes(s.key as ServiceType)
                      ? '2px solid var(--accent-primary)'
                      : '1px solid var(--border-color)',
                    background: serviceForm.serviceTypes.includes(s.key as ServiceType)
                      ? 'rgba(var(--accent-primary-rgb, 99, 102, 241), 0.15)'
                      : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-md">
            <Input label="تاريخ الصيانة" type="date" value={serviceForm.serviceDate} onChange={(e) => setServiceForm({ ...serviceForm, serviceDate: e.target.value })} />
            <Input label="الكيلومترات الحالية" type="number" value={serviceForm.mileage || ''} onChange={(e) => setServiceForm({ ...serviceForm, mileage: Number(e.target.value) })} />
          </div>

          <div className="flex gap-md">
            <Input label="نوع الزيت المستخدم" value={serviceForm.oilTypeUsed || ''} onChange={(e) => setServiceForm({ ...serviceForm, oilTypeUsed: e.target.value })} />
            <Input label="فلتر الزيت المستخدم" value={serviceForm.oilFilterUsed || ''} onChange={(e) => setServiceForm({ ...serviceForm, oilFilterUsed: e.target.value })} />
          </div>

          <div className="flex gap-md">
            <Input label="فلتر الهواء" value={serviceForm.airFilterUsed || ''} onChange={(e) => setServiceForm({ ...serviceForm, airFilterUsed: e.target.value })} />
            <Input label="فلتر الوقود" value={serviceForm.fuelFilterUsed || ''} onChange={(e) => setServiceForm({ ...serviceForm, fuelFilterUsed: e.target.value })} />
          </div>

          <div className="flex gap-md">
            <Input label="فلتر المقصورة" value={serviceForm.cabinFilterUsed || ''} onChange={(e) => setServiceForm({ ...serviceForm, cabinFilterUsed: e.target.value })} />
            <Input label="تكلفة الصيانة (دج)" type="number" value={serviceForm.cost || ''} onChange={(e) => setServiceForm({ ...serviceForm, cost: Number(e.target.value) })} />
          </div>

          <div className="input-wrapper">
            <label className="input-label">ملاحظات</label>
            <textarea className="input-field" style={{ minHeight: '60px' }} value={serviceForm.notes} onChange={(e) => setServiceForm({ ...serviceForm, notes: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

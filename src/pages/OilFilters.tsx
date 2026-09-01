import React, { useMemo, useState } from 'react';
import { Search, Droplets, Filter, Wind, Fuel, Snowflake, Copy, Check, Wrench, Gauge } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import {
  OIL_FILTER_CATALOG,
  getCatalogBrands,
  getModelsForBrand,
  getCatalogRegions,
  type OilFilterSpec,
} from '../data/oilFilterCatalog';
import {
  lookupOilFilters,
  bestOilFilterMatch,
  specToMaintenanceFields,
  mileageAdvice,
} from '../services/oilFilterLookup';
import { useNavigate } from 'react-router-dom';

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      title="نسخ"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        });
      }}
      style={{
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: ok ? '#22c55e' : 'var(--text-secondary)',
        padding: 4,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {ok ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function SpecCard({
  spec,
  mileageKm,
  onUseInMaintenance,
}: {
  spec: OilFilterSpec;
  mileageKm?: number;
  onUseInMaintenance: (s: OilFilterSpec) => void;
}) {
  const advice = mileageAdvice(spec, mileageKm);
  return (
    <div
      className="glass-card"
      style={{
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex justify-between items-start" style={{ gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
            {spec.brand} {spec.model}
          </h3>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {spec.years}
            {spec.engine ? ` · المحرك: ${spec.engine}` : ''}
            {spec.region ? ` · ${spec.region}` : ''}
          </p>
        </div>
        <Button variant="primary" onClick={() => onUseInMaintenance(spec)} leftIcon={<Wrench size={16} />}>
          استخدام في الصيانة
        </Button>
      </div>

      {advice && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          <Gauge size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{advice}</span>
        </div>
      )}

      <div
        style={{
          background: 'rgba(34, 197, 94, 0.08)',
          borderRadius: 12,
          padding: 12,
          border: '1px solid rgba(34, 197, 94, 0.25)',
        }}
      >
        <div className="flex items-center gap-sm" style={{ marginBottom: 8, fontWeight: 600 }}>
          <Droplets size={18} color="#22c55e" />
          <span>الزيت الموصى به</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>اللزوجة</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              {spec.oilViscosity} <CopyBtn text={spec.oilViscosity} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>المعيار</div>
            <div style={{ fontWeight: 600 }}>
              {spec.oilSpec} <CopyBtn text={spec.oilSpec} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>النوع</div>
            <div>{spec.oilType}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>السعة</div>
            <div>{spec.oilCapacityL} لتر</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>فترة التغيير</div>
            <div>
              كل {spec.oilIntervalKm.toLocaleString()} كم أو {spec.oilIntervalMonths} أشهر
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <FilterRow icon={<Filter size={16} />} title="فلتر الزيت" value={spec.oilFilter} alt={spec.oilFilterAlt} />
        <FilterRow icon={<Wind size={16} />} title="فلتر الهواء" value={spec.airFilter} alt={spec.airFilterAlt} />
        <FilterRow icon={<Fuel size={16} />} title="فلتر البنزين" value={spec.fuelFilter} alt={spec.fuelFilterAlt} />
        <FilterRow
          icon={<Snowflake size={16} />}
          title="فلتر المكيف / المقصورة"
          value={spec.cabinFilter}
          alt={spec.cabinFilterAlt}
        />
      </div>

      {spec.notes && (
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📌 {spec.notes}</p>
      )}
      <p style={{ margin: 0, fontSize: '0.75rem', color: '#f59e0b' }}>
        ⚠️ الأرقام مرجعية شائعة — تحقق من المقاس عند التركيب
      </p>
    </div>
  );
}

function FilterRow({
  icon,
  title,
  value,
  alt,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  alt?: string;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
        borderRadius: 10,
        padding: 10,
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center gap-sm" style={{ fontWeight: 600, marginBottom: 6, fontSize: '0.9rem' }}>
        {icon}
        <span>{title}</span>
        <CopyBtn text={value} />
      </div>
      <div style={{ fontSize: '0.85rem', lineHeight: 1.45 }}>{value}</div>
      {alt && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>بديل: {alt}</div>
      )}
    </div>
  );
}

export const OilFilters: React.FC = () => {
  const navigate = useNavigate();
  const brands = useMemo(() => getCatalogBrands(), []);
  const regions = useMemo(() => getCatalogRegions(), []);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<string>('');
  const [region, setRegion] = useState('');
  const [mileage, setMileage] = useState<string>('');
  const [freeText, setFreeText] = useState('');
  const [searched, setSearched] = useState(false);

  const models = useMemo(() => (brand ? getModelsForBrand(brand) : []), [brand]);
  const mileageKm = mileage ? Number(mileage) : undefined;

  const results = useMemo(() => {
    if (!searched && !brand && !model && !freeText && !region) return OIL_FILTER_CATALOG;
    return lookupOilFilters({
      brand: brand || undefined,
      model: model || undefined,
      year: year ? Number(year) : undefined,
      freeText: freeText || undefined,
      region: region || undefined,
      mileageKm,
    });
  }, [brand, model, year, freeText, region, mileageKm, searched]);

  const handleSearch = () => setSearched(true);

  const handleUseInMaintenance = (spec: OilFilterSpec) => {
    const fields = specToMaintenanceFields(spec, mileageKm);
    try {
      sessionStorage.setItem('crm_oil_prefills', JSON.stringify(fields));
    } catch {
      /* ignore */
    }
    navigate('/maintenance?prefill=1');
  };

  const quickExamples = [
    { label: 'جيتور 70 بلس', brand: 'Jetour', model: 'X70 Plus' },
    { label: 'تيجو 8', brand: 'Chery', model: 'Tiggo 8' },
    { label: 'تويوتا كورولا', brand: 'Toyota', model: 'Corolla' },
    { label: 'هيونداي توسان', brand: 'Hyundai', model: 'Tucson' },
    { label: 'داسيا داستر', brand: 'Dacia', model: 'Duster' },
    { label: 'فولكس غولف', brand: 'Volkswagen', model: 'Golf' },
  ];

  return (
    <div className="animate-fade-in flex-col gap-lg" style={{ display: 'flex', height: '100%' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h1 className="page-title">دليل الزيت والفلاتر</h1>
        <p className="page-description">
          أدخل الماركة والموديل والمسافة المقطوعة لتحصل على نوع الزيت واللزوجة والمعايير وفلاتر الزيت والهواء
          والبنزين والمكيف — صيني · ياباني · ألماني · فرنسي · كوري.
        </p>
      </div>

      <div className="glass-card" style={{ padding: 16 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <div className="input-wrapper">
            <label className="input-label">المنطقة / النوع</label>
            <select
              className="input-field"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setBrand('');
                setModel('');
                setSearched(true);
              }}
            >
              <option value="">الكل</option>
              {regions.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="input-wrapper">
            <label className="input-label">الماركة</label>
            <select
              className="input-field"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setModel('');
                setSearched(true);
              }}
            >
              <option value="">الكل</option>
              {brands
                .filter((b) => {
                  if (!region) return true;
                  return OIL_FILTER_CATALOG.some((x) => x.brand === b && x.region === region);
                })
                .map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </select>
          </div>

          <div className="input-wrapper">
            <label className="input-label">الموديل</label>
            <select
              className="input-field"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setSearched(true);
              }}
              disabled={!brand}
            >
              <option value="">الكل</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="السنة (اختياري)"
            type="number"
            placeholder="2024"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setSearched(true);
            }}
          />

          <Input
            label="المسافة المقطوعة (كم)"
            type="number"
            placeholder="مثال: 45000"
            value={mileage}
            onChange={(e) => {
              setMileage(e.target.value);
              setSearched(true);
            }}
            leftIcon={<Gauge size={16} />}
          />

          <Input
            label="بحث حر"
            placeholder="مثال: كورولا أو tiggo 8"
            value={freeText}
            onChange={(e) => {
              setFreeText(e.target.value);
              setSearched(true);
            }}
            leftIcon={<Search size={16} />}
          />

          <Button variant="primary" onClick={handleSearch} leftIcon={<Search size={18} />}>
            بحث
          </Button>
        </div>

        <div className="flex gap-sm" style={{ marginTop: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>سريع:</span>
          {quickExamples.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => {
                setBrand(q.brand);
                setModel(q.model);
                setRegion('');
                setFreeText('');
                setSearched(true);
              }}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                border: '1px solid var(--border-color)',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        النتائج: <strong>{results.length}</strong> مواصفة
        {mileageKm ? ` · المسافة المدخلة: ${mileageKm.toLocaleString()} كم` : ''}
        {bestOilFilterMatch({ brand, model, year: year ? Number(year) : undefined }) && brand && model
          ? ' · أفضل تطابق ظاهر أولاً'
          : ''}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflow: 'auto', paddingBottom: 24 }}>
        {results.length === 0 ? (
          <div className="glass-card empty-state" style={{ padding: 32 }}>
            <p>لا توجد نتيجة. جرّب ماركة أخرى أو بحثاً أوسع.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              يمكنك إضافة مواصفات يدوياً من صفحة الصيانة الدورية.
            </p>
          </div>
        ) : (
          results.map((spec) => (
            <SpecCard key={spec.id} spec={spec} mileageKm={mileageKm} onUseInMaintenance={handleUseInMaintenance} />
          ))
        )}
      </div>
    </div>
  );
};

export default OilFilters;

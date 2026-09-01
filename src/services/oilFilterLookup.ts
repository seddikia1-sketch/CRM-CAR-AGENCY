import { OIL_FILTER_CATALOG, type OilFilterSpec } from '../data/oilFilterCatalog';

export interface LookupQuery {
  brand?: string;
  model?: string;
  year?: number;
  engine?: string;
  freeText?: string;
  region?: string;
  mileageKm?: number;
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

function yearInRange(year: number | undefined, range: string): boolean {
  if (!year) return true;
  const m = range.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (!m) return true;
  const from = Number(m[1]);
  const to = Number(m[2]);
  return year >= from && year <= to;
}

/** بحث مرن عن مواصفات الزيت والفلاتر */
export function lookupOilFilters(q: LookupQuery): OilFilterSpec[] {
  const brand = q.brand ? norm(q.brand) : '';
  const model = q.model ? norm(q.model) : '';
  const engine = q.engine ? norm(q.engine) : '';
  const free = q.freeText ? norm(q.freeText) : '';
  const region = q.region ? norm(q.region) : '';

  let list = [...OIL_FILTER_CATALOG];

  if (region) {
    list = list.filter((x) => (x.region || '').toLowerCase() === region);
  }
  if (brand) {
    list = list.filter((x) => norm(x.brand).includes(brand) || brand.includes(norm(x.brand)));
  }
  if (model) {
    list = list.filter(
      (x) =>
        norm(x.model).includes(model) ||
        model.includes(norm(x.model)) ||
        (model.includes('70') && norm(x.model).includes('70')) ||
        (model.includes('تيجو') && norm(x.model).includes('tiggo')) ||
        (model.includes('tiggo') && norm(x.model).includes('tiggo')) ||
        (model.includes('كورولا') && norm(x.model).includes('corolla')) ||
        (model.includes('داستر') && norm(x.model).includes('duster')) ||
        (model.includes('سانديرو') && norm(x.model).includes('sandero'))
    );
  }
  if (q.year) {
    list = list.filter((x) => yearInRange(q.year, x.years));
  }
  if (engine) {
    list = list.filter((x) => !x.engine || norm(x.engine).includes(engine));
  }
  if (free) {
    list = list.filter((x) => {
      const blob = norm(
        `${x.brand} ${x.model} ${x.engine || ''} ${x.oilViscosity} ${x.oilFilter} ${x.notes || ''} ${x.region || ''}`
      );
      return free.split(' ').every((w) => blob.includes(w));
    });
  }

  return list;
}

export function bestOilFilterMatch(q: LookupQuery): OilFilterSpec | null {
  const results = lookupOilFilters(q);
  return results[0] || null;
}

/** نصائح بناءً على المسافة المقطوعة */
export function mileageAdvice(spec: OilFilterSpec, mileageKm?: number): string | null {
  if (mileageKm == null || mileageKm <= 0) return null;
  const interval = spec.oilIntervalKm || 10000;
  const cycles = Math.floor(mileageKm / interval);
  const nextAt = (cycles + 1) * interval;
  const remaining = nextAt - mileageKm;
  if (remaining <= 500) {
    return `⚠️ المسافة الحالية ${mileageKm.toLocaleString()} كم — حان موعد تغيير الزيت تقريباً (كل ${interval.toLocaleString()} كم). التالي المقترح: ${nextAt.toLocaleString()} كم.`;
  }
  if (remaining <= 1500) {
    return `قرب موعد الصيانة: متبقي حوالي ${remaining.toLocaleString()} كم حتى ${nextAt.toLocaleString()} كم (فترة ${interval.toLocaleString()} كم).`;
  }
  return `المسافة ${mileageKm.toLocaleString()} كم — الموعد التقريبي التالي للزيت: عند ${nextAt.toLocaleString()} كم (متبقي ${remaining.toLocaleString()} كم).`;
}

export function specToMaintenanceFields(spec: OilFilterSpec, mileageKm?: number) {
  const advice = mileageAdvice(spec, mileageKm);
  return {
    brand: spec.brand,
    model: spec.model,
    oilType: `${spec.oilViscosity} ${spec.oilType} (${spec.oilSpec})`,
    oilCapacity: spec.oilCapacityL,
    oilChangeIntervalKm: spec.oilIntervalKm,
    oilChangeIntervalMonths: spec.oilIntervalMonths,
    oilFilterType: spec.oilFilter,
    airFilterType: spec.airFilter,
    fuelFilterType: spec.fuelFilter,
    cabinFilterType: spec.cabinFilter,
    currentMileage: mileageKm && mileageKm > 0 ? mileageKm : undefined,
    notes: [
      spec.engine ? `المحرك: ${spec.engine}` : '',
      spec.years ? `السنوات: ${spec.years}` : '',
      spec.notes || '',
      advice || '',
      '⚠️ تحقق من الرقم عند التركيب',
    ]
      .filter(Boolean)
      .join(' · '),
  };
}

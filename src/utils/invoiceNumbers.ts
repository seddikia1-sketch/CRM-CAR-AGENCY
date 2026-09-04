/** أرقام فواتير متسلسلة سنوياً: INV-2026-0001 */

const SEQ_KEY = 'crm_invoice_seq';

type SeqState = {
  year: number;
  next: number;
};

function load(): SeqState {
  const year = new Date().getFullYear();
  try {
    const raw = localStorage.getItem(SEQ_KEY);
    if (!raw) return { year, next: 1 };
    const parsed = JSON.parse(raw) as SeqState;
    if (parsed.year !== year) return { year, next: 1 };
    return { year, next: Math.max(1, Number(parsed.next) || 1) };
  } catch {
    return { year, next: 1 };
  }
}

function save(state: SeqState): void {
  localStorage.setItem(SEQ_KEY, JSON.stringify(state));
}

/** يصدر الرقم التالي ويحفظ التسلسل */
export function nextInvoiceNumber(prefix = 'INV'): string {
  const state = load();
  const num = state.next;
  save({ year: state.year, next: num + 1 });
  return `${prefix}-${state.year}-${String(num).padStart(4, '0')}`;
}

/** رقم قطع الغيار: PART-2026-0001 */
export function nextPartInvoiceNumber(): string {
  return nextInvoiceNumber('PART');
}

/** للاطلاع فقط بدون زيادة العداد */
export function peekInvoiceNumber(prefix = 'INV'): string {
  const state = load();
  return `${prefix}-${state.year}-${String(state.next).padStart(4, '0')}`;
}

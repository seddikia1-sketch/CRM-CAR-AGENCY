import type { Vehicle, SparePart } from '../types';
import { getOfficeSettings } from '../services/officeSettings';
import { nextInvoiceNumber, nextPartInvoiceNumber } from './invoiceNumbers';

function esc(s: string): string {
  return String(s || '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

function money(n: number): string {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function fmtDate(iso?: string): string {
  if (!iso) return new Date().toLocaleDateString('ar-DZ');
  return new Date(iso).toLocaleDateString('ar-DZ');
}

function openPrintWindow(html: string, title: string): void {
  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) {
    alert('اسمح بالنوافذ المنبثقة لطباعة الفاتورة');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.document.title = title;
}

const PRINT_CSS = `
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      margin: 0; padding: 24px; color: #111; background: #fff;
      direction: rtl;
    }
    .sheet { max-width: 720px; margin: 0 auto; }
    .header {
      display: flex; justify-content: space-between; align-items: flex-start;
      border-bottom: 3px solid #1a1a2e; padding-bottom: 16px; margin-bottom: 20px;
    }
    .office-name { font-size: 1.35rem; font-weight: 800; margin: 0 0 6px; }
    .meta { font-size: 0.9rem; color: #444; line-height: 1.7; }
    .title {
      text-align: center; font-size: 1.25rem; font-weight: 800;
      margin: 0 0 18px; letter-spacing: 0.02em;
    }
    .badge {
      display: inline-block; background: #1a1a2e; color: #fff;
      padding: 4px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 700;
    }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 18px; }
    th, td {
      border: 1px solid #ddd; padding: 10px 12px; text-align: right; font-size: 0.95rem;
    }
    th { background: #f4f4f8; font-weight: 700; width: 38%; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .box {
      border: 1px solid #ddd; border-radius: 10px; padding: 12px 14px; background: #fafafa;
    }
    .box h3 { margin: 0 0 8px; font-size: 0.95rem; }
    .total {
      margin-top: 8px; padding: 14px 16px; border-radius: 10px;
      background: #f0fdf4; border: 1px solid #86efac;
      display: flex; justify-content: space-between; align-items: center;
    }
    .total strong { font-size: 1.35rem; color: #166534; }
    .note { font-size: 0.8rem; color: #666; margin-top: 18px; line-height: 1.6; }
    .signatures {
      display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 48px;
    }
    .sig {
      border-top: 1px solid #999; padding-top: 8px; text-align: center; font-size: 0.9rem;
    }
    .actions { margin-bottom: 16px; text-align: center; }
    .actions button {
      padding: 10px 20px; margin: 0 6px; border-radius: 8px; border: none;
      font-weight: 700; cursor: pointer; font-size: 0.95rem;
    }
    .print-btn { background: #1a1a2e; color: #fff; }
    .close-btn { background: #e5e7eb; color: #111; }
    @media print {
      .actions { display: none !important; }
      body { padding: 8px; }
    }
`;

export type SaleInvoiceData = {
  vehicle: Vehicle;
  clientName: string;
  clientPhone?: string;
  finalPrice: number;
  soldAt?: string;
  invoiceNumber?: string;
};

/** يفتح نافذة طباعة بفاتورة بيع سيارة */
export function printVehicleSaleInvoice(data: SaleInvoiceData): string {
  const office = getOfficeSettings();
  const v = data.vehicle;
  const invNo = data.invoiceNumber || nextInvoiceNumber('INV');

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>فاتورة بيع — ${esc(v.brand)} ${esc(v.model)}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  <div class="actions">
    <button class="print-btn" onclick="window.print()">طباعة</button>
    <button class="close-btn" onclick="window.close()">إغلاق</button>
  </div>
  <div class="sheet">
    <div class="header">
      <div>
        <p class="office-name">${esc(office.officeName)}</p>
        <div class="meta">
          ${esc(office.city)}<br/>
          هاتف: ${esc(office.phone)} · واتساب: ${esc(office.whatsapp)}
        </div>
      </div>
      <div>
        <span class="badge">فاتورة بيع سيارة</span>
        <div class="meta" style="margin-top:8px;">
          رقم: <strong>${esc(invNo)}</strong><br/>
          التاريخ: ${esc(fmtDate(data.soldAt))}
        </div>
      </div>
    </div>

    <p class="title">وصل بيع سيارة</p>

    <div class="row-2">
      <div class="box">
        <h3>بيانات المشتري</h3>
        <div><strong>${esc(data.clientName)}</strong></div>
        ${data.clientPhone ? `<div>الهاتف: ${esc(data.clientPhone)}</div>` : ''}
      </div>
      <div class="box">
        <h3>بيانات البائع</h3>
        <div><strong>${esc(office.officeName)}</strong></div>
        <div>${esc(office.city)}</div>
      </div>
    </div>

    <table>
      <tr><th>الماركة / الموديل</th><td>${esc(v.brand)} ${esc(v.model)}</td></tr>
      <tr><th>السنة</th><td>${v.year || '-'}</td></tr>
      <tr><th>اللون</th><td>${esc(v.color) || '-'}</td></tr>
      <tr><th>رقم الهيكل (VIN)</th><td style="direction:ltr; text-align:left;">${esc(v.vin) || '-'}</td></tr>
      <tr><th>الكيلومترات</th><td>${v.mileage ? v.mileage.toLocaleString('ar-DZ') + ' كم' : '-'}</td></tr>
      <tr><th>الحالة</th><td>${v.condition === 'new' ? 'جديدة' : 'أقل من 3 سنوات'}</td></tr>
    </table>

    <div class="total">
      <span>المبلغ المتفق عليه</span>
      <strong>${money(data.finalPrice)}</strong>
    </div>

    <p class="note">
      ${esc(office.note || '')}<br/>
      تم الاتفاق على البيع بالسعر المذكور أعلاه. هذه الوثيقة للتوثيق بين الطرفين.
    </p>

    <div class="signatures">
      <div class="sig">توقيع البائع</div>
      <div class="sig">توقيع المشتري</div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`;

  openPrintWindow(html, `فاتورة ${invNo}`);
  return invNo;
}

export type PartSaleInvoiceData = {
  part: Pick<SparePart, 'name' | 'partNumber' | 'brand'>;
  quantity: number;
  unitPrice: number;
  clientName?: string;
  clientPhone?: string;
  vehicleLabel?: string;
  vehicleVin?: string;
  notes?: string;
  soldAt?: string;
  invoiceNumber?: string;
};

/** فاتورة بيع قطعة غيار / خدمة ما بعد البيع */
export function printPartSaleInvoice(data: PartSaleInvoiceData): string {
  const office = getOfficeSettings();
  const total = data.quantity * data.unitPrice;
  const invNo = data.invoiceNumber || nextPartInvoiceNumber();

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>فاتورة قطع — ${esc(data.part.name)}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  <div class="actions">
    <button class="print-btn" onclick="window.print()">طباعة</button>
    <button class="close-btn" onclick="window.close()">إغلاق</button>
  </div>
  <div class="sheet">
    <div class="header">
      <div>
        <p class="office-name">${esc(office.officeName)}</p>
        <div class="meta">
          ${esc(office.city)}<br/>
          هاتف: ${esc(office.phone)} · واتساب: ${esc(office.whatsapp)}
        </div>
      </div>
      <div>
        <span class="badge">فاتورة قطع غيار</span>
        <div class="meta" style="margin-top:8px;">
          رقم: <strong>${esc(invNo)}</strong><br/>
          التاريخ: ${esc(fmtDate(data.soldAt))}
        </div>
      </div>
    </div>

    <p class="title">وصل بيع قطع / خدمة</p>

    <div class="row-2">
      <div class="box">
        <h3>العميل</h3>
        <div><strong>${esc(data.clientName || 'زبون نقدي')}</strong></div>
        ${data.clientPhone ? `<div>الهاتف: ${esc(data.clientPhone)}</div>` : ''}
      </div>
      <div class="box">
        <h3>السيارة (إن وُجدت)</h3>
        <div>${esc(data.vehicleLabel || '—')}</div>
        ${data.vehicleVin ? `<div style="direction:ltr; text-align:left;">VIN: ${esc(data.vehicleVin)}</div>` : ''}
      </div>
    </div>

    <table>
      <tr><th>القطعة</th><td>${esc(data.part.name)}</td></tr>
      <tr><th>رقم القطعة</th><td>${esc(data.part.partNumber) || '—'}</td></tr>
      <tr><th>الماركة</th><td>${esc(data.part.brand) || '—'}</td></tr>
      <tr><th>الكمية</th><td>${data.quantity}</td></tr>
      <tr><th>سعر الوحدة</th><td>${money(data.unitPrice)}</td></tr>
      ${data.notes ? `<tr><th>ملاحظات</th><td>${esc(data.notes)}</td></tr>` : ''}
    </table>

    <div class="total">
      <span>الإجمالي</span>
      <strong>${money(total)}</strong>
    </div>

    <p class="note">
      ${esc(office.note || '')}<br/>
      شكراً لتعاملكم معنا.
    </p>

    <div class="signatures">
      <div class="sig">توقيع المكتب</div>
      <div class="sig">توقيع الزبون</div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`;

  openPrintWindow(html, `فاتورة ${invNo}`);
  return invNo;
}

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
    alert('اسمح بالنوافذ المنبثقة لطباعة المستند');
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
    th { background: #f4f4f8; font-weight: 700; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .box {
      border: 1px solid #ddd; border-radius: 10px; padding: 12px 14px; background: #fafafa;
    }
    .box h3 { margin: 0 0 8px; font-size: 0.95rem; }
    .total {
      margin-top: 8px; padding: 14px 16px; border-radius: 10px;
      background: #f0f4ff; border: 1px solid #c7d2fe; font-size: 1.05rem;
    }
    .footer-note { margin-top: 28px; font-size: 0.8rem; color: #666; text-align: center; }
    .clause { margin: 0 0 10px; line-height: 1.75; font-size: 0.92rem; text-align: justify; }
    .sign-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 28px; }
    .sign-box { border: 1px solid #ccc; border-radius: 10px; min-height: 120px; padding: 12px; }
    .sign-box h4 { margin: 0 0 10px; font-size: 0.95rem; }
    .muted { color: #666; font-size: 0.8rem; margin-top: 24px; text-align: center; }
    @media print {
      body { padding: 12px; }
      .no-print { display: none !important; }
    }
`;

export interface SaleInvoiceData {
  vehicle: Vehicle;
  clientName: string;
  clientPhone?: string;
  finalPrice: number;
  deposit?: number;
  soldAt?: string;
  invoiceNumber?: string;
}

export function printVehicleSaleInvoice(data: SaleInvoiceData): string {
  const office = getOfficeSettings();
  const v = data.vehicle;
  const inv = data.invoiceNumber || nextInvoiceNumber('INV');
  const dep = data.deposit || 0;
  const rem = Math.max((data.finalPrice || 0) - dep, 0);
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8" /><title>فاتورة ${esc(inv)}</title>
<style>${PRINT_CSS}</style></head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <p class="office-name">${esc(office.officeName)}</p>
        <div class="meta">${esc(office.city || '')}<br/>هاتف: ${esc(office.phone || '')} · واتساب: ${esc(office.whatsapp || '')}</div>
      </div>
      <div style="text-align:left">
        <span class="badge">فاتورة بيع</span>
        <div class="meta" style="margin-top:8px">رقم: <strong>${esc(inv)}</strong><br/>التاريخ: ${fmtDate(data.soldAt)}</div>
      </div>
    </div>
    <h1 class="title">فاتورة بيع سيارة</h1>
    <div class="row-2">
      <div class="box"><h3>البائع</h3><div>${esc(office.officeName)}</div></div>
      <div class="box"><h3>المشتري</h3><div>${esc(data.clientName)}</div>
        <div class="meta">هاتف: ${esc(data.clientPhone || '—')}</div></div>
    </div>
    <table>
      <tr><th>السيارة</th><td>${esc(v.brand)} ${esc(v.model)} — ${v.year || ''}</td></tr>
      <tr><th>اللون</th><td>${esc(v.color || '—')}</td></tr>
      <tr><th>VIN</th><td dir="ltr" style="text-align:left">${esc(v.vin || '—')}</td></tr>
      <tr><th>المسافة</th><td>${v.mileage ? v.mileage.toLocaleString('ar-DZ') + ' كم' : '—'}</td></tr>
    </table>
    <div class="total">
      المبلغ: <strong>${money(data.finalPrice)}</strong><br/>
      عربون: ${money(dep)} · المتبقي: ${money(rem)}
    </div>
    <p class="footer-note">شكراً لتعاملكم معنا · ${esc(office.note || '')}</p>
    <p class="no-print" style="text-align:center;margin-top:16px">
      <button onclick="window.print()">طباعة</button>
    </p>
  </div>
  <script>setTimeout(function(){ window.print(); }, 350);</script>
</body></html>`;
  openPrintWindow(html, `فاتورة ${inv}`);
  return inv;
}

export interface PartSaleInvoiceData {
  part: SparePart;
  qty: number;
  unitPrice: number;
  clientName?: string;
  invoiceNumber?: string;
  soldAt?: string;
}

export function printPartSaleInvoice(data: PartSaleInvoiceData): string {
  const office = getOfficeSettings();
  const inv = data.invoiceNumber || nextPartInvoiceNumber();
  const total = (data.qty || 0) * (data.unitPrice || 0);
  const p = data.part;
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8" /><title>فاتورة قطع ${esc(inv)}</title>
<style>${PRINT_CSS}</style></head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <p class="office-name">${esc(office.officeName)}</p>
        <div class="meta">${esc(office.city || '')}<br/>${esc(office.phone || '')}</div>
      </div>
      <div style="text-align:left">
        <span class="badge">فاتورة قطع</span>
        <div class="meta" style="margin-top:8px">${esc(inv)}<br/>${fmtDate(data.soldAt)}</div>
      </div>
    </div>
    <h1 class="title">فاتورة بيع قطع غيار</h1>
    <div class="row-2">
      <div class="box"><h3>العميل</h3><div>${esc(data.clientName || 'زائر')}</div></div>
      <div class="box"><h3>المكتب</h3><div>${esc(office.officeName)}</div>
        <div class="meta">${esc(office.phone || '')}</div></div>
    </div>
    <table>
      <tr><th>البيان</th><th>الكمية</th><th>سعر الوحدة</th><th>المجموع</th></tr>
      <tr>
        <td>${esc(p.name)}${p.partNumber ? ' · ' + esc(p.partNumber) : ''}${p.brand ? ' · ' + esc(p.brand) : ''}</td>
        <td>${data.qty}</td>
        <td>${money(data.unitPrice)}</td>
        <td><strong>${money(total)}</strong></td>
      </tr>
    </table>
    <div class="total">الإجمالي المستحق: <strong>${money(total)}</strong></div>
    <p class="footer-note">شكراً لتعاملكم · ${esc(office.note || '')}</p>
    <p class="no-print" style="text-align:center;margin-top:16px"><button onclick="window.print()">طباعة</button></p>
  </div>
  <script>setTimeout(function(){ window.print(); }, 350);</script>
</body></html>`;
  openPrintWindow(html, `فاتورة ${inv}`);
  return inv;
}

export interface SalesContractData {
  vehicle: Vehicle;
  clientName: string;
  clientPhone?: string;
  clientIdNumber?: string;
  clientAddress?: string;
  finalPrice: number;
  deposit?: number;
  soldAt?: string;
  contractNumber?: string;
  notes?: string;
}

export function printSalesContract(data: SalesContractData): void {
  const office = getOfficeSettings();
  const v = data.vehicle;
  const year = data.soldAt ? new Date(data.soldAt).getFullYear() : new Date().getFullYear();
  const contractNo = data.contractNumber || `CT-${year}-${String(Date.now()).slice(-6)}`;
  const price = data.finalPrice || 0;
  const deposit = data.deposit || 0;
  const remaining = Math.max(price - deposit, 0);
  const condLabel = v.condition === 'new' ? 'جديدة' : 'أقل من 3 سنوات';

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>عقد بيع ${esc(contractNo)}</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <p class="office-name">${esc(office.officeName)}</p>
        <div class="meta">${esc(office.city || '')}<br/>هاتف: ${esc(office.phone || '')} · واتساب: ${esc(office.whatsapp || '')}</div>
      </div>
      <div style="text-align:left">
        <span class="badge">عقد بيع</span>
        <div class="meta" style="margin-top:8px">رقم العقد: <strong>${esc(contractNo)}</strong><br/>التاريخ: ${fmtDate(data.soldAt)}</div>
      </div>
    </div>
    <h1 class="title">عقد بيع سيارة</h1>
    <p class="clause">تم الاتفاق بين الطرفين على بيع السيارة المبينة أدناه.</p>
    <div class="row-2">
      <div class="box"><h3>البائع</h3><div>${esc(office.officeName)}</div><div class="meta">${esc(office.phone)}</div></div>
      <div class="box"><h3>المشتري</h3><div>${esc(data.clientName)}</div>
        <div class="meta">هاتف: ${esc(data.clientPhone || '—')}<br/>رقم التعريف: ${esc(data.clientIdNumber || '....................')}<br/>العنوان: ${esc(data.clientAddress || '................................')}</div>
      </div>
    </div>
    <table>
      <tr><th>الماركة / الموديل</th><td>${esc(v.brand)} ${esc(v.model)}</td></tr>
      <tr><th>السنة</th><td>${v.year || '—'}</td></tr>
      <tr><th>اللون</th><td>${esc(v.color || '—')}</td></tr>
      <tr><th>VIN</th><td dir="ltr" style="text-align:left">${esc(v.vin || '—')}</td></tr>
      <tr><th>المسافة</th><td>${v.mileage ? v.mileage.toLocaleString('ar-DZ') + ' كم' : '—'}</td></tr>
      <tr><th>الحالة</th><td>${esc(condLabel)}</td></tr>
    </table>
    <div class="total">ثمن البيع: <strong>${money(price)}</strong><br/>عربون: ${money(deposit)} · المتبقي: ${money(remaining)}</div>
    <p class="clause">1) يصرّح البائع بخلو السيارة من رهن أو حجز معلوم.</p>
    <p class="clause">2) يلتزم البائع بالتسليم والوثائق المتوفرة.</p>
    <p class="clause">3) يقرّ المشتري بالمعاينة أو قبول الأوصاف.</p>
    <p class="clause">4) استكمال نقل الملكية بعد استيفاء الثمن ما لم يُتفق خلاف ذلك.</p>
    <p class="clause">5) يُحرّر العقد من نسختين.</p>
    <div class="sign-row">
      <div class="sign-box"><h4>توقيع البائع</h4></div>
      <div class="sign-box"><h4>توقيع المشتري</h4><div class="meta">${esc(data.clientName)}</div></div>
    </div>
    <p class="muted">نموذج استرشادي — يُراجع مع مستشار قانوني عند الحاجة.</p>
    <p class="no-print" style="text-align:center;margin-top:20px"><button onclick="window.print()">طباعة العقد</button></p>
  </div>
  <script>setTimeout(function(){ window.print(); }, 400);</script>
</body>
</html>`;
  openPrintWindow(html, `عقد بيع ${contractNo}`);
}

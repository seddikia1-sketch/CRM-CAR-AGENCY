import type { PurchaseOrder, SupplierProfile } from '../types';
import { PURCHASE_KIND_LABELS, PURCHASE_STATUS_LABELS } from '../types';
import { getOfficeSettings } from '../services/officeSettings';

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
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-DZ');
}

/** طباعة أمر شراء للمورد (صين / داخلي) */
export function printPurchaseOrder(order: PurchaseOrder, supplier?: SupplierProfile | null): void {
  const office = getOfficeSettings();
  const supName = supplier?.name || order.supplierName || 'مورد الصين';
  const supContact = [
    supplier?.contactName,
    supplier?.phone ? `هاتف: ${supplier.phone}` : '',
    supplier?.whatsapp ? `واتساب: ${supplier.whatsapp}` : '',
    supplier?.email || '',
  ].filter(Boolean).join(' · ');

  const rows = order.items.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${esc(PURCHASE_KIND_LABELS[item.kind] || item.kind)}</td>
      <td>${esc(item.name)}</td>
      <td>${esc(item.reference || '—')}</td>
      <td>${esc(item.brand || '—')}</td>
      <td>${item.quantity}</td>
      <td>${money(item.unitCost)}</td>
      <td>${money(item.quantity * item.unitCost)}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>أمر شراء — ${esc(order.orderNumber)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      margin: 0; padding: 24px; color: #111; background: #fff;
      direction: rtl;
    }
    .sheet { max-width: 900px; margin: 0 auto; }
    .header {
      display: flex; justify-content: space-between; align-items: flex-start;
      border-bottom: 3px solid #1a1a2e; padding-bottom: 16px; margin-bottom: 20px;
    }
    .office-name { font-size: 1.35rem; font-weight: 800; margin: 0 0 6px; }
    .meta { font-size: 0.9rem; color: #444; line-height: 1.7; }
    .title {
      text-align: center; font-size: 1.3rem; font-weight: 800;
      margin: 0 0 18px;
    }
    .badge {
      display: inline-block; background: #1a1a2e; color: #fff;
      padding: 4px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 700;
    }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .box {
      border: 1px solid #ddd; border-radius: 10px; padding: 12px 14px; background: #fafafa;
    }
    .box h3 { margin: 0 0 8px; font-size: 0.95rem; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 18px; font-size: 0.9rem; }
    th, td {
      border: 1px solid #ddd; padding: 8px 10px; text-align: right;
    }
    th { background: #f4f4f8; font-weight: 700; }
    .total {
      margin-top: 8px; padding: 14px 16px; border-radius: 10px;
      background: #eff6ff; border: 1px solid #93c5fd;
      display: flex; justify-content: space-between; align-items: center;
    }
    .total strong { font-size: 1.25rem; color: #1e40af; }
    .note { font-size: 0.85rem; color: #555; margin-top: 16px; line-height: 1.6; }
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
  </style>
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
        <span class="badge">أمر شراء</span>
        <div class="meta" style="margin-top:8px;">
          رقم: <strong>${esc(order.orderNumber)}</strong><br/>
          التاريخ: ${esc(fmtDate(order.orderDate))}<br/>
          الحالة: ${esc(PURCHASE_STATUS_LABELS[order.status] || order.status)}
        </div>
      </div>
    </div>

    <p class="title">طلب شراء — مورد الصين</p>

    <div class="row-2">
      <div class="box">
        <h3>المكتب (المشتري)</h3>
        <div><strong>${esc(office.officeName)}</strong></div>
        <div>${esc(office.city)}</div>
        <div>هاتف: ${esc(office.phone)}</div>
      </div>
      <div class="box">
        <h3>المورد</h3>
        <div><strong>${esc(supName)}</strong></div>
        ${supContact ? `<div>${esc(supContact)}</div>` : ''}
        ${order.containerNumber ? `<div>حاوية/شحنة: ${esc(order.containerNumber)}</div>` : ''}
        ${order.expectedArrival ? `<div>وصول متوقع: ${esc(fmtDate(order.expectedArrival))}</div>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>النوع</th>
          <th>الصنف</th>
          <th>مرجع / VIN</th>
          <th>الماركة</th>
          <th>الكمية</th>
          <th>تكلفة الوحدة</th>
          <th>الإجمالي</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="total">
      <span>إجمالي أمر الشراء</span>
      <strong>${money(order.totalCost)}</strong>
    </div>

    ${order.shippingNotes ? `<p class="note"><strong>ملاحظات الشحن:</strong> ${esc(order.shippingNotes)}</p>` : ''}
    ${order.notes ? `<p class="note"><strong>ملاحظات:</strong> ${esc(order.notes)}</p>` : ''}

    <p class="note" style="margin-top:28px;">
      وثيقة داخلية لإرسال الطلب للمورد أو الأرشفة. الأسعار بالدينار الجزائري للتقدير المحلي.
    </p>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
  </script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=960,height=900');
  if (!w) {
    alert('اسمح بالنوافذ المنبثقة لطباعة أمر الشراء');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

// ========================================
// CRM — Formatters & Utilities (الجزائر)
// ========================================

/** استخراج الأرقام فقط */
export function digitsOnly(phone: string): string {
  return (phone || '').replace(/\D/g, '');
}

/**
 * تطبيع رقم جزائري لصيغة دولية بدون + : 213XXXXXXXXX
 * يقبل: 05xxxxxxxx / 6xxxxxxxx / 2135xxxxxxxx / +213...
 */
export function toAlgeriaWhatsAppNumber(phone: string): string {
  let d = digitsOnly(phone);

  // إزالة أصفار بادئة زائدة بعد مفتاح الدولة بالخطأ
  if (d.startsWith('2130')) {
    d = '213' + d.slice(4);
  }

  if (d.startsWith('213') && d.length >= 12) {
    return d.slice(0, 13); // 213 + 9 أرقام
  }

  // رقم محلي يبدأ بـ 0 (10 أرقام)
  if (d.startsWith('0') && d.length === 10) {
    return '213' + d.slice(1);
  }

  // بدون صفر: 9 أرقام (5/6/7...)
  if (d.length === 9 && /^[567]/.test(d)) {
    return '213' + d;
  }

  // 10 أرقام بدون صفر أحياناً بالخطأ
  if (d.length === 10 && /^[567]/.test(d)) {
    return '213' + d.slice(0, 9);
  }

  // إن بدأ بـ 213 بالفعل
  if (d.startsWith('213')) {
    return d;
  }

  // افتراضي: أضف 213
  if (d.startsWith('0')) {
    return '213' + d.slice(1);
  }
  return '213' + d;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** عرض الرقم من اليسار لليمين بدون قلب في الواجهة العربية */
export function formatPhone(phone: string): string {
  const digits = digitsOnly(phone);
  let local = digits;

  if (digits.startsWith('213') && digits.length >= 12) {
    local = '0' + digits.slice(3);
  }

  if (local.length === 10 && local.startsWith('0')) {
    return `${local.slice(0, 4)} ${local.slice(4, 6)} ${local.slice(6, 8)} ${local.slice(8)}`;
  }
  if (local.length === 9) {
    return `0${local.slice(0, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
  }
  return phone || '-';
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ar-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ar-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
  return formatDate(dateStr);
}

/** رابط واتساب صالح للأرقام الجزائرية */
export function getWhatsAppLink(phone: string, message?: string): string {
  const fullNumber = toAlgeriaWhatsAppNumber(phone);
  const base = `https://wa.me/${fullNumber}`;
  if (message && message.trim()) {
    return `${base}?text=${encodeURIComponent(message.trim())}`;
  }
  return base;
}

export function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / 86400000);
}

/**
 * قناع إدخال: يحفظ الأرقام فقط مع مسافات للعرض
 * لا يقلب الترتيب — الكتابة من اليسار دائماً مع dir=ltr في الحقل
 */
export function phoneMask(value: string): string {
  let digits = digitsOnly(value).slice(0, 13);

  // إذا لصق المستخدم +213 أو 213
  if (digits.startsWith('213')) {
    digits = '0' + digits.slice(3);
    digits = digits.slice(0, 10);
  } else {
    digits = digits.slice(0, 10);
  }

  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
}

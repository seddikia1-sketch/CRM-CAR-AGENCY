// ========================================
// CRM — Formatters & Utilities (الجزائر)
// ========================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 9) {
    return `0${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
  }
  return phone;
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

/** رابط واتساب — مع رسالة اختيارية */
export function getWhatsAppLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, '');
  let fullNumber = digits;
  if (digits.startsWith('0')) {
    fullNumber = '213' + digits.slice(1);
  } else if (!digits.startsWith('213')) {
    fullNumber = '213' + digits;
  }
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

export function phoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
}

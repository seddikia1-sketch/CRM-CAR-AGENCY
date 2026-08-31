// قوالب رسائل جاهزة لزبائن مكتب السيارات الصينية (الجزائر)

export interface MessageTemplate {
  id: string;
  title: string;
  category: 'welcome' | 'followup' | 'booking' | 'payment' | 'delivery' | 'service' | 'thanks';
  text: string;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'welcome',
    title: 'ترحيب بعميل جديد',
    category: 'welcome',
    text: 'السلام عليكم {name}،\nمرحباً بكم في مكتب استيراد السيارات الصينية.\nنحن في خدمتكم لأي استفسار عن السيارات المتوفرة أو طلب حجز.\nرقمنا دائماً متاح على واتساب.\nتحياتنا',
  },
  {
    id: 'followup_interest',
    title: 'متابعة اهتمام',
    category: 'followup',
    text: 'السلام عليكم {name}،\nنتواصل معكم بخصوص السيارة التي استفسرتم عنها.\nهل ما زلتم مهتمين؟ يمكننا ترتيب زيارة للمعرض أو تجربة قيادة.\nفي انتظار ردكم.',
  },
  {
    id: 'followup_quiet',
    title: 'متابعة بعد انقطاع',
    category: 'followup',
    text: 'السلام عليكم {name}،\nلم نسمع منكم منذ فترة.\nهل تحتاجون مساعدة إضافية أو معلومات عن موديلات جديدة وصلت؟\nنحن جاهزون لخدمتكم.',
  },
  {
    id: 'booking_confirm',
    title: 'تأكيد موعد',
    category: 'booking',
    text: 'السلام عليكم {name}،\nتم تأكيد موعدكم يوم {date} على الساعة {time}.\nننتظركم في المكتب.\nفي حال تأخر أو تغيير الموعد يرجى إبلاغنا مسبقاً.\nشكراً لكم.',
  },
  {
    id: 'test_drive',
    title: 'دعوة لتجربة قيادة',
    category: 'booking',
    text: 'السلام عليكم {name}،\nيمكنكم تجربة السيارة {car} عندنا في المعرض.\nحدّدوا معنا يوماً مناسباً وسنجهّز كل شيء.\nفي انتظاركم.',
  },
  {
    id: 'payment_deposit',
    title: 'تذكير بالعربون',
    category: 'payment',
    text: 'السلام عليكم {name}،\nتذكير ودي بخصوص العربون المتفق عليه بمبلغ {amount} دج.\nيمكن الدفع في المكتب أو بالتحويل.\nشكراً لثقتكم.',
  },
  {
    id: 'payment_reminder',
    title: 'تذكير بباقي المبلغ',
    category: 'payment',
    text: 'السلام عليكم {name}،\nباقي المبلغ المستحق هو {amount} دج.\nنرجو تسويته في أقرب وقت لإتمام إجراءات التسليم.\nنحن في الخدمة لأي توضيح.',
  },
  {
    id: 'delivery_ready',
    title: 'السيارة جاهزة للتسليم',
    category: 'delivery',
    text: 'السلام عليكم {name}،\nيسعدنا إبلاغكم أن السيارة {car} أصبحت جاهزة للتسليم.\nيرجى التنسيق معنا لموعد الاستلام وإحضار الوثائق اللازمة.\nمبروك مقدماً 🚗',
  },
  {
    id: 'service_due',
    title: 'تذكير بالصيانة',
    category: 'service',
    text: 'السلام عليكم {name}،\nحسب سجل الصيانة، اقترب موعد تغيير الزيت/الفلاتر لسيارتكم.\nاحجزوا موعداً مناسباً معنا لنحافظ على أداء السيارة.\nشكراً لثقتكم.',
  },
  {
    id: 'thanks_purchase',
    title: 'شكر بعد الشراء',
    category: 'thanks',
    text: 'السلام عليكم {name}،\nشكراً لثقتكم بشرائكم معنا.\nنتمنى لكم قيادة ممتعة وآمنة.\nنحن هنا لأي صيانة أو قطع غيار لاحقاً.\nمع أطيب التحيات.',
  },
];

export function fillTemplate(
  text: string,
  vars: { name?: string; date?: string; time?: string; car?: string; amount?: string }
): string {
  return text
    .replace(/\{name\}/g, vars.name || 'الأخ/الأخت')
    .replace(/\{date\}/g, vars.date || '...')
    .replace(/\{time\}/g, vars.time || '...')
    .replace(/\{car\}/g, vars.car || 'السيارة')
    .replace(/\{amount\}/g, vars.amount || '...')
    .replace(/\\n/g, '\n');
}

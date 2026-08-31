/** شعارات دعائية لإعلانات السيارات */

export const AD_SLOGANS = [
  'احصل عليها الآن',
  'سيارة أحلامك بانتظارك',
  'لا تفوّت الفرصة',
  'العرض لفترة محدودة',
  'جاهزة للتسليم',
  'اختيار الأذكياء',
  'فخر العائلة على الطريق',
  'ارتقِ بأسلوب تنقّلك',
  'جودة صينية… ثقة جزائرية',
  'احجزها قبل غيرك',
  'صفقة لا تُعوَّض',
  'من الصين إلى باب بيتك',
  'راحة، أناقة، وموثوقية',
  'ابدأ رحلتك اليوم',
  'سيارتك… قرارك الذكي',
];

export function pickSlogan(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AD_SLOGANS[hash % AD_SLOGANS.length];
}

export const AD_GRADIENTS = [
  'linear-gradient(135deg, #1a0533 0%, #4c1d95 45%, #0f172a 100%)',
  'linear-gradient(135deg, #0c4a6e 0%, #0369a1 40%, #0f172a 100%)',
  'linear-gradient(135deg, #14532d 0%, #15803d 40%, #0f172a 100%)',
  'linear-gradient(135deg, #7c2d12 0%, #c2410c 40%, #0f172a 100%)',
  'linear-gradient(135deg, #1e1b4b 0%, #6d28d9 45%, #0f172a 100%)',
  'linear-gradient(135deg, #164e63 0%, #0891b2 40%, #0f172a 100%)',
];

export function pickGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 17 + seed.charCodeAt(i)) >>> 0;
  }
  return AD_GRADIENTS[hash % AD_GRADIENTS.length];
}

/** إعدادات خدمة الذكاء الاصطناعي للتعرف على قطع الغيار */

export interface AiSettings {
  enabled: boolean;
  /** مفتاح API — يُحفظ محلياً في المتصفح فقط */
  apiKey: string;
  /** مثال: https://api.openai.com/v1 أو https://api.groq.com/openai/v1 */
  baseUrl: string;
  /** نموذج نصي: gpt-4o-mini · llama-3.3-70b-versatile · deepseek-chat */
  model: string;
  /** نموذج يدعم الصور إن وُجد (اختياري) */
  visionModel: string;
}

const KEY = 'crm_ai_settings';

export const DEFAULT_AI_SETTINGS: AiSettings = {
  enabled: false,
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  visionModel: 'gpt-4o-mini',
};

export function getAiSettings(): AiSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_AI_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    return { ...DEFAULT_AI_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_AI_SETTINGS };
  }
}

export function saveAiSettings(settings: AiSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function isAiConfigured(settings?: AiSettings): boolean {
  const s = settings || getAiSettings();
  return !!(s.enabled && s.apiKey.trim() && s.baseUrl.trim() && s.model.trim());
}

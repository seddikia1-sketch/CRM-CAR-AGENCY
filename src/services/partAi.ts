/**
 * خدمة AI للتعرف على قطع الغيار لأي سيارة (مخزون / مباعة / عميل خارجي)
 * تستخدم واجهة متوافقة مع OpenAI Chat Completions
 */

import { PurchaseItemKind } from '../types';
import type { PartSuggestion } from '../utils/partLookup';
import { getAiSettings, isAiConfigured, type AiSettings } from './aiSettings';

export interface AiPartIdentifyInput {
  vin?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  partQuery: string;
  /** data URL للصورة اختيارياً */
  imageDataUrl?: string | null;
  /** هل السيارة من المخزون/مباعة */
  vehicleContext?: string;
}

interface AiPartItem {
  name_ar: string;
  name_en?: string;
  oem_numbers: string[];
  aftermarket_numbers?: string[];
  brand?: string;
  category: 'filter' | 'oil' | 'spare_part' | 'vehicle';
  quantity_suggest?: number;
  notes_ar?: string;
  confidence?: number;
}

function mapKind(cat: string): typeof PurchaseItemKind[keyof typeof PurchaseItemKind] {
  if (cat === 'oil') return PurchaseItemKind.OIL;
  if (cat === 'filter') return PurchaseItemKind.FILTER;
  if (cat === 'vehicle') return PurchaseItemKind.VEHICLE;
  return PurchaseItemKind.SPARE_PART;
}

function stripDataUrl(dataUrl: string): { mime: string; b64: string } | null {
  const m = dataUrl.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
  if (!m) return null;
  return { mime: m[1], b64: m[2] };
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    /* fall through */
  }
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {
      /* */
    }
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      /* */
    }
  }
  return null;
}

function buildSystemPrompt(): string {
  return `أنت خبير قطع غيار سيارات محترف لمكتب استيراد في الجزائر يشتري من الصين.

مهمتك الوحيدة: تحديد القطعة المطلوبة لهذه السيارة المحددة فقط.

قواعد صارمة:
1. ركّز فقط على الماركة والموديل والسنة والـ VIN المعطاة.
2. لا تقترح أبداً قطعاً لسيارات أخرى أو ماركات مختلفة.
3. إذا كانت الصورة مرفقة، استخدمها لتحديد القطعة بدقة لهذه السيارة فقط.
4. أعطِ أرقام OEM حقيقية إن عرفتها، وإلا اكتب وصفاً دقيقاً للمورد الصيني.
5. لا تختلق معلومات.

أجب دائماً بصيغة JSON فقط:
{
  "vehicle_decoded": { "brand": "", "model": "", "year_range": "", "notes": "" },
  "parts": [
    {
      "name_ar": "اسم بالعربية",
      "name_en": "English name",
      "oem_numbers": ["OEM1"],
      "aftermarket_numbers": ["Mann ...", "Bosch ..."],
      "brand": "ماركة القطعة",
      "category": "filter|oil|spare_part",
      "quantity_suggest": 1,
      "notes_ar": "ملاحظات للمورد",
      "confidence": 0-100
    }
  ],
  "supplier_message_ar": "نص قصير جاهز لرسالة المورد"
}`;
}

function buildUserText(input: AiPartIdentifyInput): string {
  return [
    '=== طلب تحديد قطعة غيار ===',
    input.vin ? `VIN: ${input.vin}` : '',
    input.brand ? `الماركة: ${input.brand}` : '',
    input.model ? `الموديل: ${input.model}` : '',
    input.year ? `السنة: ${input.year}` : '',
    input.color ? `اللون: ${input.color}` : '',
    input.vehicleContext ? `سياق: ${input.vehicleContext}` : '',
    `القطعة المطلوبة: ${input.partQuery || '(انظر الصورة)'}`,
    '',
    'مهم: أعطِ نتائج لهذه السيارة فقط. لا تذكر سيارات أخرى.',
    'السوق: توريد من الصين لمكتب في الجزائر.',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function identifyPartsWithAi(
  input: AiPartIdentifyInput,
  settings?: AiSettings
): Promise<{ suggestions: PartSuggestion[]; rawMessage?: string; error?: string }> {
  const cfg = settings || getAiSettings();
  if (!isAiConfigured(cfg)) {
    return {
      suggestions: [],
      error: 'فعّل خدمة AI وأدخل مفتاح API من الإعدادات',
    };
  }

  const hasImage = !!(input.imageDataUrl && input.imageDataUrl.startsWith('data:image'));
  const model = hasImage && cfg.visionModel ? cfg.visionModel : cfg.model;
  const base = cfg.baseUrl.replace(/\/$/, '');

  const userContent: unknown[] = [{ type: 'text', text: buildUserText(input) }];
  if (hasImage && input.imageDataUrl) {
    const parsed = stripDataUrl(input.imageDataUrl);
    if (parsed) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${parsed.mime};base64,${parsed.b64.slice(0, 1_500_000)}`,
        },
      });
    }
  }

  const messages =
    hasImage
      ? [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: userContent },
        ]
      : [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserText(input) },
        ];

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.15,
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        suggestions: [],
        error: `خطأ AI (${res.status}): ${errText.slice(0, 180) || res.statusText}`,
      };
    }

    const data = await res.json();
    const content: string =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.message?.reasoning ||
      '';

    const parsed = extractJson(content) as {
      parts?: AiPartItem[];
      vehicle_decoded?: { brand?: string; model?: string; year_range?: string; notes?: string };
      supplier_message_ar?: string;
    } | null;

    if (!parsed?.parts || !Array.isArray(parsed.parts)) {
      return {
        suggestions: [],
        error: 'لم يُرجع النموذج بيانات قطع صالحة',
        rawMessage: content.slice(0, 400),
      };
    }

    const vehicleNote = parsed.vehicle_decoded
      ? `${parsed.vehicle_decoded.brand || ''} ${parsed.vehicle_decoded.model || ''} ${parsed.vehicle_decoded.year_range || ''}`.trim()
      : '';

    const suggestions: PartSuggestion[] = parsed.parts.map((p, idx) => {
      const refs = [...(p.oem_numbers || []), ...(p.aftermarket_numbers || [])].filter(Boolean);
      const conf = typeof p.confidence === 'number' ? Math.min(100, Math.max(0, p.confidence)) : 75;
      return {
        id: `ai-${idx}-${Date.now()}`,
        name: p.name_ar || p.name_en || 'قطعة',
        reference: refs[0] || '',
        brand: p.brand || input.brand || '',
        model: vehicleNote || input.model || '',
        kind: mapKind(p.category || 'spare_part'),
        unitCost: 0,
        notes: [
          p.notes_ar || '',
          refs.length > 1 ? `بدائل: ${refs.slice(1).join(' · ')}` : '',
          input.vin ? `VIN: ${input.vin}` : '',
          parsed.vehicle_decoded?.notes || '',
        ]
          .filter(Boolean)
          .join(' · '),
        source: 'ai' as PartSuggestion['source'],
        confidence: conf,
        matchReason: 'تعرّف بالذكاء الاصطناعي',
      };
    });

    return {
      suggestions,
      rawMessage: parsed.supplier_message_ar,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'فشل الاتصال بخدمة AI';
    return { suggestions: [], error: msg };
  }
}

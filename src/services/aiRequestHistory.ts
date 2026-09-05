/**
 * سجل طلبات التعرف على القطع بالـ AI
 * يُحفظ في localStorage
 */

export interface AiRequestLog {
  id: string;
  createdAt: string;
  vin?: string;
  brand?: string;
  model?: string;
  year?: number;
  partQuery: string;
  hasPhoto: boolean;
  suggestionsCount: number;
  topSuggestions: string[];
  error?: string;
}

const KEY = 'crm_ai_request_history';
const MAX_LOGS = 50;

export function getAiRequestHistory(): AiRequestLog[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addAiRequestLog(entry: Omit<AiRequestLog, 'id' | 'createdAt'>): void {
  const logs = getAiRequestHistory();
  const newLog: AiRequestLog = {
    ...entry,
    id: `ai-log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newLog, ...logs].slice(0, MAX_LOGS);
  try {
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // ignore quota errors
  }
}

export function clearAiRequestHistory(): void {
  localStorage.removeItem(KEY);
}

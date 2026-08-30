// ========================================
// CRM — Storage Abstraction Layer
// ========================================

const STORAGE_KEYS = {
  CLIENTS: 'crm_clients',
  ACTIVITIES: 'crm_activities',
  SETTINGS: 'crm_settings',
  INVENTORY: 'crm_inventory',
} as const;

export const storage = {
  get<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },

  exportData(): string {
    const data: Record<string, unknown> = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const value = localStorage.getItem(key);
      if (value) data[name] = JSON.parse(value);
    });
    return JSON.stringify(data, null, 2);
  },

  importData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        if (data[name]) {
          localStorage.setItem(key, JSON.stringify(data[name]));
        }
      });
      return true;
    } catch {
      return false;
    }
  },
};

export { STORAGE_KEYS };

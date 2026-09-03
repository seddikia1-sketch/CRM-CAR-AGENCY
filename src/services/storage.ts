/**
 * Local Storage Service — مفاتيح تخزين CRM السيارات
 */

export const STORAGE_KEYS = {
  CLIENTS: 'crm_clients',
  INVENTORY: 'crm_inventory',
  ACTIVITIES: 'crm_activities',
  SETTINGS: 'crm_settings',
  SPARE_PARTS: 'crm_spare_parts',
  PART_SALES: 'crm_part_sales',
  SERVICE_PROFILES: 'crm_service_profiles',
  MAINTENANCE_RECORDS: 'crm_maintenance_records',
  BOOKINGS: 'crm_bookings',
  PAYMENTS: 'crm_payments',
  PURCHASES: 'crm_purchases',
  SUPPLIER: 'crm_supplier',
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

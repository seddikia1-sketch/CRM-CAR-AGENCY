import { useState, useCallback, useEffect } from 'react';
import { FunnelStage } from '../types';
import type { Client, ClientFormData, ActivityLog, DashboardStats, LeadSource } from '../types';
import { DEFAULT_FOLLOW_UP_DAYS, FUNNEL_STAGES } from '../utils/constants';
import { storage, STORAGE_KEYS } from '../services/storage';

function generateId() {
  return crypto.randomUUID();
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    try {
      const storedClients = storage.get<Client[]>(STORAGE_KEYS.CLIENTS) || [];
      const storedActivities = storage.get<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES) || [];
      setClients(storedClients);
      setActivities(storedActivities);
      setError(null);
    } catch (e) {
      setError('تعذر تحميل العملاء');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveClients = useCallback((list: Client[]) => {
    storage.set(STORAGE_KEYS.CLIENTS, list);
    setClients(list);
  }, []);

  const saveActivities = useCallback((list: ActivityLog[]) => {
    storage.set(STORAGE_KEYS.ACTIVITIES, list);
    setActivities(list);
  }, []);

  const addActivity = useCallback(
    (payload: {
      clientId: string;
      clientName: string;
      action: ActivityLog['action'];
      fromStage?: FunnelStage;
      toStage?: FunnelStage;
    }) => {
      const entry: ActivityLog = {
        id: generateId(),
        clientId: payload.clientId,
        clientName: payload.clientName,
        action: payload.action,
        fromStage: payload.fromStage,
        toStage: payload.toStage,
        timestamp: new Date().toISOString(),
      };
      const next = [entry, ...(storage.get<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES) || [])].slice(0, 200);
      saveActivities(next);
    },
    [saveActivities]
  );

  const addClient = useCallback(
    async (data: ClientFormData) => {
      if (!data.name?.trim() || !data.phone?.trim()) {
        setError('الاسم ورقم الهاتف مطلوبان');
        return null;
      }

      const now = new Date().toISOString();
      const id = generateId();

      const client: Client = {
        id,
        customerId: id,
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || '',
        vehicleInterest: data.vehicleInterest || '',
        brand: data.brand || '',
        model: data.model || '',
        year: data.year || new Date().getFullYear(),
        mileage: data.mileage || 0,
        condition: data.condition,
        shippingDate: data.shippingDate || '',
        containerNumber: data.containerNumber || '',
        customsStatus: data.customsStatus || '',
        importPrice: data.importPrice || 0,
        estimatedValue: data.estimatedValue || 0,
        funnelStage: data.funnelStage || FunnelStage.FIRST_CONTACT,
        source: data.source || ('whatsapp' as LeadSource),
        notes: data.notes || '',
        createdAt: now,
        updatedAt: now,
        lastContactAt: now,
      };

      const current = storage.get<Client[]>(STORAGE_KEYS.CLIENTS) || [];
      saveClients([client, ...current]);
      addActivity({
        clientId: id,
        clientName: client.name,
        action: 'created',
        toStage: client.funnelStage,
      });
      setError(null);
      return client;
    },
    [saveClients, addActivity]
  );

  const updateClient = useCallback(
    async (id: string, data: Partial<ClientFormData>) => {
      const current = storage.get<Client[]>(STORAGE_KEYS.CLIENTS) || [];
      const existing = current.find((c) => c.id === id);
      if (!existing) return null;

      const updated: Client = {
        ...existing,
        ...data,
        name: data.name !== undefined ? data.name.trim() : existing.name,
        phone: data.phone !== undefined ? data.phone.trim() : existing.phone,
        updatedAt: new Date().toISOString(),
        lastContactAt: new Date().toISOString(),
      };

      saveClients(current.map((c) => (c.id === id ? updated : c)));

      if (data.funnelStage && data.funnelStage !== existing.funnelStage) {
        addActivity({
          clientId: id,
          clientName: existing.name,
          action: 'moved',
          fromStage: existing.funnelStage,
          toStage: data.funnelStage,
        });
      } else {
        addActivity({
          clientId: id,
          clientName: existing.name,
          action: 'updated',
        });
      }

      return updated;
    },
    [saveClients, addActivity]
  );

  const deleteClient = useCallback(
    async (id: string) => {
      const current = storage.get<Client[]>(STORAGE_KEYS.CLIENTS) || [];
      const existing = current.find((c) => c.id === id);
      saveClients(current.filter((c) => c.id !== id));
      if (existing) {
        addActivity({
          clientId: id,
          clientName: existing.name,
          action: 'deleted',
        });
      }
      return true;
    },
    [saveClients, addActivity]
  );

  const moveToStage = useCallback(
    async (id: string, stage: FunnelStage) => {
      return updateClient(id, { funnelStage: stage });
    },
    [updateClient]
  );

  const updateLastContact = useCallback(
    async (id: string) => {
      const current = storage.get<Client[]>(STORAGE_KEYS.CLIENTS) || [];
      saveClients(
        current.map((c) =>
          c.id === id
            ? { ...c, lastContactAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            : c
        )
      );
    },
    [saveClients]
  );

  const getClientsByStage = useCallback((): Record<FunnelStage, Client[]> => {
    const grouped = {} as Record<FunnelStage, Client[]>;
    FUNNEL_STAGES.forEach((s) => {
      grouped[s.key] = [];
    });
    clients.forEach((c) => {
      if (grouped[c.funnelStage]) {
        grouped[c.funnelStage].push(c);
      } else {
        grouped[FunnelStage.FIRST_CONTACT].push(c);
      }
    });
    return grouped;
  }, [clients]);

  const getStats = useCallback((): DashboardStats => {
    const followUpDays = DEFAULT_FOLLOW_UP_DAYS;
    const activeStages = [
      FunnelStage.FIRST_CONTACT,
      FunnelStage.ANALYZING,
      FunnelStage.NEGOTIATION,
      FunnelStage.FINANCING,
    ] as FunnelStage[];
    const activeClients = clients.filter((c) => activeStages.includes(c.funnelStage));
    const closedClients = clients.filter((c) => c.funnelStage === FunnelStage.CLOSING);

    const clientsByStage = {} as Record<FunnelStage, number>;
    FUNNEL_STAGES.forEach((s) => {
      clientsByStage[s.key] = clients.filter((c) => c.funnelStage === s.key).length;
    });

    const clientsBySource = {} as Record<string, number>;
    clients.forEach((c) => {
      clientsBySource[c.source] = (clientsBySource[c.source] || 0) + 1;
    });

    const totalWithOutcome =
      closedClients.length + clients.filter((c) => c.funnelStage === FunnelStage.LOST).length;
    const conversionRate =
      totalWithOutcome > 0 ? (closedClients.length / totalWithOutcome) * 100 : 0;
    const totalNegotiationValue = activeClients.reduce((sum, c) => sum + (c.estimatedValue || 0), 0);

    return {
      totalClients: clients.length,
      activeClients: activeClients.length,
      conversionRate,
      totalNegotiationValue,
      clientsByStage,
      clientsBySource: clientsBySource as Record<string, number>,
      recentActivities: activities.slice(0, 15),
      followUpNeeded: activeClients.filter((c) => {
        const diff = new Date().getTime() - new Date(c.lastContactAt).getTime();
        return diff / (1000 * 3600 * 24) >= followUpDays;
      }),
    };
  }, [clients, activities]);

  const searchClients = useCallback(
    (query: string, stageFilter?: FunnelStage, sourceFilter?: string): Client[] => {
      let result = clients;
      if (query.trim()) {
        const q = query.toLowerCase();
        result = result.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            (c.vehicleInterest || '').toLowerCase().includes(q) ||
            (c.brand || '').toLowerCase().includes(q) ||
            (c.model || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q)
        );
      }
      if (stageFilter) result = result.filter((c) => c.funnelStage === stageFilter);
      if (sourceFilter) result = result.filter((c) => c.source === sourceFilter);
      return result;
    },
    [clients]
  );

  return {
    clients,
    activities,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    moveToStage,
    updateLastContact,
    getClientsByStage,
    getStats,
    searchClients,
    refresh: load,
  };
}

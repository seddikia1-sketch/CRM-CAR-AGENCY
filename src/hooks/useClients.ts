import { useState, useCallback, useEffect } from 'react';
import { FunnelStage, VehicleCondition } from '../types';
import type { Client, ClientFormData, ActivityLog, DashboardStats } from '../types';
import type { Database } from '../types/database.types';
import { useApp } from '../providers/AppProvider';
import { supabase } from '../lib/supabase';
import { DEFAULT_FOLLOW_UP_DAYS, FUNNEL_STAGES } from '../utils/constants';
import { useRealtime } from './useRealtime';
import { logger } from '../lib/logger';
import { clientFormSchema, activitySchema } from '../lib/validators';

type DealRow = Database['public']['Tables']['deals']['Row'] & {
  customers: Database['public']['Tables']['customers']['Row'] | null;
};
type ActivityRow = Database['public']['Tables']['activities']['Row'];

// مساعدة لتخزين الحقول الإضافية داخل الملاحظات مؤقتاً (حتى يتم تحديث قاعدة البيانات)
function encodeExtraFields(data: Partial<ClientFormData>): string {
  const extra = {
    brand: data.brand || '',
    model: data.model || '',
    year: data.year || 0,
    mileage: data.mileage || 0,
    condition: data.condition || VehicleCondition.NEW,
    shippingDate: data.shippingDate || '',
    containerNumber: data.containerNumber || '',
    customsStatus: data.customsStatus || '',
    importPrice: data.importPrice || 0,
  };
  return JSON.stringify(extra);
}

function decodeExtraFields(notes: string | null): Partial<Client> {
  try {
    if (!notes) return {};
    // إذا كانت الملاحظات تحتوي على JSON في البداية
    const match = notes.match(/^\{.*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        brand: parsed.brand || '',
        model: parsed.model || '',
        year: parsed.year || 0,
        mileage: parsed.mileage || 0,
        condition: parsed.condition || VehicleCondition.NEW,
        shippingDate: parsed.shippingDate || '',
        containerNumber: parsed.containerNumber || '',
        customsStatus: parsed.customsStatus || '',
        importPrice: parsed.importPrice || 0,
        notes: notes.replace(match[0], '').trim(),
      };
    }
  } catch {
    // تجاهل
  }
  return { notes: notes || '' };
}

export function useClients() {
  const { companyId } = useApp();
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    if (!companyId) return;

    try {
      const { data: deals, error } = await supabase
        .from('deals')
        .select('*, customers(*)')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (deals) {
        const mapped: Client[] = (deals as unknown as DealRow[]).map((d) => {
          const extra = decodeExtraFields(d.customers?.notes || null);
          return {
            id: d.id,
            customerId: d.customers?.id || '',
            name: d.customers?.name || 'بدون اسم',
            phone: d.customers?.phone || '',
            email: d.customers?.email || '',
            vehicleInterest: d.vehicle_interest || d.title || '',
            brand: extra.brand || '',
            model: extra.model || '',
            year: extra.year || 0,
            mileage: extra.mileage || 0,
            condition: extra.condition || VehicleCondition.NEW,
            shippingDate: extra.shippingDate || '',
            containerNumber: extra.containerNumber || '',
            customsStatus: extra.customsStatus || '',
            importPrice: extra.importPrice || 0,
            estimatedValue: d.estimated_value || 0,
            funnelStage: d.stage as FunnelStage,
            source: (d.customers?.source as import('../types').LeadSource) || 'other',
            notes: extra.notes || d.customers?.notes || '',
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            lastContactAt: d.updated_at,
          };
        });
        setClients(mapped);
      }
    } catch (err: unknown) {
      logger.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [companyId]);

  const fetchActivities = useCallback(async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      if (data) {
        const mapped: ActivityLog[] = (data as ActivityRow[]).map((a) => {
          const details = a.details as Record<string, any> | null;
          return {
            id: a.id,
            clientId: a.deal_id || a.customer_id || '',
            clientName: details?.clientName || 'عميل',
            action: a.action as any,
            fromStage: details?.fromStage,
            toStage: details?.toStage,
            timestamp: a.created_at,
          };
        });
        setActivities(mapped);
      }
    } catch (err: unknown) {
      logger.error('Error fetching activities:', err);
    }
  }, [companyId]);

  const refresh = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await Promise.all([fetchClients(), fetchActivities()]);
    } finally {
      setLoading(false);
    }
  }, [companyId, fetchClients, fetchActivities]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useRealtime('deals', refresh);
  useRealtime('customers', refresh);
  useRealtime('activities', fetchActivities);

  const addActivity = async (payload: { clientId: string, clientName: string, action: string, fromStage?: string, toStage?: string }) => {
    if (!companyId) return;
    try {
      const validated = activitySchema.parse(payload);
      await (supabase as any).from('activities').insert({
        company_id: companyId,
        deal_id: validated.clientId,
        action: validated.action,
        details: {
          clientName: validated.clientName,
          fromStage: validated.fromStage,
          toStage: validated.toStage
        }
      });
      fetchActivities();
    } catch (err) {
      logger.error('Error logging activity:', err);
    }
  };

  const addClient = useCallback(async (data: ClientFormData) => {
    if (!companyId) return null;

    try {
      const validated = clientFormSchema.parse(data);

      const extraJson = encodeExtraFields(validated);
      const notesWithExtra = extraJson + (validated.notes ? ' ' + validated.notes : '');

      const { data: customer, error: custErr } = await (supabase as any)
        .from('customers')
        .insert({
          company_id: companyId,
          name: validated.name,
          phone: validated.phone,
          email: validated.email || null,
          source: validated.source,
          notes: notesWithExtra
        })
        .select()
        .single();

      if (custErr || !customer) throw custErr;

      const title = [validated.brand, validated.model, validated.year].filter(Boolean).join(' ') || validated.vehicleInterest || 'فرصة جديدة';

      const { data: deal, error: dealErr } = await (supabase as any)
        .from('deals')
        .insert({
          company_id: companyId,
          customer_id: customer.id,
          title,
          stage: validated.funnelStage,
          vehicle_interest: validated.vehicleInterest || title,
          estimated_value: validated.estimatedValue || 0,
          status: 'open'
        })
        .select()
        .single();

      if (dealErr || !deal) throw dealErr;

      refresh();
      addActivity({
        clientId: deal.id,
        clientName: customer.name,
        action: 'created',
        toStage: deal.stage,
      });

      return deal;
    } catch (err: unknown) {
      logger.error('Error adding client:', err);
      return null;
    }
  }, [companyId, refresh]);

  const updateClient = useCallback(async (id: string, data: Partial<ClientFormData>) => {
    if (!companyId) return null;

    const existingClient = clients.find(c => c.id === id);
    if (!existingClient) return null;

    try {
      const validated = clientFormSchema.partial().parse(data);

      const dealUpdates: Database['public']['Tables']['deals']['Update'] = {};
      if (validated.funnelStage) dealUpdates.stage = validated.funnelStage;
      if (validated.vehicleInterest || validated.brand || validated.model) {
        const title = [validated.brand || existingClient.brand, validated.model || existingClient.model, validated.year || existingClient.year].filter(Boolean).join(' ') || validated.vehicleInterest;
        dealUpdates.vehicle_interest = validated.vehicleInterest || title;
        dealUpdates.title = title;
      }
      if (validated.estimatedValue !== undefined) dealUpdates.estimated_value = validated.estimatedValue;

      if (Object.keys(dealUpdates).length > 0) {
        dealUpdates.updated_at = new Date().toISOString();
        await (supabase as any).from('deals').update(dealUpdates).eq('id', id).eq('company_id', companyId);
      }

      const merged = { ...existingClient, ...validated };
      const extraJson = encodeExtraFields(merged);
      const notesWithExtra = extraJson + (merged.notes ? ' ' + merged.notes : '');

      const custUpdates: any = {
        updated_at: new Date().toISOString(),
        notes: notesWithExtra,
      };
      if (validated.name) custUpdates.name = validated.name;
      if (validated.phone) custUpdates.phone = validated.phone;
      if (validated.email !== undefined) custUpdates.email = validated.email;
      if (validated.source) custUpdates.source = validated.source;

      if (existingClient.customerId) {
        await (supabase as any).from('customers').update(custUpdates).eq('id', existingClient.customerId).eq('company_id', companyId);
      }

      if (validated.funnelStage && validated.funnelStage !== existingClient.funnelStage) {
        addActivity({
          clientId: id,
          clientName: existingClient.name,
          action: 'moved',
          fromStage: existingClient.funnelStage,
          toStage: validated.funnelStage,
        });
      }

      setClients(prev => prev.map(c => c.id === id ? { ...c, ...validated } as Client : c));
    } catch (err: unknown) {
      logger.error('Error updating client:', err);
    }
    return null;
  }, [companyId, clients]);

  const deleteClient = useCallback(async (id: string) => {
    if (!companyId) return false;
    try {
      await supabase.from('deals').delete().eq('id', id).eq('company_id', companyId);
      setClients(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err: unknown) {
      logger.error('Error deleting client:', err);
      return false;
    }
  }, [companyId]);

  const moveToStage = useCallback(async (id: string, stage: FunnelStage) => {
    return updateClient(id, { funnelStage: stage });
  }, [updateClient]);

  const updateLastContact = useCallback(async (id: string) => {
    if (!companyId) return;
    await (supabase as any).from('deals').update({ updated_at: new Date().toISOString() }).eq('id', id);
  }, [companyId]);

  const getClientsByStage = useCallback((): Record<FunnelStage, Client[]> => {
    const grouped = {} as Record<FunnelStage, Client[]>;
    FUNNEL_STAGES.forEach((s) => {
      grouped[s.key] = [];
    });
    clients.forEach((c) => {
      if (grouped[c.funnelStage]) {
        grouped[c.funnelStage].push(c);
      }
    });
    return grouped;
  }, [clients]);

  const getStats = useCallback((): DashboardStats => {
    const followUpDays = DEFAULT_FOLLOW_UP_DAYS;
    const activeStages = [
      FunnelStage.FIRST_CONTACT, FunnelStage.ANALYZING, FunnelStage.NEGOTIATION, FunnelStage.FINANCING,
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

    const totalWithOutcome = closedClients.length + clients.filter((c) => c.funnelStage === FunnelStage.LOST).length;
    const conversionRate = totalWithOutcome > 0 ? (closedClients.length / totalWithOutcome) * 100 : 0;
    const totalNegotiationValue = activeClients.reduce((sum, c) => sum + c.estimatedValue, 0);

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
    refresh,
  };
}

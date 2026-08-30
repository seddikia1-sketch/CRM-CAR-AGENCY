import { useState, useCallback, useEffect } from 'react';
import type {
  VehicleServiceProfile,
  VehicleServiceProfileFormData,
  MaintenanceRecord,
  MaintenanceRecordFormData,
} from '../types';
import { storage, STORAGE_KEYS } from '../services/storage';

function generateId() {
  return crypto.randomUUID();
}

export function useMaintenance() {
  const [profiles, setProfiles] = useState<VehicleServiceProfile[]>([]);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setProfiles(storage.get<VehicleServiceProfile[]>(STORAGE_KEYS.SERVICE_PROFILES) || []);
    setRecords(storage.get<MaintenanceRecord[]>(STORAGE_KEYS.MAINTENANCE_RECORDS) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfiles = useCallback((list: VehicleServiceProfile[]) => {
    storage.set(STORAGE_KEYS.SERVICE_PROFILES, list);
    setProfiles(list);
  }, []);

  const saveRecords = useCallback((list: MaintenanceRecord[]) => {
    storage.set(STORAGE_KEYS.MAINTENANCE_RECORDS, list);
    setRecords(list);
  }, []);

  const addProfile = useCallback((data: VehicleServiceProfileFormData) => {
    const now = new Date().toISOString();
    const profile: VehicleServiceProfile = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    saveProfiles([profile, ...profiles]);
    return profile;
  }, [profiles, saveProfiles]);

  const updateProfile = useCallback((id: string, data: Partial<VehicleServiceProfileFormData>) => {
    const updated = profiles.map((p) =>
      p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
    );
    saveProfiles(updated);
  }, [profiles, saveProfiles]);

  const deleteProfile = useCallback((id: string) => {
    saveProfiles(profiles.filter((p) => p.id !== id));
    saveRecords(records.filter((r) => r.profileId !== id));
  }, [profiles, records, saveProfiles, saveRecords]);

  const addRecord = useCallback((data: MaintenanceRecordFormData) => {
    const profile = profiles.find((p) => p.id === data.profileId);
    if (!profile) return null;

    const vehicleLabel = `${profile.brand} ${profile.model} ${profile.year}`;

    // حساب موعد الزيت القادم
    let nextOilChangeKm: number | undefined;
    let nextOilChangeDate: string | undefined;

    if (data.serviceTypes.includes('oil_change') || data.serviceTypes.includes('full_service')) {
      nextOilChangeKm = data.mileage + (profile.oilChangeIntervalKm || 10000);
      if (profile.oilChangeIntervalMonths) {
        const d = new Date(data.serviceDate);
        d.setMonth(d.getMonth() + profile.oilChangeIntervalMonths);
        nextOilChangeDate = d.toISOString().split('T')[0];
      }
    }

    const record: MaintenanceRecord = {
      id: generateId(),
      profileId: data.profileId,
      vin: profile.vin,
      vehicleLabel,
      clientName: profile.clientName,
      serviceTypes: data.serviceTypes,
      serviceDate: data.serviceDate,
      mileage: data.mileage,
      oilTypeUsed: data.oilTypeUsed,
      oilFilterUsed: data.oilFilterUsed,
      airFilterUsed: data.airFilterUsed,
      fuelFilterUsed: data.fuelFilterUsed,
      cabinFilterUsed: data.cabinFilterUsed,
      cost: data.cost,
      notes: data.notes,
      nextOilChangeKm,
      nextOilChangeDate,
      createdAt: new Date().toISOString(),
    };

    // تحديث ملف السيارة
    const profileUpdates: Partial<VehicleServiceProfile> = {
      currentMileage: data.mileage,
      updatedAt: new Date().toISOString(),
    };
    if (data.serviceTypes.includes('oil_change') || data.serviceTypes.includes('full_service')) {
      profileUpdates.lastOilChangeDate = data.serviceDate;
      profileUpdates.lastOilChangeKm = data.mileage;
    }

    updateProfile(data.profileId, profileUpdates);
    saveRecords([record, ...records]);
    return record;
  }, [profiles, records, updateProfile, saveRecords]);

  const deleteRecord = useCallback((id: string) => {
    saveRecords(records.filter((r) => r.id !== id));
  }, [records, saveRecords]);

  /** السيارات التي تحتاج صيانة قريباً */
  const getDueServices = useCallback(() => {
    const now = new Date();
    return profiles
      .map((p) => {
        const nextKm = (p.lastOilChangeKm || 0) + (p.oilChangeIntervalKm || 10000);
        const kmRemaining = nextKm - (p.currentMileage || 0);

        let daysRemaining: number | null = null;
        if (p.lastOilChangeDate && p.oilChangeIntervalMonths) {
          const last = new Date(p.lastOilChangeDate);
          last.setMonth(last.getMonth() + p.oilChangeIntervalMonths);
          daysRemaining = Math.ceil((last.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        const isDue =
          kmRemaining <= 1000 ||
          (daysRemaining !== null && daysRemaining <= 30);

        return {
          profile: p,
          nextKm,
          kmRemaining,
          daysRemaining,
          isDue,
          isOverdue: kmRemaining <= 0 || (daysRemaining !== null && daysRemaining <= 0),
        };
      })
      .filter((x) => x.isDue)
      .sort((a, b) => a.kmRemaining - b.kmRemaining);
  }, [profiles]);

  const searchProfiles = useCallback((query: string) => {
    if (!query.trim()) return profiles;
    const q = query.toLowerCase();
    return profiles.filter(
      (p) =>
        p.vin.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        (p.clientName || '').toLowerCase().includes(q) ||
        (p.clientPhone || '').includes(q)
    );
  }, [profiles]);

  const getRecordsByProfile = useCallback(
    (profileId: string) => records.filter((r) => r.profileId === profileId),
    [records]
  );

  const stats = {
    totalProfiles: profiles.length,
    totalRecords: records.length,
    dueCount: getDueServices().length,
    totalServiceRevenue: records.reduce((s, r) => s + (r.cost || 0), 0),
  };

  return {
    profiles,
    records,
    loading,
    addProfile,
    updateProfile,
    deleteProfile,
    addRecord,
    deleteRecord,
    getDueServices,
    searchProfiles,
    getRecordsByProfile,
    stats,
    refresh: load,
  };
}

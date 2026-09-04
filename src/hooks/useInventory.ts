import { useState, useCallback, useEffect } from 'react';
import type { Vehicle, VehicleFormData, InventoryStatus, MonthlyProfit } from '../types';
import { storage, STORAGE_KEYS } from '../services/storage';
import {
  vehicleTotalCost,
  vehicleProfit,
  normalizeVehicleCosts,
} from '../utils/vehicleFinance';

function generateId() {
  return crypto.randomUUID();
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function normalizeVehicle(v: Vehicle): Vehicle {
  const withCosts = normalizeVehicleCosts(v);
  return {
    ...withCosts,
    images: Array.isArray(v.images) ? v.images : [],
    videoUrl: v.videoUrl || '',
  };
}

export function useInventory() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const data = (storage.get<Vehicle[]>(STORAGE_KEYS.INVENTORY) || []).map(normalizeVehicle);
    setVehicles(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback((list: Vehicle[]) => {
    storage.set(STORAGE_KEYS.INVENTORY, list);
    setVehicles(list);
  }, []);

  const addVehicle = useCallback((data: VehicleFormData) => {
    const now = new Date().toISOString();
    const vehicle: Vehicle = {
      id: generateId(),
      ...data,
      shippingCost: data.shippingCost || 0,
      customsCost: data.customsCost || 0,
      repairCost: data.repairCost || 0,
      otherCosts: data.otherCosts || 0,
      images: data.images || [],
      videoUrl: data.videoUrl || '',
      createdAt: now,
      updatedAt: now,
    };
    save([vehicle, ...vehicles]);
    return vehicle;
  }, [vehicles, save]);

  const updateVehicle = useCallback((id: string, data: Partial<VehicleFormData & { soldToClientId?: string; soldToClientName?: string; soldAt?: string }>) => {
    const updated = vehicles.map((v) => {
      if (v.id !== id) return v;
      return normalizeVehicle({ ...v, ...data, updatedAt: new Date().toISOString() } as Vehicle);
    });
    save(updated);
  }, [vehicles, save]);

  const deleteVehicle = useCallback((id: string) => {
    save(vehicles.filter((v) => v.id !== id));
  }, [vehicles, save]);

  const sellVehicle = useCallback((
    vehicleId: string,
    clientId: string,
    clientName: string,
    finalPrice?: number
  ) => {
    const now = new Date().toISOString();
    const updated = vehicles.map((v) => {
      if (v.id !== vehicleId) return v;
      return {
        ...v,
        status: 'sold' as InventoryStatus,
        sellingPrice: finalPrice ?? v.sellingPrice,
        soldToClientId: clientId,
        soldToClientName: clientName,
        soldAt: now,
        updatedAt: now,
      };
    });
    save(updated);
  }, [vehicles, save]);

  const getByStatus = useCallback((status?: InventoryStatus) => {
    if (!status) return vehicles;
    return vehicles.filter((v) => v.status === status);
  }, [vehicles]);

  const searchVehicles = useCallback((query: string, statusFilter?: InventoryStatus) => {
    let result = vehicles;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (v) =>
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.vin.toLowerCase().includes(q) ||
          v.containerNumber.toLowerCase().includes(q) ||
          v.color.toLowerCase().includes(q) ||
          (v.soldToClientName || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter((v) => v.status === statusFilter);
    return result;
  }, [vehicles]);

  const getMonthlyProfits = useCallback((): MonthlyProfit[] => {
    const sold = vehicles.filter((v) => v.status === 'sold' && v.soldAt);
    const map = new Map<string, MonthlyProfit>();

    sold.forEach((v) => {
      const d = new Date(v.soldAt!);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`;

      if (!map.has(key)) {
        map.set(key, {
          month: key,
          label,
          salesCount: 0,
          totalRevenue: 0,
          totalCost: 0,
          profit: 0,
        });
      }

      const entry = map.get(key)!;
      entry.salesCount += 1;
      entry.totalRevenue += v.sellingPrice || 0;
      entry.totalCost += vehicleTotalCost(v);
      entry.profit = entry.totalRevenue - entry.totalCost;
    });

    return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month));
  }, [vehicles]);

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === 'available').length,
    reserved: vehicles.filter((v) => v.status === 'reserved').length,
    sold: vehicles.filter((v) => v.status === 'sold').length,
    inTransit: vehicles.filter((v) => v.status === 'in_transit').length,
    customs: vehicles.filter((v) => v.status === 'customs').length,
    totalValue: vehicles
      .filter((v) => v.status !== 'sold')
      .reduce((sum, v) => sum + (v.sellingPrice || 0), 0),
    totalProfit: vehicles
      .filter((v) => v.status === 'sold')
      .reduce((sum, v) => sum + vehicleProfit(v), 0),
  };

  return {
    vehicles,
    loading,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    sellVehicle,
    getByStatus,
    searchVehicles,
    getMonthlyProfits,
    stats,
    refresh: load,
  };
}

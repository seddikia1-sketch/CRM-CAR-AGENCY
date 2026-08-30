import { useState, useCallback, useEffect } from 'react';
import type { Vehicle, VehicleFormData, InventoryStatus } from '../types';
import { storage, STORAGE_KEYS } from '../services/storage';

function generateId() {
  return crypto.randomUUID();
}

export function useInventory() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const data = storage.get<Vehicle[]>(STORAGE_KEYS.INVENTORY) || [];
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
      createdAt: now,
      updatedAt: now,
    };
    const updated = [vehicle, ...vehicles];
    save(updated);
    return vehicle;
  }, [vehicles, save]);

  const updateVehicle = useCallback((id: string, data: Partial<VehicleFormData>) => {
    const updated = vehicles.map((v) =>
      v.id === id ? { ...v, ...data, updatedAt: new Date().toISOString() } : v
    );
    save(updated);
  }, [vehicles, save]);

  const deleteVehicle = useCallback((id: string) => {
    const updated = vehicles.filter((v) => v.id !== id);
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
          v.color.toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter((v) => v.status === statusFilter);
    return result;
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
  };

  return {
    vehicles,
    loading,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getByStatus,
    searchVehicles,
    stats,
    refresh: load,
  };
}

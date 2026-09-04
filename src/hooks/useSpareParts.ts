import { useState, useCallback, useEffect } from 'react';
import type { SparePart, SparePartFormData, PartSale, PartCategory, MonthlyProfit } from '../types';
import { storage, STORAGE_KEYS } from '../services/storage';

function generateId() {
  return crypto.randomUUID();
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export function useSpareParts() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [sales, setSales] = useState<PartSale[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setParts(storage.get<SparePart[]>(STORAGE_KEYS.SPARE_PARTS) || []);
    setSales(storage.get<PartSale[]>(STORAGE_KEYS.PART_SALES) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveParts = useCallback((list: SparePart[]) => {
    storage.set(STORAGE_KEYS.SPARE_PARTS, list);
    setParts(list);
  }, []);

  const saveSales = useCallback((list: PartSale[]) => {
    storage.set(STORAGE_KEYS.PART_SALES, list);
    setSales(list);
  }, []);

  const addPart = useCallback((data: SparePartFormData) => {
    const now = new Date().toISOString();
    const part: SparePart = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    saveParts([part, ...parts]);
    return part;
  }, [parts, saveParts]);

  const updatePart = useCallback((id: string, data: Partial<SparePartFormData>) => {
    const updated = parts.map((p) =>
      p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
    );
    saveParts(updated);
  }, [parts, saveParts]);

  const deletePart = useCallback((id: string) => {
    saveParts(parts.filter((p) => p.id !== id));
  }, [parts, saveParts]);

  const sellPart = useCallback((
    partId: string,
    quantity: number,
    unitPrice: number,
    clientId?: string,
    clientName?: string,
    notes?: string,
    vehicleId?: string,
    vehicleVin?: string,
    vehicleLabel?: string,
    invoiceNumber?: string
  ) => {
    const part = parts.find((p) => p.id === partId);
    if (!part || part.quantity < quantity) return null;

    const totalPrice = unitPrice * quantity;
    const costTotal = (part.costPrice || 0) * quantity;
    const profit = totalPrice - costTotal;

    const sale: PartSale = {
      id: generateId(),
      partId,
      partName: part.name,
      quantity,
      unitPrice,
      totalPrice,
      costTotal,
      profit,
      clientId,
      clientName,
      vehicleId,
      vehicleVin,
      vehicleLabel,
      notes: notes || '',
      soldAt: new Date().toISOString(),
      invoiceNumber,
    };

    const updatedParts = parts.map((p) =>
      p.id === partId
        ? { ...p, quantity: p.quantity - quantity, updatedAt: new Date().toISOString() }
        : p
    );
    saveParts(updatedParts);
    saveSales([sale, ...sales]);
    return sale;
  }, [parts, sales, saveParts, saveSales]);

  const searchParts = useCallback((query: string, category?: PartCategory) => {
    let result = parts;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.partNumber.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }
    if (category) result = result.filter((p) => p.category === category);
    return result;
  }, [parts]);

  const getMonthlyPartsProfits = useCallback((): MonthlyProfit[] => {
    const map = new Map<string, MonthlyProfit>();

    sales.forEach((s) => {
      const d = new Date(s.soldAt);
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
      entry.totalRevenue += s.totalPrice;
      entry.totalCost += s.costTotal;
      entry.profit = entry.totalRevenue - entry.totalCost;
    });

    return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month));
  }, [sales]);

  const lowStockParts = parts.filter((p) => p.quantity <= p.minStock);

  const stats = {
    totalParts: parts.length,
    totalQuantity: parts.reduce((s, p) => s + p.quantity, 0),
    lowStock: lowStockParts.length,
    inventoryValue: parts.reduce((s, p) => s + p.quantity * (p.costPrice || 0), 0),
    totalSalesRevenue: sales.reduce((s, sale) => s + sale.totalPrice, 0),
    totalSalesProfit: sales.reduce((s, sale) => s + sale.profit, 0),
    salesCount: sales.length,
  };

  return {
    parts,
    sales,
    loading,
    addPart,
    updatePart,
    deletePart,
    sellPart,
    searchParts,
    lowStockParts,
    getMonthlyPartsProfits,
    stats,
    refresh: load,
  };
}

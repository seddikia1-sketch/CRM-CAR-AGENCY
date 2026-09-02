import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
  PurchaseOrder,
  PurchaseOrderFormData,
  PurchaseLineItem,
  PurchaseStatus,
  SupplierProfile,
  SparePart,
  Vehicle,
  PartCategory,
} from '../types';
import {
  DEFAULT_CHINA_SUPPLIER,
  PurchaseStatus as PS,
  PurchaseItemKind,
  InventoryStatus,
  VehicleCondition,
} from '../types';
import { storage, STORAGE_KEYS } from '../services/storage';

function generateId() {
  return crypto.randomUUID();
}

function nextOrderNumber(existing: PurchaseOrder[]): string {
  const year = new Date().getFullYear();
  const seq = existing.length + 1;
  return `PO-${year}-${String(seq).padStart(4, '0')}`;
}

function calcTotal(items: { quantity: number; unitCost: number }[]): number {
  return items.reduce((s, i) => s + (i.quantity || 0) * (i.unitCost || 0), 0);
}

function kindToPartCategory(kind: string): PartCategory {
  if (kind === PurchaseItemKind.FILTER) return 'filters';
  if (kind === PurchaseItemKind.OIL) return 'oils';
  return 'other';
}

export function usePurchases() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [supplier, setSupplier] = useState<SupplierProfile>(DEFAULT_CHINA_SUPPLIER);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setOrders(storage.get<PurchaseOrder[]>(STORAGE_KEYS.PURCHASES) || []);
    const saved = storage.get<SupplierProfile>(STORAGE_KEYS.SUPPLIER);
    setSupplier(saved || DEFAULT_CHINA_SUPPLIER);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveOrders = useCallback((list: PurchaseOrder[]) => {
    storage.set(STORAGE_KEYS.PURCHASES, list);
    setOrders(list);
  }, []);

  const saveSupplier = useCallback((s: SupplierProfile) => {
    storage.set(STORAGE_KEYS.SUPPLIER, s);
    setSupplier(s);
  }, []);

  const updateSupplier = useCallback(
    (data: Partial<SupplierProfile>) => {
      const next = { ...supplier, ...data };
      saveSupplier(next);
    },
    [supplier, saveSupplier]
  );

  const addOrder = useCallback(
    (data: PurchaseOrderFormData) => {
      const items: PurchaseLineItem[] = (data.items || []).map((it) => ({
        ...it,
        id: generateId(),
        quantity: Number(it.quantity) || 1,
        unitCost: Number(it.unitCost) || 0,
      }));
      const order: PurchaseOrder = {
        id: generateId(),
        orderNumber: nextOrderNumber(orders),
        supplierId: supplier.id,
        supplierName: supplier.name,
        status: data.status || PS.DRAFT,
        orderDate: data.orderDate || new Date().toISOString().slice(0, 10),
        expectedArrival: data.expectedArrival || '',
        containerNumber: data.containerNumber || '',
        shippingNotes: data.shippingNotes || '',
        items,
        totalCost: calcTotal(items),
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveOrders([order, ...orders]);
      return order;
    },
    [orders, supplier, saveOrders]
  );

  const updateOrder = useCallback(
    (id: string, data: Partial<PurchaseOrderFormData> & { status?: PurchaseStatus }) => {
      const updated = orders.map((o) => {
        if (o.id !== id) return o;
        const items: PurchaseLineItem[] = data.items
          ? data.items.map((it) => ({
              id: (it as PurchaseLineItem).id || generateId(),
              kind: it.kind,
              name: it.name,
              reference: it.reference || '',
              brand: it.brand || '',
              model: it.model || '',
              year: it.year,
              color: it.color,
              quantity: Number(it.quantity) || 1,
              unitCost: Number(it.unitCost) || 0,
              expectedSellPrice: it.expectedSellPrice,
              notes: it.notes,
              linkedInventoryId: (it as PurchaseLineItem).linkedInventoryId,
              linkedPartId: (it as PurchaseLineItem).linkedPartId,
            }))
          : o.items;
        return {
          ...o,
          ...data,
          items,
          totalCost: calcTotal(items),
          updatedAt: new Date().toISOString(),
        } as PurchaseOrder;
      });
      saveOrders(updated);
    },
    [orders, saveOrders]
  );

  const deleteOrder = useCallback(
    (id: string) => {
      saveOrders(orders.filter((o) => o.id !== id));
    },
    [orders, saveOrders]
  );

  const setStatus = useCallback(
    (id: string, status: PurchaseStatus) => {
      const updated = orders.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              receivedDate: status === PS.RECEIVED ? new Date().toISOString().slice(0, 10) : o.receivedDate,
              updatedAt: new Date().toISOString(),
            }
          : o
      );
      saveOrders(updated);
    },
    [orders, saveOrders]
  );

  const receiveOrder = useCallback(
    (id: string) => {
      const order = orders.find((o) => o.id === id);
      if (!order || order.status === PS.RECEIVED) return { ok: false as const, message: 'الطلب غير صالح أو مستلم مسبقاً' };

      const inventory = storage.get<Vehicle[]>(STORAGE_KEYS.INVENTORY) || [];
      const parts = storage.get<SparePart[]>(STORAGE_KEYS.SPARE_PARTS) || [];
      let inv = [...inventory];
      let pts = [...parts];
      const now = new Date().toISOString();
      const linkedItems: PurchaseLineItem[] = [];

      for (const item of order.items) {
        if (item.kind === PurchaseItemKind.VEHICLE) {
          const vehicle: Vehicle = {
            id: generateId(),
            brand: item.brand || '—',
            model: item.model || item.name,
            year: item.year || new Date().getFullYear(),
            mileage: 0,
            condition: VehicleCondition.NEW,
            color: item.color || '',
            vin: item.reference || '',
            containerNumber: order.containerNumber || '',
            shippingDate: order.orderDate || '',
            arrivalDate: new Date().toISOString().slice(0, 10),
            customsStatus: 'في الانتظار',
            importPrice: item.unitCost,
            sellingPrice: item.expectedSellPrice || item.unitCost,
            status: InventoryStatus.IN_TRANSIT,
            notes: `من أمر شراء ${order.orderNumber} · ${item.notes || ''}`,
            images: [],
            videoUrl: '',
            createdAt: now,
            updatedAt: now,
          };
          inv = [vehicle, ...inv];
          linkedItems.push({ ...item, linkedInventoryId: vehicle.id });
        } else {
          const category = kindToPartCategory(item.kind);
          const partNumber = item.reference || item.name;
          const existing = pts.find(
            (p) =>
              (partNumber && p.partNumber === partNumber) ||
              (p.name === item.name && p.brand === (item.brand || ''))
          );
          if (existing) {
            pts = pts.map((p) =>
              p.id === existing.id
                ? {
                    ...p,
                    quantity: p.quantity + item.quantity,
                    costPrice: item.unitCost || p.costPrice,
                    sellingPrice: item.expectedSellPrice || p.sellingPrice,
                    updatedAt: now,
                  }
                : p
            );
            linkedItems.push({ ...item, linkedPartId: existing.id });
          } else {
            const part: SparePart = {
              id: generateId(),
              name: item.name,
              partNumber: partNumber,
              brand: item.brand || order.supplierName,
              category,
              quantity: item.quantity,
              costPrice: item.unitCost,
              sellingPrice: item.expectedSellPrice || Math.round(item.unitCost * 1.3),
              minStock: 2,
              notes: `من أمر شراء ${order.orderNumber}`,
              createdAt: now,
              updatedAt: now,
            };
            pts = [part, ...pts];
            linkedItems.push({ ...item, linkedPartId: part.id });
          }
        }
      }

      storage.set(STORAGE_KEYS.INVENTORY, inv);
      storage.set(STORAGE_KEYS.SPARE_PARTS, pts);

      const updatedOrders = orders.map((o) =>
        o.id === id
          ? {
              ...o,
              status: PS.RECEIVED as PurchaseStatus,
              receivedDate: new Date().toISOString().slice(0, 10),
              items: linkedItems,
              updatedAt: now,
            }
          : o
      );
      saveOrders(updatedOrders);

      return {
        ok: true as const,
        message: 'تم الاستلام وتحديث المخزون وقطع الغيار',
        vehiclesAdded: linkedItems.filter((i) => i.linkedInventoryId).length,
        partsUpdated: linkedItems.filter((i) => i.linkedPartId).length,
      };
    },
    [orders, saveOrders]
  );

  const stats = useMemo(() => {
    const open = orders.filter((o) => o.status !== PS.RECEIVED && o.status !== PS.CANCELLED);
    const received = orders.filter((o) => o.status === PS.RECEIVED);
    const totalSpent = received.reduce((s, o) => s + (o.totalCost || 0), 0);
    const pendingCost = open.reduce((s, o) => s + (o.totalCost || 0), 0);
    return {
      totalOrders: orders.length,
      openCount: open.length,
      receivedCount: received.length,
      totalSpent,
      pendingCost,
    };
  }, [orders]);

  return {
    orders,
    supplier,
    loading,
    stats,
    addOrder,
    updateOrder,
    deleteOrder,
    setStatus,
    receiveOrder,
    updateSupplier,
    refresh: load,
  };
}

import type { Vehicle } from '../types';

/** حقول التكلفة المستخدمة في حساب الربح */
export type VehicleCostFields = {
  importPrice?: number;
  shippingCost?: number;
  customsCost?: number;
  repairCost?: number;
  otherCosts?: number;
  sellingPrice?: number;
};

/** إجمالي تكلفة السيارة على المكتب */
export function vehicleTotalCost(v: VehicleCostFields): number {
  return (
    (Number(v.importPrice) || 0) +
    (Number(v.shippingCost) || 0) +
    (Number(v.customsCost) || 0) +
    (Number(v.repairCost) || 0) +
    (Number(v.otherCosts) || 0)
  );
}

/** ربح تقديري أو فعلي = سعر البيع − إجمالي التكلفة */
export function vehicleProfit(v: VehicleCostFields): number {
  return (Number(v.sellingPrice) || 0) - vehicleTotalCost(v);
}

/** حالات يُسمح بعرضها للمتجر / صفحة الهبوط */
export const PUBLIC_INVENTORY_STATUSES = new Set([
  'available',
  'reserved',
  'in_transit',
  'customs',
]);

export function isPublicInventoryStatus(status: string): boolean {
  return status !== 'sold' && PUBLIC_INVENTORY_STATUSES.has(status);
}

/** تطبيع حقول المصاريف للسجلات القديمة */
export function normalizeVehicleCosts<T extends Partial<Vehicle>>(v: T): T & {
  shippingCost: number;
  customsCost: number;
  repairCost: number;
  otherCosts: number;
} {
  return {
    ...v,
    shippingCost: Number(v.shippingCost) || 0,
    customsCost: Number(v.customsCost) || 0,
    repairCost: Number(v.repairCost) || 0,
    otherCosts: Number(v.otherCosts) || 0,
  };
}

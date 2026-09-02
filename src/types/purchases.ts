// ========================================
// المشتريات — مورد الصين (قطع / فلاتر / سيارات)
// ========================================

export const PurchaseItemKind = {
  VEHICLE: 'vehicle',
  FILTER: 'filter',
  OIL: 'oil',
  SPARE_PART: 'spare_part',
} as const;

export type PurchaseItemKind = typeof PurchaseItemKind[keyof typeof PurchaseItemKind];

export const PurchaseStatus = {
  DRAFT: 'draft',
  ORDERED: 'ordered',
  IN_TRANSIT: 'in_transit',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
} as const;

export type PurchaseStatus = typeof PurchaseStatus[keyof typeof PurchaseStatus];

export interface SupplierProfile {
  id: string;
  name: string;
  country: string;
  contactName: string;
  phone: string;
  whatsapp: string;
  email: string;
  notes: string;
}

export interface PurchaseLineItem {
  id: string;
  kind: PurchaseItemKind;
  name: string;
  reference: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  quantity: number;
  unitCost: number;
  expectedSellPrice?: number;
  notes?: string;
  linkedInventoryId?: string;
  linkedPartId?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseStatus;
  orderDate: string;
  expectedArrival?: string;
  receivedDate?: string;
  containerNumber?: string;
  shippingNotes?: string;
  items: PurchaseLineItem[];
  totalCost: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderFormData {
  orderDate: string;
  expectedArrival?: string;
  containerNumber?: string;
  shippingNotes?: string;
  notes: string;
  items: Omit<PurchaseLineItem, 'id' | 'linkedInventoryId' | 'linkedPartId'>[];
  status?: PurchaseStatus;
}

export const DEFAULT_CHINA_SUPPLIER: SupplierProfile = {
  id: 'supplier-china-main',
  name: 'مورد الصين الرئيسي',
  country: 'الصين',
  contactName: '',
  phone: '',
  whatsapp: '',
  email: '',
  notes: 'مورد واحد — سيارات وقطع وفلاتر',
};

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  draft: 'مسودة',
  ordered: 'تم الطلب',
  in_transit: 'في الشحن',
  received: 'مستلم',
  cancelled: 'ملغى',
};

export const PURCHASE_KIND_LABELS: Record<PurchaseItemKind, string> = {
  vehicle: 'سيارة',
  filter: 'فلتر',
  oil: 'زيت',
  spare_part: 'قطعة غيار',
};

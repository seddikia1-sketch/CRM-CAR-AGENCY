// ========================================
// CRM مكاتب السيارات الصينية — Type Definitions
// ========================================

export const FunnelStage = {
  FIRST_CONTACT: 'first_contact',
  ANALYZING: 'analyzing',
  NEGOTIATION: 'negotiation',
  FINANCING: 'financing',
  CLOSING: 'closing',
  LOST: 'lost',
} as const;

export type FunnelStage = typeof FunnelStage[keyof typeof FunnelStage];

export const LeadSource = {
  WHATSAPP: 'whatsapp',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  PRESENTIAL: 'presential',
  REFERRAL: 'referral',
  WEBSITE: 'website',
  OTHER: 'other',
} as const;

export type LeadSource = typeof LeadSource[keyof typeof LeadSource];

export const VehicleCondition = {
  NEW: 'new',
  UNDER_3_YEARS: 'under_3_years',
} as const;

export type VehicleCondition = typeof VehicleCondition[keyof typeof VehicleCondition];

export const InventoryStatus = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  SOLD: 'sold',
  IN_TRANSIT: 'in_transit',
  CUSTOMS: 'customs',
} as const;

export type InventoryStatus = typeof InventoryStatus[keyof typeof InventoryStatus];

export interface Client {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  email: string;
  vehicleInterest: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  condition: VehicleCondition;
  shippingDate: string;
  containerNumber: string;
  customsStatus: string;
  importPrice: number;
  estimatedValue: number;
  funnelStage: FunnelStage;
  source: LeadSource;
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastContactAt: string;
}

export interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  vehicleInterest: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  condition: VehicleCondition;
  shippingDate: string;
  containerNumber: string;
  customsStatus: string;
  importPrice: number;
  estimatedValue: number;
  funnelStage: FunnelStage;
  source: LeadSource;
  notes: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  condition: VehicleCondition;
  color: string;
  vin: string;
  containerNumber: string;
  shippingDate: string;
  arrivalDate: string;
  customsStatus: string;
  importPrice: number;
  sellingPrice: number;
  status: InventoryStatus;
  notes: string;
  soldToClientId?: string;
  soldToClientName?: string;
  soldAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormData {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  condition: VehicleCondition;
  color: string;
  vin: string;
  containerNumber: string;
  shippingDate: string;
  arrivalDate: string;
  customsStatus: string;
  importPrice: number;
  sellingPrice: number;
  status: InventoryStatus;
  notes: string;
}

export const PartCategory = {
  ENGINE: 'engine',
  BRAKES: 'brakes',
  SUSPENSION: 'suspension',
  ELECTRICAL: 'electrical',
  BODY: 'body',
  FILTERS: 'filters',
  OILS: 'oils',
  ACCESSORIES: 'accessories',
  OTHER: 'other',
} as const;

export type PartCategory = typeof PartCategory[keyof typeof PartCategory];

export interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  brand: string;
  category: PartCategory;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  minStock: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SparePartFormData {
  name: string;
  partNumber: string;
  brand: string;
  category: PartCategory;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  minStock: number;
  notes: string;
}

export interface PartSale {
  id: string;
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  costTotal: number;
  profit: number;
  clientId?: string;
  clientName?: string;
  // ربط بسيارة معينة
  vehicleId?: string;
  vehicleVin?: string;
  vehicleLabel?: string; // مثال: Chery Tiggo 8 2024
  notes: string;
  soldAt: string;
}

export interface FunnelStageInfo {
  key: FunnelStage;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

export interface LeadSourceInfo {
  key: LeadSource;
  label: string;
  emoji: string;
}

export interface ActivityLog {
  id: string;
  clientId: string;
  clientName: string;
  action: 'created' | 'moved' | 'updated' | 'deleted';
  fromStage?: FunnelStage;
  toStage?: FunnelStage;
  timestamp: string;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  conversionRate: number;
  totalNegotiationValue: number;
  clientsByStage: Record<FunnelStage, number>;
  clientsBySource: Record<LeadSource, number>;
  recentActivities: ActivityLog[];
  followUpNeeded: Client[];
}

export interface MonthlyProfit {
  month: string;
  label: string;
  salesCount: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
}

export interface AgencySettings {
  name: string;
  followUpDays: number;
}

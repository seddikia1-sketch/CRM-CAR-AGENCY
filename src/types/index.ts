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

export interface AgencySettings {
  name: string;
  followUpDays: number;
}

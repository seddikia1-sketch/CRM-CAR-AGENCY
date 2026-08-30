// ========================================
// CRM مكاتب السيارات الصينية — Constants
// ========================================

import { FunnelStage, LeadSource, VehicleCondition, InventoryStatus, PartCategory, ServiceType } from '../types';
import type { FunnelStageInfo, LeadSourceInfo } from '../types';

export const FUNNEL_STAGES: FunnelStageInfo[] = [
  { key: FunnelStage.FIRST_CONTACT, label: 'أول اتصال', emoji: '👋', color: '#ffd93d', description: 'العميل تواصل لأول مرة' },
  { key: FunnelStage.ANALYZING, label: 'دراسة الخيارات', emoji: '🔍', color: '#6c9fff', description: 'العميل يقارن السيارات والخيارات' },
  { key: FunnelStage.NEGOTIATION, label: 'تفاوض', emoji: '🤝', color: '#f0932b', description: 'مناقشة السعر وشروط البيع' },
  { key: FunnelStage.FINANCING, label: 'تمويل / جمرك', emoji: '🏦', color: '#a855f7', description: 'مرحلة التمويل أو إجراءات الجمرك' },
  { key: FunnelStage.CLOSING, label: 'إتمام البيع', emoji: '✅', color: '#22c55e', description: 'تمت عملية البيع بنجاح' },
  { key: FunnelStage.LOST, label: 'خسارة', emoji: '❌', color: '#ef4444', description: 'العميل انسحب من الشراء' },
];

export const LEAD_SOURCES: LeadSourceInfo[] = [
  { key: LeadSource.WHATSAPP, label: 'واتساب', emoji: '💬' },
  { key: LeadSource.INSTAGRAM, label: 'إنستغرام', emoji: '📸' },
  { key: LeadSource.FACEBOOK, label: 'فيسبوك', emoji: '📘' },
  { key: LeadSource.PRESENTIAL, label: 'حضوري', emoji: '🏪' },
  { key: LeadSource.REFERRAL, label: 'إحالة', emoji: '🗣️' },
  { key: LeadSource.WEBSITE, label: 'الموقع', emoji: '🌐' },
  { key: LeadSource.OTHER, label: 'أخرى', emoji: '📋' },
];

export const VEHICLE_CONDITIONS = [
  { key: VehicleCondition.NEW, label: 'جديدة', emoji: '🆕' },
  { key: VehicleCondition.UNDER_3_YEARS, label: 'أقل من 3 سنوات', emoji: '📅' },
];

export const INVENTORY_STATUSES = [
  { key: InventoryStatus.AVAILABLE, label: 'متاحة', emoji: '✅', color: '#22c55e' },
  { key: InventoryStatus.RESERVED, label: 'محجوزة', emoji: '🔒', color: '#f0932b' },
  { key: InventoryStatus.SOLD, label: 'مباعة', emoji: '💰', color: '#6c9fff' },
  { key: InventoryStatus.IN_TRANSIT, label: 'في الطريق', emoji: '🚢', color: '#a855f7' },
  { key: InventoryStatus.CUSTOMS, label: 'تحت الجمرك', emoji: '🛃', color: '#ef4444' },
];

export const PART_CATEGORIES = [
  { key: PartCategory.ENGINE, label: 'محرك', emoji: '🔧' },
  { key: PartCategory.BRAKES, label: 'فرامل', emoji: '🛑' },
  { key: PartCategory.SUSPENSION, label: 'تعليق', emoji: '⚙️' },
  { key: PartCategory.ELECTRICAL, label: 'كهرباء', emoji: '⚡' },
  { key: PartCategory.BODY, label: 'هيكل وصبغ', emoji: '🚗' },
  { key: PartCategory.FILTERS, label: 'فلاتر', emoji: '🛡️' },
  { key: PartCategory.OILS, label: 'زيوت وسوائل', emoji: '🛢️' },
  { key: PartCategory.ACCESSORIES, label: 'إكسسوارات', emoji: '✨' },
  { key: PartCategory.OTHER, label: 'أخرى', emoji: '📦' },
];

export const SERVICE_TYPES = [
  { key: ServiceType.OIL_CHANGE, label: 'تغيير الزيت', emoji: '🛢️' },
  { key: ServiceType.OIL_FILTER, label: 'فلتر الزيت', emoji: '🔩' },
  { key: ServiceType.AIR_FILTER, label: 'فلتر الهواء', emoji: '🌬️' },
  { key: ServiceType.FUEL_FILTER, label: 'فلتر الوقود', emoji: '⛽' },
  { key: ServiceType.CABIN_FILTER, label: 'فلتر المقصورة', emoji: '🏠' },
  { key: ServiceType.BRAKE_PADS, label: 'تيل الفرامل', emoji: '🛑' },
  { key: ServiceType.BRAKE_FLUID, label: 'سائل الفرامل', emoji: '💧' },
  { key: ServiceType.COOLANT, label: 'مياه التبريد', emoji: '❄️' },
  { key: ServiceType.SPARK_PLUGS, label: 'شمعات الاحتراق', emoji: '⚡' },
  { key: ServiceType.TIMING_BELT, label: 'سير التوقيت', emoji: '🔗' },
  { key: ServiceType.TRANSMISSION, label: 'زيت القير', emoji: '⚙️' },
  { key: ServiceType.BATTERY, label: 'البطارية', emoji: '🔋' },
  { key: ServiceType.TIRES, label: 'الإطارات', emoji: '🛞' },
  { key: ServiceType.FULL_SERVICE, label: 'صيانة شاملة', emoji: '✅' },
  { key: ServiceType.OTHER, label: 'أخرى', emoji: '📋' },
];

export const COMMON_OIL_TYPES = [
  '5W-30 Fully Synthetic',
  '5W-40 Fully Synthetic',
  '0W-20 Fully Synthetic',
  '0W-30 Fully Synthetic',
  '10W-40 Semi Synthetic',
  '15W-40 Mineral',
  '5W-30 Semi Synthetic',
];

export const STAGE_MAP: Record<FunnelStage, FunnelStageInfo> = Object.fromEntries(
  FUNNEL_STAGES.map((s) => [s.key, s])
) as Record<FunnelStage, FunnelStageInfo>;

export const SOURCE_MAP: Record<LeadSource, LeadSourceInfo> = Object.fromEntries(
  LEAD_SOURCES.map((s) => [s.key, s])
) as Record<LeadSource, LeadSourceInfo>;

export const DEFAULT_FOLLOW_UP_DAYS = 3;

export const CHINESE_BRANDS = [
  'Chery', 'Geely', 'BYD', 'Great Wall', 'Haval', 'Changan', 'MG', 'JAC', 'Dongfeng', 'BAIC', 'Other',
];

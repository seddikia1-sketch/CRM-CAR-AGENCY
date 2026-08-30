// ========================================
// CRM مكاتب السيارات الصينية — Constants
// ========================================

import { FunnelStage, LeadSource, VehicleCondition } from '../types';
import type { FunnelStageInfo, LeadSourceInfo } from '../types';

export const FUNNEL_STAGES: FunnelStageInfo[] = [
  {
    key: FunnelStage.FIRST_CONTACT,
    label: 'أول اتصال',
    emoji: '👋',
    color: '#ffd93d',
    description: 'العميل تواصل لأول مرة',
  },
  {
    key: FunnelStage.ANALYZING,
    label: 'دراسة الخيارات',
    emoji: '🔍',
    color: '#6c9fff',
    description: 'العميل يقارن السيارات والخيارات',
  },
  {
    key: FunnelStage.NEGOTIATION,
    label: 'تفاوض',
    emoji: '🤝',
    color: '#f0932b',
    description: 'مناقشة السعر وشروط البيع',
  },
  {
    key: FunnelStage.FINANCING,
    label: 'تمويل / جمرك',
    emoji: '🏦',
    color: '#a855f7',
    description: 'مرحلة التمويل أو إجراءات الجمرك',
  },
  {
    key: FunnelStage.CLOSING,
    label: 'إتمام البيع',
    emoji: '✅',
    color: '#22c55e',
    description: 'تمت عملية البيع بنجاح',
  },
  {
    key: FunnelStage.LOST,
    label: 'خسارة',
    emoji: '❌',
    color: '#ef4444',
    description: 'العميل انسحب من الشراء',
  },
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

export const STAGE_MAP: Record<FunnelStage, FunnelStageInfo> = Object.fromEntries(
  FUNNEL_STAGES.map((s) => [s.key, s])
) as Record<FunnelStage, FunnelStageInfo>;

export const SOURCE_MAP: Record<LeadSource, LeadSourceInfo> = Object.fromEntries(
  LEAD_SOURCES.map((s) => [s.key, s])
) as Record<LeadSource, LeadSourceInfo>;

export const DEFAULT_FOLLOW_UP_DAYS = 3;

// أشهر الماركات الصينية الشائعة في الجزائر
export const CHINESE_BRANDS = [
  'Chery',
  'Geely',
  'BYD',
  'Great Wall',
  'Haval',
  'Changan',
  'MG',
  'JAC',
  'Dongfeng',
  'BAIC',
  'Other',
];

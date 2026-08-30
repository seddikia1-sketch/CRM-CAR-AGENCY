import { z } from 'zod';
import { sanitizeString } from './sanitize';
import { FunnelStage, LeadSource, VehicleCondition } from '../types';

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export const signupSchema = z.object({
  companyName: z
    .string()
    .min(2, 'اسم المكتب يجب أن يكون حرفين على الأقل')
    .max(100, 'اسم المكتب طويل جداً')
    .transform(sanitizeString),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export const clientFormSchema = z.object({
  name: z
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جداً')
    .transform(sanitizeString),
  phone: z
    .string()
    .min(8, 'رقم الهاتف غير صالح'),
  email: z.union([z.string().email('البريد الإلكتروني غير صالح'), z.string().length(0)]).optional(),
  vehicleInterest: z
    .string()
    .max(200)
    .transform(sanitizeString)
    .optional()
    .or(z.literal('')),
  brand: z.string().max(50).optional().or(z.literal('')),
  model: z.string().max(50).optional().or(z.literal('')),
  year: z.number().min(1990).max(2030).optional().or(z.nan()),
  mileage: z.number().nonnegative().optional().or(z.nan()),
  condition: z.nativeEnum(VehicleCondition).optional(),
  shippingDate: z.string().optional().or(z.literal('')),
  containerNumber: z.string().max(50).optional().or(z.literal('')),
  customsStatus: z.string().max(100).optional().or(z.literal('')),
  importPrice: z.number().nonnegative().optional().or(z.nan()),
  estimatedValue: z.number().nonnegative('القيمة لا يمكن أن تكون سالبة'),
  funnelStage: z.nativeEnum(FunnelStage),
  source: z.nativeEnum(LeadSource),
  notes: z
    .string()
    .max(2000)
    .transform(sanitizeString)
    .optional()
    .or(z.literal('')),
});

export const activitySchema = z.object({
  clientId: z.string().uuid('معرف العميل غير صالح'),
  clientName: z.string().transform(sanitizeString),
  action: z.enum(['created', 'moved', 'updated', 'deleted']),
  fromStage: z.nativeEnum(FunnelStage).optional(),
  toStage: z.nativeEnum(FunnelStage).optional(),
});

import { fetchJson } from './apiClient';

export interface AdminSettingRecord {
  [key: string]: unknown;
  enabled?: boolean;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  senderName: string;
  senderEmail: string;
  enabled: boolean;
}

export interface SmsSettings {
  provider: string;
  senderId: string;
  otpLength: number;
  enabled: boolean;
}

export type OtpDeliveryChannel = 'EMAIL' | 'SMS';

export function normalizeOtpDeliveryChannel(value: unknown): OtpDeliveryChannel {
  const normalized = String(value ?? 'EMAIL').trim().toUpperCase();
  return normalized === 'SMS' ? 'SMS' : 'EMAIL';
}

type ApiEnvelope<T> = {
  data?: T;
  content?: T;
  success?: boolean;
  message?: string;
};

function unwrap<T>(response: T | ApiEnvelope<T>, message: string): T {
  if (response && typeof response === 'object' && ('data' in response || 'content' in response || 'success' in response)) {
    const envelope = response as ApiEnvelope<T>;
    if (envelope.success === false) throw new Error(envelope.message || message);
    return (envelope.data ?? envelope.content) as T;
  }
  return response as T;
}

async function getSetting(path: string): Promise<AdminSettingRecord> {
  const response = await fetchJson<AdminSettingRecord | ApiEnvelope<AdminSettingRecord>>(path, { method: 'GET' });
  const setting = unwrap(response, `Failed to load ${path}`);
  if (!setting || typeof setting !== 'object') throw new Error(`Failed to load ${path}`);
  return setting;
}

async function updateSetting(path: string, payload: AdminSettingRecord): Promise<AdminSettingRecord> {
  const response = await fetchJson<AdminSettingRecord | ApiEnvelope<AdminSettingRecord>>(path, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const setting = unwrap(response, `Failed to update ${path}`);
  if (!setting || typeof setting !== 'object') throw new Error(`Failed to update ${path}`);
  return setting;
}

export const getAdminGeneralSettings = () => getSetting('/api/admin/settings/getgeneral');
export const updateAdminGeneralSettings = (payload: AdminSettingRecord) => updateSetting('/api/admin/settings/general', payload);

export const getAdminAuctionRules = () => getSetting('/api/admin/settings/getauction-rules');
export const updateAdminAuctionRules = (payload: AdminSettingRecord) => updateSetting('/api/admin/settings/auction-rules', payload);

export const getAdminRegistrationFeeSettings = () => getSetting('/api/admin/settings/getregistration-fee');
export const updateAdminRegistrationFeeSettings = (payload: AdminSettingRecord) => updateSetting('/api/admin/settings/registration-fee', payload);

export const getAdminCommissionRules = () => getSetting('/api/admin/settings/getcommission-rules');
export const updateAdminCommissionRules = (payload: AdminSettingRecord) => updateSetting('/api/admin/settings/commission-rules', payload);

export const getAdminPlatformCharges = () => getSetting('/api/admin/settings/getplatform-charges');
export const updateAdminPlatformCharges = (payload: AdminSettingRecord) => updateSetting('/api/admin/settings/platform-charges', payload);

export const getAdminShippingRules = () => getSetting('/api/admin/settings/getshipping-rules');
export const updateAdminShippingRules = (payload: AdminSettingRecord) => updateSetting('/api/admin/settings/shipping-rules', payload);

export const getAdminTaxSettings = () => getSetting('/api/admin/settings/gettax');
export const updateAdminTaxSettings = (payload: AdminSettingRecord) => updateSetting('/api/admin/settings/tax', payload);

export async function getAdminEmailSettings(): Promise<EmailSettings> {
  const setting = await getSetting('/api/admin/settings/getemail');
  return {
    smtpHost: String(setting.smtpHost ?? ''),
    smtpPort: Number(setting.smtpPort),
    senderName: String(setting.senderName ?? ''),
    senderEmail: String(setting.senderEmail ?? ''),
    enabled: Boolean(setting.enabled),
  };
}

export async function updateAdminEmailSettings(payload: EmailSettings): Promise<EmailSettings> {
  const setting = await updateSetting('/api/admin/settings/email', payload as unknown as AdminSettingRecord);
  return {
    smtpHost: String(setting.smtpHost ?? ''),
    smtpPort: Number(setting.smtpPort),
    senderName: String(setting.senderName ?? ''),
    senderEmail: String(setting.senderEmail ?? ''),
    enabled: Boolean(setting.enabled),
  };
}

export async function getAdminSmsSettings(): Promise<SmsSettings> {
  const setting = await getSetting('/api/admin/settings/getsms');
  return {
    provider: String(setting.provider ?? ''),
    senderId: String(setting.senderId ?? setting.sender_id ?? ''),
    otpLength: Number(setting.otpLength ?? setting.otp_length),
    enabled: Boolean(setting.enabled),
  };
}

export async function updateAdminSmsSettings(payload: SmsSettings): Promise<SmsSettings> {
  const setting = await updateSetting('/api/admin/settings/sms', payload as unknown as AdminSettingRecord);
  return {
    provider: String(setting.provider ?? ''),
    senderId: String(setting.senderId ?? setting.sender_id ?? ''),
    otpLength: Number(setting.otpLength ?? setting.otp_length),
    enabled: Boolean(setting.enabled),
  };
}

export const getAdminSecuritySettings = () => getSetting('/api/admin/settings/getsecurity');
export const updateAdminSecuritySettings = (payload: AdminSettingRecord) => updateSetting('/api/admin/settings/security', payload);

export const getAdminLocalizationSettings = () => getSetting('/api/admin/settings/getlocalization');
export const updateAdminLocalizationSettings = (payload: AdminSettingRecord) => updateSetting('/api/admin/settings/localization', payload);

export async function getOtpDeliveryPreference(): Promise<OtpDeliveryChannel> {
  const settings = await getAdminGeneralSettings();
  return normalizeOtpDeliveryChannel(
    settings.otpDelivery
      ?? settings.otpChannel
      ?? settings.deliveryChannel
      ?? settings.verificationChannel
      ?? 'EMAIL'
  );
}

export async function updateOtpDeliveryPreference(channel: OtpDeliveryChannel): Promise<AdminSettingRecord> {
  const current = await getAdminGeneralSettings();
  const payload: AdminSettingRecord = {
    ...current,
    otpDelivery: channel,
    otpChannel: channel,
    deliveryChannel: channel,
    verificationChannel: channel,
    emailOtpEnabled: channel === 'EMAIL',
    smsOtpEnabled: channel === 'SMS',
  };
  return updateAdminGeneralSettings(payload);
}

export interface NotificationTemplate {
  id: number | string;
  name: string;
  type: string;
  status: 'Active' | 'Draft' | string;
  [key: string]: unknown;
}

export interface NotificationTemplateRequest {
  name: string;
  type: string;
  status: string;
  [key: string]: unknown;
}

export async function getAdminNotificationTemplates(): Promise<NotificationTemplate[]> {
  const response = await fetchJson<NotificationTemplate[] | ApiEnvelope<NotificationTemplate[]>>('/api/admin/settings/notification-templates', { method: 'GET' });
  const templates = unwrap(response, 'Failed to load notification templates');
  if (Array.isArray(templates)) return templates;
  if (templates && typeof templates === 'object') {
    const list = (templates as { items?: unknown[]; content?: unknown[]; results?: unknown[] }).items
      || (templates as { content?: unknown[] }).content
      || (templates as { results?: unknown[] }).results;
    if (Array.isArray(list)) return list as NotificationTemplate[];
  }
  throw new Error('Failed to load notification templates');
}

export async function createAdminNotificationTemplate(payload: NotificationTemplateRequest): Promise<NotificationTemplate> {
  const response = await fetchJson<NotificationTemplate | ApiEnvelope<NotificationTemplate>>('/api/admin/settings/notification-templates', { method: 'POST', body: JSON.stringify(payload) });
  return unwrap(response, 'Failed to create notification template');
}

export async function updateAdminNotificationTemplate(id: number | string, payload: NotificationTemplateRequest): Promise<NotificationTemplate> {
  const response = await fetchJson<NotificationTemplate | ApiEnvelope<NotificationTemplate>>(`/api/admin/settings/notification-templates/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });
  return unwrap(response, 'Failed to update notification template');
}

export async function deleteAdminNotificationTemplate(id: number | string): Promise<void> {
  await fetchJson(`/api/admin/settings/notification-templates/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

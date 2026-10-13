export function resolveAndroidApkUrl(configuredUrl?: string): { url: string | null; error: string | null } {
  const value = configuredUrl?.trim();
  if (!value) return { url: null, error: 'APK download is not configured yet.' };

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.pathname.toLowerCase().endsWith('.apk')) {
      return { url: null, error: 'The APK download link is invalid. Please contact support.' };
    }
    return { url: url.href, error: null };
  } catch {
    return { url: null, error: 'The APK download link is invalid. Please contact support.' };
  }
}
/**
 * 将后端返回的 logo_url 转为浏览器可访问地址。
 * 开发环境 /uploads 已代理到后端；生产同域或由网关转发。
 */
export function resolvePublicAssetUrl(url: string): string {
  const raw = (url || '').trim();
  if (!raw) return '';
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) {
    return raw;
  }
  return raw.startsWith('/') ? raw : `/${raw}`;
}

/** 应用站点设置到 preferences（侧栏 / 登录页 Logo 与标题） */
export async function applySiteSettingsToPreferences(settings: {
  app_name?: string;
  logo_url?: string;
}) {
  const { updatePreferences } = await import('@vben/preferences');
  const patch: Record<string, Record<string, string>> = {};
  const name = (settings.app_name || '').trim();
  if (name) {
    patch.app = { name };
  }
  const logo = resolvePublicAssetUrl(settings.logo_url || '');
  if (logo) {
    patch.logo = { source: logo };
  }
  if (Object.keys(patch).length > 0) {
    updatePreferences(patch as any);
  }
}

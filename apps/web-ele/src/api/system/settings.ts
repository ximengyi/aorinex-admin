/**
 * 系统设置 - 站点 Logo / 名称
 * GET/PUT /api/system/settings
 * POST /api/system/settings/logo
 */
import { requestClient } from '#/api/request';

export namespace SiteSettingsApi {
  export interface Settings {
    app_name: string;
    logo_url: string;
  }
}

/** 获取站点设置 */
export async function getSiteSettingsApi() {
  return requestClient.get<SiteSettingsApi.Settings>('/system/settings');
}

/** 更新站点设置（名称等） */
export async function updateSiteSettingsApi(data: Partial<SiteSettingsApi.Settings>) {
  return requestClient.put<SiteSettingsApi.Settings>('/system/settings', data);
}

/** 上传 Logo */
export async function uploadSiteLogoApi(file: File) {
  return requestClient.upload<SiteSettingsApi.Settings>('/system/settings/logo', {
    file,
  });
}

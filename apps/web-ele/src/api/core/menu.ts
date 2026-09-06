import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户所有菜单
 * GET /api/menus
 */
export async function getAllMenusApi() {
  const data = await requestClient.get<
    RouteRecordStringComponent[] | { menu_tree?: unknown; routes?: RouteRecordStringComponent[] }
  >('/menus');
  if (Array.isArray(data)) {
    return data;
  }
  return data?.routes ?? [];
}

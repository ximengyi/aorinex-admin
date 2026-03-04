/**
 * 系统管理 - 菜单接口
 * 后端: GET/POST {{base_url}}/api/system/menu/*
 */
import { requestClient } from '#/api/request';

export namespace MenuApi {
  export interface MenuItem {
    id: number;
    title: string;
    icon?: string;
    pid: number;
    path?: string;
    type?: number;
    weight?: number;
    children?: MenuItem[];
    created_at?: string;
    updated_at?: string;
  }

  export interface MenuTreeParams {
    status?: number;
  }

  export interface MenuCreateParams {
    title: string;
    icon?: string;
    pid?: number;
    path?: string;
    type?: number;
    weight?: number;
  }

  export interface MenuUpdateParams extends MenuCreateParams {
    id: number;
  }
}

/** 菜单树 GET /api/system/menu/tree */
export async function getMenuTreeApi(params?: MenuApi.MenuTreeParams) {
  return requestClient.get<MenuApi.MenuItem[]>('/system/menu/tree', {
    params: params ?? { status: 0 },
  });
}

/** 创建菜单 POST /api/system/menu/create */
export async function createMenuApi(data: MenuApi.MenuCreateParams) {
  return requestClient.post<unknown>('/system/menu/create', data);
}

/** 更新菜单 POST /api/system/menu/update */
export async function updateMenuApi(data: MenuApi.MenuUpdateParams) {
  return requestClient.post<unknown>('/system/menu/update', data);
}

/** 删除菜单 POST /api/system/menu/delete */
export async function deleteMenuApi(id: number) {
  return requestClient.post<unknown>('/system/menu/delete', { id });
}

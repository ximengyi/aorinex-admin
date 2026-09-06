/**
 * 系统管理 - 菜单接口
 * 后端 RESTful: /api/system/menus
 */
import { requestClient } from '#/api/request';

export namespace MenuApi {
  /** 与后端 mapRuleToMenuArray 一致；path 兼容为前端路由 */
  export interface MenuItem {
    id: number;
    title: string;
    icon?: string;
    pid: number;
    path?: string;
    /** 前端路由（与 path 对 type0/1 通常一致） */
    frontend_path?: string;
    /** 接口鉴权前缀，如 /api/system */
    api_path?: string;
    /** 权限码 system:xxx，进入 GET /api/auth/codes */
    access_code?: string;
    type?: number;
    weight?: number;
    status?: number;
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
    api_path?: string;
    access_code?: string;
    type?: number;
    weight?: number;
  }

  export interface MenuUpdateParams extends MenuCreateParams {
    id: number;
  }
}

/** 菜单树 GET /api/system/menus */
export async function getMenuTreeApi(params?: MenuApi.MenuTreeParams) {
  return requestClient.get<MenuApi.MenuItem[]>('/system/menus', {
    params: params ?? { status: 0 },
  });
}

/** 创建菜单 POST /api/system/menus */
export async function createMenuApi(data: MenuApi.MenuCreateParams) {
  return requestClient.post<unknown>('/system/menus', data);
}

/** 更新菜单 PUT /api/system/menus/{id} */
export async function updateMenuApi(data: MenuApi.MenuUpdateParams) {
  const { id, ...body } = data;
  return requestClient.put<unknown>(`/system/menus/${id}`, body);
}

/** 删除菜单 DELETE /api/system/menus/{id} */
export async function deleteMenuApi(id: number) {
  return requestClient.delete<unknown>(`/system/menus/${id}`);
}

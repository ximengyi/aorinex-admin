/**
 * 系统管理 - 账号（管理员）接口
 * 后端: POST/GET {{base_url}}/api/system/admin/*
 */
import { requestClient } from '#/api/request';

export namespace AdminApi {
  export interface AdminItem {
    id: number;
    username: string;
    name?: string;
    mobile?: string;
    email?: string;
    department?: string;
    status?: number;
    role_ids?: number[];
    created_at?: string;
    updated_at?: string;
  }

  export interface AdminListParams {
    page?: number;
    per_page?: number;
    role_id?: string;
    status?: string;
  }

  export interface AdminListResult {
    list: AdminItem[];
    total?: number;
  }

  export interface AdminUpdateParams {
    id: number;
    username?: string;
    name?: string;
    mobile?: string;
    email?: string;
    department?: string;
    status?: number;
    role_ids?: number[];
  }

  export interface AdminCreateParams {
    username: string;
    password?: string;
    name?: string;
    mobile?: string;
    email?: string;
    department?: string;
    status?: number;
    role_ids?: number[];
  }

  export interface AdminUpdateStatusParams {
    id: number;
    /** 0=正常  1=禁用 */
    status: number;
  }
}

/** 账号列表 GET /api/system/admin/list
 * 兼容两种响应格式：
 *   - 真实后端: { list: [], total: n }
 *   - Mock server: { items: [], total: n }
 *   - 直接数组: []
 */
export async function getAdminListApi(params: AdminApi.AdminListParams) {
  const data = await requestClient.get<any>('/system/admin/list', { params });
  if (Array.isArray(data)) {
    return { list: data as AdminApi.AdminItem[], total: data.length };
  }
  const list: AdminApi.AdminItem[] = data?.list ?? data?.items ?? [];
  return { list, total: (data?.total as number) ?? list.length };
}

/** 创建账号 POST /api/system/admin/create */
export async function createAdminApi(data: AdminApi.AdminCreateParams) {
  return requestClient.post<unknown>('/system/admin/create', data);
}

/** 更新账号 POST /api/system/admin/update */
export async function updateAdminApi(data: AdminApi.AdminUpdateParams) {
  return requestClient.post<unknown>('/system/admin/update', data);
}

/** 启用/禁用账号 POST /api/system/admin/updateStatus */
export async function updateAdminStatusApi(data: AdminApi.AdminUpdateStatusParams) {
  return requestClient.post<unknown>('/system/admin/updateStatus', data);
}

/** 重置密码 POST /api/system/admin/resetPassword */
export async function resetAdminPasswordApi(id: number) {
  return requestClient.post<unknown>('/system/admin/resetPassword', { id });
}

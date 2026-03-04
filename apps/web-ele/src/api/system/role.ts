/**
 * 系统管理 - 角色接口
 * 后端: GET/POST {{base_url}}/api/system/role/*
 */
import { requestClient } from '#/api/request';

export namespace RoleApi {
  export interface RoleItem {
    id: number;
    name: string;
    summary?: string;
    rule_ids?: number[];
    pid?: number;
    status?: number;
    created_at?: string;
    updated_at?: string;
  }

  export interface RoleListParams {
    page?: number;
    per_page?: number;
    pid?: string;
    keyword?: string;
  }

  export interface RoleListResult {
    list: RoleItem[];
    total?: number;
  }

  export interface RoleCreateParams {
    name: string;
    summary?: string;
    rule_ids?: number[];
    pid?: number;
  }

  export interface RoleUpdateParams extends RoleCreateParams {
    id: number;
  }

  export interface RoleUpdateStatusParams {
    id: number;
    status: number;
  }
}

/** 角色列表；兼容 { list, total }（真实后端）/ { items, total }（Mock）/ 数组 */
export async function getRoleListApi(params: RoleApi.RoleListParams) {
  const data = await requestClient.get<any>('/system/role/list', { params });
  if (Array.isArray(data)) {
    return { list: data as RoleApi.RoleItem[], total: data.length };
  }
  const list: RoleApi.RoleItem[] = data?.list ?? data?.items ?? [];
  return { list, total: (data?.total as number) ?? list.length };
}

/** 创建角色 POST /api/system/role/create */
export async function createRoleApi(data: RoleApi.RoleCreateParams) {
  return requestClient.post<unknown>('/system/role/create', data);
}

/** 更新角色 POST /api/system/role/update */
export async function updateRoleApi(data: RoleApi.RoleUpdateParams) {
  return requestClient.post<unknown>('/system/role/update', data);
}

/** 删除角色 POST /api/system/role/delete */
export async function deleteRoleApi(id: number) {
  return requestClient.post<unknown>('/system/role/delete', { id });
}

/** 启用/禁用角色 POST /api/system/role/updateStatus */
export async function updateRoleStatusApi(
  data: RoleApi.RoleUpdateStatusParams,
) {
  return requestClient.post<unknown>('/system/role/updateStatus', data);
}

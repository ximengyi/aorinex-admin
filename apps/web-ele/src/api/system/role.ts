/**
 * 系统管理 - 角色接口
 * 后端 RESTful: /api/system/roles
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

/** 角色列表 GET /api/system/roles */
export async function getRoleListApi(params: RoleApi.RoleListParams) {
  const data = await requestClient.get<any>('/system/roles', { params });
  if (Array.isArray(data)) {
    return { list: data as RoleApi.RoleItem[], total: data.length };
  }
  const list: RoleApi.RoleItem[] = data?.list ?? data?.items ?? [];
  return { list, total: (data?.total as number) ?? list.length };
}

/** 创建角色 POST /api/system/roles */
export async function createRoleApi(data: RoleApi.RoleCreateParams) {
  return requestClient.post<unknown>('/system/roles', data);
}

/** 更新角色 PUT /api/system/roles/{id} */
export async function updateRoleApi(data: RoleApi.RoleUpdateParams) {
  const { id, ...body } = data;
  return requestClient.put<unknown>(`/system/roles/${id}`, body);
}

/** 删除角色 DELETE /api/system/roles/{id} */
export async function deleteRoleApi(id: number) {
  return requestClient.delete<unknown>(`/system/roles/${id}`);
}

/** 启用/禁用角色 PATCH /api/system/roles/{id} */
export async function updateRoleStatusApi(
  data: RoleApi.RoleUpdateStatusParams,
) {
  const { id, status } = data;
  return requestClient.request<unknown>(`/system/roles/${id}`, {
    data: { status },
    method: 'PATCH',
  });
}

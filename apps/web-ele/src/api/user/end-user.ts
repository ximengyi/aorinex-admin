/**
 * 用户管理（C 端用户表 user）
 * 后端 RESTful: /api/system/c-users ，字段 snake_case，统一 { code, msg, data }
 */
import { requestClient } from '#/api/request';

export namespace EndUserApi {
  export interface EndUserItem {
    id: number;
    mobile: string;
    email?: string | null;
    nickname: string;
    avatar?: string;
    gender: number;
    birthday?: string | null;
    /** 1 正常 2 禁用 */
    status: number;
    register_source?: string;
    last_login_at?: string | null;
    last_login_ip?: string;
    created_at?: string;
    updated_at?: string;
  }

  export interface EndUserListParams {
    page?: number;
    per_page?: number;
    /** 手机号 / 昵称 / 邮箱等模糊匹配 */
    keyword?: string;
    /** 1 正常 2 禁用 */
    status?: string;
    created_start?: string;
    created_end?: string;
  }

  export interface EndUserListResult {
    list: EndUserItem[];
    total?: number;
  }

  export interface EndUserCreateParams {
    mobile: string;
    password?: string;
    nickname?: string;
    email?: string;
    avatar?: string;
    gender?: number;
    birthday?: string | null;
    status?: number;
    register_source?: string;
  }

  export interface EndUserUpdateParams {
    id: number;
    mobile?: string;
    password?: string;
    nickname?: string;
    email?: string;
    avatar?: string;
    gender?: number;
    birthday?: string | null;
    status?: number;
    register_source?: string;
  }

  export interface EndUserUpdateStatusParams {
    id: number;
    /** 1 正常 2 禁用 */
    status: number;
  }
}

function normalizeListPayload(data: any): EndUserApi.EndUserListResult {
  if (Array.isArray(data)) {
    return { list: data as EndUserApi.EndUserItem[], total: data.length };
  }
  const list: EndUserApi.EndUserItem[] = data?.list ?? data?.items ?? [];
  const total =
    typeof data?.total === 'number'
      ? data.total
      : typeof data?.pagination?.total === 'number'
        ? data.pagination.total
        : list.length;
  return { list, total };
}

/** 列表 GET /api/system/c-users */
export async function getEndUserListApi(params: EndUserApi.EndUserListParams) {
  const data = await requestClient.get<any>('/system/c-users', { params });
  return normalizeListPayload(data);
}

/** 详情 GET /api/system/c-users/{id} */
export async function getEndUserDetailApi(id: number) {
  return requestClient.get<EndUserApi.EndUserItem>(`/system/c-users/${id}`);
}

/** 创建 POST /api/system/c-users */
export async function createEndUserApi(data: EndUserApi.EndUserCreateParams) {
  return requestClient.post<unknown>('/system/c-users', data);
}

/** 更新 PUT /api/system/c-users/{id} */
export async function updateEndUserApi(data: EndUserApi.EndUserUpdateParams) {
  const { id, ...body } = data;
  return requestClient.put<unknown>(`/system/c-users/${id}`, body);
}

/** 启用/禁用 PATCH /api/system/c-users/{id} */
export async function updateEndUserStatusApi(data: EndUserApi.EndUserUpdateStatusParams) {
  const { id, status } = data;
  return requestClient.request<unknown>(`/system/c-users/${id}`, {
    data: { status },
    method: 'PATCH',
  });
}

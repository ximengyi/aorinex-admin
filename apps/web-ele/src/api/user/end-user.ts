/**
 * C 端用户 end_users
 * 约定：GET/POST {{base_url}}/api/user/end_user/* ，请求/响应字段 snake_case，统一 { code, msg, data }
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
    mobile?: string;
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

/** 列表 GET /api/user/end_user/list */
export async function getEndUserListApi(params: EndUserApi.EndUserListParams) {
  const data = await requestClient.get<any>('/user/end_user/list', { params });
  if (Array.isArray(data)) {
    return { list: data as EndUserApi.EndUserItem[], total: data.length };
  }
  const list: EndUserApi.EndUserItem[] = data?.list ?? data?.items ?? [];
  return { list, total: (data?.total as number) ?? list.length };
}

/** 详情 GET /api/user/end_user/detail */
export async function getEndUserDetailApi(id: number) {
  return requestClient.get<EndUserApi.EndUserItem>('/user/end_user/detail', {
    params: { id },
  });
}

/** 创建 POST /api/user/end_user/create */
export async function createEndUserApi(data: EndUserApi.EndUserCreateParams) {
  return requestClient.post<unknown>('/user/end_user/create', data);
}

/** 更新 POST /api/user/end_user/update */
export async function updateEndUserApi(data: EndUserApi.EndUserUpdateParams) {
  return requestClient.post<unknown>('/user/end_user/update', data);
}

/** 启用/禁用 POST /api/user/end_user/updateStatus */
export async function updateEndUserStatusApi(data: EndUserApi.EndUserUpdateStatusParams) {
  return requestClient.post<unknown>('/user/end_user/updateStatus', data);
}

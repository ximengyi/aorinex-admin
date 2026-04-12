/**
 * 系统管理 - 权限规则接口
 * 后端: GET/POST {{base_url}}/api/system/rule/*
 */
import { requestClient } from '#/api/request';

export namespace RuleApi {
  /** 列表项与 ax_rules 对齐；简述字段后端为 icon */
  export interface RuleItem {
    id: number;
    title: string;
    summary?: string;
    icon?: string;
    pid: number;
    href?: string;
    path?: string;
    frontend_path?: string;
    api_path?: string;
    access_code?: string;
    type?: number;
    weight?: number;
    status?: number;
    created_at?: string;
    updated_at?: string;
  }

  export interface RuleListParams {
    page?: number;
    per_page?: number;
    pid?: string;
  }

  export interface RuleListResult {
    list: RuleItem[];
    total?: number;
  }

  export interface RuleUpdateParams {
    id: number;
    title?: string;
    summary?: string;
    pid?: number;
    href?: string;
    path?: string;
    frontend_path?: string;
    api_path?: string;
    access_code?: string;
    type?: number;
    weight?: number;
  }

  export type RuleCreateParams = Omit<RuleUpdateParams, 'id'> & { title: string };
}

/** 权限规则列表；兼容 { list, total }（真实后端）/ { items, total }（Mock）/ 数组 */
export async function getRuleListApi(params: RuleApi.RuleListParams) {
  const data = await requestClient.get<any>('/system/rule/list', { params });
  if (Array.isArray(data)) {
    return { list: data as RuleApi.RuleItem[], total: data.length };
  }
  const list: RuleApi.RuleItem[] = data?.list ?? data?.items ?? [];
  const total =
    (data?.pagination?.total as number) ?? (data?.total as number) ?? list.length;
  return { list, total };
}

/** 新建权限规则 POST /api/system/rule/create */
export async function createRuleApi(data: RuleApi.RuleCreateParams) {
  return requestClient.post<unknown>('/system/rule/create', data);
}

/** 更新权限规则 POST /api/system/rule/update */
export async function updateRuleApi(data: RuleApi.RuleUpdateParams) {
  return requestClient.post<unknown>('/system/rule/update', data);
}

/** 删除权限规则 POST /api/system/rule/delete */
export async function deleteRuleApi(id: number) {
  return requestClient.post<unknown>('/system/rule/delete', { id });
}

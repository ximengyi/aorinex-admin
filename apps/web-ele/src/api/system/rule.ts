/**
 * 系统管理 - 权限规则接口
 * 后端 RESTful: /api/system/rules
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
    frontend_path?: string;
    api_path?: string;
    access_code?: string;
    type?: number;
    weight?: number;
  }

  export type RuleCreateParams = Omit<RuleUpdateParams, 'id'> & { title: string };
}

/** 权限规则列表 GET /api/system/rules */
export async function getRuleListApi(params: RuleApi.RuleListParams) {
  const data = await requestClient.get<any>('/system/rules', { params });
  if (Array.isArray(data)) {
    return { list: data as RuleApi.RuleItem[], total: data.length };
  }
  const list: RuleApi.RuleItem[] = data?.list ?? data?.items ?? [];
  const total =
    (data?.pagination?.total as number) ?? (data?.total as number) ?? list.length;
  return { list, total };
}

/** 级联选项节点 */
export interface RuleCascaderOption {
  value: number;
  label: string;
  children?: RuleCascaderOption[];
}

/**
 * 将扁平权限规则按 pid 组装为级联树（供角色关联权限使用）
 */
export function buildRuleCascaderOptions(
  list: RuleApi.RuleItem[],
): RuleCascaderOption[] {
  const nodeMap = new Map<number, RuleCascaderOption>();
  for (const item of list) {
    nodeMap.set(item.id, {
      value: item.id,
      label: item.title,
      children: [],
    });
  }

  const roots: RuleCascaderOption[] = [];
  for (const item of list) {
    const node = nodeMap.get(item.id);
    if (!node) continue;
    const parent = item.pid > 0 ? nodeMap.get(item.pid) : undefined;
    if (parent) {
      parent.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  const pruneEmptyChildren = (nodes: RuleCascaderOption[]) => {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        pruneEmptyChildren(node.children);
      } else {
        delete node.children;
      }
    }
  };
  pruneEmptyChildren(roots);
  return roots;
}

/** 拉取全部权限规则并转为级联树 */
export async function getRuleCascaderOptionsApi(): Promise<RuleCascaderOption[]> {
  const { list } = await getRuleListApi({ per_page: 2000 });
  return buildRuleCascaderOptions(list);
}

/** 解析角色上的权限 ID（兼容 rule_ids 数组与 rules 逗号串） */
export function normalizeRoleRuleIds(row: {
  rule_ids?: number[] | string[];
  rules?: string;
}): number[] {
  if (Array.isArray(row.rule_ids) && row.rule_ids.length > 0) {
    return row.rule_ids.map(Number).filter((id) => id > 0);
  }
  const rules = row.rules;
  if (!rules || rules === '*') {
    return [];
  }
  return rules
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((id) => id > 0);
}

/** 新建权限规则 POST /api/system/rules */
export async function createRuleApi(data: RuleApi.RuleCreateParams) {
  return requestClient.post<unknown>('/system/rules', data);
}

/** 更新权限规则 PUT /api/system/rules/{id} */
export async function updateRuleApi(data: RuleApi.RuleUpdateParams) {
  const { id, ...body } = data;
  return requestClient.put<unknown>(`/system/rules/${id}`, body);
}

/** 删除权限规则 DELETE /api/system/rules/{id} */
export async function deleteRuleApi(id: number) {
  return requestClient.delete<unknown>(`/system/rules/${id}`);
}

/**
 * 系统管理相关权限码，需与页面 v-access:code、后端权限规则 href 一致。
 * 与 apps/backend-mock/utils/mock-data.ts 中 SYSTEM_ALL_CODES（含 user:end_user*）保持同步。
 */
export const SYSTEM_MANAGEMENT_ACCESS_CODES = [
  'system:admin',
  'system:admin:create',
  'system:admin:edit',
  'system:admin:updateStatus',
  'system:admin:resetPwd',
  'system:role',
  'system:role:create',
  'system:role:edit',
  'system:role:delete',
  'system:rule',
  'system:menu',
  'system:menu:create',
  'system:menu:edit',
  'system:menu:delete',
  'user:end_user',
  'user:end_user:create',
  'user:end_user:edit',
  'user:end_user:detail',
  'user:end_user:disable',
] as const;

/** 当 /auth/codes 为空时，仍应拥有系统管理按钮权限的角色（与 mock 用户角色对齐，可按业务扩展） */
export const ROLES_WITH_FULL_SYSTEM_CODES_WHEN_CODES_EMPTY = ['super', 'admin'] as const;

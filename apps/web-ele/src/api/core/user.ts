import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 将后端蛇形字段转为 Vben BasicUserInfo 驼峰字段（后端 aorinex-backend formatUserInfoForAdmin 曾用 snake_case）
 */
function normalizeUserInfoPayload(raw: Record<string, unknown>): UserInfo {
  const userId = raw.userId ?? raw.user_id;
  const realName = raw.realName ?? raw.real_name ?? raw.name;
  const homePath = raw.homePath ?? raw.home_path;
  return {
    userId: userId != null ? String(userId) : '',
    username: String(raw.username ?? ''),
    realName: String(realName ?? ''),
    avatar: String(raw.avatar ?? ''),
    roles: Array.isArray(raw.roles) ? (raw.roles as string[]) : [],
    homePath: String(homePath ?? ''),
    email: String(raw.email ?? ''),
    mobile: String(raw.mobile ?? ''),
    desc: String(raw.desc ?? ''),
    token: String(raw.token ?? ''),
  };
}

/**
 * 获取用户信息
 * GET /api/auth/me
 */
export async function getUserInfoApi() {
  const raw = await requestClient.get<Record<string, unknown>>('/auth/me');
  return normalizeUserInfoPayload(raw);
}

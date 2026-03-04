import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 账号密码登录参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 手机验证码登录参数 */
  export interface LoginByCodeParams {
    mobile: string;
    code: string;
  }

  /** 后端返回：data.token */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 统一映射登录响应：兼容两种字段名
 *   - Mock server / 部分后端：data.accessToken
 *   - 真实后端：          data.token
 */
function mapLoginResult(raw: { accessToken?: string; token?: string }): AuthApi.LoginResult {
  return { accessToken: raw?.accessToken ?? raw?.token ?? '' };
}

/**
 * 账号密码登录
 * POST /api/auth/login
 */
export async function loginApi(data: AuthApi.LoginParams) {
  const res = await requestClient.post<{ accessToken?: string; token?: string }>('/auth/login', data);
  return mapLoginResult(res as unknown as { accessToken?: string; token?: string });
}

/**
 * 手机号+验证码登录
 * POST /api/auth/loginByCode
 */
export async function loginByCodeApi(data: AuthApi.LoginByCodeParams) {
  const res = await requestClient.post<{ accessToken?: string; token?: string }>(
    '/auth/loginByCode',
    data,
  );
  return mapLoginResult(res as unknown as { accessToken?: string; token?: string });
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 * POST /api/auth/logout，需携带 Authorization
 */
export async function logoutApi() {
  return requestClient.post<unknown>('/auth/logout', {});
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}

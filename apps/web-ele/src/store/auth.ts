import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import {
  getAccessCodesApi,
  getUserInfoApi,
  loginApi,
  loginByCodeApi,
  logoutApi,
} from '#/api';
import {
  ROLES_WITH_FULL_SYSTEM_CODES_WHEN_CODES_EMPTY,
  SYSTEM_MANAGEMENT_ACCESS_CODES,
} from '#/constants/system-access-codes';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /** 使用 accessToken 完成后续流程（写 store、拉用户信息、跳转） */
  async function afterLoginSuccess(
    accessToken: string,
    onSuccess?: () => Promise<void> | void,
  ) {
    const accessStore = useAccessStore();
    accessStore.setAccessToken(accessToken);
    const [fetchUserInfoResult, accessCodes] = await Promise.all([
      fetchUserInfo(),
      getAccessCodesApi(),
    ]);
    const userInfo = fetchUserInfoResult;
    userStore.setUserInfo(userInfo);
    /** 后端未返回权限码时，super/admin 角色使用内置系统管理码，避免按钮被 v-access 全部移除 */
    const roles = userInfo?.roles ?? [];
    const shouldUseFallback =
      accessCodes.length === 0 &&
      roles.some((r) =>
        (ROLES_WITH_FULL_SYSTEM_CODES_WHEN_CODES_EMPTY as readonly string[]).includes(r),
      );
    accessStore.setAccessCodes(
      shouldUseFallback ? [...SYSTEM_MANAGEMENT_ACCESS_CODES] : accessCodes,
    );
    try {
      const { getSiteSettingsApi } = await import('#/api/system/settings');
      const { applySiteSettingsToPreferences } = await import(
        '#/utils/site-settings'
      );
      const siteSettings = await getSiteSettingsApi();
      await applySiteSettingsToPreferences(siteSettings);
    } catch {
      // 站点设置拉取失败不阻断登录
    }
    if (accessStore.loginExpired) {
      accessStore.setLoginExpired(false);
    } else {
      onSuccess
        ? await onSuccess?.()
        : await router.push(
            userInfo?.homePath || preferences.app.defaultHomePath,
          );
    }
    if (userInfo?.realName) {
      ElNotification({
        message: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
        title: $t('authentication.loginSuccess'),
        type: 'success',
      });
    }
    return { userInfo };
  }

  /**
   * 异步处理登录操作（账号密码）
   * @param params 登录表单数据 { username, password }
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { accessToken } = await loginApi(params);
      if (accessToken) {
        const result = await afterLoginSuccess(accessToken, onSuccess);
        userInfo = result.userInfo ?? null;
      }
    } finally {
      loginLoading.value = false;
    }
    return { userInfo };
  }

  /**
   * 手机号+验证码登录
   * @param params { mobile, code }
   */
  async function authLoginByCode(
    params: { mobile: string; code: string },
    onSuccess?: () => Promise<void> | void,
  ) {
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { accessToken } = await loginByCodeApi(params);
      if (accessToken) {
        const result = await afterLoginSuccess(accessToken, onSuccess);
        userInfo = result.userInfo ?? null;
      }
    } finally {
      loginLoading.value = false;
    }
    return { userInfo };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: null | UserInfo = null;
    userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    authLoginByCode,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});

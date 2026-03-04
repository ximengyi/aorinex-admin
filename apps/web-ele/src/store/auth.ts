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
    accessStore.setAccessCodes(accessCodes);
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

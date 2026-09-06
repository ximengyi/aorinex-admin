import type { BasicUserInfo } from '@vben-core/typings';

/** 用户信息 */
interface UserInfo extends BasicUserInfo {
  /**
   * 用户描述
   */
  desc: string;
  /**
   * 邮箱
   */
  email?: string;
  /**
   * 首页地址
   */
  homePath: string;
  /**
   * 手机号
   */
  mobile?: string;
  /**
   * accessToken
   */
  token: string;
}

export type { UserInfo };

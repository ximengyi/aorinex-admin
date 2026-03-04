/**
 * 权限控制组合函数（基于 @vben/access）
 *
 * 使用示例：
 *   const { hasCode } = useAccess()
 *   // 在脚本中判断是否有权限
 *   if (hasCode('system:admin:create')) { ... }
 *
 *   // 在模板中使用 v-access:code 指令
 *   <ElButton v-access:code="'system:admin:create'">新建</ElButton>
 *   <ElButton v-access:code="['system:admin:edit', 'system:admin:create']">编辑</ElButton>
 *
 * 说明：
 *   - 权限码来自后端接口 GET /api/auth/codes，用户登录时自动拉取并存入 accessStore
 *   - 对应后端权限规则表的 href 字段，管理员可在「权限规则」页面维护
 */
import { useAccess as _useAccess } from '@vben/access';

export function useAccess() {
  const { hasAccessByCodes, hasAccessByRoles, accessMode } = _useAccess();

  /**
   * 判断是否拥有指定权限码（一个或多个，满足其一即可）
   */
  function hasCode(codes: string | string[]) {
    const list = Array.isArray(codes) ? codes : [codes];
    return hasAccessByCodes(list);
  }

  /**
   * 判断是否拥有指定角色（一个或多个，满足其一即可）
   */
  function hasRole(roles: string | string[]) {
    const list = Array.isArray(roles) ? roles : [roles];
    return hasAccessByRoles(list);
  }

  return { accessMode, hasCode, hasRole };
}

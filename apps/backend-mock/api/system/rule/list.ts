import { eventHandler, getQuery } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

const mockRules = [
  { id: 1, title: '系统管理', summary: '系统管理模块', pid: 0, href: 'system', type: 0, weight: 1 },
  { id: 2, title: '账号管理', summary: '账号管理', pid: 1, href: 'system:admin', type: 1, weight: 1 },
  { id: 3, title: '新建账号', summary: '', pid: 2, href: 'system:admin:create', type: 2, weight: 1 },
  { id: 4, title: '编辑账号', summary: '', pid: 2, href: 'system:admin:edit', type: 2, weight: 2 },
  { id: 5, title: '重置密码', summary: '', pid: 2, href: 'system:admin:resetPwd', type: 2, weight: 3 },
  { id: 6, title: '角色管理', summary: '角色管理', pid: 1, href: 'system:role', type: 1, weight: 2 },
  { id: 7, title: '新建角色', summary: '', pid: 6, href: 'system:role:create', type: 2, weight: 1 },
  { id: 8, title: '编辑角色', summary: '', pid: 6, href: 'system:role:edit', type: 2, weight: 2 },
  { id: 9, title: '删除角色', summary: '', pid: 6, href: 'system:role:delete', type: 2, weight: 3 },
  { id: 10, title: '权限规则', summary: '权限规则管理', pid: 1, href: 'system:rule', type: 1, weight: 3 },
  { id: 11, title: '菜单管理', summary: '菜单管理', pid: 1, href: 'system:menu', type: 1, weight: 4 },
  { id: 12, title: '新建菜单', summary: '', pid: 11, href: 'system:menu:create', type: 2, weight: 1 },
  { id: 13, title: '编辑菜单', summary: '', pid: 11, href: 'system:menu:edit', type: 2, weight: 2 },
  { id: 14, title: '删除菜单', summary: '', pid: 11, href: 'system:menu:delete', type: 2, weight: 3 },
  { id: 15, title: '用户管理', summary: 'C 端等业务用户', pid: 0, href: 'user', type: 0, weight: 2 },
  { id: 16, title: 'C 端用户', summary: 'end_users', pid: 15, href: 'user:end_user', type: 1, weight: 1 },
  { id: 17, title: '新建用户', summary: '', pid: 16, href: 'user:end_user:create', type: 2, weight: 1 },
  { id: 18, title: '编辑用户', summary: '', pid: 16, href: 'user:end_user:edit', type: 2, weight: 2 },
  { id: 19, title: '查看详情', summary: '', pid: 16, href: 'user:end_user:detail', type: 2, weight: 3 },
  { id: 20, title: '禁用用户', summary: '', pid: 16, href: 'user:end_user:disable', type: 2, weight: 4 },
];

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const { pid } = getQuery(event);
  let list = mockRules;
  if (pid !== undefined) {
    list = list.filter((r) => r.pid === Number(pid));
  }

  return useResponseSuccess({ list, total: list.length });
});

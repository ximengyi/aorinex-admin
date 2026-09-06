import { eventHandler } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '~/utils/response';

/** 系统菜单管理的 mock 树形数据 */
const SYSTEM_MENU_TREE = [
  {
    id: 1,
    title: '仪表盘',
    icon: 'lucide:layout-dashboard',
    path: '/dashboard',
    pid: 0,
    type: 0,
    weight: 1,
    children: [
      {
        id: 11,
        title: '分析页',
        icon: 'lucide:bar-chart-2',
        path: '/dashboard/analytics',
        pid: 1,
        type: 1,
        weight: 1,
        children: [],
      },
      {
        id: 12,
        title: '工作台',
        icon: 'lucide:monitor',
        path: '/dashboard/workspace',
        pid: 1,
        type: 1,
        weight: 2,
        children: [],
      },
    ],
  },
  {
    id: 2,
    title: '系统管理',
    icon: 'lucide:settings',
    path: '/system',
    pid: 0,
    type: 0,
    weight: 2,
    children: [
      {
        id: 21,
        title: '账号管理',
        icon: 'lucide:users',
        path: '/system/admin',
        pid: 2,
        type: 1,
        weight: 1,
        children: [
          { id: 211, title: '新建账号', icon: '', path: '', pid: 21, type: 2, weight: 1, children: [] },
          { id: 212, title: '编辑账号', icon: '', path: '', pid: 21, type: 2, weight: 2, children: [] },
          { id: 213, title: '重置密码', icon: '', path: '', pid: 21, type: 2, weight: 3, children: [] },
        ],
      },
      {
        id: 22,
        title: '角色管理',
        icon: 'lucide:shield',
        path: '/system/role',
        pid: 2,
        type: 1,
        weight: 2,
        children: [
          { id: 221, title: '新建角色', icon: '', path: '', pid: 22, type: 2, weight: 1, children: [] },
          { id: 222, title: '编辑角色', icon: '', path: '', pid: 22, type: 2, weight: 2, children: [] },
          { id: 223, title: '删除角色', icon: '', path: '', pid: 22, type: 2, weight: 3, children: [] },
        ],
      },
      {
        id: 23,
        title: '权限规则',
        icon: 'lucide:key',
        path: '/system/rule',
        pid: 2,
        type: 1,
        weight: 3,
        children: [],
      },
      {
        id: 24,
        title: '菜单管理',
        icon: 'lucide:list',
        path: '/system/menu',
        pid: 2,
        type: 1,
        weight: 4,
        children: [
          { id: 241, title: '新建菜单', icon: '', path: '', pid: 24, type: 2, weight: 1, children: [] },
          { id: 242, title: '编辑菜单', icon: '', path: '', pid: 24, type: 2, weight: 2, children: [] },
          { id: 243, title: '删除菜单', icon: '', path: '', pid: 24, type: 2, weight: 3, children: [] },
        ],
      },
    ],
  },
  {
    id: 4,
    title: '用户中心',
    icon: 'lucide:user-circle',
    path: '/user',
    pid: 0,
    type: 0,
    weight: 1,
    children: [
      {
        id: 41,
        title: '用户管理',
        icon: 'lucide:smartphone',
        path: '/user/end-user',
        pid: 4,
        type: 1,
        weight: 1,
        children: [
          { id: 411, title: '新建用户', icon: '', path: '', pid: 41, type: 2, weight: 1, children: [] },
          { id: 412, title: '编辑用户', icon: '', path: '', pid: 41, type: 2, weight: 2, children: [] },
          { id: 413, title: '查看详情', icon: '', path: '', pid: 41, type: 2, weight: 3, children: [] },
          { id: 414, title: '禁用用户', icon: '', path: '', pid: 41, type: 2, weight: 4, children: [] },
        ],
      },
    ],
  },
];

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  return useResponseSuccess(SYSTEM_MENU_TREE);
});

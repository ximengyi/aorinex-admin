import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:settings',
      order: 10,
      title: $t('page.system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        name: 'SystemAdmin',
        path: '/system/admin',
        component: () => import('#/views/system/admin/index.vue'),
        meta: {
          icon: 'lucide:users',
          title: $t('page.system.admin'),
        },
      },
      {
        name: 'SystemRole',
        path: '/system/role',
        component: () => import('#/views/system/role/index.vue'),
        meta: {
          icon: 'lucide:user-cog',
          title: $t('page.system.role'),
        },
      },
      {
        name: 'SystemMenu',
        path: '/system/menu',
        component: () => import('#/views/system/menu/index.vue'),
        meta: {
          icon: 'lucide:menu',
          title: $t('page.system.menu'),
        },
      },
    ],
  },
];

export default routes;

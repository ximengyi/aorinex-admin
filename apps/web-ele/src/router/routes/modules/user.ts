import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:user-circle',
      order: 8,
      title: $t('page.user.title'),
    },
    name: 'User',
    path: '/user',
    children: [
      {
        name: 'UserEndUser',
        path: '/user/end-user',
        component: () => import('#/views/user/end-user/index.vue'),
        meta: {
          icon: 'lucide:smartphone',
          title: $t('page.user.endUser'),
        },
      },
    ],
  },
];

export default routes;

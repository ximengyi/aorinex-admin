<script lang="ts" setup>
import type { RuleApi } from '#/api/system/rule';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getRuleListApi } from '#/api/system/rule';

defineOptions({ name: 'SystemRule' });

const gridOptions: VxeGridProps<RuleApi.RuleItem> = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'title', title: '标题', width: 140 },
    {
      field: 'icon',
      title: '简述',
      width: 100,
      formatter: ({ row }) => (row as RuleApi.RuleItem).summary || (row as RuleApi.RuleItem).icon || '-',
    },
    { field: 'frontend_path', title: '前端路由', minWidth: 120 },
    { field: 'api_path', title: '接口前缀', minWidth: 120 },
    { field: 'access_code', title: '权限码', minWidth: 130 },
    { field: 'type', title: '类型', width: 80 },
    { field: 'weight', title: '排序', width: 80 },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        const { list, total } = await getRuleListApi({
          page: page.currentPage,
          per_page: page.pageSize,
        });
        return { result: list, page: { total } };
      },
    },
    response: { result: 'result', total: 'page.total' },
  },
  rowConfig: { keyField: 'id' },
  toolbarConfig: { refresh: true, zoom: true },
};

const [Grid] = useVbenVxeGrid({ gridOptions });
</script>

<template>
  <Page auto-content-height title="权限规则">
    <Grid table-title="规则列表" />
  </Page>
</template>

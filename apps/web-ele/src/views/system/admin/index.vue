<script lang="ts" setup>
import type { AdminApi } from '#/api/system/admin';
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ElButton, ElMessage, ElMessageBox, ElSwitch } from 'element-plus';

import { useAccess } from '#/composables/use-access';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getAdminListApi,
  resetAdminPasswordApi,
  updateAdminStatusApi,
} from '#/api/system/admin';

import AdminForm from './modules/form.vue';

defineOptions({ name: 'SystemAdmin' });

const editData = ref<Partial<AdminApi.AdminItem>>({});
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  destroyOnClose: true,
  onOpenChange(isOpen) {
    if (isOpen) editData.value = (formDrawerApi as any).getData() ?? {};
  },
});

const formOptions = {
  schema: [
    { component: 'Input', fieldName: 'username', label: '账号' },
    { component: 'Input', fieldName: 'mobile', label: '手机号' },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        clearable: true,
        options: [
          { label: '正常', value: '0' },
          { label: '禁用', value: '1' },
        ],
      },
    },
  ] as VbenFormSchema[],
};

const gridOptions: VxeGridProps<AdminApi.AdminItem> = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'username', title: '账号', width: 120 },
    { field: 'name', title: '姓名', width: 100 },
    { field: 'mobile', title: '手机号', width: 130 },
    { field: 'email', title: '邮箱', minWidth: 160 },
    { field: 'department', title: '部门', width: 100 },
    { field: 'status', title: '状态', width: 90, slots: { default: 'statusSlot' } },
    { field: 'operation', title: '操作', width: 180, fixed: 'right', slots: { default: 'operation' } },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        const { list, total } = await getAdminListApi({
          page: page.currentPage,
          per_page: page.pageSize,
          ...formValues,
        });
        return { result: list, page: { total } };
      },
    },
    response: { result: 'result', total: 'page.total' },
  },
  rowConfig: { keyField: 'id' },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });
const { hasCode } = useAccess();

function onRefresh() {
  gridApi.query();
}

function onFormSuccess() {
  formDrawerApi.close();
  onRefresh();
}

function onCreate() {
  (formDrawerApi as any).setData({}).open();
}

function openEdit(row: AdminApi.AdminItem) {
  (formDrawerApi as any).setData({ ...row }).open();
}

/** 切换启用/禁用状态 */
async function toggleStatus(row: AdminApi.AdminItem) {
  const newStatus = row.status === 0 ? 1 : 0;
  const label = newStatus === 0 ? '启用' : '禁用';
  try {
    await ElMessageBox.confirm(
      `确定要${label}账号「${row.username}」吗？`,
      `${label}账号`,
      { cancelButtonText: '取消', confirmButtonText: '确定', type: 'warning' },
    );
    await updateAdminStatusApi({ id: row.id, status: newStatus });
    row.status = newStatus;
    ElMessage.success(`${label}成功`);
  } catch {
    // 用户取消，不做处理
  }
}

function onAction(code: string, row: AdminApi.AdminItem) {
  if (code === 'edit') {
    openEdit(row);
  } else if (code === 'resetPwd') {
    ElMessageBox.confirm(
      `确定要重置「${row.username}」的密码为系统默认密码吗？`,
      '重置密码',
      { cancelButtonText: '取消', confirmButtonText: '确定', type: 'warning' },
    )
      .then(() => resetAdminPasswordApi(row.id))
      .then(() => { ElMessage.success('重置成功'); })
      .catch(() => {});
  }
}
</script>

<template>
  <Page auto-content-height title="账号管理">
    <FormDrawer :title="editData.id ? '编辑账号' : '新建账号'">
      <AdminForm
        :drawer-api="formDrawerApi as any"
        :initial-data="editData"
        @success="onFormSuccess"
      />
    </FormDrawer>
    <Grid table-title="账号列表">
      <!-- 状态列：用 ElSwitch 展示 + 快速切换 -->
      <template #statusSlot="{ row }">
        <ElSwitch
          :model-value="row.status === 0"
          inactive-text="禁用"
          @change="toggleStatus(row)"
        />
      </template>

      <template #operation="{ row }">
        <ElButton link type="primary" @click="onAction('edit', row)">编辑</ElButton>
        <ElButton link type="danger" @click="onAction('resetPwd', row)">重置密码</ElButton>
      </template>

      <template #toolbar-tools>
        <ElButton type="primary" @click="onCreate">
          <Plus class="size-5" />
          新建账号
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>

<script lang="ts" setup>
import type { EndUserApi } from '#/api/user/end-user';
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import {
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElMessage,
  ElMessageBox,
  ElSwitch,
  ElTag,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getEndUserDetailApi,
  getEndUserListApi,
  updateEndUserStatusApi,
} from '#/api/user/end-user';

import EndUserForm from './modules/form.vue';

defineOptions({ name: 'UserEndUser' });

const editData = ref<Partial<EndUserApi.EndUserItem>>({});
const detailData = ref<EndUserApi.EndUserItem | null>(null);

const [FormModal, formModalApi] = useVbenModal({
  centered: true,
  class: 'w-[560px]',
  destroyOnClose: true,
  footer: false,
  onOpenChange(isOpen) {
    if (isOpen) editData.value = (formModalApi as any).getData() ?? {};
  },
});

const [DetailModal, detailModalApi] = useVbenModal({
  centered: true,
  class: 'w-[560px]',
  destroyOnClose: true,
  footer: false,
});

function genderLabel(g: number) {
  if (g === 1) return '男';
  if (g === 2) return '女';
  return '未知';
}

const formOptions = {
  schema: [
    {
      component: 'Input',
      fieldName: 'keyword',
      label: '关键词',
      componentProps: {
        placeholder: '手机号、昵称、邮箱',
        clearable: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: '状态',
      componentProps: {
        clearable: true,
        options: [
          { label: '正常', value: '1' },
          { label: '禁用', value: '2' },
        ],
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'created_start',
      label: '注册时间起',
      componentProps: { type: 'date', valueFormat: 'YYYY-MM-DD', class: 'w-full' },
    },
    {
      component: 'DatePicker',
      fieldName: 'created_end',
      label: '注册时间止',
      componentProps: { type: 'date', valueFormat: 'YYYY-MM-DD', class: 'w-full' },
    },
  ] as VbenFormSchema[],
};

const gridOptions: VxeGridProps<EndUserApi.EndUserItem> = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'mobile', title: '手机号', width: 130 },
    { field: 'nickname', title: '昵称', width: 120 },
    {
      field: 'gender',
      title: '性别',
      width: 72,
      formatter: ({ cellValue }) => genderLabel(Number(cellValue)),
    },
    {
      field: 'status',
      title: '状态',
      width: 88,
      slots: { default: 'statusSlot' },
    },
    { field: 'register_source', title: '注册来源', width: 110 },
    { field: 'last_login_at', title: '最后登录', minWidth: 160 },
    { field: 'last_login_ip', title: '登录 IP', width: 130 },
    { field: 'created_at', title: '创建时间', minWidth: 160 },
    {
      field: 'operation',
      title: '操作',
      width: 220,
      fixed: 'right',
      slots: { default: 'operation' },
    },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        const { list, total } = await getEndUserListApi({
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

function onRefresh() {
  gridApi.query();
}

function onFormSuccess() {
  formModalApi.close();
  onRefresh();
}

function onCreate() {
  (formModalApi as any).setData({}).open();
}

function openEdit(row: EndUserApi.EndUserItem) {
  (formModalApi as any).setData({ ...row }).open();
}

async function openDetail(row: EndUserApi.EndUserItem) {
  detailModalApi.open();
  detailData.value = null;
  try {
    detailData.value = await getEndUserDetailApi(row.id);
  } catch {
    detailModalApi.close();
  }
}

async function toggleStatus(row: EndUserApi.EndUserItem) {
  const newStatus = row.status === 1 ? 2 : 1;
  const label = newStatus === 1 ? '启用' : '禁用';
  try {
    await ElMessageBox.confirm(
      `确定要${label}用户「${row.mobile}」吗？`,
      `${label}账号`,
      { cancelButtonText: '取消', confirmButtonText: '确定', type: 'warning' },
    );
    await updateEndUserStatusApi({ id: row.id, status: newStatus });
    row.status = newStatus;
    ElMessage.success(`${label}成功`);
  } catch {
    /* 取消 */
  }
}

async function disableFromDetail() {
  const row = detailData.value;
  if (!row) return;
  try {
    await ElMessageBox.confirm(`确定要禁用用户「${row.mobile}」吗？`, '禁用账号', {
      cancelButtonText: '取消',
      confirmButtonText: '确定',
      type: 'warning',
    });
    await updateEndUserStatusApi({ id: row.id, status: 2 });
    row.status = 2;
    ElMessage.success('已禁用');
    onRefresh();
  } catch {
    /* 取消 */
  }
}
</script>

<template>
  <Page auto-content-height :title="$t('page.user.endUser')">
    <FormModal :title="editData.id ? '编辑用户' : '新建用户'">
      <EndUserForm
        :modal-api="formModalApi as any"
        :initial-data="editData"
        @success="onFormSuccess"
      />
    </FormModal>

    <DetailModal title="用户详情">
      <div v-if="detailData" class="flex flex-col gap-4">
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="ID">{{ detailData.id }}</ElDescriptionsItem>
          <ElDescriptionsItem label="手机号">{{ detailData.mobile }}</ElDescriptionsItem>
          <ElDescriptionsItem label="昵称">{{ detailData.nickname }}</ElDescriptionsItem>
          <ElDescriptionsItem label="邮箱">{{ detailData.email || '—' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="头像">
            <span class="break-all">{{ detailData.avatar || '—' }}</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="性别">{{ genderLabel(detailData.gender) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="生日">{{ detailData.birthday || '—' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="状态">
            <ElTag :type="detailData.status === 1 ? 'success' : 'danger'">
              {{ detailData.status === 1 ? '正常' : '禁用' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="注册来源">{{ detailData.register_source || '—' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="最后登录时间">{{ detailData.last_login_at || '—' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="最后登录 IP">{{ detailData.last_login_ip || '—' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间">{{ detailData.created_at || '—' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间">{{ detailData.updated_at || '—' }}</ElDescriptionsItem>
        </ElDescriptions>
        <div v-if="detailData.status === 1" class="flex justify-end">
          <ElButton v-access:code="'user:end_user:disable'" type="danger" @click="disableFromDetail">
            禁用
          </ElButton>
        </div>
      </div>
    </DetailModal>

    <Grid table-title="用户列表">
      <template #statusSlot="{ row }">
        <ElSwitch
          :model-value="row.status === 1"
          inactive-text="禁用"
          @change="toggleStatus(row)"
        />
      </template>

      <template #operation="{ row }">
        <ElButton v-access:code="'user:end_user:detail'" link type="primary" @click="openDetail(row)">
          详情
        </ElButton>
        <ElButton v-access:code="'user:end_user:edit'" link type="primary" @click="openEdit(row)">
          编辑
        </ElButton>
      </template>

      <template #toolbar-tools>
        <ElButton v-access:code="'user:end_user:create'" type="primary" @click="onCreate">
          <Plus class="size-5" />
          新建用户
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>

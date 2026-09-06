<script lang="ts" setup>
import type { MenuApi } from '#/api/system/menu';
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';

import { ElButton, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createMenuApi,
  deleteMenuApi,
  getMenuTreeApi,
  updateMenuApi,
} from '#/api/system/menu';
import { useVbenForm as useForm } from '#/adapter/form';

defineOptions({ name: 'SystemMenu' });

/* =================== 表单 =================== */
const isEdit = ref(false);
const editId = ref<number>();

/**
 * 由前端路由推导接口前缀 / 权限码：
 *   /system/menu → api_path=/api/system，access_code=system:menu
 * 仅在目标字段为空，或仍等于上次自动值时回填，避免覆盖手改。
 */
function deriveFromFrontendPath(frontendPath: string) {
  const normalized = frontendPath.trim().replace(/\/+$/, '');
  if (!normalized.startsWith('/')) {
    return { apiPath: '', accessCode: '' };
  }
  const segments = normalized.split('/').filter(Boolean);
  if (segments.length === 0) {
    return { apiPath: '', accessCode: '' };
  }
  return {
    apiPath: `/api/${segments[0]}`,
    accessCode: segments.join(':'),
  };
}

/** null = 已手改锁定，不再跟随路由自动更新 */
const lastAutoApiPath = ref<null | string>('');
const lastAutoAccessCode = ref<null | string>('');

function syncDerivedFromRoute(
  values: Record<string, any>,
  form: { setFieldValue: (field: string, value: unknown) => void },
) {
  const frontendPath = String(values.frontend_path ?? '').trim();
  if (!frontendPath) return;

  const derived = deriveFromFrontendPath(frontendPath);
  if (!derived.apiPath && !derived.accessCode) return;

  const currentApi = String(values.api_path ?? '').trim();
  if (
    lastAutoApiPath.value !== null &&
    (!currentApi || currentApi === lastAutoApiPath.value)
  ) {
    lastAutoApiPath.value = derived.apiPath;
    form.setFieldValue('api_path', derived.apiPath);
  }

  const currentCode = String(values.access_code ?? '').trim();
  if (
    lastAutoAccessCode.value !== null &&
    (!currentCode || currentCode === lastAutoAccessCode.value)
  ) {
    lastAutoAccessCode.value = derived.accessCode;
    form.setFieldValue('access_code', derived.accessCode);
  }
}

function resetAutoFillTracking(row?: Pick<MenuApi.MenuItem, 'frontend_path' | 'path' | 'api_path' | 'access_code'>) {
  if (!row) {
    lastAutoApiPath.value = '';
    lastAutoAccessCode.value = '';
    return;
  }
  const derived = deriveFromFrontendPath(
    String(row.frontend_path || row.path || ''),
  );
  const api = String(row.api_path ?? '').trim();
  const code = String(row.access_code ?? '').trim();
  // 与推导值一致（或为空）则继续跟随；否则视为手改锁定
  lastAutoApiPath.value =
    !api || api === derived.apiPath ? api || derived.apiPath : null;
  lastAutoAccessCode.value =
    !code || code === derived.accessCode ? code || derived.accessCode : null;
}

const formSchema: VbenFormSchema[] = [
  { component: 'Input', fieldName: 'title', label: '菜单标题', rules: 'required' },
  { component: 'IconPicker', fieldName: 'icon', label: '图标' },
  {
    component: 'Input',
    fieldName: 'frontend_path',
    label: '路由路径',
    componentProps: {
      placeholder: '如 /system/menu，失焦后自动推导接口前缀与权限码',
    },
    dependencies: {
      trigger(values, form) {
        syncDerivedFromRoute(values, form);
      },
      triggerFields: ['frontend_path'],
    },
  },
  {
    component: 'Input',
    fieldName: 'api_path',
    label: '接口前缀',
    componentProps: { placeholder: '如 /api/system，可由路由自动推导' },
    dependencies: {
      // 手改后锁定，避免继续被路由覆盖
      trigger(values) {
        const current = String(values.api_path ?? '').trim();
        if (
          lastAutoApiPath.value !== null &&
          current &&
          current !== lastAutoApiPath.value
        ) {
          lastAutoApiPath.value = null;
        }
      },
      triggerFields: ['api_path'],
    },
  },
  {
    component: 'Input',
    fieldName: 'access_code',
    label: '权限码',
    componentProps: { placeholder: '如 system:menu，可由路由自动推导' },
    dependencies: {
      trigger(values) {
        const current = String(values.access_code ?? '').trim();
        if (
          lastAutoAccessCode.value !== null &&
          current &&
          current !== lastAutoAccessCode.value
        ) {
          lastAutoAccessCode.value = null;
        }
      },
      triggerFields: ['access_code'],
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'pid',
    label: '父级 ID（0为根）',
    defaultValue: 0,
    componentProps: { min: 0 },
  },
  {
    component: 'Select',
    fieldName: 'type',
    label: '类型',
    defaultValue: 0,
    componentProps: {
      options: [
        { label: '目录', value: 0 },
        { label: '菜单', value: 1 },
        { label: '按钮', value: 2 },
      ],
    },
  },
  {
    component: 'InputNumber',
    fieldName: 'weight',
    label: '排序权重',
    defaultValue: 0,
    componentProps: { min: 0 },
  },
];

const [Form, formApi] = useForm({ schema: formSchema, showDefaultActions: false });

const [Modal, modalApi] = useVbenModal({
  centered: true,
  class: 'w-[560px]',
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    modalApi.lock();
    try {
      if (isEdit.value && editId.value) {
        await updateMenuApi({ id: editId.value, ...values } as MenuApi.MenuUpdateParams);
        ElMessage.success('保存成功');
      } else {
        await createMenuApi(values as MenuApi.MenuCreateParams);
        ElMessage.success('创建成功');
      }
      gridApi.query();
      modalApi.close();
    } finally {
      modalApi.unlock();
    }
  },
});

function openCreate() {
  isEdit.value = false;
  editId.value = undefined;
  resetAutoFillTracking();
  formApi.resetForm();
  modalApi.open();
}

function openEdit(row: MenuApi.MenuItem) {
  isEdit.value = true;
  editId.value = row.id;
  resetAutoFillTracking(row);
  formApi.setValues(row as any);
  modalApi.open();
}

async function handleDelete(row: MenuApi.MenuItem) {
  await ElMessageBox.confirm(`确定删除菜单「${row.title}」吗？`, '删除确认', {
    type: 'warning',
    cancelButtonText: '取消',
    confirmButtonText: '删除',
  });
  await deleteMenuApi(row.id);
  ElMessage.success('删除成功');
  gridApi.query();
}

/* =================== 表格 =================== */
const TYPE_MAP: Record<number, string> = { 0: '目录', 1: '菜单', 2: '按钮' };

const gridOptions: VxeGridProps<MenuApi.MenuItem> = {
  columns: [
    { field: 'id', title: 'ID', width: 70 },
    {
      field: 'title',
      title: '标题',
      minWidth: 200,
      treeNode: true,
      slots: { default: 'titleSlot' },
    },
    { field: 'frontend_path', title: '路由路径', minWidth: 140 },
    { field: 'api_path', title: '接口前缀', minWidth: 120 },
    { field: 'access_code', title: '权限码', minWidth: 140 },
    {
      field: 'type',
      title: '类型',
      width: 80,
      formatter: ({ cellValue }) => TYPE_MAP[cellValue as number] ?? '-',
    },
    { field: 'weight', title: '排序', width: 60 },
    { field: 'operation', title: '操作', width: 140, fixed: 'right', slots: { default: 'operation' } },
  ],
  height: 'auto',
  keepSource: true,
  /** 树形菜单禁用分页 */
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: async () => {
        const data = await getMenuTreeApi({ status: 0 });
        /** 直接返回嵌套树，treeConfig.transform:false 时 vxe-table 按 children 渲染 */
        return Array.isArray(data) ? data : [];
      },
    },
  },
  rowConfig: { keyField: 'id' },
  /** 树形配置：children 字段已在数据中，无需 transform */
  treeConfig: {
    rowField: 'id',
    parentField: 'pid',
    childrenField: 'children',
    transform: false,
    expandAll: true,
  },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
</script>

<template>
  <Page auto-content-height title="菜单管理">
    <Modal :title="isEdit ? '编辑菜单' : '新建菜单'">
      <Form />
    </Modal>
    <Grid table-title="菜单列表">
      <!-- 标题列：图标 + 文字合并展示 -->
      <template #titleSlot="{ row }">
        <div class="flex items-center gap-2">
          <IconifyIcon
            v-if="row.icon"
            :icon="row.icon"
            class="size-4 flex-shrink-0 text-primary"
          />
          <span>{{ row.title }}</span>
        </div>
      </template>

      <template #operation="{ row }">
        <ElButton v-access:code="'system:menu:edit'" link type="primary" @click="openEdit(row)">编辑</ElButton>
        <ElButton v-access:code="'system:menu:delete'" link type="danger" @click="handleDelete(row)">删除</ElButton>
      </template>
      <template #toolbar-tools>
        <ElButton v-access:code="'system:menu:create'" type="primary" @click="openCreate">
          <Plus class="size-5" />
          新建菜单
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>

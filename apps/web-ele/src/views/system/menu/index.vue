<script lang="ts" setup>
import type { MenuApi } from '#/api/system/menu';
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
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

const formSchema: VbenFormSchema[] = [
  { component: 'Input', fieldName: 'title', label: '菜单标题', rules: 'required' },
  { component: 'IconPicker', fieldName: 'icon', label: '图标' },
  { component: 'Input', fieldName: 'path', label: '路由路径' },
  {
    component: 'Input',
    fieldName: 'api_path',
    label: '接口前缀',
    componentProps: { placeholder: '如 /api/system，供后端鉴权前缀匹配' },
  },
  {
    component: 'Input',
    fieldName: 'access_code',
    label: '权限码',
    componentProps: { placeholder: '如 system:menu:edit，供 v-access 与 /auth/codes' },
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

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      if (isEdit.value && editId.value) {
        await updateMenuApi({ id: editId.value, ...values } as MenuApi.MenuUpdateParams);
        ElMessage.success('保存成功');
      } else {
        await createMenuApi(values as MenuApi.MenuCreateParams);
        ElMessage.success('创建成功');
      }
      gridApi.query();
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
});

function openCreate() {
  isEdit.value = false;
  editId.value = undefined;
  formApi.resetForm();
  drawerApi.open();
}

function openEdit(row: MenuApi.MenuItem) {
  isEdit.value = true;
  editId.value = row.id;
  formApi.setValues(row as any);
  drawerApi.open();
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
    { field: 'path', title: '路由路径', minWidth: 140 },
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
    <Drawer :title="isEdit ? '编辑菜单' : '新建菜单'">
      <Form />
    </Drawer>
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

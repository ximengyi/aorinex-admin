<script lang="ts" setup>
import type { MenuApi } from '#/api/system/menu';
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

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
  { component: 'Input', fieldName: 'icon', label: '图标（lucide:xxx）' },
  { component: 'Input', fieldName: 'path', label: '路由路径' },
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
/** 递归展开树结构为平铺列表，供表格展示 */
function flattenTree(list: MenuApi.MenuItem[]): MenuApi.MenuItem[] {
  return list.flatMap((item) => [
    item,
    ...(item.children ? flattenTree(item.children) : []),
  ]);
}

const gridOptions: VxeGridProps<MenuApi.MenuItem> = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'title', title: '标题', minWidth: 140 },
    { field: 'icon', title: '图标', width: 120 },
    { field: 'path', title: '路由路径', minWidth: 160 },
    { field: 'pid', title: '父级ID', width: 80 },
    { field: 'type', title: '类型(0目录/1菜单/2按钮)', width: 80 },
    { field: 'weight', title: '排序', width: 70 },
    { field: 'operation', title: '操作', width: 160, fixed: 'right', slots: { default: 'operation' } },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async () => {
        const data = await getMenuTreeApi({ status: 0 });
        const list = flattenTree(Array.isArray(data) ? data : []);
        return { result: list, page: { total: list.length } };
      },
    },
    response: { result: 'result', total: 'page.total' },
  },
  rowConfig: { keyField: 'id' },
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
      <template #operation="{ row }">
        <ElButton v-access:code="'system:menu:edit'" link size="small" type="primary" @click="openEdit(row)">编辑</ElButton>
        <ElButton v-access:code="'system:menu:delete'" link size="small" type="danger" @click="handleDelete(row)">删除</ElButton>
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

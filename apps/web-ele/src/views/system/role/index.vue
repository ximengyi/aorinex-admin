<script lang="ts" setup>
import type { RoleApi } from '#/api/system/role';
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { ElButton, ElMessage, ElMessageBox, ElSwitch } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createRoleApi,
  deleteRoleApi,
  getRoleListApi,
  updateRoleApi,
  updateRoleStatusApi,
} from '#/api/system/role';
import {
  getRuleCascaderOptionsApi,
  normalizeRoleRuleIds,
} from '#/api/system/rule';
import { useVbenForm as useForm } from '#/adapter/form';

defineOptions({ name: 'SystemRole' });

/* =================== 新建 / 编辑 Modal =================== */
const isEdit = ref(false);
const editId = ref<number>();

const formSchema: VbenFormSchema[] = [
  { component: 'Input', fieldName: 'name', label: '角色名称', rules: 'required' },
  { component: 'Input', fieldName: 'summary', label: '描述' },
  {
    component: 'ApiCascader',
    fieldName: 'rule_ids',
    label: '关联权限',
    componentProps: {
      api: getRuleCascaderOptionsApi,
      clearable: true,
      filterable: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      showAllLevels: false,
      class: 'w-full',
      props: {
        multiple: true,
        checkStrictly: true,
        emitPath: false,
        expandTrigger: 'hover',
        value: 'value',
        label: 'label',
        children: 'children',
      },
    },
  },
];

const [Form, formApi] = useForm({ schema: formSchema, showDefaultActions: false });

const [Modal, modalApi] = useVbenModal({
  centered: true,
  class: 'w-[640px]',
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const ruleIds = Array.isArray(values.rule_ids)
      ? values.rule_ids.map(Number).filter((id: number) => id > 0)
      : [];
    modalApi.lock();
    try {
      if (isEdit.value && editId.value) {
        await updateRoleApi({
          id: editId.value,
          ...values,
          rule_ids: ruleIds,
        } as RoleApi.RoleUpdateParams);
        ElMessage.success('保存成功');
      } else {
        await createRoleApi({
          ...values,
          rule_ids: ruleIds,
        } as RoleApi.RoleCreateParams);
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
  formApi.resetForm();
  formApi.setValues({ rule_ids: [] });
  modalApi.open();
}

function openEdit(row: RoleApi.RoleItem) {
  isEdit.value = true;
  editId.value = row.id;
  formApi.setValues({
    ...row,
    rule_ids: normalizeRoleRuleIds(row),
  } as any);
  modalApi.open();
}

async function handleDelete(row: RoleApi.RoleItem) {
  await ElMessageBox.confirm(`确定删除角色「${row.name}」吗？`, '删除确认', {
    type: 'warning',
    cancelButtonText: '取消',
    confirmButtonText: '删除',
  });
  await deleteRoleApi(row.id);
  ElMessage.success('删除成功');
  gridApi.query();
}

/* =================== 表格 =================== */
const gridOptions: VxeGridProps<RoleApi.RoleItem> = {
  columns: [
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: '角色名称', minWidth: 140 },
    { field: 'summary', title: '描述', minWidth: 160 },
    {
      field: 'status',
      title: '状态',
      width: 100,
      slots: { default: 'statusSlot' },
    },
    { field: 'operation', title: '操作', width: 160, fixed: 'right', slots: { default: 'operation' } },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        const { list, total } = await getRoleListApi({
          page: page.currentPage,
          per_page: page.pageSize,
        });
        return { result: list, page: { total } };
      },
    },
    response: { result: 'result', total: 'page.total' },
  },
  rowConfig: { keyField: 'id' },
  toolbarConfig: { custom: true, refresh: true, zoom: true },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

async function toggleStatus(row: RoleApi.RoleItem) {
  const newStatus = row.status === 0 ? 1 : 0;
  await updateRoleStatusApi({ id: row.id, status: newStatus });
  row.status = newStatus;
}
</script>

<template>
  <Page auto-content-height title="角色管理">
    <Modal :title="isEdit ? '编辑角色' : '新建角色'">
      <Form />
    </Modal>
    <Grid table-title="角色列表">
      <template #statusSlot="{ row }">
        <ElSwitch
          :model-value="row.status === 0"
          inactive-text="禁用"
          @change="() => toggleStatus(row)"
        />
      </template>
      <template #operation="{ row }">
        <ElButton v-access:code="'system:role:edit'" link type="primary" @click="openEdit(row)">编辑</ElButton>
        <ElButton v-access:code="'system:role:delete'" link type="danger" @click="handleDelete(row)">删除</ElButton>
      </template>
      <template #toolbar-tools>
        <ElButton v-access:code="'system:role:create'" type="primary" @click="openCreate">
          <Plus class="size-5" />
          新建角色
        </ElButton>
      </template>
    </Grid>
  </Page>
</template>

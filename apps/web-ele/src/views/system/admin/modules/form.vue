<script lang="ts" setup>
import type { AdminApi } from '#/api/system/admin';
import type { VbenFormSchema } from '#/adapter/form';
import type { Recordable } from '@vben/types';

import { watch } from 'vue';

import { ElButton, ElMessage } from 'element-plus';

import { useVbenForm as useForm } from '#/adapter/form';
import { createAdminApi, updateAdminApi } from '#/api/system/admin';
import { getRoleListApi } from '#/api/system/role';

const props = defineProps<{
  drawerApi?: { close: () => void; lock: () => void; unlock: () => void };
  initialData?: Partial<AdminApi.AdminItem> | Record<string, never>;
}>();

const emit = defineEmits<{ success: [] }>();

/** 静态 schema，通过 formApi 动态更新各字段状态 */
const formSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'username',
    label: '账号',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'password',
    label: '初始密码',
    rules: 'required',
    componentProps: { type: 'password', showPassword: true },
  },
  { component: 'Input', fieldName: 'name', label: '姓名' },
  { component: 'Input', fieldName: 'mobile', label: '手机号' },
  { component: 'Input', fieldName: 'email', label: '邮箱' },
  { component: 'Input', fieldName: 'department', label: '部门' },
  {
    component: 'Select',
    fieldName: 'status',
    label: '状态',
    defaultValue: 0,
    componentProps: {
      options: [
        { label: '正常', value: 0 },
        { label: '禁用', value: 1 },
      ],
    },
  },
  {
    component: 'ApiSelect',
    fieldName: 'role_ids',
    label: '角色',
    componentProps: {
      api: async () => {
        const { list } = await getRoleListApi({ per_page: 200 });
        return list.map((r) => ({ label: r.name, value: r.id }));
      },
      mode: 'multiple',
    },
  },
];

const [Form, formApi] = useForm({ schema: formSchema, showDefaultActions: false });

watch(
  () => props.initialData,
  (data) => {
    const isEdit = !!(data as AdminApi.AdminItem)?.id;
    // 编辑时：隐藏密码字段、禁用账号字段；新建时：显示密码字段、启用账号字段
    formApi.updateSchema([
      { fieldName: 'username', componentProps: { disabled: isEdit } },
      { fieldName: 'password', rules: isEdit ? '' : 'required', hide: isEdit },
    ]);
    if (data && Object.keys(data).length) {
      formApi.setValues(data as Recordable<any>);
    } else {
      formApi.resetForm();
    }
  },
  { immediate: true },
);

async function handleConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;
  const values = await formApi.getValues();
  const id = (props.initialData as AdminApi.AdminItem)?.id;
  props.drawerApi?.lock();
  try {
    if (id) {
      await updateAdminApi({ ...values, id } as AdminApi.AdminUpdateParams);
    } else {
      await createAdminApi(values as AdminApi.AdminCreateParams);
    }
    ElMessage.success(id ? '保存成功' : '创建成功');
    emit('success');
    props.drawerApi?.close();
  } finally {
    props.drawerApi?.unlock();
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <Form />
    <div class="flex justify-end gap-2">
      <ElButton @click="drawerApi?.close()">取消</ElButton>
      <ElButton type="primary" @click="handleConfirm">
        {{ (initialData as AdminApi.AdminItem)?.id ? '保存' : '创建' }}
      </ElButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { EndUserApi } from '#/api/user/end-user';
import type { VbenFormSchema } from '#/adapter/form';
import type { Recordable } from '@vben/types';

import { watch } from 'vue';

import { ElButton, ElMessage } from 'element-plus';

import { useVbenForm as useForm } from '#/adapter/form';
import { createEndUserApi, updateEndUserApi } from '#/api/user/end-user';

const props = defineProps<{
  drawerApi?: { close: () => void; lock: () => void; unlock: () => void };
  initialData?: Partial<EndUserApi.EndUserItem> | Record<string, never>;
}>();

const emit = defineEmits<{ success: [] }>();

const formSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'mobile',
    label: '手机号',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'password',
    label: '密码',
    componentProps: { type: 'password', showPassword: true },
  },
  { component: 'Input', fieldName: 'nickname', label: '昵称' },
  { component: 'Input', fieldName: 'email', label: '邮箱' },
  { component: 'Input', fieldName: 'avatar', label: '头像 URL' },
  {
    component: 'Select',
    fieldName: 'gender',
    label: '性别',
    defaultValue: 0,
    componentProps: {
      options: [
        { label: '未知', value: 0 },
        { label: '男', value: 1 },
        { label: '女', value: 2 },
      ],
    },
  },
  {
    component: 'DatePicker',
    fieldName: 'birthday',
    label: '生日',
    componentProps: {
      type: 'date',
      valueFormat: 'YYYY-MM-DD',
      class: 'w-full',
    },
  },
  {
    component: 'Select',
    fieldName: 'status',
    label: '状态',
    defaultValue: 1,
    componentProps: {
      options: [
        { label: '正常', value: 1 },
        { label: '禁用', value: 2 },
      ],
    },
  },
  { component: 'Input', fieldName: 'register_source', label: '注册来源' },
];

const [Form, formApi] = useForm({ schema: formSchema, showDefaultActions: false });

watch(
  () => props.initialData,
  (data) => {
    const isEdit = !!(data as EndUserApi.EndUserItem)?.id;
    formApi.updateSchema([
      { fieldName: 'mobile', componentProps: { disabled: isEdit } },
      { fieldName: 'password', rules: '' },
    ]);
    if (data && Object.keys(data).length) {
      const row = { ...data } as Recordable<any>;
      if (isEdit) {
        row.password = '';
      }
      formApi.setValues(row);
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
  const id = (props.initialData as EndUserApi.EndUserItem)?.id;
  props.drawerApi?.lock();
  try {
    if (id) {
      const payload: EndUserApi.EndUserUpdateParams = { ...values, id };
      if (!payload.password) {
        delete (payload as Recordable).password;
      } else if (String(payload.password).length < 6) {
        ElMessage.warning('密码至少 6 位');
        return;
      }
      await updateEndUserApi(payload);
    } else {
      if (!values.password) {
        ElMessage.warning('请填写初始密码');
        return;
      }
      if (String(values.password).length < 6) {
        ElMessage.warning('密码至少 6 位');
        return;
      }
      await createEndUserApi(values as EndUserApi.EndUserCreateParams);
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
        {{ (initialData as EndUserApi.EndUserItem)?.id ? '保存' : '创建' }}
      </ElButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { UploadRequestOptions } from 'element-plus';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { preferences } from '@vben/preferences';

import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElUpload,
} from 'element-plus';

import {
  getSiteSettingsApi,
  updateSiteSettingsApi,
  uploadSiteLogoApi,
} from '#/api/system/settings';
import {
  applySiteSettingsToPreferences,
  resolvePublicAssetUrl,
} from '#/utils/site-settings';

defineOptions({ name: 'SystemSettings' });

const loading = ref(false);
const saving = ref(false);
const appName = ref('');
const logoUrl = ref('');

const previewSrc = computed(() => {
  return resolvePublicAssetUrl(logoUrl.value) || preferences.logo.source;
});

async function loadSettings() {
  loading.value = true;
  try {
    const data = await getSiteSettingsApi();
    appName.value = data?.app_name || preferences.app.name || '';
    logoUrl.value = data?.logo_url || '';
    await applySiteSettingsToPreferences({
      app_name: appName.value,
      logo_url: logoUrl.value,
    });
  } catch {
    appName.value = preferences.app.name || '';
  } finally {
    loading.value = false;
  }
}

async function customUpload(options: UploadRequestOptions) {
  const file = options.file as File;
  try {
    const data = await uploadSiteLogoApi(file);
    logoUrl.value = data?.logo_url || '';
    await applySiteSettingsToPreferences({
      app_name: appName.value,
      logo_url: logoUrl.value,
    });
    ElMessage.success('Logo 上传成功');
    options.onSuccess?.(data as any);
  } catch (error) {
    options.onError?.(error as any);
  }
}

async function handleSave() {
  saving.value = true;
  try {
    const data = await updateSiteSettingsApi({
      app_name: appName.value.trim(),
      logo_url: logoUrl.value,
    });
    appName.value = data?.app_name ?? appName.value;
    logoUrl.value = data?.logo_url ?? logoUrl.value;
    await applySiteSettingsToPreferences({
      app_name: appName.value,
      logo_url: logoUrl.value,
    });
    ElMessage.success('保存成功');
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadSettings();
});
</script>

<template>
  <Page auto-content-height title="系统设置">
    <ElCard v-loading="loading" shadow="never" class="max-w-2xl">
      <ElForm label-width="100px">
        <ElFormItem label="站点名称">
          <ElInput
            v-model="appName"
            maxlength="100"
            placeholder="显示在侧栏与登录页的标题"
            clearable
          />
        </ElFormItem>

        <ElFormItem label="站点 Logo">
          <div class="flex flex-col gap-4">
            <div
              class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30"
            >
              <img
                v-if="previewSrc"
                :src="previewSrc"
                alt="logo preview"
                class="max-h-full max-w-full object-contain"
              />
              <span v-else class="text-muted-foreground text-xs">暂无</span>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <ElUpload
                :show-file-list="false"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                :http-request="customUpload"
              >
                <ElButton v-access:code="'system:settings:edit'" type="primary">
                  上传 Logo
                </ElButton>
              </ElUpload>
              <span class="text-muted-foreground text-xs">
                支持 png / jpg / webp / gif / svg，不超过 2MB
              </span>
            </div>
          </div>
        </ElFormItem>

        <ElFormItem>
          <ElButton
            v-access:code="'system:settings:edit'"
            type="primary"
            :loading="saving"
            @click="handleSave"
          >
            保存设置
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </Page>
</template>

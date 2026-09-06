<script lang="ts" setup>
import type { RuleCascaderOption } from '#/api/system/rule';

import { computed, onMounted, ref } from 'vue';

import { ChevronRight } from '@vben/icons';

import { ElCheckbox, ElScrollbar } from 'element-plus';

import { getRuleCascaderOptionsApi } from '#/api/system/rule';

defineOptions({ name: 'RolePermissionPanel' });

const modelValue = defineModel<number[]>({ default: () => [] });

const tree = ref<RuleCascaderOption[]>([]);
const loading = ref(false);
/** 当前悬停展开的路径（从根到当前层） */
const hoverPath = ref<RuleCascaderOption[]>([]);

const selectedSet = computed(() => new Set(modelValue.value ?? []));

const moduleCount = computed(() => {
  let count = 0;
  const walk = (nodes: RuleCascaderOption[]) => {
    for (const node of nodes) {
      const hasChildren = !!(node.children && node.children.length > 0);
      if (hasChildren && selectedSet.value.has(node.value)) count += 1;
      if (hasChildren) walk(node.children!);
    }
  };
  walk(tree.value);
  return count;
});

const permissionCount = computed(() => {
  let count = 0;
  const walk = (nodes: RuleCascaderOption[]) => {
    for (const node of nodes) {
      const hasChildren = !!(node.children && node.children.length > 0);
      if (!hasChildren && selectedSet.value.has(node.value)) count += 1;
      if (hasChildren) walk(node.children!);
    }
  };
  walk(tree.value);
  return count;
});

onMounted(async () => {
  loading.value = true;
  try {
    tree.value = await getRuleCascaderOptionsApi();
  } finally {
    loading.value = false;
  }
});

function hasChildren(node: RuleCascaderOption) {
  return !!(node.children && node.children.length > 0);
}

function isChecked(id: number) {
  return selectedSet.value.has(id);
}

function toggle(id: number, checked: boolean) {
  const next = new Set(modelValue.value ?? []);
  if (checked) next.add(id);
  else next.delete(id);
  modelValue.value = [...next];
}

function onEnterLevel(node: RuleCascaderOption, level: number) {
  if (!hasChildren(node)) {
    hoverPath.value = hoverPath.value.slice(0, level);
    return;
  }
  hoverPath.value = [...hoverPath.value.slice(0, level), node];
}

function onLeavePanel() {
  hoverPath.value = [];
}

function panelNodes(level: number): RuleCascaderOption[] {
  if (level === 0) return tree.value;
  return hoverPath.value[level - 1]?.children ?? [];
}

function isPanelVisible(level: number) {
  return level === 0 || hoverPath.value.length >= level;
}
</script>

<template>
  <div class="permission-panel" v-loading="loading" @mouseleave="onLeavePanel">
    <div class="mb-3 flex items-center justify-between">
      <span class="text-foreground text-sm font-medium">权限配置</span>
      <span class="text-muted-foreground text-xs">
        已选择
        <span class="text-primary mx-0.5 font-medium">{{ moduleCount }}</span>
        个功能模块，
        <span class="text-primary mx-0.5 font-medium">{{ permissionCount }}</span>
        个权限项
      </span>
    </div>

    <div class="permission-panel__body relative flex gap-2">
      <!-- 一级默认展示；二级及更深级在悬停时出现 -->
      <div
        v-for="level in hoverPath.length + 1"
        :key="level - 1"
        v-show="isPanelVisible(level - 1)"
        class="permission-panel__column"
        :class="level === 1 ? 'permission-panel__column--root' : ''"
      >
        <ElScrollbar max-height="320px">
          <div class="flex flex-col gap-2 pr-1">
            <div
              v-for="node in panelNodes(level - 1)"
              :key="node.value"
              class="permission-panel__item"
              :class="{
                'permission-panel__item--active':
                  hoverPath[level - 1]?.value === node.value,
              }"
              @mouseenter="onEnterLevel(node, level - 1)"
            >
              <ElCheckbox
                :model-value="isChecked(node.value)"
                @update:model-value="(val: boolean | string | number) => toggle(node.value, !!val)"
                @click.stop
              />
              <span class="permission-panel__label" :title="node.label">
                {{ node.label }}
              </span>
              <ChevronRight
                v-if="hasChildren(node)"
                class="permission-panel__arrow size-4 shrink-0"
              />
            </div>
          </div>
        </ElScrollbar>
      </div>
    </div>
  </div>
</template>

<style scoped>
.permission-panel {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 12px;
  background: hsl(var(--background));
}

.permission-panel__body {
  align-items: flex-start;
}

.permission-panel__column {
  min-width: 220px;
  max-width: 280px;
  flex: 1;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 8px;
  background: hsl(var(--muted) / 0.35);
}

.permission-panel__column--root {
  flex: 1.2;
  max-width: none;
}

.permission-panel__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  cursor: default;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.permission-panel__item:hover,
.permission-panel__item--active {
  background: hsl(var(--accent));
  border-color: hsl(var(--primary) / 0.35);
}

.permission-panel__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: hsl(var(--foreground));
}

.permission-panel__arrow {
  color: hsl(var(--muted-foreground));
}
</style>

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

    <div class="permission-panel__body">
      <!-- 预留三级列宽，保证三级菜单始终可见 -->
      <div
        v-for="level in Math.max(hoverPath.length + 1, 3)"
        :key="level - 1"
        class="permission-panel__column"
        :class="{
          'permission-panel__column--empty':
            level > 1 && !isPanelVisible(level - 1),
        }"
      >
        <ElScrollbar height="480px">
          <div v-if="isPanelVisible(level - 1)" class="flex flex-col gap-1.5">
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
          <div
            v-else
            class="text-muted-foreground flex h-[480px] items-center justify-center px-2 text-center text-xs leading-5"
          >
            {{
              level === 2
                ? '悬停左侧带箭头项查看二级'
                : '悬停二级带箭头项查看三级'
            }}
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
  padding: 10px 12px;
  background: hsl(var(--background));
  min-height: 560px;
}

.permission-panel__body {
  display: flex;
  gap: 8px;
  align-items: stretch;
  min-height: 480px;
}

.permission-panel__column {
  flex: 1 1 0;
  min-width: 0;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 6px;
  background: hsl(var(--muted) / 0.35);
  height: 496px;
  box-sizing: border-box;
}

.permission-panel__column--empty {
  background: hsl(var(--muted) / 0.2);
}

.permission-panel__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 6px;
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

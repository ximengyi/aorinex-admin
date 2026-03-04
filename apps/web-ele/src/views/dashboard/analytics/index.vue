<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

import { onMounted, ref } from 'vue';

import {
  AnalysisChartCard,
  AnalysisChartsTabs,
  AnalysisOverview,
} from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';

import { getDashboardMetricsApi } from '#/api/dashboard';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisitsData from './analytics-visits-data.vue';
import AnalyticsVisitsSales from './analytics-visits-sales.vue';
import AnalyticsVisitsSource from './analytics-visits-source.vue';
import AnalyticsVisits from './analytics-visits.vue';

const overviewItems = ref<AnalysisOverviewItem[]>([
  {
    icon: SvgCardIcon,
    title: '用户量',
    totalTitle: '总用户量',
    totalValue: 0,
    value: 0,
  },
  {
    icon: SvgCakeIcon,
    title: '今日登录',
    totalTitle: '总登录次数',
    totalValue: 0,
    value: 0,
  },
  {
    icon: SvgDownloadIcon,
    title: '角色数',
    totalTitle: '总角色数',
    totalValue: 0,
    value: 0,
  },
  {
    icon: SvgBellIcon,
    title: '其他',
    totalTitle: '其他指标',
    totalValue: 0,
    value: 0,
  },
]);

/** 从后端拉取仪表盘指标并填充到 overviewItems */
async function loadMetrics() {
  try {
    const data = await getDashboardMetricsApi();
    if (!data) return;
    overviewItems.value = [
      {
        icon: SvgCardIcon,
        title: '用户量',
        totalTitle: '总用户量',
        totalValue: data.user_count ?? 0,
        value: data.user_count ?? 0,
      },
      {
        icon: SvgCakeIcon,
        title: '今日登录',
        totalTitle: '总登录次数',
        totalValue: data.total_login_count ?? 0,
        value: data.today_login_count ?? 0,
      },
      {
        icon: SvgDownloadIcon,
        title: '角色数',
        totalTitle: '总角色数',
        totalValue: data.role_count ?? 0,
        value: data.role_count ?? 0,
      },
      {
        icon: SvgBellIcon,
        title: '其他',
        totalTitle: '其他指标',
        totalValue: 0,
        value: 0,
      },
    ];
  } catch {
    // 接口暂时不可用时保持默认值
  }
}

onMounted(loadMetrics);

const chartTabs: TabOption[] = [
  {
    label: '流量趋势',
    value: 'trends',
  },
  {
    label: '月访问量',
    value: 'visits',
  },
];
</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems as any" />
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends />
      </template>
      <template #visits>
        <AnalyticsVisits />
      </template>
    </AnalysisChartsTabs>

    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问数量">
        <AnalyticsVisitsData />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSource />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSales />
      </AnalysisChartCard>
    </div>
  </div>
</template>

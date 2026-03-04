/**
 * 仪表盘接口
 * GET /api/dashboard/metrics
 */
import { requestClient } from '#/api/request';

export interface DashboardMetrics {
  user_count?: number;
  today_login_count?: number;
  total_login_count?: number;
  role_count?: number;
  /** 后端可能返回任意指标 */
  [key: string]: number | undefined;
}

export async function getDashboardMetricsApi() {
  return requestClient.get<DashboardMetrics>('/dashboard/metrics');
}

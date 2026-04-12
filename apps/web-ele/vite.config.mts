import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';
import { loadEnv } from 'vite';

export default defineConfig(async (config) => {
  const mode = config?.mode ?? 'development';
  const env = loadEnv(mode, process.cwd());
  /** dev 代理到真实后端，默认 dev 环境网关；可通过 .env.development 中 VITE_DEV_PROXY_TARGET 覆盖 */
  const proxyTarget =
    env.VITE_DEV_PROXY_TARGET || 'http://192.168.71.43:8787';

  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            // 保留 /api 前缀，与真实接口路径一致（如 /api/auth/login）
            target: proxyTarget,
            ws: true,
          },
        },
      },
    },
  };
});

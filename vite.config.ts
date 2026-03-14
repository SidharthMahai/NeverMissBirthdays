import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devAppsScriptUrl =
    env.VITE_DEV_APPS_SCRIPT_URL ||
    env.VITE_APPS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbzL0lKRpAGuWQNwKoqzWddnmgMOkb2AiRcAL-0owZxzd2tmtO9ow75-G2tFao_hOwG5_A/exec';

  let proxy: Record<string, unknown> | undefined;
  const parsed = new URL(devAppsScriptUrl);
  proxy = {
    '/api/birthdays': {
      target: `${parsed.protocol}//${parsed.host}`,
      changeOrigin: true,
      secure: true,
      rewrite: () => `${parsed.pathname}${parsed.search}`,
    },
  };

  return {
    plugins: [react()],
    server: {
      proxy,
    },
  };
});

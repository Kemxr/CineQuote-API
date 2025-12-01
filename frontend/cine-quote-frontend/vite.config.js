import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendHost = process.env.VITE_WS_HOST || env.VITE_WS_HOST || 'localhost'
  const backendPort = process.env.BACKEND_PORT || env.BACKEND_PORT || 3000

  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api/': {
          target: `http://${backendHost}:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Keep the OpenMRP API key on the dev server, never in browser code.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    ...(env.OPENMRP_API_KEY
      ? {
          server: {
            proxy: {
              '/api/openmrp': {
                target: 'https://api.openmrp.in',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/openmrp/, ''),
                headers: { 'X-Api-Key': env.OPENMRP_API_KEY },
              },
            },
          },
        }
      : {}),
  }
})

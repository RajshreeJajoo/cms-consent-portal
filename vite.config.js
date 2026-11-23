import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project Pages are served from /cms-consent-portal/. Local dev stays at /.
const base = process.env.GITHUB_PAGES === 'true' ? '/cms-consent-portal/' : '/'

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5173,
    host: true,
  },
})

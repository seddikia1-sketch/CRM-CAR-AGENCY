import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base نسبي يعمل مع GitHub Pages (HashRouter) ومع Capacitor للتطبيق الأصلي
export default defineConfig({
  plugins: [react()],
  base: './',
})

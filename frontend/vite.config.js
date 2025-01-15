import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: "./",
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['*.png'],
        injectRegister: 'auto',
        manifest: {
          name: 'Celebrity Face Detection',
          short_name: "CFD",
          description: "A celebrity face detection app",
          theme_color: "#ffffff",
          icons: [
            {
              src: 'web-app-manifest-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },

            {
              src: 'web-app-manifest-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            }
          ]
        }
      })
    ]
  }
})

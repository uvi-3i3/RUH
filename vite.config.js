import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'
import { env } from 'node:process'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'ruh-mark.svg', 'sw-notifications.js'],
      manifest: {
        id: '/',
        name: 'Ruh Spiritual Companion',
        short_name: 'Ruh',
        description: 'A serene spiritual companion and habit-forming app',
        theme_color: '#0a0908',
        background_color: '#0a0908',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/ruh-mark.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        importScripts: ['/sw-notifications.js'],
        cleanupOutdatedCaches: true,
        navigateFallback: null,
        globIgnores: ['**/*.wasm'],
        runtimeCaching: [
          {
            urlPattern: /\.wasm$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ruh-wasm-runtime-v1',
              expiration: {
                maxEntries: 8,
                maxAgeSeconds: 60 * 60 * 24 * 90,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    })
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    hmr: env.DISABLE_HMR !== 'true',
  },
  worker: {
    format: 'es',
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
})

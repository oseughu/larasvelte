import { svelte } from '@sveltejs/vite-plugin-svelte'
import laravel from 'laravel-vite-plugin'
import { resolve } from 'path'
import { defineConfig } from 'vite'

const projectRootDir = resolve(__dirname)

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.js'],
      ssr: 'resources/js/ssr.js',
      refresh: true
    }),
    svelte({})
  ],
  resolve: {
    alias: {
      '@': resolve(projectRootDir, 'resources'),
      $: resolve(projectRootDir, 'resources/js')
    },
    extensions: ['.svelte', '.svelte.js', '.js', '.json']
  }
})

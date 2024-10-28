import { svelte } from '@sveltejs/vite-plugin-svelte'
import laravel from 'laravel-vite-plugin'
import { resolve } from 'path'
import { defineConfig } from 'vite'

const projectRootDir = resolve(__dirname)

export default defineConfig({
  plugins: [
    laravel({
      input: 'resources/js/app.js',
      refresh: true
    }),
    svelte({})
  ],
  resolve: {
    alias: {
      '@': resolve(projectRootDir, 'resources/js'),
      '~': resolve(projectRootDir, 'resources')
    },
    extensions: ['.js', '.svelte', '.svelte.js', '.json']
  }
})

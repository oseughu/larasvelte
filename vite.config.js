import { svelte } from '@sveltejs/vite-plugin-svelte'
import laravel from 'laravel-vite-plugin'
import { defineConfig } from 'vite'
import { resolve } from 'path'

const projectRootDir = resolve(__dirname);

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true
        }),
        svelte()
    ],
    resolve: {
        alias: {
            '@': resolve(projectRootDir, 'resources/js'),
            '~': resolve(projectRootDir, 'resources')
        },
        extensions: ['.js', '.svelte', '.json']
    }
})

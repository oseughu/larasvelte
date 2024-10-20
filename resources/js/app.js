import { createInertiaApp } from '@inertiajs/svelte'
import './bootstrap'

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.svelte', { eager: true })
        return pages[`./Pages/${name}.svelte`]
    },
    setup({ el, App, props }) {
        new App({ target: el, props })
    }
})

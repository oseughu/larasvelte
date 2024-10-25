import { createInertiaApp } from '@inertiajs/svelte'
import { mount } from 'svelte'
import '../css/app.css'
import './bootstrap'

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.svelte', { eager: true })
    return pages[`./Pages/${name}.svelte`]
  },
  setup({ el, App, props }) {
    mount(App, { target: el, props })
  }
})

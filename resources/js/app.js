import { createInertiaApp } from '@inertiajs/svelte'
import { hydrate, mount } from 'svelte'
// import './bootstrap'

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.svelte', { eager: true })
    return pages[`./Pages/${name}.svelte`]
  },
  setup({ el, App, props }) {
    if (el.dataset.serverRendered === 'true') {
      hydrate(App, { target: el, props })
    } else {
      mount(App, { target: el, props })
    }
  }
})

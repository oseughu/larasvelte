<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { quintIn, quintOut } from 'svelte/easing'
  import { fade } from 'svelte/transition'

  export let show = false
  export let maxWidth = '2xl'
  export let closeable = true

  const dispatch = createEventDispatcher()

  $: if (show) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = null
  }

  function close() {
    if (closeable) {
      dispatch('close')
    }
  }

  function closeOnEscape(e) {
    if (e.key === 'Escape' && show) {
      close()
    }
  }

  onMount(() => {
    document.addEventListener('keydown', closeOnEscape)
  })

  onDestroy(() => {
    document.removeEventListener('keydown', closeOnEscape)
    document.body.style.overflow = null
  })

  // Reactive declaration for maxWidthClass
  $: maxWidthClass =
    {
      sm: 'sm:max-w-sm',
      md: 'sm:max-w-md',
      lg: 'sm:max-w-lg',
      xl: 'sm:max-w-xl',
      '2xl': 'sm:max-w-2xl'
    }[maxWidth] || ''

  function modalTransition(node, { delay = 0, duration = 300, easing = quintOut }) {
    return {
      delay,
      duration,
      easing,
      css: (t) => {
        const opacity = t
        const scale = 0.95 + 0.05 * t
        const y = 20 * (1 - t)
        return `opacity: ${opacity}; transform: translateY(${y}px) scale(${scale});`
      }
    }
  }
</script>

<!-- Import the Portal component -->
<svelte:window />

{#if show}
  <!-- Portal the modal to the body -->
  <div class="modal-portal">
    <div class="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:px-0" style="overflow-y:auto;">
      <!-- Overlay -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="fixed inset-0 transform transition-all"
        on:click={close}
        transition:fade={{ duration: 200, easing: quintIn }}
      >
        <div class="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900"></div>
      </div>

      <!-- Modal Content -->
      <div
        class="mb-6 transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:mx-auto sm:w-full dark:bg-gray-800 {maxWidthClass}"
        in:modalTransition
        out:modalTransition
      >
        <slot></slot>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-portal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
  }
</style>

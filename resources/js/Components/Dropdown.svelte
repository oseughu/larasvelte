<script>
  import { onDestroy, onMount } from 'svelte'
  import { cubicIn, cubicOut } from 'svelte/easing'
  import { scale } from 'svelte/transition'

  export let align = 'right'
  export let width = '48'
  export let contentClasses = 'py-1 bg-white dark:bg-gray-700'

  let open = false

  function closeOnEscape(e) {
    if (open && e.key === 'Escape') {
      open = false
    }
  }

  onMount(() => {
    document.addEventListener('keydown', closeOnEscape)
  })

  onDestroy(() => {
    document.removeEventListener('keydown', closeOnEscape)
  })

  $: widthClass =
    {
      '48': 'w-48'
    }[width.toString()] || ''

  $: alignmentClasses =
    align === 'left'
      ? 'ltr:origin-top-left rtl:origin-top-right start-0'
      : align === 'right'
        ? 'ltr:origin-top-right rtl:origin-top-left end-0'
        : 'origin-top'
</script>

<div class="relative">
  <!-- Trigger Element -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click={() => (open = !open)}>
    <slot name="trigger" />
  </div>

  <!-- Full Screen Dropdown Overlay -->
  {#if open}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="fixed inset-0 z-40" on:click={() => (open = false)}></div>
  {/if}

  <!-- Dropdown Content with Transition -->
  {#if open}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class={`absolute z-50 mt-2 rounded-md shadow-lg ${widthClass} ${alignmentClasses}`}
      on:click={() => (open = false)}
      transition:scale={{
        in: { duration: 200, easing: cubicOut, start: 0.95, opacity: 0 },
        out: { duration: 75, easing: cubicIn, start: 1, opacity: 0 }
      }}
    >
      <div class={`rounded-md ring-1 ring-black ring-opacity-5 ${contentClasses}`}>
        <slot name="content" />
      </div>
    </div>
  {/if}
</div>

<script>
  import { cubicIn, cubicOut } from 'svelte/easing'
  import { scale } from 'svelte/transition'

  let {
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-white dark:bg-gray-700',
    trigger,
    content
  } = $props()

  let open = $state(false)
  let widthClass = $derived({ '48': 'w-48' }[width])
  let alignmentClasses = $derived(
    align === 'left'
      ? 'ltr:origin-top-left rtl:origin-top-right start-0'
      : align === 'right'
        ? 'ltr:origin-top-right rtl:origin-top-left end-0'
        : 'origin-top'
  )

  function closeOnEscape(e) {
    if (open && e.key === 'Escape') {
      open = false
    }
  }
</script>

<svelte:window onkeydown={closeOnEscape} />

<div class="relative">
  <!-- Trigger Element -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div onclick={() => (open = !open)}>
    {@render trigger?.()}
  </div>

  <!-- Full Screen Dropdown Overlay -->
  {#if open}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 z-40" onclick={() => (open = false)}></div>
  {/if}

  <!-- Dropdown Content with Transition -->
  {#if open}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class={`absolute z-50 mt-2 rounded-md shadow-lg ${widthClass} ${alignmentClasses}`}
      onclick={() => (open = false)}
      transition:scale={{
        in: { duration: 200, easing: cubicOut, start: 0.95, opacity: 0 },
        out: { duration: 75, easing: cubicIn, start: 1, opacity: 0 }
      }}
    >
      <div class={`rounded-md ring-1 ring-black ring-opacity-5 ${contentClasses}`}>
        {@render content?.()}
      </div>
    </div>
  {/if}
</div>

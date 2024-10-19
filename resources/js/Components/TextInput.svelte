<script>
  import { createEventDispatcher, onMount } from 'svelte'

  const dispatch = createEventDispatcher()

  let className
  let inputElement

  export let value = ''
  export { className as class }

  function onInput() {
    dispatch('input', value)
  }

  onMount(() => {
    if (inputElement.hasAttribute('autofocus')) {
      inputElement.focus()
    }
  })
</script>

<input
  {...$$restProps}
  class="rounded-md shadow-sm focus:border-indigo-500 dark:border-gray-700 focus:outline-none dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600 p-2 h-10 {className}"
  bind:value
  on:input={onInput}
  bind:this={inputElement}
/>

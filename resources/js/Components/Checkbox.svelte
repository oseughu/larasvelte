<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let checked = false
  export let value = null

  let proxyChecked = checked

  function onChange() {
    dispatch('update:checked', proxyChecked)
  }
</script>

<input
  type="checkbox"
  {value}
  bind:checked={proxyChecked}
  on:change={onChange}
  class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800"
/>

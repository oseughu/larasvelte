<script>
  let { class: className, value = $bindable(), ...attrs } = $props()
</script>

<input
  {...attrs}
  class="rounded-md shadow-xs focus:border-indigo-500 dark:border-gray-700 focus:outline-hidden dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600 p-2 h-10 {className}"
  bind:value
/>

<script>
  let { class: className, value, children, ...attrs } = $props()
</script>

<label {...attrs} class="block text-sm font-medium text-gray-700 dark:text-gray-300 {className}">
  {#if value}
    <span>{value}</span>
  {:else if children}
    <span>{@render children?.()}</span>
  {/if}
</label>

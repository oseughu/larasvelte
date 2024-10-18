<script>
  export let value

  let forName
  export { forName as for }
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label
  {...$$restProps}
  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
  for={forName}
>
  {#if value}
    <span>{value}</span>
  {:else}
    <span><slot /></span>
  {/if}
</label>

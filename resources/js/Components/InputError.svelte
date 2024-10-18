<script>
  export let message
</script>

{#if message}
  <div>
    <p class="text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  </div>
{/if}

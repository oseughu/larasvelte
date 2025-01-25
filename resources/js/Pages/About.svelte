<script>
  import AuthenticatedLayout from '$/Layouts/AuthenticatedLayout'
</script>

<svelte:head>
  <title>About</title>
</svelte:head>

<AuthenticatedLayout>
  {#snippet header()}
    <h2 class="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-200">About</h2>
  {/snippet}

  <div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div class="bg-white overflow-hidden shadow-xs sm:rounded-lg dark:bg-gray-800">
        <div class="p-6 text-gray-900 dark:text-gray-100">This is the about page.</div>
      </div>
    </div>
  </div>
</AuthenticatedLayout>

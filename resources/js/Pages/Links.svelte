<script>
  import InputError from '$/Components/InputError'
  import InputLabel from '$/Components/InputLabel'
  import TextInput from '$/Components/TextInput'
  import AuthenticatedLayout from '$/Layouts/AuthenticatedLayout'
  import { inertia, useForm } from '@inertiajs/svelte'

  let { links } = $props()

  let form = useForm({
    title: null,
    url: null
  })

  function submit(e) {
    e.preventDefault()
    $form.post('/links', {
      onSuccess: () => $form.reset('title', 'url')
    })
  }
</script>

<svelte:head>
  <title>Links</title>
</svelte:head>

<AuthenticatedLayout>
  {#snippet header()}
    <h2 class="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-200">Links</h2>
  {/snippet}

  <div class="py-12">
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="overflow-hidden bg-white shadow-xs sm:rounded-lg">
        <div class="p-6 bg-white dark:text-gray-300 dark:bg-gray-800">
          {#if !links.length}
            No links added. Why don't you add one below?
          {:else}
            {#each links as link (link.id)}
              <li>
                <a href={link.url} target="_blank">{link.title}</a>
                <button
                  class="inline-flex items-center px-3 py-2 mt-4 ml-3 text-sm font-medium leading-4 text-white dark:text-gray-100 bg-red-400 border border-transparent rounded-md shadow-xs hover:bg-red-800 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-red-700"
                  use:inertia={{
                    href: `/links/${link.id}`,
                    method: 'delete'
                  }}>Delete Link</button
                >
              </li>
            {/each}
          {/if}
          <form onsubmit={submit}>
            <div class="mt-8">
              <div>
                <InputLabel for="title" value="Title" />
                <TextInput
                  id="title"
                  type="text"
                  class="mt-1 block w-full lg:w-1/2"
                  bind:value={$form.title}
                  required
                  autocomplete="title"
                />
                <InputError class="mt-2" message={$form.errors.title} />
              </div>

              <div class="mt-4">
                <InputLabel for="url" value="URL" />
                <div class="flex w-full lg:w-1/2 mt-1 rounded-md shadow-xs">
                  <span
                    class="inline-flex items-center px-3 dark:text-gray-300 dark:bg-gray-900 rounded-l-md sm:text-sm"
                  >
                    https://
                  </span>
                  <TextInput
                    id="url"
                    type="text"
                    class="flex-1 block min-w-0 px-3 py-2 border-gray-300 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    bind:value={$form.url}
                    required
                    autocomplete="url"
                  />
                </div>
                <InputError class="mt-2" message={$form.errors.url} />
              </div>
              <button
                disabled={$form.processing}
                type="submit"
                class="inline-flex items-center px-3 py-2 mt-4 text-sm font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-xs hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</AuthenticatedLayout>

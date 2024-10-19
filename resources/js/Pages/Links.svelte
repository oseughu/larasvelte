<script>
  import InputError from '@/Components/InputError.svelte'
  import InputLabel from '@/Components/InputLabel.svelte'
  import TextInput from '@/Components/TextInput.svelte'
  import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.svelte'
  import { inertia, useForm } from '@inertiajs/svelte'

  export let links

  let form = useForm({
    title: null,
    url: null
  })

  function submit() {
    $form.post('/links', {
      onSuccess: () => $form.reset('title', 'url')
    })
  }
</script>

<svelte:head>
  <title>Links</title>
</svelte:head>

<AuthenticatedLayout>
  <h2 class="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-200" slot="header">
    Links
  </h2>

  <div class="py-12">
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="overflow-hidden bg-white shadow-sm sm:rounded-lg">
        <div class="p-6 bg-white dark:text-gray-300 dark:bg-gray-800">
          {#if !links.length}
            No links added. Why don't you add one below?
          {:else}
            {#each links as link (link.id)}
              <li>
                <a href={link.url} target="_blank">{link.title}</a>
                <button
                  class="inline-flex items-center px-3 py-2 mt-4 ml-3 text-sm font-medium leading-4 text-white dark:text-gray-100 bg-red-400 border border-transparent rounded-md shadow-sm hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700"
                  use:inertia={{
                    href: `/links/${link.id}`,
                    method: 'delete'
                  }}>Delete Link</button
                >
              </li>
            {/each}
          {/if}
          <form on:submit|preventDefault={submit}>
            <div class="mt-8">
              <div>
                <InputLabel for="title" value="Title" />
                <TextInput
                  id="title"
                  type="text"
                  class="mt-1 block w-full lg:w-1/2"
                  bind:value={$form.title}
                  required
                  autofocus
                  autocomplete="title"
                  on:input={(evt) => ($form.title = evt.detail)}
                />
                <InputError class="mt-2" message={$form.errors.title} />
              </div>

              <div class="mt-4">
                <InputLabel for="url" value="URL" />
                <div class="flex w-1/2 mt-1 rounded-md shadow-sm">
                  <span
                    class="inline-flex items-center px-3 dark:text-gray-300 dark:bg-gray-900 rounded-l-md sm:text-sm"
                  >
                    https://
                  </span>
                  <TextInput
                    id="url"
                    type="text"
                    class="flex-1 block w-full min-w-0 px-3 py-2 border-gray-300 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    bind:value={$form.url}
                    required
                    autocomplete="url"
                    on:input={(evt) => ($form.url = evt.detail)}
                  />
                </div>
                <InputError class="mt-2" message={$form.errors.url} />
              </div>
              <button
                disabled={$form.processing}
                type="submit"
                class="inline-flex items-center px-3 py-2 mt-4 text-sm font-medium leading-4 text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</AuthenticatedLayout>

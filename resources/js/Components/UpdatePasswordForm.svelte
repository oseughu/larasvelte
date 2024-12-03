<script>
  import InputError from '$/Components/InputError'
  import InputLabel from '$/Components/InputLabel'
  import PrimaryButton from '$/Components/PrimaryButton'
  import TextInput from '$/Components/TextInput'
  import { useForm } from '@inertiajs/svelte'
  import { tick } from 'svelte'
  import { fade } from 'svelte/transition'

  let passwordInput
  let currentPasswordInput

  let form = useForm({
    current_password: '',
    password: '',
    password_confirmation: ''
  })

  async function updatePassword(e) {
    e.preventDefault()
    $form.post('/reset-password', {
      preserveScroll: true,
      onSuccess: () => $form.reset(),
      onError: async () => {
        if ($form.errors.password) {
          $form.reset('password', 'password_confirmation')
          await tick()
          passwordInput.focus()
        }
        if ($form.errors.current_password) {
          $form.reset('current_password')
          await tick()
          currentPasswordInput.focus()
        }
      }
    })
  }
</script>

<section>
  <header>
    <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Update Password</h2>

    <p class="text-justify tracking-tight mt-1 text-sm text-gray-600 dark:text-gray-400">
      Ensure your account is using a long, random password to stay secure.
    </p>
  </header>

  <form onsubmit={updatePassword} class="mt-6 space-y-6">
    <div>
      <InputLabel for="current_password" value="Current Password" />

      <TextInput
        id="current_password"
        bind:value={$form.current_password}
        type="password"
        class="mt-1 block w-full lg:w-1/2"
        autocomplete="current-password"
      />

      <InputError message={$form.errors.current_password} class="mt-2" />
    </div>

    <div>
      <InputLabel for="password" value="New Password" />

      <TextInput
        id="password"
        bind:value={$form.password}
        type="password"
        class="mt-1 block w-full lg:w-1/2"
        autocomplete="new-password"
      />

      <InputError message={$form.errors.password} class="mt-2" />
    </div>

    <div>
      <InputLabel for="password_confirmation" value="Confirm Password" />

      <TextInput
        id="password_confirmation"
        bind:value={$form.password_confirmation}
        type="password"
        class="mt-1 block w-full lg:w-1/2"
        autocomplete="new-password"
      />

      <InputError message={$form.errors.password_confirmation} class="mt-2" />
    </div>

    <div class="flex items-center gap-4">
      <PrimaryButton disabled={$form.processing}>Save</PrimaryButton>

      {#if $form.recentlySuccessful}
        <p class="text-sm text-gray-600 dark:text-gray-400" transition:fade>Saved.</p>
      {/if}
    </div>
  </form>
</section>

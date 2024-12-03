<script>
  import InputError from '$/Components/InputError'
  import InputLabel from '$/Components/InputLabel'
  import PrimaryButton from '$/Components/PrimaryButton'
  import TextInput from '$/Components/TextInput'
  import GuestLayout from '$/Layouts/GuestLayout'
  import { useForm } from '@inertiajs/svelte'

  let form = useForm({
    password: ''
  })

  function submit(e) {
    e.preventDefault()
    $form.post('/confirm-password', {
      onFinish: () => $form.reset()
    })
  }
</script>

<svelte:head>
  <title>Confirm Password</title>
</svelte:head>

<GuestLayout>
  <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
    This is a secure area of the application. Please confirm your password before continuing.
  </div>

  <form onsubmit={submit}>
    <div>
      <InputLabel for="password" value="Password" />
      <TextInput
        id="password"
        type="password"
        class="mt-1 block w-full"
        bind:value={$form.password}
        required
        autocomplete="current-password"
      />
      <InputError class="mt-2" message={$form.errors.password} />
    </div>

    <div class="mt-4 flex justify-end">
      <PrimaryButton class="ms-4 {$form.processing && 'opacity-25'}" disabled={$form.processing}>
        Confirm
      </PrimaryButton>
    </div>
  </form>
</GuestLayout>

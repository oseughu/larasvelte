<script>
  import InputError from '$/Components/InputError'
  import InputLabel from '$/Components/InputLabel'
  import PrimaryButton from '$/Components/PrimaryButton'
  import TextInput from '$/Components/TextInput'
  import GuestLayout from '$/Layouts/GuestLayout'
  import { useForm } from '@inertiajs/svelte'

  let { email, token } = $props()

  const form = useForm({
    token: token,
    email: email,
    password: null,
    password_confirmation: null
  })

  const submit = (e) => {
    e.preventDefault()
    $form.post('/reset-password', {
      onSuccess: () => $form.reset('password', 'password_confirmation')
    })
  }
</script>

<svelte:head>
  <title>Reset Password</title>
</svelte:head>

<GuestLayout>
  <form onsubmit={submit}>
    <div>
      <InputLabel for="email" value="Email" />
      <TextInput
        id="email"
        type="email"
        class="mt-1 block w-full"
        bind:value={$form.email}
        required
        autocomplete="username"
      />
      <InputError class="mt-2" message={$form.errors.email} />
    </div>

    <div class="mt-4">
      <InputLabel for="password" value="Password" />
      <TextInput
        id="password"
        type="password"
        class="mt-1 block w-full"
        bind:value={$form.password}
        required
        autocomplete="new-password"
      />
      <InputError class="mt-2" message={$form.errors.password} />
    </div>

    <div class="mt-4">
      <InputLabel for="password_confirmation" value="Confirm Password" />
      <TextInput
        id="password_confirmation"
        type="password"
        class="mt-1 block w-full"
        bind:value={$form.password_confirmation}
        required
        autocomplete="new-password"
      />
      <InputError class="mt-2" message={$form.errors.password_confirmation} />
    </div>

    <div class="flex items-center justify-end mt-4">
      <PrimaryButton class={$form.processing && 'opacity-25'} disabled={$form.processing}>
        Reset Password
      </PrimaryButton>
    </div>
  </form>
</GuestLayout>

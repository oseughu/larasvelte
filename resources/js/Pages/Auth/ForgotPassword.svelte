<script>
  import InputError from '$/Components/InputError'
  import InputLabel from '$/Components/InputLabel'
  import PrimaryButton from '$/Components/PrimaryButton'
  import TextInput from '$/Components/TextInput'
  import GuestLayout from '$/Layouts/GuestLayout'
  import { useForm } from '@inertiajs/svelte'

  let { status } = $props()

  let form = useForm({
    email: ''
  })

  const submit = (e) => {
    e.preventDefault()
    $form.post('/forgot-password')
  }
</script>

<svelte:head>
  <title>Forgot Password</title>
</svelte:head>

<GuestLayout>
  <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
    Forgot your password? No problem. Just let us know your email address and we will email you a
    password reset link that will allow you to choose a new one.
  </div>

  {#if status}
    <div class="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
      {status}
    </div>
  {/if}

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

    <div class="mt-4 flex items-center justify-end">
      <PrimaryButton class={$form.processing && 'opacity-25'} disabled={$form.processing}>
        Email Password Reset Link
      </PrimaryButton>
    </div>
  </form>
</GuestLayout>

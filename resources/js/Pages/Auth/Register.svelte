<script>
  import InputError from '$/Components/InputError'
  import InputLabel from '$/Components/InputLabel'
  import PrimaryButton from '$/Components/PrimaryButton'
  import TextInput from '$/Components/TextInput'
  import GuestLayout from '$/Layouts/GuestLayout'
  import { Link, useForm } from '@inertiajs/svelte'

  let form = useForm({
    name: null,
    email: null,
    password: null,
    password_confirmation: null,
    terms: false
  })

  const submit = (e) => {
    e.preventDefault()
    $form.post('/register', {
      onSuccess: () => $form.reset('password', 'password_confirmation')
    })
  }
</script>

<svelte:head>
  <title>Register</title>
</svelte:head>

<GuestLayout>
  <form onsubmit={submit}>
    <div>
      <InputLabel for="name" value="Name" />
      <TextInput
        id="name"
        type="text"
        class="mt-1 block w-full"
        bind:value={$form.name}
        required
        autocomplete="name"
      />
      <InputError class="mt-2" message={$form.errors.name} />
    </div>

    <div class="mt-4">
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

    <div class="mt-4 flex items-center justify-end">
      <Link
        href="/login"
        class="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
      >
        Already registered?
      </Link>

      <PrimaryButton class="ms-4 {$form.processing && 'opacity-25'}" disabled={$form.processing}>
        Register
      </PrimaryButton>
    </div>
  </form>
</GuestLayout>

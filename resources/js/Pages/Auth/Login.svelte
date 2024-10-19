<script>
  import Checkbox from '@/Components/Checkbox.svelte'
  import InputError from '@/Components/InputError.svelte'
  import InputLabel from '@/Components/InputLabel.svelte'
  import PrimaryButton from '@/Components/PrimaryButton.svelte'
  import TextInput from '@/Components/TextInput.svelte'
  import GuestLayout from '@/Layouts/GuestLayout.svelte'
  import { Link, useForm } from '@inertiajs/svelte'

  export let canResetPassword
  export let status

  let form = useForm({
    email: '',
    password: '',
    remember: false
  })

  function submit() {
    $form.post('/login', {
      onSuccess: () => $form.reset()
    })
  }
</script>

<svelte:head>
  <title>Login</title>
</svelte:head>

<GuestLayout>
  {#if status}
    <div class="mb-4 text-sm font-medium text-green-600">
      {status}
    </div>
  {/if}

  <form on:submit|preventDefault={submit}>
    <div>
      <InputLabel for="email" value="Email" />

      <TextInput
        id="email"
        type="email"
        class="mt-1 block w-full"
        bind:value={$form.email}
        required
        autofocus
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
        autocomplete="current-password"
      />

      <InputError class="mt-2" message={$form.errors.password} />
    </div>

    <div class="mt-4 block">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="flex items-center">
        <Checkbox name="remember" bind:checked={$form.remember} />
        <span class="ms-2 text-sm text-gray-600 dark:text-gray-400"> Remember me </span>
      </label>
    </div>

    <div class="mt-4 flex items-center justify-end">
      {#if canResetPassword}
        <Link
          href="/forgot-password"
          class="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
        >
          Forgot your password?
        </Link>
      {/if}

      <!-- svelte-ignore illegal-attribute-character -->
      <PrimaryButton class="ms-4" xclass:opacity-25={$form.processing} disabled={$form.processing}>
        Log in
      </PrimaryButton>
    </div>
  </form>
</GuestLayout>

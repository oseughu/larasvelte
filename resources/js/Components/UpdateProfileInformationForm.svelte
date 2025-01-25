<script>
  import InputError from '$/Components/InputError'
  import InputLabel from '$/Components/InputLabel'
  import PrimaryButton from '$/Components/PrimaryButton'
  import TextInput from '$/Components/TextInput'
  import { Link, page, useForm } from '@inertiajs/svelte'
  import { fade } from 'svelte/transition'

  let { mustVerifyEmail, status } = $props()

  const user = $page.props.auth.user

  let form = useForm({
    name: user.name,
    email: user.email
  })

  const submit = (e) => {
    e.preventDefault()
    $form.patch('/profile')
  }
</script>

<section>
  <header>
    <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Profile Information</h2>

    <p class="text-justify mt-1 text-sm text-gray-600 dark:text-gray-400">
      Update your account's profile information and email address.
    </p>
  </header>

  <form onsubmit={submit} class="mt-6 space-y-6">
    <div>
      <InputLabel for="name" value="Name" />

      <TextInput
        id="name"
        type="text"
        class="mt-1 block w-full lg:w-1/2"
        bind:value={$form.name}
        required
        autocomplete="name"
      />

      <InputError class="mt-2" message={$form.errors.name} />
    </div>

    <div>
      <InputLabel for="email" value="Email" />

      <TextInput
        id="email"
        type="email"
        class="mt-1 block w-full lg:w-1/2"
        bind:value={$form.email}
        required
        autocomplete="username"
      />

      <InputError class="mt-2" message={$form.errors.email} />
    </div>

    {#if mustVerifyEmail && user.email_verified_at === null}
      <p class="mt-2 text-sm text-gray-800 dark:text-gray-200">
        Your email address is unverified.
        <Link
          href="email/verification-notification"
          method="post"
          as="button"
          class="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
        >
          Click here to re-send the verification email.
        </Link>
      </p>

      {#if status === 'verification-link-sent'}
        <div class="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
          A new verification link has been sent to your email address.
        </div>
      {/if}
    {/if}

    <div class="flex items-center gap-4">
      <PrimaryButton disabled={$form.processing}>Save</PrimaryButton>

      {#if $form.recentlySuccessful}
        <p class="text-sm text-gray-600 dark:text-gray-400" transition:fade>Saved.</p>
      {/if}
    </div>
  </form>
</section>

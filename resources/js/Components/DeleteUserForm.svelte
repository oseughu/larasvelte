<script>
  import DangerButton from '$/Components/DangerButton'
  import InputError from '$/Components/InputError'
  import InputLabel from '$/Components/InputLabel'
  import Modal from '$/Components/Modal'
  import SecondaryButton from '$/Components/SecondaryButton'
  import TextInput from '$/Components/TextInput'
  import { useForm } from '@inertiajs/svelte'
  import { tick } from 'svelte'

  let confirmingUserDeletion = $state(false)
  let passwordInput = $state()

  let form = useForm({
    password: ''
  })

  async function confirmUserDeletion() {
    confirmingUserDeletion = true

    await tick()
    passwordInput.focus()
  }

  function deleteUser() {
    $form.delete('/profile', {
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onError: () => passwordInput.focus(),
      onFinish: () => $form.reset()
    })
  }

  function closeModal() {
    confirmingUserDeletion = false

    $form.clearErrors()
    $form.reset()
  }
</script>

<section class="space-y-6">
  <header>
    <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Delete Account</h2>

    <p class="lg:w-1/2 text-justify tracking-tight mt-1 text-sm text-gray-600 dark:text-gray-400">
      Once your account is deleted, all of its resources and data will be permanently deleted.
      Before deleting your account, please download any data or information that you wish to retain.
    </p>
  </header>

  <DangerButton onclick={confirmUserDeletion}>Delete Account</DangerButton>

  <Modal show={confirmingUserDeletion} onclose={closeModal}>
    <div class="p-6">
      <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">
        Are you sure you want to delete your account?
      </h2>

      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Once your account is deleted, all of its resources and data will be permanently deleted.
        Please enter your password to confirm you would like to permanently delete your account.
      </p>

      <div class="mt-6">
        <InputLabel for="password" value="Password" class="sr-only" />

        <TextInput
          bind:this={passwordInput}
          bind:value={$form.password}
          type="password"
          class="mt-1 block w-3/4"
          placeholder="Password"
          onkeyup={deleteUser}
        />

        <InputError message={$form.errors.password} class="mt-2" />
      </div>

      <div class="mt-6 flex justify-end">
        <SecondaryButton onclick={closeModal}>Cancel</SecondaryButton>

        <DangerButton
          class={`ms-3 ${$form.processing && 'opacity-25'}`}
          disabled={$form.processing}
          onclick={deleteUser}
        >
          Delete Account
        </DangerButton>
      </div>
    </div>
  </Modal>
</section>

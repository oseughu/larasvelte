<script>
	import Command from "./command.svelte";
	import * as Dialog from "$/Components/ui/dialog/index.js";

	let {
		open = $bindable(false),
		ref = $bindable(null),
		value = $bindable(""),
		portalProps,
		children,
		...restProps
	} = $props();
</script>

<Dialog.Root bind:open {...restProps}>
	<Dialog.Content class="overflow-hidden p-0 shadow-lg" {portalProps}>
		<Command
			class="[&_[data-command-group]:not([hidden])_~[data-command-group]]:pt-0 **:data-command-group:px-2 [&_[data-command-input-wrapper]_svg]:h-5 [&_[data-command-input-wrapper]_svg]:w-5 **:data-command-input:h-12 **:data-command-item:px-2 **:data-command-item:py-3 [&_[data-command-item]_svg]:h-5 [&_[data-command-item]_svg]:w-5"
			{...restProps}
			bind:value
			bind:ref
			{children}
		/>
	</Dialog.Content>
</Dialog.Root>

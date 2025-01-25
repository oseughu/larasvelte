<script>
	import { PinInput as InputOTPPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, value = $bindable(""), ...restProps } = $props();
</script>

<InputOTPPrimitive.Root
	bind:ref
	bind:value
	class={cn(
		"flex items-center gap-2 has-disabled:opacity-50 disabled:[&_input]:cursor-not-allowed",
		className
	)}
	{...restProps}
/>

<script>
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<DialogPrimitive.Title
	bind:ref
	class={cn("text-lg font-semibold leading-none tracking-tight", className)}
	{...restProps}
/>

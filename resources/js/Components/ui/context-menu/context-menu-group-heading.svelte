<script>
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, inset, ...restProps } = $props();
</script>

<ContextMenuPrimitive.GroupHeading
	bind:ref
	class={cn("text-foreground px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
	{...restProps}
/>

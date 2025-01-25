<script>
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, inset, ...restProps } = $props();
</script>

<ContextMenuPrimitive.Item
	bind:ref
	class={cn(
		"data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50",
		inset && "pl-8",
		className
	)}
	{...restProps}
/>

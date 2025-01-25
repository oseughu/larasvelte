<script>
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<ContextMenuPrimitive.SubContent
	bind:ref
	class={cn(
		"bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md focus:outline-hidden",
		className
	)}
	{...restProps}
/>

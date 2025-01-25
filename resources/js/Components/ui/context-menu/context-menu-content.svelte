<script>
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), portalProps, class: className, ...restProps } = $props();
</script>

<ContextMenuPrimitive.Portal {...portalProps}>
	<ContextMenuPrimitive.Content
		bind:ref
		class={cn(
			"bg-popover text-popover-foreground z-50 min-w-[8rem] rounded-md border p-1 shadow-md focus:outline-hidden",
			className
		)}
		{...restProps}
	/>
</ContextMenuPrimitive.Portal>

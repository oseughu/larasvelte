<script>
	import { LinkPreview as HoverCardPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let {
		ref = $bindable(null),
		class: className,
		align = "center",
		sideOffset = 4,
		portalProps,
		...restProps
	} = $props();
</script>

<HoverCardPrimitive.Portal {...portalProps}>
	<HoverCardPrimitive.Content
		bind:ref
		{align}
		{sideOffset}
		class={cn(
			"bg-popover text-popover-foreground z-50 mt-3 w-64 rounded-md border p-4 shadow-md outline-hidden",
			className
		)}
		{...restProps}
	/>
</HoverCardPrimitive.Portal>

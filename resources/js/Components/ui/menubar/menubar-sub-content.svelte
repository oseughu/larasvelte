<script>
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<MenubarPrimitive.SubContent
	bind:ref
	class={cn(
		"bg-popover text-popover-foreground z-50 min-w-max rounded-md border p-1 focus:outline-hidden",
		className
	)}
	{...restProps}
/>

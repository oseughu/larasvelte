<script>
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<CommandPrimitive.LinkItem
	class={cn(
		"aria-selected:bg-accent aria-selected:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50",
		className
	)}
	bind:ref
	{...restProps}
/>

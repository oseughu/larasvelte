<script>
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
	import { cn } from "$/Lib/utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<ContextMenuPrimitive.Separator
	bind:ref
	class={cn("bg-border -mx-1 my-1 h-px", className)}
	{...restProps}
/>

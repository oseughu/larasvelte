<script>
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	import { cn } from "$/Lib/utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<DrawerPrimitive.Description
	bind:ref
	class={cn("text-muted-foreground text-sm", className)}
	{...restProps}
/>

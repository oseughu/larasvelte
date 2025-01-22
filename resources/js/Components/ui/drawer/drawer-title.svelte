<script>
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<DrawerPrimitive.Title
	bind:ref
	class={cn("text-lg font-semibold leading-none tracking-tight", className)}
	{...restProps}
/>

<script>
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<MenubarPrimitive.Root
	bind:ref
	class={cn("bg-background flex h-10 items-center space-x-1 rounded-md border p-1", className)}
	{...restProps}
/>

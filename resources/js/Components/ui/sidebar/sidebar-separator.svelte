<script>
	import { Separator } from "$/Components/ui/separator/index.js";
	import { cn } from "$/Lib/Utils.js";
	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<Separator
	bind:ref
	data-sidebar="separator"
	class={cn("bg-sidebar-border mx-2 w-auto", className)}
	{...restProps}
/>

<script>
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<div
	bind:this={ref}
	class={cn("bg-muted animate-pulse rounded-md", className)}
	{...restProps}
></div>

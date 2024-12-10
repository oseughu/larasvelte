<script>
	import { cn } from "$/Lib/utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<div bind:this={ref} class={cn("flex items-center", className)} {...restProps}>
	{@render children?.()}
</div>

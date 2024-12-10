<script>
	import { cn } from "$/Lib/utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<ul bind:this={ref} class={cn("flex flex-row items-center gap-1", className)} {...restProps}>
	{@render children?.()}
</ul>

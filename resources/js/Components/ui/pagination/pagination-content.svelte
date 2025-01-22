<script>
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<ul bind:this={ref} class={cn("flex flex-row items-center gap-1", className)} {...restProps}>
	{@render children?.()}
</ul>

<script>
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<tfoot bind:this={ref} class={cn("bg-muted/50 font-medium", className)} {...restProps}>
	{@render children?.()}
</tfoot>

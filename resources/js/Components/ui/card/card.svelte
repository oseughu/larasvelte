<script>
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<div
	bind:this={ref}
	class={cn("bg-card text-card-foreground rounded-lg border shadow-xs", className)}
	{...restProps}
>
	{@render children?.()}
</div>

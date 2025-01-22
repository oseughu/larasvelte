<script>
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<span
	bind:this={ref}
	class={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
	{...restProps}
>
	{@render children?.()}
</span>

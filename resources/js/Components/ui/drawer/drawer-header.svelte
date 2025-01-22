<script>
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<div
	bind:this={ref}
	class={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
	{...restProps}
>
	{@render children?.()}
</div>

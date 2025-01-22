<script>
	import { cn } from "$/Lib/Utils.js";
	let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<div bind:this={ref} class={cn("mt-auto flex flex-col gap-2 p-4", className)} {...restProps}>
	{@render children?.()}
</div>

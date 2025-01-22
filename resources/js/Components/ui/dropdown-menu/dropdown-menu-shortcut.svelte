<script>
	import {} from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<span
	bind:this={ref}
	class={cn("ml-auto text-xs tracking-widest opacity-60", className)}
	{...restProps}
>
	{@render children?.()}
</span>

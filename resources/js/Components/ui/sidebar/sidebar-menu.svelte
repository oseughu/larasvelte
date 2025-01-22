<script>
	import { cn } from "$/Lib/Utils.js";
	let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<ul
	bind:this={ref}
	data-sidebar="menu"
	class={cn("flex w-full min-w-0 flex-col gap-1", className)}
	{...restProps}
>
	{@render children?.()}
</ul>

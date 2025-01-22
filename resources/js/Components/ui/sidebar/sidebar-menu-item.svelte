<script>
	import { cn } from "$/Lib/Utils.js";
	let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<li
	bind:this={ref}
	data-sidebar="menu-item"
	class={cn("group/menu-item relative", className)}
	{...restProps}
>
	{@render children?.()}
</li>

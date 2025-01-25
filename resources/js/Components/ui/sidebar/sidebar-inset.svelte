<script>
	import { cn } from "$/Lib/Utils.js";
	let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

<main
	bind:this={ref}
	class={cn(
		"bg-background relative flex min-h-svh flex-1 flex-col",
		"peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</main>

<script>
	import Dot from "lucide-svelte/icons/dot";

	let { ref = $bindable(null), children, ...restProps } = $props();
</script>

<div bind:this={ref} role="separator" {...restProps}>
	{#if children}
		{@render children?.()}
	{:else}
		<Dot />
	{/if}
</div>

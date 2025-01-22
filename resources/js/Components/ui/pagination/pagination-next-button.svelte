<script>
	import { Pagination as PaginationPrimitive } from "bits-ui";
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import { buttonVariants } from "$/Components/ui/button/index.js";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps } = $props();
</script>

{#snippet Fallback()}
	<span>Next</span>
	<ChevronRight class="size-4" />
{/snippet}

<PaginationPrimitive.NextButton
	bind:ref
	class={cn(
		buttonVariants({
			variant: "ghost",
			class: "gap-1 pr-2.5",
		}),
		className
	)}
	children={children || Fallback}
	{...restProps}
/>

<script>
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<CalendarPrimitive.Header
	bind:ref
	class={cn("relative flex w-full items-center justify-between pt-1", className)}
	{...restProps}
/>

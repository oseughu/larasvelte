<script>
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<CalendarPrimitive.Grid
	bind:ref
	class={cn("w-full border-collapse space-y-1", className)}
	{...restProps}
/>

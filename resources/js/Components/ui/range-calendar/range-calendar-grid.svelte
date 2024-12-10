<script>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$/Lib/utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<RangeCalendarPrimitive.Grid
	bind:ref
	class={cn("w-full border-collapse space-y-1", className)}
	{...restProps}
/>

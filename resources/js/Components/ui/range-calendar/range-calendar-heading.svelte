<script>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<RangeCalendarPrimitive.Heading
	bind:ref
	class={cn("text-sm font-medium", className)}
	{...restProps}
/>

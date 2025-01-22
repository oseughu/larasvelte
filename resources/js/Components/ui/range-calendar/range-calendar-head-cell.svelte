<script>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<RangeCalendarPrimitive.HeadCell
	bind:ref
	class={cn("text-muted-foreground w-9 rounded-md text-[0.8rem] font-normal", className)}
	{...restProps}
/>

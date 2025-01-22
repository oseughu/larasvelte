<script>
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<RangeCalendarPrimitive.GridRow bind:ref class={cn("flex", className)} {...restProps} />

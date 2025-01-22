<script>
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<CalendarPrimitive.HeadCell
	bind:ref
	class={cn("text-muted-foreground w-9 rounded-md text-[0.8rem] font-normal", className)}
	{...restProps}
/>

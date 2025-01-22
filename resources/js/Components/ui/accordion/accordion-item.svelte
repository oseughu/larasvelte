<script>
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<AccordionPrimitive.Item bind:ref class={cn("border-b", className)} {...restProps} />

<script>
	import * as FormPrimitive from "formsnap";
	import { cn } from "$/Lib/utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<FormPrimitive.Description
	bind:ref
	class={cn("text-muted-foreground text-sm", className)}
	{...restProps}
/>

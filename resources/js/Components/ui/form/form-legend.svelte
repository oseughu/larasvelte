<script>
	import * as FormPrimitive from "formsnap";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<FormPrimitive.Legend
	bind:ref
	class={cn("data-fs-error:text-destructive text-sm font-medium leading-none", className)}
	{...restProps}
/>

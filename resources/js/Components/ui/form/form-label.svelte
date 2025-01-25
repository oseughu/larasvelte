<script>
	import * as FormPrimitive from "formsnap";
	import { Label } from "$/Components/ui/label/index.js";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), children, class: className, ...restProps } = $props();
</script>

<FormPrimitive.Label {...restProps} bind:ref>
	{#snippet child({ props })}
		<Label {...props} class={cn("data-fs-error:text-destructive", className)}>
			{@render children?.()}
		</Label>
	{/snippet}
</FormPrimitive.Label>

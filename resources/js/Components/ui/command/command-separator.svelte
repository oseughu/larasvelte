<script>
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<CommandPrimitive.Separator class={cn("bg-border -mx-1 h-px", className)} bind:ref {...restProps} />

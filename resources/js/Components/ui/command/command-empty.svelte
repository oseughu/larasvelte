<script>
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<CommandPrimitive.Empty class={cn("py-6 text-center text-sm", className)} {...restProps} />

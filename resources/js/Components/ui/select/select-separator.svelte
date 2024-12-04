<script>
	import { Separator } from "$/Components/ui/separator/index.js";
	import { cn } from "$/Lib/Utils.js";

	let { ref = $bindable(null), class: className, ...restProps } = $props();
</script>

<Separator bind:ref class={cn("bg-muted -mx-1 my-1 h-px", className)} {...restProps} />

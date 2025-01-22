<script module>
	import { getContext, setContext } from "svelte";
	export function setToggleGroupCtx(props) {
		setContext("toggleGroup", props);
	}

	export function getToggleGroupCtx() {
		return getContext("toggleGroup");
	}
</script>

<script>
	import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
	import { cn } from "$/Lib/Utils.js";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		size = "default",
		variant = "default",
		...restProps
	} = $props();

	setToggleGroupCtx({
		variant,
		size,
	});
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<ToggleGroupPrimitive.Root
	bind:value
	bind:ref
	class={cn("flex items-center justify-center gap-1", className)}
	{...restProps}
/>

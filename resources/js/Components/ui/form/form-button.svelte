<script>
	import * as Button from "$/Components/ui/button/index.js";

	let { ref = $bindable(null), ...restProps } = $props();
</script>

<Button.Root bind:ref type="submit" {...restProps} />

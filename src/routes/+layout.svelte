<script>
	import "../app.css";

	let { children } = $props();
</script>

<div class="isolate antialiased">
	{@render children()}
</div>

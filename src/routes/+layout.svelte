<script>
	import "../app.css";

	let { children } = $props();
</script>

<div class="isolate min-h-dvh bg-[var(--page-background)] text-[var(--page-foreground)] antialiased">
	{@render children()}
</div>

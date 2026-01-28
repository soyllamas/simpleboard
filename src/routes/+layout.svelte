<script>
	import "../app.css";

	let { children } = $props();
</script>

{@render children()}

<style>
	:global(body) {
		background-color: #fff;
	}
</style>

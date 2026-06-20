<script lang="ts">
	import { sanitize } from "$lib/domain/useCase/sanitize";
	import { goto } from "$app/navigation";

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	let boardId = $state(data.boardId);
	let url = $derived(sanitize(boardId));

	function onKeyDown(event: KeyboardEvent) {
		const isEnter = event.key === "Enter" && !event.shiftKey;
		if (isEnter) {
			goto(url);
		}
	}
</script>

<script:head>
	<title>SimpleBoard — Kanban for minimalists</title>
	<meta name="description" content="A very simple kanban board for minimalists." />
</script:head>

<div class="mx-auto h-dvh max-w-md px-4">
	<h1 class="pt-8 text-center text-[32px] font-bold text-slate-950 md:pt-24">SimpleBoard</h1>
	<h2 class="pb-16 text-center text-slate-600 md:pb-16">Kanban for minimalists.</h2>
	<div class="mx-auto flex">
		<p
			class="shrink-0 rounded-l-lg border-y border-l border-slate-300 bg-slate-100 px-3 py-1.5 text-[1rem] text-slate-700"
		>
			{`${data.domain}/`}
		</p>
		<input
			type="text"
			placeholder="my-board"
			class="min-w-0 grow border border-slate-300 bg-slate-50 px-3 py-1.5 text-[1rem] text-slate-700 outline-blue-600"
			minlength="10"
			onkeydown={(event) => onKeyDown(event)}
			bind:value={boardId}
		/>
		<a class="shrink-0 rounded-r-lg bg-blue-600 px-4 py-1.5 text-slate-50" href={url}> Join </a>
	</div>
	<h2 class="mt-24 text-xl font-semibold">Use Cases</h2>
	<ul class="mx-auto mt-4 list-disc pl-8">
		<li>Mob-programming.</li>
		<li>Personal project.</li>
		<li>Mind-dump.</li>
	</ul>
	<h2 class="mt-12 text-xl font-semibold">Features</h2>
	<ul class="mx-auto mt-4 list-disc pl-8">
		<li>It's free!</li>
		<li>No account required.</li>
		<li>Share your board with the link.</li>
		<li>Markdown support.</li>
	</ul>
</div>

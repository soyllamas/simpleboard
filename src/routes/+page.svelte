<script lang="ts">
	import { sanitize } from "$lib/domain/useCase/sanitize";
	import { boardIdMaxLength } from "$lib/domain/useCase/boardLimits";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import TriangleAlert from "@lucide/svelte/icons/triangle-alert";

	let { data } = $props();

	// svelte-ignore state_referenced_locally
	let boardId = $state(data.boardId);
	let boardSlug = $derived(sanitize(boardId).slice(1));

	function onKeyDown(event: KeyboardEvent) {
		const isEnter = event.key === "Enter" && !event.shiftKey;
		if (isEnter) {
			goto(resolve("/[slug]", { slug: boardSlug }));
		}
	}

	function scrollBoardInputToEnd(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const selectionAtEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length;
		if (!selectionAtEnd) return;

		requestAnimationFrame(() => {
			input.scrollLeft = input.scrollWidth;
		});
	}
</script>

<script:head>
	<title>SimpleBoard — Kanban for minimalists</title>
	<meta name="description" content="A very simple kanban board for minimalists." />
</script:head>

<div class="mx-auto h-dvh max-w-md px-4">
	<h1 class="pt-8 text-center text-[2rem] font-semibold tracking-tight text-balance text-slate-950 md:pt-24 dark:text-slate-50">SimpleBoard</h1>
	<h2 class="pb-16 text-center text-balance text-slate-600 md:pb-16 dark:text-slate-400">Kanban for minimalists.</h2>
	<div class="mx-auto flex gap-2">
		<label
			class="flex min-w-0 grow items-center overflow-hidden rounded-xl bg-slate-50 text-[1rem] text-slate-700 ring-1 ring-slate-950/10 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-blue-600 dark:bg-slate-950 dark:text-slate-100 dark:ring-white/10"
		>
			<span class="min-w-0 shrink truncate py-2 pl-3 text-slate-500 dark:text-slate-400">{`${data.domain}/`}</span>
			<input
				type="text"
				name="board"
				aria-label="Board name"
				placeholder="my-board"
				autocomplete="off"
				autocapitalize="none"
				autocorrect="off"
				spellcheck="false"
				maxlength={boardIdMaxLength}
				class="min-w-32 flex-1 bg-transparent py-2 pr-3 text-slate-700 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
				oninput={scrollBoardInputToEnd}
				onkeydown={(event) => onKeyDown(event)}
				bind:value={boardId}
			/>
		</label>
		<a
			class="flex min-h-10 shrink-0 items-center rounded-xl bg-blue-600 px-4 py-2 text-slate-50 outline-none transition-[background-color,scale] duration-200 active:scale-[0.96] hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400"
			href={resolve("/[slug]", { slug: boardSlug })}
		>
			Join
		</a>
	</div>
	<h2 class="mt-24 text-xl font-semibold text-balance text-slate-950 dark:text-slate-50">Use Cases</h2>
	<ul class="mx-auto mt-4 list-disc pl-8 text-pretty text-slate-700 dark:text-slate-300">
		<li>Mob-programming.</li>
		<li>Personal project.</li>
		<li>Mind-dump.</li>
	</ul>
	<h2 class="mt-12 text-xl font-semibold text-balance text-slate-950 dark:text-slate-50">Features</h2>
	<ul class="mx-auto mt-4 list-disc pl-8 text-pretty text-slate-700 dark:text-slate-300">
		<li>It's free!</li>
		<li>No account required.</li>
		<li>Share your board with the link.</li>
		<li>Ephemeral boards.</li>
		<li>Markdown support.</li>
	</ul>
	<footer class="mt-16 flex items-start gap-2 border-t border-slate-950/10 pt-4 pb-8 text-left text-base/6 text-pretty text-red-700 sm:text-sm/5 dark:border-white/10 dark:text-red-300">
		<TriangleAlert class="size-4 h-lh shrink-0 stroke-red-600 dark:stroke-red-300" aria-hidden="true" />
		<p>Boards are unlisted and accessible to anyone with the link. Do not store secrets.</p>
	</footer>
</div>

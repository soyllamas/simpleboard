<script lang="ts">
	import { detectTrigger, searchEmojis, resolveNodeOffset, type TriggerState } from "$lib/domain/useCase/emoji";
	import type { EmojiEntry } from "$lib/data/emoji-shortcodes";

	type Props = {
		element: HTMLElement | undefined;
		onselect: (emoji: string, triggerState: TriggerState) => void;
	};

	let { element, onselect }: Props = $props();

	let trigger = $state<TriggerState>({ active: false, query: "", triggerOffset: -1, cursorOffset: -1 });
	let results = $derived<EmojiEntry[]>(trigger.active ? searchEmojis(trigger.query) : []);
	let visible = $derived(trigger.active && results.length > 0);
	let selectedIndex = $state(0);

	let top = $state(0);
	let left = $state(0);
	let popoverEl = $state<HTMLDivElement>();

	$effect(() => {
		if (!element) return;

		function onInput() {
			trigger = detectTrigger(element!);
			selectedIndex = 0;

			if (trigger.active && searchEmojis(trigger.query).length > 0) {
				updatePosition();
				popoverEl?.showPopover();
				updateHighlight();
			} else {
				popoverEl?.hidePopover();
				clearHighlight();
			}
		}

		function onBlur() {
			popoverEl?.hidePopover();
			trigger = { active: false, query: "", triggerOffset: -1, cursorOffset: -1 };
			clearHighlight();
		}

		element.addEventListener("input", onInput);
		element.addEventListener("blur", onBlur);
		return () => {
			element!.removeEventListener("input", onInput);
			element!.removeEventListener("blur", onBlur);
			clearHighlight();
		};
	});

	function updatePosition() {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;
		const rect = selection.getRangeAt(0).getBoundingClientRect();
		top = rect.bottom + 4;
		left = rect.left;
	}

	function updateHighlight() {
		if (!element || !trigger.active) {
			clearHighlight();
			return;
		}

		try {
			const start = resolveNodeOffset(element, trigger.triggerOffset);
			const end = resolveNodeOffset(element, trigger.cursorOffset);
			if (!start || !end) return;

			const highlightRange = new Range();
			highlightRange.setStart(start.node, start.offset);
			highlightRange.setEnd(end.node, end.offset);

			const highlight = new Highlight(highlightRange);
			CSS.highlights.set("emoji-query", highlight);
		} catch {
			// Offset errors are non-critical
		}
	}

	function clearHighlight() {
		CSS.highlights?.delete("emoji-query");
	}

	function select(entry: EmojiEntry) {
		onselect(entry.emoji, trigger);
		dismiss();
	}

	function dismiss() {
		trigger = { active: false, query: "", triggerOffset: -1, cursorOffset: -1 };
		popoverEl?.hidePopover();
		clearHighlight();
	}

	function scrollActiveIntoView() {
		const active = popoverEl?.querySelector("[aria-selected='true']");
		active?.scrollIntoView({ block: "nearest" });
	}

	export function handleKeyDown(event: KeyboardEvent): boolean {
		if (!visible) return false;

		if (event.key === "ArrowDown") {
			event.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
			scrollActiveIntoView();
			return true;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
			scrollActiveIntoView();
			return true;
		}

		if (event.key === "Enter") {
			event.preventDefault();
			select(results[selectedIndex]);
			return true;
		}

		if (event.key === "Escape") {
			event.preventDefault();
			dismiss();
			return true;
		}

		return false;
	}
</script>

<div
	bind:this={popoverEl}
	popover="manual"
	role="listbox"
	aria-label="Emoji picker"
	class="fixed z-50 m-0 max-h-64 w-64 overflow-y-auto rounded-2xl bg-white py-1 shadow-lg ring-1 ring-slate-950/10 dark:bg-slate-900 dark:shadow-none dark:ring-white/10"
	style="top: {top}px; left: {left}px;"
>
	{#each results as entry, i (entry.shortcode)}
		<button
			role="option"
			id="emoji-opt-{i}"
			aria-selected={i === selectedIndex}
			class={[
				"flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-950 dark:text-slate-100",
				i === selectedIndex && "bg-slate-100 dark:bg-slate-800"
			]}
			onmousedown={(e) => {
				e.preventDefault();
				select(entry);
			}}
		>
			<span class="text-lg">{entry.emoji}</span>
			<span class="text-slate-600 dark:text-slate-400">:{entry.shortcode}:</span>
		</button>
	{/each}
</div>

<style>
	::highlight(emoji-query) {
		background-color: rgb(219 234 254);
		color: rgb(37 99 235);
	}

	:global(html.dark) ::highlight(emoji-query) {
		background-color: rgb(30 64 175);
		color: rgb(219 234 254);
	}
</style>

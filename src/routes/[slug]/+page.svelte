<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import type { Task } from "$lib/domain/entity/task";
	import Markdoc from "@markdoc/markdoc";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	import equal from "fast-deep-equal";
	import { createTask, updateTask, deleteTask, reorderTasks } from "./board.remote";

	let unsubscribe: any;

	type Column = {
		id: string;
		name: string;
		tasks: Task[];
		instance: HTMLDivElement;
	};

	let menuItems = $state<string[]>([]);

	onMount(async () => {
		nextTaskId = await _generateId();

		// Request focus if tasks are empty
		addTaskInput?.focus();

		// Retrieve recent boards
		let stored = localStorage.getItem("recent");
		if (stored) {
			const recentBoards = JSON.parse(stored) ?? [];
			const isNewBoard = !recentBoards.includes(data.boardId);
			if (isNewBoard) {
				recentBoards.unshift(data.boardId);
			}
			menuItems = recentBoards;
		} else {
			menuItems = [data.boardId];
		}
		stored = JSON.stringify($state.snapshot(menuItems));
		localStorage.setItem("recent", stored);
	});

	onDestroy(() => {
		unsubscribe?.();
	});

	let { data } = $props();
	// svelte-ignore state_referenced_locally
	let tasks = $state(data.tasks ?? []);

	let nextTaskId = "";

	$effect(() => {
		tasks = data.tasks ?? [];
		listenToChanges(data.boardId);
	});

	let todo = $derived(tasks.filter((task) => task.status === "todo"));
	let doing = $derived(tasks.filter((task) => task.status === "doing"));
	let done = $derived(tasks.filter((task) => task.status === "done"));

	let addTask = $state(false);
	let addTaskInput = $state<HTMLDivElement>();

	const columns = $derived([
		{
			id: "todo",
			name: "To-do",
			tasks: todo,
		} as Column,
		{
			id: "doing",
			name: "Doing",
			tasks: doing,
		} as Column,
		{
			id: "done",
			name: "Done",
			tasks: done,
		} as Column,
	]);

	async function listenToChanges(boardId: string) {
		if (!browser) return;

		const { db } = await import("$lib/client/firebase");
		const { doc, onSnapshot } = await import("firebase/firestore");

		unsubscribe?.();
		unsubscribe = onSnapshot(doc(db, "boards", boardId), (snapshot) => {
			const remoteTasks = snapshot.get("tasks") ?? [];
			const taskSnapshot = $state.snapshot(tasks) as Task[];
			const localTasks = taskSnapshot.map(({ id, status, title }) => {
				return { id, status, title };
			});

			if (!equal(localTasks, remoteTasks)) {
				tasks = remoteTasks;
			}
		});
	}

	function onDrag(event: DragEvent, task: Task) {
		event.dataTransfer?.setData("text/plain", task.id);
	}

	async function onDrop(event: DragEvent, status: string) {
		event.preventDefault();

		const taskId = event.dataTransfer?.getData("text/plain");
		const task = tasks.find((task) => task.id === taskId);
		if (!task) return;

		let underTask = null;
		let topZone = Number.MAX_VALUE;
		let bottomZone = 0;

		for (let t of tasks.filter((task) => task.status == status)) {
			const { top, height } = t.instance.getBoundingClientRect();
			const topBound = top - 6;
			const bottomBound = top + height + 6;

			if (topBound < event.clientY && bottomBound > event.clientY) {
				underTask = t;
			}

			if (topBound < topZone) topZone = top;
			if (bottomBound > bottomZone) bottomZone = bottomBound;
		}

		if (underTask == undefined) {
			if (topZone > event.clientY) underTask = tasks[0];
			if (bottomZone < event.clientY) underTask = tasks[tasks.length - 1];
		}

		const underIndex = tasks.indexOf(underTask!);
		const _tasks = tasks.filter((task) => task.id !== taskId);

		const snapshot = $state.snapshot(tasks) as any;
		const oldStatus = task.status;

		task.status = status;
		tasks = _tasks.slice(0, underIndex).concat(task, _tasks.slice(underIndex));

		try {
			const normalizedTasks: Array<{ id: string; status: "todo" | "doing" | "done"; title: string }> = $state
				.snapshot(tasks)
				.map(({ id, status, title }: any) => ({
					id,
					status,
					title,
				}));
			await reorderTasks({
				boardId: data.boardId,
				tasks: normalizedTasks,
			});
		} catch (error) {
			task.status = oldStatus;
			tasks = snapshot as any;
			console.error("Failed to reorder tasks:", error);
		}
	}

	async function onKeyDownUpdateTask(event: KeyboardEvent, task: Task) {
		const isEnter = event.key === "Enter" && !event.shiftKey;
		const isEscape = event.key === "Escape";

		if (isEscape) {
			task.instance.blur();
		}

		if (isEnter) {
			await _updateTask(task);
		}
	}

	async function _updateTask(task: Task) {
		task.instance.blur();

		const snapshot = $state.snapshot(tasks) as any;
		const oldTitle = task.title;

		if (_isEmpty(task.title)) {
			tasks = tasks.filter((item) => item.id !== task.id);

			try {
				await deleteTask({
					boardId: data.boardId,
					taskId: task.id,
				});
			} catch (error) {
				tasks = snapshot as any;
				console.error("Failed to delete task:", error);
			}
		} else {
			task.title = task.title.trim();
			tasks = tasks.map((t) => (t.id === task.id ? { ...t, title: t.title.trim() } : t)) as any;

			try {
				await updateTask({
					boardId: data.boardId,
					task: {
						id: task.id,
						status: task.status as "todo" | "doing" | "done",
						title: task.title,
					},
				});
			} catch (error) {
				task.title = oldTitle;
				tasks = snapshot as any;
				console.error("Failed to update task:", error);
			}
		}
	}

	function onKeyDownCreateTask(event: KeyboardEvent) {
		const isEnter = event.key === "Enter" && !event.shiftKey;
		const isEscape = event.key === "Escape";
		const title = addTaskInput!.innerText;

		if (isEscape) {
			addTaskInput!.innerText = "";
			addTask = false;
		}

		if ((isEnter && _isEmpty(title)) || (isEnter && tasks.length === 0)) {
			event.preventDefault();
		}

		if (isEnter) {
			_createTask(title);
			addTaskInput!.innerText = "";
			addTask = false;
		}
	}

	async function _createTask(title: string) {
		if (_isEmpty(title)) return;

		const taskId = _getId();
		const task = {
			id: taskId,
			status: "todo",
			title: title.trim(),
			editable: false,
		} as Task;

		const snapshot = $state.snapshot(tasks) as any;
		tasks.unshift(task);

		try {
			await createTask({
				boardId: data.boardId,
				task: {
					id: task.id,
					status: task.status as "todo" | "doing" | "done",
					title: task.title,
				},
			});
		} catch (error) {
			tasks = snapshot as any;
			console.error("Failed to create task:", error);
		}
	}

	function onCreateTaskPressed() {
		addTask = true;
		setTimeout(() => {
			addTaskInput?.focus();
			_setCursorAtEnd();
		});
	}

	async function _generateId() {
		if (!browser) return "";

		const { db } = await import("$lib/client/firebase");
		const { collection, doc } = await import("firebase/firestore");
		const boardsRef = collection(db, `boards`);

		return doc(boardsRef).id;
	}

	function _getId() {
		_generateId().then((id) => (nextTaskId = id));
		return nextTaskId;
	}

	function _setCursorAtEnd() {
		const selection = window.getSelection();
		const range = document.createRange();
		range.selectNodeContents(addTaskInput!);
		range.collapse(false);
		selection!.removeAllRanges();
		selection!.addRange(range);
	}

	function toHtml(source: string) {
		const ast = Markdoc.parse(source);
		const content = Markdoc.transform(ast);
		return Markdoc.renderers.html(content);
	}

	function removeRecentBoard(id: string) {
		let stored = localStorage.getItem("recent") ?? "";
		let boardIds = (JSON.parse(stored) ?? []) as string[];
		boardIds = boardIds.filter((boardId) => boardId != id);
		menuItems = boardIds;
		if (id === data.boardId && menuItems.length > 0) goto(menuItems[0]);
		stored = JSON.stringify(boardIds);
		localStorage.setItem("recent", stored);
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(data.link);
	}

	function onTaskClicked(event: MouseEvent, task: Task) {
		// @ts-ignore
		const isATag = event.target?.tagName.toLowerCase() === "a";
		if (isATag) {
			// @ts-ignore
			event.target.setAttribute("target", "_blank");
			event.stopPropagation();
		} else {
			task.editable = true;
			setTimeout(() => {
				task.instance.focus();
				let selection = window.getSelection();
				selection?.selectAllChildren(task.instance);
				selection?.collapseToEnd();
			});
		}
	}

	function _isEmpty(value: string) {
		return value.trim().length === 0;
	}
</script>

<script:head>
	<title>#{data.boardId}</title>
</script:head>

<div class="group">
	<button
		class="absolute bg-white top-6 right-6 md:left-6 rounded-lg border border-slate-300 w-8 h-8 grid items-center justify-center"
		aria-label="Home"
	>
		<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20">
			<path
				d="M180-264q-15.3 0-25.65-10.29Q144-284.58 144-299.79t10.35-25.71Q164.7-336 180-336h600q15.3 0 25.65 10.29Q816-315.42 816-300.21t-10.35 25.71Q795.3-264 780-264H180Zm0-180q-15.3 0-25.65-10.29Q144-464.58 144-479.79t10.35-25.71Q164.7-516 180-516h600q15.3 0 25.65 10.29Q816-495.42 816-480.21t-10.35 25.71Q795.3-444 780-444H180Zm0-180q-15.3 0-25.65-10.29Q144-644.58 144-659.79t10.35-25.71Q164.7-696 180-696h600q15.3 0 25.65 10.29Q816-675.42 816-660.21t-10.35 25.71Q795.3-624 780-624H180Z"
			/>
		</svg>
	</button>
	<div
		class="z-50 h-dvh absolute top-0 w-64 bg-white border-r border-slate-300 -translate-x-64 group-hover:translate-x-0 duration-300 py-4 px-[14px]"
	>
		<div class="rounded-lg hover:bg-slate-100 cursor-pointer">
			<a href="/">
				<h3 class="font-bold text-xl mx-[10px] pt-2">SimpleBoard</h3>
				<p class="text-[11px] text-slate-500 font-normal mb-6 mx-[10px] pb-2">Kanban for minimalists</p>
			</a>
		</div>
		<p class="text-slate-500 mb-2 px-[10px] text-[12px] font-medium">Recent</p>
		{#each menuItems as menuItem}
			<div
				class="flex items-center rounded-lg px-[10px] py-[6px] mb-1 group/item"
				class:bg-slate-100={menuItem === data.boardId}
			>
				<a class="text-sm block w-full group-hover/item:underline align-middle" href={menuItem}>
					#{menuItem}
				</a>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="hidden group-hover/item:block fill-slate-400 cursor-pointer"
					height="20px"
					viewBox="0 -960 960 960"
					width="20px"
					onclick={() => removeRecentBoard(menuItem)}
					role="none"
				>
					<path
						d="M480-429 316-265q-11 11-25 10.5T266-266q-11-11-11-25.5t11-25.5l163-163-164-164q-11-11-10.5-25.5T266-695q11-11 25.5-11t25.5 11l163 164 164-164q11-11 25.5-11t25.5 11q11 11 11 25.5T695-644L531-480l164 164q11 11 11 25t-11 25q-11 11-25.5 11T644-266L480-429Z"
					/>
				</svg>
			</div>
		{/each}
	</div>
</div>
<div class="max-w-[960px] mx-auto px-4">
	<h1
		class="inline-block text-slate-950 text-2xl font-bold my-8 hover:underline cursor-pointer"
		onclick={() => copyToClipboard()}
		role="none"
	>
		#{data.boardId}
	</h1>
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
		{#each columns as column (column.id)}
			<div
				class="md:flex md:flex-col md:min-h-[80vh]"
				ondrop={(event) => onDrop(event, column.id)}
				ondragover={(e) => e.preventDefault()}
				role="none"
			>
				<div class="flex">
					<p class="text-slate-950 font-semibold rounded-t-lg flex-grow">{column.name}</p>
					{#if column.id === "todo" && tasks.length > 0}
						<div class="flex-wrap hover:cursor-pointer" onclick={() => onCreateTaskPressed()} role="none">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="24"
								viewBox="0 -960 960 960"
								width="24"
								class="fill-amber-950 rounded-md hover:bg-slate-50"
							>
								<path
									d="M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z"
								/>
							</svg>
						</div>
					{/if}
				</div>
				<div>
					{#if column.id === "todo"}
						<div
							contenteditable="plaintext-only"
							class="rounded-lg my-3 box-border cursor-default selected text-slate-700 whitespace-pre-line min-h-4 bg-white p-4 outline-none"
							class:hidden={!addTask && tasks.length !== 0}
							onfocusin={() => (addTask = true)}
							onfocusout={() => (addTask = false)}
							onkeydown={(event) => onKeyDownCreateTask(event)}
							bind:this={addTaskInput}
							role="none"
						></div>
					{/if}
					{#each column.tasks as task (task.id)}
						{#if task.editable}
							<div
								contenteditable="plaintext-only"
								onkeydown={(event) => onKeyDownUpdateTask(event, task)}
								onblur={() => (task.editable = false)}
								class="selected box-border cursor-text rounded-lg text-slate-700 my-3 skew-x-0 whitespace-pre-line p-4 min-h-4 outline-none"
								bind:this={task.instance}
								bind:innerText={task.title}
								role="none"
							></div>
						{:else}
							<div
								class="rounded-lg box-border border border-slate-300 my-3 skew-x-0 cursor-default text-slate-700 whitespace-pre-line min-h-[58px] px-4 pt-4 bg-white"
								draggable="true"
								onclick={(event) => onTaskClicked(event, task)}
								ondragstart={(event) => onDrag(event, task)}
								bind:this={task.instance}
								role="none"
							>
								{@html toHtml(task.title)}
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="postcss">
	.selected {
		border: 2px solid rgb(37 99 235);
		padding: 15px;
	}

	:global(article > *) {
		margin-bottom: 1rem;
		overflow-wrap: break-word;
	}

	:global(article code) {
		background-color: rgb(241 245 249);
		padding-left: 0.25rem;
		padding-right: 0.25rem;
		padding-top: 0.125rem;
		padding-bottom: 0.125rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	:global(article ul) {
		padding-left: 1rem;
		list-style-type: disc;
	}

	:global(article ol) {
		padding-left: 1rem;
		list-style-type: decimal;
	}

	:global(article a) {
		color: rgb(37 99 235);
		text-decoration: underline;
	}
</style>

<script:head>
    <title>SimpleBoard — Kanban for minimalists</title>
    <meta name="description" content="A very simple kanban board for minimalists.">
</script:head>

<script lang="ts">
    import {sanitize} from "$lib/domain/useCase/sanitize";
    import {goto} from "$app/navigation";

    let {data} = $props();
    let boardId = $state(data.boardId);
    let url = $derived(sanitize(boardId))
    let domain = $state(data.domain);

    function onKeyDown(event: KeyboardEvent) {
        const isEnter = event.key === 'Enter' && !event.shiftKey
        if (isEnter) {
            goto(url)
        }
    }
</script>

<div class="max-w-md mx-auto px-4 h-dvh">
    <h1 class="text-slate-950 text-[32px] font-bold pt-8 md:pt-24 text-center">SimpleBoard</h1>
    <h2 class="text-slate-600 pb-16 md:pb-16 text-center">Kanban for minimalists.</h2>
    <div class="flex mx-auto">
        <p class="text-[1rem] bg-slate-100 border-t border-l border-b rounded-l-lg px-3 py-1.5 text-slate-700 border-slate-300 shrink-0">
            {`${domain}/`}
        </p>
        <input type="text"
               placeholder="my-board"
               class="text-[1rem] bg-slate-50 px-3 py-1.5 outline-blue-600 border border-slate-300 text-slate-700 flex-grow min-w-0"
               minlength="10"
               onkeydown={(event) => onKeyDown(event)}
               bind:value={boardId}>
        <a class="bg-blue-600 text-slate-50 rounded-r-lg px-4 py-1.5 shrink-0"
           href={url}>
            Join
        </a>
    </div>
    <h2 class="mt-24 text-xl font-semibold">Use Cases</h2>
    <ul class="list-disc mx-auto pl-8 mt-4">
        <li>Mob-programming.</li>
        <li>Personal project.</li>
        <li>Mind-dump.</li>
    </ul>
    <h2 class="mt-12 text-xl font-semibold">Features</h2>
    <ul class="list-disc mx-auto pl-8 mt-4">
        <li>It's free!</li>
        <li>No account required.</li>
        <li>As collaborative as sharing a link.</li>
    </ul>
</div>

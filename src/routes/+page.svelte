<script:header>
    <title>SimpleBoard — Kanban for minimalists</title>
</script:header>
<script>
    import {goto} from "$app/navigation";

    let {data} = $props();
    let boardId = $state(data.boardId);
</script>

<div class="max-w-[960px] mx-auto px-4 h-dvh">
    <h1 class="text-slate-950 text-[32px] font-bold pt-8 md:pt-24 text-center">SimpleBoard</h1>
    <h2 class="text-slate-600 pb-16 md:pb-16 text-center">Kanban for minimalists.</h2>
    <div class="flex justify-center mx-auto">
        <p class="text-[1rem] bg-slate-200 border-t border-l border-b rounded-l-lg px-3 py-1.5 text-slate-700 border-slate-300">
            simpleboard.app/
        </p>
        <input type="text"
               placeholder="my-board"
               class="text-[1rem] bg-slate-100 px-3 py-1.5 outline-blue-600 border border-slate-300 text-slate-700 w-auto"
               bind:value={boardId}>
        <button class="bg-blue-600 text-slate-50 rounded-r-lg px-4"
                onclick={() => goto(boardId)}>
            Join
        </button>
    </div>
</div>

<style>
    .input {
        grid-template-columns: auto auto 64px;
    }
</style>
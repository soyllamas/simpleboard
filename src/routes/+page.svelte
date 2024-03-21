<script:head>
    <title>SimpleBoards - Kanban boards for everyday use.</title>
</script:head>

<script lang="ts">

    let currentHover = $state('');
    let tasks = $state([
        {
            "id": "1",
            "status": "todo",
            "title": "We are logging handled errors to Sentry and Crashlytics.\n\n@Daniel Llamas",
        },
        {
            "id": "2",
            "status": "todo",
            "title": "Provide viewmodel dependencies through constructor.\n\n@Jason Pace",
        },
        {
            "id": "3",
            "status": "doing",
            "title": "Duplicate API calls on rebuilds of widgets.\n\nJhionan is working as a task in current sprint.",
        }
    ]);

    $inspect(currentHover)

    let todo = $derived.by(() => {
        return tasks.filter((task) => task.status === 'todo');
    });

    let doing = $derived.by(() => {
        return tasks.filter((task) => task.status === 'doing');
    });

    let done = $derived.by(() => {
        return tasks.filter((task) => task.status === 'done');
    });

    function onDrag(event: DragEvent, id: string) {
        event.dataTransfer?.setData('text/plain', id);
        console.log(`dragged item`);
    }

    function onDrop(event: DragEvent, status: string) {
        console.log(`dropped item`)
        event.preventDefault()
        const taskId = event.dataTransfer?.getData("text/plain")
        const taskIndex = tasks.findIndex((task) => task.id == taskId)
        tasks[taskIndex].status = status
        currentHover = ""
    }

</script>

<div class="max-w-[960px] mx-auto">
    <h1 class="text-slate-950 text-[32px] font-bold pt-[40px]">Simple Boards</h1>
    <h2 class="text-slate-600 pb-[80px]">Kanban boards for everyday use.</h2>
    <div class="grid grid-cols-3 gap-[12px]">
        <div class="bg-slate-50 rounded-[8px] px-[12px] box-content border-transparent border-2"
             class:hovering={currentHover === "todo"}
             ondragenter={() => currentHover = "todo"}
             ondragleave={() => currentHover = ""}
             ondrop={(event) => onDrop(event, "todo")}
             ondragover={e => e.preventDefault()}
             role="none">
            <p class="font-semibold py-[12px]">To-do</p>
            {#each todo as {title, id}}
                <div draggable="true" ondragstart={(event) => onDrag(event, id)}
                     class="bg-white rounded-[8px] p-[12px] border-slate-300 border-[1px] cursor-pointer mb-[12px] skew-x-0"
                     role="none">
                    <p class="text-slate-500 whitespace-pre-line">{title}</p>
                </div>
            {/each}
        </div>
        <div class="bg-slate-50 rounded-[8px] px-[12px] box-content border-transparent border-2"
             class:hovering={currentHover === "doing"}
             ondragenter={() => currentHover = "doing"}
             ondragleave={() => currentHover = ""}
             ondrop={(event) => onDrop(event, "doing")}
             ondragover={e => e.preventDefault()}
             role="list">
            <p class="font-semibold py-[12px]">Doing</p>
            {#each doing as {title, id}}
                <div draggable="true" ondragstart={(event) => onDrag(event, id)}
                     class="bg-white rounded-[8px] p-[12px] border-slate-300 border-[1px] cursor-pointer mb-[12px] skew-x-0"
                     role="listitem">
                    <p class="text-slate-500 whitespace-pre-line">{title}</p>
                </div>
            {/each}
        </div>
        <div class="bg-slate-50 rounded-[8px] px-[12px] box-content border-transparent border-2"
             class:hovering={currentHover === "done"}
             ondragenter={() => currentHover = "done"}
             ondragleave={() => currentHover = ""}
             ondrop={(event) => onDrop(event, "done")}
             ondragover={e => e.preventDefault()}
             role="list">
            <p class="font-semibold py-[12px]">Done</p>
            {#each done as {title, id}}
                <div draggable="true" ondragstart={(event) => onDrag(event, id)}
                     class="bg-white rounded-[8px] p-[12px] border-slate-300 border-[1px] cursor-pointer mb-[12px] skew-x-0"
                     role="listitem">
                    <p class="text-slate-500 whitespace-pre-line">{title}</p>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .hovering {
        @apply border-slate-500;
    }

    :global(.hovering) * {
        pointer-events: none;
    }
</style>

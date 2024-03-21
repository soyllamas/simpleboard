<script:head>
    <title>SimpleBoards - Kanban boards for everyday use.</title>
</script:head>

<script>

    let tasks = $state([
        {
            "status": "todo",
            "title": "We are logging handled errors to Sentry and Crashlytics.\n\n@Daniel Llamas",
        },
        {
            "status": "todo",
            "title": "Provide viewmodel dependencies through constructor.\n\n@Jason Pace",
        },
        {
            "status": "doing",
            "title": "Duplicate API calls on rebuilds of widgets.\n\nJhionan is working as a task in current sprint.",
        }
    ]);

    let todo = $derived.by(() => {
        return tasks.filter((task) => task.status === 'todo');
    });

    let doing = $derived.by(() => {
        return tasks.filter((task) => task.status === 'doing');
    });

    let done = $derived.by(() => {
        return tasks.filter((task) => task.status === 'done');
    });

</script>

<div class="max-w-[960px] mx-auto">
    <h1 class="text-slate-950 text-[32px] font-bold pt-[40px]">Simple Boards</h1>
    <h2 class="text-slate-600 pb-[80px]">Kanban boards for everyday use.</h2>
    <div class="grid grid-cols-3 gap-[12px]">
        <div class="bg-slate-50 rounded-[8px] px-[12px]">
            <p class="font-semibold py-[12px]">To-do</p>
            {#each todo as {title}}
                <div class="bg-white rounded-[8px] p-[12px] border-[1px] cursor-pointer mb-[12px]">
                    <p class="text-slate-500 whitespace-pre-line">{title}</p>
                </div>
            {/each}
        </div>
        <div class="bg-slate-50 rounded-[8px] px-[12px]">
            <p class="font-semibold py-[12px]">Doing</p>
            {#each doing as {title}}
                <div class="bg-white rounded-[8px] p-[12px] border-[1px] cursor-pointer mb-[12px]">
                    <p class="text-slate-500 whitespace-pre-line">{title}</p>
                </div>
            {/each}
        </div>
        <div class="bg-slate-50 rounded-[8px] px-[12px]">
            <p class="font-semibold py-[12px]">Done</p>
            {#each done as {title}}
                <div class="bg-white rounded-[8px] p-[12px] border-[1px] cursor-pointer mb-[12px]">
                    <p class="text-slate-500 whitespace-pre-line">{title}</p>
                </div>
            {/each}
        </div>
    </div>
</div>

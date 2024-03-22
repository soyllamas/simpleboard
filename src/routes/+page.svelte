<script:head>
    <title>SimpleBoards - Kanban boards for everyday use.</title>
</script:head>

<script lang="ts">


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


    let todo = $derived.by(() => {
        return tasks.filter((task) => task.status === "todo");
    });

    let doing = $derived.by(() => {
        return tasks.filter((task) => task.status === "doing");
    });

    let done = $derived.by(() => {
        return tasks.filter((task) => task.status === "done");
    });

    const columns = $derived([
        {
            "id": "todo",
            "name": "To-do",
            "tasks": todo
        },
        {
            "id": "doing",
            "name": "Doing",
            "tasks": doing
        },
        {
            "id": "done",
            "name": "Done",
            "tasks": done
        }
    ])

    function onDrag(event: DragEvent, id: string) {
        event.dataTransfer?.setData('text/plain', id);
    }

    function onDrop(event: DragEvent, status: string) {
        event.preventDefault()

        const taskId = event.dataTransfer?.getData("text/plain")
        const task = tasks.find((task) => task.id === taskId)

        if (task!.status == status) return

        tasks = tasks.filter((task) => task.id !== taskId)

        task!.status = status
        tasks.push(task!)
    }

    function onCreateTask() {

    }

</script>

<div class="max-w-[960px] mx-auto">
    <h1 class="text-slate-950 text-[32px] font-bold pt-[40px]">Simple Boards</h1>
    <h2 class="text-slate-600 pb-[80px]">Kanban boards for everyday use.</h2>
    <div class="grid grid-cols-3 gap-[12px]">
        {#each columns as {id, name, tasks}}
            <div class="bg-slate-50 rounded-[8px] px-[12px] box-content border-transparent border-2"
                 ondrop={(event) => onDrop(event, id)}
                 ondragover={e => e.preventDefault()}
                 role="none">
                <p class="font-semibold py-[12px]">{name}</p>
                {#each tasks as {title, id}}
                    <div draggable="true" ondragstart={(event) => onDrag(event, id)}
                         class="bg-white rounded-[8px] p-[16px] border-slate-300 border-[1px] cursor-pointer mb-[12px] skew-x-0"
                         role="none">
                        <div contenteditable="true" class="text-slate-600 whitespace-pre-line">{title}</div>
                    </div>
                {/each}
                {#if id === "todo"}
                    <div class="flex justify-start px-3 py-2 rounded-[8px] border-[1px] border-transparent hover:border-slate-300 hover:bg-white cursor-pointer mb-[12px]">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                            <path d="M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z"/>
                        </svg>
                        <p class="pl-1">Create task</p>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>

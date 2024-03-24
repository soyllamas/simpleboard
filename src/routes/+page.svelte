<script:head>
    <title>SimpleBoards — Kanban for the rest of us.</title>
</script:head>

<script lang="ts">
    import {browser} from "$app/environment";
    import {debounceTime, Subject, Subscription} from 'rxjs';
    import {onDestroy, onMount} from "svelte";
    import type {Task} from "$lib/domain/entity/task";

    let subscription: Subscription
    const observable = new Subject<Task>();

    onMount(async () => {
        // Set debounce observer
        const debounceTimeInMills = debounceTime<Task>(1000)
        const debouncedObservable = observable.pipe(debounceTimeInMills)
        subscription = debouncedObservable.subscribe(_updateInTheBackend);
    })

    onDestroy(() => subscription?.unsubscribe())

    let {data} = $props();
    let tasks = $state(data.tasks)

    let todo = $derived.by(() => {
        return tasks.filter((task) => task.status === "todo");
    });

    let doing = $derived.by(() => {
        return tasks.filter((task) => task.status === "doing");
    });

    let done = $derived.by(() => {
        return tasks.filter((task) => task.status === "done");
    });

    let addTask = $state(false);
    let addTaskInput = $state<HTMLDivElement>();

    const columns = $derived([
        {
            "id": "todo",
            "name": "To-do",
            "tasks": todo,
        },
        {
            "id": "doing",
            "name": "Doing",
            "tasks": doing,
        },
        {
            "id": "done",
            "name": "Done",
            "tasks": done,
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
        observable.next(task!)
    }

    function onKeyDownUpdateTask(event: KeyboardEvent, task: Task) {
        const isEnter = event.key === 'Enter' && !event.shiftKey
        if (isEnter) {
            _updateTask(task)
            observable.next(task)
        }
    }

    function _updateTask(task: Task) {
        task.instance.blur()
        if (task.title === '') {
            tasks = tasks.filter((t) => t.id !== task.id)
        }
    }

    function onKeyDownCreateTask(event: KeyboardEvent) {
        const isEnter = event.key === 'Enter' && !event.shiftKey
        if (isEnter) {
            _createTask()
            addTaskInput!.innerText = ''
            addTask = false
        }
    }

    async function _createTask() {
        const isNotEmpty = addTaskInput!.innerText.length > 0
        if (isNotEmpty) {
            const task = {
                "status": "todo",
                "title": addTaskInput?.innerText,
                "editable": false,
            } as Task
            tasks.push(task)
            observable.next(task)
        }
    }

    function onCreateTaskPressed() {
        addTask = true
        setTimeout(() => {
            addTaskInput?.focus();
            _setCursorAtEnd()
        })
    }

    // TODO: Validate the task did change to save on Firebase quota costs.
    async function _updateInTheBackend(task: Task) {
        if (browser) {
            let {collection, doc, setDoc, deleteDoc, serverTimestamp} = await import("@firebase/firestore")
            let {db} = await import("$lib/client/firebase")

            const isCreate = task.id == undefined
            const isUpdate = task.id != undefined
            const isDelete = task.title === ""

            const tasksRef = collection(db, "boards/first-board/tasks")
            const taskId = isCreate ? doc(tasksRef).id : task.id
            const taskRef = doc(tasksRef, taskId)

            if (isDelete) {
                console.log(`delete: ${task.id}`)
                return await deleteDoc(taskRef)
            }

            if (isCreate) {
                task.id = taskRef.id
                console.log(`create: ${task.id}`)
                return await setDoc(taskRef, {
                    "id": taskRef.id,
                    "status": task.status,
                    "title": task.title,
                    "createdAt": serverTimestamp()
                })
            }

            if (isUpdate) {
                console.log(`update: ${task.id}`)
                return await setDoc(taskRef, {
                    "id": taskRef.id,
                    "status": task.status,
                    "title": task.title,
                    "updatedAt": serverTimestamp()
                }, {merge: true})
            }


        }
    }

    function _setCursorAtEnd() {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(addTaskInput!);
        range.collapse(false);
        selection!.removeAllRanges();
        selection!.addRange(range);
    }

</script>

<div class="max-w-[960px] mx-auto px-4">
    <h1 class="text-slate-950 text-[32px] font-bold pt-[40px]">SimpleBoards</h1>
    <h2 class="text-slate-600 pb-[80px]">Kanban for the rest of us.</h2>
    <div class="grid grid-cols-3 gap-[12px]">
        {#each columns as {id, name, tasks}}
            <div class="bg-slate-50 rounded-[8px] px-[12px] box-content border-transparent border-2"
                 ondrop={(event) => onDrop(event, id)}
                 ondragover={e => e.preventDefault()}
                 role="none">
                <p class="font-semibold py-[12px]">{name}</p>
                {#each tasks as task}
                    <div draggable="true"
                         ondragstart={(event) => onDrag(event, task.id)}
                         class="rounded-[8px] border-[1px] border-slate-300 mb-[12px] skew-x-0 cursor-pointer"
                         class:selected={task.editable}
                         role="none">
                        <div class="bg-white rounded-[7px] p-[16px] border-transparent border-[1px]"
                             class:selected={task.editable}>
                            <div contenteditable="true"
                                 class="text-slate-600 whitespace-pre-line min-h-4 outline-none"
                                 onfocusin={() => task.editable = true}
                                 onfocusout={() => task.editable = false}
                                 onkeydown={(event) => onKeyDownUpdateTask(event, task)}
                                 bind:this={task.instance}
                                 bind:innerText={task.title}
                                 role="none">
                            </div>
                        </div>
                    </div>
                {/each}
                {#if id === "todo"}
                    <div class="rounded-[8px] border-[1px] border-slate-300 mb-[12px] skew-x-0 cursor-pointer selected"
                         class:hidden={!addTask}
                         role="none">
                        <div class="bg-white rounded-[7px] p-[16px] border-transparent border-[1px] selected">
                            <div contenteditable="true"
                                 class="text-slate-600 whitespace-pre-line min-h-4 outline-none"
                                 onfocusin={() => addTask = true}
                                 onfocusout={() => addTask = false}
                                 onkeydown={(event) => onKeyDownCreateTask(event)}
                                 bind:this={addTaskInput}
                                 role="none">
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-start px-3 py-2 rounded-[8px] border-[1px] border-transparent group hover:border-slate-300 hover:bg-white cursor-pointer mb-[12px]"
                         onclick={() => onCreateTaskPressed()}
                         role="none">
                        <svg xmlns="http://www.w3.org/2000/svg"
                             height="24"
                             viewBox="0 -960 960 960"
                             width="24"
                             class="fill-slate-400 group-hover:fill-slate-700">
                            <path d="M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z"/>
                        </svg>
                        <p class="pl-1 text-slate-400 group-hover:text-slate-700">Create task</p>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
    .selected {
        @apply box-border border-[1px] border-blue-600;
    }
</style>

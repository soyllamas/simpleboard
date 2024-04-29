<script:head>
    <title>#{boardId}</title>
</script:head>

<script lang="ts">
    import {debounceTime, Subject, Subscription} from 'rxjs';
    import {onDestroy, onMount} from "svelte";
    import type {Task} from "$lib/domain/entity/task";

    let subscription: Subscription
    const observable = new Subject<Task>();

    type Column = {
        id: string,
        name: string,
        tasks: Task[],
        instance: HTMLDivElement,
    }

    let menuItems = $state<string[]>([])

    onMount(async () => {
        // Start Analytics
        let {analytics} = await import("$lib/client/firebase")

        // Set debounce observer
        const debounceTimeInMills = debounceTime<Task>(1000)
        const debouncedObservable = observable.pipe(debounceTimeInMills)
        subscription = debouncedObservable.subscribe(_updateInTheBackend);

        // Retrieve recent boards
        let data = localStorage.getItem('recent');
        if (data) {
            const recentBoards = JSON.parse(data) ?? [];
            const isNewBoard = !recentBoards.includes(boardId)
            if (isNewBoard) {
                recentBoards.unshift(boardId);
            }
            menuItems = recentBoards
        } else {
            menuItems = [boardId]
        }
        data = JSON.stringify($state.snapshot(menuItems))
        localStorage.setItem('recent', data)
    })

    onDestroy(() => subscription?.unsubscribe())

    let {data} = $props()
    let tasks = $state(data.tasks)
    let boardId = $state(data.boardId)

    $effect(() => {
        boardId = data.boardId
        tasks = data.tasks
    });

    let todo = $derived(tasks.filter((task) => task.status === "todo"));
    let doing = $derived(tasks.filter((task) => task.status === "doing"));
    let done = $derived(tasks.filter((task) => task.status === "done"));

    let addTask = $state(false);
    let addTaskInput = $state<HTMLDivElement>();

    const columns = $derived([
        {
            "id": "todo",
            "name": "To-do",
            "tasks": todo,
        } as Column,
        {
            "id": "doing",
            "name": "Doing",
            "tasks": doing,
        } as Column,
        {
            "id": "done",
            "name": "Done",
            "tasks": done,
        } as Column,
    ])


    function onDrag(event: DragEvent, task: Task) {
        event.dataTransfer?.setData('text/plain', task.id)
    }

    function onDrop(event: DragEvent, status: string) {
        event.preventDefault()

        const taskId = event.dataTransfer?.getData("text/plain")
        const task = tasks.find((task) => task.id === taskId)

        if (task!.status == status) return

        tasks = tasks.filter((task) => task.id !== taskId)

        task!.status = status
        tasks.unshift(task!)
        observable.next(task!)
    }

    function onKeyDownUpdateTask(event: KeyboardEvent, task: Task) {
        const isEnter = event.key === 'Enter' && !event.shiftKey
        const isEscape = event.key === 'Escape'

        if (isEscape) {
            task.instance.blur()
        }

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
        const isEscape = event.key === 'Escape'

        if (isEscape) {
            addTaskInput!.innerText = ''
            addTask = false
        }

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
            tasks.unshift(task)
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
        let {logEvent} = await import("@firebase/analytics")
        let {collection, doc, setDoc, deleteDoc, serverTimestamp} = await import("@firebase/firestore")
        let {db, analytics} = await import("$lib/client/firebase")

        const boardId = window.location.pathname.slice(1);

        const isCreate = task.id == undefined
        const isUpdate = task.id != undefined
        const isDelete = task.title === ""

        const tasksRef = collection(db, `boards/${boardId}/tasks`)
        const taskId = isCreate ? doc(tasksRef).id : task.id
        const taskRef = doc(tasksRef, taskId)

        if (isDelete) {
            logEvent(analytics, 'deleted_task')
            return await deleteDoc(taskRef)
        }

        if (isCreate) {
            task.id = taskRef.id
            logEvent(analytics, 'created_task')
            return await setDoc(taskRef, {
                "id": taskRef.id,
                "status": task.status,
                "title": task.title,
                "createdAt": serverTimestamp(),
                "updatedAt": serverTimestamp()
            })
        }

        if (isUpdate) {
            logEvent(analytics, 'updated_task')
            return await setDoc(taskRef, {
                "id": taskRef.id,
                "status": task.status,
                "title": task.title,
                "updatedAt": serverTimestamp()
            }, {merge: true})
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

<div class="fixed group z-50">
    <button class="absolute bg-white top-6 left-6 rounded-lg border border-slate-300 w-8 h-8 grid items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20">
            <path d="M180-264q-15.3 0-25.65-10.29Q144-284.58 144-299.79t10.35-25.71Q164.7-336 180-336h600q15.3 0 25.65 10.29Q816-315.42 816-300.21t-10.35 25.71Q795.3-264 780-264H180Zm0-180q-15.3 0-25.65-10.29Q144-464.58 144-479.79t10.35-25.71Q164.7-516 180-516h600q15.3 0 25.65 10.29Q816-495.42 816-480.21t-10.35 25.71Q795.3-444 780-444H180Zm0-180q-15.3 0-25.65-10.29Q144-644.58 144-659.79t10.35-25.71Q164.7-696 180-696h600q15.3 0 25.65 10.29Q816-675.42 816-660.21t-10.35 25.71Q795.3-624 780-624H180Z"/>
        </svg>
    </button>
    <div class="sidebar-height absolute rounded-lg top-0 w-56 bg-white border border-slate-300 m-4 translate-x-[-248px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-300 scale-90 group-hover:scale-100 py-6 px-[14px]">
        <h3 class="font-bold text-xl mx-[10px]">SimpleBoard</h3>
        <p class="text-[11px] text-slate-500 font-normal mb-6 mx-[10px]">Kanban for minimalists</p>
        {#each menuItems as menuItem}
            <a class="text-sm py-[6px] px-[10px] rounded-lg block w-full hover:underline mb-1"
               class:bg-slate-100={menuItem === boardId}
               href="{menuItem}">
                #{menuItem}
            </a>
        {/each}
    </div>
</div>
<div class="max-w-[960px] mx-auto px-4">
    <h1 class="inline-block text-slate-950 text-2xl font-bold my-8 hover:underline cursor-pointer"
        onclick={() => console.log("Copy to clipboard + show toast")}
        role="none">
        #{boardId}
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {#each columns as column}
            <div class="md:flex md:flex-col md:min-h-[80vh]"
                 ondrop={(event) => onDrop(event, column.id)}
                 ondragover={e => e.preventDefault()}
                 role="none">
                <div class="flex">
                    <p class="text-slate-950 font-semibold rounded-t-lg flex-grow">{column.name}</p>
                    {#if column.id === "todo"}
                        <div class="flex-wrap hover:cursor-pointer"
                             onclick={() => onCreateTaskPressed()} role="none">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 height="24"
                                 viewBox="0 -960 960 960"
                                 width="24"
                                 class="fill-amber-950 rounded-md hover:bg-slate-50">
                                <path d="M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z"/>
                            </svg>
                        </div>
                    {/if}
                </div>
                <div class="mb-3"
                     bind:this={column.instance}>
                    {#if column.id === "todo"}
                        <div contenteditable="true"
                             class="rounded-lg mt-3 box-border cursor-default selected text-slate-700 whitespace-pre-line min-h-4 bg-white p-4"
                             class:hidden={!addTask}
                             onfocusin={() => addTask = true}
                             onfocusout={() => addTask = false}
                             onkeydown={(event) => onKeyDownCreateTask(event)}
                             bind:this={addTaskInput}
                             role="none">
                        </div>
                    {/if}
                    {#each column.tasks as task}
                        {#if task.editable}
                            <div contenteditable="true"
                                 onkeydown={(event) => onKeyDownUpdateTask(event, task)}
                                 onblur={() => task.editable = false}
                                 class="selected box-border cursor-text rounded-lg text-slate-700 mt-3 skew-x-0 whitespace-pre-line p-4 min-h-4"
                                 bind:this={task.instance}
                                 bind:innerText={task.title}
                                 role="none">
                            </div>
                        {:else}
                            <p class="rounded-lg box-border border border-slate-300 mt-3 skew-x-0 cursor-default text-slate-700 whitespace-pre-line min-h-4 p-4 bg-white"
                               draggable="true"
                               onclick={() => {task.editable = true; setTimeout(() => task.instance.focus())}}
                               ondragstart={(event) => onDrag(event, task)}
                               role="none">
                                {task.title}
                            </p>
                        {/if}
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .selected {
        @apply border-blue-600 border-2 p-[15px];
    }

    .sidebar-height {
        height: calc(100vh - 32px);
    }
</style>

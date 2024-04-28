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

    onMount(async () => {
        // Start Analytics
        let {analytics} = await import("$lib/client/firebase")

        // Set debounce observer
        const debounceTimeInMills = debounceTime<Task>(1000)
        const debouncedObservable = observable.pipe(debounceTimeInMills)
        subscription = debouncedObservable.subscribe(_updateInTheBackend);
    })

    onDestroy(() => subscription?.unsubscribe())

    let {data} = $props();
    let tasks = $state(data.tasks)
    let boardId = $state(data.boardId)

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
        task.editable = true
    }

    function onDrop(event: DragEvent, status: string) {
        event.preventDefault()

        const taskId = event.dataTransfer?.getData("text/plain")
        const task = tasks.find((task) => task.id === taskId)

        if (task!.status == status) return

        tasks = tasks.filter((task) => task.id !== taskId)

        task!.status = status
        task!.editable = false
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

<div class="max-w-[960px] mx-auto px-4">
    <h1 class="text-slate-950 text-2xl font-bold py-8">#{boardId}</h1>
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
                        <div class="rounded-lg border border-slate-300 mt-3 skew-x-0 cursor-pointer selected"
                             class:hidden={!addTask}
                             role="none">
                            <div class="bg-white rounded-[7px] p-4 border-transparent border selected">
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
                    {/if}
                    {#each column.tasks as task}
                        <div draggable="true"
                             ondragstart={(event) => onDrag(event, task)}
                             class="rounded-lg border border-slate-300 mt-3 skew-x-0 cursor-pointer"
                             class:selected={task.editable}
                             role="none">
                            <div class="bg-white rounded-[7px] p-4 border-transparent border"
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
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .selected {
        @apply box-border border border-blue-600;
    }
</style>

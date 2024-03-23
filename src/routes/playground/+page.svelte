<script lang="ts">
    import {debounceTime, Subject, Subscription} from 'rxjs';
    import {onDestroy, onMount} from "svelte";

    let times = $state(0)
    let subscription: Subscription
    const observable = new Subject<number>();

    onMount(() => {
        const debounceTimeInMills = debounceTime(1000)
        const debouncedObservable = observable.pipe(debounceTimeInMills)
        subscription = debouncedObservable.subscribe(_onClick);
    })

    onDestroy(() => subscription?.unsubscribe())

    function _onClick() {
        times++
    }
</script>

<div class="h-dvh grid grid-cols-1 gap-4">
    <p class="self-end justify-self-center">Pressed {times} times</p>
    <button class="self-start justify-self-center px-4 bg-slate-950 rounded-lg min-h-12 min-w-6 border-[1px] border-slate-700 text-slate-50"
            onclick={() => observable.next(times)}>
        Click Me!
    </button>
</div>

<script>
    let times = $state(0)

    function onClick() {
        times++
    }
</script>

<div class="h-dvh grid grid-cols-1 gap-4">
    <p class="self-end justify-self-center">Pressed {times} times</p>
    <button class="self-start justify-self-center px-4 bg-slate-950 rounded-lg min-h-12 min-w-6 border-[1px] border-slate-700 text-slate-50"
            onclick={() => onClick()}>
        Click Me!
    </button>
</div>

# teeny clock

a simple analog + digital clock with sounds

## how to use it

read the clock & listen to the sounds. every hour there's a bell that dings for
each hour.

## how it works

runs a draw function every frame that checks the current time and draws the
clock notches & hands to the canvas. when play sounds off screen is on play the
sounds from a setInterval, otherwise play the sounds from the draw function

## building

```
npm install
npm run build
node build.ts
```

or

```
bun install
bun run build
bun build.ts
```


> [!NOTE]
> AI was used for this project, but all it did was explain why the sound wasn't
> playing (the issue was that I was creating a new audiocontext every second)

<details>
<summary>agent conversation</summary>
<p>
user: can you explain why this sound is just NOT playing?

copilot: I’ll trace `playSound` from its definition through the call site and
check the browser/audio constraints around it.

Read , lines 1 to 180 Completed with input: { "path":
"/Users/cleothegoat/projects/teeny-clicker/src/main.ts", "view_range": [ 1, 180
] }

Search for `playSound|AudioContext|Oscillator|sound`

Find files matching `**/*`

The main reason is browser autoplay policy.

In `main.ts:6-20`, `playSound` creates a new `AudioContext` every time:

```ts
ctx = new AudioContext();
```

But `playSound(600)` is called from `draw()`, which is started automatically by
`requestAnimationFrame`, not from a user interaction. Browsers usually create
that context in the `"suspended"` state and refuse to output audio until it is
resumed from a click/tap/keypress.

There are also two related issues:

1. **A new audio context is created for every sound.**\
   Create one shared context instead.

2. **The timing condition can miss the minute transition.**\
   This only runs when:

   ```ts
   time[2] - currTime[2] == 1;
   ```

   `requestAnimationFrame` can skip a second, and when the clock crosses from
   `59` to `0`, the difference is `-59`, so the sound will not trigger at that
   boundary.

A minimal audio fix would be:

```ts
const audioContext = new AudioContext();

function playSound(freq: number, time = 0.05) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    const now = audioContext.currentTime;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time);

    osc.start(now);
    osc.stop(now + time);
}
```

Then resume it from a user gesture, for example:

```ts
window.addEventListener("click", () => {
    audioContext.resume();
}, { once: true });
```

You can confirm the diagnosis in the console:

```ts
console.log(audioContext.state);
```

It will likely report `"suspended"` before the first click. After a user
gesture, it should report `"running"`.

</p>
</details>
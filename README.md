# teeny clock

a simple analog + digital clock with sounds 

## how to use it
read the clock & listen to the sounds. every hour there's a bell that dings for each hour.

## how it works
runs a draw function every frame that checks the current time and draws the clock notches & hands to the canvas.
when play sounds off screen is on play the sounds from a setInterval, otherwise play the sounds from the draw function

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
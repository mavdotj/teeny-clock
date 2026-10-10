const canvas = document.getElementById("clock") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

let radius = canvas.height / 2 * 0.80;
let audioContext = new AudioContext();
let buttonSize = 70;
let buttonPadding = 15;

let playSound = (
  freq: number,
  time: number = 0.05,
  osc = audioContext.createOscillator(),
  gain = audioContext.createGain(),
) => {
  osc.connect(gain);
  osc.frequency.setValueAtTime(freq, audioContext.currentTime);
  gain.connect(audioContext.destination);
  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + time,
  );
  osc.start();
  osc.stop(audioContext.currentTime + time);
};

let playHour = (h: number) => {
  playSound(500, 1);
  h--;
  if (h) setTimeout(() => playHour(h), 1000);
};

let playSoundsoffScreen: boolean = false;
let offScreenSoundInterval: number | undefined;

let isOnButton = (e: MouseEvent): boolean => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width) -
    (canvas.width / 2);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height) -
    (canvas.height / 2);
  return (
    x > -(canvas.width / 2) + buttonPadding &&
    x < -(canvas.width / 2) + buttonPadding + buttonSize &&
    y > -(canvas.height / 2) + buttonPadding &&
    y < -(canvas.height / 2) + buttonPadding + buttonSize
  );
};

canvas.onclick = (e) => {
  if (isOnButton(e)) {
    playSoundsoffScreen = !playSoundsoffScreen;
    clearInterval(offScreenSoundInterval);
    if(playSoundsoffScreen) offScreenSoundInterval = setInterval(tick, 250)
  }
};

canvas.onmousemove = (e) => {
  canvas.style.cursor = isOnButton(e) ? "pointer" : "default";
};

/**
 * Returns a point based on a percentage and a radius
 */
let point = (percentage: number, radius: number): [number, number] => {
  // shift by 1 quarter (90 degrees) counter-clockwise so that 0deg is on the top and not on the right
  let radians = (percentage - 0.25) * Math.PI * 2;
  return [Math.cos(radians) * radius, Math.sin(radians) * radius];
};

type Time = [
  h: number,
  m: number,
  s: number,
  ms: number,
];


let getTime = (): Time => {
  let date = new Date();
  return [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  ];
};

// let prevTime: Time;
// let prevTime2: Time;
// let playSounds = (time: Time, prevTime: Time, drawing = true) => {
//   // if we are drawing && play sounds off screen is on then we let the interval do the sounds so it doesn't overlap
//   if (drawing && prevPlaySoundsoffScreen && playSoundsoffScreen) return;
//   console.log("running in interval?: ", !drawing);
//   // new second?
//   if (prevTime && [1, -59].includes(time[2] - prevTime?.[2])) {
//     console.log(time, prevTime);
//     if (drawing) {
//       // playsoundsoffscreen was just flipped on
//       if (playSoundsoffScreen == true && prevPlaySoundsoffScreen == false) {
//         offScreenSoundInterval = setInterval(() => {
//           let time = getTime();
//           playSounds(time, prevTime2, false);
//           prevTime2 = time;
//         }, 1000);
//       } // playsoundsoffscreen was just flipped off
//       else if (
//         playSoundsoffScreen == false && prevPlaySoundsoffScreen == true
//       ) {
//         clearInterval(offScreenSoundInterval);
//       }
//       prevPlaySoundsoffScreen = playSoundsoffScreen;
//     }
//     // new hour?
//     if (time[0] != prevTime[0]) {
//       playHour(time[0] % 12);
//     }
//     // new minute?
//     if (time[1] != prevTime[1]) {
//       playSound(600);
//     } else {
//       playSound(440);
//     }
//   }
// };

let lastTick: Time | null;
let tick = (time: Time = getTime()) => {
  const prevTime = lastTick;
  lastTick = time;
  // same second: skip
  if (!prevTime || time[2] === prevTime[2]) return;

  // new hour? play hour sounds
  if (time[0] !== prevTime[0]) playHour(time[0] % 12 || 12);
  
  // new minute? play minute tick; not a new minute? just play second tick
  playSound(time[1] !== prevTime[1] ? 600 : 440);
}

let draw = () => {
  ctx.reset();
  ctx.translate(canvas.height / 2, canvas.height / 2);
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "black";
  ctx.fill();

  // draw notches & numbers
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "15px sans-serif";
    let isHour = !(i % 5);
    ctx.lineWidth = isHour ? 2.5 : 1.5;
    if (isHour) {
      ctx.fillText(
        // @ts-expect-error: it saves bytes to not explicitly stringify this
        (i / 5) || 12,
        ...point(i / 60, radius * 0.8),
      );
    }
    ctx.moveTo(...point(i / 60, radius));
    ctx.lineTo(...point(i / 60, radius * 0.9));
    ctx.stroke();
  }
  let time = getTime();
  // playSounds(time, prevTime);
  // prevTime = time;
  tick(time);
  let [s, m, h] = [
    // v seconds + v 0.milliseconds divided by 60 seconds in a minute
    (time[2] + (time[3] / 1000)) / 60,
    // v minutes divided by 60 minutes in an hour
    time[1] / 60,
    // v hours divided by 12 hours on a clock (yes the hours value wraps by 24 and not 12 but it's wrapping around a circle anyway so it doesn't matter)
    time[0] / 12,
  ];

  // draw the minute hand
  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "white";
  ctx.moveTo(0, 0);
  ctx.lineTo(...point(m, radius / 2.7));
  ctx.stroke();

  // draw the second hand
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "red";
  ctx.moveTo(0, 0);
  ctx.lineTo(...point(s, radius / 1.4));
  ctx.stroke();

  // draw the hour hand
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "white";
  ctx.moveTo(0, 0);
  ctx.lineTo(...point(h, radius / 1.5));
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  ctx.font = "32px sans-serif";
  ctx.moveTo(40, 0);

  ctx.fillText(
    `${(time[0] + "").padStart(2, "0")}:${(time[1] + "").padStart(2, "0")}:${
      (time[2] + "").padStart(2, "0")
    }.${(time[3] + "").padStart(3, "0")} (${time[0] % 12 || 12}${
      time[0] < 12 ? "AM" : "PM"
    })`,
    0,
    (canvas.height / 2) - 15,
  );

  ctx.beginPath();
  ctx.fillStyle = playSoundsoffScreen ? "green" : "red";
  ctx.fillRect(
    -(canvas.width / 2) + buttonPadding,
    -(canvas.height / 2) + buttonPadding,
    buttonSize,
    buttonSize,
  );
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = playSoundsoffScreen ? "white" : "black";
  ctx.font = "12px sans-serif";
  // ctx.moveTo(-(canvas.width / 2) + 15 + (buttonSize / 2), -(canvas.height / 2) + 15 + (buttonSize / 2));
  ctx.fillText(
    "play sounds offscren?",
    -(canvas.width / 2) + buttonPadding + (buttonSize / 2),
    -(canvas.height / 2) + buttonPadding + (buttonSize / 2),
    buttonSize,
  );

  requestAnimationFrame(draw);
};
draw();

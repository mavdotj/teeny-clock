const canvas = document.getElementById("clock") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

let radius = canvas.height / 2 * 0.80;
let audioContext = new AudioContext();

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

/**
 * Returns a point based on a percentage and a radius
 */
let point = (percentage: number, radius: number): [number, number] => {
  // shift by 1 quarter (90 degrees) counter-clockwise so that 0deg is on the top and not on the right
  percentage -= 0.25;
  let radians = percentage * (Math.PI * 2);
  return [Math.cos(radians) * radius, Math.sin(radians) * radius];
};

type Time = [
  h: number,
  m: number,
  s: number,
  ms: number,
];

let prevTime: Time;

let draw = () => {
  ctx.reset();
  ctx.translate(canvas.height / 2, canvas.height / 2);
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "black";
  ctx.fill();

  // draw notches & numbers
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    let isMajorNotch = !(i % 5);
    ctx.lineWidth = isMajorNotch ? 2.5 : 1.5;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    isMajorNotch && ctx.fillText(
      // @ts-expect-error: it saves bytes to not explicitly stringify this
      (i / 5) || 12,
      ...point(i / 60, radius * 0.8),
    );
    ctx.moveTo(...point(i / 60, radius));
    ctx.lineTo(...point(i / 60, radius * 0.9));
    ctx.stroke();
  }
  let date = new Date();
  let time: Time = [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  ];
  let [s, m, h] = [
    // v seconds + v 0.milliseconds divided by 60 seconds in a minute
    (time[2] + (time[3] / 1000)) / 60,
    // v minutes divided by 60 minutes in an hour
    time[1] / 60,
    // v hours divided by 12 hours on a clock (yes the hours value wraps by 24 and not 12 but it's wrapping around a circle anyway so it doesn't matter)
    time[0] / 12,
  ];
  // new second?
  if (prevTime && [1, -59].includes(time[2] - prevTime?.[2])) {
    // new hour?
    if (time[0] != prevTime[0]) {
      playHour(time[0] % 12);
    }
    // new minute?
    if (time[1] != prevTime[1]) {
      playSound(600);
    } else {
      playSound(440);
    }
  }
  // // new hour?
  // if (currTime && isNewSecond && time[0] != currTime[0]) {
  //   playHour(time[0]);
  // }
  // // new minute?
  // if (currTime && isNewSecond && time[1] != currTime[1]) {
  //   playSound(600);
  // }
  // // new second?
  // if (currTime && isNewSecond) {
  //   playSound(440);
  // }
  prevTime = time;

  // draw the minute hand
  ctx.beginPath();
  ctx.lineWidth = 3;
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
  ctx.font = "40px sans-serif";
  ctx.moveTo(40, 0);

  ctx.fillText(
    `${(time[0] + "").padStart(2, "0")}:${(time[1] + "").padStart(2, "0")}:${
      (time[2] + "").padStart(2, "0")
    }.${(time[3] + "").padStart(3, "0")} (${time[0] % 12}${
      time[0] < 24 ? "PM" : "AM"
    }) `,
    0,
    (canvas.height / 2) - 15,
  );

  requestAnimationFrame(draw);
};
draw();
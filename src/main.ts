import './style.css'

const canvas = document.getElementById("clock") as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let radius = canvas.height / 2;
ctx.translate(radius, radius);
radius = radius * 0.90

/**
 * Returns a point based on a percentage and a radius
 */
const p = (percentage: number, radius: number): [number, number] => {
  let radians = percentage * (Math.PI * 2)
  return [Math.cos(radians) * radius, Math.sin(radians) * radius]
}

function drawClock() {
  ctx.arc(0, 0, radius, 0 , 2 * Math.PI);
  ctx.fillStyle = "black";
  ctx.fill();

  // draw notches & numbers
  for(let i = 0; i < 60; i++) {
    ctx.beginPath()
    const isMajorNotch = !(i % 5)
    ctx.lineWidth = isMajorNotch ? 2.5 : 1.5;
    ctx.strokeStyle = "white";
    ctx.moveTo(...p(i / 60, radius))
    ctx.lineTo(...p(i / 60, radius * 0.9));
    ctx.stroke();
  }
}

type Time = {
  h: number
  m: number,
  s: number,
  ms: number
}

drawClock()

let currTime: Time;

function draw() {
  ctx.reset()
  ctx.translate(radius, radius)
  drawClock();
  const date = new Date();
  const time: Time = { h: date.getHours(), m: date.getMinutes(), s: date.getSeconds(), ms: date.getMilliseconds() };
  const s = (time.s + (time.ms / 1000)) / 60;
  const m = time.m / 60;
  const h = (time.h % 12) / 12;

  // draw the minute hand
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "white";
  ctx.moveTo(0, 0);
  ctx.lineTo(...p(m, radius/2.7));
  ctx.stroke();

  // draw the second hand
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "red";
  ctx.moveTo(0, 0);
  ctx.lineTo(...p(s, radius/1.4));
  ctx.stroke();

  // draw the hour hand
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "white";
  ctx.moveTo(0, 0);
  ctx.lineTo(...p(h, radius/1.5));
  ctx.stroke();

  console.log(h, m, s);

  requestAnimationFrame(draw)
}

draw()
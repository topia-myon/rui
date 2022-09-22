const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const bgImage = new Image();
bgImage.src = "assets/rui.png";
const images = [
  "assets/rui1.png",
  "assets/rui2.png",
  "assets/rui3.png",
  "assets/rui4.png",
  "assets/rui5.png",
  "assets/rui6.png",
];

let stamps = [];

window.addEventListener("resize", resizeCanvas, false);
resizeCanvas();

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width =
    Math.round(devicePixelRatio * rect.right) -
    Math.round(devicePixelRatio * rect.left);
  canvas.height =
    Math.round(devicePixelRatio * rect.bottom) -
    Math.round(devicePixelRatio * rect.top);
  stamps.forEach((stamp) => {
    stamp.el.remove();
  });
  stamps = [];
  draw();
}

bgImage.onload = () => {
  bgImage.loaded = true;
  renderBackground();
};

function draw() {
  ctx.clear;
  renderBackground();
}

function renderBackground() {
  const rect = canvas.getBoundingClientRect();
  const width = Math.min(
    Math.round(devicePixelRatio * rect.right) -
      Math.round(devicePixelRatio * rect.left),
    (Math.round(devicePixelRatio * rect.bottom) -
      Math.round(devicePixelRatio * rect.top)) *
      (1170 / 2532)
  );
  const height = (width / 1170) * 2532;
  ctx.drawImage(
    bgImage,
    (canvas.width - width) / 2,
    (canvas.height - height) / 2,
    width,
    height
  );
}

document.addEventListener("click", (e) => {
  document.getElementById("please-tap").style.visibility = "hidden";
  stamps.push(generateStamp(e.pageX, e.pageY));
});

function toRelative(x, y) {
  return [(x / canvas.clientWidth) * 2 - 1, (y / canvas.clientHeight) * 2 - 1];
}

function toAbsolute(x, y) {
  return [
    ((1 + x) / 2) * canvas.clientWidth,
    ((1 + y) / 2) * canvas.clientHeight,
  ];
}

let previousTimestamp = 0;
const ay = 1.6;

function step(timestamp) {
  const width = Math.min(window.innerWidth, window.innerHeight * (1170 / 2532));
  const height = (width / 1170) * 2532;
  const size = Math.min(width, height) / 2.5;
  const delta = (timestamp - previousTimestamp) / 1000;
  stamps.forEach(({ el, kind, x, y, vx, vy, p, w }, index) => {
    stamps[index] = {
      el,
      kind,
      x: x + vx * delta,
      y: y + vy * delta,
      vx,
      vy: vy + ay * delta,
      p: p + w * delta,
      w,
    };
    const [absX, absY] = toAbsolute(x + vx * delta, y + vy * delta);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.top = `${absY - size / 2}px`;
    el.style.left = `${absX - size / 2}px`;
    el.style.transform = `rotate(${((p + w * delta) * 180) / Math.PI}deg)`;
  });

  stamps = stamps.filter((stamp) => {
    const valid =
      ((1 + stamp.y) / 2) * canvas.clientHeight <=
      size * Math.SQRT2 + canvas.clientHeight;
    if (!valid) {
      stamp.el.remove();
    }
    return valid;
  });

  previousTimestamp = timestamp;

  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);

function generateStamp(absX, absY) {
  const [x, y] = toRelative(absX, absY);

  const container = document.getElementById("images");
  const el = document.createElement("img");
  const kind = images[Math.floor(Math.random() * images.length)];
  const width = Math.min(window.innerWidth, window.innerHeight * (1170 / 2532));
  const height = (width / 1170) * 2532;
  const size = Math.min(width, height) / 2.5;

  const r = Math.random() * Math.PI;
  const s = Math.random() * 0.6 + 0.8;
  const vx = (Math.cos(r) / 2.5) * s;
  const vy = (-(1 + Math.sin(r)) / 2) * s;
  const p = 0;
  const w = (Math.random() - 0.5) * Math.PI * 2;

  el.src = kind;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.position = "absolute";
  el.style.top = `${absY - size / 2}px`;
  el.style.left = `${absX - size / 2}px`;
  el.style.transform = `rotate(${(p * 180) / Math.PI}deg)`;
  el.style.pointerEvents = "none";
  container.appendChild(el);

  return {
    el,
    kind,
    x,
    y,
    vx,
    vy,
    p,
    w,
  };
}

const preloads = [];

function preload(...images) {
  for (let i = 0; i < images.length; i++) {
    preloads[i] = new Image();
    preloads[i].src = images[i];
  }
}

preload("assets/rui.png", ...images);

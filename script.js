const SURPRISE_CONFIG = {
  photoPath: "assets/photo.jpg",
  photoFallbackPath: "assets/photo-placeholder.svg",
  qrFallbackPath: "assets/qr-placeholder.svg",
  customShareUrl: ""
};

const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");
const floatingHearts = document.getElementById("floatingHearts");
const heartStage = document.getElementById("heartStage");
const replayButton = document.getElementById("replayButton");
const photoCard = document.getElementById("photoCard");
const notePanel = document.getElementById("notePanel");
const qrPanel = document.getElementById("qrPanel");
const surprisePhoto = document.getElementById("surprisePhoto");
const qrCode = document.getElementById("qrCode");
const qrHint = document.getElementById("qrHint");
const shareLink = document.getElementById("shareLink");
const copyLinkButton = document.getElementById("copyLinkButton");

const scene = {
  dpr: Math.max(1, Math.min(window.devicePixelRatio || 1, 2)),
  displaySize: 640,
  points: [],
  revealStarted: false,
  startTime: 0,
  animationFrame: 0
};

function heartPoint(t, scale) {
  const x = 16 * Math.sin(t) ** 3;
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);

  return {
    x: x * scale,
    y: -y * scale
  };
}

function buildHeartPoints() {
  const total = 220;
  const scale = scene.displaySize * 0.0186;
  const center = scene.displaySize / 2;
  const points = [];

  for (let index = 0; index < total; index += 1) {
    const t = (index / total) * Math.PI * 2;
    const point = heartPoint(t, scale);
    points.push({
      x: center + point.x,
      y: center + point.y + scene.displaySize * 0.02
    });
  }

  scene.points = points;
}

function resizeCanvas() {
  const target = Math.min(640, heartStage.clientWidth - 24);
  scene.displaySize = Math.max(280, target);

  canvas.width = Math.round(scene.displaySize * scene.dpr);
  canvas.height = Math.round(scene.displaySize * scene.dpr);
  canvas.style.width = `${scene.displaySize}px`;
  canvas.style.height = `${scene.displaySize}px`;

  ctx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
  buildHeartPoints();
}

function drawGlow(size) {
  const radial = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.04,
    size / 2,
    size / 2,
    size * 0.38
  );

  radial.addColorStop(0, "rgba(255, 237, 184, 0.22)");
  radial.addColorStop(0.45, "rgba(255, 143, 112, 0.12)");
  radial.addColorStop(1, "rgba(5, 9, 20, 0)");

  ctx.fillStyle = radial;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

function drawHeart(timestamp) {
  const elapsed = timestamp - scene.startTime;
  const progress = Math.min(1, elapsed / 2600);
  const size = scene.displaySize;
  const center = size / 2;
  const visiblePoints = Math.max(18, Math.floor(scene.points.length * progress));
  const pulseStrength = progress > 0.55 ? 1 : progress / 0.55;
  const pulse = 1 + Math.sin(timestamp / 180) * 0.028 * pulseStrength;
  const jump = Math.floor(scene.points.length * 0.47 + Math.sin(timestamp / 900) * 10);

  ctx.clearRect(0, 0, size, size);
  drawGlow(size);

  ctx.save();
  ctx.translate(center, center);
  ctx.scale(pulse, pulse);
  ctx.translate(-center, -center);

  for (let index = 0; index < visiblePoints; index += 1) {
    const point = scene.points[index];
    const partner = scene.points[(index + jump + scene.points.length) % scene.points.length];
    const hue = (index * 2.4 + timestamp * 0.04) % 360;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(partner.x, partner.y);
    ctx.lineWidth = Math.max(1.1, size * 0.0036);
    ctx.strokeStyle = `hsla(${hue}, 100%, 66%, 0.36)`;
    ctx.shadowBlur = size * 0.022;
    ctx.shadowColor = `hsla(${hue}, 100%, 68%, 0.22)`;
    ctx.stroke();
  }

  for (let index = 0; index < visiblePoints; index += 1) {
    const point = scene.points[index];
    const hue = (index * 2.1 + timestamp * 0.05) % 360;

    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(1.8, size * 0.0054), 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 100%, 74%, 0.95)`;
    ctx.fill();
  }

  ctx.restore();

  if (!scene.revealStarted && progress >= 0.54) {
    scene.revealStarted = true;
    photoCard.classList.add("is-visible");
    window.setTimeout(() => notePanel.classList.add("is-visible"), 280);
    window.setTimeout(() => qrPanel.classList.add("is-visible"), 620);
  }

  scene.animationFrame = window.requestAnimationFrame(drawHeart);
}

function startScene() {
  window.cancelAnimationFrame(scene.animationFrame);
  photoCard.classList.remove("is-visible");
  notePanel.classList.remove("is-visible");
  qrPanel.classList.remove("is-visible");
  scene.revealStarted = false;
  scene.startTime = performance.now();
  scene.animationFrame = window.requestAnimationFrame(drawHeart);
}

function accelerateScene() {
  const desiredElapsed = 1700;
  const now = performance.now();
  scene.startTime = Math.min(scene.startTime, now - desiredElapsed);
}

function createFloatingHearts() {
  floatingHearts.innerHTML = "";

  for (let index = 0; index < 18; index += 1) {
    const heart = document.createElement("span");
    const size = 12 + Math.random() * 24;
    const left = Math.random() * 100;
    const duration = 8 + Math.random() * 10;
    const delay = Math.random() * -12;
    const drift = `${(Math.random() - 0.5) * 120}px`;

    heart.className = "float-heart";
    heart.style.setProperty("--size", `${size}px`);
    heart.style.setProperty("--left", `${left}%`);
    heart.style.setProperty("--duration", `${duration}s`);
    heart.style.setProperty("--delay", `${delay}s`);
    heart.style.setProperty("--drift", drift);

    floatingHearts.appendChild(heart);
  }
}

function loadPhoto() {
  const image = new Image();

  image.onload = () => {
    surprisePhoto.setAttribute("href", SURPRISE_CONFIG.photoPath);
    surprisePhoto.setAttribute("xlink:href", SURPRISE_CONFIG.photoPath);
  };

  image.onerror = () => {
    surprisePhoto.setAttribute("href", SURPRISE_CONFIG.photoFallbackPath);
    surprisePhoto.setAttribute("xlink:href", SURPRISE_CONFIG.photoFallbackPath);
  };

  image.src = `${SURPRISE_CONFIG.photoPath}?v=${Date.now()}`;
}

function resolveShareUrl() {
  if (SURPRISE_CONFIG.customShareUrl.trim()) {
    return SURPRISE_CONFIG.customShareUrl.trim();
  }

  if (window.location.protocol === "file:") {
    return "";
  }

  return window.location.href;
}

function setupQrCode() {
  const shareUrl = resolveShareUrl();

  if (!shareUrl) {
    qrCode.alt = "Upload this page to get a working QR code";
    qrCode.src = SURPRISE_CONFIG.qrFallbackPath;
    shareLink.removeAttribute("href");
    shareLink.textContent = "ატვირთვის შემდეგ აქ შენი საჯარო ლინკი ჩასვი";
    qrHint.textContent =
      "QR რომ იმუშაოს, საქაღალდე ატვირთე Netlify-ზე ან GitHub Pages-ზე და მერე script.js-ში customShareUrl ჩასვი.";
    copyLinkButton.disabled = true;
    copyLinkButton.style.opacity = "0.55";
    return;
  }

  const qrUrl =
    `https://quickchart.io/qr?text=${encodeURIComponent(shareUrl)}` +
    "&size=320&margin=1&dark=ffffff&light=0000";

  qrCode.src = qrUrl;
  qrCode.alt = "QR code for this surprise page";
  copyLinkButton.disabled = false;
  copyLinkButton.style.opacity = "1";
  shareLink.href = shareUrl;
  shareLink.textContent = shareUrl;

  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    qrHint.textContent =
      "ლოკალურ მისამართზე გახსნისას QR ყველასთვის ხელმისაწვდომი არ იქნება, ამიტომ საბოლოოდ საჯარო ლინკი ჯობია.";
  }
}

async function copyLink() {
  const shareUrl = resolveShareUrl();

  if (!shareUrl) {
    return;
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    copyLinkButton.classList.add("copied");
    copyLinkButton.textContent = "დაკოპირდა";

    window.setTimeout(() => {
      copyLinkButton.classList.remove("copied");
      copyLinkButton.textContent = "ლინკის კოპირება";
    }, 1600);
  } catch (error) {
    shareLink.focus();
  }
}

function init() {
  createFloatingHearts();
  resizeCanvas();
  loadPhoto();
  setupQrCode();
  startScene();

  replayButton.addEventListener("click", (event) => {
    event.stopPropagation();
    startScene();
  });

  heartStage.addEventListener("click", accelerateScene);
  copyLinkButton.addEventListener("click", copyLink);
  window.addEventListener("resize", resizeCanvas);
}

init();

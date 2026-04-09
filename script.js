const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

const particles = [];
const particleCount = 2200;
let animationStart = 0;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function heartPoint(t, scale) {
  return {
    x: scale * 16 * Math.pow(Math.sin(t), 3),
    y:
      -scale *
      (13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t))
  };
}

function randomStart(width, height) {
  const side = Math.floor(Math.random() * 4);

  if (side === 0) {
    return {
      x: -160 - Math.random() * width * 0.35,
      y: Math.random() * height
    };
  }

  if (side === 1) {
    return {
      x: width + 160 + Math.random() * width * 0.35,
      y: Math.random() * height
    };
  }

  if (side === 2) {
    return {
      x: Math.random() * width,
      y: -160 - Math.random() * height * 0.35
    };
  }

  return {
    x: Math.random() * width,
    y: height + 160 + Math.random() * height * 0.35
  };
}

function makeParticle(width, height) {
  const t = Math.random() * Math.PI * 2;
  const scale = Math.min(width, height) * (0.0105 + Math.random() * 0.0035);
  const target = heartPoint(t, scale);
  const start = randomStart(width, height);

  return {
    targetX: target.x,
    targetY: target.y,
    startX: start.x,
    startY: start.y,
    size: 0.8 + Math.random() * 2.4,
    alpha: 0.24 + Math.random() * 0.72,
    delay: Math.random() * 1500,
    hue: 205 + Math.random() * 45,
    twinkle: Math.random() * Math.PI * 2
  };
}

function populateParticles() {
  particles.length = 0;
  const width = window.innerWidth;
  const height = window.innerHeight;

  for (let i = 0; i < particleCount; i += 1) {
    particles.push(makeParticle(width, height));
  }
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function drawBackdrop(width, height, time) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const wave = (Math.sin(time * 0.00045) + 1) / 2;
  gradient.addColorStop(0, `rgba(255, 86, 146, ${0.035 + wave * 0.06})`);
  gradient.addColorStop(0.45, "rgba(255, 255, 255, 0.008)");
  gradient.addColorStop(1, `rgba(255, 126, 176, ${0.04 + (1 - wave) * 0.08})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawSparkles(width, height, time) {
  for (let i = 0; i < 46; i += 1) {
    const seed = i * 97.17;
    const x = ((Math.sin(seed) + 1) / 2) * width;
    const y = ((Math.cos(seed * 1.61) + 1) / 2) * height;
    const twinkle = (Math.sin(time * 0.0014 + seed * 3.4) + 1) / 2;
    const radius = 0.5 + twinkle * 1.6;

    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.04 + twinkle * 0.18})`;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCoreGlow(width, height, time) {
  const cx = width / 2;
  const cy = height / 2;
  const pulse = 1 + Math.sin(time * 0.0048) * 0.12;
  const radius = Math.min(width, height) * 0.27 * pulse;
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

  gradient.addColorStop(0, "rgba(255, 115, 170, 0.42)");
  gradient.addColorStop(0.22, "rgba(255, 105, 165, 0.18)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

function render(time) {
  if (!animationStart) {
    animationStart = time;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const elapsed = time - animationStart;
  const centerX = width / 2;
  const centerY = height / 2;
  const beat = 1 + Math.sin(time * 0.005) * 0.12;

  ctx.clearRect(0, 0, width, height);
  drawBackdrop(width, height, time);
  drawSparkles(width, height, time);
  drawCoreGlow(width, height, time);

  for (const particle of particles) {
    const phase = Math.max(0, Math.min(1, (elapsed - particle.delay) / 2300));
    const settle = easeOutCubic(phase);
    const targetX = centerX + particle.targetX * beat;
    const targetY = centerY + particle.targetY * beat;
    const x = particle.startX + (targetX - particle.startX) * settle;
    const y = particle.startY + (targetY - particle.startY) * settle;
    const pulse = 1 + Math.sin(time * 0.008 + particle.twinkle) * 0.34;
    const glowSize = particle.size * (5.6 + pulse * 1.8);
    const alpha = particle.alpha * (0.44 + settle * 0.74);

    for (let i = 4; i >= 1; i -= 1) {
      const factor = i / 4;
      const tx = x + (particle.startX - targetX) * 0.018 * factor * (1 - settle);
      const ty = y + (particle.startY - targetY) * 0.018 * factor * (1 - settle);
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, ${particle.hue}, 240, ${alpha * factor * 0.13})`;
      ctx.arc(tx, ty, particle.size * (1 + factor * 2.6), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.18})`;
    ctx.arc(x, y, glowSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = `rgba(255, ${particle.hue}, 242, ${alpha})`;
    ctx.arc(x, y, particle.size * pulse, 0, Math.PI * 2);
    ctx.fill();

    if (settle > 0.96) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 82, 152, ${alpha * 0.14})`;
      ctx.arc(x, y, particle.size * 7.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (elapsed < 1400) {
    ctx.fillStyle = `rgba(0, 0, 0, ${1 - elapsed / 1400})`;
    ctx.fillRect(0, 0, width, height);
  }

  requestAnimationFrame(render);
}

resizeCanvas();
populateParticles();
requestAnimationFrame(render);

window.addEventListener("resize", () => {
  resizeCanvas();
  populateParticles();
  animationStart = performance.now();
});

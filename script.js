const target = new Date(2026, 2, 17, 0, 0, 0, 0); // monthIndex 2 => March

// Elements
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

const celebrateEl = document.getElementById("celebrate");
const confettiCanvas = document.getElementById("confetti");
const wrap = document.querySelector(".wrap");

confettiCanvas.width = wrap.clientWidth;
confettiCanvas.height = wrap.clientHeight;

// Responsive canvas size on resize
window.addEventListener("resize", () => {
  confettiCanvas.width = wrap.clientWidth;
  confettiCanvas.height = wrap.clientHeight;
});

// helper: pad numbers
function pad(n) {
  return n.toString().padStart(2, "0");
}

// compute remaining time
function computeRemaining(now) {
  // difference in milliseconds
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0 };
  }
  // compute
  let ms = diff;
  const sec = 1000;
  const minute = 60 * sec;
  const hour = 60 * minute;
  const day = 24 * hour;

  const days = Math.floor(ms / day);
  ms -= days * day;
  const hours = Math.floor(ms / hour);
  ms -= hours * hour;
  const minutes = Math.floor(ms / minute);
  ms -= minutes * minute;
  const seconds = Math.floor(ms / sec);
  ms -= seconds * sec;

  return { total: diff, days, hours, minutes, seconds, ms };
}

// state to reduce updates
let lastSecond = null;
let ended = false;

// confetti implementation (simple)
const ctx = confettiCanvas.getContext("2d");
let confettiParticles = [];

function spawnConfetti() {
  const W = confettiCanvas.width;
  const H = confettiCanvas.height;
  confettiParticles = [];
  const colors = ["#ff6fb5", "#ffd36f", "#6fb3ff", "#ffc0e1", "#e6f7ff"];
  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: Math.random() * W,
      y: Math.random() * -H * 0.6,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 4 + 2,
      angle: Math.random() * 360,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotSpeed: (Math.random() - 0.5) * 8,
    });
  }
  requestAnimationFrame(stepConfetti);
}

function stepConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  for (let p of confettiParticles) {
    p.x += p.vx;
    p.y += p.vy;
    p.angle += p.rotSpeed;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.angle * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  }
  // remove particles that fell off
  confettiParticles = confettiParticles.filter(
    (p) => p.y < confettiCanvas.height + 30
  );
  if (confettiParticles.length > 0) {
    requestAnimationFrame(stepConfetti);
  } else {
    // clear canvas at the end
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

//testing
function testing() {
  alert('This function is still in development state.')
}

// sakura petals creation
function createPetals(count = 10) {
  // create and append petals to wrap
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "petal";
    // randomize start positions and durations
    el.style.left = Math.random() * 100 + "%";
    el.style.top = -Math.random() * 30 - 5 + "vh";
    el.style.opacity = 0.7 + Math.random() * 0.3;
    const dur = 8 + Math.random() * 6;
    el.style.animationDuration = dur + "s";
    el.style.animationDelay = Math.random() * -10 + "s";
    el.style.transform = `translateX(${Math.random() * 40 - 20}px) rotate(${
      Math.random() * 60 - 30
    }deg)`;
    wrap.appendChild(el);
  }
}
createPetals(16);

// main tick
function tick() {
  const now = new Date();
  const r = computeRemaining(now);

  // numbers update once per second (avoid flicker)
  if (lastSecond !== r.seconds || lastSecond === null || r.total === 0) {
    lastSecond = r.seconds;
    daysEl.textContent = r.days.toString();
    hoursEl.textContent = pad(r.hours);
    minutesEl.textContent = pad(r.minutes);
    secondsEl.textContent = pad(r.seconds);
  }

  // finished?
  if (r.total <= 0 && !ended) {
    onFinish();
    ended = true;
  }
}

// finish behavior
function onFinish() {
  // show celebration text
  celebrateEl.style.display = "grid";
  celebrateEl.setAttribute("aria-hidden", "false");

  // spawn confetti
  spawnConfetti();

  // small pulse on numbers
  const cards = document.querySelectorAll(".card .num");
  cards.forEach((n, idx) => {
    n.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.18)" },
        { transform: "scale(1)" },
      ],
      { duration: 900, easing: "cubic-bezier(.2,.9,.3,1)", delay: idx * 80 }
    );
  });
}

// run at 250ms for smooth rings
tick();
const interval = setInterval(tick, 250);

// accessibility: announce when finished using aria-live
const liveRegion = document.createElement("div");
liveRegion.setAttribute("aria-live", "polite");
liveRegion.style.position = "absolute";
liveRegion.style.left = "-9999px";
liveRegion.style.top = "auto";
liveRegion.style.width = "1px";
liveRegion.style.height = "1px";
liveRegion.style.overflow = "hidden";
document.body.appendChild(liveRegion);

// When finish happens, set text for screen readers
function announceFinish() {
  liveRegion.textContent = "G12 Exam Time!";
}

// attach finish announcer
(function pollFinish() {
  const check = setInterval(() => {
    if (ended) {
      announceFinish();
      clearInterval(check);
    }
  }, 300);
})();

// CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (cursor) {
    cursor.style.left = mx - 6 + 'px';
    cursor.style.top = my - 6 + 'px';
  }
});

function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) *.12;
  if (ring) {
    ring.style.left = rx - 18 + 'px';
    ring.style.top = ry - 18 + 'px';
  }
  requestAnimationFrame(animRing);
}
animRing();

document.addEventListener('mousedown', () => {
  if (cursor) cursor.style.transform = 'scale(1.6)';
});
document.addEventListener('mouseup', () => {
  if (cursor) cursor.style.transform = 'scale(1)';
});

// HERO GLOW FOLLOW
const heroGlow = document.getElementById('heroGlow');
const heroWrap = document.getElementById('hero');
if (heroWrap && heroGlow) {
  heroWrap.addEventListener('mousemove', e => {
    const r = heroWrap.getBoundingClientRect();
    heroGlow.style.left = (e.clientX - r.left - 300) + 'px';
    heroGlow.style.top = (e.clientY - r.top - 300) + 'px';
  });
}

// PARTICLES
const particlesEl = document.getElementById('particles');
if (particlesEl) {
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = Math.random() * 20 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (6 + Math.random() * 6) + 's';
    p.style.opacity = Math.random() * 0.6;
    particlesEl.appendChild(p);
  }
}

// COUNTERS
function animateCounters() {
  document.querySelectorAll('.counter-num').forEach(el => {
    const target = +el.dataset.target;
    let val = 0;
    const step = target / 80;
    const timer = setInterval(() => {
      val += step;
      if (val >= target) { val = target; clearInterval(timer); }
      el.textContent = Math.floor(val).toLocaleString();
    }, 20);
  });
}

// SCROLL REVEAL
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      if (e.target.querySelector('.counter-num')) animateCounters();
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Trigger counters if already in view (hero)
if (document.querySelector('.counter-num')) {
  const heroVisible = document.querySelector('.counters');
  if (heroVisible) {
    const obs2 = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { animateCounters(); obs2.disconnect(); }
    }, { threshold: 0.5 });
    obs2.observe(heroVisible);
  }
}

// TILT on feat-cards
document.querySelectorAll('.feat-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `translateY(-4px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

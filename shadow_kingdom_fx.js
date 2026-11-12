/**
 * OUR LITTLE UNIVERSE — SHADOW LUXURY CRYSTAL FANTASY KINGDOM FX
 *
 * Lightweight Canvas + rAF particle engine for SHADOW's main world:
 * - Crystal Sparkles (twinkling 4-point glints around crystal structures)
 * - Floating Magic Dust (varied slow drift + occasional bright starlight motes)
 * - Magical Fireflies (curved paths around hydrangea garden & lotus pond)
 * - Glowing Magical Butterflies (gentle wing-flap flight across the garden)
 * - Subtle Cursor Sparkles & Click Crystal Bursts
 *
 * Performance & Accessibility:
 * - Runs rAF ONLY while #view-shadow-world is active and tab is visible.
 * - Honors prefers-reduced-motion (static fallback, zero rAF loop).
 * - Canvas uses pointer-events: none so buttons/hotspots are never blocked.
 */

const CRYSTAL_ANCHORS = [
  { x: 0.36, y: 0.20, spread: 0.08, color: '#e2e8f0' }, // Crystal Castle spires
  { x: 0.40, y: 0.30, spread: 0.07, color: '#c4b5fd' }, // Castle upper windows
  { x: 0.62, y: 0.31, spread: 0.07, color: '#93c5fd' }, // Glass Conservatory / Art Gallery
  { x: 0.83, y: 0.72, spread: 0.06, color: '#ddd6fe' }, // Crystal Gazebo dome
  { x: 0.25, y: 0.76, spread: 0.05, color: '#a78bfa' }, // Lower-left crystal cluster
  { x: 0.94, y: 0.78, spread: 0.05, color: '#93c5fd' }, // Lower-right crystal cluster
  { x: 0.23, y: 0.14, spread: 0.05, color: '#c4b5fd' }, // Floating island left
  { x: 0.74, y: 0.16, spread: 0.06, color: '#93c5fd' }  // Floating island right
];

const FIREFLY_COLORS = [
  'rgba(221, 214, 254, 1)', // Lavender
  'rgba(253, 230, 138, 1)', // Soft champagne gold
  'rgba(147, 197, 253, 1)'  // Crystal sapphire blue
];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function drawFourPointStar(ctx, x, y, radius, alpha, color) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 2.4);
  grad.addColorStop(0, color);
  grad.addColorStop(0.45, 'rgba(196, 181, 253, 0.35)');
  grad.addColorStop(1, 'rgba(196, 181, 253, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(0, -radius * 1.45);
  ctx.quadraticCurveTo(0, 0, radius * 1.45, 0);
  ctx.quadraticCurveTo(0, 0, 0, radius * 1.45);
  ctx.quadraticCurveTo(0, 0, -radius * 1.45, 0);
  ctx.quadraticCurveTo(0, 0, 0, -radius * 1.45);
  ctx.fill();
  ctx.restore();
}

export function initShadowKingdomFx(viewEl, canvasEl) {
  if (!viewEl || !canvasEl || typeof canvasEl.getContext !== 'function' || typeof window === 'undefined') {
    return {
      triggerClickBurst: () => {},
      triggerTransition: (cb) => { if (typeof cb === 'function') cb(); },
      destroy: () => {}
    };
  }

  const ctx = canvasEl.getContext('2d', { alpha: true });
  if (!ctx) {
    return {
      triggerClickBurst: () => {},
      triggerTransition: (cb) => { if (typeof cb === 'function') cb(); },
      destroy: () => {}
    };
  }

  const reducedMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

  let width = 1280;
  let height = 720;
  let dpr = 1;
  let rafId = null;
  let lastTime = 0;
  let lastTrailAt = 0;
  let isDestroyed = false;

  // 1. Crystal Sparkles (18)
  const sparkles = Array.from({ length: 18 }, (_, i) => {
    const anchor = CRYSTAL_ANCHORS[i % CRYSTAL_ANCHORS.length];
    return {
      nx: anchor.x + rand(-anchor.spread, anchor.spread),
      ny: anchor.y + rand(-anchor.spread * 0.7, anchor.spread * 0.7),
      radius: rand(2.2, 4.4),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.9, 1.9),
      color: anchor.color
    };
  });

  // 2. Floating Magic Dust (22)
  const dustMotes = Array.from({ length: 22 }, (_, i) => {
    const bright = i % 5 === 0;
    return {
      nx: rand(0.04, 0.96),
      ny: rand(0.08, 0.94),
      vx: rand(-0.008, 0.008),
      vy: rand(-0.015, -0.004),
      radius: bright ? rand(2.0, 3.1) : rand(1.1, 2.0),
      phase: rand(0, Math.PI * 2),
      bright,
      color: bright ? '#fde68a' : (i % 2 === 0 ? '#ddd6fe' : '#93c5fd')
    };
  });

  // 3. Magical Fireflies around hydrangea garden & pond (12)
  const fireflies = Array.from({ length: 12 }, (_, i) => {
    const inPond = i < 5;
    return {
      baseX: inPond ? rand(0.22, 0.43) : rand(0.56, 0.88),
      baseY: inPond ? rand(0.56, 0.76) : rand(0.46, 0.78),
      ampX: rand(0.018, 0.042),
      ampY: rand(0.012, 0.032),
      freqX: rand(0.35, 0.7),
      freqY: rand(0.45, 0.85),
      phase: rand(0, Math.PI * 2),
      radius: rand(2.1, 3.6),
      color: FIREFLY_COLORS[i % FIREFLY_COLORS.length]
    };
  });

  // 4. Glowing Magical Butterflies (3)
  const butterflies = Array.from({ length: 3 }, (_, i) => ({
    nx: rand(0.25, 0.8),
    ny: rand(0.42, 0.72),
    vx: (i % 2 === 0 ? 1 : -1) * rand(0.018, 0.028),
    phase: rand(0, Math.PI * 2),
    wingPhase: rand(0, Math.PI * 2),
    scale: rand(0.85, 1.15),
    color: i === 0 ? '#e9d5ff' : (i === 1 ? '#bae6fd' : '#fde68a')
  }));

  // 5. Ephemeral Cursor Sparkles & Click Bursts
  const ephemeralParticles = [];

  function resizeCanvas() {
    const rect = viewEl.getBoundingClientRect();
    width = Math.max(320, Math.round(rect.width || window.innerWidth));
    height = Math.max(240, Math.round(rect.height || window.innerHeight));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasEl.width = Math.round(width * dpr);
    canvasEl.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnTrailSparkle(clientX, clientY) {
    if (reducedMotionQuery.matches || ephemeralParticles.length >= 28) return;
    const rect = viewEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > width || y > height) return;

    ephemeralParticles.push({
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      vx: rand(-14, 14),
      vy: rand(-26, -8),
      life: 0,
      maxLife: rand(0.45, 0.75),
      size: rand(1.8, 3.2),
      isStar: Math.random() > 0.55,
      color: Math.random() > 0.35 ? '#e9d5ff' : '#fde68a'
    });
  }

  function triggerClickBurst(clientX, clientY) {
    if (reducedMotionQuery.matches) return;
    const rect = viewEl.getBoundingClientRect();
    const cx = Number.isFinite(clientX) ? clientX - rect.left : width * 0.5;
    const cy = Number.isFinite(clientY) ? clientY - rect.top : height * 0.5;

    for (let i = 0; i < 12; i++) {
      if (ephemeralParticles.length >= 44) break;
      const angle = (Math.PI * 2 * i) / 12 + rand(-0.18, 0.18);
      const speed = rand(38, 88);
      ephemeralParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 10,
        life: 0,
        maxLife: rand(0.55, 0.85),
        size: rand(2.2, 4.0),
        isStar: i % 2 === 0,
        color: i % 3 === 0 ? '#fde68a' : (i % 2 === 0 ? '#e2e8f0' : '#c4b5fd')
      });
    }
  }

  function drawButterfly(b, tSec) {
    const x = b.nx * width;
    const y = (b.ny + Math.sin(tSec * 1.7 + b.phase) * 0.025) * height;
    const flap = 0.45 + 0.55 * Math.abs(Math.sin(tSec * 7.5 + b.wingPhase));
    const dir = b.vx >= 0 ? 1 : -1;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir * b.scale, b.scale);
    ctx.globalAlpha = 0.72;

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
    glow.addColorStop(0, b.color);
    glow.addColorStop(1, 'rgba(167, 139, 250, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = b.color;
    // Upper & lower crystal wings
    ctx.beginPath();
    ctx.ellipse(-3 * flap, -3, 6 * flap, 3.6, -0.45, 0, Math.PI * 2);
    ctx.ellipse(3 * flap, -3, 6 * flap, 3.6, 0.45, 0, Math.PI * 2);
    ctx.ellipse(-2 * flap, 2.5, 4 * flap, 2.6, 0.35, 0, Math.PI * 2);
    ctx.ellipse(2 * flap, 2.5, 4 * flap, 2.6, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function renderFrame(ts, staticOnly = false) {
    if (isDestroyed) return;
    const dt = staticOnly ? 0 : Math.min(0.05, lastTime ? (ts - lastTime) / 1000 : 0.016);
    lastTime = ts;
    const tSec = ts * 0.001;

    ctx.clearRect(0, 0, width, height);

    // A. Crystal Sparkles
    for (let i = 0; i < sparkles.length; i++) {
      const s = sparkles[i];
      const pulse = staticOnly ? 0.6 : 0.22 + 0.78 * Math.pow(0.5 + 0.5 * Math.sin(tSec * s.speed + s.phase), 2);
      drawFourPointStar(ctx, s.nx * width, s.ny * height, s.radius * (0.75 + pulse * 0.35), pulse * 0.85, s.color);
    }

    // B. Floating Magic Dust
    for (let i = 0; i < dustMotes.length; i++) {
      const d = dustMotes[i];
      if (!staticOnly) {
        d.nx += d.vx * dt;
        d.ny += d.vy * dt;
        if (d.ny < 0.04) d.ny = 0.96;
        if (d.nx < 0.02) d.nx = 0.98;
        if (d.nx > 0.98) d.nx = 0.02;
      }
      const alpha = (d.bright ? 0.68 : 0.4) * (0.55 + 0.45 * Math.sin(tSec * 1.4 + d.phase));
      const x = d.nx * width;
      const y = d.ny * height;

      if (d.bright) {
        drawFourPointStar(ctx, x, y, d.radius, alpha, d.color);
      } else {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(x, y, d.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // D. Magical Fireflies (curved paths)
    for (let i = 0; i < fireflies.length; i++) {
      const f = fireflies[i];
      const x = (f.baseX + Math.sin(tSec * f.freqX + f.phase) * f.ampX) * width;
      const y = (f.baseY + Math.cos(tSec * f.freqY + f.phase * 1.3) * f.ampY) * height;
      const glowPulse = staticOnly ? 0.65 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(tSec * 2.2 + f.phase));

      ctx.save();
      ctx.globalAlpha = glowPulse * 0.9;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, f.radius * 4);
      grad.addColorStop(0, f.color);
      grad.addColorStop(0.35, 'rgba(196, 181, 253, 0.35)');
      grad.addColorStop(1, 'rgba(196, 181, 253, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, f.radius * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, f.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // G. Glowing Magical Butterflies
    for (let i = 0; i < butterflies.length; i++) {
      const b = butterflies[i];
      if (!staticOnly) {
        b.nx += b.vx * dt;
        if (b.nx > 0.94) {
          b.nx = 0.08;
          b.ny = rand(0.44, 0.72);
        } else if (b.nx < 0.06) {
          b.nx = 0.92;
          b.ny = rand(0.44, 0.72);
        }
      }
      drawButterfly(b, tSec);
    }

    // Ephemeral cursor trail & click bursts
    for (let i = ephemeralParticles.length - 1; i >= 0; i--) {
      const p = ephemeralParticles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        ephemeralParticles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const alpha = 1 - p.life / p.maxLife;
      if (p.isStar) {
        drawFourPointStar(ctx, p.x, p.y, p.size * alpha, alpha * 0.9, p.color);
      } else {
        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    if (!staticOnly && isRunning()) {
      rafId = requestAnimationFrame(renderFrame);
    } else {
      rafId = null;
    }
  }

  function isRunning() {
    return (
      !isDestroyed &&
      viewEl.classList.contains('active') &&
      !document.hidden &&
      !reducedMotionQuery.matches
    );
  }

  function syncLoop() {
    resizeCanvas();
    if (reducedMotionQuery.matches) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      renderFrame(0, true);
      return;
    }

    if (isRunning()) {
      if (!rafId) {
        lastTime = 0;
        rafId = requestAnimationFrame(renderFrame);
      }
    } else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function triggerTransition(onReady) {
    const veil = document.getElementById('shadow-transition-veil');
    if (reducedMotionQuery.matches || !veil) {
      if (typeof onReady === 'function') onReady();
      return;
    }

    veil.classList.add('is-entering');
    window.setTimeout(() => {
      if (typeof onReady === 'function') onReady();
      window.setTimeout(() => {
        veil.classList.remove('is-entering');
      }, 240);
    }, 180);
  }

  const onPointerMove = (e) => {
    const now = performance.now();
    if (now - lastTrailAt < 45) return;
    lastTrailAt = now;
    spawnTrailSparkle(e.clientX, e.clientY);
  };

  const onResize = () => resizeCanvas();
  const onVisibility = () => syncLoop();

  viewEl.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  if (typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', syncLoop);
  }

  const classObserver = typeof MutationObserver !== 'undefined'
    ? new MutationObserver(syncLoop)
    : null;
  if (classObserver) {
    classObserver.observe(viewEl, { attributes: true, attributeFilter: ['class'] });
  }

  syncLoop();

  return {
    triggerClickBurst,
    triggerTransition,
    destroy: () => {
      isDestroyed = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (classObserver) classObserver.disconnect();
      viewEl.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (typeof reducedMotionQuery.removeEventListener === 'function') {
        reducedMotionQuery.removeEventListener('change', syncLoop);
      }
    }
  };
}

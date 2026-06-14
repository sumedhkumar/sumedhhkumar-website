"use client";

import { useEffect, useRef, useCallback } from "react";

/* ── colour tokens (satin-brass palette) ─────────────────────────── */
const BRASS = { r: 184, g: 145, b: 74 };
const HIGHLIGHT = { r: 225, g: 201, b: 133 };
const CREAM = { r: 247, g: 243, b: 234 };

/* ── tunables ────────────────────────────────────────────────────── */
const PARTICLE_COUNT = 64;
const DEPTH_RANGE = 600; // z-axis spread
const PERSPECTIVE = 800; // camera focal length
const CONNECTION_DIST = 120; // px in screen-space
const WAVE_SPEED = 0.00025;
const WAVE_AMP = 28;
const DRIFT_SPEED = 0.10;
const MOUSE_INFLUENCE = 0.06;
const BASE_SIZE_MIN = 1.0;
const BASE_SIZE_MAX = 2.6;

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  vx: number;
  vy: number;
  size: number;
  phase: number; // wave offset
  tone: 0 | 1 | 2; // colour palette index
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const reducedMotion = useRef(false);
  const pixelRatioRef = useRef(1);
  const visibleRef = useRef(true);
  const pauseTimeoutRef = useRef<number | null>(null);

  /* ── initialise particles ──────────────────────────────────────── */
  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const z = Math.random() * DEPTH_RANGE - DEPTH_RANGE / 2;
      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        vx: (Math.random() - 0.5) * DRIFT_SPEED,
        vy: (Math.random() - 0.5) * DRIFT_SPEED,
        size:
          BASE_SIZE_MIN + Math.random() * (BASE_SIZE_MAX - BASE_SIZE_MIN),
        phase: Math.random() * Math.PI * 2,
        tone: (Math.floor(Math.random() * 3) as 0 | 1 | 2),
      });
    }
    particlesRef.current = particles;
  }, []);

  /* ── project 3-d → 2-d ────────────────────────────────────────── */
  const project = (
    x: number,
    y: number,
    z: number,
    cx: number,
    cy: number
  ) => {
    const scale = PERSPECTIVE / (PERSPECTIVE + z);
    return {
      sx: cx + (x - cx) * scale,
      sy: cy + (y - cy) * scale,
      scale,
    };
  };

  /* ── colour helpers ────────────────────────────────────────────── */
  const toneColour = (tone: 0 | 1 | 2, alpha: number) => {
    const c = tone === 0 ? BRASS : tone === 1 ? HIGHLIGHT : CREAM;
    return `rgba(${c.r},${c.g},${c.b},${alpha})`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    /* ── sizing ──────────────────────────────────────────────────── */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = rect?.width ?? window.innerWidth;
      const h = rect?.height ?? 820;
      pixelRatioRef.current = dpr;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particlesRef.current.length === 0) initParticles(w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const onVisibilityChange = () => {
      visibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    /* ── mouse tracking ──────────────────────────────────────────── */
    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
        active: true,
      };
    };
    const onLeave = () => {
      mouseRef.current.active = false;
    };
    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("mouseleave", onLeave);

    /* ── render loop ─────────────────────────────────────────────── */
    const startTime = performance.now();

    const draw = (now: number) => {
      if (!visibleRef.current) {
        pauseTimeoutRef.current = window.setTimeout(() => {
          pauseTimeoutRef.current = null;
          animRef.current = requestAnimationFrame(draw);
        }, 250);
        return;
      }

      const elapsed = now - startTime;
      const pixelRatio = pixelRatioRef.current || 1;
      const w = canvas.width / pixelRatio;
      const h = canvas.height / pixelRatio;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mActive = mouseRef.current.active;

      /* ── update & project ────────────────────────────────────── */
      const projected: {
        sx: number;
        sy: number;
        scale: number;
        idx: number;
      }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!reducedMotion.current) {
          // gentle drift
          p.baseX += p.vx;
          p.baseY += p.vy;

          // wrap around
          if (p.baseX < -60) p.baseX = w + 60;
          if (p.baseX > w + 60) p.baseX = -60;
          if (p.baseY < -60) p.baseY = h + 60;
          if (p.baseY > h + 60) p.baseY = -60;

          // wave undulation on z-axis
          p.z =
            p.baseZ +
            Math.sin(elapsed * WAVE_SPEED + p.phase) * WAVE_AMP;

          // mouse parallax influence
          if (mActive) {
            const dx = (mx - 0.5) * w * MOUSE_INFLUENCE;
            const dy = (my - 0.5) * h * MOUSE_INFLUENCE;
            const depthFactor = (p.z + DEPTH_RANGE / 2) / DEPTH_RANGE;
            p.x = p.baseX + dx * depthFactor;
            p.y = p.baseY + dy * depthFactor;
          } else {
            p.x += (p.baseX - p.x) * 0.05;
            p.y += (p.baseY - p.y) * 0.05;
          }
        }

        const { sx, sy, scale } = project(p.x, p.y, p.z, cx, cy);
        projected.push({ sx, sy, scale, idx: i });
      }

      // sort back-to-front for correct layering
      projected.sort((a, b) => a.scale - b.scale);

      /* ── draw connections ────────────────────────────────────── */
      const cellSize = CONNECTION_DIST;
      const cells = new Map<string, number[]>();

      for (let i = 0; i < projected.length; i++) {
        const point = projected[i];
        const key = `${Math.floor(point.sx / cellSize)}:${Math.floor(
          point.sy / cellSize
        )}`;
        const cell = cells.get(key);

        if (cell) {
          cell.push(i);
        } else {
          cells.set(key, [i]);
        }
      }

      for (let i = 0; i < projected.length; i++) {
        const a = projected[i];
        const cellX = Math.floor(a.sx / cellSize);
        const cellY = Math.floor(a.sy / cellSize);

        for (let x = cellX - 1; x <= cellX + 1; x++) {
          for (let y = cellY - 1; y <= cellY + 1; y++) {
            const cell = cells.get(`${x}:${y}`);
            if (!cell) continue;

            for (const j of cell) {
              if (j <= i) continue;

              const b = projected[j];
              const dx = a.sx - b.sx;
              const dy = a.sy - b.sy;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < CONNECTION_DIST) {
                const opacity =
                  (1 - dist / CONNECTION_DIST) *
                  0.18 *
                  Math.min(a.scale, b.scale);
                ctx.beginPath();
                ctx.moveTo(a.sx, a.sy);
                ctx.lineTo(b.sx, b.sy);
                ctx.strokeStyle = `rgba(${BRASS.r},${BRASS.g},${BRASS.b},${opacity})`;
                ctx.lineWidth = 0.6 * Math.min(a.scale, b.scale);
                ctx.stroke();
              }
            }
          }
        }
      }

      /* ── draw particles ──────────────────────────────────────── */
      for (const pt of projected) {
        const p = particles[pt.idx];
        const radius = p.size * pt.scale;
        const alpha = 0.3 + pt.scale * 0.5;

        // glow
        const grad = ctx.createRadialGradient(
          pt.sx,
          pt.sy,
          0,
          pt.sx,
          pt.sy,
          radius * 4
        );
        grad.addColorStop(0, toneColour(p.tone, alpha * 0.4));
        grad.addColorStop(1, toneColour(p.tone, 0));
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // core dot
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = toneColour(p.tone, alpha);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      if (pauseTimeoutRef.current !== null) {
        window.clearTimeout(pauseTimeoutRef.current);
      }
      window.removeEventListener("resize", resize);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
        zIndex: 0,
        opacity: 0.45,
        maskImage:
          "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.8) 55%, rgba(0,0,0,0) 100%)",
        WebkitMaskImage:
          "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.8) 55%, rgba(0,0,0,0) 100%)",
      }}
    />
  );
}

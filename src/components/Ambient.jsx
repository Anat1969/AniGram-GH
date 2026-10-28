import { useEffect, useRef } from 'react';

// רקע חי: טיפות זוהרות שנעות לאט, בהשראת הטיפות על הזרע. נעצר כשהלשונית מוסתרת,
// ומצויר סטטי כשהמשתמש ביקש להפחית תנועה.
export default function Ambient() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const drops = Array.from({ length: 34 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 3.2,
      vy: 0.00006 + Math.random() * 0.00016,
      vx: (Math.random() - 0.5) * 0.00006,
      a: 0.15 + Math.random() * 0.45,
      ph: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const d of drops) {
        if (!still) {
          d.y -= d.vy * 16;
          d.x += d.vx * 16;
          if (d.y < -0.05) {
            d.y = 1.05;
            d.x = Math.random();
          }
        }
        const tw = still ? 1 : 0.75 + 0.25 * Math.sin(t / 1400 + d.ph);
        const x = d.x * w;
        const y = d.y * h;
        const g = ctx.createRadialGradient(x - d.r * 0.3, y - d.r * 0.3, 0, x, y, d.r * 4);
        g.addColorStop(0, `rgba(255,255,255,${d.a * tw})`);
        g.addColorStop(0.3, `rgba(143,216,230,${d.a * 0.5 * tw})`);
        g.addColorStop(1, 'rgba(143,216,230,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, d.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!still && !document.hidden) raf = requestAnimationFrame(draw);
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={ref} className="ambient" aria-hidden="true" />;
}

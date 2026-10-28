import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TYPES, CENTER_META, GROWTH, STRESS, getType, wingsOf } from '../data/types.js';
import { R, pointOf, polyPath, TRIANGLE, HEXAD, segment, arc, band } from '../geometry.js';

export const GROWTH_COLOR = '#9be3b8';
export const STRESS_COLOR = '#f08a8a';

const ALL = { circle: true, points: true, inner: false, centers: false, wings: false, growth: false, stress: false };

// דיאגרמת האניאגרם החיה. אותו רכיב משמש סיפור בגלילה, מפה, דף טיפוס והשוואה.
// focus: טיפוס שהקשרים שלו מודגשים. secondary: טיפוס שני בהשוואה.
export default function Enneagram({
  layers = {},
  focus = null,
  secondary = null,
  onSelect,
  labels = 'name',
  hoverable = true,
  className = '',
  title = 'דיאגרמת האניאגרם',
}) {
  const L = { ...ALL, ...layers };
  const [hover, setHover] = useState(null);
  const f = hover ?? focus;
  const related = f ? new Set([...wingsOf(f), GROWTH[f], STRESS[f]]) : null;

  const linesOf = (map) => (f ? [[f, map[f]]] : TYPES.map((t) => [t.n, map[t.n]]));

  return (
    <svg className={`ennea ${className}`} viewBox="-280 -280 560 560" role="img" aria-label={title}>
      <defs>
        <radialGradient id="pt-glow">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#8fd8e6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8fd8e6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="core-glow">
          <stop offset="0%" stopColor="#8fd8e6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#8fd8e6" stopOpacity="0" />
        </radialGradient>
        {[['growth', GROWTH_COLOR], ['stress', STRESS_COLOR]].map(([id, c]) => (
          <marker key={id} id={`arrow-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={c} />
          </marker>
        ))}
      </defs>

      <circle r={R + 70} fill="url(#core-glow)" pointerEvents="none" />

      {/* רצועות המרכזים */}
      <AnimatePresence>
        {L.centers &&
          Object.entries(CENTER_META).map(([key, c], i) => {
            const on = !f || c.members.includes(f);
            return (
              <motion.path
                key={key}
                d={band(c.members)}
                fill={c.color}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: on ? 0.55 : 0.12, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="ennea-band"
              >
                <title>{c.name}</title>
              </motion.path>
            );
          })}
      </AnimatePresence>

      {/* המעגל */}
      {L.circle && (
        <motion.circle
          r={R}
          fill="none"
          stroke="rgba(143,216,230,0.35)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 0.61, 0.36, 1] }}
        />
      )}

      {/* קווים פנימיים: משולש והקסגון */}
      <AnimatePresence>
        {L.inner &&
          [polyPath(TRIANGLE), polyPath(HEXAD)].map((d, i) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke="rgba(232,247,250,0.42)"
              strokeWidth="1.3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: f ? 0.35 : 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              transition={{ duration: 1.8, delay: i * 0.5, ease: 'easeInOut' }}
            />
          ))}
      </AnimatePresence>

      {/* כנפיים: קשתות בין שכנים */}
      <AnimatePresence>
        {L.wings &&
          TYPES.map((t) => {
            const next = t.n === 9 ? 1 : t.n + 1;
            const on = !f || t.n === f || next === f;
            return (
              <motion.path
                key={`w${t.n}`}
                d={arc(t.n, next)}
                fill="none"
                stroke="#e3b96b"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: on ? 0.95 : 0.12, strokeWidth: on && f ? 5 : 3 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.6, delay: f ? 0 : t.n * 0.07 }}
              />
            );
          })}
      </AnimatePresence>

      {/* קווי צמיחה ולחץ, עם זרימה בכיוון התנועה */}
      {[
        ['growth', L.growth, GROWTH, GROWTH_COLOR, 'flow-solid'],
        ['stress', L.stress, STRESS, STRESS_COLOR, 'flow-dash'],
      ].map(([id, on, map, color, cls]) =>
        on
          ? linesOf(map).map(([a, b], i) => (
              <motion.path
                key={`${id}${a}-${b}-${f ?? 'all'}`}
                d={segment(a, b, 22, f ? 0 : id === 'growth' ? 4 : -4)}
                fill="none"
                stroke={color}
                strokeWidth={f ? 3 : 2}
                markerEnd={`url(#arrow-${id})`}
                className={cls}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.95 }}
                transition={{ duration: 0.5, delay: f ? 0.1 : i * 0.08 }}
              />
            ))
          : null,
      )}

      {/* הנקודות */}
      {L.points &&
        TYPES.map((t, i) => {
          const p = pointOf(t.n);
          const lp = pointOf(t.n, R + 54);
          const isF = t.n === focus;
          const isS = t.n === secondary;
          const dim = f && t.n !== f && !related.has(t.n) && t.n !== secondary;
          const c = CENTER_META[t.center].color;
          const anchor = Math.abs(lp.x) < 20 ? 'middle' : lp.x > 0 ? 'start' : 'end';
          const interactive = Boolean(onSelect);
          return (
            <motion.g
              key={t.n}
              className={`ennea-pt${interactive ? ' is-link' : ''}`}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: dim ? 0.3 : 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.07 }}
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              onMouseEnter={hoverable ? () => setHover(t.n) : undefined}
              onMouseLeave={hoverable ? () => setHover(null) : undefined}
              onFocus={hoverable ? () => setHover(t.n) : undefined}
              onBlur={hoverable ? () => setHover(null) : undefined}
              onClick={interactive ? () => onSelect(t.n) : undefined}
              onKeyDown={interactive ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(t.n)) : undefined}
              tabIndex={interactive ? 0 : undefined}
              role={interactive ? 'button' : undefined}
              aria-label={interactive ? `${t.n} ${t.name}` : undefined}
              data-type={t.n}
            >
              {interactive && (
                <line x1={p.x} y1={p.y} x2={lp.x} y2={lp.y} stroke="transparent" strokeWidth="44" strokeLinecap="round" className="ennea-hit" />
              )}
              {(isF || isS) && (
                <circle cx={p.x} cy={p.y} r="34" fill="none" stroke={isS ? '#e3b96b' : '#8fd8e6'} strokeWidth="1.5" className="ennea-ring" />
              )}
              <circle cx={p.x} cy={p.y} r={isF || isS ? 34 : 26} fill="url(#pt-glow)" opacity={isF || isS ? 0.9 : 0.45} />
              <circle
                cx={p.x}
                cy={p.y}
                r="19"
                fill={isS ? '#3a2c12' : '#0b1f26'}
                stroke={L.centers ? c : isS ? '#e3b96b' : '#8fd8e6'}
                strokeWidth={isF || isS ? 3 : 1.6}
              />
              <text x={p.x} y={p.y} dy="0.36em" textAnchor="middle" className="ennea-num">
                {t.n}
              </text>
              {labels === 'name' && (
                <text x={lp.x} y={lp.y} dy="0.36em" textAnchor={anchor} className={`ennea-label${isF || isS ? ' on' : ''}`}>
                  {t.name}
                </text>
              )}
            </motion.g>
          );
        })}

      {/* תווית מרחפת לטיפוס במוקד */}
      {hover && labels !== 'name' && (
        <text x="0" y="6" textAnchor="middle" className="ennea-center-label">
          {getType(hover).name}
        </text>
      )}
    </svg>
  );
}

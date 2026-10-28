import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TYPES, CENTER_META } from '../data/types.js';
import { pointOf } from '../geometry.js';

// מיני דיאגרמה: מראה איפה הטיפוס יושב על המעגל.
function MiniMap({ n, color }) {
  return (
    <svg className="mini-map" viewBox="-200 -200 400 400" aria-hidden="true">
      <circle r="170" fill="none" stroke="rgba(143,216,230,0.3)" strokeWidth="6" />
      {TYPES.map((t) => {
        const p = pointOf(t.n);
        const on = t.n === n;
        return <circle key={t.n} cx={p.x} cy={p.y} r={on ? 34 : 14} fill={on ? color : 'rgba(232,247,250,0.35)'} />;
      })}
    </svg>
  );
}

const FILTERS = [['all', 'הכל'], ...Object.entries(CENTER_META).map(([k, c]) => [k, c.name])];

export default function TypesIndex() {
  const [filter, setFilter] = useState('all');
  const shown = TYPES.filter((t) => filter === 'all' || t.center === filter);

  return (
    <section className="page">
      <header className="page-head">
        <span className="kicker">9 TYPES</span>
        <h1>תשעת הטיפוסים</h1>
        <p className="lead">כל כרטיס מראה את מיקום הטיפוס על המעגל ואת מוקד תשומת הלב שלו. הצבע מסמן את המרכז.</p>
      </header>

      <div className="layer-bar" role="group" aria-label="סינון לפי מרכז">
        {FILTERS.map(([k, label]) => (
          <button key={k} type="button" className="layer-btn" aria-pressed={filter === k} onClick={() => setFilter(k)} style={{ '--c': CENTER_META[k]?.color || '#e8f7fa' }}>
            <span className="swatch" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <ul className="type-grid">
        <AnimatePresence>
          {shown.map((t, i) => {
            const c = CENTER_META[t.center].color;
            return (
              <motion.li
                key={t.n}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
              >
                <a className="type-card" href={`#/type/${t.n}`} style={{ '--c': c }}>
                  <MiniMap n={t.n} color={c} />
                  <span className="type-num">{String(t.n).padStart(2, '0')}</span>
                  <span className="type-name">{t.name}</span>
                  <span className="type-en">{t.en}</span>
                  <span className="type-focus">{t.focus}</span>
                  <span className="type-center">{CENTER_META[t.center].name}</span>
                </a>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <p className="note">התיאורים, המרכזים ומוקדי תשומת הלב הם ידע כללי במילים שלנו, וממתינים לאימות מול המקור.</p>
    </section>
  );
}

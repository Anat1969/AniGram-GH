import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Enneagram, { GROWTH_COLOR, STRESS_COLOR } from '../components/Enneagram.jsx';
import { CENTER_META, GROWTH, STRESS, getType, wingsOf } from '../data/types.js';

const LAYERS = [
  ['inner', 'קווים פנימיים'],
  ['centers', 'מרכזים'],
  ['wings', 'כנפיים'],
  ['growth', 'צמיחה'],
  ['stress', 'לחץ'],
];

function Chip({ n, tone }) {
  const t = getType(n);
  return (
    <a className={`mini-chip ${tone || ''}`} href={`#/map/${n}`}>
      <span className="mono">{n}</span> {t.name}
    </a>
  );
}

export default function MapPage({ selected }) {
  const [layers, setLayers] = useState({ inner: true, centers: true, wings: false, growth: true, stress: true });
  const t = selected ? getType(selected) : null;
  const toggle = (k) => setLayers((v) => ({ ...v, [k]: !v[k] }));
  const select = (n) => {
    window.location.hash = n === selected ? '#/map' : `#/map/${n}`;
  };

  return (
    <section className="page map-page">
      <header className="page-head">
        <span className="kicker">MAP</span>
        <h1>מפת האניאגרם</h1>
        <p className="lead">בחרו שכבות, ריחפו מעל נקודה כדי לראות את הקשרים שלה, ולחצו כדי לפתוח את הלוח שלה.</p>
      </header>

      <div className="layer-bar" role="group" aria-label="שכבות המפה">
        {LAYERS.map(([k, label]) => (
          <button key={k} type="button" className={`layer-btn layer-${k}`} aria-pressed={layers[k]} onClick={() => toggle(k)}>
            <span className="swatch" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="map-grid">
        <div className="map-stage">
          <Enneagram layers={layers} focus={selected} onSelect={select} title="מפת האניאגרם האינטראקטיבית" />
        </div>

        <aside className="map-panel" aria-live="polite">
          <AnimatePresence mode="wait">
            {t ? (
              <motion.div key={t.n} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.3 }}>
                <div className="panel-num" style={{ '--c': CENTER_META[t.center].color }}>{t.n}</div>
                <h2>{t.name}</h2>
                <p className="en-line">{t.en}</p>
                <p className="focus-line">מוקד תשומת הלב: {t.focus}</p>
                <dl className="struct">
                  <dt>מרכז</dt>
                  <dd><span className="dot" style={{ background: CENTER_META[t.center].color }} />{CENTER_META[t.center].name}</dd>
                  <dt>כנפיים</dt>
                  <dd className="chips">{wingsOf(t.n).map((w) => <Chip key={w} n={w} />)}</dd>
                  <dt>צמיחה</dt>
                  <dd className="chips"><Chip n={GROWTH[t.n]} tone="growth" /></dd>
                  <dt>לחץ</dt>
                  <dd className="chips"><Chip n={STRESS[t.n]} tone="stress" /></dd>
                </dl>
                <div className="panel-actions">
                  <a className="cta small" href={`#/type/${t.n}`}>לדף הטיפוס</a>
                  <a className="cta small ghost" href={`#/compare/${t.n}/${GROWTH[t.n]}`}>להשוואה</a>
                </div>
                <p className="badge-general">מבנה לפי ידע כללי, ממתין לאימות מול המקור</p>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="panel-empty">
                <h2>בחרו נקודה</h2>
                <p>הלוח יציג את המרכז, הכנפיים וכיווני התנועה של הטיפוס.</p>
                <ul className="legend vertical">
                  {Object.values(CENTER_META).map((c) => (
                    <li key={c.name}><span className="dot" style={{ background: c.color }} />{c.name}: {c.members.join(', ')}</li>
                  ))}
                  <li><svg width="40" height="10" aria-hidden="true"><line x1="0" y1="5" x2="40" y2="5" stroke={GROWTH_COLOR} strokeWidth="3" /></svg>כיוון צמיחה</li>
                  <li><svg width="40" height="10" aria-hidden="true"><line x1="0" y1="5" x2="40" y2="5" stroke={STRESS_COLOR} strokeWidth="3" strokeDasharray="6 5" /></svg>כיוון לחץ</li>
                  <li><svg width="40" height="10" aria-hidden="true"><line x1="0" y1="5" x2="40" y2="5" stroke="#e3b96b" strokeWidth="4" strokeLinecap="round" /></svg>כנף</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </section>
  );
}

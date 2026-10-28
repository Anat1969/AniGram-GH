import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Enneagram, { GROWTH_COLOR, STRESS_COLOR } from '../components/Enneagram.jsx';
import { CENTER_META, GROWTH, STRESS, getType, wingsOf } from '../data/types.js';

const FACETS = [
  ['motivation', 'מה מניע', 'MOTIVE'],
  ['worry', 'מה מטריד', 'CONCERN'],
  ['strengths', 'כוחות', 'STRENGTH'],
  ['watch', 'שים לב ל', 'WATCH'],
];

const go = (n) => {
  window.location.hash = `#/type/${n}`;
};

// סכמת מסלול: לחץ מצד אחד, צמיחה מהצד השני, והטיפוס במרכז.
function FlowSchema({ t }) {
  const g = getType(GROWTH[t.n]);
  const s = getType(STRESS[t.n]);
  return (
    <div className="flow" aria-label="מסלול תנועה">
      <a className="flow-node stress" href={`#/type/${s.n}`}>
        <small>בלחץ</small>
        <b>{s.n}</b>
        <span>{s.name}</span>
      </a>
      <svg className="flow-line" viewBox="0 0 120 20" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="10" x2="110" y2="10" stroke={STRESS_COLOR} strokeWidth="2.5" className="flow-dash" />
        <polygon points="120,10 108,4 108,16" fill={STRESS_COLOR} />
      </svg>
      <div className="flow-node self" style={{ '--c': CENTER_META[t.center].color }}>
        <small>הטיפוס</small>
        <b>{t.n}</b>
        <span>{t.name}</span>
      </div>
      <svg className="flow-line" viewBox="0 0 120 20" preserveAspectRatio="none" aria-hidden="true">
        <line x1="120" y1="10" x2="10" y2="10" stroke={GROWTH_COLOR} strokeWidth="2.5" className="flow-solid" />
        <polygon points="0,10 12,4 12,16" fill={GROWTH_COLOR} />
      </svg>
      <a className="flow-node growth" href={`#/type/${g.n}`}>
        <small>בצמיחה</small>
        <b>{g.n}</b>
        <span>{g.name}</span>
      </a>
    </div>
  );
}

export default function TypeDetail({ n }) {
  const t = getType(n);
  const touch = useRef(null);
  const prev = t && getType(t.n === 1 ? 9 : t.n - 1);
  const next = t && getType(t.n === 9 ? 1 : t.n + 1);

  // מקלדת: בממשק מימין לשמאל, חץ שמאלה הוא "הבא".
  useEffect(() => {
    if (!t) return undefined;
    const onKey = (e) => {
      if (e.target.closest('input, textarea, ai-menu')) return;
      if (e.key === 'ArrowLeft') go(next.n);
      if (e.key === 'ArrowRight') go(prev.n);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [t, next, prev]);

  if (!t) {
    return (
      <section className="page">
        <h1>הדף לא נמצא</h1>
        <a href="#/">לדף הבית</a>
      </section>
    );
  }

  const c = CENTER_META[t.center];
  const onTouchStart = (e) => (touch.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (Math.abs(dx) > 60) go(dx > 0 ? next.n : prev.n);
  };

  return (
    <motion.section key={t.n} className="page type-page" style={{ '--c': c.color }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <motion.span className="watermark" aria-hidden="true" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }}>
        {t.n}
      </motion.span>

      <p className="crumb"><a href="#/types">תשעת הטיפוסים</a> / {t.n}</p>
      <motion.h1 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        {t.name} <span className="en">({t.en})</span>
      </motion.h1>
      <div className="chip-row">
        <span className="chip center-chip"><span className="dot" style={{ background: c.color }} />{c.name}</span>
        <span className="chip">מוקד: {t.focus}</span>
        <span className="chip muted">ידע כללי, ממתין לאימות מול המקור</span>
      </div>

      <div className="type-grid-2">
        <div className="type-diagram">
          <Enneagram layers={{ inner: true, centers: true, wings: true, growth: true, stress: true }} focus={t.n} onSelect={go} labels="name" title={`${t.name} על דיאגרמת האניאגרם`} />
        </div>
        <div className="facets">
          {FACETS.map(([k, label, en], i) => (
            <motion.article
              key={k}
              className="facet"
              initial={{ opacity: 0, y: 26, rotateX: -12 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.55, delay: 0.15 + i * 0.12 }}
            >
              <span className="facet-en">{en}</span>
              <h3>{label}</h3>
              <p>{t[k]}</p>
            </motion.article>
          ))}
        </div>
      </div>

      <h2 className="section-title">מסלול תנועה</h2>
      <FlowSchema t={t} />

      <h2 className="section-title">שכנים על המעגל</h2>
      <div className="wing-row">
        {wingsOf(t.n).map((w) => {
          const wt = getType(w);
          return (
            <a key={w} className="wing-card" href={`#/type/${w}`} style={{ '--c': CENTER_META[wt.center].color }}>
              <small>כנף אפשרית</small>
              <b>{w} · {wt.name}</b>
            </a>
          );
        })}
        <a className="wing-card compare" href={`#/compare/${t.n}/${next.n}`}>
          <small>השוואה</small>
          <b>להשוות לטיפוס אחר</b>
        </a>
      </div>

      <p className="note">
        האניאגרם משמש לשיקוף, לא לקביעת טיפוס. אם אתם מזהים את עצמכם בתיאור, זה נתון לבדיקה ולא מסקנה.
      </p>

      <nav className="pager" aria-label="מעבר בין טיפוסים">
        <a href={`#/type/${prev.n}`} className="pager-prev"><small>הקודם</small>{prev.name}</a>
        <span className="pager-hint">אפשר גם בחצי המקלדת או בהחלקה</span>
        <a href={`#/type/${next.n}`} className="pager-next"><small>הבא</small>{next.name}</a>
      </nav>
    </motion.section>
  );
}

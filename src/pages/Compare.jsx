import { AnimatePresence, motion } from 'framer-motion';
import Enneagram from '../components/Enneagram.jsx';
import { TYPES, CENTER_META, getType, relation } from '../data/types.js';

const FACETS = [
  ['focus', 'מוקד תשומת הלב'],
  ['motivation', 'מה מניע'],
  ['worry', 'מה מטריד'],
  ['strengths', 'כוחות'],
  ['watch', 'שים לב ל'],
];

function Picker({ label, value, other, tone, onPick }) {
  return (
    <div className={`picker ${tone}`} role="group" aria-label={label}>
      <span className="picker-label">{label}</span>
      <div className="picker-row">
        {TYPES.map((t) => (
          <button
            key={t.n}
            type="button"
            aria-pressed={t.n === value}
            disabled={t.n === other}
            onClick={() => onPick(t.n)}
            title={t.name}
            data-pick={`${tone}-${t.n}`}
          >
            {t.n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Compare({ a, b }) {
  const A = getType(a) || getType(1);
  const B = getType(b) || getType(2);
  const set = (x, y) => {
    window.location.hash = `#/compare/${x}/${y}`;
  };
  const rel = relation(A.n, B.n);

  return (
    <section className="page compare-page">
      <header className="page-head">
        <span className="kicker">COMPARE</span>
        <h1>השוואה בין שני טיפוסים</h1>
        <p className="lead">השוואה מבנית: איפה כל טיפוס יושב בדיאגרמה ומה מחבר ביניהם. היא לא קובעת התאמה בין אנשים ולא מנבאת יחסים.</p>
      </header>

      <div className="picker-wrap">
        <Picker label="טיפוס א" value={A.n} other={B.n} tone="pa" onPick={(n) => set(n, B.n)} />
        <button type="button" className="swap" onClick={() => set(B.n, A.n)}>החלפה</button>
        <Picker label="טיפוס ב" value={B.n} other={A.n} tone="pb" onPick={(n) => set(A.n, n)} />
      </div>

      <div className="compare-grid">
        <div className="compare-stage">
          <Enneagram layers={{ inner: true, centers: true, wings: true, growth: true, stress: true }} focus={A.n} secondary={B.n} title={`${A.name} ו${B.name} על הדיאגרמה`} />
        </div>
        <div className="relation">
          <div className="vs">
            <span className="vs-a">{A.n} · {A.name}</span>
            <span className="vs-and">לעומת</span>
            <span className="vs-b">{B.n} · {B.name}</span>
          </div>
          <h2>מה מחבר ביניהם במבנה</h2>
          <AnimatePresence mode="popLayout">
            <ul className="rel-list" key={`${A.n}-${B.n}`}>
              {rel.map((r, i) => (
                <motion.li key={r.text} className={`rel rel-${r.kind}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  {r.text}
                </motion.li>
              ))}
            </ul>
          </AnimatePresence>
          <p className="badge-general">המבנה לפי ידע כללי, ממתין לאימות מול המקור</p>
        </div>
      </div>

      <div className="side-table" role="table" aria-label="השוואת היבטים">
        <div className="side-row head" role="row">
          <span role="columnheader">היבט</span>
          <span role="columnheader" className="ca" style={{ '--c': CENTER_META[A.center].color }}>{A.name}</span>
          <span role="columnheader" className="cb" style={{ '--c': CENTER_META[B.center].color }}>{B.name}</span>
        </div>
        {FACETS.map(([k, label], i) => (
          <motion.div key={`${k}-${A.n}-${B.n}`} className="side-row" role="row" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}>
            <span role="rowheader">{label}</span>
            <span role="cell">{A[k]}</span>
            <span role="cell">{B[k]}</span>
          </motion.div>
        ))}
      </div>
      <p className="note">
        שני טיפוסים שונים אינם "מתאימים" או "לא מתאימים". ההשוואה עוזרת לראות הבדלים בתשומת הלב, לא לשפוט אנשים.
      </p>
    </section>
  );
}

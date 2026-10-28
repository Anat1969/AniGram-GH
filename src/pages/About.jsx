import { motion } from 'framer-motion';
import { SOURCE_URL } from '../data/types.js';

// מפת מקורות: כל רכיב תוכן באפליקציה, ומה מעמדו מול המקור.
const LAYERS = [
  { name: 'שמות תשעת הטיפוסים', status: 'verified', note: 'נבדק מול 9types.co.il ב-28.10.2026' },
  { name: 'שמות באנגלית', status: 'partial', note: 'לפי תרגום האתר, בלי מקור אנגלי נפרד' },
  { name: 'תיאורים: מניע, מטריד, כוחות, שים לב', status: 'general', note: 'סיכום במילים שלנו' },
  { name: 'מוקד תשומת הלב', status: 'general', note: 'סיכום במילים שלנו' },
  { name: 'שלושת המרכזים', status: 'general', note: 'הדף שנבדק לא הזכיר אותם' },
  { name: 'כנפיים', status: 'general', note: 'שכנות על המעגל' },
  { name: 'קווי צמיחה ולחץ', status: 'general', note: 'הקריאה המקובלת בספרות הכללית' },
];

const STATUS = {
  verified: 'אומת מול המקור',
  partial: 'אומת חלקית',
  general: 'ידע כללי, ממתין לאימות',
};

const IS_NOT = [
  'אינו אבחון ואינו קובע טיפוס לאדם.',
  'אינו כלי פסיכומטרי מאומת בספרות המחקר המרכזית.',
  'אינו קשור להפרעה נפשית או למצב רפואי.',
  'אינו מנבא התאמה בין אנשים.',
];

export default function About() {
  const counts = LAYERS.reduce((acc, l) => ({ ...acc, [l.status]: (acc[l.status] || 0) + 1 }), {});
  const pct = Math.round(((counts.verified || 0) / LAYERS.length) * 100);

  return (
    <section className="page about-page">
      <header className="page-head">
        <span className="kicker">ABOUT</span>
        <h1>על השיטה</h1>
        <p className="lead">
          האניאגרם הוא מודל של תשעה טיפוסי אישיות, המתארים דפוסי מוטיבציה ותשומת לב. השיטה משמשת בעיקר לשיקוף ולפיתוח עצמי.
        </p>
      </header>

      <div className="isnot">
        <h2 className="section-title">מה האניאגרם אינו</h2>
        <ul>
          {IS_NOT.map((t, i) => (
            <motion.li key={t} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              {t}
            </motion.li>
          ))}
        </ul>
        <p>
          שאלונים מבוססי הצהרה עצמית מוגבלים באמינותם. האתר של המרכז הישראלי לאניאגרם מציג את השאלון שלו כ"כלי עזר בלבד".
        </p>
      </div>

      <h2 className="section-title">מפת מקורות</h2>
      <p className="lead small">כל שכבת תוכן באפליקציה, ומה מעמדה מול המקור. כך האפליקציה מודדת את האמינות של עצמה.</p>

      <div className="source-map">
        <motion.a className="source-node" href={SOURCE_URL} target="_blank" rel="noreferrer" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <small>מקור</small>
          <b>המרכז הישראלי לאניאגרם</b>
          <span>Israeli Enneagram Center, 9types.co.il</span>
        </motion.a>
        <ul className="source-layers">
          {LAYERS.map((l, i) => (
            <motion.li key={l.name} className={`src src-${l.status}`} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.08 }}>
              <span className="src-wire" aria-hidden="true" />
              <b>{l.name}</b>
              <span className="src-status">{STATUS[l.status]}</span>
              <small>{l.note}</small>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="meter" aria-label={`${pct} אחוז מהשכבות אומתו מול המקור`}>
        <div className="meter-track">
          <motion.div className="meter-fill" initial={{ width: 0 }} whileInView={{ width: `${Math.max(pct, 4)}%` }} viewport={{ once: true }} transition={{ duration: 1.2 }} />
        </div>
        <p>
          <span className="mono">{counts.verified || 0}/{LAYERS.length}</span> שכבות אומתו מול המקור. הצעד הבא: לאמת את התיאורים ואת המבנה, שכבה אחר שכבה.
        </p>
      </div>

      <p className="note">
        מקור: <a href={SOURCE_URL} target="_blank" rel="noreferrer">9types.co.il</a>. אין באפליקציה טקסט שהועתק מהאתר.
      </p>
    </section>
  );
}

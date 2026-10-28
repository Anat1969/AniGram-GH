import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Enneagram, { GROWTH_COLOR, STRESS_COLOR } from '../components/Enneagram.jsx';
import { CENTER_META, SOURCE_URL } from '../data/types.js';

// סיפור בגלילה: כל שלב מוסיף שכבה לדיאגרמה הדביקה.
const STEPS = [
  {
    id: 'points',
    kicker: '01',
    title: 'תשע נקודות על מעגל אחד',
    text: 'כל נקודה היא טיפוס: דפוס של מוטיבציה ושל תשומת לב. המספרים אינם דירוג. 9 למעלה רק כי כך משרטטים את המעגל.',
    layers: { points: true },
  },
  {
    id: 'inner',
    kicker: '02',
    title: 'הקווים הפנימיים',
    text: 'משולש מחבר את 3, 6 ו-9. צורה בת שש צלעות מחברת את שאר הנקודות בסדר 1, 4, 2, 8, 5, 7. הקווים האלה הם הבסיס לתנועה בין טיפוסים.',
    layers: { inner: true },
    general: true,
  },
  {
    id: 'centers',
    kicker: '03',
    title: 'שלושה מרכזים',
    text: 'הטיפוסים מקובצים בשלשות. כל שלשה חולקת נושא משותף.',
    layers: { centers: true },
    general: true,
    centers: true,
  },
  {
    id: 'wings',
    kicker: '04',
    title: 'שכנים: הכנפיים',
    text: 'לכל טיפוס שני שכנים על המעגל. בשיטה מקובל לומר שאחד מהם, או שניהם, צובעים את הטיפוס. הם נקראים כנפיים.',
    layers: { wings: true },
    general: true,
  },
  {
    id: 'lines',
    kicker: '05',
    title: 'תנועה: צמיחה ולחץ',
    text: 'החצים מראים כיוון. בקריאה המקובלת, ברגעי רווחה טיפוס נע לכיוון אחד, ובלחץ לכיוון האחר. זו מפה לשיקוף, לא חוק.',
    layers: { growth: true, stress: true },
    general: true,
    legend: true,
  },
];

// השלב הפעיל: האחרון שחצה את קו המדידה. חישוב ישיר בכל גלילה, כך שגם קפיצה מהירה נתפסת.
// בנייד הדיאגרמה דביקה בחלק העליון, לכן הקו נמוך יותר.
function useActiveStep(count) {
  const refs = useRef([]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const probe = innerHeight * (innerWidth < 860 ? 0.72 : 0.5);
      let idx = 0;
      refs.current.slice(0, count).forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= probe) idx = i;
      });
      setActive(idx);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  }, [count]);
  return [active, refs];
}

export default function Home() {
  const [active, refs] = useActiveStep(STEPS.length);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const spin = useTransform(scrollYProgress, [0, 1], [0, 40]);

  // השכבות מצטברות: כל שלב שומר את מה שנבנה לפניו.
  const layers = STEPS.slice(0, active + 1).reduce((acc, s) => ({ ...acc, ...s.layers }), {});
  if (active === 4) layers.wings = false;

  return (
    <div className="home">
      <section className="hero" ref={heroRef}>
        <motion.div className="hero-bg" style={{ y: heroY, backgroundImage: `url(${import.meta.env.BASE_URL}hero.png)` }} aria-hidden="true" />
        <motion.div className="hero-inner" style={{ opacity: heroFade }}>
          <div className="hero-copy">
            <motion.p className="kicker" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              ENNEAGRAM · 9 TYPES
            </motion.p>
            <h1 className="hero-title" aria-label="אניגרם">
              {'אניגרם'.split('').map((ch, i) => (
                <motion.span key={i} initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.3 + i * 0.08, duration: 0.7 }}>
                  {ch}
                </motion.span>
              ))}
            </h1>
            <motion.p className="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }}>
              מפה חיה של תשעת הטיפוסים בשיטת האניאגרם. מודל לשיקוף ולפיתוח עצמי, לא כלי אבחון.
            </motion.p>
            <motion.div className="cta-row" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
              <a className="cta" href="#/types">לתשעת הטיפוסים</a>
              <a className="cta ghost" href="#/map">למפה האינטראקטיבית</a>
            </motion.div>
          </div>
          <motion.div className="hero-diagram" style={{ rotate: spin }}>
            <Enneagram layers={{ inner: true }} labels="none" hoverable={false} title="דיאגרמת האניאגרם מצטיירת" />
          </motion.div>
        </motion.div>
        <div className="scroll-hint" aria-hidden="true">
          <span>גללו כדי לבנות את המפה</span>
          <i />
        </div>
      </section>

      <section className="story" aria-label="איך בנויה הדיאגרמה">
        <div className="story-stage">
          <div className="stage-inner">
            <Enneagram layers={layers} labels="name" title="הדיאגרמה נבנית שלב אחר שלב" />
            <div className="stage-progress" aria-hidden="true">
              {STEPS.map((s, i) => (
                <span key={s.id} className={i <= active ? 'on' : ''} />
              ))}
            </div>
          </div>
        </div>
        <div className="story-steps">
          {STEPS.map((s, i) => (
            <article key={s.id} ref={(el) => (refs.current[i] = el)} data-step={i} className={`step${i === active ? ' active' : ''}`}>
              <span className="step-num">{s.kicker}</span>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
              {s.centers && (
                <ul className="center-list">
                  {Object.values(CENTER_META).map((c) => (
                    <li key={c.name} style={{ '--c': c.color }}>
                      <b>{c.name}</b>
                      <span>{c.members.join(' · ')}</span>
                      <small>{c.theme}</small>
                    </li>
                  ))}
                </ul>
              )}
              {s.legend && (
                <ul className="legend">
                  <li><svg width="40" height="10" aria-hidden="true"><line x1="0" y1="5" x2="40" y2="5" stroke={GROWTH_COLOR} strokeWidth="3" /></svg>כיוון צמיחה</li>
                  <li><svg width="40" height="10" aria-hidden="true"><line x1="0" y1="5" x2="40" y2="5" stroke={STRESS_COLOR} strokeWidth="3" strokeDasharray="6 5" /></svg>כיוון לחץ</li>
                </ul>
              )}
              {s.general && <p className="badge-general">ידע כללי על האניאגרם, ממתין לאימות מול המקור</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="closing">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7 }}>
          <span className="step-num">06</span>
          <h2>שיקוף, לא אבחון</h2>
          <p>
            המפה עוזרת לשאול שאלות, לא לקבוע תשובות. אם אתם מזהים את עצמכם בטיפוס, זה נתון לבדיקה ולא מסקנה.
            האניאגרם אינו כלי פסיכומטרי מאומת.
          </p>
          <div className="door-grid">
            <a className="door" href="#/types"><b>תשעת הטיפוסים</b><span>תיאור קצר לכל טיפוס</span></a>
            <a className="door" href="#/map"><b>מפה</b><span>שכבות, מרכזים וקווים</span></a>
            <a className="door" href="#/compare/1/2"><b>השוואה</b><span>היחס המבני בין שני טיפוסים</span></a>
            <a className="door" href="#/about"><b>על השיטה</b><span>מקורות ומגבלות</span></a>
          </div>
          <p className="note">
            שמות הטיפוסים לפי המרכז הישראלי לאניאגרם:{' '}
            <a href={SOURCE_URL} target="_blank" rel="noreferrer">9types.co.il</a>. התיאורים במילים שלנו.
          </p>
        </motion.div>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import Ambient from './components/Ambient.jsx';
import Home from './pages/Home.jsx';
import MapPage from './pages/MapPage.jsx';
import TypesIndex from './pages/TypesIndex.jsx';
import TypeDetail from './pages/TypeDetail.jsx';
import Compare from './pages/Compare.jsx';
import About from './pages/About.jsx';

// ניתוב בהאש: עובד בלי הגדרות שרת, כך שהאתר נפתח ישירות מכל כתובת.
function useHash() {
  const read = () => window.location.hash.replace(/^#/, '') || '/';
  const [path, setPath] = useState(read);
  useEffect(() => {
    const onChange = () => setPath(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

// כפתור הלוגו לפי תקן A&I: רכיב <ai-menu> המשותף (נטען ב-index.html).
// העתקת קישור, שיחת הפיתוח, פרויקט המחקר והתקנת האפליקציה נמצאים בתוכו, לא בסרגל.
const DEV_CHAT = 'https://claude.ai/code/session_018qeN17yb8NLTNUH4d69kQ4';
const RESEARCH = 'https://claude.ai/chat/7b7dd5b5-a6cb-4a76-8d3f-fc92b91288e4';

const NAV = [
  ['/types', 'הטיפוסים'],
  ['/map', 'מפה'],
  ['/compare', 'השוואה'],
  ['/about', 'על השיטה'],
];

function TopBar({ path }) {
  return (
    <header className="topbar">
      <a className="app-name" href="#/">אניגרם</a>
      <nav className="nav-links" aria-label="ניווט ראשי">
        {NAV.map(([to, label]) => {
          const on = path === to || path.startsWith(`${to}/`) || (to === '/types' && path.startsWith('/type/'));
          return (
            <a key={to} href={`#${to}`} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
              {label}
              {on && <motion.span layoutId="nav-ink" className="nav-ink" />}
            </a>
          );
        })}
      </nav>
      <ai-menu chat={DEV_CHAT} research={RESEARCH}></ai-menu>
    </header>
  );
}

function NotFound() {
  return (
    <section className="page">
      <h1>הדף לא נמצא</h1>
      <a href="#/">לדף הבית</a>
    </section>
  );
}

function route(path) {
  const [, a, b, c] = path.split('/');
  if (!a) return ['home', <Home />];
  if (a === 'types' && !b) return ['types', <TypesIndex />];
  if (a === 'type' && b) return ['type', <TypeDetail n={Number(b)} />];
  if (a === 'map') return ['map', <MapPage selected={b ? Number(b) : null} />];
  if (a === 'compare') return ['compare', <Compare a={Number(b) || 1} b={Number(c) || 2} />];
  if (a === 'about') return ['about', <About />];
  return ['404', <NotFound />];
}

export default function App() {
  const path = useHash();
  const [key, view] = route(path);

  // גלילה לראש העמוד במעבר בין עמודים, לא בתוך אותו עמוד.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [key]);

  return (
    <MotionConfig reducedMotion="user">
      <Ambient />
      <TopBar path={path} />
      <AnimatePresence mode="wait">
        <motion.main
          key={key}
          className={`main-${key}`}
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
          transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {view}
        </motion.main>
      </AnimatePresence>
    </MotionConfig>
  );
}

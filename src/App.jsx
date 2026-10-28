import { useEffect, useState } from 'react';
import { TYPES, CENTERS, SOURCE_URL, getType } from './data/types.js';
import { usePwaInstall } from './pwa.js';

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

function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { canInstall, install } = usePwaInstall();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <header className="topbar">
      <a className="app-name" href="#/">אניגרם</a>
      <nav className="nav-links" aria-label="ניווט ראשי">
        <a href="#/types">הטיפוסים</a>
        <a href="#/about">על השיטה</a>
      </nav>
      <div className="logo-wrap">
        <button
          className="logo-btn"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          אד' ענת שטיבלמן A&amp;I
        </button>
        {menuOpen && (
          <div className="logo-menu" role="menu">
            <button role="menuitem" onClick={copyLink}>
              {copied ? 'הקישור הועתק' : 'העתקת קישור'}
            </button>
            {canInstall && (
              <button role="menuitem" onClick={install}>התקנת האפליקציה</button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function Home() {
  return (
    <section className="page hero">
      <h1>אניגרם</h1>
      <p className="lead">
        מסע קצר אל תשעת הטיפוסים של שיטת האניאגרם. האניאגרם הוא מודל לשיקוף ולפיתוח עצמי, לא כלי אבחון.
      </p>
      <a className="cta" href="#/types">לתשעת הטיפוסים</a>
      <p className="note">
        התיאורים כאן מסכמים ידע כללי על השיטה, במילים שלנו. לשיטה של המרכז הישראלי לאניאגרם ראו{' '}
        <a href={SOURCE_URL} target="_blank" rel="noreferrer">9types.co.il</a>.
      </p>
    </section>
  );
}

function TypesIndex() {
  return (
    <section className="page">
      <h1>תשעת הטיפוסים</h1>
      <ul className="type-grid">
        {TYPES.map((t) => (
          <li key={t.n}>
            <a className="type-card" href={`#/type/${t.n}`}>
              <span className="type-num">{t.n}</span>
              <span className="type-name">{t.name}</span>
              <span className="type-en">{t.en}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TypeDetail({ n }) {
  const t = getType(n);
  if (!t) return <NotFound />;
  const prev = getType(t.n === 1 ? 9 : t.n - 1);
  const next = getType(t.n === 9 ? 1 : t.n + 1);
  return (
    <section className="page">
      <p className="crumb"><a href="#/types">תשעת הטיפוסים</a> / {t.n}</p>
      <h1>{t.name} <span className="en">({t.en})</span></h1>
      <p className="tag">טיפוס {t.n} · {CENTERS[t.center]} · ידע כללי, ממתין לאימות מול המקור</p>
      <dl className="facts">
        <dt>מה מניע</dt><dd>{t.motivation}</dd>
        <dt>מה מטריד</dt><dd>{t.worry}</dd>
        <dt>כוחות</dt><dd>{t.strengths}</dd>
        <dt>שים לב ל</dt><dd>{t.watch}</dd>
      </dl>
      <p className="note">
        האניאגרם משמש לשיקוף, לא לקביעת טיפוס. אם אתה מזהה את עצמך בתיאור, זה נתון לבדיקה ולא מסקנה.
      </p>
      <nav className="pager" aria-label="מעבר בין טיפוסים">
        <a href={`#/type/${prev.n}`}>{prev.name}</a>
        <a href={`#/type/${next.n}`}>{next.name}</a>
      </nav>
    </section>
  );
}

function About() {
  return (
    <section className="page">
      <h1>על השיטה</h1>
      <p>
        האניאגרם הוא מודל של תשעה טיפוסי אישיות, המתארים דפוסי מוטיבציה ותשומת לב. השיטה משמשת בעיקר לשיקוף ולפיתוח עצמי.
      </p>
      <p>
        חשוב לדעת: האניאגרם אינו כלי פסיכומטרי מאומת בספרות המחקר המרכזית, ושאלונים מבוססי הצהרה עצמית מוגבלים באמינותם.
        האתר של המרכז הישראלי מציג את שאלון האניאגרם שלו כ"כלי עזר בלבד".
      </p>
      <p>
        המסך הזה אינו מאבחן ואינו קובע טיפוס לאדם. לא לקשר טיפוס להפרעה נפשית או למצב רפואי.
      </p>
      <p className="note">
        מקור: <a href={SOURCE_URL} target="_blank" rel="noreferrer">9types.co.il</a>
      </p>
    </section>
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

export default function App() {
  const path = useHash();
  let view;
  if (path === '/' || path === '') view = <Home />;
  else if (path === '/types') view = <TypesIndex />;
  else if (path === '/about') view = <About />;
  else if (path.startsWith('/type/')) view = <TypeDetail n={path.split('/')[2]} />;
  else view = <NotFound />;

  return (
    <>
      <TopBar />
      <main>{view}</main>
    </>
  );
}

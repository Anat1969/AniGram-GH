// שמות הטיפוסים כפי שמופיעים באתר המרכז הישראלי לאניאגרם (9types.co.il/9types/).
// התיאורים נכתבו במילים שלנו, כסיכום ידע כללי על השיטה, ואינם העתקה מהאתר.
// כל טיפוס מסומן "ידע כללי" עד אימות מול המקור.

export const SOURCE_URL = 'https://9types.co.il/9types/';

export const CENTERS = {
  gut: 'מרכז הבטן',
  heart: 'מרכז הלב',
  head: 'מרכז הראש',
};

// מידע מבני: ידע כללי על האניאגרם, לא אומת מול המקור (ראו docs/05).
// צבע לכל מרכז נושא משמעות בכל הדיאגרמות.
export const CENTER_META = {
  gut: { name: 'מרכז הבטן', short: 'בטן', color: '#e3b96b', members: [8, 9, 1], theme: 'פעולה, גבולות ותחושת שליטה' },
  heart: { name: 'מרכז הלב', short: 'לב', color: '#ef9f95', members: [2, 3, 4], theme: 'רגש, דימוי וקשר עם אחרים' },
  head: { name: 'מרכז הראש', short: 'ראש', color: '#8fd8e6', members: [5, 6, 7], theme: 'חשיבה, ביטחון ותכנון' },
};

// קווים פנימיים: כיוון הצמיחה וכיוון הלחץ, לפי הקריאה המקובלת בספרות הכללית.
export const GROWTH = { 1: 7, 2: 4, 3: 6, 4: 1, 5: 8, 6: 9, 7: 5, 8: 2, 9: 3 };
export const STRESS = { 1: 4, 2: 8, 3: 9, 4: 2, 5: 7, 6: 3, 7: 1, 8: 5, 9: 6 };

export const wingsOf = (n) => [n === 1 ? 9 : n - 1, n === 9 ? 1 : n + 1];

// יחס מבני בין שני טיפוסים. מתאר את הדיאגרמה בלבד, לא התאמה בין אנשים.
export function relation(a, b) {
  const A = getType(a);
  const B = getType(b);
  const out = [];
  if (a === b) return [{ kind: 'same', text: 'אותו טיפוס.' }];
  out.push(
    A.center === B.center
      ? { kind: 'center', text: `שניהם ב${CENTER_META[A.center].name}.` }
      : { kind: 'center-diff', text: `מרכזים שונים: ${CENTER_META[A.center].name} ו${CENTER_META[B.center].name}.` },
  );
  if (wingsOf(a).includes(b)) out.push({ kind: 'wing', text: 'שכנים על המעגל: כל אחד מהם יכול לשמש כנף לשני.' });
  if (GROWTH[a] === b) out.push({ kind: 'growth', text: `${B.name} נמצא בכיוון הצמיחה של ${A.name}.` });
  if (STRESS[a] === b) out.push({ kind: 'stress', text: `${B.name} נמצא בכיוון הלחץ של ${A.name}.` });
  if (GROWTH[b] === a) out.push({ kind: 'growth', text: `${A.name} נמצא בכיוון הצמיחה של ${B.name}.` });
  if (STRESS[b] === a) out.push({ kind: 'stress', text: `${A.name} נמצא בכיוון הלחץ של ${B.name}.` });
  if (out.length === 1) out.push({ kind: 'none', text: 'אין ביניהם קו או שכנות ישירים בדיאגרמה.' });
  return out;
}

export const TYPES = [
  {
    n: 1,
    focus: 'מה נכון ומה דורש תיקון',
    name: 'המחוקק',
    en: 'The Legislator',
    center: 'gut',
    motivation: 'רצון לתקן, לשפר ולעשות את הדבר הנכון.',
    worry: 'חשש מטעות, מחוסר יושרה ומביקורת פנימית קשה.',
    strengths: 'סדר, דיוק, אחריות ומצפון מוסרי.',
    watch: 'נטייה לשיפוטיות כלפי עצמו ואחרים, וקושי להירגע.',
  },
  {
    n: 2,
    focus: 'מה אחרים צריכים',
    name: 'המסייע',
    en: 'The Helper',
    center: 'heart',
    motivation: 'רצון להיות נחוץ, לתמוך ולהיות אהוב.',
    worry: 'חשש מלהיות לא רצוי או לא נחוץ.',
    strengths: 'חום, רגישות לצרכים של אחרים ויכולת לקרב.',
    watch: 'קושי לזהות את הצרכים שלו עצמו, ונטייה לתת יתר על המידה.',
  },
  {
    n: 3,
    focus: 'מה יוביל להצלחה',
    name: 'הביצועיסט',
    en: 'The Performer',
    center: 'heart',
    motivation: 'רצון להצליח, להשיג יעדים ולהיראות בהצלחה.',
    worry: 'חשש מכישלון ומחוסר ערך בעיני הסביבה.',
    strengths: 'מוטיבציה, יעילות וכושר הוצאה לפועל.',
    watch: 'ניתוק מרגשות אמיתיות ותלות בתדמית.',
  },
  {
    n: 4,
    focus: 'מה חסר ומה ייחודי',
    name: 'הדרמטי',
    en: 'The Dramatic',
    center: 'heart',
    motivation: 'חיפוש זהות אותנטית ומשמעות אישית.',
    worry: 'חשש מלהיות רגיל, לא מובן או חסר משמעות.',
    strengths: 'רגישות, יצירתיות ויכולת להרגיש עומק.',
    watch: 'התמקדות במה שחסר, והשוואה לאחרים.',
  },
  {
    n: 5,
    focus: 'מה אפשר להבין ולצפות',
    name: 'המדען',
    en: 'The Scientist',
    center: 'head',
    motivation: 'רצון להבין, לצבור ידע ולשמור על מרחב פנימי.',
    worry: 'חשש מהצפה, מחוסר יכולת או מתלות באחרים.',
    strengths: 'חשיבה מעמיקה, אובייקטיביות ויכולת ריכוז.',
    watch: 'נסיגה להתבוננות במקום מעורבות, ובידוד.',
  },
  {
    n: 6,
    focus: 'מה עלול להשתבש',
    name: 'הספקן',
    en: 'The Skeptic',
    center: 'head',
    motivation: 'רצון לביטחון, לתמיכה ולהיערכות לסיכונים.',
    worry: 'חשש מחוסר ביטחון, מבגידה או מהיעדר תמיכה.',
    strengths: 'נאמנות, אחריות וזיהוי מוקדם של בעיות.',
    watch: 'חשדנות יתר, וחרדה שמייצרת תרחישים שליליים.',
  },
  {
    n: 7,
    focus: 'מה עוד אפשרי ומעניין',
    name: 'הנהנתן',
    en: 'The Hedonist',
    center: 'head',
    motivation: 'רצון לחוויות חדשות, אפשרויות והתלהבות.',
    worry: 'חשש מכאב, משעמום ומהגבלה.',
    strengths: 'אנרגיה, אופטימיות וגמישות.',
    watch: 'נטייה להימנע מכאב ומהתמקדות יתר בלהמשיך הלאה.',
  },
  {
    n: 8,
    focus: 'מי מחזיק בכוח',
    name: 'הבוס',
    en: 'The Boss',
    center: 'gut',
    motivation: 'רצון לשליטה, עוצמה והגנה על עצמו ועל האחרים.',
    worry: 'חשש משליטה של אחרים בו ומחולשה.',
    strengths: 'נחישות, ישירות ויכולת לפעול.',
    watch: 'עימות מיותר ונטייה לדחוק את הרגש.',
  },
  {
    n: 9,
    focus: 'איך לשמור על שקט והרמוניה',
    name: 'משכין שלום',
    en: 'The Peacemaker',
    center: 'gut',
    motivation: 'רצון להרמוניה, שלווה וחיבור.',
    worry: 'חשש מקונפליקט ומאובדן הקשר.',
    strengths: 'סבלנות, קבלה והכלה.',
    watch: 'נטייה להתכנס, לדחות צרכים ולהימנע מעמדה ברורה.',
  },
];

export const getType = (n) => TYPES.find((t) => t.n === Number(n));

// בדיקת קצה לקצה מול vite preview: כל כפתור, כל שכבה, כל טיפוס, נייד בלי גלילה אופקית, ושער התקן של ai-menu.
// הרצה: npm run build && npx vite preview --port 4173 & node tests/e2e.cjs
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:4173/';
const errors = [];
let failed = 0;
let passed = 0;
const ok = (cond, msg) => {
  if (cond) passed++;
  else {
    failed++;
    console.log(`נכשל: ${msg}`);
  }
};

(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost' } : undefined;
  const browser = await chromium.launch({ proxy });
  for (const vp of [{ name: 'דסקטופ', width: 1280, height: 800 }, { name: 'נייד', width: 375, height: 740 }]) {
    const ctx = await browser.newContext({ viewport: vp, ignoreHTTPSErrors: true, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${vp.name}: ${e.message}`));
    const V = vp.name;
    const wait = (sel, t = 4000) => page.locator(sel).first().waitFor({ timeout: t }).catch(() => {});
    const noHScroll = async (where) =>
      ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${V}, ${where}: אין גלילה אופקית`);
    const open = async (hash, sel) => {
      await page.goto(`${BASE}${hash}`);
      if (sel) await wait(sel);
    };

    // ---- שער התקן: כפתור הלוגו ותפריט ----
    await open('', '.hero');
    await page.waitForFunction(() => customElements.get('ai-menu'));
    ok(await page.locator('ai-menu .logo').isVisible(), `${V}: כפתור הלוגו A&I בסרגל`);
    ok(!(await page.locator('header >> text=העתקת קישור').first().isVisible().catch(() => false)), `${V}: אין כפתורי פיתוח רופפים בסרגל`);
    await page.locator('ai-menu .logo').click();
    const href = (label) => page.locator('ai-menu a.item', { hasText: label }).getAttribute('href');
    ok((await href('שיחת הפיתוח'))?.startsWith('https://claude.ai/code/session_'), `${V}: קישור שיחת הפיתוח`);
    ok((await href('פרויקט המחקר'))?.startsWith('https://claude.ai/chat/'), `${V}: קישור פרויקט המחקר`);
    ok((await page.locator('ai-menu .item', { hasText: 'התקנת האפליקציה' }).count()) === 1, `${V}: פריט התקנה בתפריט`);
    await page.locator('ai-menu button.item', { hasText: 'העתקת קישור' }).click();
    await wait('ai-menu .note >> text=הקישור הועתק', 2000);
    ok((await page.evaluate(() => navigator.clipboard.readText())) === page.url(), `${V}: הקישור שהועתק הוא המצב הנוכחי`);
    await page.waitForTimeout(1000);

    // ---- דף הבית: פתיח וסיפור בגלילה ----
    ok((await page.locator('.hero-diagram .ennea-pt').count()) === 9, `${V}: דיאגרמת הפתיח עם תשע נקודות`);
    await noHScroll('דף הבית');
    const storyState = () =>
      page.evaluate(() => {
        const svg = document.querySelector('.story svg.ennea');
        return {
          step: Number(document.querySelector('.step.active')?.dataset.step),
          bands: svg.querySelectorAll('.ennea-band').length,
          flows: svg.querySelectorAll('.flow-solid, .flow-dash').length,
        };
      });
    const steps = await page.locator('.step').count();
    ok(steps === 5, `${V}: חמישה שלבים בסיפור`);
    let last = -1;
    let monotonic = true;
    for (let i = 0; i < steps; i++) {
      await page.locator('.step').nth(i).scrollIntoViewIfNeeded();
      await page.evaluate((i) => {
        const el = document.querySelectorAll('.step')[i];
        scrollBy(0, el.getBoundingClientRect().top - innerHeight * (innerWidth < 860 ? 0.6 : 0.4));
      }, i);
      await page.waitForTimeout(900);
      const st = await storyState();
      if (st.step < last) monotonic = false;
      last = st.step;
      if (i === 2) ok(st.bands === 3, `${V}: שלב המרכזים מוסיף שלוש רצועות`);
      if (i === 4) ok(st.flows === 18, `${V}: שלב התנועה מוסיף 18 קווי זרימה`);
    }
    ok(monotonic && last === 4, `${V}: השלב הפעיל מתקדם עם הגלילה עד הסוף`);
    ok(await page.locator('.story-stage .ennea').isVisible(), `${V}: הדיאגרמה נשארת גלויה בזמן הגלילה`);
    for (const [label, hash] of [['תשעת הטיפוסים', '#/types'], ['מפה', '#/map'], ['השוואה', '#/compare/1/2'], ['על השיטה', '#/about']]) {
      await open('', '.hero');
      await page.locator('.door', { hasText: label }).first().click();
      ok(page.url().endsWith(hash), `${V}: דלת "${label}"`);
    }
    await open('', '.hero');
    await page.click('.cta >> text=לתשעת הטיפוסים');
    ok(page.url().endsWith('#/types'), `${V}: כפתור "לתשעת הטיפוסים"`);
    await open('', '.hero');
    await page.click('.cta >> text=למפה האינטראקטיבית');
    ok(page.url().endsWith('#/map'), `${V}: כפתור "למפה האינטראקטיבית"`);

    // ---- סרגל ניווט ----
    for (const [label, part] of [['הטיפוסים', '#/types'], ['מפה', '#/map'], ['השוואה', '#/compare'], ['על השיטה', '#/about']]) {
      await page.click(`.nav-links >> text=${label}`);
      await page.waitForTimeout(500);
      ok(page.url().endsWith(part), `${V}: ניווט "${label}"`);
      ok((await page.locator('.nav-links a.on').innerText()).includes(label), `${V}: "${label}" מסומן בסרגל`);
    }
    await page.click('.app-name');
    await wait('.hero');
    ok(await page.locator('.hero').isVisible(), `${V}: שם האפליקציה מקשר לדף הבית`);

    // ---- רשימת הטיפוסים וסינון ----
    await open('#/types', '.type-card');
    ok((await page.locator('.type-card').count()) === 9, `${V}: תשעה טיפוסים ברשימה`);
    for (const [label, n] of [['מרכז הבטן', 3], ['מרכז הלב', 3], ['מרכז הראש', 3], ['הכל', 9]]) {
      await page.click(`.layer-btn >> text=${label}`);
      await page.waitForTimeout(800);
      ok((await page.locator('.type-card').count()) === n, `${V}: סינון "${label}" מציג ${n}`);
    }
    await noHScroll('רשימת הטיפוסים');

    // ---- דף טיפוס ----
    for (let n = 1; n <= 9; n++) {
      await open('#/types', '.type-card');
      await page.click(`a.type-card[href="#/type/${n}"]`);
      await wait('.facet');
      ok((await page.locator('.facet').count()) === 4, `${V}: טיפוס ${n} נפתח עם ארבעה היבטים`);
      ok((await page.locator('.flow-node').count()) === 3, `${V}: מסלול תנועה בטיפוס ${n}`);
      ok(await page.locator('header.topbar').isVisible(), `${V}: סרגל עליון בטיפוס ${n}`);
      await noHScroll(`טיפוס ${n}`);
    }
    await open('#/type/4', '.flow-node');
    await page.click('.flow-node.growth');
    await page.waitForTimeout(500);
    ok(page.url().endsWith('#/type/1'), `${V}: צומת הצמיחה של 4 מוביל ל-1`);
    await page.click('.flow-node.stress');
    await page.waitForTimeout(500);
    ok(page.url().endsWith('#/type/4'), `${V}: צומת הלחץ של 1 מוביל ל-4`);
    await page.locator('.wing-card').first().click();
    await page.waitForTimeout(500);
    ok(page.url().endsWith('#/type/3'), `${V}: כרטיס כנף`);
    await page.locator('.type-diagram .ennea-pt[data-type="7"] .ennea-label').click();
    await page.waitForTimeout(500);
    ok(page.url().endsWith('#/type/7'), `${V}: לחיצה על נקודה בדיאגרמה`);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(400);
    ok(page.url().endsWith('#/type/8'), `${V}: חץ שמאלה עובר לטיפוס הבא`);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);
    ok(page.url().endsWith('#/type/7'), `${V}: חץ ימינה חוזר לטיפוס הקודם`);
    await open('#/type/9', '.pager');
    await page.click('.pager-next');
    await page.waitForTimeout(400);
    ok(page.url().endsWith('#/type/1'), `${V}: מטיפוס 9 לטיפוס הבא (1)`);
    await page.click('.pager-prev');
    await page.waitForTimeout(400);
    ok(page.url().endsWith('#/type/9'), `${V}: מעבר לטיפוס הקודם`);
    await page.click('.wing-card.compare');
    await page.waitForTimeout(400);
    ok(page.url().endsWith('#/compare/9/1'), `${V}: כפתור השוואה מדף טיפוס`);
    await open('#/type/2', '.crumb a');
    await page.click('.crumb a');
    await page.waitForTimeout(400);
    ok(page.url().endsWith('#/types'), `${V}: פירורי לחם`);

    // ---- מפה ----
    await open('#/map', '.map-stage');
    const bands = () => page.locator('.map-stage .ennea-band').count();
    ok((await bands()) === 3, `${V}: מפה עם מרכזים כברירת מחדל`);
    await page.click('.layer-btn >> text=מרכזים');
    await page.waitForTimeout(900);
    ok((await bands()) === 0, `${V}: כיבוי שכבת המרכזים`);
    ok((await page.locator('.layer-btn >> text=מרכזים').getAttribute('aria-pressed')) === 'false', `${V}: מתג המרכזים במצב כבוי`);
    await page.click('.layer-btn >> text=כנפיים');
    await page.waitForTimeout(900);
    ok((await page.locator('.map-stage path[stroke="#e3b96b"]').count()) === 9, `${V}: הדלקת שכבת הכנפיים`);
    await page.click('.layer-btn >> text=לחץ');
    await page.waitForTimeout(400);
    ok((await page.locator('.map-stage .flow-dash').count()) === 0, `${V}: כיבוי שכבת הלחץ`);
    await page.locator('.map-stage .ennea-pt[data-type="5"]').click();
    await wait('.map-panel h2 >> text=המדען');
    ok(page.url().endsWith('#/map/5'), `${V}: לחיצה על נקודה במפה`);
    ok(await page.locator('.map-panel h2', { hasText: 'המדען' }).isVisible(), `${V}: לוח המבנה מציג את הטיפוס`);
    await page.locator('.map-panel .mini-chip.growth').click();
    await page.waitForTimeout(500);
    ok(page.url().endsWith('#/map/8'), `${V}: שבב הצמיחה בלוח (5 אל 8)`);
    await page.click('.map-panel >> text=לדף הטיפוס');
    await page.waitForTimeout(500);
    ok(page.url().endsWith('#/type/8'), `${V}: מעבר מהלוח לדף הטיפוס`);
    await open('#/map/8', '.map-panel');
    await page.click('.map-panel >> text=להשוואה');
    await page.waitForTimeout(500);
    ok(page.url().endsWith('#/compare/8/2'), `${V}: מעבר מהלוח להשוואה`);
    await open('#/map/3', '.map-stage');
    await page.locator('.map-stage .ennea-pt[data-type="3"]').press('Enter');
    await page.waitForTimeout(400);
    ok(page.url().endsWith('#/map'), `${V}: Enter על נקודה פעילה מבטל את הבחירה`);
    await noHScroll('מפה');

    // ---- השוואה ----
    await open('#/compare/2/8', '.rel');
    ok((await page.locator('.rel').count()) === 3, `${V}: שלושה יחסים בין 2 ל-8`);
    ok(await page.locator('.rel-stress').isVisible(), `${V}: יחס הלחץ מוצג`);
    await page.click('[data-pick="pa-3"]');
    await page.waitForTimeout(400);
    ok(page.url().endsWith('#/compare/3/8'), `${V}: בחירת טיפוס א`);
    await page.click('[data-pick="pb-4"]');
    await page.waitForTimeout(400);
    ok(page.url().endsWith('#/compare/3/4'), `${V}: בחירת טיפוס ב`);
    ok(await page.locator('.rel-wing').isVisible(), `${V}: שכנים מסומנים ככנף`);
    ok(await page.locator('[data-pick="pa-4"]').isDisabled(), `${V}: אי אפשר לבחור אותו טיפוס פעמיים`);
    await page.click('.swap');
    await page.waitForTimeout(400);
    ok(page.url().endsWith('#/compare/4/3'), `${V}: כפתור החלפה`);
    ok((await page.locator('.side-row').count()) === 6, `${V}: טבלת השוואה עם חמישה היבטים`);
    await noHScroll('השוואה');

    // ---- על השיטה ----
    await open('#/about', '.isnot');
    ok((await page.locator('.src').count()) === 7, `${V}: מפת מקורות עם שבע שכבות`);
    ok((await page.locator('.src-verified').count()) === 1, `${V}: שכבה אחת מסומנת "אומת"`);
    ok((await page.locator('.source-node').getAttribute('href')) === 'https://9types.co.il/9types/', `${V}: קישור למקור`);
    await noHScroll('על השיטה');

    await open('#/nothing', 'text=לדף הבית');
    await page.click('text=לדף הבית');
    await wait('.hero');
    ok(await page.locator('.hero').isVisible(), `${V}: דף לא נמצא חוזר לבית`);

    if (V === 'דסקטופ') {
      const cdp = await ctx.newCDPSession(page);
      const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
      ok(installabilityErrors.length === 0, `אין שגיאות התקנה ${JSON.stringify(installabilityErrors)}`);
    }
    await ctx.close();
  }

  // תנועה מופחתת: הסיפור קריא גם בלי אנימציות.
  const rm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 }, ignoreHTTPSErrors: true });
  const rp = await rm.newPage();
  rp.on('pageerror', (e) => errors.push(`reduced: ${e.message}`));
  await rp.goto(BASE);
  await rp.locator('.step').first().waitFor();
  ok((await rp.locator('.step').last().evaluate((el) => getComputedStyle(el).opacity)) === '1', 'תנועה מופחתת: כל השלבים גלויים');
  await rm.close();

  await browser.close();
  ok(errors.length === 0, `אין שגיאות JavaScript ${errors.join(' | ')}`);
  console.log(failed ? `\n${failed} בדיקות נכשלו, ${passed} עברו` : `\nכל ${passed} הבדיקות עברו`);
  process.exit(failed ? 1 : 0);
})();

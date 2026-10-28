// בדיקת קצה לקצה מול vite preview: כל כפתור, כל טיפוס, נייד בלי גלילה אופקית, ושער התקן של ai-menu.
// הרצה: npm run build && npx vite preview --port 4173 & node tests/e2e.cjs
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:4173/';
const errors = [];
let failed = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? 'עבר' : 'נכשל'}: ${msg}`);
  if (!cond) failed++;
};

(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost' } : undefined;
  const browser = await chromium.launch({ proxy });
  for (const vp of [{ name: 'דסקטופ', width: 1280, height: 800 }, { name: 'נייד', width: 375, height: 740 }]) {
    const ctx = await browser.newContext({ viewport: vp, ignoreHTTPSErrors: true, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${vp.name}: ${e.message}`));
    const noHScroll = async (where) =>
      ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${vp.name}, ${where}: אין גלילה אופקית`);

    await page.goto(BASE);
    await page.waitForFunction(() => customElements.get('ai-menu'));
    ok(await page.locator('ai-menu .logo').isVisible(), `${vp.name}: כפתור הלוגו A&I בסרגל`);
    ok(!(await page.locator('header >> text=העתקת קישור').first().isVisible().catch(() => false)), `${vp.name}: אין כפתורי פיתוח רופפים בסרגל`);
    await noHScroll('דף הבית');

    // תפריט הלוגו: העתקת קישור ושיחת הפיתוח
    await page.locator('ai-menu .logo').click();
    ok(await page.locator('ai-menu .panel').isVisible(), `${vp.name}: התפריט נפתח`);
    const chat = await page.locator('ai-menu a.item', { hasText: 'שיחת הפיתוח' }).getAttribute('href');
    ok(chat && chat.startsWith('https://claude.ai/code/session_'), `${vp.name}: קישור שיחת הפיתוח`);
    ok(await page.locator('ai-menu .item', { hasText: 'התקנת האפליקציה' }).count() === 1, `${vp.name}: פריט התקנה בתפריט`);
    await page.locator('ai-menu button.item', { hasText: 'העתקת קישור' }).click();
    await page.locator('ai-menu .note', { hasText: 'הקישור הועתק' }).waitFor({ timeout: 2000 }).catch(() => {});
    ok(await page.locator('ai-menu .note', { hasText: 'הקישור הועתק' }).isVisible(), `${vp.name}: הודעת העתקה`);
    ok((await page.evaluate(() => navigator.clipboard.readText())) === page.url(), `${vp.name}: הקישור שהועתק הוא המצב הנוכחי`);
    await page.waitForTimeout(1000);
    ok(!(await page.locator('ai-menu .panel').isVisible()), `${vp.name}: התפריט נסגר`);

    // מסלול מרכזי
    await page.click('.cta');
    ok(page.url().endsWith('#/types'), `${vp.name}: כפתור "לתשעת הטיפוסים"`);
    await page.locator('.type-card').first().waitFor();
    ok(await page.locator('.type-card').count() === 9, `${vp.name}: תשעה טיפוסים ברשימה`);
    await noHScroll('רשימת הטיפוסים');
    for (let n = 1; n <= 9; n++) {
      await page.goto(`${BASE}#/types`);
      await page.click(`a[href="#/type/${n}"]`);
      await page.locator('.facts dt').first().waitFor({ timeout: 3000 }).catch(() => {});
      ok(await page.locator('.facts dt').count() === 4, `${vp.name}: טיפוס ${n} נפתח בכתובת משלו`);
      ok(await page.locator('header.topbar').isVisible(), `${vp.name}: סרגל עליון בטיפוס ${n}`);
      await noHScroll(`טיפוס ${n}`);
    }
    await page.goto(`${BASE}#/type/9`);
    await page.locator('.pager a').last().click();
    ok(page.url().endsWith('#/type/1'), `${vp.name}: מעבר מטיפוס 9 לטיפוס הבא (1)`);
    await page.locator('.pager a').first().click();
    ok(page.url().endsWith('#/type/9'), `${vp.name}: מעבר לטיפוס הקודם`);
    await page.click('.crumb a');
    ok(page.url().endsWith('#/types'), `${vp.name}: פירורי לחם`);

    await page.click('.nav-links >> text=על השיטה');
    await page.locator('h1', { hasText: 'על השיטה' }).waitFor({ timeout: 3000 }).catch(() => {});
    ok(await page.locator('h1', { hasText: 'על השיטה' }).isVisible(), `${vp.name}: עמוד "על השיטה"`);
    await noHScroll('על השיטה');
    await page.click('.app-name');
    await page.locator('.hero').waitFor({ timeout: 3000 }).catch(() => {});
    ok(await page.locator('.hero').isVisible(), `${vp.name}: שם האפליקציה מקשר לדף הבית`);
    await page.goto(`${BASE}#/nothing`);
    await page.click('text=לדף הבית');
    await page.locator('.hero').waitFor({ timeout: 3000 }).catch(() => {});
    ok(await page.locator('.hero').isVisible(), `${vp.name}: דף לא נמצא חוזר לבית`);

    if (vp.name === 'דסקטופ') {
      const cdp = await ctx.newCDPSession(page);
      const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
      ok(installabilityErrors.length === 0, `אין שגיאות התקנה ${JSON.stringify(installabilityErrors)}`);
    }
    await page.goto(`${BASE}#/type/4`);
    await page.locator('ai-menu .logo').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `tests/shot-${vp.width}.png`, fullPage: true });
    await ctx.close();
  }
  await browser.close();
  ok(errors.length === 0, `אין שגיאות JavaScript ${errors.join(' | ')}`);
  console.log(failed ? `\n${failed} בדיקות נכשלו` : '\nכל הבדיקות עברו');
  process.exit(failed ? 1 : 0);
})();

// גאומטריית האניאגרם: טיפוס 9 למעלה, והמספרים עולים עם כיוון השעון כל 40 מעלות.
export const R = 170;

export const angleOf = (n) => ((n % 9) * 40 * Math.PI) / 180;

export const pointOf = (n, r = R) => ({
  x: +(r * Math.sin(angleOf(n))).toFixed(2),
  y: +(-r * Math.cos(angleOf(n))).toFixed(2),
});

export const TRIANGLE = [3, 6, 9];
export const HEXAD = [1, 4, 2, 8, 5, 7];

export const polyPath = (ns) => ns.map((n, i) => `${i ? 'L' : 'M'}${pointOf(n).x} ${pointOf(n).y}`).join(' ') + ' Z';

// קטע ישר בין שתי נקודות, מקוצר בקצוות כדי שהחץ ייעצר לפני העיגול.
// offset מזיז את הקו הצידה, כך שקו צמיחה וקו לחץ על אותו קטע לא נבלעים זה בזה.
export function segment(a, b, trim = 22, offset = 0) {
  const p = pointOf(a);
  const q = pointOf(b);
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  // הזזה ניצבת לפי הסדר הקבוע של הזוג, כך ששני כיוונים על אותו קטע נפרדים לשני צדדים.
  const sign = a < b ? 1 : -1;
  const ox = -uy * offset * sign;
  const oy = ux * offset * sign;
  const x1 = p.x + ux * trim + ox;
  const y1 = p.y + uy * trim + oy;
  const x2 = q.x - ux * trim + ox;
  const y2 = q.y - uy * trim + oy;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

// קשת על המעגל בין שני שכנים, בכיוון השעון מ-a ל-b.
export function arc(a, b, r = R) {
  const p = pointOf(a, r);
  const q = pointOf(b, r);
  return `M${p.x} ${p.y} A${r} ${r} 0 0 1 ${q.x} ${q.y}`;
}

// רצועת מרכז: קשת עבה סביב שלוש הנקודות של המרכז.
export function band(members, r1 = R + 16, r2 = R + 30) {
  const mid = members[1] % 9;
  const a0 = ((mid * 40 - 58) * Math.PI) / 180;
  const a1 = ((mid * 40 + 58) * Math.PI) / 180;
  const pt = (r, a) => `${(r * Math.sin(a)).toFixed(2)} ${(-r * Math.cos(a)).toFixed(2)}`;
  return `M${pt(r2, a0)} A${r2} ${r2} 0 0 1 ${pt(r2, a1)} L${pt(r1, a1)} A${r1} ${r1} 0 0 0 ${pt(r1, a0)} Z`;
}

// Pure filtering / picking logic for the dish list.

// Snack-type kinds; a dish with any other kind counts as a main dish.
const SNACK_KINDS = new Set(["vat", "ngot", "uong"]);
export const courseOf = dish => (dish.kind.every(k => SNACK_KINDS.has(k)) ? "vat" : "chinh");

export const GROUPS = [
  {
    key: "meals", label: "Bữa", options: [
      ["s", "Sáng"], ["t", "Trưa"], ["o", "Tối"], ["k", "Khuya"],
    ],
  },
  {
    key: "course", label: "Loại", options: [
      ["chinh", "Món chính"], ["vat", "Món vặt, ngọt, đồ uống"],
    ],
  },
  {
    key: "kind", label: "Dạng món", options: [
      ["nuoc", "Món nước"], ["com", "Cơm"], ["mi", "Bún/mì khô"], ["banh", "Bánh"],
      ["nuong", "Nướng"], ["lau", "Lẩu"], ["kho", "Món mặn ăn cơm"], ["goi", "Gỏi/cuốn"],
      ["vat", "Ăn vặt"], ["ngot", "Ngọt/chè"], ["uong", "Đồ uống"],
    ],
  },
  {
    key: "protein", label: "Nguyên liệu", options: [
      ["bo", "Bò"], ["heo", "Heo"], ["ga", "Gà"], ["vit", "Vịt"], ["ca", "Cá"],
      ["hs", "Hải sản"], ["tr", "Trứng"], ["nt", "Nội tạng"], ["chay", "Chay"],
    ],
  },
  {
    key: "origin", label: "Vùng/nguồn gốc", options: [
      ["vn-bac", "Miền Bắc"], ["vn-trung", "Miền Trung"], ["vn-nam", "Miền Nam"],
    ],
  },
];

const KIND_LABEL = Object.fromEntries(GROUPS.find(g => g.key === "kind").options);
export const kindLabel = dish => KIND_LABEL[dish.kind[0]] ?? "";

export const FOREIGN_ORIGINS = [
  ["jp", "Nhật"], ["kr", "Hàn"], ["th", "Thái"], ["cn", "Trung Hoa"], ["it", "Ý"],
  ["fr", "Pháp"], ["us", "Âu Mỹ"], ["in", "Ấn Độ"], ["mx", "Mexico"], ["me", "Trung Đông"],
  ["eu", "Châu Âu khác"], ["sea", "Đông Nam Á khác"],
];

export const EMPTY_FILTERS = {
  meals: { inc: [], exc: [] }, course: { inc: [], exc: [] }, kind: { inc: [], exc: [] },
  protein: { inc: [], exc: [] }, origin: { inc: [], exc: [] },
};

const isForeign = o => !o.startsWith("vn");

function values(dish, key) {
  if (key === "origin") return [dish.origin];
  if (key === "course") return [courseOf(dish)];
  return dish[key];
}

// "vn" (nationwide) dishes match any Vietnamese region that is included, but are
// never removed by excluding a single region.
function matchesOrigin(dish, { inc, exc }) {
  if (exc.includes(dish.origin)) return false;
  if (inc.length === 0) return true;
  if (inc.includes(dish.origin)) return true;
  return dish.origin === "vn" && inc.some(o => o.startsWith("vn"));
}

function matchesGroup(dish, key, sel) {
  if (key === "origin") return matchesOrigin(dish, sel);
  const v = values(dish, key);
  if (sel.exc.some(x => v.includes(x))) return false;
  if (sel.inc.length && !sel.inc.some(x => v.includes(x))) return false;
  return true;
}

export function filterDishes(dishes, { filters, showForeign, blocked }) {
  const blockedSet = new Set(blocked);
  return dishes.filter(d => {
    if (blockedSet.has(d.name)) return false;
    // Foreign dishes appear only if the master switch is on, or the user explicitly included that origin.
    if (isForeign(d.origin) && !showForeign && !filters.origin.inc.includes(d.origin)) return false;
    return Object.keys(filters).every(key => matchesGroup(d, key, filters[key]));
  });
}

export function activeCount(filters) {
  return Object.values(filters).reduce((n, g) => n + g.inc.length + g.exc.length, 0);
}

// Cycle a chip: neutral -> include -> exclude -> neutral
export function cycle(sel, value) {
  if (sel.inc.includes(value)) return { inc: sel.inc.filter(x => x !== value), exc: [...sel.exc, value] };
  if (sel.exc.includes(value)) return { inc: sel.inc, exc: sel.exc.filter(x => x !== value) };
  return { inc: [...sel.inc, value], exc: sel.exc };
}

// Weighted random pick of up to n distinct dishes; rare dishes are less likely.
export function pick(pool, n, rng = Math.random) {
  const items = pool.map(d => ({ d, w: d.rare ? 0.3 : 1 }));
  const out = [];
  while (out.length < n && items.length) {
    const total = items.reduce((s, x) => s + x.w, 0);
    let r = rng() * total;
    let i = 0;
    while (i < items.length - 1 && r >= items[i].w) { r -= items[i].w; i++; }
    out.push(items.splice(i, 1)[0].d);
  }
  return out;
}

"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import dishes from "./data/dishes.json";
import {
  GROUPS, FOREIGN_ORIGINS, EMPTY_FILTERS,
  filterDishes, activeCount, cycle, pick, kindLabel,
} from "./lib/filters";
import styles from "./page.module.css";

const SPIN_MS = 1500;
const RECENT_KEEP = 5;
const MEALS = GROUPS.find(g => g.key === "meals");
const COURSE = GROUPS.find(g => g.key === "course");
const SHEET_GROUPS = GROUPS.filter(g => g.key !== "meals" && g.key !== "course");
const ORIGIN_LABEL = Object.fromEntries([
  ["vn-bac", "Miền Bắc"], ["vn-trung", "Miền Trung"], ["vn-nam", "Miền Nam"], ["vn", "Việt Nam"],
  ...FOREIGN_ORIGINS,
]);

// State saved in localStorage (loaded after mount to avoid hydration mismatch)
function usePersistedState(key, initial) {
  const [value, setValue] = useState(initial);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("random-meal:" + key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- load after mount to avoid hydration mismatch
      if (raw !== null) setValue(JSON.parse(raw));
    } catch {}
    loaded.current = true;
  }, [key]);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem("random-meal:" + key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

function Chip({ label, state, onClick }) {
  const cls = state === "inc" ? styles.inc : state === "exc" ? styles.exc : "";
  const status = state === "inc" ? ", đang chọn" : state === "exc" ? ", đang loại" : "";
  return (
    <button type="button" className={`${styles.chip} ${cls}`} onClick={onClick} aria-label={label + status}>
      {state === "inc" ? "✓ " : state === "exc" ? "✕ " : ""}{label}
    </button>
  );
}

function meta(d) {
  return [kindLabel(d), ORIGIN_LABEL[d.origin], d.rare ? "ít gặp" : null].filter(Boolean).join(" · ");
}

function FilterSheet({ onClose, children, title }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });
  useEffect(() => {
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const onKey = e => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, []);
  return (
    <div className={styles.scrim} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [storedFilters, setFilters] = usePersistedState("filters", EMPTY_FILTERS);
  // merge so filters saved before a group existed still work
  const filters = useMemo(() => ({ ...EMPTY_FILTERS, ...storedFilters }), [storedFilters]);
  const [showForeign, setShowForeign] = usePersistedState("showForeign", false);
  const [blocked, setBlocked] = usePersistedState("blocked", []);
  const [recent, setRecent] = usePersistedState("recent", []);
  const [avoidRecent, setAvoidRecent] = usePersistedState("avoidRecent", true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [spinning, setSpinning] = useState(false);
  const [display, setDisplay] = useState(null);
  const [current, setCurrent] = useState(null);
  const [alts, setAlts] = useState([]);
  const timers = useRef({ iv: null, to: null });

  const pool = useMemo(
    () => filterDishes(dishes, { filters, showForeign, blocked }),
    [filters, showForeign, blocked],
  );
  const activeFilters = activeCount(filters) + (showForeign ? 1 : 0);
  const noneLeft = pool.length === 0;

  useEffect(() => () => { clearInterval(timers.current.iv); clearTimeout(timers.current.to); }, []);

  function spin() {
    if (spinning || noneLeft) return;
    let candidates = pool;
    if (avoidRecent) {
      const fresh = pool.filter(d => !recent.includes(d.name));
      if (fresh.length >= 3) candidates = fresh;
    }
    const picks = pick(candidates, 3);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setCurrent(null);
    setAlts([]);
    setSpinning(true);
    if (!reduce) {
      timers.current.iv = setInterval(() => {
        setDisplay(pool[Math.floor(Math.random() * pool.length)].name);
      }, 70);
    }
    timers.current.to = setTimeout(() => {
      clearInterval(timers.current.iv);
      setCurrent(picks[0]);
      setAlts(picks.slice(1));
      setRecent(prev => [picks[0].name, ...prev.filter(n => n !== picks[0].name)].slice(0, RECENT_KEEP));
      setSpinning(false);
    }, reduce ? 0 : SPIN_MS);
  }

  function promote(d) {
    setAlts(prev => [current, ...prev.filter(x => x.name !== d.name)].filter(Boolean));
    setCurrent(d);
  }

  function blockDish(d) {
    setBlocked(prev => (prev.includes(d.name) ? prev : [...prev, d.name]));
    if (current?.name === d.name) {
      setCurrent(alts[0] ?? null);
      setAlts(alts.slice(1));
    } else {
      setAlts(prev => prev.filter(x => x.name !== d.name));
    }
  }

  const stateOf = (key, v) => (filters[key].inc.includes(v) ? "inc" : filters[key].exc.includes(v) ? "exc" : "off");
  const toggle = (key, v) => setFilters(f => {
    const base = { ...EMPTY_FILTERS, ...f };
    return { ...base, [key]: cycle(base[key], v) };
  });
  const clearFilters = () => { setFilters(EMPTY_FILTERS); setShowForeign(false); };
  const closeSheet = () => setSheetOpen(false);

  const matches = query.trim()
    ? dishes.filter(d => d.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>RANDOM<span>.</span>MEAL</h1>
      </header>

      <section className={styles.pickers} aria-label="Chọn nhanh">
        <div>
          <div className={styles.label}>Bữa</div>
          <div className={styles.chips}>
            {MEALS.options.map(([v, label]) => (
              <Chip key={v} label={label} state={stateOf("meals", v)} onClick={() => toggle("meals", v)} />
            ))}
          </div>
        </div>
        <div>
          <div className={styles.label}>Loại món</div>
          <div className={styles.chips}>
            {COURSE.options.map(([v, label]) => (
              <Chip key={v} label={label} state={stateOf("course", v)} onClick={() => toggle("course", v)} />
            ))}
          </div>
        </div>
        <p className={styles.hint}>Bấm 1 lần để chọn, bấm 2 lần để loại, bấm lần nữa để bỏ chọn. Không chọn gì là lấy tất cả.</p>
      </section>

      <section className={styles.stage} aria-live="polite">
        <div className={styles.stageLabel}>Hôm nay ăn</div>
        {spinning ? (
          <div className={`${styles.big} ${styles.spinning}`}>{display ?? "..."}</div>
        ) : current ? (
          <>
            <div className={styles.big}>{current.name}</div>
            <div className={styles.meta}>{meta(current)}</div>
            <div className={styles.stageActions}>
              <button type="button" className={styles.quiet} onClick={() => blockDish(current)}>
                Không bao giờ ăn món này
              </button>
            </div>
          </>
        ) : (
          <div className={`${styles.big} ${styles.placeholder}`}>Bấm “Quay món” bên dưới</div>
        )}
      </section>

      <section className={styles.controls}>
        <button type="button" className={styles.primary} onClick={spin} disabled={spinning || noneLeft}>
          {spinning ? "Đang quay..." : noneLeft ? "Không còn món nào" : current ? "Quay lại" : "Quay món"}
        </button>
        <div className={styles.controlRow}>
          <span className={styles.count}>Đang chọn từ <b>{pool.length}</b> món</span>
          <button type="button" className={styles.secondary} onClick={() => setSheetOpen(true)}>
            Bộ lọc{activeFilters ? ` (${activeFilters})` : ""}
          </button>
        </div>
        {noneLeft && (
          <div className={styles.warn}>
            Không món nào khớp bộ lọc.{" "}
            <button type="button" className={styles.linkBtn} onClick={clearFilters}>Xóa bộ lọc</button>
            {blocked.length > 0 && (
              <> hoặc <button type="button" className={styles.linkBtn} onClick={() => setBlocked([])}>khôi phục {blocked.length} món đã loại</button></>
            )}
          </div>
        )}
      </section>

      {alts.length > 0 && !spinning && (
        <section aria-label="Gợi ý khác">
          <div className={styles.label}>Hoặc thử</div>
          <div className={styles.alts}>
            {alts.map(d => (
              <div key={d.name} className={styles.alt}>
                <button type="button" className={styles.altMain} onClick={() => promote(d)} aria-label={`Chọn ${d.name}`}>
                  <span className={styles.altName}>{d.name}</span>
                  <span className={styles.altMeta}>{meta(d)}</span>
                </button>
                <button type="button" className={styles.altX} onClick={() => blockDish(d)} aria-label={`Không bao giờ ăn ${d.name}`} title="Không bao giờ ăn món này">✕</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {sheetOpen && (
        <FilterSheet onClose={closeSheet} title="Bộ lọc">
          <div className={styles.sheetHead}>
            <h2>Bộ lọc</h2>
            <button type="button" className={styles.quiet} onClick={closeSheet}>Đóng</button>
          </div>
          <div className={styles.sheetBody}>
            <div className={styles.legend}>
              <span className={styles.l1}><b>✓</b> bấm 1 lần: chỉ lấy</span>
              <span className={styles.l2}><b>✕</b> bấm 2 lần: loại bỏ</span>
              <span>bấm 3 lần: bỏ chọn</span>
            </div>

            {SHEET_GROUPS.map(g => (
              <div key={g.key}>
                <div className={styles.label}>{g.label}</div>
                <div className={styles.chips}>
                  {g.options.map(([v, label]) => (
                    <Chip key={v} label={label} state={stateOf(g.key, v)} onClick={() => toggle(g.key, v)} />
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className={styles.toggle}>
                <input type="checkbox" checked={showForeign} onChange={e => setShowForeign(e.target.checked)} />
                Cả món nước ngoài
              </label>
              {showForeign && (
                <div className={styles.chips} style={{ marginTop: "var(--sp-2)" }}>
                  {FOREIGN_ORIGINS.map(([v, label]) => (
                    <Chip key={v} label={label} state={stateOf("origin", v)} onClick={() => toggle("origin", v)} />
                  ))}
                </div>
              )}
              <label className={styles.toggle}>
                <input type="checkbox" checked={avoidRecent} onChange={e => setAvoidRecent(e.target.checked)} />
                Tránh {RECENT_KEEP} món vừa quay
              </label>
            </div>

            <div>
              <div className={styles.label}>Loại một món theo tên</div>
              <input
                className={styles.search} type="search" value={query} placeholder="Gõ tên món, ví dụ: chè"
                onChange={e => setQuery(e.target.value)} aria-label="Tìm món để loại"
              />
              {matches.length > 0 && (
                <div className={styles.chips} style={{ marginTop: "var(--sp-2)" }}>
                  {matches.map(d => (
                    <Chip
                      key={d.name} label={d.name} state={blocked.includes(d.name) ? "exc" : "off"}
                      onClick={() => setBlocked(b => (b.includes(d.name) ? b.filter(n => n !== d.name) : [...b, d.name]))}
                    />
                  ))}
                </div>
              )}
              {blocked.length > 0 && (
                <p className={styles.hint} style={{ marginTop: "var(--sp-2)" }}>
                  Đã loại {blocked.length} món.{" "}
                  <button type="button" className={styles.linkBtn} onClick={() => setBlocked([])}>Khôi phục tất cả</button>
                </p>
              )}
            </div>
          </div>
          <div className={styles.sheetFoot}>
            {activeFilters > 0 && (
              <button type="button" className={styles.secondary} onClick={clearFilters}>Xóa bộ lọc</button>
            )}
            <button type="button" className={styles.primary} onClick={closeSheet}>
              Xong · còn {pool.length} món
            </button>
          </div>
        </FilterSheet>
      )}
    </main>
  );
}

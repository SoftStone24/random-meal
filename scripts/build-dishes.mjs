// node scripts/build-dishes.mjs  ->  app/data/dishes.json
// Reads scripts/dishes-source.txt, validates tags, drops duplicate names (first wins).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const KINDS = new Set("nuoc com mi banh nuong lau goi vat ngot kho uong".split(" "));
const PROTEINS = new Set("bo heo ga vit ca hs tr chay nt".split(" "));
const ORIGINS = new Set("vn-bac vn-trung vn-nam vn jp kr th cn it fr us in mx me eu sea".split(" "));

const src = readFileSync(new URL("./dishes-source.txt", import.meta.url), "utf8");
const seen = new Set();
const dishes = [];
const problems = [];
let origin = null;

src.split(/\r?\n/).forEach((raw, i) => {
  const line = raw.trim();
  if (!line || line.startsWith("#")) return;
  if (line.startsWith("@origin ")) {
    origin = line.slice(8).trim();
    if (!ORIGINS.has(origin)) problems.push(`line ${i + 1}: unknown origin ${origin}`);
    return;
  }
  const [name, kind, protein, meals, flag] = line.split("|").map(s => s.trim());
  const kinds = (kind || "").split(",");
  const proteins = protein === "-" ? [] : (protein || "").split(",");
  const m = [...(meals || "")].filter(c => "stok".includes(c));
  if (!name || !kinds.every(k => KINDS.has(k)) || !proteins.every(p => PROTEINS.has(p)) || !m.length) {
    problems.push(`line ${i + 1}: bad entry "${line}"`);
    return;
  }
  const key = name.toLowerCase();
  if (seen.has(key)) return;
  seen.add(key);
  dishes.push({ name, origin, kind: kinds, protein: proteins, meals: m, rare: flag === "*" });
});

if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
mkdirSync(new URL("../app/data/", import.meta.url), { recursive: true });
writeFileSync(new URL("../app/data/dishes.json", import.meta.url), JSON.stringify(dishes));
console.log(`${dishes.length} dishes`);

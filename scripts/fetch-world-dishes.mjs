// One-off build script: fetch well-known dishes from Wikidata -> scripts/world-raw.json
// Run: node scripts/fetch-world-dishes.mjs   (needs network; output is reviewed by hand)
import { writeFileSync } from "node:fs";

const MIN_SITELINKS = 12;
const query = `
SELECT ?item ?en ?vi ?sl ?cLabel WHERE {
  ?item wdt:P31/wdt:P279* wd:Q746549 ;
        wikibase:sitelinks ?sl ;
        rdfs:label ?en . FILTER(LANG(?en)="en" && ?sl >= ${MIN_SITELINKS})
  OPTIONAL { ?item rdfs:label ?vi . FILTER(LANG(?vi)="vi") }
  OPTIONAL { ?item wdt:P495 ?c . ?c rdfs:label ?cLabel . FILTER(LANG(?cLabel)="en") }
}`;

const res = await fetch("https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(query), {
  headers: { "User-Agent": "RandomMealBuild/1.0", Accept: "application/sparql-results+json" },
});
if (!res.ok) throw new Error("Wikidata " + res.status);
const rows = (await res.json()).results.bindings;

const byId = new Map();
for (const r of rows) {
  const id = r.item.value.split("/").pop();
  const cur = byId.get(id) ?? { id, en: r.en.value, vi: r.vi?.value ?? null, sitelinks: +r.sl.value, countries: [] };
  if (r.cLabel && !cur.countries.includes(r.cLabel.value)) cur.countries.push(r.cLabel.value);
  byId.set(id, cur);
}
const out = [...byId.values()].sort((a, b) => b.sitelinks - a.sitelinks);
writeFileSync(new URL("./world-raw.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(out.length, "dishes");

// Validates src/data/questions.json (or a path given as argument) before you
// swap in a new bank:  npm run validate:bank  [-- path/to/bank.json]
import { readFileSync } from "node:fs";

const path = process.argv[2] ?? new URL("../src/data/questions.json", import.meta.url);
const bank = JSON.parse(readFileSync(path, "utf8"));
const errors = [];
const warn = [];
const TYPES = new Set(["single_choice", "multiple_choice", "true_false", "fill_blank", "output"]);

if (!Array.isArray(bank.questions)) errors.push("`questions` massivi yoʻq");
if (!Array.isArray(bank.practical_problems)) errors.push("`practical_problems` massivi yoʻq");

const ids = new Set();
for (const q of bank.questions ?? []) {
  const at = `savol #${q.id}`;
  if (ids.has(q.id)) errors.push(`${at}: id takrorlangan`);
  ids.add(q.id);
  if (!TYPES.has(q.type)) errors.push(`${at}: notoʻgʻri type "${q.type}"`);
  if (!q.topic) errors.push(`${at}: topic yoʻq`);
  if (!q.question) errors.push(`${at}: question matni yoʻq`);
  if (q.type === "single_choice" || q.type === "multiple_choice") {
    const keys = (q.options ?? []).map((o) => (/^([A-Z])\)/.exec(o) ?? [])[1]);
    if (keys.length < 2) errors.push(`${at}: kamida 2 ta variant kerak`);
    if (keys.some((k) => !k)) errors.push(`${at}: variantlar "A) ..." koʻrinishida boʻlishi kerak`);
    const texts = (q.options ?? []).map((o) => o.replace(/^[A-Z]\)\s?/, "").trim());
    if (new Set(texts).size !== texts.length) errors.push(`${at}: bir xil variantlar bor`);
    const correct = Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer];
    if (q.type === "single_choice" && Array.isArray(q.correct_answer)) errors.push(`${at}: single_choice uchun bitta harf kerak`);
    if (q.type === "multiple_choice" && correct.length < 2) warn.push(`${at}: multiple_choice da bitta toʻgʻri javob`);
    for (const c of correct) if (!keys.includes(c)) errors.push(`${at}: toʻgʻri javob "${c}" variantlarda yoʻq`);
  }
  if (q.type === "true_false" && !["True", "False"].includes(q.correct_answer)) errors.push(`${at}: true_false javobi "True" yoki "False" boʻlsin`);
  if ((q.type === "fill_blank" || q.type === "output") && typeof q.correct_answer !== "string") errors.push(`${at}: javob satr boʻlishi kerak`);
  if (q.type === "fill_blank" && !/_{3,}/.test(q.code ?? q.question)) warn.push(`${at}: kodda ____ boʻsh joy topilmadi`);
}

const pids = new Set();
for (const p of bank.practical_problems ?? []) {
  const at = `masala #${p.id}`;
  if (pids.has(p.id)) errors.push(`${at}: id takrorlangan`);
  pids.add(p.id);
  for (const f of ["title", "description", "input_example", "output_example"]) if (typeof p[f] !== "string") errors.push(`${at}: ${f} yoʻq`);
}

const byTopic = {};
for (const q of bank.questions ?? []) byTopic[q.topic] = (byTopic[q.topic] ?? 0) + 1;
console.log(`Savollar: ${bank.questions?.length ?? 0}, masalalar: ${bank.practical_problems?.length ?? 0}, mavzular: ${Object.keys(byTopic).length}`);
warn.forEach((w) => console.warn("  ⚠", w));
if (errors.length) {
  errors.forEach((e) => console.error("  ✗", e));
  console.error(`\n${errors.length} ta xato topildi.`);
  process.exit(1);
}
console.log("✓ Bank toʻgʻri tuzilgan.");
